/**
 * ContentAI 自动化系统 - D1 数据库操作
 * Cloudflare D1 Database 封装
 */

// 数据库表结构定义
export const SCHEMA = `
-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  content_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  requirements TEXT,
  word_count INTEGER NOT NULL,
  price REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending, paid, generating, completed, failed, refunded
  payment_provider TEXT, -- coinbase, nowpayments
  payment_id TEXT,
  payment_address TEXT,
  payment_data TEXT, -- JSON 存储原始支付数据
  generated_content TEXT,
  content_id TEXT,
  created_at TEXT NOT NULL,
  paid_at TEXT,
  completed_at TEXT,
  delivered_at TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata TEXT -- JSON 存储额外元数据
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 内容生成记录表
CREATE TABLE IF NOT EXISTS content_generations (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  generated_text TEXT,
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  model TEXT DEFAULT 'moonshot-v1-8k',
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  crypto_currency TEXT,
  crypto_amount REAL,
  status TEXT DEFAULT 'pending',
  webhook_data TEXT, -- JSON 存储 webhook 原始数据
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  confirmed_at TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments(external_id);

-- 邮件发送记录表
CREATE TABLE IF NOT EXISTS email_deliveries (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, failed, bounced
  provider_response TEXT,
  sent_at TEXT,
  delivered_at TEXT,
  opened_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 社交媒体发布记录表
CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL, -- reddit, twitter
  post_type TEXT NOT NULL, -- promotion, content, engagement
  content TEXT NOT NULL,
  external_id TEXT, -- 平台返回的帖子ID
  url TEXT,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  engagement_stats TEXT, -- JSON 存储互动数据
  posted_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);

-- 系统统计表
CREATE TABLE IF NOT EXISTS system_stats (
  date TEXT PRIMARY KEY,
  total_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  total_revenue REAL DEFAULT 0,
  total_content_generated INTEGER DEFAULT 0,
  avg_generation_time_ms INTEGER DEFAULT 0,
  social_posts_count INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL
);
`;

// 数据库操作类
export class Database {
  constructor(d1) {
    this.d1 = d1;
  }
  
  // 初始化数据库
  async init() {
    // 在实际部署时执行 schema 创建
    // 这里返回 schema 供参考
    return SCHEMA;
  }
  
  // 创建订单
  async createOrder(orderData) {
    const {
      id, email, content_type, topic, requirements,
      word_count, price, currency = 'USD',
      payment_provider, payment_address, payment_data,
      created_at
    } = orderData;
    
    const sql = `
      INSERT INTO orders (
        id, email, content_type, topic, requirements,
        word_count, price, currency,
        payment_provider, payment_address, payment_data,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `;
    
    await this.d1.prepare(sql).bind(
      id, email, content_type, topic, requirements,
      word_count, price, currency,
      payment_provider, payment_address, JSON.stringify(payment_data),
      created_at
    ).run();
    
    return { id, status: 'pending' };
  }
  
  // 获取订单
  async getOrder(orderId) {
    const result = await this.d1.prepare(
      'SELECT * FROM orders WHERE id = ?'
    ).bind(orderId).first();
    
    if (result && result.payment_data) {
      try {
        result.payment_data = JSON.parse(result.payment_data);
      } catch (e) {
        // 保持原样
      }
    }
    
    return result;
  }
  
  // 通过支付 ID 获取订单
  async getOrderByPaymentId(paymentId) {
    const result = await this.d1.prepare(
      'SELECT * FROM orders WHERE payment_id = ?'
    ).bind(paymentId).first();
    
    return result;
  }
  
  // 更新订单状态
  async updateOrderStatus(orderId, status, data = {}) {
    const fields = ['status = ?'];
    const values = [status];
    
    if (data.paid_at) {
      fields.push('paid_at = ?');
      values.push(data.paid_at);
    }
    
    if (data.payment_id) {
      fields.push('payment_id = ?');
      values.push(data.payment_id);
    }
    
    if (data.generated_content) {
      fields.push('generated_content = ?');
      values.push(data.generated_content);
    }
    
    if (data.content_id) {
      fields.push('content_id = ?');
      values.push(data.content_id);
    }
    
    if (data.completed_at) {
      fields.push('completed_at = ?');
      values.push(data.completed_at);
    }
    
    if (data.delivered_at) {
      fields.push('delivered_at = ?');
      values.push(data.delivered_at);
    }
    
    if (data.retry_count !== undefined) {
      fields.push('retry_count = ?');
      values.push(data.retry_count);
    }
    
    values.push(orderId);
    
    const sql = `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`;
    await this.d1.prepare(sql).bind(...values).run();
    
    return { id: orderId, status };
  }
  
  // 获取待处理订单
  async getPendingOrders(limit = 10) {
    const results = await this.d1.prepare(
      'SELECT * FROM orders WHERE status = ? ORDER BY created_at ASC LIMIT ?'
    ).bind('pending', limit).all();
    
    return results.results || [];
  }
  
  // 获取已支付但未生成的订单
  async getPaidOrders(limit = 10) {
    const results = await this.d1.prepare(
      'SELECT * FROM orders WHERE status = ? ORDER BY paid_at ASC LIMIT ?'
    ).bind('paid', limit).all();
    
    return results.results || [];
  }
  
