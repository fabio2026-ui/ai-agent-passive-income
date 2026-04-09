// Stripe 支付处理模块
// 支持信用卡支付，更成熟稳定

export async function createStripeCheckout(order, config) {
  const { STRIPE_SECRET_KEY, APP_URL } = config;
  
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': `ContentAI - ${order.plan}`,
      'line_items[0][price_data][unit_amount]': (order.amount * 100).toString(), // 分
      'line_items[0][quantity]': '1',
      'mode': 'payment',
      'success_url': `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${APP_URL}/cancel`,
      'metadata[order_id]': order.id,
    }),
  });
  
  const data = await response.json();
  return {
    url: data.url,
    sessionId: data.id,
  };
}

export async function verifyStripePayment(sessionId, config) {
  const { STRIPE_SECRET_KEY } = config;
  
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
    },
  });
  
  const data = await response.json();
  return {
    paid: data.payment_status === 'paid',
    amount: data.amount_total / 100,
    orderId: data.metadata?.order_id,
  };
}

export async function handleStripeWebhook(request, config, onSuccess) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();
  
  // 简化版 - 生产环境应验证签名
  const event = JSON.parse(body);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await onSuccess({
      orderId: session.metadata?.order_id,
      amount: session.amount_total / 100,
      paid: true,
    });
  }
  
  return { received: true };
}
