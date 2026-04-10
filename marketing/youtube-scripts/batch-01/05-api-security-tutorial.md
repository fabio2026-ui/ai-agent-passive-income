# YouTube Video Script: API Security Complete Tutorial
**Topic:** API Security Best Practices & Implementation
**Duration:** 12-15 minutes
**Target Audience:** Backend developers, API architects, security engineers

---

## 🎬 INTRO HOOK (0:00 - 0:50)

*[Code editor in background, terminal showing API requests]*

**HOST:**
"APIs are eating the world. Every mobile app, every web service, every microservice architecture—they all run on APIs. But here's what keeps me up at night: APIs are also the #1 attack vector for data breaches in 2024.

Think about it. Your API is a direct pipeline to your database. It's authenticated, sure. But is it authorized? Is it rate-limited? Is it monitoring for anomalies? Can it tell the difference between a legitimate user and an attacker who's stolen credentials?

I've spent the last decade breaking and securing APIs—from fintech platforms processing billions to healthcare systems handling PHI. In this video, I'm giving you the complete API security blueprint. Authentication, authorization, input validation, rate limiting, logging, and the OWASP API Security Top 10.

This is the video I wish I had when I started. Let's lock down your APIs."

---

## 📋 CONTENT STRUCTURE

### Section 1: The API Security Landscape (0:50 - 2:30)

**Why APIs Are High-Risk:**

**Statistics:**
- 91% of enterprises have experienced an API security incident
- API attack traffic grew 117% year-over-year
- Average cost of API breach: $4.5M
- 82% of organizations don't know all their APIs (shadow APIs)

**The API Explosion Problem:**
- Rapid development = security shortcuts
- Microservices = more attack surface
- Third-party integrations = trust issues
- Mobile apps = API keys in client code

**Common Attack Types:**
1. **Broken Authentication** - Weak or missing auth
2. **Broken Object Level Authorization (BOLA)** - Accessing others' data
3. **Excessive Data Exposure** - APIs returning too much
4. **Rate Limiting Bypass** - Brute force attacks
5. **Injection Attacks** - SQLi, NoSQLi, Command injection

**Visual:** Show attack flow diagram

### Section 2: Authentication & Authorization (2:30 - 5:30)

**Authentication: Who Are You?**

**API Authentication Methods (Ranked by Security):**

1. **Mutual TLS (mTLS)** ⭐ Best
   - Client and server both present certificates
   - No tokens, no secrets in headers
   - Perfect for service-to-service

2. **OAuth 2.0 + PKCE**
   - Industry standard for user-facing apps
   - Token-based, refresh tokens
   - Supports SSO

3. **API Keys**
   - Simple but limited
   - Good for server-to-server
   - Never use in client-side code

4. **JWT (JSON Web Tokens)**
   - Stateless authentication
   - Self-contained claims
   - Watch out for size and security claims

**Code Example: JWT Implementation (Pseudocode)**
```python
import jwt
from datetime import datetime, timedelta

def create_token(user_id, scopes):
    payload = {
        'sub': user_id,
        'scopes': scopes,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise Unauthorized("Token expired")
    except jwt.InvalidTokenError:
        raise Unauthorized("Invalid token")
```

**Authorization: What Can You Do?**

**Authorization Patterns:**

1. **Role-Based Access Control (RBAC)**
```
User → Role → Permission → Resource
```
- Simple, scalable
- Roles: admin, editor, viewer

2. **Attribute-Based Access Control (ABAC)**
```
IF user.department == resource.department
   AND user.clearance >= resource.classification
   AND time.now < business_hours
THEN allow access
```
- Fine-grained, context-aware
- More complex to implement

3. **Relationship-Based Access Control (ReBAC)**
- Google Zanzibar model
- "Can user X edit document Y?"
- Powerful for complex permission schemes

**Critical: Object-Level Authorization**

**The BOLA Vulnerability:**
```
GET /api/users/123/orders/456
```
- Does user 123 own order 456?
- If not checked, user 123 can see anyone's orders

**Solution Pattern:**
```python
@app.get("/api/orders/{order_id}")
async def get_order(order_id: str, user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"_id": order_id})
    
    if not order:
        raise HTTPException(404, "Order not found")
    
    if order.user_id != user.id:
        # Same 404 to prevent user enumeration
        raise HTTPException(404, "Order not found")
    
    return order
```

### Section 3: Input Validation & Data Protection (5:30 - 8:00)

**Input Validation Principles:**

1. **Whitelist, Don't Blacklist**
   - Define what's allowed, reject everything else
   - Blacklists are always incomplete

