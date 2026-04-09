const http = require('http');
const url = require('url');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const subscriptions = new Map();

const server = http.createServer((req, res) => {
  // CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  // Health check
  if (parsedUrl.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now(), env: 'production' }));
    return;
  }

  // Get subscription
  if (parsedUrl.pathname === '/api/stripe/subscription') {
    const userId = req.headers['x-user-id'] || 'demo-user';
    const sub = subscriptions.get(userId);
    res.writeHead(sub ? 200 : 404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sub || { error: 'No subscription' }));
    return;
  }

  // Create checkout session (mock)
  if (parsedUrl.pathname === '/api/stripe/checkout' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          sessionId: 'mock_session_' + Date.now(),
          url: 'https://slot-stereo-counted-touch.trycloudflare.com/premium?success=true'
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Webhook (mock)
  if (parsedUrl.pathname === '/api/stripe/webhook' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ received: true }));
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 8787;
server.listen(PORT, () => {
  console.log(`BreathAI Backend running on port ${PORT}`);
});
