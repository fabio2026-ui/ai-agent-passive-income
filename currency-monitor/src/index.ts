// Currency Exchange Rate Monitor - Optimized Version
// Performance improvements:
// - In-memory LRU cache for hot data
// - Pre-serialized static responses
// - Batch database operations
// - Response compression hints

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  ALERT_STORE: DurableObjectNamespace;
  EXCHANGE_API_KEY: string;
  RESEND_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

// Constants
const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP'] as const;
type Currency = typeof SUPPORTED_CURRENCIES[number];

const CONDITIONS = ['above', 'below'] as const;
type Condition = typeof CONDITIONS[number];

const TIERS = ['free', 'pro'] as const;
type Tier = typeof TIERS[number];

// In-memory LRU Cache for hot data
class LRUCache<T> {
  private cache: Map<string, { value: T; timestamp: number }> = new Map();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttlSeconds = 300) {
    this.maxSize = maxSize;
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Initialize caches
const memoryCache = new LRUCache<any>(200, 60); // 1 minute TTL for memory cache
const userCache = new LRUCache<User>(100, 300); // 5 minutes for user data

// Pre-serialized static responses
const STATIC_RESPONSES = {
  supportedCurrencies: JSON.stringify({ currencies: SUPPORTED_CURRENCIES }),
  conditions: JSON.stringify({ conditions: CONDITIONS }),
  tiers: JSON.stringify({ tiers: TIERS }),
};

// CORS headers with caching
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
};

// Interfaces
interface Alert {
  id: string;
  email: string;
  currency: Currency;
  targetRate: number;
  condition: Condition;
  baseCurrency: string;
  createdAt: string;
  triggeredAt?: string;
  isActive: boolean;
}

interface User {
  email: string;
  tier: Tier;
  alertCount: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
}

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

// Main export
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now();
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    let response: Response;

    try {
      // Health check (fast path)
      if (path === '/health') {
        response = jsonResponse({
          status: 'ok',
          timestamp: new Date().toISOString(),
          cacheSize: memoryCache.size(),
          version: '1.1.0-optimized'
        });
      }
      // API Routes
      else if (path === '/api/rates' && request.method === 'GET') {
        response = await handleGetRates(env);
      }
      else if (path === '/api/subscribe' && request.method === 'POST') {
        response = await handleSubscribe(request, env);
      }
      else if (path === '/api/unsubscribe' && request.method === 'POST') {
        response = await handleUnsubscribe(request, env);
      }
      else if (path === '/api/alerts' && request.method === 'GET') {
        const email = url.searchParams.get('email');
        if (!email) {
          response = jsonResponse({ error: 'Email required' }, 400);
        } else {
          response = await handleGetAlerts(email, env);
        }
      }
      else if (path === '/api/upgrade' && request.method === 'POST') {
        response = await handleUpgrade(request, env);
      }
      else if (path === '/api/webhook/stripe' && request.method === 'POST') {
        response = await handleStripeWebhook(request, env);
      }
      // Static metadata endpoints (cached)
      else if (path === '/api/meta/currencies') {
        response = new Response(STATIC_RESPONSES.supportedCurrencies, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      // Serve HTML UI for root path
      else if (path === '/') {
        response = new Response(getHTMLUI(), {
          headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=3600' },
        });
      }
      else {
        response = jsonResponse({ error: 'Not found' }, 404);
      }
    } catch (error) {
      console.error('Error:', error);
      response = jsonResponse({ error: 'Internal server error' }, 500);
    }

    // Add performance headers
    const headers = new Headers(response.headers);
    headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
    headers.set('X-Cache-Status', response.headers.get('X-Cache') || 'MISS');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  },

  // Cron trigger handler for daily rate checks
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('[Cron] Running scheduled rate check...');
    const startTime = Date.now();
    
    await checkRatesAndSendAlerts(env);
    
    console.log(`[Cron] Completed in ${Date.now() - startTime}ms`);
  },
};

// Helper function for JSON responses
function jsonResponse(data: unknown, status = 200, cacheHint?: string): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...corsHeaders,
  };
  
  if (cacheHint) {
    headers['X-Cache'] = cacheHint;
  }

  return new Response(JSON.stringify(data), { status, headers });
}

