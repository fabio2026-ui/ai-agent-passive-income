import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

// Development server for local testing
// Uses in-memory storage instead of D1/KV

const app = new Hono();

// Enable CORS
app.use('*', cors());

// In-memory storage
const users = new Map();
const alerts = new Map();
const alertEmails = new Map(); // email -> Set of alert IDs

// Supported currencies
const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP'];

// Get exchange rates from Frankfurter API (free, no key needed)
async function getExchangeRates() {
  const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,GBP');
  if (!response.ok) throw new Error('Failed to fetch rates');
  const data = await response.json();
  return {
    base: data.base,
    rates: data.rates,
    timestamp: Date.now(),
  };
}

// Get or create user
function getOrCreateUser(email) {
  if (!users.has(email)) {
    users.set(email, {
      email,
      tier: 'free',
      alertCount: 0,
      createdAt: new Date().toISOString(),
    });
    alertEmails.set(email, new Set());
  }
  return users.get(email);
}

// Routes
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mode: 'development',
    users: users.size,
    totalAlerts: alerts.size,
  });
});

app.get('/api/rates', async (c) => {
  try {
    const rates = await getExchangeRates();
    return c.json({
      base: rates.base,
      rates: rates.rates,
      timestamp: new Date(rates.timestamp).toISOString(),
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch rates' }, 500);
  }
});

app.post('/api/subscribe', async (c) => {
  const body = await c.req.json();
  
  // Validate
  if (!body.email?.includes('@')) {
    return c.json({ error: 'Valid email required' }, 400);
  }
  if (!SUPPORTED_CURRENCIES.includes(body.currency)) {
    return c.json({ error: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}` }, 400);
  }
  if (!['above', 'below'].includes(body.condition)) {
    return c.json({ error: 'Condition must be "above" or "below"' }, 400);
  }
  if (typeof body.targetRate !== 'number' || body.targetRate <= 0) {
    return c.json({ error: 'Target rate must be positive' }, 400);
  }

  const email = body.email.toLowerCase();
  const user = getOrCreateUser(email);

  // Check tier limit
  if (user.tier === 'free' && user.alertCount >= 3) {
    return c.json({
      error: 'Free tier limit reached. Upgrade to Pro for unlimited alerts.',
      upgradeUrl: '/api/upgrade',
      currentAlerts: user.alertCount,
      maxAlerts: 3,
    }, 403);
  }

  // Create alert
  const alertId = crypto.randomUUID();
  const alert = {
    id: alertId,
    email,
    currency: body.currency,
    targetRate: body.targetRate,
    condition: body.condition,
    baseCurrency: 'USD',
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  alerts.set(alertId, alert);
  alertEmails.get(email).add(alertId);
  user.alertCount++;

  // Simulate email
  console.log(`📧 [DEV] Confirmation email would be sent to ${email}`);
  console.log(`   Alert: ${body.currency} ${body.condition} ${body.targetRate}`);

  return c.json({
    success: true,
    alert: {
      id: alert.id,
      currency: alert.currency,
      targetRate: alert.targetRate,
      condition: alert.condition,
    },
    tier: user.tier,
    alertsUsed: user.alertCount,
    alertsRemaining: user.tier === 'free' ? 3 - user.alertCount : 'unlimited',
  });
});

app.get('/api/alerts', async (c) => {
  const email = c.req.query('email')?.toLowerCase();
  if (!email) return c.json({ error: 'Email required' }, 400);

  const user = users.get(email);
  const userAlertIds = alertEmails.get(email) || new Set();
  const userAlerts = Array.from(userAlertIds)
    .map(id => alerts.get(id))
    .filter(a => a?.isActive);

  return c.json({
    alerts: userAlerts,
    tier: user?.tier || 'free',
    alertCount: user?.alertCount || 0,
    maxAlerts: user?.tier === 'pro' ? 'unlimited' : 3,
  });
});

app.post('/api/unsubscribe', async (c) => {
  const body = await c.req.json();
  if (!body.email || !body.alertId) {
    return c.json({ error: 'Email and alertId required' }, 400);
  }

  const email = body.email.toLowerCase();
  const alert = alerts.get(body.alertId);

  if (!alert || alert.email !== email) {
    return c.json({ error: 'Alert not found' }, 404);
  }

  alerts.delete(body.alertId);
  alertEmails.get(email)?.delete(body.alertId);

  const user = users.get(email);
  if (user) user.alertCount = Math.max(0, user.alertCount - 1);

  return c.json({ success: true, message: 'Alert removed' });
});

app.post('/api/upgrade', async (c) => {
  const body = await c.req.json();
  if (!body.email) return c.json({ error: 'Email required' }, 400);

  const email = body.email.toLowerCase();
  const user = getOrCreateUser(email);
  user.tier = 'pro';

  console.log(`⭐ [DEV] User ${email} upgraded to Pro`);

  return c.json({
    success: true,
    message: 'Upgraded to Pro tier',
    tier: 'pro',
    price: '€9/month',
  });
});

// Serve the HTML UI
app.get('/', async (c) => {
  const html = await Bun.file('./src/index.ts').text();
  // Extract and serve just the HTML UI portion
  const uiMatch = html.match(/function getHTMLUI\(\): string \{([\s\S]*?)\n\}/);
  if (uiMatch) {
    // Extract the template literal content
    const templateContent = uiMatch[1];
    // This is a simplified approach - in production we'd have a separate HTML file
  }
  
  // Return the embedded UI
  return c.html(getHTMLUI());
});

function getHTMLUI() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Currency Exchange Rate Monitor</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    header { text-align: center; color: white; padding: 40px 20px; }
    header h1 { font-size: 2.5rem; margin-bottom: 10px; }
    header p { font-size: 1.1rem; opacity: 0.9; }
    .card {
      background: white;
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .card h2 { color: #333; margin-bottom: 20px; font-size: 1.5rem; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; color: #555; font-weight: 500; }
    input, select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    input:focus, select:focus { outline: none; border-color: #667eea; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    @media (max-width: 600px) { .row { grid-template-columns: 1fr; } }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4); }
    button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .rates-display { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px; }
    @media (max-width: 600px) { .rates-display { grid-template-columns: 1fr; } }
    .rate-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }
    .rate-card h3 { font-size: 0.9rem; opacity: 0.8; margin-bottom: 5px; }
    .rate-card .value { font-size: 1.8rem; font-weight: bold; }
    .pricing { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 600px) { .pricing { grid-template-columns: 1fr; } }
    .price-card { border: 2px solid #e0e0e0; border-radius: 12px; padding: 25px; text-align: center; }
    .price-card.pro { border-color: #667eea; background: #f8f9ff; }
    .price-card h3 { font-size: 1.3rem; margin-bottom: 10px; }
    .price { font-size: 2rem; font-weight: bold; color: #667eea; margin: 15px 0; }
    .price-card.free .price { color: #28a745; }
    .price-card ul { list-style: none; text-align: left; margin: 20px 0; }
    .price-card li { padding: 8px 0; color: #555; }
    .price-card li::before { content: "✓ "; color: #28a745; font-weight: bold; }
    .alert-list { margin-top: 20px; }
    .alert-item {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px 20px;
      margin-bottom: 10px;
      border-radius: 0 8px 8px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .alert-item button { padding: 6px 12px; font-size: 0.85rem; }
    .message {
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: none;
    }
    .message.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .message.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .dev-badge {
      display: inline-block;
      background: #ffc107;
      color: #000;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: bold;
      margin-left: 10px;
    }
    footer { text-align: center; padding: 40px 20px; color: white; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>💱 Currency Exchange Rate Monitor <span class="dev-badge">DEV MODE</span></h1>
      <p>Get email alerts when your target exchange rates are reached</p>
    </header>

    <div class="card">
      <h2>📊 Current Exchange Rates (USD Base)</h2>
      <div class="rates-display" id="rates">
        <div class="rate-card"><h3>EUR</h3><div class="value">Loading...</div></div>
        <div class="rate-card"><h3>GBP</h3><div class="value">Loading...</div></div>
        <div class="rate-card"><h3>USD</h3><div class="value">1.00</div></div>
      </div>
    </div>

    <div class="card">
      <h2>🔔 Set Up an Alert</h2>
      <div id="formMessage" class="message"></div>
      <form id="alertForm">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" required placeholder="you@example.com">
        </div>
        <div class="row">
          <div class="form-group">
            <label for="currency">Currency</label>
            <select id="currency" required>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
          </div>
          <div class="form-group">
            <label for="condition">Condition</label>
            <select id="condition" required>
              <option value="above">Goes Above</option>
              <option value="below">Goes Below</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="targetRate">Target Rate (vs USD)</label>
          <input type="number" id="targetRate" step="0.0001" min="0.0001" required placeholder="e.g., 0.92">
        </div>
        <button type="submit">Create Alert</button>
      </form>
    </div>

    <div class="card">
      <h2>📋 Your Alerts</h2>
      <div class="form-group">
        <input type="email" id="viewEmail" placeholder="Enter your email to view alerts">
        <button onclick="loadAlerts()" style="margin-top: 10px;">View My Alerts</button>
      </div>
      <div class="alert-list" id="alertList"></div>
    </div>

    <div class="card">
      <h2>💎 Pricing Plans</h2>
      <div class="pricing">
        <div class="price-card free">
          <h3>Free Tier</h3>
          <div class="price">€0</div>
          <ul>
            <li>Up to 3 active alerts</li>
            <li>Daily rate checks</li>
            <li>Email notifications</li>
            <li>EUR, USD, GBP support</li>
          </ul>
          <button disabled style="opacity: 0.5;">Current Plan</button>
        </div>
        <div class="price-card pro">
          <h3>Pro Tier</h3>
          <div class="price">€9<span style="font-size: 1rem; color: #666;">/month</span></div>
          <ul>
            <li>Unlimited alerts</li>
            <li>Hourly rate checks</li>
            <li>Priority email delivery</li>
            <li>All currencies supported</li>
            <li>API access</li>
          </ul>
          <button onclick="upgradeToPro()">Upgrade Now</button>
        </div>
      </div>
    </div>

    <footer>
      <p>Currency Exchange Rate Monitor © 2024</p>
      <p>Built with Cloudflare Workers | <a href="/health" style="color: white;">Health Check</a></p>
    </footer>
  </div>

  <script>
    async function loadRates() {
      try {
        const res = await fetch('/api/rates');
        const data = await res.json();
        const ratesDiv = document.getElementById('rates');
        ratesDiv.innerHTML = `
          <div class="rate-card"><h3>EUR</h3><div class="value">${data.rates.EUR?.toFixed(4) || 'N/A'}</div></div>
          <div class="rate-card"><h3>GBP</h3><div class="value">${data.rates.GBP?.toFixed(4) || 'N/A'}</div></div>
          <div class="rate-card"><h3>USD</h3><div class="value">1.0000</div></div>
        `;
      } catch (err) {
        console.error('Failed to load rates:', err);
      }
    }

    document.getElementById('alertForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('formMessage');
      msg.style.display = 'none';

      const body = {
        email: document.getElementById('email').value,
        currency: document.getElementById('currency').value,
        condition: document.getElementById('condition').value,
        targetRate: parseFloat(document.getElementById('targetRate').value)
      };

      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();

        if (res.ok) {
          msg.className = 'message success';
          msg.textContent = `✓ Alert created! You have ${data.alertsRemaining} alert(s) remaining on the free tier.`;
          document.getElementById('alertForm').reset();
        } else {
          msg.className = 'message error';
          msg.textContent = data.error || 'Failed to create alert';
        }
        msg.style.display = 'block';
      } catch (err) {
        msg.className = 'message error';
        msg.textContent = 'Network error. Please try again.';
        msg.style.display = 'block';
      }
    });

    async function loadAlerts() {
      const email = document.getElementById('viewEmail').value;
      if (!email) return alert('Please enter your email');

      try {
        const res = await fetch(`/api/alerts?email=${encodeURIComponent(email)}`);
        const data = await res.json();

        const list = document.getElementById('alertList');
        if (data.alerts.length === 0) {
          list.innerHTML = '<p style="color: #666; text-align: center;">No active alerts found.</p>';
          return;
        }

        list.innerHTML = data.alerts.map(a => `
          <div class="alert-item">
            <div>
              <strong>${a.currency}</strong> ${a.condition} ${a.targetRate}
              <small style="color: #666; display: block;">Created: ${new Date(a.createdAt).toLocaleDateString()}</small>
            </div>
            <button onclick="deleteAlert('${a.id}', '${email}')">Delete</button>
          </div>
        `).join('');
      } catch (err) {
        alert('Failed to load alerts');
      }
    }

    async function deleteAlert(alertId, email) {
      if (!confirm('Delete this alert?')) return;

      try {
        const res = await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, alertId })
        });

        if (res.ok) {
          loadAlerts();
        } else {
          alert('Failed to delete alert');
        }
      } catch (err) {
        alert('Network error');
      }
    }

    async function upgradeToPro() {
      const email = document.getElementById('email').value || document.getElementById('viewEmail').value;
      if (!email) {
        alert('Please enter your email in one of the forms above first');
        return;
      }

      try {
        const res = await fetch('/api/upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (res.ok) {
          alert('✓ Upgraded to Pro! You now have unlimited alerts.');
        } else {
          alert(data.error || 'Upgrade failed');
        }
      } catch (err) {
        alert('Network error');
      }
    }

    loadRates();
    setInterval(loadRates, 60000); // Refresh rates every minute
  </script>
</body>
</html>`;
}

console.log('🚀 Starting Currency Monitor Development Server...');
console.log('📍 http://localhost:3000');
console.log('');

serve({
  fetch: app.fetch,
  port: 3000,
});

// Simulate cron job every minute for testing
setInterval(async () => {
  console.log('\n⏰ [CRON] Checking rates and sending alerts...');
  try {
    const rates = await getExchangeRates();
    let triggered = 0;
    
    for (const [id, alert] of alerts) {
      if (!alert.isActive) continue;
      
      const currentRate = rates.rates[alert.currency];
      if (!currentRate) continue;
      
      const shouldTrigger = alert.condition === 'above' 
        ? currentRate >= alert.targetRate
        : currentRate <= alert.targetRate;
      
      if (shouldTrigger) {
        console.log(`🔔 ALERT: ${alert.email} - ${alert.currency} ${alert.condition} ${alert.targetRate} (current: ${currentRate})`);
        alert.isActive = false;
        alert.triggeredAt = new Date().toISOString();
        triggered++;
        
        const user = users.get(alert.email);
        if (user) user.alertCount = Math.max(0, user.alertCount - 1);
      }
    }
    
    console.log(`   Checked ${alerts.size} alerts, ${triggered} triggered`);
  } catch (err) {
    console.error('   Error:', err.message);
  }
}, 60000); // Every minute for demo