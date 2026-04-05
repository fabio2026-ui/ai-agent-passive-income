// Payment Gateway Integration
// 支持 Stripe + Coinbase Commerce (加密货币)

class PaymentGateway {
  constructor() {
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    this.coinbaseApiKey = process.env.COINBASE_COMMERCE_API_KEY_1 || process.env.COINBASE_COMMERCE_API_KEY_2;
    
    // Pricing in USD
    this.prices = {
      starter: { amount: 1000, name: 'Starter Credits', credits: 100 },      // $10.00
      pro: { amount: 8500, name: 'Pro Credits', credits: 1000 },             // $85.00
      enterprise: { amount: 75000, name: 'Enterprise Credits', credits: 10000 } // $750.00
    };
  }

  // Stripe Checkout
  async createStripeCheckout(packageType, userEmail) {
    const stripe = require('stripe')(this.stripeSecretKey);
    const pkg = this.prices[packageType];
    
    if (!pkg) throw new Error('Invalid package');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userEmail,
      metadata: {
        package: packageType,
        credits: pkg.credits
      },
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `CodeGuard ${pkg.name}`,
            description: `${pkg.credits} credits for security scans`
          },
          unit_amount: pkg.amount
        },
        quantity: 1
      }],
      success_url: 'https://codeguard-ai-prod.yhongwb.workers.dev/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://codeguard-ai-prod.yhongwb.workers.dev/pricing'
    });

    return {
      type: 'stripe',
      url: session.url,
      sessionId: session.id
    };
  }

  // Coinbase Commerce (Crypto)
  async createCryptoCheckout(packageType, userEmail) {
    const pkg = this.prices[packageType];
    
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': this.coinbaseApiKey,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify({
        name: `CodeGuard ${pkg.name}`,
        description: `${pkg.credits} credits for security scans`,
        local_price: {
          amount: (pkg.amount / 100).toFixed(2),
          currency: 'USD'
        },
        pricing_type: 'fixed_price',
        metadata: {
          package: packageType,
          credits: pkg.credits,
          user_email: userEmail
        }
      })
    });

    const data = await response.json();
    
    return {
      type: 'crypto',
      url: data.data.hosted_url,
      chargeId: data.data.id,
      addresses: data.data.addresses // BTC, ETH, etc.
    };
  }

  // Universal checkout - let user choose
  async createCheckout(packageType, userEmail, preferredMethod = 'auto') {
    if (preferredMethod === 'crypto') {
      return this.createCryptoCheckout(packageType, userEmail);
    }
    return this.createStripeCheckout(packageType, userEmail);
  }

  // Webhook handlers
  async handleStripeWebhook(payload, signature) {
    const stripe = require('stripe')(this.stripeSecretKey);
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await this.fulfillOrder(
        session.customer_email,
        session.metadata.credits,
        'stripe',
        session.id
      );
    }

    return { received: true };
  }

  async handleCoinbaseWebhook(payload) {
    const event = payload.event;
    
    if (event.type === 'charge:confirmed') {
      const charge = event.data;
      await this.fulfillOrder(
        charge.metadata.user_email,
        charge.metadata.credits,
        'crypto',
        charge.id
      );
    }

    return { received: true };
  }

  async fulfillOrder(email, credits, method, transactionId) {
    console.log(`✅ Payment received: ${credits} credits via ${method}`);
    console.log(`   User: ${email}`);
    console.log(`   TxID: ${transactionId}`);
    
    // TODO: Add credits to user account in database
    return { success: true, credits, email, method };
  }
}

module.exports = PaymentGateway;