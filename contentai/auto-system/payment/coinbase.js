/**
 * ContentAI 自动化系统 - Coinbase Commerce 支付模块
 * 集成 Coinbase Commerce API 处理加密货币支付
 */

import { CONFIG } from '../shared/config.js';
import { log } from '../shared/utils.js';

/**
 * 创建 Coinbase Commerce 结算
 */
export async function createCharge(orderData, apiKey = CONFIG.COINBASE_API_KEY) {
  const { orderId, email, price, currency = 'USD', description } = orderData;
  
  if (!apiKey) {
    throw new Error('Coinbase API key not configured');
  }
  
  try {
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify({
        name: `ContentAI - ${description || 'Content Generation'}`,
        description: `AI-generated content order #${orderId}`,
        pricing_type: 'fixed_price',
        local_price: {
          amount: price.toString(),
          currency
        },
        metadata: {
          order_id: orderId,
          customer_email: email
        },
        redirect_url: `${CONFIG.APP_URL}/order/success?order=${orderId}`,
        cancel_url: `${CONFIG.APP_URL}/order/cancel?order=${orderId}`
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Coinbase API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    const charge = data.data;
    
    log('info', 'Coinbase charge created', {
      orderId,
      chargeId: charge.id,
      price: `${price} ${currency}`
    });
    
    return {
      success: true,
      chargeId: charge.id,
      code: charge.code,
      hostedUrl: charge.hosted_url,
      addresses: charge.addresses,
      pricing: charge.pricing,
      raw: charge
    };
    
  } catch (error) {
    log('error', 'Failed to create Coinbase charge', {
      orderId,
      error: error.message
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取结算详情
 */
export async function getCharge(chargeId, apiKey = CONFIG.COINBASE_API_KEY) {
  if (!apiKey) {
    throw new Error('Coinbase API key not configured');
  }
  
  try {
    const response = await fetch(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': '2018-03-22'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      charge: data.data
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 验证 Webhook 签名
 */
export async function verifyWebhookSignature(payload, signature, secret = CONFIG.COINBASE_WEBHOOK_SECRET) {
  if (!secret) {
    throw new Error('Coinbase webhook secret not configured');
  }
  
  try {
    const encoder = new TextEncoder();
    
    // 解码签名
    const sigParts = signature.split(',');
    const sigMap = {};
    
    for (const part of sigParts) {
      const [key, value] = part.split('=');
      sigMap[key.trim()] = value.trim();
    }
    
    const sig = sigMap['sig'];
    if (!sig) {
      return false;
    }
    
    // 使用 HMAC SHA256 验证
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const computedSig = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );
    
    const computedSigHex = Array.from(new Uint8Array(computedSig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return computedSigHex === sig;
    
  } catch (error) {
    log('error', 'Webhook signature verification failed', { error: error.message });
    return false;
  }
}

/**
 * 处理 Webhook 事件
 */
export async function handleWebhook(event, db) {
  const { event: eventType, data } = event;
  
  log('info', 'Processing Coinbase webhook', {
    event: eventType,
    chargeId: data?.id
  });
  
  const charge = data;
  const metadata = charge.metadata || {};
  const orderId = metadata.order_id;
  
  if (!orderId) {
    log('error', 'No order_id in webhook metadata');
    return { success: false, error: 'No order_id' };
  }
  
  // 获取订单
  const order = await db.getOrder(orderId);
  
  if (!order) {
    log('error', 'Order not found', { orderId });
    return { success: false, error: 'Order not found' };
  }
  
  // 记录支付
  const paymentId = `PAY-${Date.now()}`;
  await db.createPayment({
    id: paymentId,
    order_id: orderId,
    provider: 'coinbase',
    external_id: charge.id,
    amount: order.price,
    currency: order.currency,
    crypto_currency: charge.pricing?.settlement?.currency,
    crypto_amount: charge.pricing?.settlement?.amount,
    webhook_data: event,
    created_at: new Date().toISOString()
  });
  
  // 根据事件类型处理
  switch (eventType) {
    case 'charge:confirmed':
    case 'charge:resolved':
      // 支付确认
      if (order.status === 'pending') {
        await db.updateOrderStatus(orderId, 'paid', {
          payment_id: charge.id,
          paid_at: new Date().toISOString()
        });
        
        await db.updatePaymentStatus(paymentId, 'confirmed', {
          confirmed_at: new Date().toISOString(),
          webhook_data: event
        });
        
        log('info', 'Payment confirmed', { orderId, paymentId });
      }
      break;
      
    case 'charge:pending':
      // 支付待确认（检测到交易但未确认）
      log('info', 'Payment pending', { orderId, chargeId: charge.id });
      break;
      
    case 'charge:failed':
    case 'charge:expired':
      // 支付失败或过期
      await db.updateOrderStatus(orderId, 'failed');
      await db.updatePaymentStatus(paymentId, 'failed', {
        webhook_data: event
      });
      
      log('info', 'Payment failed/expired', { orderId, event: eventType });
      break;
      
    default:
      log('info', 'Unhandled webhook event', { event: eventType });
  }
  
  return { success: true, event: eventType, orderId };
}

/**
 * 获取支持的加密货币
 */
export function getSupportedCurrencies() {
  return [
    { code: 'BTC', name: 'Bitcoin', network: 'Bitcoin' },
    { code: 'ETH', name: 'Ethereum', network: 'ERC20' },
    { code: 'USDC', name: 'USD Coin', network: 'ERC20' },
    { code: 'DAI', name: 'Dai', network: 'ERC20' }
  ];
}

export default {
  createCharge,
  getCharge,
  verifyWebhookSignature,
  handleWebhook,
  getSupportedCurrencies
};
