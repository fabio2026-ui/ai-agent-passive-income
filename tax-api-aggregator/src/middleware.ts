import type { Env, ApiKey } from './types';

// 速率限制配置
const RATE_LIMITS = {
  default: 1000,      // 默认1000次/小时
  basic: 1000,        // €29/月套餐
  professional: 10000, // 高级套餐
  enterprise: 100000, // 企业套餐
};

// 检查速率限制
export async function checkRateLimit(
  apiKey: ApiKey,
  env: Env
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `ratelimit:${apiKey.id}`;
  const windowSize = 3600; // 1小时窗口
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowSize) * windowSize;
  
  const limit = apiKey.rate_limit || RATE_LIMITS.default;
  
  // 使用KV存储请求计数
  const currentCount = parseInt(await env.CACHE.get(`${key}:${windowStart}`) || '0');
  
  if (currentCount >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: windowStart + windowSize,
    };
  }
  
  // 增加计数
  await env.CACHE.put(`${key}:${windowStart}`, String(currentCount + 1), {
    expirationTtl: windowSize,
  });
  
  return {
    allowed: true,
    remaining: limit - currentCount - 1,
    resetAt: windowStart + windowSize,
  };
}

// CORS中间件
export function handleCORS(request: Request): Response | null {
  const origin = request.headers.get('Origin');
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  
  return null;
}

// 添加CORS头
export function addCORSHeaders(response: Response, request: Request): Response {
  const origin = request.headers.get('Origin');
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', origin || '*');
  newHeaders.set('Access-Control-Allow-Credentials', 'true');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}