2. **Validate at Multiple Layers**
   - Client-side (UX)
   - API gateway
   - Application layer
   - Database layer

3. **Strong Typing**
   - Use schemas (JSON Schema, Pydantic, Joi)
   - Reject unexpected fields

**Code Example: Request Validation**
```python
from pydantic import BaseModel, validator, Field
from typing import Optional
import re

class CreateUserRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    username: str = Field(..., min_length=3, max_length=50)
    age: Optional[int] = Field(None, ge=13, le=120)
    
    @validator('email')
    def validate_email(cls, v):
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', v):
            raise ValueError('Invalid email format')
        return v.lower()
    
    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username must be alphanumeric')
        return v

@app.post("/api/users")
async def create_user(request: CreateUserRequest):
    # Input is now validated and typed
    pass
```

**Injection Prevention:**

**SQL Injection Defense:**
```python
# BAD - String concatenation
query = f"SELECT * FROM users WHERE id = '{user_id}'"

# GOOD - Parameterized queries
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# GOOD - ORM with parameterization
User.objects.filter(id=user_id)
```

**NoSQL Injection:**
```javascript
// BAD - Direct object injection
db.users.find({ username: req.body.username })

// GOOD - Schema validation + type checking
const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
})
const { error, value } = schema.validate(req.body)
```

**Data Exposure Prevention:**

**The Over-Exposure Problem:**
```javascript
// BAD - Returning full user object
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
  res.json(user)  // Includes password_hash, ssn, internal_notes!
})

// GOOD - Explicit field selection
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('username display_name created_at')
  res.json(user)
})
```

**DTO (Data Transfer Object) Pattern:**
```typescript
// Define what the API returns
interface UserPublicProfile {
  id: string
  username: string
  displayName: string
  joinDate: Date
}

function toPublicProfile(user: User): UserPublicProfile {
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    joinDate: user.created_at
  }
}
```

### Section 4: Rate Limiting & DDoS Protection (8:00 - 10:00)

**Rate Limiting Strategies:**

1. **Fixed Window**
   - 100 requests per hour
   - Simple, but allows bursts at window edges

2. **Sliding Window**
   - Smoother distribution
   - More complex to implement

3. **Token Bucket**
   - Burst capacity + sustained rate
   - 100 tokens, refill 10/second

**Implementation Example (Redis-based):**
```python
import redis
from functools import wraps

redis_client = redis.Redis()

def rate_limit(requests=100, window=60):
    def decorator(f):
        @wraps(f)
        async def wrapper(*args, **kwargs):
            # Use API key or IP as identifier
            key = f"rate_limit:{get_client_id()}"
            
            current = redis_client.get(key)
            if current and int(current) >= requests:
                raise RateLimitExceeded()
            
            pipe = redis_client.pipeline()
            pipe.incr(key)
            pipe.expire(key, window)
            pipe.execute()
            
            return await f(*args, **kwargs)
        return wrapper
    return decorator

@app.get("/api/search")
@rate_limit(requests=10, window=60)  # 10 searches/minute
async def search(q: str):
    # Search implementation
    pass
```

**Different Limits for Different Users:**
```python
RATE_LIMITS = {
    'free': (100, 3600),      # 100/hour
    'pro': (1000, 3600),      # 1000/hour
    'enterprise': (10000, 3600)  # 10000/hour
}

@rate_limit(tier_based=True)
async def api_endpoint():
    pass
```

**Rate Limit Headers:**
```
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

**DDoS Protection Layers:**

1. **CDN Level (Cloudflare, AWS CloudFront)**
   - Absorb volumetric attacks
   - Geographic blocking
   - Bot detection

2. **API Gateway Level (Kong, AWS API Gateway)**
   - Throttling
   - Request validation
   - Caching

3. **Application Level**
   - Business logic rate limits
   - Resource-intensive operation limits
   - User-specific throttling

### Section 5: Logging, Monitoring & Incident Response (10:00 - 12:00)

**What to Log:**

**Required API Log Fields:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "uuid-1234",
  "method": "POST",
  "path": "/api/transfers",
  "status_code": 201,
  "user_id": "user-567",
  "client_ip": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "response_time_ms": 145,
  "request_size_bytes": 1024,
  "response_size_bytes": 512
}
```

**Security Events to Log:**
- Authentication failures (3+ attempts)
- Authorization failures
- Rate limit violations
- Input validation failures
- Unusual access patterns
- Admin actions
- Data export/download events