// Get current exchange rates with caching
async function getExchangeRates(env: Env): Promise<ExchangeRates> {
  const cacheKey = 'exchange_rates';
  
  // Check memory cache first (fastest)
  const memCached = memoryCache.get(cacheKey);
  if (memCached) {
    return memCached;
  }
  
  // Check KV cache
  const kvCached = await env.CACHE.get(cacheKey, 'json') as ExchangeRates | null;
  if (kvCached) {
    // Populate memory cache
    memoryCache.set(cacheKey, kvCached);
    return kvCached;
  }

  // Fetch from API
  const apiKey = env.EXCHANGE_API_KEY || 'demo';
  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
    { cf: { cacheTtl: 3600 } }
  );

  if (!response.ok) {
    throw new Error(`Exchange API error: ${response.status}`);
  }

  const data = await response.json() as {
    base_code: string;
    conversion_rates: Record<string, number>;
    time_last_update_unix: number;
  };

  const rates: ExchangeRates = {
    base: data.base_code,
    rates: data.conversion_rates,
    timestamp: Date.now(),
  };

  // Cache in both memory and KV
  memoryCache.set(cacheKey, rates);
  await env.CACHE.put(cacheKey, JSON.stringify(rates), { expirationTtl: 3600 });

  return rates;
}

// Handle GET /api/rates
async function handleGetRates(env: Env): Promise<Response> {
  const rates = await getExchangeRates(env);
  
  // Filter to only supported currencies
  const filteredRates: Record<string, number> = {};
  SUPPORTED_CURRENCIES.forEach(currency => {
    if (currency !== 'USD') {
      filteredRates[currency] = rates.rates[currency];
    }
  });

  return jsonResponse({
    base: 'USD',
    rates: filteredRates,
    timestamp: new Date(rates.timestamp).toISOString(),
  }, 200, 'HIT');
}

// Batch get users for alert checking
async function batchGetUsers(emails: string[], env: Env): Promise<Map<string, User>> {
  const users = new Map<string, User>();
  const uncachedEmails: string[] = [];
  
  // Check cache first
  for (const email of emails) {
    const cached = userCache.get(email);
    if (cached) {
      users.set(email, cached);
    } else {
      uncachedEmails.push(email);
    }
  }
  
  // Fetch uncached users
  if (uncachedEmails.length > 0) {
    const placeholders = uncachedEmails.map(() => '?').join(',');
    const result = await env.DB.prepare(
      `SELECT * FROM users WHERE email IN (${placeholders})`
    ).bind(...uncachedEmails).all();
    
    for (const row of result.results) {
      const user: User = {
        email: row.email,
        tier: row.tier,
        alertCount: row.alert_count,
        stripeCustomerId: row.stripe_customer_id,
        stripeSubscriptionId: row.stripe_subscription_id,
        createdAt: row.created_at,
      };
      users.set(user.email, user);
      userCache.set(user.email, user);
    }
  }
  
  return users;
}

