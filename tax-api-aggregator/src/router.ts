import type { Env, AuthContext } from './types';
import { authenticateRequest, generateApiKey, hashKey } from './auth';
import { checkRateLimit, handleCORS, addCORSHeaders } from './middleware';
import {
  calculateVAT,
  calculateCorporateTax,
  calculatePersonalIncomeTax,
  calculateCustomsDuty,
  calculateExciseTax,
  calculatePropertyTax,
  calculateStampDuty,
  calculateVehicleTax,
  calculateResourceTax,
  calculateLandValueTax,
  calculateLandUseTax,
  calculateEnvironmentalTax,
} from './handlers/tax-calculations';
import { createSubscriptionSession, createPortalSession, handleStripeWebhook } from './handlers/subscription';

// 主路由处理器
export async function handleRequest(request: Request, env: Env): Promise<Response> {
  // CORS预检
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  const url = new URL(request.url);
  const path = url.pathname;

  // 健康检查
  if (path === '/health') {
    return jsonResponse({ status: 'ok', version: env.API_VERSION });
  }

  // Stripe Webhook (不需要认证)
  if (path === '/webhooks/stripe' && request.method === 'POST') {
    return handleStripeWebhook(request, env);
  }

  // 公开API: 注册
  if (path === '/auth/register' && request.method === 'POST') {
    return handleRegister(request, env);
  }

  // 需要认证的API
  const auth = await authenticateRequest(request, env);
  if (!auth) {
    return jsonResponse({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } 
    }, 401);
  }

  // 速率限制检查
  const rateLimit = await checkRateLimit(auth.apiKey, env);
  if (!rateLimit.allowed) {
    return jsonResponse({
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'API rate limit exceeded' },
    }, 429, {
      'X-RateLimit-Limit': String(auth.apiKey.rate_limit),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(rateLimit.resetAt),
    });
  }

  // API路由
  let response: Response;

  try {
    switch (true) {
      // === 税务计算API ===
      case path === '/v1/tax/vat' && request.method === 'POST':
        response = await handleTaxRequest(request, calculateVAT);
        break;

      case path === '/v1/tax/corporate' && request.method === 'POST':
        response = await handleTaxRequest(request, calculateCorporateTax);
        break;

      case path === '/v1/tax/personal-income' && request.method === 'POST':
        response = await handleTaxRequest(request, calculatePersonalIncomeTax);
        break;

      case path === '/v1/tax/customs' && request.method === 'POST':
        response = await handleTaxRequest(request, calculateCustomsDuty);
        break;

      case path === '/v1/tax/excise' && request.method === 'POST':
        response = await handleTaxRequest(request, calculateExciseTax);
        break;

      case path === '/v1/tax/property' && request.method === 'POST':
        response = await handleTaxRequest(request, calculatePropertyTax);
        break;

      case path === '/v1/tax/stamp-duty' && request.method === 'POST':
        response = await handleTaxRequest(request, calculateStampDuty);
        break;

      case path === '/v1/tax/vehicle' && request.method === 'POST':
        response = await handleTaxRequest(request, calculateVehicleTax);
        break;

      case path === '/v1/tax/resource' && request.method === 'POST':
        response = await handleTaxRequest(request, calculateResourceTax);
        break;

      case path === '/v1/tax/land-value' && request.method === 'POST':
        response = await handleTaxRequest(request, calculateLandValueTax);
        break;

      case path === '/v1/tax/land-use' && request.method === 'POST':
        response = await handleTaxRequest(request, calculateLandUseTax);
        break;

      case path === '/v1/tax/environmental' && request.method === 'POST':
        response = await handleTaxRequest(request, calculateEnvironmentalTax);
        break;

      // === 订阅管理 ===
      case path === '/v1/subscription/checkout' && request.method === 'POST':
        response = await handleSubscriptionCheckout(request, env, auth);
        break;

      case path === '/v1/subscription/portal' && request.method === 'POST':
        response = await handleSubscriptionPortal(request, env, auth);
        break;

      case path === '/v1/subscription/status' && request.method === 'GET':
        response = jsonResponse({
          success: true,
          data: {
            status: auth.tenant.subscription_status,
            current_period_end: auth.tenant.subscription_current_period_end,
          },
        });
        break;

      // === API密钥管理 ===
      case path === '/v1/api-keys' && request.method === 'GET':
        response = await handleListApiKeys(env, auth);
        break;

      case path === '/v1/api-keys' && request.method === 'POST':
        response = await handleCreateApiKey(request, env, auth);
        break;

      case path === '/v1/usage' && request.method === 'GET':
        response = await handleGetUsage(env, auth);
        break;

      default:
        response = jsonResponse({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
        }, 404);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    response = jsonResponse({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: errorMessage },
    }, 500);
  }

  // 添加速率限制头
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', String(auth.apiKey.rate_limit));
  headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  headers.set('X-RateLimit-Reset', String(rateLimit.resetAt));

  const finalResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  return addCORSHeaders(finalResponse, request);
}

