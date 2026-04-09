-- Database schema for Currency Exchange Rate Monitor
-- Run this in your D1 database console

-- Users table
CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  alert_count INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TEXT NOT NULL
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('EUR', 'USD', 'GBP')),
  target_rate REAL NOT NULL,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('above', 'below')),
  base_currency TEXT DEFAULT 'USD',
  created_at TEXT NOT NULL,
  triggered_at TEXT,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_alerts_email ON alerts(email);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_currency ON alerts(currency);

-- Sample data for testing (optional)
-- INSERT INTO users (email, tier, alert_count, created_at) 
-- VALUES ('test@example.com', 'free', 0, datetime('now'));