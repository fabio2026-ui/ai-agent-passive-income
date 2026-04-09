import type { Env, Tenant, ApiKey, AuthContext } from './types';

// 生成API密钥 (格式: tap_ + 32位随机字符)
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'tap_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 简单哈希 (生产环境应使用更安全的方案)
export function hashKey(key: string): string {
  // 使用简单的crypto.subtle.digest
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(key)).then(buf => {
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  });
}

// 从请求头提取API密钥
export function extractApiKey(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  // 也支持X-API-Key头
  return request.headers.get('X-API-Key');
}

// 验证API密钥
export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<AuthContext | null> {
  const apiKey = extractApiKey(request);
  if (!apiKey) return null;

  // 计算密钥哈希
  const keyHash = await hashKey(apiKey);

  // 查询数据库
  const keyResult = await env.DB.prepare(
    `SELECT k.*, t.* FROM api_keys k
     JOIN tenants t ON k.tenant_id = t.id
     WHERE k.key_hash = ? AND (k.expires_at IS NULL OR k.expires_at > datetime('now'))`
  ).bind(keyHash).first();

  if (!keyResult) return null;

  // 检查订阅状态
  const subscriptionStatus = keyResult.subscription_status as string;
  if (!['active', 'trialing'].includes(subscriptionStatus)) {
    return null;
  }

  // 更新使用统计
  await env.DB.prepare(
    `UPDATE api_keys SET usage_count = usage_count + 1, last_used_at = datetime('now') WHERE id = ?`
  ).bind(keyResult.id).run();

  const tenant: Tenant = {
    id: keyResult.tenant_id as string,
    email: keyResult.email as string,
    name: keyResult.name as string,
    stripe_customer_id: keyResult.stripe_customer_id as string,
    stripe_subscription_id: keyResult.stripe_subscription_id as string,
    subscription_status: subscriptionStatus as Tenant['subscription_status'],
    subscription_current_period_end: keyResult.subscription_current_period_end as number,
    created_at: keyResult.t_created_at as string,
    updated_at: keyResult.t_updated_at as string,
  };

  const apiKeyData: ApiKey = {
    id: keyResult.id as string,
    tenant_id: keyResult.tenant_id as string,
    key_hash: keyResult.key_hash as string,
    name: keyResult.key_name as string,
    permissions: JSON.parse(keyResult.permissions as string || '[]'),
    rate_limit: keyResult.rate_limit as number,
    usage_count: keyResult.usage_count as number,
    last_used_at: keyResult.last_used_at as string,
    created_at: keyResult.created_at as string,
    expires_at: keyResult.expires_at as string,
  };

  return {
    tenant,
    apiKey: apiKeyData,
    permissions: apiKeyData.permissions,
  };
}

// JWT Token生成 (用于管理后台)
export async function generateJWT(payload: object, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const encodeBase64 = (obj: object) => {
    return btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };
  
  const headerB64 = encodeBase64(header);
  const payloadB64 = encodeBase64({ ...payload, iat: Math.floor(Date.now() / 1000) });
  
  const data = `${headerB64}.${payloadB64}`;
  const signature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
    encoder.encode(data)
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${data}.${signatureB64}`;
}