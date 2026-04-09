// CodeGuard AI - 代码安全审查服务
// Cloudflare Workers版本

const LANDING_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeGuard AI - Instant Code Security Scanner</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header { text-align: center; padding: 60px 20px; color: white; }
        h1 { font-size: 3em; margin-bottom: 20px; }
        .tagline { font-size: 1.3em; opacity: 0.9; }
        .pricing {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
            margin: 40px 0;
        }
        .pricing-card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            width: 320px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            transition: transform 0.3s;
        }
        .pricing-card:hover { transform: translateY(-10px); }
        .pricing-card.featured { border: 3px solid #667eea; }
        .price { font-size: 3em; color: #667eea; font-weight: bold; margin: 20px 0; }
        .price span { font-size: 0.4em; color: #666; }
        .features { list-style: none; margin: 30px 0; }
        .features li { padding: 10px 0; border-bottom: 1px solid #eee; }
        .features li:before { content: "✓ "; color: #667eea; font-weight: bold; }
        .btn {
            display: block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 15px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.1em;
        }
        .btn:hover { opacity: 0.9; }
        .scanner {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin: 40px 0;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        textarea {
            width: 100%;
            min-height: 300px;
            padding: 20px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            resize: vertical;
        }
        .results { margin-top: 30px; }
        .score-display {
            font-size: 4em;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .grade-A { color: #4CAF50; }
        .grade-B { color: #8BC34A; }
        .grade-C { color: #FFC107; }
        .grade-D { color: #FF9800; }
        .grade-F { color: #F44336; }
        .issue { padding: 15px; margin: 10px 0; border-radius: 8px; }
        .issue.critical { background: #ffebee; border-left: 4px solid #F44336; }
        .issue.high { background: #fff3e0; border-left: 4px solid #FF9800; }
        .issue.medium { background: #fffde7; border-left: 4px solid #FFC107; }
        .issue.low { background: #f3e5f5; border-left: 4px solid #9C27B0; }
        footer { text-align: center; padding: 40px; color: white; opacity: 0.8; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🛡️ CodeGuard AI</h1>
            <p class="tagline">Instant security scanning for your code. Free first scan.<br>Find vulnerabilities before hackers do.</p>
        </header>

        <div class="pricing">
            <div class="pricing-card">
                <h3>Free</h3>
                <div class="price">$0</div>
                <ul class="features">
                    <li>1 scan per day</li>
                    <li>Basic security checks</li>
                    <li>Web interface</li>
                    <li>Community support</li>
                </ul>
            </div>
            <div class="pricing-card featured">
                <h3>Pro</h3>
                <div class="price">$9<span>/month</span></div>
                <ul class="features">
                    <li>Unlimited scans</li>
                    <li>Advanced security rules</li>
                    <li>API access</li>
                    <li>CI/CD integration</li>
                    <li>Priority support</li>
                </ul>
                <a href="#scanner" class="btn">Start Free Trial</a>
            </div>
            <div class="pricing-card">
                <h3>Team</h3>
                <div class="price">$29<span>/month</span></div>
                <ul class="features">
                    <li>Everything in Pro</li>
                    <li>Up to 10 team members</li>
                    <li>Organization dashboard</li>
                    <li>Custom rules</li>
                    <li>SLA guarantee</li>
                </ul>
            </div>
        </div>

        <div class="scanner" id="scanner">
            <h2>Try It Free - Paste Your Code</h2>
            <textarea id="code" placeholder="Paste your code here...\nExample:\nquery = f'SELECT * FROM users WHERE id = {user_id}'\ncursor.execute(query)"></textarea>
            <button class="btn" onclick="scanCode()" style="margin-top: 20px;">🔍 Scan Now (Free)</button>
            <div id="results" class="results"></div>
        </div>

        <footer>
            <p>CodeGuard AI © 2026 | Instantly scan code for security vulnerabilities</p>
        </footer>
    </div>

    <script>
        async function scanCode() {
            const code = document.getElementById('code').value;
            const results = document.getElementById('results');
            
            if (!code.trim()) {
                results.innerHTML = '<p style="color: red;">Please paste some code first.</p>';
                return;
            }

            results.innerHTML = '<p>Scanning...</p>';

            try {
                const response = await fetch('/api/review', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, filename: 'sample.py' })
                });
                
                const data = await response.json();
                displayResults(data);
            } catch (e) {
                results.innerHTML = '<p style="color: red;">Error scanning code. Please try again.</p>';
            }
        }

        function displayResults(data) {
            let html = '<div class="score-display grade-' + data.grade + '">' + data.score + '/100</div>';
            html += '<h3>' + data.summary + '</h3>';
            
            if (data.issues.length > 0) {
                html += '<h4>Issues Found:</h4>';
                data.issues.forEach(issue => {
                    html += '<div class="issue ' + issue.severity + '">';
                    html += '<strong>' + issue.rule + '</strong> (' + issue.severity + ')<br>';
                    html += issue.description + '<br>';
                    html += '<small>Suggestion: ' + issue.suggestion + '</small><br>';
                    html += '<code>Line ' + issue.line + ': ' + issue.code + '</code>';
                    html += '</div>';
                });
                html += '<div style="text-align: center; margin-top: 30px;">';
                html += '<a href="#" class="btn">Upgrade to Pro for Full Report</a>';
                html += '</div>';
            } else {
                html += '<p style="color: green; text-align: center; font-size: 1.2em;">✅ No issues found! Your code looks clean.</p>';
            }
            
            document.getElementById('results').innerHTML = html;
        }
    </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/health') {
      return jsonResponse({
        status: 'ok',
        service: 'CodeGuard AI',
        version: '1.0.0'
      }, corsHeaders);
    }

    if (url.pathname === '/api/review' && request.method === 'POST') {
      try {
        const { code, filename = 'unknown' } = await request.json();
        
        if (!code) {
          return jsonResponse({ error: 'Code is required' }, corsHeaders, 400);
        }

        const result = analyzeCode(code, filename);
        return jsonResponse(result, corsHeaders);
      } catch (e) {
        return jsonResponse({ error: 'Invalid request' }, corsHeaders, 400);
      }
    }

    if (url.pathname === '/') {
      return new Response(LANDING_PAGE, {
        headers: { 'Content-Type': 'text/html', ...corsHeaders }
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};

function jsonResponse(data, headers, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

function analyzeCode(code, filename) {
  const issues = [];
  const lines = code.split('\\n');

  // Simple pattern matching without complex regex
  const patterns = [
    { str: "execute(", desc: 'Potential SQL injection', severity: 'critical', rule: 'SQL_INJECTION' },
    { str: "f'SELECT", desc: 'f-string in SQL query', severity: 'critical', rule: 'SQL_INJECTION' },
    { str: 'f"SELECT', desc: 'f-string in SQL query', severity: 'critical', rule: 'SQL_INJECTION' },
    { str: ".format(", desc: 'String formatting may be unsafe', severity: 'medium', rule: 'UNSAFE_FORMAT' },
    { str: "innerHTML =", desc: 'innerHTML XSS vulnerability', severity: 'high', rule: 'XSS_VULNERABILITY' },
    { str: "innerHTML=", desc: 'innerHTML XSS vulnerability', severity: 'high', rule: 'XSS_VULNERABILITY' },
    { str: "document.write(", desc: 'document.write XSS vulnerability', severity: 'high', rule: 'XSS_VULNERABILITY' },
    { str: "eval(", desc: 'eval is dangerous', severity: 'critical', rule: 'DANGEROUS_EVAL' },
    { str: "api_key", desc: 'Possible hardcoded API key', severity: 'high', rule: 'HARDCODED_SECRET' },
    { str: "apikey", desc: 'Possible hardcoded API key', severity: 'high', rule: 'HARDCODED_SECRET' },
    { str: "password", desc: 'Possible hardcoded password', severity: 'high', rule: 'HARDCODED_SECRET' },
    { str: "sk-", desc: 'Possible API key', severity: 'critical', rule: 'HARDCODED_SECRET' },
    { str: "os.system(", desc: 'Command injection risk', severity: 'critical', rule: 'COMMAND_INJECTION' },
    { str: "subprocess.call(", desc: 'Command injection risk', severity: 'high', rule: 'COMMAND_INJECTION' },
    { str: "MD5", desc: 'Weak hashing algorithm', severity: 'medium', rule: 'WEAK_CRYPTO' },
    { str: "SHA1", desc: 'Weak hashing algorithm', severity: 'medium', rule: 'WEAK_CRYPTO' },
  ];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmedLine = line.trim();
    
    // Skip comments
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('#') || trimmedLine.startsWith('/*')) {
      return;
    }

    patterns.forEach(({ str, desc, severity, rule }) => {
      if (line.includes(str)) {
        issues.push({
          severity,
          category: 'security',
          rule,
          description: desc,
          suggestion: getSuggestion(rule),
          line: lineNum,
          code: line.trim().substring(0, 80)
        });
      }
    });

    // Line length check
    if (line.length > 120) {
      issues.push({
        severity: 'low',
        category: 'style',
        rule: 'LINE_TOO_LONG',
        description: 'Line too long (' + line.length + ' chars)',
        suggestion: 'Keep lines under 120 characters',
        line: lineNum,
        code: line.substring(0, 80) + '...'
      });
    }
  });

  // Calculate score
  const weights = { critical: 25, high: 15, medium: 8, low: 3, info: 0 };
  const penalty = issues.reduce((sum, i) => sum + (weights[i.severity] || 0), 0);
  const score = Math.max(0, 100 - penalty);

  // Grade
  let grade;
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  // Count by severity
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  issues.forEach(i => counts[i.severity]++);

  return {
    score,
    grade,
    filename,
    issues_found: issues.length,
    severity_breakdown: counts,
    issues: issues.slice(0, 10),
    summary: 'Found ' + issues.length + ' issues: ' + counts.critical + ' critical, ' + counts.high + ' high, ' + counts.medium + ' medium',
    generated_at: new Date().toISOString()
  };
}

function getSuggestion(rule) {
  const suggestions = {
    'SQL_INJECTION': 'Use parameterized queries or prepared statements',
    'XSS_VULNERABILITY': 'Sanitize user input before rendering to DOM',
    'HARDCODED_SECRET': 'Use environment variables or secret managers',
    'DANGEROUS_EVAL': 'Avoid eval(), use JSON.parse() or safer alternatives',
    'COMMAND_INJECTION': 'Use subprocess with shell=False and proper argument passing',
    'WEAK_CRYPTO': 'Use SHA-256 or stronger hashing algorithms',
    'UNSAFE_FORMAT': 'Use parameterized queries instead of string formatting',
    'LINE_TOO_LONG': 'Break line into multiple lines for readability'
  };
  return suggestions[rule] || 'Review and fix this issue';
}
