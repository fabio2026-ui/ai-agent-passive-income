# API Security: The Complete Guide for Developers

**Author:** Security architect with 50+ API security assessments  
**Reading time:** 30 minutes  
**Last updated:** April 2025  
**Code examples:** Node.js, Python, Go

---

## Executive Summary

APIs are the new attack surface. Gartner predicts that by 2025, 90% of web-enabled applications will have more attack surface area in exposed APIs than in UI. This guide covers everything you need to secure your APIs in 2025.

**What you'll learn:**
- OWASP API Security Top 10 with real examples
- Authentication patterns that actually work
- Rate limiting strategies
- API discovery and inventory
- Security testing methodologies

---

## Part 1: The API Security Landscape

### Why APIs Are High-Risk

**Attack surface growth:**
- Average enterprise: 15,000+ APIs
- 90% of APIs are undocumented
- 41% of organizations experienced an API security incident in 2024

**Common API vulnerabilities:**
- Broken object level authorization (BOLA)
- Broken authentication
- Excessive data exposure
- Lack of rate limiting
- Security misconfiguration

### Real Breach: Peloton API (2021)

**What happened:**
- API allowed unauthenticated access to user data
- 3 million user records exposed
- Data: age, gender, location, workout stats

**Root cause:** Missing authentication on API endpoints

**Lesson:** Every API endpoint needs authentication and authorization checks.

---

## Part 2: OWASP API Security Top 10 (2023)

### API1:2023 - Broken Object Level Authorization

**The vulnerability:** Users can access other users' data by manipulating IDs.

**Vulnerable code:**
```javascript
// BAD: No authorization check
app.get('/api/orders/:orderId', async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  res.json(order);
});
```

**Secure code:**
```javascript
// GOOD: Authorization check
app.get('/api/orders/:orderId', authenticate, async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  
  // Check if user owns this order
  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  res.json(order);
});
```

**Prevention:**
- Implement authorization checks on every endpoint
- Use indirect object references (UUIDs instead of sequential IDs)
- Test with different user contexts

### API2:2023 - Broken Authentication

**The vulnerability:** Weak authentication mechanisms allow attackers to impersonate users.

**Common mistakes:**
- Weak passwords allowed
- No MFA
- JWT secrets in code
- Session tokens without expiration

**Secure implementation:**
```python
from flask import Flask, request, jsonify
from functools import wraps
import jwt
import datetime

app = Flask(__name__)
app.config['JWT_SECRET'] = os.environ['JWT_SECRET']  # Never hardcode

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        
        try:
            # Verify token
            data = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated

@app.route('/api/login', methods=['POST'])
def login():
    # Validate credentials
    user = validate_credentials(request.json)
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check MFA if enabled
    if user.mfa_enabled:
        verify_mfa(request.json.get('mfa_code'), user)
    
    # Generate short-lived access token + refresh token
    access_token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    }, app.config['JWT_SECRET'])
    
    refresh_token = generate_refresh_token(user)
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expires_in': 900
    })
```

**Authentication best practices:**
- Use OAuth 2.0 / OIDC for third-party auth
- Implement MFA
- Short-lived access tokens (15 min)
- Secure refresh token rotation
- Rate limit authentication endpoints

### API3:2023 - Broken Object Property Level Authorization

**The vulnerability:** Mass assignment vulnerabilities allow users to modify restricted fields.

**Vulnerable code:**
```javascript
// BAD: Accepts all fields from request
app.put('/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body);
  res.json(user);
});
// Attacker can send {role: 'admin'} in body
```

**Secure code:**
```javascript
// GOOD: Explicit field whitelist
const ALLOWED_FIELDS = ['name', 'email', 'bio'];

app.put('/api/users/:id', authenticate, async (req, res) => {
  // Filter only allowed fields
  const updates = {};
  ALLOWED_FIELDS.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });
  
  const user = await User.findByIdAndUpdate(req.params.id, updates);
  res.json(user);
});
```

### API4:2023 - Unrestricted Resource Consumption

**The vulnerability:** No rate limiting allows DoS and brute force attacks.

**Implementation with Redis:**
```javascript
const redis = require('redis');
const client = redis.createClient();

const rateLimit = (windowMs, maxRequests) => {
  return async (req, res, next) => {
    const key = req.ip;
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.pexpire(key, windowMs);
    }
    
    if (current > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retry_after: await client.pttl(key)
      });
    }
    
    next();
  };
};

// Different limits for different endpoints
app.post('/api/login', rateLimit(900000, 5)); // 5 attempts per 15 min
app.get('/api/data', rateLimit(60000, 100)); // 100 requests per minute
```

