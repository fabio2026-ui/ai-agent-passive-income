/**
 * ContentAI 自动化系统 - Cloudflare Worker 主入口
 * 完整的自动化闭环系统 API
 */

import { CONFIG } from './shared/config.js';
import { 
  generateId, 
  generateOrderId,
  corsHeaders, 
  jsonResponse, 
  successResponse, 
  errorResponse,
  log,
  isValidEmail 
} from './shared/utils.js';
import { Database } from './shared/database.js';
import { generateAndSave, processPendingGenerations } from './ai/moonshot.js';
import { createCharge, handleWebhook as handleCoinbaseWebhook } from './payment/coinbase.js';
import { createPayment, handleIPN } from './payment/nowpayments.js';
import { createStripeCheckout, verifyStripePayment, handleStripeWebhook } from './payment/stripe.js';
import { createFreeOrder, processOrder } from './payment/free.js';
import { deliverContent, processPendingDeliveries, sendOrderConfirmation } from './delivery/email.js';
import { postMarketingContent } from './acquisition/reddit.js';
import { postMarketingTweet } from './acquisition/twitter.js';

/**
 * 路由处理器
 */
class Router {
  constructor(request, env) {
    this.request = request;
    this.env = env;
    this.url = new URL(request.url);
    this.db = new Database(env.DB);
  }
  
  /**
   * 处理请求
   */
  async route() {
    const { pathname, method } = this.request;
    
    // CORS 预检
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    
    try {
      // 路由匹配
      if (pathname === '/api/health') {
        return this.healthCheck();
      }
      
      if (pathname === '/api/pricing') {
        return this.getPricing();
      }
      
      if (pathname === '/api/order/create' && method === 'POST') {
        return this.createOrder();
      }
      
      if (pathname === '/api/order/status' && method === 'GET') {
        return this.getOrderStatus();
      }
      
      if (pathname === '/api/content/types') {
        return this.getContentTypes();
      }
      
      if (pathname === '/webhook/coinbase' && method === 'POST') {
        return this.handleCoinbaseWebhook();
      }
      
      if (pathname === '/webhook/nowpayments' && method === 'POST') {
        return this.handleNowPaymentsWebhook();
      }
      
      if (pathname === '/api/payment/stripe' && method === 'POST') {
        return this.createStripePayment();
      }
      
      if (pathname === '/webhook/stripe' && method === 'POST') {
        return this.handleStripeWebhook();
      }
      
      if (pathname === '/api/admin/process' && method === 'POST') {
        return this.adminProcess();
      }
      
      if (pathname === '/api/admin/stats' && method === 'GET') {
        return this.getStats();
      }
      
      // 前端静态页面路由
      if (pathname === '/' || pathname === '/index.html') {
        return this.serveLandingPage();
      }
      
      if (pathname === '/order/success') {
        return this.serveSuccessPage();
      }
      
      if (pathname === '/order/cancel') {
        return this.serveCancelPage();
      }
      
      return errorResponse('Not found', 404, 'NOT_FOUND');
      
    } catch (error) {
      log('error', 'Request handling error', { 
        pathname, 
        method, 
        error: error.message 
      });
      
      return errorResponse('Internal server error', 500, 'INTERNAL_ERROR');
    }
  }
  