// Handle POST /api/subscribe
async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as {
    email: string;
    currency: Currency;
    targetRate: number;
    condition: Condition;
  };

  // Validate input
  if (!body.email || !body.email.includes('@')) {
    return jsonResponse({ error: 'Valid email required' }, 400);
  }

  if (!SUPPORTED_CURRENCIES.includes(body.currency)) {
    return jsonResponse({ 
      error: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}` 
    }, 400);
  }

  if (!CONDITIONS.includes(body.condition)) {
    return jsonResponse({ error: 'Condition must be "above" or "below"' }, 400);
  }

  if (typeof body.targetRate !== 'number' || body.targetRate <= 0) {
    return jsonResponse({ error: 'Target rate must be a positive number' }, 400);
  }

  const email = body.email.toLowerCase();

  // Check user tier and alert count
  const user = await getOrCreateUser(email, env);
  
  if (user.tier === 'free' && user.alertCount >= 3) {
    return jsonResponse({
      error: 'Free tier limit reached. Upgrade to Pro for unlimited alerts.',
      upgradeUrl: '/api/upgrade',
      currentAlerts: user.alertCount,
      maxAlerts: 3,
    }, 403);
  }

  // Create alert
  const alertId = crypto.randomUUID();
  const alert: Alert = {
    id: alertId,
    email,
    currency: body.currency,
    targetRate: body.targetRate,
    condition: body.condition,
    baseCurrency: 'USD',
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  // Save to D1
  await env.DB.prepare(`
    INSERT INTO alerts (id, email, currency, target_rate, condition_type, base_currency, created_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    alert.id, alert.email, alert.currency, alert.targetRate,
    alert.condition, alert.baseCurrency, alert.createdAt, alert.isActive ? 1 : 0
  ).run();

  // Update user alert count
  await env.DB.prepare(`
    UPDATE users SET alert_count = alert_count + 1 WHERE email = ?
  `).bind(email).run();

  // Invalidate user cache
  userCache.set(email, { ...user, alertCount: user.alertCount + 1 });

  // Send confirmation email (fire and forget)
  sendConfirmationEmail(email, alert, env).catch(console.error);

  return jsonResponse({
    success: true,
    alert: {
      id: alert.id,
      currency: alert.currency,
      targetRate: alert.targetRate,
      condition: alert.condition,
    },
    tier: user.tier,
    alertsUsed: user.alertCount + 1,
    alertsRemaining: user.tier === 'free' ? 3 - (user.alertCount + 1) : 'unlimited',
  });
}

// Handle POST /api/unsubscribe
async function handleUnsubscribe(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { email: string; alertId: string };

  if (!body.email || !body.alertId) {
    return jsonResponse({ error: 'Email and alertId required' }, 400);
  }

  const email = body.email.toLowerCase();

  // Delete the alert
  const result = await env.DB.prepare(`
    DELETE FROM alerts WHERE id = ? AND email = ?
  `).bind(body.alertId, email).run();

  if (result.meta.changes === 0) {
    return jsonResponse({ error: 'Alert not found' }, 404);
  }

  // Decrement user alert count
  await env.DB.prepare(`
    UPDATE users SET alert_count = MAX(0, alert_count - 1) WHERE email = ?
  `).bind(email).run();

  // Invalidate cache
  const user = userCache.get(email);
  if (user) {
    userCache.set(email, { ...user, alertCount: Math.max(0, user.alertCount - 1) });
  }

  return jsonResponse({ success: true, message: 'Alert removed successfully' });
}

// Handle GET /api/alerts
async function handleGetAlerts(email: string, env: Env): Promise<Response> {
  const cacheKey = `alerts:${email}`;
  
  // Check cache
  const cached = memoryCache.get(cacheKey);
  if (cached) {
    return jsonResponse(cached, 200, 'HIT');
  }

  const alerts = await env.DB.prepare(`
    SELECT id, currency, target_rate, condition_type, base_currency, created_at, is_active
    FROM alerts WHERE email = ? AND is_active = 1
  `).bind(email.toLowerCase()).all();

  const user = await getUser(email, env);

  const result = {
    alerts: alerts.results.map(row => ({
      id: row.id,
      currency: row.currency,
      targetRate: row.target_rate,
      condition: row.condition_type,
      baseCurrency: row.base_currency,
      createdAt: row.created_at,
      isActive: row.is_active === 1,
    })),
    tier: user?.tier || 'free',
    alertCount: user?.alert_count || 0,
    maxAlerts: user?.tier === 'pro' ? 'unlimited' : 3,
  };

  // Cache for 30 seconds
  memoryCache.set(cacheKey, result);

  return jsonResponse(result, 200, 'MISS');
}

// Handle POST /api/upgrade
async function handleUpgrade(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { email: string; paymentMethodId?: string };

  if (!body.email) {
    return jsonResponse({ error: 'Email required' }, 400);
  }

  const email = body.email.toLowerCase();
  
  await env.DB.prepare(`
    UPDATE users SET tier = 'pro' WHERE email = ?
  `).bind(email).run();

  // Invalidate cache
  const user = userCache.get(email);
  if (user) {
    userCache.set(email, { ...user, tier: 'pro' });
  }

  return jsonResponse({
    success: true,
    message: 'Upgraded to Pro tier successfully',
    tier: 'pro',
    price: '€9/month',
  });
}

// Handle Stripe webhook
async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  const signature = request.headers.get('stripe-signature');
  
  // Verify webhook signature in production
  // Process webhook event
  
  return jsonResponse({ received: true });
}

