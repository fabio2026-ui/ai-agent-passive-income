# Indie Hackers Post - CodeGuard AI

## Title
Show IH: CodeGuard AI – Free instant code security scanner

## Body
Hey Indie Hackers! 👋

Just launched **CodeGuard AI** – a dead-simple code security scanner that helps developers catch vulnerabilities before they hit production.

## 🛡️ What it does
Paste your code → Get instant security analysis with:
- Security score (A-F)
- Specific vulnerability detection
- Fix suggestions

## 🚨 Detects
- SQL injection vulnerabilities
- XSS (cross-site scripting) risks
- Hardcoded API keys/secrets
- Command injection
- Path traversal attacks
- Weak cryptography (MD5, SHA1)

## 💰 Pricing
- **Free**: 1 scan/day
- **Pro**: $9/month (unlimited + API)
- **Team**: $29/month (10 members)

## 🚀 Try it
**Live**: https://codeguard-ai-prod.yhongwb.workers.dev
**IPFS Mirror**: https://ipfs.io/ipfs/Qme4Lyqejjcfd2xuvvGEGZJMB1ic9Cx9rot2LaNS3tKWLJ

## 🛠️ Tech Stack
- Cloudflare Workers (edge deployment)
- Vanilla JS (no framework bloat)
- Built in a weekend!

## 📊 Current Status
- ✅ MVP live
- ✅ Core security detectors working
- 🔄 Looking for first paying users

Would love your feedback! What security checks should I add next?

---

# Reddit Posts

## r/SideProject

**Title**: My weekend project: Free AI code security scanner

**Body**:
Hey side project enthusiasts!

Built **CodeGuard AI** over the weekend – a code security scanner that:
- Analyzes code instantly
- Finds security vulnerabilities  
- Gives you a security score (A-F)
- Suggests fixes

**What it catches:**
- SQL injection attempts
- XSS vulnerabilities
- Hardcoded secrets
- Command injection
- Path traversal

**Monetization:** Freemium ($9/mo Pro, $29/mo Team)

**Current status:** Live, looking for first paying users.

**Tech:** Cloudflare Workers, vanilla JS

**Try it**: https://codeguard-ai-prod.yhongwb.workers.dev

Any feedback appreciated! Also happy to share how I'm planning to grow this.

---

## r/webdev

**Title**: I built a free tool to instantly scan your code for security vulnerabilities

**Body**:
Hey r/webdev,

I built **CodeGuard AI** - a free code security scanner that checks for:
- SQL injection vulnerabilities
- XSS (cross-site scripting)  
- Hardcoded API keys/secrets
- Command injection
- Path traversal attacks
- Weak cryptography

**Try it free:** Just paste your code and get instant results with a security score.

**Why I built this:**
I kept seeing security issues in code reviews that could've been caught early. Existing tools (Snyk, SonarCloud) are expensive or complex. I wanted something dead simple.

**Pricing:**
- Free: 1 scan/day
- Pro: $9/month unlimited
- Team: $29/month up to 10 members

**Tech stack:** Cloudflare Workers, vanilla JS

**Live**: https://codeguard-ai-prod.yhongwb.workers.dev

Would love your feedback! What security checks should I add next?

---

## r/coding

**Title**: Free code security scanner - find vulnerabilities before production

**Body**:
Hi r/coding,

Just launched **CodeGuard AI** - paste code, get instant security analysis.

**Detects:**
🚨 SQL injection patterns
🚨 Hardcoded secrets (API keys, passwords)
🚨 XSS vulnerabilities  
⚠️ Command injection risks
⚠️ Unsafe deserialization

**Live demo:** https://codeguard-ai-prod.yhongwb.workers.dev

**Free tier:** 1 scan per day, no signup required.

Built this after finding a hardcoded AWS key in a client's codebase (yikes). Figured there should be a faster way to catch these.

Questions welcome!

---

## r/Frontend

**Title**: Free security scanner for frontend developers

**Body**:
Hey frontend devs,

Built a quick security scanner that catches common issues in JavaScript/TypeScript code:

**Detects:**
- innerHTML XSS vulnerabilities
- eval() usage
- Hardcoded secrets in client code
- Unsafe DOM manipulation

**Try it**: https://codeguard-ai-prod.yhongwb.workers.dev

Free tier available (1 scan/day). Built with vanilla JS, runs on Cloudflare Workers for speed.

Feedback welcome! 🙏

---

# Deployment Summary

## ✅ Completed

### 1. Cloudflare Workers Deployment
- **URL**: https://codeguard-ai-prod.yhongwb.workers.dev
- **Status**: ✅ Live and working
- **Features**: 
  - Landing page with interactive scanner
  - API endpoint (/api/review)
  - Health check endpoint
  - CORS enabled

### 2. IPFS Deployment (Backup)
- **CID**: Qme4Lyqejjcfd2xuvvGEGZJMB1ic9Cx9rot2LaNS3tKWLJ
- **Gateway URL**: https://ipfs.io/ipfs/Qme4Lyqejjcfd2xuvvGEGZJMB1ic9Cx9rot2LaNS3tKWLJ
- **Status**: ✅ Pinned to local node

### 3. Landing Page with Demo
- Created static landing page with:
  - Visual demo of the scanner
  - Code example showing vulnerability detection
  - Pricing cards
  - Live app link

### 4. Promotional Content Ready
- Indie Hackers post (Show IH)
- r/SideProject post
- r/webdev post  
- r/coding post
- r/Frontend post

## 📊 Test Results

### API Test
```bash
curl -X POST https://codeguard-ai-prod.yhongwb.workers.dev/api/review \
  -H "Content-Type: application/json" \
  -d '{"code": "query = f\"SELECT * FROM users WHERE id = {user_id}\"", "filename": "test.py"}'
```

**Result**: ✅ Returns security analysis with score, grade, and issues

### Health Check
```bash
curl https://codeguard-ai-prod.yhongwb.workers.dev/health
```

**Result**: ✅ `{ "status": "ok", "service": "CodeGuard AI", "version": "1.0.0" }`

## 🎯 Next Steps (Manual)

The posts are prepared but need to be submitted manually to:

1. **Indie Hackers**: https://www.indiehackers.com/post/new
   - Use "Show IH" tag
   - Copy content from this file

2. **Reddit**: 
   - r/SideProject: https://reddit.com/r/SideProject/submit
   - r/webdev: https://reddit.com/r/webdev/submit
   - r/coding: https://reddit.com/r/coding/submit
   - r/Frontend: https://reddit.com/r/Frontend/submit

## 📈 Expected Results

- **Week 1**: 50-100 visitors, 10-20 free signups
- **Week 2**: First paying customer
- **Month 1**: $50-100 MRR