  /**
   * 健康检查
   */
  async healthCheck() {
    return successResponse({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * 获取定价
   */
  async getPricing() {
    return successResponse({
      pricing: CONFIG.PRICING,
      supportedCryptos: ['BTC', 'ETH', 'USDT', 'USDC']
    });
  }
  
  /**
   * 获取内容类型
   */
  async getContentTypes() {
    const types = CONFIG.CONTENT_TYPES.map(type => ({
      id: type,
      name: this.getContentTypeName(type),
      description: this.getContentTypeDescription(type)
    }));
    
    return successResponse({ types });
  }
  
  /**
   * 创建订单
   */
  async createOrder() {
    const body = await this.request.json();
    const { 
      email, 
      contentType, 
      topic, 
      requirements = '',
      tier = 'BASIC',
      paymentProvider = 'coinbase' 
    } = body;
    
    // 验证输入
    if (!email || !isValidEmail(email)) {
      return errorResponse('Valid email is required', 400, 'INVALID_EMAIL');
    }
    
    if (!topic || topic.length < 5) {
      return errorResponse('Topic must be at least 5 characters', 400, 'INVALID_TOPIC');
    }
    
    if (!CONFIG.CONTENT_TYPES.includes(contentType)) {
      return errorResponse('Invalid content type', 400, 'INVALID_CONTENT_TYPE');
    }
    
    if (!CONFIG.PRICING[tier]) {
      return errorResponse('Invalid pricing tier', 400, 'INVALID_TIER');
    }
    
    const pricing = CONFIG.PRICING[tier];
    const orderId = generateOrderId();
    const createdAt = new Date().toISOString();
    
    try {
      // 创建支付或免费订单
      let paymentResult;
      let isFreeMode = false;
      
      // 检查是否有Stripe密钥，没有则使用免费模式
      if (!this.env.STRIPE_SECRET_KEY || this.env.STRIPE_SECRET_KEY.includes('...')) {
        // MVP免费模式
        paymentResult = await createFreeOrder({
          orderId,
          email,
          price: 0,
          description: pricing.description
        }, this.env);
        isFreeMode = true;
      } else if (paymentProvider === 'stripe') {
        paymentResult = await createStripeCheckout({
          id: orderId,
          email,
          amount: pricing.price,
          plan: tier
        }, {
          STRIPE_SECRET_KEY: this.env.STRIPE_SECRET_KEY,
          APP_URL: this.env.APP_URL || 'https://contentai.yourdomain.com',
        });
      } else if (paymentProvider === 'coinbase') {
        paymentResult = await createCharge({
          orderId,
          email,
          price: pricing.price,
          description: pricing.description
        });
      } else {
        paymentResult = await createPayment({
          orderId,
          email,
          price: pricing.price
        });
      }
      
      if (!paymentResult.success && !isFreeMode) {
        return errorResponse('Failed to create payment', 500, 'PAYMENT_ERROR');
      }
      
      // 创建订单记录
      await this.db.createOrder({
        id: orderId,
        email,
        content_type: contentType,
        topic,
        requirements,
        word_count: pricing.words,
        price: isFreeMode ? 0 : pricing.price,
        currency: 'USD',
        payment_provider: isFreeMode ? 'free' : paymentProvider,
        payment_id: isFreeMode ? 'free-' + orderId : (paymentResult.chargeId || paymentResult.paymentId || paymentResult.sessionId),
        payment_address: isFreeMode ? null : (paymentResult.addresses || paymentResult.payAddress),
        payment_data: isFreeMode ? { free: true } : paymentResult.raw,
        created_at: createdAt,
        status: isFreeMode ? 'paid' : 'pending' // 免费模式直接标记为已支付
      });
      
      // 免费模式：立即触发AI生成
      if (isFreeMode) {
        const { generateAndSave } = await import('./ai/moonshot.js');
        await generateAndSave({
          id: orderId,
          email,
          content_type: contentType,
          topic,
          requirements
        }, this.db, this.env);
        
        log('info', 'Free order created and processing', { orderId, email });
      } else {
        // 发送支付确认邮件
        await sendOrderConfirmation(
          { id: orderId, email, topic, content_type: contentType, price: pricing.price },
          paymentResult.hostedUrl || paymentResult.payAddress || paymentResult.url
        );
        
        log('info', 'Order created', { orderId, email, price: pricing.price });
      }
      
      return successResponse({
        orderId,
        status: isFreeMode ? 'processing' : 'pending',
        message: isFreeMode ? 'Free order created, AI is generating content...' : 'Please complete payment',
        paymentUrl: isFreeMode ? null : (paymentResult.hostedUrl || paymentResult.payAddress || paymentResult.url),
        paymentId: isFreeMode ? null : (paymentResult.chargeId || paymentResult.paymentId || paymentResult.sessionId),
        price: isFreeMode ? 0 : pricing.price,
        currency: 'USD',
        free: isFreeMode
      }, 'Order created successfully');
      
    } catch (error) {
      log('error', 'Failed to create order', { error: error.message });
      return errorResponse('Failed to create order', 500, 'ORDER_ERROR');
    }
  }
  
  /**
   * 获取订单状态
   */
  async getOrderStatus() {
    const orderId = this.url.searchParams.get('id');
    
    if (!orderId) {
      return errorResponse('Order ID is required', 400, 'MISSING_ORDER_ID');
    }
    
    const order = await this.db.getOrder(orderId);
    
    if (!order) {
      return errorResponse('Order not found', 404, 'ORDER_NOT_FOUND');
    }
    
    return successResponse({
      orderId: order.id,
      status: order.status,
      contentType: order.content_type,
      topic: order.topic,
      price: order.price,
      createdAt: order.created_at,
      paidAt: order.paid_at,
      completedAt: order.completed_at,
      deliveredAt: order.delivered_at
    });
  }
  
  /**
   * 处理 Coinbase Webhook
   */
  async handleCoinbaseWebhook() {
    const body = await this.request.text();
    const signature = this.request.headers.get('X-CC-Webhook-Signature');
    
    if (!signature) {
      return errorResponse('Missing signature', 401, 'UNAUTHORIZED');
    }
    
    try {
      const event = JSON.parse(body);
      const result = await handleCoinbaseWebhook(event, this.db);
      
      return successResponse(result);
    } catch (error) {
      log('error', 'Webhook processing error', { error: error.message });
      return errorResponse('Webhook processing failed', 500);
    }
  }
  
  /**
   * 处理 NowPayments Webhook
   */
  async handleNowPaymentsWebhook() {
    const body = await this.request.json();
    
    try {
      const result = await handleIPN(body, this.db);
      return successResponse(result);
    } catch (error) {
      log('error', 'IPN processing error', { error: error.message });
      return errorResponse('IPN processing failed', 500);
    }
  }
  
  /**
   * Stripe支付创建
   */
  async createStripePayment() {
    const { orderId } = await this.request.json();
    
    try {
      const order = await this.db.getOrder(orderId);
      if (!order) {
        return errorResponse('Order not found', 404);
      }
      
      const checkout = await createStripeCheckout(order, {
        STRIPE_SECRET_KEY: this.env.STRIPE_SECRET_KEY,
        APP_URL: this.env.APP_URL || 'https://contentai.yourdomain.com',
      });
      
      // 更新订单支付方式
      await this.db.updateOrder(orderId, { 
        payment_method: 'stripe',
        stripe_session_id: checkout.sessionId 
      });
      
      return successResponse({ 
        url: checkout.url,
        sessionId: checkout.sessionId 
      });
    } catch (error) {
      log('error', 'Stripe payment creation failed', { error: error.message });
      return errorResponse('Payment creation failed', 500);
    }
  }
  
  /**
   * Stripe Webhook处理
   */
  async handleStripeWebhook() {
    try {
      await handleStripeWebhook(this.request, {}, async (paymentData) => {
        // 支付成功，更新订单状态
        await this.db.updateOrder(paymentData.orderId, {
          status: 'paid',
          paid_at: new Date().toISOString(),
          paid_amount: paymentData.amount,
        });
        
        // 触发内容生成
        const order = await this.db.getOrder(paymentData.orderId);
        if (order) {
          await generateAndSave(order, this.db, this.env);
        }
        
        log('info', 'Stripe payment processed', { orderId: paymentData.orderId });
      });
      
      return successResponse({ received: true });
    } catch (error) {
      log('error', 'Stripe webhook error', { error: error.message });
      return errorResponse('Webhook processing failed', 500);
    }
  }
  
  /**
   * 管理员处理任务
   */
  async adminProcess() {
    const { action } = await this.request.json();
    
    switch (action) {
      case 'generate':
        const genResults = await processPendingGenerations(this.db, 5);
        return successResponse({ generated: genResults });
        
      case 'deliver':
        const delResults = await processPendingDeliveries(this.db, 5);
        return successResponse({ delivered: delResults });
        
      case 'reddit_post':
        const redditResult = await postMarketingContent(this.db, {
          subreddit: 'startups',
          template: 'product_launch'
        });
        return successResponse({ reddit: redditResult });
        
      case 'twitter_post':
        const twitterResult = await postMarketingTweet(this.db, {
          template: 'value_content'
        });
        return successResponse({ twitter: twitterResult });
        
      default:
        return errorResponse('Unknown action', 400, 'UNKNOWN_ACTION');
    }
  }
  
  /**
   * 获取统计数据
   */
  async getStats() {
    const date = new Date().toISOString().split('T')[0];
    const stats = await this.db.getStats(date);
    
    return successResponse({
      today: stats || { date, total_orders: 0, total_revenue: 0 },
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * 服务落地页
   */
  async serveLandingPage() {
    return new Response(LANDING_PAGE_HTML, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  /**
   * 服务成功页面
   */
  async serveSuccessPage() {
    const orderId = this.url.searchParams.get('order');
    
    return new Response(SUCCESS_PAGE_HTML.replace('{{ORDER_ID}}', orderId || ''), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  /**
   * 服务取消页面
   */
  async serveCancelPage() {
    return new Response(CANCEL_PAGE_HTML, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  // 辅助方法
  getContentTypeName(type) {
    const names = {
      blog_post: '博客文章',
      product_desc: '产品描述',
      social_post: '社交媒体帖子',
      email_copy: '邮件文案',
      ad_copy: '广告文案',
      seo_article: 'SEO文章',
      video_script: '视频脚本',
      whitepaper: '白皮书'
    };
    return names[type] || type;
  }
  
  getContentTypeDescription(type) {
    const descriptions = {
      blog_post: '专业的长文博客，适合SEO和读者深度阅读',
      product_desc: ' compelling 的产品描述，突出卖点和优势',
      social_post: '吸引眼球的社交媒体帖子，包含相关标签',
      email_copy: '高转化率的邮件营销文案',
      ad_copy: '简短有力的广告文案',
      seo_article: 'SEO优化的文章，自然融入关键词',
      video_script: '适合视频制作的脚本，包含场景描述',
      whitepaper: '专业的行业白皮书'
    };
    return descriptions[type] || '';
  }
}

// Worker 入口
export default {
  async fetch(request, env, ctx) {
    const router = new Router(request, env);
    return await router.route();
  },
  
  // 定时任务 - 每5分钟执行
  async scheduled(event, env, ctx) {
    const db = new Database(env.DB);
    
    // 处理待生成订单
    await processPendingGenerations(db, 5);
    
    // 处理待交付订单
    await processPendingDeliveries(db, 5);
    
    // 更新统计
    const date = new Date().toISOString().split('T')[0];
    const pendingOrders = await db.getPendingOrders(100);
    await db.updateStats(date, {
      total_orders: pendingOrders.length
    });
  }
};

/**
 * 落地页 HTML 模板
 */
const LANDING_PAGE_HTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ContentAI - AI内容生成服务</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 80px 0; text-align: center; }
    header h1 { font-size: 3rem; margin-bottom: 20px; }
    header p { font-size: 1.3rem; opacity: 0.9; max-width: 600px; margin: 0 auto 30px; }
    .cta-button { display: inline-block; background: white; color: #667eea; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 1.1rem; transition: transform 0.3s; }
    .cta-button:hover { transform: translateY(-2px); }
    .features { padding: 80px 0; background: #f9f9f9; }
    .features h2 { text-align: center; font-size: 2.5rem; margin-bottom: 50px; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
    .feature-card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .feature-card h3 { color: #667eea; margin-bottom: 15px; font-size: 1.3rem; }
    .pricing { padding: 80px 0; }
    .pricing h2 { text-align: center; font-size: 2.5rem; margin-bottom: 50px; }
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
    .pricing-card { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 20px rgba(0,0,0,0.1); text-align: center; border: 2px solid transparent; }
    .pricing-card.featured { border-color: #667eea; transform: scale(1.05); }
    .pricing-card h3 { font-size: 1.5rem; margin-bottom: 10px; }
    .pricing-card .price { font-size: 3rem; color: #667eea; font-weight: bold; margin: 20px 0; }
    .pricing-card .price span { font-size: 1rem; color: #666; }
    .pricing-card ul { list-style: none; margin: 30px 0; }
    .pricing-card ul li { padding: 10px 0; border-bottom: 1px solid #eee; }
    .order-section { padding: 80px 0; background: #f9f9f9; }
    .order-section h2 { text-align: center; font-size: 2.5rem; margin-bottom: 50px; }
    .order-form { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
    .form-group { margin-bottom: 25px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; transition: border-color 0.3s; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #667eea; }
    .form-group textarea { min-height: 100px; resize: vertical; }
    .submit-btn { width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border: none; border-radius: 6px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: opacity 0.3s; }
    .submit-btn:hover { opacity: 0.9; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    footer { background: #333; color: white; padding: 40px 0; text-align: center; }
    #message { margin-top: 20px; padding: 15px; border-radius: 6px; display: none; }
    #message.success { background: #d4edda; color: #155724; display: block; }
    #message.error { background: #f8d7da; color: #721c24; display: block; }
    .crypto-support { text-align: center; padding: 40px 0; }
    .crypto-support img { height: 40px; margin: 0 10px; opacity: 0.7; }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>🚀 ContentAI</h1>
      <p>AI驱动的内容生成服务。博客文章、产品描述、社媒文案——几分钟内完成，支持加密货币支付。</p>
      <a href="#order" class="cta-button">立即开始</a>
    </div>
  </header>

  <section class="features">
    <div class="container">
      <h2>为什么选择 ContentAI？</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>⚡ 极速生成</h3>
          <p>AI在几分钟内生成高质量内容，无需等待数天。</p>
        </div>
        <div class="feature-card">
          <h3>🎯 定制内容</h3>
          <p>根据您的具体需求、主题和风格偏好定制内容。</p>
        </div>
        <div class="feature-card">
          <h3>🔒 隐私保护</h3>
          <p>支持加密货币支付，保护您的隐私。</p>
        </div>
        <div class="feature-card">
          <h3>📧 自动交付</h3>
          <p>内容完成后自动发送到您的邮箱。</p>
        </div>
      </div>
    </div>
  </section>

  <section class="pricing">
    <div class="container">
      <h2>简单透明的定价</h2>
      <div class="pricing-grid">
        <div class="pricing-card">
          <h3>基础版</h3>
          <div class="price">$5<span>/篇</span></div>
          <ul>
            <li>500 词内容</li>
            <li>多种内容类型</li>
            <li>基础SEO优化</li>
            <li>邮件交付</li>
          </ul>
        </div>
        <div class="pricing-card featured">
          <h3>专业版</h3>
          <div class="price">$15<span>/篇</span></div>
          <ul>
            <li>1500 词内容</li>
            <li>多种内容类型</li>
            <li>高级SEO优化</li>
            <li>邮件交付</li>
            <li>优先处理</li>
          </ul>
        </div>
        <div class="pricing-card">
          <h3>企业版</h3>
          <div class="price">$49<span>/篇</span></div>
          <ul>
            <li>5000 词内容</li>
            <li>所有内容类型</li>
            <li>深度SEO优化</li>
            <li>邮件交付</li>
            <li>最高优先级</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="crypto-support">
    <div class="container">
      <p>支持支付方式：Bitcoin (BTC) · Ethereum (ETH) · USDT · USDC · DAI</p>
    </div>
  </section>

  <section class="order-section" id="order">
    <div class="container">
      <h2>开始您的订单</h2>
      <form class="order-form" id="orderForm">
        <div class="form-group">
          <label for="email">邮箱地址 *</label>
          <input type="email" id="email" name="email" required placeholder="your@email.com">
        </div>
        
        <div class="form-group">
          <label for="tier">选择套餐 *</label>
          <select id="tier" name="tier" required>
            <option value="BASIC">基础版 - $5 (500词)</option>
            <option value="PRO" selected>专业版 - $15 (1500词)</option>
            <option value="ENTERPRISE">企业版 - $49 (5000词)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="contentType">内容类型 *</label>
          <select id="contentType" name="contentType" required>
            <option value="blog_post">博客文章</option>
            <option value="product_desc">产品描述</option>
            <option value="social_post">社交媒体帖子</option>
            <option value="email_copy">邮件文案</option>
            <option value="ad_copy">广告文案</option>
            <option value="seo_article">SEO文章</option>
            <option value="video_script">视频脚本</option>
            <option value="whitepaper">白皮书</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="topic">主题/标题 *</label>
          <input type="text" id="topic" name="topic" required placeholder="例如：如何提升个人生产力">
        </div>
        
        <div class="form-group">
          <label for="requirements">具体要求（可选）</label>
          <textarea id="requirements" name="requirements" placeholder="描述您的具体需求、目标受众、风格偏好等..."></textarea>
        </div>
        
        <button type="submit" class="submit-btn" id="submitBtn">创建订单并支付</button>
        <div id="message"></div>
      </form>
    </div>
  </section>

  <footer>
    <div class="container">
      <p>&copy; 2024 ContentAI. All rights reserved.</p>
    </div>
  </footer>

  <script>
    document.getElementById('orderForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submitBtn');
      const message = document.getElementById('message');
      
      submitBtn.disabled = true;
      submitBtn.textContent = '创建订单中...';
      message.className = '';
      message.style.display = 'none';
      
      try {
        const formData = {
          email: document.getElementById('email').value,
          tier: document.getElementById('tier').value,
          contentType: document.getElementById('contentType').value,
          topic: document.getElementById('topic').value,
          requirements: document.getElementById('requirements').value
        };
        
        const response = await fetch('/api/order/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          message.className = 'success';
          message.textContent = '订单创建成功！正在跳转到支付页面...';
          
          setTimeout(() => {
            window.location.href = result.data.paymentUrl;
          }, 2000);
        } else {
          throw new Error(result.error?.message || '订单创建失败');
        }
      } catch (error) {
        message.className = 'error';
        message.textContent = '错误: ' + error.message;
        submitBtn.disabled = false;
        submitBtn.textContent = '创建订单并支付';
      }
    });
  </script>
</body>
</html>
`;

const SUCCESS_PAGE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>支付成功 - ContentAI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f9f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .success-box { background: white; padding: 60px; border-radius: 10px; box-shadow: 0 2px 20px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
    .success-icon { font-size: 4rem; margin-bottom: 20px; }
    h1 { color: #28a745; margin-bottom: 20px; }
    p { color: #666; margin-bottom: 30px; line-height: 1.6; }
    .order-id { background: #f0f0f0; padding: 10px 20px; border-radius: 5px; font-family: monospace; margin: 20px 0; }
    a { color: #667eea; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="success-box">
    <div class="success-icon">✅</div>
    <h1>支付成功！</h1>
    <p>感谢您的支付。我们的 AI 正在为您生成内容，完成后将自动发送到您的邮箱。</p>
    <div class="order-id">订单号: {{ORDER_ID}}</div>
    
    <p><a href="/">返回首页</a></p>
  </div>
</body>
</html>
`;

const CANCEL_PAGE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>支付取消 - ContentAI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .cancel-box { background: white; padding: 60px; border-radius: 10px; box-shadow: 0 2px 20px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
    .cancel-icon { font-size: 4rem; margin-bottom: 20px; }
    h1 { color: #dc3545; margin-bottom: 20px; }
    p { color: #666; margin-bottom: 30px; line-height: 1.6; }
    a { color: #667eea; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="cancel-box">
    <div class="cancel-icon">❌</div>
    <h1>支付已取消</h1>
    <p>您的支付已取消，订单未创建。如果您有任何问题，请联系我们。</p>
    
    <p><a href="/">返回首页重新下单</a></p>
  </div>
</body>
</html>
`;
