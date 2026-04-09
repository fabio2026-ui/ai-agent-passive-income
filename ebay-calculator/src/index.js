/**
 * eBay Fee Calculator API
 * Calculates eBay fees: 13.25% + $0.30 per transaction
 */

// CORS headers for API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check endpoint
    if (path === '/' || path === '/health') {
      return jsonResponse({
        status: 'ok',
        service: 'eBay Fee Calculator API',
        version: '1.0.0',
        fees: {
          percentage: 13.25,
          fixedFee: 0.30,
          currency: 'USD'
        }
      });
    }

    // Calculate fee endpoint
    if (path === '/calculate' || path === '/api/calculate') {
      return handleCalculate(request);
    }

    // Bulk calculate endpoint
    if (path === '/calculate/bulk' || path === '/api/calculate/bulk') {
      return handleBulkCalculate(request);
    }

    // 404 for unknown paths
    return jsonResponse({
      error: 'Not Found',
      message: 'Use /calculate?amount=100 or POST to /calculate with JSON body'
    }, 404);
  }
};

/**
 * Handle single fee calculation
 */
async function handleCalculate(request) {
  let amount = null;
  let includeFixedFee = true;

  if (request.method === 'GET') {
    const url = new URL(request.url);
    amount = parseFloat(url.searchParams.get('amount'));
    const fixedParam = url.searchParams.get('includeFixedFee');
    if (fixedParam !== null) {
      includeFixedFee = fixedParam !== 'false';
    }
  } else if (request.method === 'POST') {
    try {
      const body = await request.json();
      amount = parseFloat(body.amount);
      if (body.includeFixedFee !== undefined) {
        includeFixedFee = body.includeFixedFee !== false;
      }
    } catch (e) {
      return jsonResponse({
        error: 'Invalid JSON',
        message: 'Please provide a valid JSON body with "amount" field'
      }, 400);
    }
  }

  if (isNaN(amount) || amount < 0) {
    return jsonResponse({
      error: 'Invalid amount',
      message: 'Please provide a valid positive number for amount'
    }, 400);
  }

  const result = calculateEbayFees(amount, includeFixedFee);
  return jsonResponse(result);
}

/**
 * Handle bulk fee calculation
 */
async function handleBulkCalculate(request) {
  if (request.method !== 'POST') {
    return jsonResponse({
      error: 'Method Not Allowed',
      message: 'Bulk calculation requires POST method'
    }, 405);
  }

  try {
    const body = await request.json();
    const amounts = body.amounts;
    const includeFixedFee = body.includeFixedFee !== false;

    if (!Array.isArray(amounts)) {
      return jsonResponse({
        error: 'Invalid input',
        message: 'Please provide an array of amounts in "amounts" field'
      }, 400);
    }

    const results = amounts.map((item, index) => {
      const amount = typeof item === 'number' ? item : parseFloat(item);
      if (isNaN(amount) || amount < 0) {
        return {
          index,
          amount: item,
          error: 'Invalid amount'
        };
      }
      return calculateEbayFees(amount, includeFixedFee);
    });

    return jsonResponse({
      count: results.length,
      includeFixedFee,
      results
    });
  } catch (e) {
    return jsonResponse({
      error: 'Invalid JSON',
      message: 'Please provide a valid JSON body'
    }, 400);
  }
}

/**
 * Calculate eBay fees
 * Formula: fee = (amount * 0.1325) + 0.30
 * Net = amount - fee
 */
function calculateEbayFees(amount, includeFixedFee = true) {
  const percentageRate = 0.1325; // 13.25%
  const fixedFee = 0.30; // $0.30

  const percentageFee = amount * percentageRate;
  const totalFee = includeFixedFee ? percentageFee + fixedFee : percentageFee;
  const netAmount = amount - totalFee;

  return {
    input: {
      amount: parseFloat(amount.toFixed(2)),
      includeFixedFee
    },
    fees: {
      percentage: 13.25,
      percentageFee: parseFloat(percentageFee.toFixed(2)),
      fixedFee: includeFixedFee ? fixedFee : 0,
      totalFee: parseFloat(totalFee.toFixed(2))
    },
    result: {
      grossAmount: parseFloat(amount.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
      effectiveRate: parseFloat(((totalFee / amount) * 100).toFixed(2))
    }
  };
}

/**
 * Helper to create JSON response
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: corsHeaders
  });
}
