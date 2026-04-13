// Stripe Integration for MCP Audit Pro
// This script handles Stripe Checkout for the landing page

// Configuration - Using existing Stripe account
// NOTE: Price IDs need to be created in Stripe Dashboard for MCP Audit Pro products
const STRIPE_CONFIG = {
    publishableKey: 'pk_test_51TCfcBDRLWt3rKvbzr3TuuA2pZ4rUOyBExwBUOpGVY9pK8zKfPTGT9A5oxmmBTI7Asf1M5ozadpHTFSlQ1WTyMKG00rQNT5CxB',
    prices: {
        starter: null,      // TODO: Create price in Stripe Dashboard for $49 Starter
        professional: null, // TODO: Create price in Stripe Dashboard for $149 Professional
        enterprise: null    // Enterprise uses contact form
    },
    successUrl: 'https://mcp-audit.pro/thank-you.html',
    cancelUrl: 'https://mcp-audit.pro/index.html'
};

// Initialize Stripe
let stripe;

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if Stripe key is set
    if (STRIPE_CONFIG.publishableKey.includes('YOUR_')) {
        console.warn('Stripe not configured. Please set your publishable key.');
        showStripeNotConfigured();
        return;
    }
    
    stripe = Stripe(STRIPE_CONFIG.publishableKey);
});

function showStripeNotConfigured() {
    // Replace Stripe buttons with contact form
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        const button = card.querySelector('.btn');
        if (button && button.href && button.href.includes('mailto:')) {
            return; // Keep mailto buttons
        }
        if (button) {
            button.textContent = 'Contact for Pricing';
            button.href = 'mailto:hello@mcp-audit.pro?subject=Audit Request';
        }
    });
}

async function checkout(priceType) {
    if (!stripe) {
        alert('Payment system is being set up. Please email hello@mcp-audit.pro to order.');
        return;
    }
    
    const priceId = STRIPE_CONFIG.prices[priceType];
    if (!priceId || priceId.includes('YOUR_')) {
        alert('Please email hello@mcp-audit.pro to order this package.');
        return;
    }
    
    try {
        const { error } = await stripe.redirectToCheckout({
            lineItems: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            successUrl: STRIPE_CONFIG.successUrl,
            cancelUrl: STRIPE_CONFIG.cancelUrl,
        });
        
        if (error) {
            console.error('Stripe error:', error);
            alert('Payment error: ' + error.message);
        }
    } catch (err) {
        console.error('Checkout error:', err);
        alert('Something went wrong. Please email hello@mcp-audit.pro');
    }
}

// Track checkout intent for analytics
function trackCheckoutIntent(priceType) {
    if (typeof plausible !== 'undefined') {
        plausible('Checkout Intent', { props: { plan: priceType } });
    }
}

// Update pricing buttons to use Stripe
document.addEventListener('DOMContentLoaded', function() {
    // Find pricing buttons and update them
    const starterBtn = document.querySelector('[data-plan="starter"]');
    const proBtn = document.querySelector('[data-plan="professional"]');
    const enterpriseBtn = document.querySelector('[data-plan="enterprise"]');
    
    if (starterBtn) {
        starterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            trackCheckoutIntent('starter');
            checkout('starter');
        });
    }
    
    if (proBtn) {
        proBtn.addEventListener('click', function(e) {
            e.preventDefault();
            trackCheckoutIntent('professional');
            checkout('professional');
        });
    }
    
    if (enterpriseBtn) {
        enterpriseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            trackCheckoutIntent('enterprise');
            // Enterprise always goes to contact form
            window.location.href = 'mailto:hello@mcp-audit.pro?subject=Enterprise Audit Request';
        });
    }
});