// 辅助函数
async function handleTaxRequest(
  request: Request,
  handler: (req: unknown) => { success: boolean; data?: unknown; error?: unknown; meta?: unknown }
): Promise<Response> {
  const body = await request.json();
  const result = handler(body);
  return jsonResponse(result, result.success ? 200 : 400);
}

async function handleRegister(request: Request, env: Env): Promise<Response> {
  const { email, name, password } = await request.json() as { email: string; name: string; password: string };

  if (!email || !name) {
    return jsonResponse({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Email and name are required' },
    }, 400);
  }

  // 检查邮箱是否已存在
  const existing = await env.DB.prepare('SELECT id FROM tenants WHERE email = ?').bind(email).first();
  if (existing) {
    return jsonResponse({
      success: false,
      error: { code: 'EMAIL_EXISTS', message: 'Email already registered' },
    }, 409);
  }

  // 创建租户
  const tenantId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO tenants (id, email, name, subscription_status, created_at, updated_at)
     VALUES (?, ?, ?, 'inactive', datetime('now'), datetime('now'))`
  ).bind(tenantId, email, name).run();

  // 生成API密钥
  const apiKey = generateApiKey();
  const keyHash = await hashKey(apiKey);
  
  await env.DB.prepare(
    `INSERT INTO api_keys (id, tenant_id, key_hash, name, permissions, rate_limit, usage_count, created_at)
     VALUES (?, ?, ?, 'Default Key', '["*"]', 1000, 0, datetime('now'))`
  ).bind(crypto.randomUUID(), tenantId, keyHash).run();

  return jsonResponse({
    success: true,
    data: {
      tenant_id: tenantId,
      api_key: apiKey,
      message: 'Registration successful. Please subscribe to activate full API access.',
    },
  }, 201);
}

async function handleSubscriptionCheckout(
  request: Request,
  env: Env,
  auth: AuthContext
): Promise<Response> {
  const origin = request.headers.get('Origin') || 'https://api.taxaggregator.eu';
  const session = await createSubscriptionSession(auth.tenant, env, origin);
  
  return jsonResponse({
    success: true,
    data: session,
  });
}

async function handleSubscriptionPortal(
  request: Request,
  env: Env,
  auth: AuthContext
): Promise<Response> {
  const origin = request.headers.get('Origin') || 'https://api.taxaggregator.eu';
  const session = await createPortalSession(auth.tenant, env, origin);
  
  return jsonResponse({
    success: true,
    data: session,
  });
}

async function handleListApiKeys(env: Env, auth: AuthContext): Promise<Response> {
  const keys = await env.DB.prepare(
    `SELECT id, name, permissions, rate_limit, usage_count, last_used_at, created_at, expires_at
     FROM api_keys WHERE tenant_id = ?`
  ).bind(auth.tenant.id).all();

  return jsonResponse({
    success: true,
    data: keys.results,
  });
}

async function handleCreateApiKey(
  request: Request,
  env: Env,
  auth: AuthContext
): Promise<Response> {
  const { name, permissions = ['*'], rateLimit = 1000 } = await request.json() as {
    name: string;
    permissions?: string[];
    rateLimit?: number;
  };

  const apiKey = generateApiKey();
  const keyHash = await hashKey(apiKey);
  const keyId = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO api_keys (id, tenant_id, key_hash, name, permissions, rate_limit, usage_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))`
  ).bind(keyId, auth.tenant.id, keyHash, name || 'New Key', JSON.stringify(permissions), rateLimit).run();

  return jsonResponse({
    success: true,
    data: {
      id: keyId,
      api_key: apiKey,
      name: name || 'New Key',
      permissions,
      rate_limit: rateLimit,
    },
  }, 201);
}

async function handleGetUsage(env: Env, auth: AuthContext): Promise<Response> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const usage = await env.DB.prepare(
    `SELECT 
      COUNT(*) as total_requests,
      COUNT(DISTINCT DATE(created_at)) as active_days,
      AVG(response_time_ms) as avg_response_time
     FROM usage_logs 
     WHERE tenant_id = ? AND created_at > ?`
  ).bind(auth.tenant.id, thirtyDaysAgo.toISOString()).first();

  const endpoints = await env.DB.prepare(
    `SELECT endpoint, COUNT(*) as count
     FROM usage_logs 
     WHERE tenant_id = ? AND created_at > ?
     GROUP BY endpoint
     ORDER BY count DESC
     LIMIT 10`
  ).bind(auth.tenant.id, thirtyDaysAgo.toISOString()).all();

  return jsonResponse({
    success: true,
    data: {
      period: '30d',
      ...usage,
      top_endpoints: endpoints.results,
    },
  });
}

function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...extraHeaders,
  });

  return new Response(JSON.stringify(data), { status, headers });
}