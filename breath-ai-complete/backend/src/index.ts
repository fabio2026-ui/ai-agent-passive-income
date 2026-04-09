import { Router, Request, error } from './router';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  SUBSCRIPTIONS: KVNamespace;
  DUO_SESSIONS: KVNamespace;
  SIGNAL_QUEUE: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const router = new Router();

    // Health check
    router.get('/api/health', () => {
      return json({ status: 'ok', timestamp: Date.now() });
    });

    // Stripe routes
    router.post('/api/stripe/checkout', (req) => handleCreateCheckout(req, env));
    router.get('/api/stripe/subscription', (req) => handleGetSubscription(req, env));
    router.delete('/api/stripe/subscription', (req) => handleCancelSubscription(req, env));
    router.post('/api/stripe/subscription/reactivate', (req) => handleReactivateSubscription(req, env));
    router.post('/api/stripe/payment-method', (req) => handleCreateSetupIntent(req, env));
    router.get('/api/stripe/invoices', (req) => handleGetInvoices(req, env));
    router.post('/api/stripe/webhook', (req) => handleWebhook(req, env));

    // Duo mode routes
    router.post('/api/duo/session', (req) => handleCreateDuoSession(req, env));
    router.get('/api/duo/session', (req) => handleGetDuoSession(req, env));
    router.post('/api/duo/session/:id/join', (req) => handleJoinDuoSession(req, env));
    router.delete('/api/duo/session/:id', (req) => handleDeleteDuoSession(req, env));
    router.post('/api/signal', (req) => handleSignal(req, env));

    try {
      const response = await router.handle(request);
      // Add CORS headers to all responses
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    } catch (err) {
      return error(err);
    }
  },
};

// Helper function to create JSON responses
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ==================== Stripe Handlers ====================

async function handleCreateCheckout(request: Request, env: Env): Promise<Response> {
  const stripe = await import('stripe').then(m => new m.default(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }));
  
  try {
    const { priceId, userId = 'anonymous' } = await request.json() as { priceId: string; userId?: string };
    
    // Get origin from request headers
    const origin = request.headers.get('Origin') || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'alipay', 'wechat_pay'],
      payment_method_options: {
        wechat_pay: {
          client: 'web'
        }
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/premium?success=true`,
      cancel_url: `${origin}/premium?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
      },
    });

    return json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return json({ error: 'Failed to create checkout session' }, 500);
  }
}

async function handleGetSubscription(request: Request, env: Env): Promise<Response> {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const subscriptionData = await env.SUBSCRIPTIONS.get(userId);
    if (!subscriptionData) {
      return json(null, 404);
    }
    return json(JSON.parse(subscriptionData));
  } catch (err) {
    return json({ error: 'Failed to get subscription' }, 500);
  }
}

async function handleCancelSubscription(request: Request, env: Env): Promise<Response> {
  const stripe = await import('stripe').then(m => new m.default(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }));
  
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const subscriptionData = await env.SUBSCRIPTIONS.get(userId);
    if (!subscriptionData) {
      return json({ error: 'No active subscription' }, 404);
    }

    const subscription = JSON.parse(subscriptionData);
    
    // Cancel at period end (not immediately)
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    // Update stored subscription
    subscription.cancelAtPeriodEnd = true;
    await env.SUBSCRIPTIONS.put(userId, JSON.stringify(subscription));

    return json({ success: true, subscriptionId: subscription.id });
  } catch (err) {
    console.error('Cancel error:', err);
    return json({ error: 'Failed to cancel subscription' }, 500);
  }
}

async function handleReactivateSubscription(request: Request, env: Env): Promise<Response> {
  const stripe = await import('stripe').then(m => new m.default(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }));
  
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const subscriptionData = await env.SUBSCRIPTIONS.get(userId);
    if (!subscriptionData) {
      return json({ error: 'No subscription found' }, 404);
    }

    const subscription = JSON.parse(subscriptionData);
    
    // Remove cancellation
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false,
    });

    subscription.cancelAtPeriodEnd = false;
    await env.SUBSCRIPTIONS.put(userId, JSON.stringify(subscription));

    return json({ success: true, subscriptionId: subscription.id });
  } catch (err) {
    console.error('Reactivate error:', err);
    return json({ error: 'Failed to reactivate subscription' }, 500);
  }
}

async function handleCreateSetupIntent(request: Request, env: Env): Promise<Response> {
  const stripe = await import('stripe').then(m => new m.default(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }));
  
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const subscriptionData = await env.SUBSCRIPTIONS.get(userId);
    if (!subscriptionData) {
      return json({ error: 'No subscription found' }, 404);
    }

    const subscription = JSON.parse(subscriptionData);
    
    const setupIntent = await stripe.setupIntents.create({
      customer: subscription.customerId,
      payment_method_types: ['card', 'alipay'],
    });

    return json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error('Setup intent error:', err);
    return json({ error: 'Failed to create setup intent' }, 500);
  }
}

