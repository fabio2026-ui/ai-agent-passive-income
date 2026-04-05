// Credits System for CodeGuard
// 预付费Credits模式 - 最推荐的AI Agent变现方式

class CreditsSystem {
  constructor(config) {
    this.stripeSecretKey = config.stripeSecretKey;
    this.prices = {
      starter: { credits: 100, price: 1000, name: 'Starter' },      // $10
      pro: { credits: 1000, price: 8500, name: 'Pro' },            // $85 (15% off)
      enterprise: { credits: 10000, price: 75000, name: 'Enterprise' } // $750 (25% off)
    };
    this.usageRates = {
      scan: 1,           // 基础扫描
      deepScan: 5,       // 深度扫描
      aiFix: 10,         // AI自动修复
      report: 2          // 生成报告
    };
  }

  async purchaseCredits(userId, packageType) {
    const pkg = this.prices[packageType];
    if (!pkg) throw new Error('Invalid package');

    // Create Stripe checkout session
    const session = await this.createStripeSession(userId, pkg);
    
    return {
      sessionId: session.id,
      url: session.url,
      credits: pkg.credits,
      price: pkg.price
    };
  }

  async createStripeSession(userId, pkg) {
    const stripe = require('stripe')(this.stripeSecretKey);
    
    return await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userId,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `CodeGuard ${pkg.name} Credits`,
            description: `${pkg.credits} credits for security scans`
          },
          unit_amount: pkg.price
        },
        quantity: 1
      }],
      success_url: 'https://codeguard-ai-prod.yhongwb.workers.dev/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://codeguard-ai-prod.yhongwb.workers.dev/pricing'
    });
  }

  async handleWebhook(payload, signature) {
    const stripe = require('stripe')(this.stripeSecretKey);
    const event = stripe.webhooks.constructEvent(
      payload, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await this.addCredits(session.customer_email, session.metadata.credits);
    }

    return { received: true };
  }

  async addCredits(userId, credits) {
    console.log(`✅ Added ${credits} credits to ${userId}`);
    return { success: true, creditsAdded: credits };
  }

  async consumeCredits(userId, action) {
    const cost = this.usageRates[action];
    if (!cost) throw new Error('Invalid action');

    const currentCredits = await this.getUserCredits(userId);
    if (currentCredits < cost) {
      return { 
        success: false, 
        error: 'Insufficient credits',
        needed: cost,
        current: currentCredits
      };
    }

    await this.deductCredits(userId, cost);
    return { success: true, consumed: cost, remaining: currentCredits - cost };
  }

  async getUserCredits(userId) {
    return 100;
  }

  async deductCredits(userId, amount) {
    console.log(`💳 Deducted ${amount} credits from ${userId}`);
  }

  getPricingTable() {
    return {
      packages: this.prices,
      usage: this.usageRates,
      freeTier: { scans: 10, period: 'month' }
    };
  }
}

module.exports = CreditsSystem;