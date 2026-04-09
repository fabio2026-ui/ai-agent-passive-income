/**
 * EU CrossBorder API - VAT Calculator
 * 支持主要欧盟国家VAT税率查询和计算
 */

// 2025年欧盟国家标准VAT税率
const VAT_RATES = {
  // 主要国家（Tier 1）
  DE: { name: "Germany", rate: 0.19, currency: "EUR" },           // 德国 19%
  FR: { name: "France", rate: 0.20, currency: "EUR" },            // 法国 20%
  IT: { name: "Italy", rate: 0.22, currency: "EUR" },             // 意大利 22%
  ES: { name: "Spain", rate: 0.21, currency: "EUR" },             // 西班牙 21%
  NL: { name: "Netherlands", rate: 0.21, currency: "EUR" },       // 荷兰 21%
  
  // 其他主要国家（Tier 2）
  BE: { name: "Belgium", rate: 0.21, currency: "EUR" },           // 比利时 21%
  AT: { name: "Austria", rate: 0.20, currency: "EUR" },           // 奥地利 20%
  PT: { name: "Portugal", rate: 0.23, currency: "EUR" },          // 葡萄牙 23%
  PL: { name: "Poland", rate: 0.23, currency: "PLN" },            // 波兰 23%
  SE: { name: "Sweden", rate: 0.25, currency: "SEK" },            // 瑞典 25%
  DK: { name: "Denmark", rate: 0.25, currency: "DKK" },           // 丹麦 25%
  FI: { name: "Finland", rate: 0.25, currency: "EUR" },           // 芬兰 25%
  IE: { name: "Ireland", rate: 0.23, currency: "EUR" },           // 爱尔兰 23%
  GR: { name: "Greece", rate: 0.24, currency: "EUR" },            // 希腊 24%
  CZ: { name: "Czech Republic", rate: 0.21, currency: "CZK" },    // 捷克 21%
  HU: { name: "Hungary", rate: 0.27, currency: "HUF" },           // 匈牙利 27%
  RO: { name: "Romania", rate: 0.19, currency: "RON" },           // 罗马尼亚 19%
  BG: { name: "Bulgaria", rate: 0.20, currency: "BGN" },          // 保加利亚 20%
  HR: { name: "Croatia", rate: 0.25, currency: "EUR" },           // 克罗地亚 25%
  SK: { name: "Slovakia", rate: 0.20, currency: "EUR" },          // 斯洛伐克 20%
  SI: { name: "Slovenia", rate: 0.22, currency: "EUR" },          // 斯洛文尼亚 22%
  LT: { name: "Lithuania", rate: 0.21, currency: "EUR" },         // 立陶宛 21%
  LV: { name: "Latvia", rate: 0.21, currency: "EUR" },            // 拉脱维亚 21%
  EE: { name: "Estonia", rate: 0.22, currency: "EUR" },           // 爱沙尼亚 22%
  CY: { name: "Cyprus", rate: 0.19, currency: "EUR" },            // 塞浦路斯 19%
  LU: { name: "Luxembourg", rate: 0.17, currency: "EUR" },        // 卢森堡 17%
  MT: { name: "Malta", rate: 0.18, currency: "EUR" },             // 马耳他 18%
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API Routes
      if (path === '/api/vat/calculate' || path === '/calculate') {
        return handleCalculate(request);
      }
      
      if (path === '/api/vat/rates' || path === '/rates') {
        return handleRates();
      }
      
      if (path === '/api/vat/countries' || path === '/countries') {
        return handleCountries();
      }
      
      if (path === '/health' || path === '/ping') {
        return jsonResponse({ status: 'ok', service: 'EU CrossBorder API', version: '1.0.0' });
      }

      // Root - API documentation
      if (path === '/' || path === '') {
        return handleDocs();
      }

      // 404 for unknown paths
      return jsonResponse({ error: 'Not found', path }, 404);

    } catch (error) {
      return jsonResponse({ 
        error: 'Internal server error', 
        message: error.message 
      }, 500);
    }
  }
};