async function handleGetInvoices(request: Request, env: Env): Promise<Response> {
  const stripe = await import('stripe').then(m => new m.default(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }));
  
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const subscriptionData = await env.SUBSCRIPTIONS.get(userId);
    if (!subscriptionData) {
      return json([]);
    }

    const subscription = JSON.parse(subscriptionData);
    
    const invoices = await stripe.invoices.list({
      customer: subscription.customerId,
      limit: 10,
    });

    return json(invoices.data.map(inv => ({
      id: inv.id,
      amount: inv.amount_due,
      currency: inv.currency,
      status: inv.status,
      created: inv.created,
      pdf: inv.invoice_pdf,
    })));
  } catch (err) {
    console.error('Get invoices error:', err);
    return json({ error: 'Failed to get invoices' }, 500);
  }
}

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const stripe = await import('stripe').then(m => new m.default(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }));
  
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return json({ error: 'Missing signature' }, 400);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return json({ error: `Webhook error: ${err.message}` }, 400);
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const userId = session.client_reference_id || session.metadata?.userId;
      
      if (userId) {
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        await env.SUBSCRIPTIONS.put(userId, JSON.stringify({
          id: subscription.id,
          userId,
          status: subscription.status,
          planId: subscription.items.data[0]?.price.lookup_key || 'premium',
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          customerId: subscription.customer,
        }));
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as any;
      // Could send email notification here
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any;
      // Find and update user subscription
      const userId = subscription.metadata?.userId;
      if (userId) {
        await env.SUBSCRIPTIONS.delete(userId);
      }
      break;
    }
  }

  return json({ received: true });
}

// ==================== Duo Mode Handlers ====================

async function handleCreateDuoSession(request: Request, env: Env): Promise<Response> {
  const { sessionId, hostId, inviteCode } = await request.json() as any;
  
  const session = {
    id: sessionId,
    hostId,
    inviteCode,
    status: 'waiting',
    createdAt: Date.now(),
  };

  await env.DUO_SESSIONS.put(inviteCode, JSON.stringify(session), { expirationTtl: 3600 });
  await env.DUO_SESSIONS.put(sessionId, inviteCode, { expirationTtl: 3600 });

  return json({ success: true });
}

async function handleGetDuoSession(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return json({ error: 'Missing invite code' }, 400);
  }

  const sessionData = await env.DUO_SESSIONS.get(code);
  if (!sessionData) {
    return json({ error: 'Session not found' }, 404);
  }

  return json(JSON.parse(sessionData));
}

async function handleJoinDuoSession(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const sessionId = url.pathname.split('/').pop();
  const { guestId } = await request.json() as any;

  const inviteCode = await env.DUO_SESSIONS.get(sessionId!);
  if (!inviteCode) {
    return json({ error: 'Session not found' }, 404);
  }

  const sessionData = await env.DUO_SESSIONS.get(inviteCode);
  if (!sessionData) {
    return json({ error: 'Session not found' }, 404);
  }

  const session = JSON.parse(sessionData);
  session.guestId = guestId;
  session.status = 'connected';

  await env.DUO_SESSIONS.put(inviteCode, JSON.stringify(session), { expirationTtl: 3600 });

  return json({ success: true });
}

async function handleDeleteDuoSession(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const sessionId = url.pathname.split('/').pop();

  const inviteCode = await env.DUO_SESSIONS.get(sessionId!);
  if (inviteCode) {
    await env.DUO_SESSIONS.delete(inviteCode);
  }
  await env.DUO_SESSIONS.delete(sessionId!);

  return json({ success: true });
}

async function handleSignal(request: Request, env: Env): Promise<Response> {
  // In production, this would route WebRTC signaling through WebSockets or Durable Objects
  // For now, return success - the actual signaling would be handled by a separate service
  return json({ success: true });
}

// ==================== Helper Functions ====================

function getUserIdFromRequest(request: Request): string | null {
  // In production, this would validate a JWT token or session cookie
  // For demo, extract from a custom header or return a test user
  return request.headers.get('X-User-Id') || 'demo-user';
}

// ==================== Durable Object ====================

export class SignalQueue {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/signal') {
      // Handle WebRTC signaling
      const { targetId, signal } = await request.json() as any;
      
      // Store the signal for the target
      await this.state.storage.put(`signal:${targetId}`, {
        from: request.headers.get('X-Session-Id'),
        signal,
        timestamp: Date.now(),
      });

      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/poll') {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Missing sessionId' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const signal = await this.state.storage.get(`signal:${sessionId}`);
      if (signal) {
        await this.state.storage.delete(`signal:${sessionId}`);
      }

      return new Response(JSON.stringify({ signal }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  }
}
