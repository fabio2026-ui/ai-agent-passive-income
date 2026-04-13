const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://scanner.eucrossborder.com';

// 创建 Stripe Checkout Session
app.post('/api/create-checkout', async (req, res) => {
  try {
    const { plan } = req.body;
    
    // 这里使用 Stripe API 创建 checkout session
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'payment_method_types[0]': 'card',
        'line_items[0][quantity]': '1',
        // 根据 plan 选择不同的 price ID
        'line_items[0][price]': plan === 'team' ? 'price_team_xxx' : 'price_pro_xxx',
        'success_url': `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${FRONTEND_URL}/pricing`,
      }),
    });

    const session = await response.json();
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // 处理 Stripe webhook
  res.json({ received: true });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Scanner Backend running on port ${PORT}`);
});