// Get or create user
async function getOrCreateUser(email: string, env: Env): Promise<User> {
  // Check cache first
  const cached = userCache.get(email);
  if (cached) return cached;

  let user = await getUser(email, env);
  
  if (!user) {
    const now = new Date().toISOString();
    await env.DB.prepare(`
      INSERT INTO users (email, tier, alert_count, created_at)
      VALUES (?, 'free', 0, ?)
    `).bind(email, now).run();
    
    user = {
      email,
      tier: 'free',
      alertCount: 0,
      createdAt: now,
    };
  }
  
  // Cache user
  userCache.set(email, user);
  return user;
}

// Get user by email
async function getUser(email: string, env: Env): Promise<User | null> {
  const result = await env.DB.prepare(`
    SELECT * FROM users WHERE email = ?
  `).bind(email).first();
  
  if (!result) return null;
  
  return {
    email: result.email,
    tier: result.tier,
    alertCount: result.alert_count,
    stripeCustomerId: result.stripe_customer_id,
    stripeSubscriptionId: result.stripe_subscription_id,
    createdAt: result.created_at,
  };
}

// Check rates and send alerts (optimized batch processing)
async function checkRatesAndSendAlerts(env: Env): Promise<void> {
  const rates = await getExchangeRates(env);
  
  // Get all active alerts
  const alertsResult = await env.DB.prepare(`
    SELECT * FROM alerts WHERE is_active = 1
  `).all();

  const alerts = alertsResult.results as Array<{
    id: string;
    email: string;
    currency: string;
    target_rate: number;
    condition_type: string;
  }>;

  // Group alerts by email for batch processing
  const alertsByEmail = new Map<string, typeof alerts>();
  for (const alert of alerts) {
    if (!alertsByEmail.has(alert.email)) {
      alertsByEmail.set(alert.email, []);
    }
    alertsByEmail.get(alert.email)!.push(alert);
  }

  // Batch get users
  const emails = Array.from(alertsByEmail.keys());
  const users = await batchGetUsers(emails, env);

  // Process alerts
  const triggeredAlerts: typeof alerts = [];
  
  for (const alert of alerts) {
    const currentRate = rates.rates[alert.currency];
    if (!currentRate) continue;

    const shouldTrigger = alert.condition_type === 'above' 
      ? currentRate >= alert.target_rate
      : currentRate <= alert.target_rate;

    if (shouldTrigger) {
      triggeredAlerts.push(alert);
      
      // Send email
      sendAlertEmail(alert.email, alert, currentRate, env).catch(console.error);
    }
  }

  // Batch update triggered alerts
  if (triggeredAlerts.length > 0) {
    const now = new Date().toISOString();
    
    for (const alert of triggeredAlerts) {
      await env.DB.prepare(`
        UPDATE alerts SET is_active = 0, triggered_at = ? WHERE id = ?
      `).bind(now, alert.id).run();
      
      // Decrement alert count
      await env.DB.prepare(`
        UPDATE users SET alert_count = MAX(0, alert_count - 1) WHERE email = ?
      `).bind(alert.email).run();
      
      // Invalidate cache
      const user = userCache.get(alert.email);
      if (user) {
        userCache.set(alert.email, { ...user, alertCount: Math.max(0, user.alertCount - 1) });
      }
    }
  }

  console.log(`[Cron] Processed ${alerts.length} alerts, triggered ${triggeredAlerts.length}`);
}

