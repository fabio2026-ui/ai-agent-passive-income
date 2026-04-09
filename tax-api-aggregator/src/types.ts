// Cloudflare Workers环境类型定义
export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_ID: string;
  JWT_SECRET: string;
  API_VERSION: string;
}

// 租户类型
export interface Tenant {
  id: string;
  email: string;
  name: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  subscription_current_period_end?: number;
  created_at: string;
  updated_at: string;
}

// API密钥类型
export interface ApiKey {
  id: string;
  tenant_id: string;
  key_hash: string;
  name: string;
  permissions: string[];
  rate_limit: number;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  expires_at?: string;
}

// 使用日志
export interface UsageLog {
  id: string;
  tenant_id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  created_at: string;
}

// API响应格式
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    request_id: string;
    timestamp: string;
    version: string;
  };
}

// 税务计算请求/响应
export interface TaxCalculationRequest {
  amount: number;
  country: string;
  region?: string;
  category?: string;
  year?: number;
}

export interface TaxCalculationResponse {
  original_amount: number;
  tax_amount: number;
  total_amount: number;
  tax_rate: number;
  currency: string;
  breakdown: Array<{
    name: string;
    rate: number;
    amount: number;
  }>;
}

// 认证上下文
export interface AuthContext {
  tenant: Tenant;
  apiKey: ApiKey;
  permissions: string[];
}