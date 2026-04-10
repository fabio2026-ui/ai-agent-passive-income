import { loadStripe, Stripe, StripeElements, PaymentElement } from '@stripe/stripe-js';
import type { SubscriptionPlan, Subscription } from '@shared/types';

// Stripe public key from environment
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

if (!STRIPE_PUBLIC_KEY) {
  console.error('Stripe public key is not configured');
}

export interface PaymentResult {
  success: boolean;
  subscriptionId?: string;
  error?: string;
}

export class StripeService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  async initialize(): Promise<void> {
    if (!this.stripe) {
      this.stripe = await loadStripe(STRIPE_PUBLIC_KEY);
      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }
    }
  }

  async createCheckoutSession(priceId: string): Promise<{ sessionId: string; url: string }> {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    return response.json();
  }

  async redirectToCheckout(priceId: string): Promise<void> {
    await this.initialize();
    const { url } = await this.createCheckoutSession(priceId);
    window.location.href = url;
  }

  async getSubscription(): Promise<Subscription | null> {
    try {
      const response = await fetch('/api/stripe/subscription', {
        credentials: 'include'
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  async cancelSubscription(): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/stripe/subscription', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }

      const result = await response.json();
      return { success: true, subscriptionId: result.subscriptionId };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async reactivateSubscription(): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/stripe/subscription/reactivate', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }

      const result = await response.json();
      return { success: true, subscriptionId: result.subscriptionId };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async updatePaymentMethod(): Promise<{ clientSecret: string }> {
    const response = await fetch('/api/stripe/payment-method', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create setup intent');
    }

    return response.json();
  }

  async initializePaymentElement(clientSecret: string): Promise<void> {
    await this.initialize();
    
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    this.elements = this.stripe.elements({
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#ffffff',
          colorText: '#1f2937',
          colorDanger: '#ef4444',
          fontFamily: 'Inter, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px'
        }
      }
    });

    const paymentElement = this.elements.create('payment', {
      layout: {
        type: 'accordion',
        defaultCollapsed: false,
        radios: false,
        spacedAccordionItems: true
      }
    });

    paymentElement.mount('#payment-element');
  }

  async confirmPayment(): Promise<PaymentResult> {
    if (!this.stripe || !this.elements) {
      return { success: false, error: 'Payment not initialized' };
    }

    const { error } = await this.stripe.confirmSetup({
      elements: this.elements,
      confirmParams: {
        return_url: `${window.location.origin}/settings/payment-success`
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async getInvoices(): Promise<Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
    pdf: string;
  }>> {
    const response = await fetch('/api/stripe/invoices', {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }

    return response.json();
  }
}

// Subscription plans - Update these with your actual Stripe Price IDs
// Run ./setup-stripe-products.sh after updating the API key to get real IDs
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: '免费版',
    price: 0,
    currency: 'cny',
    interval: 'month',
    features: [
      '基础呼吸练习',
      '3种呼吸模式',
      '每日练习记录',
      '基础统计'
    ],
    stripePriceId: ''
  },
  {
    id: 'premium',
    name: '专业版',
    price: 28,
    currency: 'cny',
    interval: 'month',
    features: [
      '所有免费功能',
      '全部6种呼吸模式',
      '心率监测集成',
      'AI情绪适配',
      '详细数据分析',
      '无广告体验'
    ],
    // TODO: Replace with actual Stripe Price ID after running setup script
    stripePriceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || 'price_premium_placeholder'
  },
  {
    id: 'premium-plus',
    name: '家庭版',
    price: 48,
    currency: 'cny',
    interval: 'month',
    features: [
      '所有专业版功能',
      '双人同步模式',
      '最多4个家庭成员',
      '家庭健康报告',
      '优先客服支持'
    ],
    // TODO: Replace with actual Stripe Price ID after running setup script
    stripePriceId: import.meta.env.VITE_STRIPE_PREMIUM_PLUS_PRICE_ID || 'price_premium_plus_placeholder'
  }
];

// Singleton instance
export const stripeService = new StripeService();
