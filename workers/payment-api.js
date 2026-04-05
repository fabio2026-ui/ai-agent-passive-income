// Cloudflare Worker - Payment API
// 处理 Stripe + Coinbase Commerce 支付

import PaymentGateway from '../src/payment-gateway.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Set environment variables
    process.env.STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
    process.env.COINBASE_COMMERCE_API_KEY_1 = env.COINBASE_COMMERCE_API_KEY_1;
    process.env.COINBASE_COMMERCE_API_KEY_2 = env.COINBASE_COMMERCE_API_KEY_2;

    const gateway = new PaymentGateway();

    try {
      // Create checkout
      if (url.pathname === '/api/checkout' && request.method === 'POST') {
        const { package: packageType, email, method } = await request.json();
        
        const checkout = await gateway.createCheckout(packageType, email, method);
        
        return new Response(JSON.stringify(checkout), { headers });
      }

      // Stripe webhook
      if (url.pathname === '/api/webhooks/stripe' && request.method === 'POST') {
        const signature = request.headers.get('stripe-signature');
        const body = await request.text();
        
        const result = await gateway.handleStripeWebhook(body, signature);
        return new Response(JSON.stringify(result), { headers });
      }

      // Coinbase webhook
      if (url.pathname === '/api/webhooks/coinbase' && request.method === 'POST') {
        const body = await request.json();
        
        const result = await gateway.handleCoinbaseWebhook(body);
        return new Response(JSON.stringify(result), { headers });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404, 
        headers 
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers 
      });
    }
  }
};