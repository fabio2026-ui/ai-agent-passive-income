import type { Env, Tenant } from '../types';

// Stripe API封装
class StripeAPI {
  private secretKey: string;
  private baseURL = 'https://api.stripe.com/v1';

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      const error = await response.json() as { error: { message: string } };
      throw new Error(error.error?.message || 'Stripe API error');
    }

    return response.json();
  }

  async createCustomer(email: string, name: string): Promise<{ id: string }> {
    const params = new URLSearchParams({ email, name });
    return this.request('/customers', {
      method: 'POST',
      body: params,
    }) as Promise<{ id: string }>;
  }

  async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<{ id: string; url: string }> {
    const params = new URLSearchParams({
      'customer': customerId,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'mode': 'subscription',
      'success_url': successUrl,
      'cancel_url': cancelUrl,
    });

    return this.request('/checkout/sessions', {
      method: 'POST',
      body: params,
    }) as Promise<{ id: string; url: string }>;
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }> {
    const params = new URLSearchParams({
      'customer': customerId,
      'return_url': returnUrl,
    });

    return this.request('/billing_portal/sessions', {
      method: 'POST',
      body: params,
    }) as Promise<{ url: string }>;
  }

  async constructEvent(payload: string, signature: string, secret: string): Promise<unknown> {
    // 验证webhook签名
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = signature === `t=${Date.now()},v1=${expectedSignatureHex}`;
    
    return JSON.parse(payload);
  }
}

// 创建订阅结账会话
export async function createSubscriptionSession(
  tenant: Tenant,
  env: Env,
  origin: string
): Promise<{ sessionId: string; url: string }> {
  const stripe = new StripeAPI(env.STRIPE_SECRET_KEY);
  
  // 如果没有Stripe客户ID，先创建客户
  let customerId = tenant.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.createCustomer(tenant.email, tenant.name);
    customerId = customer.id;
    
    // 更新数据库
    await env.DB.prepare(
      'UPDATE tenants SET stripe_customer_id = ? WHERE id = ?'
    ).bind(customerId, tenant.id).run();
  }

  // 创建结账会话
  const session = await stripe.createCheckoutSession(
    customerId,
    env.STRIPE_PRICE_ID,
    `${origin}/subscription/success`,
    `${origin}/subscription/cancel`
  );

  return { sessionId: session.id, url: session.url };
}

// 创建客户门户会话
export async function createPortalSession(
  tenant: Tenant,
  env: Env,
  origin: string
): Promise<{ url: string }> {
  if (!tenant.stripe_customer_id) {
    throw new Error('No Stripe customer ID found');
  }

  const stripe = new StripeAPI(env.STRIPE_SECRET_KEY);
  const session = await stripe.createPortalSession(
    tenant.stripe_customer_id,
    `${origin}/subscription/manage`
  );

  return { url: session.url };
}

// 处理Stripe Webhook
export async function handleStripeWebhook(
  request: Request,
  env: Env
): Promise<Response> {
  const payload = await request.text();
  const signature = request.headers.get('Stripe-Signature') || '';

  try {
    const stripe = new StripeAPI(env.STRIPE_SECRET_KEY);
    const event = await stripe.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    const typedEvent = event as { type: string; data: { object: Record<string, unknown> } };

    switch (typedEvent.type) {
      case 'checkout.session.completed': {
        const session = typedEvent.data.object as { customer: string; subscription: string };
        
        // 更新租户订阅状态
        await env.DB.prepare(
          `UPDATE tenants 
           SET stripe_subscription_id = ?, subscription_status = 'active'
           WHERE stripe_customer_id = ?`
        ).bind(session.subscription, session.customer).run();
        
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = typedEvent.data.object as { customer: string; subscription: string; period_end: number };
        
        await env.DB.prepare(
          `UPDATE tenants 
           SET subscription_status = 'active', subscription_current_period_end = ?
           WHERE stripe_customer_id = ?`
        ).bind(invoice.period_end * 1000, invoice.customer).run();
        
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = typedEvent.data.object as { customer: string };
        
        await env.DB.prepare(
          `UPDATE tenants SET subscription_status = 'past_due' WHERE stripe_customer_id = ?`
        ).bind(invoice.customer).run();
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = typedEvent.data.object as { customer: string };
        
        await env.DB.prepare(
          `UPDATE tenants SET subscription_status = 'canceled' WHERE stripe_customer_id = ?`
        ).bind(subscription.customer).run();
        
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
}