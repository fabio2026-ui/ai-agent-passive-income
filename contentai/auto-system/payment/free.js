// 简化版支付模块 - 先免费试用，后续升级付费

export async function createFreeOrder(order, config) {
  // 免费版本：直接创建订单，跳过支付
  return {
    url: null, // 无需支付跳转
    free: true,
    message: '免费试用中，AI正在生成内容...',
  };
}

export async function processOrder(order, db, env) {
  // 免费版本直接生成
  if (order.status === 'pending' || order.status === 'free') {
    await db.updateOrder(order.id, {
      status: 'paid', // 标记为已处理
      paid_at: new Date().toISOString(),
      paid_amount: 0,
    });
    
    // 触发AI生成
    const { generateAndSave } = await import('../ai/moonshot.js');
    await generateAndSave(order, db, env);
    
    return { success: true, free: true };
  }
  
  return { success: false, error: 'Invalid order status' };
}

// 后续升级用Stripe时，替换为stripe.js
export { createFreeOrder as createCheckout, processOrder as verifyPayment };
