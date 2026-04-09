/**
 * ContentAI 自动化系统 - NowPayments 支付模块
 * 备选支付方案，支持更多加密货币
 */

import { CONFIG } from '../shared/config.js';
import { log } from '../shared/utils.js';

/**
 * 获取预估价格
 */
export async function getEstimatedPrice(amount, currency = 'usd', cryptoCurrency = 'usdt', apiKey = CONFIG.NOWPAYMENTS_API_KEY) {
  if (!apiKey) {
    throw new Error('NowPayments API key not configured');
  }
  
  try {
    const response = await fetch(
      `https://api.nowpayments.io/v1/estimate?amount=${amount}&currency_from=${currency}&currency_to=${cryptoCurrency}`,
      {
        headers: {
          'x-api-key': apiKey
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`NowPayments API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      estimatedAmount: data.estimated_amount,
      currencyFrom: currency,
      currencyTo: cryptoCurrency
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 创建支付
 */
export async function createPayment(orderData, apiKey = CONFIG.NOWPAYMENTS_API_KEY) {
  const { orderId, email, price, currency = 'usd', payCurrency = 'usdt' } = orderData;
  
  if (!apiKey) {
    throw new Error('NowPayments API key not configured');
  }
  
  try {
    // 首先获取最小支付金额
    const minAmountResponse = await fetch(
      `https://api.nowpayments.io/v1/min-amount?currency_from=${payCurrency}&currency_to=${payCurrency}`,
      {
        headers: { 'x-api-key': apiKey }
      }
    );
    
    const minAmountData = await minAmountResponse.json();
    
    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        price_amount: price,
        price_currency: currency,
        pay_currency: payCurrency,
        order_id: orderId,
        order_description: `ContentAI Order #${orderId}`,
        ipn_callback_url: `${CONFIG.APP_URL}/webhook/nowpayments`,
        success_url: `${CONFIG.APP_URL}/order/success?order=${orderId}`,
        cancel_url: `${CONFIG.APP_URL}/order/cancel?order=${orderId}`
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NowPayments API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    log('info', 'NowPayments payment created', {
      orderId,
      paymentId: data.payment_id,
      price: `${price} ${currency}`
    });
    
    return {
      success: true,
      paymentId: data.payment_id,
      paymentStatus: data.payment_status,
      payAddress: data.pay_address,
      payAmount: data.pay_amount,
      payCurrency: data.pay_currency,
      orderId: data.order_id,
      validUntil: data.valid_until,
      raw: data
    };
    
  } catch (error) {
    log('error', 'Failed to create NowPayments payment', {
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
 * 获取支付状态
 */
export async function getPaymentStatus(paymentId, apiKey = CONFIG.NOWPAYMENTS_API_KEY) {
  if (!apiKey) {
    throw new Error('NowPayments API key not configured');
  }
  
  try {
    const response = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
      headers: {
        'x-api-key': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`NowPayments API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      payment: data
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 验证 IPN 签名
 */
export function verifyIPNSignature(payload, signature, secret = CONFIG.NOWPAYMENTS_WEBHOOK_SECRET) {
  if (!secret) {
    return false;
  }
  
  // NowPayments 使用 HMAC-SHA512 签名
  // 实际实现需要根据 NowPayments 的签名算法
  // 这里是一个示例
  
  try {
    const crypto = require('crypto');
    const computedSig = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return computedSig === signature;
  } catch (error) {
    log('error', 'IPN signature verification failed', { error: error.message });
    return false;
  }
}

/**
 * 处理 IPN (Instant Payment Notification)
 */
export async function handleIPN(payload, db) {
  const { payment_id, payment_status, order_id, pay_amount, pay_currency } = payload;
  
  log('info', 'Processing NowPayments IPN', {
    paymentId: payment_id,
    status: payment_status,
    orderId: order_id
  });
  
  if (!order_id) {
    log('error', 'No order_id in IPN payload');
    return { success: false, error: 'No order_id' };
  }
  
  // 获取订单
  const order = await db.getOrder(order_id);
  
  if (!order) {
    log('error', 'Order not found', { orderId: order_id });
    return { success: false, error: 'Order not found' };
  }
  
  // 记录支付
  const paymentRecordId = `PAY-${Date.now()}`;
  await db.createPayment({
    id: paymentRecordId,
    order_id: order_id,
    provider: 'nowpayments',
    external_id: payment_id,
    amount: order.price,
    currency: order.currency,
    crypto_currency: pay_currency,
    crypto_amount: pay_amount,
    webhook_data: payload,
    created_at: new Date().toISOString()
  });
  
  // 根据状态处理
  switch (payment_status) {
    case 'finished':
    case 'confirmed':
      // 支付完成
      if (order.status === 'pending') {
        await db.updateOrderStatus(order_id, 'paid', {
          payment_id: payment_id,
          paid_at: new Date().toISOString()
        });
        
        await db.updatePaymentStatus(paymentRecordId, 'confirmed', {
          confirmed_at: new Date().toISOString(),
          webhook_data: payload
        });
        
        log('info', 'Payment confirmed via NowPayments', { 
          orderId: order_id, 
          paymentId: payment_id 
        });
      }
      break;
      
    case 'waiting':
    case 'confirming':
      log('info', 'Payment waiting/confirming', { 
        orderId: order_id, 
        status: payment_status 
      });
      break;
      
    case 'failed':
    case 'expired':
    case 'refunded':
      await db.updateOrderStatus(order_id, 'failed');
      await db.updatePaymentStatus(paymentRecordId, payment_status, {
        webhook_data: payload
      });
      
      log('info', 'Payment failed/expired/refunded', { 
        orderId: order_id, 
        status: payment_status 
      });
      break;
      
    default:
      log('info', 'Unhandled payment status', { status: payment_status });
  }
  
  return { 
    success: true, 
    status: payment_status, 
    orderId: order_id 
  };
}

/**
 * 获取支持的加密货币列表
 */
export async function getSupportedCurrencies(apiKey = CONFIG.NOWPAYMENTS_API_KEY) {
  if (!apiKey) {
    return {
      success: false,
      error: 'API key not configured'
    };
  }
  
  try {
    const response = await fetch('https://api.nowpayments.io/v1/currencies', {
      headers: {
        'x-api-key': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`NowPayments API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      currencies: data.currencies
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  getEstimatedPrice,
  createPayment,
  getPaymentStatus,
  verifyIPNSignature,
  handleIPN,
  getSupportedCurrencies
};