**What NOT to Log:**
- Passwords
- API keys
- Credit card numbers
- PII (unless necessary and encrypted)
- Session tokens

**Structured Logging Example:**
```python
import structlog

logger = structlog.get_logger()

@app.post("/api/login")
async def login(credentials: LoginRequest):
    try:
        user = await authenticate(credentials)
        logger.info(
            "user_login_success",
            user_id=user.id,
            ip_address=request.client.host,
            user_agent=request.headers.get('user-agent')
        )
        return {"token": create_token(user)}
    except AuthenticationError:
        logger.warning(
            "user_login_failed",
            username=credentials.username,
            ip_address=request.client.host,
            reason="invalid_credentials"
        )
        raise HTTPException(401, "Invalid credentials")
```

**Monitoring & Alerting:**

**Key Metrics:**
- Request rate (requests/second)
- Error rate (4xx, 5xx percentages)
- Latency (p50, p95, p99)
- Authentication failure rate
- Unique API consumers

**Security Alerts:**
- Spike in 401/403 responses
- Unusual traffic patterns
- Geographic anomalies
- New user agent strings
- Large data transfers

**Tools:**
- Datadog, New Relic (APM)
- Splunk, ELK Stack (Log analysis)
- PagerDuty, Opsgenie (Alerting)

### Section 6: API Security Testing (12:00 - 14:00)

**Testing Approaches:**

1. **Static Analysis**
   - SonarQube, Semgrep
   - Find bugs before deployment

2. **Dynamic Testing (DAST)**
   - OWASP ZAP, Burp Suite
   - Test running APIs

3. **Fuzzing**
   - Send random/invalid data
   - Find edge cases

4. **Penetration Testing**
   - Hire professionals
   - Annual requirement for compliance

**API Security Checklist:**

**Authentication:**
- [ ] Strong authentication in place
- [ ] Tokens expire appropriately
- [ ] Refresh token rotation implemented
- [ ] mTLS for service-to-service

**Authorization:**
- [ ] Object-level authorization verified
- [ ] Principle of least privilege applied
- [ ] Admin endpoints protected
- [ ] CORS properly configured

**Input Validation:**
- [ ] Schema validation on all endpoints
- [ ] SQL/NoSQL injection prevented
- [ ] File upload restrictions in place
- [ ] Content-Type validation

**Rate Limiting:**
- [ ] Rate limits configured
- [ ] Different tiers for different users
- [ ] DDoS protection enabled
- [ ] Headers communicate limits

**Data Protection:**
- [ ] Sensitive data encrypted at rest
- [ ] TLS 1.3 for all traffic
- [ ] Response filtering implemented
- [ ] No sensitive data in logs

---

## 🎯 CTA / OUTRO (14:00 - 15:00)

**HOST:**
"Your API is your product's front door. And right now, that door might be unlocked.

We've covered authentication, authorization, validation, rate limiting, and monitoring. But knowing isn't enough—you need to implement. Today.

Here's your action plan:

1. **Download my API Security Checklist**—it's a comprehensive PDF covering everything we discussed, ready for your next security review
2. **Run a quick audit** on your APIs using the OWASP API Security Top 10
3. **Subscribe and hit the bell**—next week we're diving into OAuth 2.1 and modern authentication flows
4. **Drop a comment** with your biggest API security challenge

And if you're building APIs at scale, check out my course on API Security Architecture. We go deep into threat modeling, secure design patterns, and building security into your SDLC.

Remember: every breach starts with one vulnerable endpoint. Don't let it be yours.

Secure your APIs, protect your users, sleep better at night. I'll see you in the next one."

*[End screen with checklist download and subscribe]*

---

## 📝 API SECURITY RESOURCES

**OWASP API Security Top 10 (2023):**
1. Broken Object Level Authorization
2. Broken Authentication
3. Broken Object Property Level Authorization
4. Unrestricted Resource Consumption
5. Broken Function Level Authorization
6. Unrestricted Access to Sensitive Business Flows
7. Server Side Request Forgery
8. Security Misconfiguration
9. Improper Inventory Management
10. Unsafe Consumption of APIs

**Recommended Tools:**
| Category | Tools |
|----------|-------|
| API Gateway | Kong, AWS API Gateway, Azure API Management |
| Testing | Postman, OWASP ZAP, Burp Suite |
| Monitoring | Datadog, New Relic, Grafana |
| WAF | Cloudflare, AWS WAF, ModSecurity |

**Standards:**
- OAuth 2.0 (RFC 6749)
- OpenID Connect
- JWT (RFC 7519)
- OpenAPI Specification 3.0