/**
 * VAT计算处理
 * 参数: country (ISO 2位代码), amount (金额), type (gross|net, 可选，默认net)
 */
async function handleCalculate(request) {
  const url = new URL(request.url);
  
  // 支持 GET 和 POST
  let params;
  if (request.method === 'POST') {
    try {
      params = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }
  } else {
    params = Object.fromEntries(url.searchParams);
  }

  const { country, amount, type = 'net' } = params;

  // 验证参数
  if (!country) {
    return jsonResponse({ error: 'Missing required parameter: country' }, 400);
  }
  if (!amount || isNaN(parseFloat(amount))) {
    return jsonResponse({ error: 'Missing or invalid parameter: amount' }, 400);
  }

  const countryCode = country.toUpperCase();
  const countryData = VAT_RATES[countryCode];

  if (!countryData) {
    return jsonResponse({ 
      error: 'Invalid country code', 
      country: countryCode,
      supportedCountries: Object.keys(VAT_RATES)
    }, 400);
  }

  const inputAmount = parseFloat(amount);
  const rate = countryData.rate;
  
  let result;
  
  if (type === 'gross') {
    // 含税价 -> 计算净价和税额
    const netAmount = inputAmount / (1 + rate);
    const vatAmount = inputAmount - netAmount;
    result = {
      country: countryCode,
      countryName: countryData.name,
      currency: countryData.currency,
      rate: rate,
      ratePercent: (rate * 100).toFixed(0) + '%',
      inputType: 'gross',
      inputAmount: round(inputAmount),
      netAmount: round(netAmount),
      vatAmount: round(vatAmount),
      grossAmount: round(inputAmount)
    };
  } else {
    // 净价 -> 计算税额和总价
    const vatAmount = inputAmount * rate;
    const grossAmount = inputAmount + vatAmount;
    result = {
      country: countryCode,
      countryName: countryData.name,
      currency: countryData.currency,
      rate: rate,
      ratePercent: (rate * 100).toFixed(0) + '%',
      inputType: 'net',
      inputAmount: round(inputAmount),
      netAmount: round(inputAmount),
      vatAmount: round(vatAmount),
      grossAmount: round(grossAmount)
    };
  }

  return jsonResponse({
    success: true,
    data: result
  });
}

/**
 * 获取所有税率
 */
function handleRates() {
  const rates = Object.entries(VAT_RATES).map(([code, data]) => ({
    code,
    name: data.name,
    rate: data.rate,
    ratePercent: (data.rate * 100).toFixed(0) + '%',
    currency: data.currency
  }));

  return jsonResponse({
    success: true,
    count: rates.length,
    data: rates
  });
}

/**
 * 获取国家列表
 */
function handleCountries() {
  const countries = Object.entries(VAT_RATES).map(([code, data]) => ({
    code,
    name: data.name,
    currency: data.currency
  }));

  return jsonResponse({
    success: true,
    count: countries.length,
    data: countries
  });
}

/**
 * API文档页面
 */
