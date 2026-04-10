// Stripe Checkout API Worker
// 部署到 Cloudflare Workers

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 创建 Checkout Session
    if (url.pathname === '/api/create-checkout' && request.method === 'POST') {
      try {
        const { plan } = await request.json();
        
        const prices = {
          pro: 'price_1QExamplePro',
          team: 'price_1QExampleTeam'
        };

        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'mode': 'subscription',
            'payment_method_types[0]': 'card',
            'line_items[0][price]': prices[plan] || prices.pro,
            'line_items[0][quantity]': '1',
            'success_url': `${env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            'cancel_url': `${env.FRONTEND_URL}/pricing`,
          }),
        });

        const session = await response.json();
        
        return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Webhook 处理
    if (url.pathname === '/api/webhook' && request.method === 'POST') {
      // Stripe webhook 验证逻辑
      return new Response('Webhook received', { headers: corsHeaders });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};