-- ContentAI 用户获取追踪系统 - 数据库结构
-- 创建时间: 2026-04-03

-- ============================================
-- 1. 用户来源追踪表 (UTM参数系统)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64) UNIQUE NOT NULL,
    first_visit_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_visit_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- UTM参数
    utm_source VARCHAR(50),
    utm_medium VARCHAR(50),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    
    -- 设备信息
    user_agent TEXT,
    ip_address VARCHAR(45),
    referrer_url TEXT,
    landing_page TEXT,
    
    -- 用户信息
    country VARCHAR(50),
    city VARCHAR(50),
    device_type VARCHAR(20), -- desktop/mobile/tablet
    browser VARCHAR(50),
    os VARCHAR(50),
    
    -- 状态
    is_converted BOOLEAN DEFAULT 0,
    conversion_value DECIMAL(10,2) DEFAULT 0,
    
    INDEX idx_utm_source (utm_source),
    INDEX idx_first_visit (first_visit_at),
    INDEX idx_converted (is_converted)
);

-- ============================================
-- 2. 各渠道效果追踪表
-- ============================================
CREATE TABLE IF NOT EXISTS channel_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    channel VARCHAR(50) NOT NULL,
    
    -- 流量指标
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    
    -- 参与指标
    avg_session_duration INTEGER DEFAULT 0, -- 秒
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    pages_per_session DECIMAL(5,2) DEFAULT 0,
    
    -- 成本
    cost DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- 计算指标
    cpc DECIMAL(10,4) DEFAULT 0, -- cost per click
    cpm DECIMAL(10,4) DEFAULT 0, -- cost per 1000 impressions
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_channel_date (date, channel),
    INDEX idx_channel_date (channel, date),
    INDEX idx_date (date)
);

-- ============================================
-- 3. 转化率追踪表
-- ============================================
CREATE TABLE IF NOT EXISTS conversions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64) NOT NULL,
    conversion_type VARCHAR(50) NOT NULL,
    conversion_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- 转化详情
    source VARCHAR(50),
    channel VARCHAR(50),
    campaign VARCHAR(100),
    landing_page TEXT,
    
    -- 转化价值
    value DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- 转化路径
    first_touch_source VARCHAR(50),
    last_touch_source VARCHAR(50),
    touch_count INTEGER DEFAULT 1,
    
    -- 额外数据
    metadata TEXT, -- JSON格式存储额外信息
    
    INDEX idx_user_id (user_id),
    INDEX idx_conversion_type (conversion_type),
    INDEX idx_conversion_at (conversion_at),
    INDEX idx_channel (channel),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 转化事件类型枚举
CREATE TABLE IF NOT EXISTS conversion_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_name VARCHAR(50) UNIQUE NOT NULL,
    type_description TEXT,
    weight DECIMAL(3,2) DEFAULT 1.00, -- 转化权重
    is_revenue_event BOOLEAN DEFAULT 0
);

-- 初始化转化类型
INSERT INTO conversion_types (type_name, type_description, weight, is_revenue_event) VALUES
('signup', '用户注册', 0.20, 0),
('email_capture', '邮箱收集', 0.10, 0),
('demo_request', '申请演示', 0.40, 0),
('trial_start', '开始试用', 0.50, 0),
('subscription', '订阅付费', 1.00, 1),
('purchase', '单次购买', 1.00, 1),
('upgrade', '升级套餐', 0.80, 1),
('referral', '推荐新用户', 0.60, 0);

-- ============================================
-- 4. 收入追踪表
-- ============================================
CREATE TABLE IF NOT EXISTS revenue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    
    -- 收入详情
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    amount_usd DECIMAL(10,2) NOT NULL,
    
    -- 归因
    attribution_model VARCHAR(20) DEFAULT 'last_touch', -- first_touch, last_touch, linear, position_based
    attributed_channel VARCHAR(50),
    attributed_source VARCHAR(50),
    attributed_campaign VARCHAR(100),
    
    -- 产品信息
    product_id VARCHAR(50),
    product_name VARCHAR(200),
    plan_type VARCHAR(50), -- monthly/yearly/one_time
    
    -- 时间
    transaction_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    subscription_start DATE,
    subscription_end DATE,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'completed', -- pending/completed/refunded/chargeback
    refund_amount DECIMAL(10,2) DEFAULT 0,
    
    -- 额外数据
    metadata TEXT,
    
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_at (transaction_at),
    INDEX idx_attributed_channel (attributed_channel),
    INDEX idx_status (status)
);

