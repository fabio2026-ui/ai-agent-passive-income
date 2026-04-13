# Reddit Post: r/webdev

**Title:** I built an automated security scanner for my side project. Here's what I learned

**Type:** Showoff

**Best Time to Post:** Tuesday 9AM EST

---

**TL;DR:** Built a security monitoring tool as a side project, turned it into a SaaS making $2k/month. Sharing lessons learned.

**The Problem:**
I was tired of paying $500/month for enterprise security tools that were overkill for my small web apps.

**The Solution:**
Built a lightweight security scanner that:
- Checks for common vulnerabilities automatically
- Integrates with GitHub Actions
- Costs $29/month instead of $500

**Key Lessons:**
1. **Start with pain points you personally feel** - Don't build what you think people want
2. **Dogfood everything** - I used my own tool for 6 months before selling
3. **Pricing psychology matters** - $29 feels like "try it" vs $500 feels like "enterprise sales call"
4. **Documentation is marketing** - My best customers came from detailed technical docs

**Tech Stack:**
- Node.js + TypeScript
- PostgreSQL for scan results
- Redis for job queues
- Stripe for payments (took 30 mins to set up)

**Numbers after 8 months:**
- 180 paying customers
- $2,340 MRR
- 87% gross margin
- Churn: 3.2%/month

**What I'd do differently:**
- Start content marketing earlier (SEO is now 40% of signups)
- Build affiliate program from day 1
- Focus on one integration (GitHub) instead of trying to support everything

Happy to answer questions about:
- Technical implementation
- Marketing/growth strategies
- SaaS pricing models
- Solo-founder challenges

**Edit:** Thanks for all the interest! DM me if you want early access to the new API we're launching next month.

---

**Posting Strategy:**
- Engage with comments within first 2 hours
- Don't include links in main post (let people ask)
- Be genuinely helpful, not salesy
- Follow up with interested commenters via DM
