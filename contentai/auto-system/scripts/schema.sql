/**
 * D1 数据库初始化脚本
 * 在 Cloudflare Dashboard 或使用 wrangler CLI 执行
 */

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
  status TEXT DEFAULT 'pending',
  payment_provider TEXT,
  payment_id TEXT,
  payment_address TEXT,
  payment_data TEXT,
  generated_content TEXT,
  content_id TEXT,
  created_at TEXT NOT NULL,
  paid_at TEXT,
  completed_at TEXT,
  delivered_at TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata TEXT
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

CREATE INDEX IF NOT EXISTS idx_generations_order_id ON content_generations(order_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON content_generations(status);

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
  webhook_data TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  confirmed_at TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments(external_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- 邮件发送记录表
CREATE TABLE IF NOT EXISTS email_deliveries (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  provider_response TEXT,
  sent_at TEXT,
  delivered_at TEXT,
  opened_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_email_order_id ON email_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_email_status ON email_deliveries(status);

-- 社交媒体发布记录表
CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  post_type TEXT NOT NULL,
  content TEXT NOT NULL,
  external_id TEXT,
  url TEXT,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  engagement_stats TEXT,
  posted_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_social_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_created ON social_posts(created_at);

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

-- 插入初始数据
INSERT OR IGNORE INTO system_stats (date, updated_at) 
VALUES (date('now'), datetime('now'));
