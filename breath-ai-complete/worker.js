// Stripe Checkout Session Handler
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Create checkout session
    if (url.pathname === '/api/create-checkout-session' && request.method === 'POST') {
      try {
        const { priceId } = await request.json();
        
        const session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'payment_method_types[]': 'card',
            'line_items[0][price]': priceId || 'price_1TCfcBDRLWt3rKvbMonthly',
            'line_items[0][quantity]': '1',
            'mode': 'subscription',
            'success_url': `${url.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            'cancel_url': `${url.origin}/pricing.html`,
          }),
        });
        
        const sessionData = await session.json();
        
        return new Response(JSON.stringify({ id: sessionData.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Webhook handler
    if (url.pathname === '/api/webhook' && request.method === 'POST') {
      const signature = request.headers.get('stripe-signature');
      const body = await request.text();
      
      // Verify webhook signature (simplified)
      // In production, use stripe.webhooks.constructEvent()
      
      const event = JSON.parse(body);
      
      switch (event.type) {
        case 'checkout.session.completed':
          // Activate subscription
          console.log('Subscription activated:', event.data.object);
          break;
        case 'invoice.payment_failed':
          // Handle failed payment
          console.log('Payment failed:', event.data.object);
          break;
      }
      
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response('Not Found', { status: 404 });
  },
};