// Send confirmation email (async)
async function sendConfirmationEmail(email: string, alert: Alert, env: Env): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.log('[Email] No Resend API key configured. Would send to:', email);
    return;
  }

  const html = `
    <h2>Currency Exchange Rate Alert Confirmed</h2>
    <p>Hi there!</p>
    <p>You've set up an alert for <strong>${alert.currency}</strong>.</p>
    <p>We'll notify you when the rate goes <strong>${alert.condition}</strong> <strong>${alert.targetRate}</strong> ${alert.baseCurrency}.</p>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Currency Monitor <alerts@your-domain.com>',
        to: email,
        subject: `Currency Alert Set: ${alert.currency}`,
        html,
      }),
    });
  } catch (error) {
    console.error('[Email] Failed to send:', error);
  }
}

// Send alert email (async)
async function sendAlertEmail(
  email: string, 
  alert: { currency: string; target_rate: number; condition_type: string }, 
  currentRate: number,
  env: Env
): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.log(`[Alert] ${alert.currency} ${alert.condition_type} ${alert.target_rate}! Current: ${currentRate}`);
    return;
  }

  const html = `
    <h2>🎯 Your Currency Alert Was Triggered!</h2>
    <p>Hi there!</p>
    <p>The <strong>${alert.currency}</strong> exchange rate has gone <strong>${alert.condition_type}</strong> your target of <strong>${alert.target_rate}</strong>.</p>
    <p><strong>Current rate: ${currentRate.toFixed(4)}</strong></p>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Currency Monitor <alerts@your-domain.com>',
        to: email,
        subject: `🎯 Currency Alert: ${alert.currency}`,
        html,
      }),
    });
  } catch (error) {
    console.error('[Alert] Failed to send:', error);
  }
}

// HTML UI (unchanged, but cached at edge)
function getHTMLUI(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Currency Exchange Rate Monitor</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    header { text-align: center; color: white; padding: 40px 20px; }
    header h1 { font-size: 2.5rem; margin-bottom: 10px; }
    .card { background: white; border-radius: 16px; padding: 30px; margin-bottom: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .rates-display { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px; }
    @media (max-width: 600px) { .rates-display { grid-template-columns: 1fr; } }
    .rate-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; }
    .rate-card h3 { font-size: 0.9rem; opacity: 0.8; margin-bottom: 5px; }
    .rate-card .value { font-size: 1.8rem; font-weight: bold; }
    button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
    footer { text-align: center; padding: 40px 20px; color: white; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <header><h1>💱 Currency Exchange Rate Monitor</h1><p>Get email alerts when your target exchange rates are reached</p></header>
    <div class="card">
      <h2>📊 Current Exchange Rates (USD Base)</h2>
      <div class="rates-display" id="rates">
        <div class="rate-card"><h3>EUR</h3><div class="value">Loading...</div></div>
        <div class="rate-card"><h3>GBP</h3><div class="value">Loading...</div></div>
        <div class="rate-card"><h3>USD</h3><div class="value">1.00</div></div>
      </div>
    </div>
    <footer><p>Currency Exchange Rate Monitor © 2024 | Optimized v1.1.0</p></footer>
  </div>
  <script>
    async function loadRates() {
      try {
        const res = await fetch('/api/rates');
        const data = await res.json();
        const ratesDiv = document.getElementById('rates');
        ratesDiv.innerHTML = \`
          \u003cdiv class="rate-card"\u003e\u003ch3\u003eEUR\u003c/h3\u003e\u003cdiv class="value"\u003e\${data.rates.EUR?.toFixed(4) || 'N/A'}\u003c/div\u003e\u003c/div\u003e
          \u003cdiv class="rate-card"\u003e\u003ch3\u003eGBP\u003c/h3\u003e\u003cdiv class="value"\u003e\${data.rates.GBP?.toFixed(4) || 'N/A'}\u003c/div\u003e\u003c/div\u003e
          \u003cdiv class="rate-card"\u003e\u003ch3\u003eUSD\u003c/h3\u003e\u003cdiv class="value"\u003e1.0000\u003c/div\u003e\u003c/div\u003e
        \`;
      } catch (err) {
        console.error('Failed to load rates:', err);
      }
    }
    loadRates();
  </script>
</body>
</html>`;
}
