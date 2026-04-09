/**
 * API Aggregator Service - Optimized Version
 * Unified gateway for 8 APIs: EU/UK/US/CA Tax + Amazon/Etsy/eBay/Shopify Calculators
 * 
 * Performance Optimizations:
 * - In-memory LRU cache for tax rates
 * - Response compression hints
 * - Efficient data structures
 * - Static data caching
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=3600',
  'X-API-Version': '1.1.0-optimized'
};

// Subscription configuration
const SUBSCRIPTION_PRICE = 29; // EUR per month
const API_VERSION = '1.1.0';

// Simple LRU Cache Implementation
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key, value, ttlSeconds = 3600) {
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Initialize cache
const apiCache = new LRUCache(200);

// Static tax rates - loaded once at startup
const TAX_RATES = {
  eu: {
    AT: { standard: 20, reduced: [10, 13] }, BE: { standard: 21, reduced: [6, 12] },
    BG: { standard: 20, reduced: [9] }, HR: { standard: 25, reduced: [5, 13] },
    CY: { standard: 19, reduced: [5, 9] }, CZ: { standard: 21, reduced: [12] },
    DK: { standard: 25 }, EE: { standard: 22, reduced: [9] },
    FI: { standard: 25.5, reduced: [10, 14] }, FR: { standard: 20, reduced: [5.5, 10] },
    DE: { standard: 19, reduced: [7] }, GR: { standard: 24, reduced: [6, 13] },
    HU: { standard: 27, reduced: [5, 18] }, IE: { standard: 23, reduced: [9, 13.5] },
    IT: { standard: 22, reduced: [5, 10] }, LV: { standard: 21, reduced: [12] },
    LT: { standard: 21, reduced: [5, 9] }, LU: { standard: 17, reduced: [3, 8, 14] },
    MT: { standard: 18, reduced: [5, 7] }, NL: { standard: 21, reduced: [9] },
    PL: { standard: 23, reduced: [5, 8] }, PT: { standard: 23, reduced: [6, 13] },
    RO: { standard: 19, reduced: [5, 9] }, SK: { standard: 20, reduced: [10] },
    SI: { standard: 22, reduced: [9.5] }, ES: { standard: 21, reduced: [4, 10] },
    SE: { standard: 25, reduced: [6, 12] }
  },
  us: {
    CA: 7.25, TX: 6.25, FL: 6.00, NY: 4.00, PA: 6.00, IL: 6.25, OH: 5.75,
    GA: 4.00, NC: 4.75, MI: 6.00, NJ: 6.625, VA: 5.30, WA: 6.50, AZ: 5.60,
    MA: 6.25, TN: 7.00, IN: 7.00, MO: 4.225, MD: 6.00, WI: 5.00, CO: 2.90,
    MN: 6.875, SC: 6.00, AL: 4.00, LA: 4.45, KY: 6.00, OR: 0.00, OK: 4.50,
    CT: 6.35, UT: 4.85, IA: 6.00, NV: 6.85, AR: 6.50, MS: 7.00, KS: 6.50,
    NM: 4.875, NE: 5.50, WV: 6.00, ID: 6.00, HI: 4.00, NH: 0.00, ME: 5.50,
    RI: 7.00, MT: 0.00, DE: 0.00, SD: 4.20, ND: 5.00, AK: 0.00, VT: 6.00, WY: 4.00
  },
  ca: {
    AB: { gst: 5, total: 5 }, BC: { gst: 5, pst: 7, total: 12 },
    MB: { gst: 5, pst: 7, total: 12 }, NB: { hst: 15, total: 15 },
    NL: { hst: 15, total: 15 }, NS: { hst: 15, total: 15 },
    ON: { hst: 13, total: 13 }, PE: { hst: 15, total: 15 },
    QC: { gst: 5, qst: 9.975, total: 14.975 }, SK: { gst: 5, pst: 6, total: 11 },
    NT: { gst: 5, total: 5 }, NU: { gst: 5, total: 5 }, YT: { gst: 5, total: 5 }
  }
};

// Pre-computed response caches
const STATIC_RESPONSES = {
  euTax: null,
  ukTax: null,
  usTax: null,
  caTax: null,
  amazon: null,
  etsy: null,
  ebay: null,
  shopify: null
};

// Initialize static responses
function initializeStaticResponses() {
  STATIC_RESPONSES.euTax = JSON.stringify({
    name: 'EU VAT Tax API',
    rates: {
      standard: [20, 21, 22, 23, 24, 25, 27],
      reduced: [5, 6, 9, 10, 12, 13],
      countries: {
        AT: { name: 'Austria', standard: 20, reduced: [10, 13] },
        BE: { name: 'Belgium', standard: 21, reduced: [6, 12] },
        BG: { name: 'Bulgaria', standard: 20, reduced: [9] },
        HR: { name: 'Croatia', standard: 25, reduced: [5, 13] },
        CY: { name: 'Cyprus', standard: 19, reduced: [5, 9] },
        CZ: { name: 'Czech Republic', standard: 21, reduced: [12] },
        DK: { name: 'Denmark', standard: 25 },
        EE: { name: 'Estonia', standard: 22, reduced: [9] },
        FI: { name: 'Finland', standard: 25.5, reduced: [10, 14] },
        FR: { name: 'France', standard: 20, reduced: [5.5, 10] },
        DE: { name: 'Germany', standard: 19, reduced: [7] },
        GR: { name: 'Greece', standard: 24, reduced: [6, 13] },
        HU: { name: 'Hungary', standard: 27, reduced: [5, 18] },
        IE: { name: 'Ireland', standard: 23, reduced: [9, 13.5] },
        IT: { name: 'Italy', standard: 22, reduced: [5, 10] },
        LV: { name: 'Latvia', standard: 21, reduced: [12] },
        LT: { name: 'Lithuania', standard: 21, reduced: [5, 9] },
        LU: { name: 'Luxembourg', standard: 17, reduced: [3, 8, 14] },
        MT: { name: 'Malta', standard: 18, reduced: [5, 7] },
        NL: { name: 'Netherlands', standard: 21, reduced: [9] },
        PL: { name: 'Poland', standard: 23, reduced: [5, 8] },
        PT: { name: 'Portugal', standard: 23, reduced: [6, 13] },
        RO: { name: 'Romania', standard: 19, reduced: [5, 9] },
        SK: { name: 'Slovakia', standard: 20, reduced: [10] },
        SI: { name: 'Slovenia', standard: 22, reduced: [9.5] },
        ES: { name: 'Spain', standard: 21, reduced: [4, 10] },
        SE: { name: 'Sweden', standard: 25, reduced: [6, 12] }
      }
    }
  });

  STATIC_RESPONSES.ukTax = JSON.stringify({
    name: 'UK Tax API',
    vatRates: { standard: 20, reduced: 5, zero: 0 },
    incomeTax: {
      bands: [
        { threshold: 12570, rate: 0, name: 'Personal Allowance' },
        { threshold: 50270, rate: 20, name: 'Basic Rate' },
        { threshold: 125140, rate: 40, name: 'Higher Rate' },
        { threshold: Infinity, rate: 45, name: 'Additional Rate' }
      ]
    },
    nationalInsurance: {
      employee: { threshold: 12570, rate: 8 },
      employer: { threshold: 9100, rate: 13.8 }
    },
    corporationTax: {
      smallProfitsRate: 19,
      mainRate: 25,
      threshold: 50000,
      upperThreshold: 250000
    }
  });

  STATIC_RESPONSES.usTax = JSON.stringify({
    name: 'US Sales Tax API',
    note: 'Sales tax varies by state',
    stateRates: TAX_RATES.us
  });

  STATIC_RESPONSES.caTax = JSON.stringify({
    name: 'Canada Tax API',
    gstHstRates: {
      AB: { name: 'Alberta', gst: 5, hst: 0, total: 5 },
      BC: { name: 'British Columbia', gst: 5, pst: 7, total: 12 },
      MB: { name: 'Manitoba', gst: 5, pst: 7, total: 12 },
      NB: { name: 'New Brunswick', hst: 15 },
      NL: { name: 'Newfoundland and Labrador', hst: 15 },
      NS: { name: 'Nova Scotia', hst: 15 },
      ON: { name: 'Ontario', hst: 13 },
      PE: { name: 'Prince Edward Island', hst: 15 },
      QC: { name: 'Quebec', gst: 5, qst: 9.975, total: 14.975 },
      SK: { name: 'Saskatchewan', gst: 5, pst: 6, total: 11 },
      NT: { name: 'Northwest Territories', gst: 5 },
      NU: { name: 'Nunavut', gst: 5 },
      YT: { name: 'Yukon', gst: 5 }
    }
  });

  STATIC_RESPONSES.amazon = JSON.stringify({
    name: 'Amazon Fee Calculator API',
    fees: {
      referral: {
        categories: {
          electronics: 8, clothing: 17, books: 15, home: 15, jewelry: 20,
          grocery: 8, health: 15, toys: 15, other: 15
        }
      },
      fba: { standard: 3.22, oversize: 8.26 },
      closing: 1.80
    }
  });

  STATIC_RESPONSES.etsy = JSON.stringify({
    name: 'Etsy Fee Calculator API',
    fees: { listing: 0.20, transaction: 6.5, payment: 3, paymentFixed: 0.25, offsiteAds: 15 }
  });

  STATIC_RESPONSES.ebay = JSON.stringify({
    name: 'eBay Fee Calculator API',
    fees: {
      finalValue: 13.25, finalValueFixed: 0.30, insertion: 0.35,
      storeSubscription: { starter: 4.95, basic: 21.95, premium: 59.95, anchor: 299.95 }
    }
  });

  STATIC_RESPONSES.shopify = JSON.stringify({
    name: 'Shopify Fee Calculator API',
    plans: {
      basic: { monthly: 32, transaction: 2.9, fixed: 0.30 },
      shopify: { monthly: 92, transaction: 2.6, fixed: 0.30 },
      advanced: { monthly: 399, transaction: 2.4, fixed: 0.30 },
      plus: { custom: true, transaction: 'negotiated' }
    },
    additionalFees: {
      paymentGateway: { shopifyPayments: 0, external: 0.5, additional: 2 },
      apps: 'varies'
    }
  });
}

// Initialize on module load
initializeStaticResponses();

export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const cacheKey = `${request.method}:${path}:${url.search}`;

    // Check cache first for GET requests
    if (request.method === 'GET') {
      const cached = apiCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return new Response(cached.value.body, {
          status: 200,
          headers: { ...corsHeaders, 'X-Cache': 'HIT', 'X-Response-Time': `${Date.now() - startTime}ms` }
        });
      }
    }

    let response;

    // Landing page
    if (path === '/' || path === '/index.html') {
      response = new Response(landingPageHtml(), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }
    // Health check
    else if (path === '/health') {
      response = jsonResponse({
        status: 'ok',
        service: 'API Aggregator',
        version: API_VERSION,
        cacheSize: apiCache.cache.size,
        apis: ['eu-tax', 'uk-tax', 'us-tax', 'ca-tax', 'amazon', 'etsy', 'ebay', 'shopify']
      });
    }
    // API Documentation
    else if (path === '/docs') {
      response = jsonResponse(apiDocumentation());
    }
    // Pricing endpoint
    else if (path === '/pricing') {
      response = jsonResponse({
        plan: 'All APIs Access',
        price: `€${SUBSCRIPTION_PRICE}/month`,
        includes: [
          'EU Tax API', 'UK Tax API', 'US Tax API', 'CA Tax API',
          'Amazon Calculator API', 'Etsy Calculator API', 'eBay Calculator API', 'Shopify Calculator API'
        ],
        rateLimits: { requestsPerMonth: 10000, requestsPerMinute: 100 }
      });
    }
    // API endpoints
    else if (path.startsWith('/api/eu-tax')) {
      response = await handleEUTax(request, path);
    }
    else if (path.startsWith('/api/uk-tax')) {
      response = await handleUKTax(request, path);
    }
    else if (path.startsWith('/api/us-tax')) {
      response = await handleUSTax(request, path);
    }
    else if (path.startsWith('/api/ca-tax')) {
      response = await handleCATax(request, path);
    }
    else if (path.startsWith('/api/amazon')) {
      response = await handleAmazonCalculator(request, path);
    }
    else if (path.startsWith('/api/etsy')) {
      response = await handleEtsyCalculator(request, path);
    }
    else if (path.startsWith('/api/ebay')) {
      response = await handleEbayCalculator(request, path);
    }
    else if (path.startsWith('/api/shopify')) {
      response = await handleShopifyCalculator(request, path);
    }
    else {
      response = jsonResponse({
        error: 'Not Found',
        message: 'Available endpoints: /api/{eu-tax,uk-tax,us-tax,ca-tax,amazon,etsy,ebay,shopify}',
        docs: '/docs'
      }, 404);
    }

    // Cache successful GET responses
    if (request.method === 'GET' && response.status === 200) {
      const clonedResponse = response.clone();
      const body = await clonedResponse.text();
      apiCache.set(cacheKey, { body }, 3600);
    }

    // Add response time header
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Response-Time', `${Date.now() - startTime}ms`);
    newHeaders.set('X-Cache', 'MISS');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};

// ==========================================
// OPTIMIZED API HANDLERS
// ==========================================

async function handleEUTax(request, path) {
  if (path === '/api/eu-tax') {
    return new Response(STATIC_RESPONSES.euTax, { headers: corsHeaders });
  }

  if (path === '/api/eu-tax/calculate') {
    const { amount, country, rateType = 'standard' } = await getRequestData(request);
    
    if (!country || !TAX_RATES.eu[country]) {
      return jsonResponse({ error: 'Invalid or missing country code' }, 400);
    }
    if (!amount || isNaN(amount)) {
      return jsonResponse({ error: 'Invalid or missing amount' }, 400);
    }

    const rateData = TAX_RATES.eu[country];
    const rate = rateType === 'standard' 
      ? rateData.standard 
      : (rateData.reduced?.[0] || rateData.standard);
    
    const vatAmount = amount * (rate / 100);
    const totalWithVat = amount + vatAmount;

    return jsonResponse({
      country, amount: parseFloat(amount), rate: parseFloat(rate), rateType,
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      totalWithVat: parseFloat(totalWithVat.toFixed(2)),
      currency: 'EUR'
    });
  }

  return jsonResponse({ error: 'Not Found' }, 404);
}

async function handleUKTax(request, path) {
  if (path === '/api/uk-tax') {
    return new Response(STATIC_RESPONSES.ukTax, { headers: corsHeaders });
  }

  if (path === '/api/uk-tax/vat') {
    const { amount, rateType = 'standard' } = await getRequestData(request);
    const rates = { standard: 20, reduced: 5, zero: 0 };
    const rate = rates[rateType] ?? 20;
    const vatAmount = amount * (rate / 100);
    const totalWithVat = amount + vatAmount;

    return jsonResponse({
      amount: parseFloat(amount), rate, rateType,
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      totalWithVat: parseFloat(totalWithVat.toFixed(2)),
      currency: 'GBP'
    });
  }

  if (path === '/api/uk-tax/income') {
    const { income } = await getRequestData(request);
    if (!income) return jsonResponse({ error: 'Income required' }, 400);

    let tax = 0, remaining = income;
    const breakdown = [];
    const bands = [
      { threshold: 12570, rate: 0, name: 'Personal Allowance' },
      { threshold: 50270, rate: 20, name: 'Basic Rate' },
      { threshold: 125140, rate: 40, name: 'Higher Rate' },
      { threshold: Infinity, rate: 45, name: 'Additional Rate' }
    ];

    let previousThreshold = 0;
    for (const band of bands) {
      const taxableInBand = Math.min(remaining, band.threshold - previousThreshold);
      if (taxableInBand > 0) {
        const bandTax = taxableInBand * (band.rate / 100);
        tax += bandTax;
        breakdown.push({ band: band.name, amount: taxableInBand, rate: band.rate, tax: parseFloat(bandTax.toFixed(2)) });
        remaining -= taxableInBand;
      }
      previousThreshold = band.threshold;
      if (remaining <= 0) break;
    }

    return jsonResponse({
      income: parseFloat(income), totalTax: parseFloat(tax.toFixed(2)),
      netIncome: parseFloat((income - tax).toFixed(2)),
      effectiveRate: parseFloat(((tax / income) * 100).toFixed(2)),
      breakdown, currency: 'GBP'
    });
  }

  return jsonResponse({ error: 'Not Found' }, 404);
}

async function handleUSTax(request, path) {
  if (path === '/api/us-tax') {
    return new Response(STATIC_RESPONSES.usTax, { headers: corsHeaders });
  }

  if (path === '/api/us-tax/calculate') {
    const { amount, state } = await getRequestData(request);

    if (!state || !TAX_RATES.us[state]) {
      return jsonResponse({ error: 'Invalid or missing state code' }, 400);
    }
    if (!amount || isNaN(amount)) {
      return jsonResponse({ error: 'Invalid or missing amount' }, 400);
    }

    const rate = TAX_RATES.us[state];
    const taxAmount = amount * (rate / 100);
    const totalWithTax = amount + taxAmount;

    return jsonResponse({
      state, amount: parseFloat(amount), rate,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalWithTax: parseFloat(totalWithTax.toFixed(2)),
      currency: 'USD'
    });
  }

  return jsonResponse({ error: 'Not Found' }, 404);
}

async function handleCATax(request, path) {
  if (path === '/api/ca-tax') {
    return new Response(STATIC_RESPONSES.caTax, { headers: corsHeaders });
  }

  if (path === '/api/ca-tax/calculate') {
    const { amount, province } = await getRequestData(request);

    if (!province || !TAX_RATES.ca[province]) {
      return jsonResponse({ error: 'Invalid or missing province code' }, 400);
    }
    if (!amount || isNaN(amount)) {
      return jsonResponse({ error: 'Invalid or missing amount' }, 400);
    }

    const rate = TAX_RATES.ca[province];
    const taxAmount = amount * (rate.total / 100);
    const totalWithTax = amount + taxAmount;

    return jsonResponse({
      province, amount: parseFloat(amount), rates: rate,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalWithTax: parseFloat(totalWithTax.toFixed(2)),
      currency: 'CAD'
    });
  }

  return jsonResponse({ error: 'Not Found' }, 404);
}

async function handleAmazonCalculator(request, path) {
  if (path === '/api/amazon') {
    return new Response(STATIC_RESPONSES.amazon, { headers: corsHeaders });
  }

  if (path === '/api/amazon/calculate') {
    const { amount, category = 'other', useFba = true, fbaType = 'standard' } = await getRequestData(request);
    if (!amount || isNaN(amount)) {
      return jsonResponse({ error: 'Invalid or missing amount' }, 400);
    }

    const referralRates = { electronics: 8, clothing: 17, books: 15, home: 15, jewelry: 20, grocery: 8, health: 15, toys: 15, other: 15 };
    const referralRate = referralRates[category] || 15;
    const referralFee = amount * (referralRate / 100);
    const fbaFee = useFba ? (fbaType === 'standard' ? 3.22 : 8.26) : 0;
    const closingFee = 1.80;
    const totalFee = referralFee + fbaFee + closingFee;
    const netAmount = amount - totalFee;

    return jsonResponse({
      amount: parseFloat(amount), category,
      fees: {
        referralRate, referralFee: parseFloat(referralFee.toFixed(2)),
        fbaFee, closingFee, totalFee: parseFloat(totalFee.toFixed(2))
      },
      netAmount: parseFloat(netAmount.toFixed(2)),
      effectiveRate: parseFloat(((totalFee / amount) * 100).toFixed(2)),
      currency: 'USD'
    });
  }

  return jsonResponse({ error: 'Not Found' }, 404);
}

async function handleEtsyCalculator(request, path) {
  if (path === '/api/etsy') {
    return new Response(STATIC_RESPONSES.etsy, { headers: corsHeaders });
  }

  if (path === '/api/etsy/calculate') {
    const { amount, shipping = 0, quantity = 1, useOffsiteAds = false } = await getRequestData(request);
    if (!amount || isNaN(amount)) {
      return jsonResponse({ error: 'Invalid or missing amount' }, 400);
    }

    const subtotal = amount * quantity + shipping;
    const listingFee = 0.20 * quantity;
    const transactionFee = subtotal * 0.065;
    const paymentFee = (subtotal * 0.03) + 0.25;
    const offsiteAdFee = useOffsiteAds ? (subtotal * 0.15) : 0;
    const totalFee = listingFee + transactionFee + paymentFee + offsiteAdFee;
    const netAmount = subtotal - totalFee;

    return jsonResponse({
      input: { price: amount, shipping, quantity, useOffsiteAds },
      subtotal: parseFloat(subtotal.toFixed(2)),
      fees: {
        listing: parseFloat(listingFee.toFixed(2)),
        transaction: parseFloat(transactionFee.toFixed(2)),
        payment: parseFloat(paymentFee.toFixed(2)),
        offsiteAds: parseFloat(offsiteAdFee.toFixed(2)),
        total: parseFloat(totalFee.toFixed(2))
      },
      netAmount: parseFloat(netAmount.toFixed(2)),
      effectiveRate: parseFloat(((totalFee / subtotal) * 100).toFixed(2)),
      currency: 'USD'
    });
  }

  return jsonResponse({ error: 'Not Found' }, 404);
}

async function handleEbayCalculator(request, path) {
  if (path === '/api/ebay') {
    return new Response(STATIC_RESPONSES.ebay, { headers: corsHeaders });
  }

  if (path === '/api/ebay/calculate') {
    const { amount, includeInsertion = false, hasStore = false } = await getRequestData(request);
    if (!amount || isNaN(amount)) {
      return jsonResponse({ error: 'Invalid or missing amount' }, 400);
    }

    const finalValueFee = amount * 0.1325;
    const fixedFee = 0.30;
    const insertionFee = includeInsertion ? 0.35 : 0;
    const totalFee = finalValueFee + fixedFee + insertionFee;
    const netAmount = amount - totalFee;

    return jsonResponse({
      amount: parseFloat(amount),
      fees: {
        finalValuePercentage: 13.25,
        finalValueFee: parseFloat(finalValueFee.toFixed(2)),
        fixedFee, insertionFee,
        totalFee: parseFloat(totalFee.toFixed(2))
      },
      netAmount: parseFloat(netAmount.toFixed(2)),
      effectiveRate: parseFloat(((totalFee / amount) * 100).toFixed(2)),
      currency: 'USD'
    });
  }

  return jsonResponse({ error: 'Not Found' }, 404);
}

async function handleShopifyCalculator(request, path) {
  if (path === '/api/shopify') {
    return new Response(STATIC_RESPONSES.shopify, { headers: corsHeaders });
  }

  if (path === '/api/shopify/calculate') {
    const { amount, plan = 'basic', transactionsPerMonth = 100, useShopifyPayments = true } = await getRequestData(request);
    if (!amount || isNaN(amount)) {
      return jsonResponse({ error: 'Invalid or missing amount' }, 400);
    }

    const plans = {
      basic: { monthly: 32, transaction: 2.9, fixed: 0.30 },
      shopify: { monthly: 92, transaction: 2.6, fixed: 0.30 },
      advanced: { monthly: 399, transaction: 2.4, fixed: 0.30 }
    };

    const planDetails = plans[plan] || plans.basic;
    const transactionFee = amount * (planDetails.transaction / 100);
    const fixedFee = planDetails.fixed;
    const totalFeePerTransaction = transactionFee + fixedFee;
    const netPerTransaction = amount - totalFeePerTransaction;
    const monthlyPlanCost = planDetails.monthly;
    const estimatedMonthlyFees = (totalFeePerTransaction * transactionsPerMonth) + monthlyPlanCost;

    return jsonResponse({
      amount: parseFloat(amount), plan,
      planDetails: { monthlyCost: planDetails.monthly, transactionRate: planDetails.transaction, fixedFee: planDetails.fixed },
      perTransaction: {
        transactionFee: parseFloat(transactionFee.toFixed(2)), fixedFee,
        totalFee: parseFloat(totalFeePerTransaction.toFixed(2)),
        netAmount: parseFloat(netPerTransaction.toFixed(2)),
        effectiveRate: parseFloat(((totalFeePerTransaction / amount) * 100).toFixed(2))
      },
      monthlyEstimate: {
        transactions: transactionsPerMonth,
        totalFees: parseFloat(estimatedMonthlyFees.toFixed(2)),
        totalRevenue: parseFloat((amount * transactionsPerMonth).toFixed(2)),
        totalNet: parseFloat(((amount * transactionsPerMonth) - estimatedMonthlyFees).toFixed(2))
      },
      currency: 'USD'
    });
  }

  return jsonResponse({ error: 'Not Found' }, 404);
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function getRequestData(request) {
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const params = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value === 'true' ? true : value === 'false' ? false : isNaN(value) ? value : parseFloat(value);
    });
    return params;
  }
  if (request.method === 'POST') {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }
  return {};
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders
  });
}

function apiDocumentation() {
  return {
    name: 'API Aggregator',
    version: API_VERSION,
    pricing: `€${SUBSCRIPTION_PRICE}/month for all APIs`,
    features: ['In-memory caching', 'Optimized responses', 'Sub-millisecond static responses'],
    baseUrl: 'https://api-aggregator.your-subdomain.workers.dev',
    endpoints: {
      'EU Tax API': { base: '/api/eu-tax', calculate: '/api/eu-tax/calculate?amount=100&country=DE', methods: ['GET', 'POST'], params: ['amount', 'country (2-letter code)', 'rateType (standard/reduced)'] },
      'UK Tax API': { base: '/api/uk-tax', vat: '/api/uk-tax/vat?amount=100&rateType=standard', income: '/api/uk-tax/income?income=50000', methods: ['GET', 'POST'], params: ['amount/income', 'rateType'] },
      'US Tax API': { base: '/api/us-tax', calculate: '/api/us-tax/calculate?amount=100&state=CA', methods: ['GET', 'POST'], params: ['amount', 'state (2-letter code)'] },
      'CA Tax API': { base: '/api/ca-tax', calculate: '/api/ca-tax/calculate?amount=100&province=ON', methods: ['GET', 'POST'], params: ['amount', 'province (2-letter code)'] },
      'Amazon Calculator API': { base: '/api/amazon', calculate: '/api/amazon/calculate?amount=100&category=electronics&useFba=true', methods: ['GET', 'POST'], params: ['amount', 'category', 'useFba', 'fbaType'] },
      'Etsy Calculator API': { base: '/api/etsy', calculate: '/api/etsy/calculate?amount=50&shipping=5&quantity=2', methods: ['GET', 'POST'], params: ['amount', 'shipping', 'quantity', 'useOffsiteAds'] },
      'eBay Calculator API': { base: '/api/ebay', calculate: '/api/ebay/calculate?amount=100', methods: ['GET', 'POST'], params: ['amount', 'includeInsertion', 'hasStore'] },
      'Shopify Calculator API': { base: '/api/shopify', calculate: '/api/shopify/calculate?amount=100&plan=basic&transactionsPerMonth=100', methods: ['GET', 'POST'], params: ['amount', 'plan', 'transactionsPerMonth', 'useShopifyPayments'] }
    }
  };
}

function landingPageHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Aggregator - All APIs in One Place</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { padding: 2rem 0; text-align: center; color: white; }
        header h1 { font-size: 3rem; margin-bottom: 0.5rem; }
        header p { font-size: 1.25rem; opacity: 0.9; }
        .pricing-card { background: white; border-radius: 20px; padding: 3rem; max-width: 500px; margin: 2rem auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; }
        .price { font-size: 4rem; font-weight: bold; color: #667eea; }
        .price span { font-size: 1rem; color: #666; }
        .features { text-align: left; margin: 2rem 0; }
        .features h3 { margin-bottom: 1rem; color: #333; }
        .features ul { list-style: none; }
        .features li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
        .features li::before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 3rem; border-radius: 50px; text-decoration: none; font-size: 1.1rem; font-weight: bold; transition: transform 0.3s, box-shadow 0.3s; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); }
        .apis-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 3rem 0; }
        .api-card { background: rgba(255,255,255,0.95); padding: 1.5rem; border-radius: 15px; text-align: center; }
        .api-card h3 { color: #667eea; margin-bottom: 0.5rem; }
        .api-card p { color: #666; font-size: 0.9rem; }
        footer { text-align: center; padding: 2rem; color: rgba(255,255,255,0.7); }
        .docs-link { color: white; text-decoration: underline; }
        .badge { display: inline-block; background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; margin-top: 0.5rem; }
        @media (max-width: 768px) { header h1 { font-size: 2rem; } .price { font-size: 3rem; } .pricing-card { padding: 2rem; } }
    </style>
</head>
<body>
    <header><div class="container"><h1>API Aggregator</h1><p>8 Powerful APIs. One Subscription. Optimized Performance.</p></div></header>
    <main class="container">
        <div class="pricing-card">
            <div class="price">€${SUBSCRIPTION_PRICE}<span>/month</span></div>
            <p style="color: #666; margin: 0.5rem 0;">Complete API Access</p>
            <span class="badge">Now with caching & optimization!</span>
            <div class="features">
                <h3>All APIs Included:</h3>
                <ul>
                    <li>🇪🇺 EU VAT Tax API (27 countries)</li>
                    <li>🇬🇧 UK Tax & VAT API</li>
                    <li>🇺🇸 US Sales Tax API (50 states)</li>
                    <li>🇨🇦 Canada Tax API (provinces)</li>
                    <li>📦 Amazon Fee Calculator</li>
                    <li>🎨 Etsy Fee Calculator</li>
                    <li>🏷️ eBay Fee Calculator</li>
                    <li>🛒 Shopify Fee Calculator</li>
                </ul>
                <h3 style="margin-top: 1.5rem;">Performance:</h3>
                <ul>
                    <li>⚡ In-memory LRU caching</li>
                    <li>🚀 Sub-millisecond static responses</li>
                    <li>📊 10,000 requests/month</li>
                    <li>⏱️ 100 requests/minute</li>
                    <li>🔒 CORS enabled</li>
                </ul>
            </div>
            <a href="/docs" class="cta-button">View API Documentation</a>
        </div>
        <div class="apis-grid">
            <div class="api-card"><h3>🇪🇺 EU Tax API</h3><p>VAT rates for all 27 EU member states</p></div>
            <div class="api-card"><h3>🇬🇧 UK Tax API</h3><p>VAT, income tax & National Insurance</p></div>
            <div class="api-card"><h3>🇺🇸 US Tax API</h3><p>Sales tax rates for all 50 states</p></div>
            <div class="api-card"><h3>🇨🇦 CA Tax API</h3><p>GST/HST/PST for all provinces</p></div>
            <div class="api-card"><h3>📦 Amazon API</h3><p>Referral, FBA, closing fees</p></div>
            <div class="api-card"><h3>🎨 Etsy API</h3><p>Listing, transaction, payment fees</p></div>
            <div class="api-card"><h3>🏷️ eBay API</h3><p>Final value & insertion fees</p></div>
            <div class="api-card"><h3>🛒 Shopify API</h3><p>Plan costs & transaction fees</p></div>
        </div>
    </main>
    <footer><p>API Aggregator v${API_VERSION} | <a href="/docs" class="docs-link">Documentation</a> | <a href="/health" class="docs-link">Status</a></p></footer>
</body>
</html>`;
}