**Rate limiting strategy:**
- Authentication endpoints: Very strict (5/15min)
- Standard API: Moderate (100/min)
- Resource-intensive: Strict (10/min)
- Different limits per API key tier

---

## Part 3: API Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────┐
│  WAF (CloudFlare/AWS WAF)                       │
│  • DDoS protection                              │
│  • Basic filtering                              │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  API Gateway (Kong/AWS API Gateway)             │
│  • Rate limiting                                │
│  • Authentication                               │
│  • Request validation                           │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  Application Layer                              │
│  • Authorization checks                         │
│  • Input validation                             │
│  • Business logic validation                    │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  Data Layer                                     │
│  • Parameterized queries                        │
│  • Encryption at rest                           │
│  • Access logging                               │
└─────────────────────────────────────────────────┘
```

### API Gateway Configuration

**Kong example:**
```yaml
_format_version: "3.0"
services:
  - name: api-service
    url: http://backend:8080
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          policy: redis
          redis_host: redis
      - name: jwt
        config:
          uri_param_names: []
          cookie_names: []
          key_claim_name: iss
          secret_is_base64: false
          claims_to_verify:
            - exp
      - name: cors
        config:
          origins:
            - "https://app.example.com"
          methods:
            - GET
            - POST
            - PUT
            - DELETE
          headers:
            - Authorization
            - Content-Type
          credentials: true
          max_age: 3600
    routes:
      - name: api-routes
        paths:
          - /api
```

---

## Part 4: API Testing and Monitoring

### Security Testing Checklist

- [ ] Authentication bypass tests
- [ ] BOLA/IDOR testing
- [ ] Injection testing (SQL, NoSQL, Command)
- [ ] Rate limiting validation
- [ ] Input validation testing
- [ ] CORS configuration review
- [ ] Sensitive data exposure check
- [ ] Error handling analysis

### Automated Testing with OWASP ZAP

```bash
# Run ZAP baseline scan
zap-baseline.py -t https://api.example.com -r zap-report.html

# Run full API scan with authentication
zap-api-scan.py -t https://api.example.com/openapi.json   -f openapi   -r api-scan-report.html   --hook=/zap/auth_hook.py
```

### Monitoring and Alerting

**Key metrics to track:**
- Authentication failures by IP
- Unusual request patterns
- Response time anomalies
- Error rate spikes
- Data exfiltration patterns

**Datadog SLO example:**
```yaml
# api-security-monitor.yaml
apiVersion: datadoghq.com/v1alpha1
kind: DatadogSLO
metadata:
  name: api-security
spec:
  name: "API Security Score"
  type: "metric"
  query: |
    sum:api.security.violations{*}.as_count()
  thresholds:
    - timeFrame: "7d"
      target: 99.9
      warning: 99.5
```

---

## Part 5: API Security Checklist

### Design Phase
- [ ] Threat model completed
- [ ] Authentication mechanism defined
- [ ] Authorization strategy documented
- [ ] Rate limiting requirements specified
- [ ] Input validation rules defined
- [ ] Error handling approach documented

### Development Phase
- [ ] Security libraries used (no custom crypto)
- [ ] All inputs validated and sanitized
- [ ] Authentication on all endpoints
- [ ] Authorization checks implemented
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] Logging implemented

### Testing Phase
- [ ] SAST scan passed
- [ ] DAST scan passed
- [ ] Penetration test completed
- [ ] Fuzzing performed
- [ ] Rate limiting validated

### Production Phase
- [ ] WAF configured
- [ ] API gateway deployed
- [ ] Monitoring configured
- [ ] Alerting rules set
- [ ] Incident response plan ready
- [ ] Regular security scans scheduled

---

## Conclusion

API security requires defense in depth:
1. Secure design from the start
2. Proper authentication and authorization
3. Rate limiting and resource controls
4. Continuous monitoring and testing

**Next steps:**
- Audit your APIs against OWASP API Top 10
- Implement the security patterns in this guide
- Set up automated security testing
- Monitor and respond to threats

---

## Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [API Security Checklist](https://github.com/shieldfy/API-Security-Checklist)
- [Postman Security Testing](https://learning.postman.com/docs/sending-requests/security/)