  // 创建内容生成记录
  async createGeneration(generationData) {
    const { id, order_id, prompt, created_at } = generationData;
    
    await this.d1.prepare(
      'INSERT INTO content_generations (id, order_id, prompt, status, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, order_id, prompt, 'pending', created_at).run();
    
    return { id, status: 'pending' };
  }
  
  // 更新内容生成结果
  async updateGeneration(generationId, data) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    
    values.push(generationId);
    
    const sql = `UPDATE content_generations SET ${fields.join(', ')} WHERE id = ?`;
    await this.d1.prepare(sql).bind(...values).run();
    
    return { id: generationId, ...data };
  }
  
  // 记录支付
  async createPayment(paymentData) {
    const {
      id, order_id, provider, external_id,
      amount, currency, crypto_currency, crypto_amount,
      webhook_data, created_at
    } = paymentData;
    
    await this.d1.prepare(
      `INSERT INTO payments (id, order_id, provider, external_id, amount, currency, 
       crypto_currency, crypto_amount, webhook_data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, order_id, provider, external_id,
      amount, currency, crypto_currency, crypto_amount,
      JSON.stringify(webhook_data), created_at, created_at
    ).run();
    
    return { id, status: 'pending' };
  }
  
  // 更新支付状态
  async updatePaymentStatus(paymentId, status, data = {}) {
    const fields = ['status = ?', 'updated_at = ?'];
    const values = [status, new Date().toISOString()];
    
    if (data.confirmed_at) {
      fields.push('confirmed_at = ?');
      values.push(data.confirmed_at);
    }
    
    if (data.webhook_data) {
      fields.push('webhook_data = ?');
      values.push(JSON.stringify(data.webhook_data));
    }
    
    values.push(paymentId);
    
    const sql = `UPDATE payments SET ${fields.join(', ')} WHERE id = ?`;
    await this.d1.prepare(sql).bind(...values).run();
    
    return { id: paymentId, status };
  }
  
  // 记录邮件发送
  async createEmailDelivery(emailData) {
    const { id, order_id, email, subject, created_at } = emailData;
    
    await this.d1.prepare(
      'INSERT INTO email_deliveries (id, order_id, email, subject, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, order_id, email, subject, 'pending', created_at).run();
    
    return { id, status: 'pending' };
  }
  
  // 更新邮件状态
  async updateEmailStatus(emailId, status, data = {}) {
    const fields = ['status = ?'];
    const values = [status];
    
    if (data.sent_at) {
      fields.push('sent_at = ?');
      values.push(data.sent_at);
    }
    
    if (data.provider_response) {
      fields.push('provider_response = ?');
      values.push(JSON.stringify(data.provider_response));
    }
    
    values.push(emailId);
    
    const sql = `UPDATE email_deliveries SET ${fields.join(', ')} WHERE id = ?`;
    await this.d1.prepare(sql).bind(...values).run();
    
    return { id: emailId, status };
  }
  
  // 记录社交媒体发布
  async createSocialPost(postData) {
    const { id, platform, post_type, content, created_at } = postData;
    
    await this.d1.prepare(
      'INSERT INTO social_posts (id, platform, post_type, content, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, platform, post_type, content, 'pending', created_at).run();
    
    return { id, status: 'pending' };
  }
  
  // 更新社交媒体发布状态
  async updateSocialPost(postId, status, data = {}) {
    const fields = ['status = ?'];
    const values = [status];
    
    if (data.external_id) {
      fields.push('external_id = ?');
      values.push(data.external_id);
    }
    
    if (data.url) {
      fields.push('url = ?');
      values.push(data.url);
    }
    
    if (data.error_message) {
      fields.push('error_message = ?');
      values.push(data.error_message);
    }
    
    if (data.posted_at) {
      fields.push('posted_at = ?');
      values.push(data.posted_at);
    }
    
    values.push(postId);
    
    const sql = `UPDATE social_posts SET ${fields.join(', ')} WHERE id = ?`;
    await this.d1.prepare(sql).bind(...values).run();
    
    return { id: postId, status };
  }
  
  // 获取统计信息
  async getStats(date) {
    const result = await this.d1.prepare(
      'SELECT * FROM system_stats WHERE date = ?'
    ).bind(date).first();
    
    return result;
  }
  
  // 更新统计数据
  async updateStats(date, data) {
    const result = await this.d1.prepare(
      'SELECT * FROM system_stats WHERE date = ?'
    ).bind(date).first();
    
    if (result) {
      // 更新
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'date') {
          fields.push(`${key} = ${key} + ?`);
          values.push(value);
        }
      }
      
      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(date);
      
      const sql = `UPDATE system_stats SET ${fields.join(', ')} WHERE date = ?`;
      await this.d1.prepare(sql).bind(...values).run();
    } else {
      // 插入
      await this.d1.prepare(
        `INSERT INTO system_stats (date, total_orders, completed_orders, total_revenue, 
         total_content_generated, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        date,
        data.total_orders || 0,
        data.completed_orders || 0,
        data.total_revenue || 0,
        data.total_content_generated || 0,
        new Date().toISOString()
      ).run();
    }
    
    return { date, ...data };
  }
}

export default Database;