-- 订阅追踪
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    
    -- 订阅详情
    plan_name VARCHAR(100),
    plan_price DECIMAL(10,2),
    billing_cycle VARCHAR(20), -- monthly/yearly
    
    -- 时间
    started_at DATETIME,
    expires_at DATETIME,
    canceled_at DATETIME,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active', -- active/canceled/expired/paused
    
    -- MRR计算
    mrr_contribution DECIMAL(10,2) DEFAULT 0,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
);

-- ============================================
-- 5. 每日汇总表 (用于快速报表)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE UNIQUE NOT NULL,
    
    -- 流量汇总
    total_visitors INTEGER DEFAULT 0,
    total_pageviews INTEGER DEFAULT 0,
    
    -- 转化汇总
    total_conversions INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- 关键指标
    overall_conversion_rate DECIMAL(5,2) DEFAULT 0,
    arpu DECIMAL(10,2) DEFAULT 0, -- average revenue per user
    
    -- 渠道分布 (JSON格式)
    channel_breakdown TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_date (date)
);

-- ============================================
-- 视图：渠道效果综合视图
-- ============================================
CREATE VIEW IF NOT EXISTS v_channel_performance AS
SELECT 
    cs.date,
    cs.channel,
    cs.unique_visitors AS visitors,
    cs.clicks,
    cs.cost,
    COUNT(DISTINCT c.user_id) AS conversions,
    SUM(c.value) AS conversion_value,
    ROUND(COUNT(DISTINCT c.user_id) * 100.0 / NULLIF(cs.unique_visitors, 0), 2) AS conversion_rate,
    ROUND(cs.cost / NULLIF(cs.clicks, 0), 4) AS cpc,
    ROUND((SUM(c.value) - cs.cost) / NULLIF(cs.cost, 0) * 100, 2) AS roi_percent,
    ROUND(cs.cost / NULLIF(COUNT(DISTINCT c.user_id), 0), 2) AS cac
FROM channel_stats cs
LEFT JOIN conversions c ON cs.channel = c.channel AND DATE(c.conversion_at) = cs.date
GROUP BY cs.date, cs.channel;

-- ============================================
-- 视图：用户获取漏斗
-- ============================================
CREATE VIEW IF NOT EXISTS v_acquisition_funnel AS
SELECT 
    DATE(first_visit_at) AS date,
    utm_source AS channel,
    COUNT(*) AS total_users,
    SUM(CASE WHEN is_converted = 1 THEN 1 ELSE 0 END) AS converted_users,
    ROUND(SUM(CASE WHEN is_converted = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS conversion_rate,
    SUM(conversion_value) AS total_revenue,
    ROUND(SUM(conversion_value) / COUNT(*), 2) AS arpu
FROM users
GROUP BY DATE(first_visit_at), utm_source;

-- ============================================
-- 视图：月度渠道对比
-- ============================================
CREATE VIEW IF NOT EXISTS v_monthly_channel_comparison AS
SELECT 
    strftime('%Y-%m', date) AS month,
    channel,
    SUM(unique_visitors) AS total_visitors,
    SUM(clicks) AS total_clicks,
    SUM(cost) AS total_cost,
    (SELECT COUNT(*) FROM conversions c WHERE c.channel = cs.channel AND strftime('%Y-%m', c.conversion_at) = strftime('%Y-%m', cs.date)) AS total_conversions,
    (SELECT SUM(value) FROM conversions c WHERE c.channel = cs.channel AND strftime('%Y-%m', c.conversion_at) = strftime('%Y-%m', cs.date)) AS total_revenue,
    ROUND((SELECT SUM(value) FROM conversions c WHERE c.channel = cs.channel AND strftime('%Y-%m', c.conversion_at) = strftime('%Y-%m', cs.date)) / NULLIF(SUM(cost), 0), 2) AS roas
FROM channel_stats cs
GROUP BY strftime('%Y-%m', date), channel;