function handleDocs() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EU CrossBorder API - VAT Calculator</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f7fa;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header h1 {
      color: #1a56db;
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .header p {
      color: #666;
      font-size: 1.1em;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .card h2 {
      color: #1a56db;
      margin-bottom: 16px;
      font-size: 1.4em;
    }
    .endpoint {
      background: #1a1a2e;
      color: #00d4aa;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', monospace;
      margin: 12px 0;
      overflow-x: auto;
    }
    .method {
      color: #ffd700;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 500;
    }
      background: #dbeafe;
      color: #1e40af;
    }
    .badge-post {
      background: #dcfce7;
      color: #166534;
    }
    .badge-required {
      background: #fee2e2;
      color: #991b1b;
    }
    .badge-optional {
      background: #f3f4f6;
      color: #374151;
    }
    code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9em;
    }
    .example {
      background: #f8fafc;
      border-left: 4px solid #1a56db;
      padding: 16px;
      margin: 16px 0;
      border-radius: 0 8px 8px 0;
    }
    .footer {
      text-align: center;
      color: #666;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .test-tool {
      background: #ecfdf5;
      border: 2px solid #10b981;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .test-tool h3 {
      color: #047857;
      margin-bottom: 12px;
    }
    input, select {
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1em;
      margin-right: 8px;
    }
    button {
      background: #1a56db;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1em;
    }
    button:hover {
      background: #1e40af;
    }
    #result {
      margin-top: 16px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      display: none;
    }
    #result.show {
      display: block;
    }
    pre {
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🇪🇺 EU CrossBorder API</h1>
    <p>Simple, fast VAT calculation for all EU member states</p>
  </div>

  <div class="card">
    <h2>📊 Quick Test</h2>
    <div class="test-tool">
      <div>
        <select id="country">
          <option value="DE">Germany (19%)</option>
          <option value="FR">France (20%)</option>
          <option value="IT">Italy (22%)</option>
          <option value="ES">Spain (21%)</option>
          <option value="NL">Netherlands (21%)</option>
          <option value="BE">Belgium (21%)</option>
          <option value="AT">Austria (20%)</option>
          <option value="PT">Portugal (23%)</option>
          <option value="SE">Sweden (25%)</option>
          <option value="DK">Denmark (25%)</option>
        </select>
        <input type="number" id="amount" placeholder="Amount" value="100" style="width: 120px;">
        <select id="type">
          <option value="net">Net amount</option>
          <option value="gross">Gross amount</option>
        </select>
        <button onclick="calculate()">Calculate VAT</button>
      </div>
      <div id="result"></div>
    </div>
  </div>

  <div class="card">
    <h2>🔧 API Endpoints</h2>
    
    <h3 style="margin-top: 24px;">Calculate VAT</h3>
    <div class="endpoint"><span class="method">GET</span> /api/vat/calculate?country={code}&amount={value}&type={net|gross}</div>
    <div class="endpoint"><span class="method">POST</span> /api/vat/calculate</div>
    
    <table>
      <tr>
        <th>Parameter</th>
        <th>Type</th>
        <th>Required</th>
        <th>Description</th>
      </tr>
      <tr>
        <td><code>country</code></td>
        <td>string</td>
        <td><span class="badge badge-required">Required</span></td>
        <td>2-letter country code (e.g., DE, FR, IT)</td>
      </tr>
      <tr>
        <td><code>amount</code></td>
        <td>number</td>
        <td><span class="badge badge-required">Required</span></td>
        <td>Amount to calculate VAT for</td>
      </tr>
      <tr>
        <td><code>type</code></td>
        <td>string</td>
        <td><span class="badge badge-optional">Optional</span></td>
        <td>"net" (default) or "gross"</td>
      </tr>
    </table>

    <div class="example">
      <strong>Example Request:</strong><br>
      <code>GET /api/vat/calculate?country=DE&amount=100&type=net</code>
    </div>

    <h3 style="margin-top: 24px;">Get All VAT Rates</h3>
    <div class="endpoint"><span class="method">GET</span> /api/vat/rates</div>
    
    <h3 style="margin-top: 24px;">Get Supported Countries</h3>
    <div class="endpoint"><span class="method">GET</span> /api/vat/countries</div>
    
    <h3 style="margin-top: 24px;">Health Check</h3>
    <div class="endpoint"><span class="method">GET</span> /health</div>
  </div>

  <div class="card">
    <h2>📋 Supported Countries</h2>
    <table>
      <tr>
        <th>Code</th>
        <th>Country</th>
        <th>Standard VAT</th>
        <th>Currency</th>
      </tr>
      <tr><td>DE</td><td>Germany</td><td>19%</td><td>EUR</td></tr>
      <tr><td>FR</td><td>France</td><td>20%</td><td>EUR</td></tr>
      <tr><td>IT</td><td>Italy</td><td>22%</td><td>EUR</td></tr>
      <tr><td>ES</td><td>Spain</td><td>21%</td><td>EUR</td></tr>
      <tr><td>NL</td><td>Netherlands</td><td>21%</td><td>EUR</td></tr>
      <tr><td>BE</td><td>Belgium</td><td>21%</td><td>EUR</td></tr>
      <tr><td>AT</td><td>Austria</td><td>20%</td><td>EUR</td></tr>
      <tr><td>PT</td><td>Portugal</td><td>23%</td><td>EUR</td></tr>
      <tr><td>PL</td><td>Poland</td><td>23%</td><td>PLN</td></tr>
      <tr><td>SE</td><td>Sweden</td><td>25%</td><td>SEK</td></tr>
      <tr><td>DK</td><td>Denmark</td><td>25%</td><td>DKK</td></tr>
      <tr><td>FI</td><td>Finland</td><td>25%</td><td>EUR</td></tr>
      <tr><td>IE</td><td>Ireland</td><td>23%</td><td>EUR</td></tr>
      <tr><td>GR</td><td>Greece</td><td>24%</td><td>EUR</td></tr>
      <tr><td>CZ</td><td>Czech Republic</td><td>21%</td><td>CZK</td></tr>
      <tr><td colspan="4" style="text-align:center;color:#666;">...and 12 more EU member states</td></tr>
    </table>
  </div>

  <div class="card">
    <h2>💡 Example Response</h2>
    <div class="endpoint" style="color: #fff;">
{
  "success": true,
  "data": {
    "country": "DE",
    "countryName": "Germany",
    "currency": "EUR",
    "rate": 0.19,
    "ratePercent": "19%",
    "inputType": "net",
    "inputAmount": 100.00,
    "netAmount": 100.00,
    "vatAmount": 19.00,
    "grossAmount": 119.00
  }
}
    </div>
  </div>

  <div class="footer">
    <p>© 2025 EU CrossBorder API · All 27 EU member states supported</p>
  </div>

  <script>
    async function calculate() {
      const country = document.getElementById('country').value;
      const amount = document.getElementById('amount').value;
      const type = document.getElementById('type').value;
      const resultDiv = document.getElementById('result');
      
      resultDiv.innerHTML = '<p>Calculating...</p>';
      resultDiv.classList.add('show');
      
      try {
        const response = await fetch(\`/api/vat/calculate?country=\${country}&amount=\${amount}&type=\${type}\`);
        const data = await response.json();
        
        if (data.success) {
          const d = data.data;
          resultDiv.innerHTML = \`
            <h4 style="margin-bottom:12px;color:#047857;">✓ Calculation Result</h4>
            <p><strong>Country:</strong> \${d.countryName} (\${d.country})</p>
            <p><strong>VAT Rate:</strong> \${d.ratePercent}</p>
            <p><strong>Net Amount:</strong> \${d.netAmount.toFixed(2)} \${d.currency}</p>
            <p><strong>VAT Amount:</strong> \${d.vatAmount.toFixed(2)} \${d.currency}</p>
            <p><strong>Gross Amount:</strong> \${d.grossAmount.toFixed(2)} \${d.currency}</p>
            <hr style="margin:12px 0;border:none;border-top:1px solid #ddd;">
            <pre style="font-size:0.85em;">\${JSON.stringify(data, null, 2)}</pre>
          \`;
        } else {
          resultDiv.innerHTML = \`<p style="color:#dc2626;">Error: \${data.error}</p>\`;
        }
      } catch (err) {
        resultDiv.innerHTML = \`<p style="color:#dc2626;">Error: \${err.message}</p>\`;
      }
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      ...corsHeaders
    }
  });
}

/**
 * JSON响应辅助函数
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

/**
 * 数值四舍五入到2位小数
 */
function round(num) {
  return Math.round(num * 100) / 100;
}
