const fs = require('fs');
const path = require('path');

// 生成Reddit多子版块推广内容
const redditCampaign = [
  {
    subreddit: "r/webdev",
    title: "I built an automated security scanner for my side project. Here's what I learned",
    type: "Showoff",
    content: `**TL;DR:** Built a security monitoring tool as a side project, turned it into a SaaS making $2k/month. Sharing lessons learned.

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

**Edit:** Thanks for all the interest! DM me if you want early access to the new API we're launching next month.`,
    bestTimeToPost: "Tuesday 9AM EST"
  },
  {
    subreddit: "r/SideProject",
    title: "From $0 to $2K MRR: My 8-month SaaS journey (with numbers)",
    type: "Journey",
    content: `**Background:**
I'm a solo developer who used to work in security consulting. I left my job 18 months ago to build products.

**The Product:**
Automated security monitoring for developers who can't afford enterprise tools.

**Month-by-Month Growth:**

Month 1: Launched on Product Hunt
- 150 signups, 3 paid customers ($87 MRR)
- Learned: Free tier attracts tire-kickers

Month 2-3: Content marketing push
- Wrote 8 technical blog posts
- Published 3 YouTube tutorials
- Result: +45 customers, $435 MRR

Month 4: Crisis
- Major competitor launched similar feature
- Lost 12 customers
- Response: Doubled down on niche (small teams only)

Month 5-6: Pivot to developers
- Built GitHub Actions integration
- Posted on dev.to, Hashnode
- Result: +67 customers, $1,180 MRR

Month 7-8: Optimization
- Raised prices (bold move)
- Added annual plans (30% discount)
- Result: 180 customers, $2,340 MRR

**Key Metrics:**
- CAC: $28 (mostly content marketing)
- LTV: $420
- Payback period: 1.1 months
- NPS: 62

**Tools I Use:**
- Stripe (payments)
- Crisp (support chat)
- PostHog (analytics)
- GitHub Actions (CI/CD)

**What Actually Worked:**
1. Being active in communities (not just promoting)
2. Writing genuinely helpful technical content
3. Responding to every support request personally
4. Saying no to enterprise features (staying focused)

**What's Next:**
- Launching API next month
- Exploring partnerships with hosting providers
- Maybe raising prices again (current customers grandfathered)

Ask me anything!`,
    bestTimeToPost: "Wednesday 10AM EST"
  },
  {
    subreddit: "r/Entrepreneur",
    title: "The 'unsexy' SaaS making $28K/year: Security monitoring for developers",
    type: "Business",
    content: `**Why I chose a boring problem:**
Everyone wants to build the next TikTok or AI tool. I chose security monitoring because:
- It's a real pain point (data breaches cost companies millions)
- Existing solutions are overpriced for small teams
- Low competition in the mid-market
- Recurring revenue potential

**The Business Model:**
- Freemium: 1 project free forever
- Pro: $29/month (unlimited projects)
- Team: $79/month (5 users + priority support)

**Customer Breakdown:**
- 60%: Solo developers & freelancers
- 25%: Small agencies (5-20 people)
- 15%: Startups preparing for SOC 2

**Acquisition Channels:**
| Channel | % of Revenue | CAC |
|---------|--------------|-----|
| SEO/Content | 40% | $0* |
| Product Hunt | 15% | $0 |
| Reddit/Communities | 20% | $0 |
| Paid Ads | 15% | $45 |
| Referrals | 10% | $15 |

*Time investment not counted

**The Reality:**
- First 6 months: Made $200/month, almost quit
- Month 7: Hit $1K MRR, started believing
- Month 12: $2.8K MRR, hired part-time support
- Now: Sustainable solo business

**What I'd tell my past self:**
1. Validation is overrated - just build and launch fast
2. Charge more than you're comfortable with
3. The first 100 customers are hardest - it gets easier
4. Don't chase VC funding for everything

**The Unsexy Truth:**
Boring problems = less competition = easier to win

Happy to discuss bootstrapping, SaaS pricing, or security industry insights.`,
    bestTimeToPost: "Thursday 11AM EST"
  },
  {
    subreddit: "r/devops",
    title: "Automating security compliance: Our journey to SOC 2 Type II",
    type: "Technical",
    content: `**Context:**
Our 12-person startup needed SOC 2 for enterprise deals. Traditional route: $50K+ and 6 months. We did it for $8K in 4 months.

**The Stack:**

**Monitoring & Alerting:**
- Automated vulnerability scanning (daily)
- Infrastructure drift detection
- Access log analysis
- Automated compliance evidence collection

**Documentation:**
- Policy templates (customized, not from scratch)
- Automated evidence gathering
- Change management workflows
- Incident response playbooks

**Auditor Management:**
- Pre-audit readiness assessment
- Evidence portal (auditor self-service)
- Automated follow-ups

**Timeline:**

Month 1: Foundation
- Defined scope (TSC criteria)
- Implemented monitoring
- Created policies

Month 2: Evidence Collection
- Automated log aggregation
- Access reviews
- Training completion tracking

Month 3: Observation Period
- Continuous monitoring
- Quarterly access reviews
- Incident response testing

Month 4: Audit
- 3-day on-site audit
- 95% evidence provided upfront
- Zero major findings

**Tools Used:**
- Terraform (infrastructure as code)
- GitHub Actions (CI/CD + compliance checks)
- Custom monitoring dashboard
- Vanta (compliance automation platform)

**Cost Breakdown:**
- Auditor: $5K
- Vanta: $2K (4 months)
- Infrastructure: $500
- Internal time: ~80 hours

**Key Wins:**
1. Automation saved ~200 hours of manual work
2. Audit went smoothly due to preparation
3. Now enterprise-ready for deals

**Lessons:**
- Start compliance prep early (don't wait for customer demand)
- Automate evidence collection from day 1
- Document everything (future you will thank present you)

AMA about SOC 2, compliance automation, or startup security!`,
    bestTimeToPost: "Tuesday 2PM EST"
  },
  {
    subreddit: "r/ExperiencedDevs",
    title: "After 15 years in security consulting, I built the tool I wish existed",
    type: "Experience",
    content: `**My Background:**
15 years doing security consulting for Fortune 500s. Saw the same problems over and over:
- Small teams can't afford $50K/year security tools
- Enterprise solutions are bloated with features nobody uses
- Security is always "we'll do it later" until it's too late

**What I Built:**
A security monitoring tool designed for:
- Teams without dedicated security engineers
- Companies that need SOC 2 but can't hire consultants
- Developers who want security without the enterprise bloat

**Key Design Decisions:**

**1. Opinionated Defaults**
Instead of "configure everything," we provide secure defaults that work for 90% of teams. You can customize if needed, but you don't have to be a security expert to get value.

**2. Actionable Alerts**
Not "CVE-2024-XXXX detected" but "Your Node.js version has a critical vulnerability. Here's how to fix it: [link to guide]"

**3. Integration-First**
Built for the tools developers actually use:
- GitHub/GitLab/Bitbucket
- Slack/Discord/Teams
- Jira/Linear/GitHub Issues
- Terraform/CloudFormation

**4. Pricing That Makes Sense**
- Free for side projects (seriously, forever free)
- $29/month for production apps
- No per-seat pricing (hate that model)

**What Surprised Me:**
- 40% of users are solo founders (didn't expect that)
- Most common request: "Can you just tell me what to fix?"
- Churn is lower than my previous SaaS (3% vs 8%)

**The Hard Parts:**
- Balancing "simple" with "comprehensive"
- Handling false positives (still working on this)
- Competing with "free" open source tools

**Revenue after 12 months:** $28K ARR
Not life-changing money, but:
- Covers my living expenses
- Growing 15% month-over-month
- I enjoy working on it

**For Experienced Devs Considering a Pivot:**
Your domain expertise is your unfair advantage. Don't build another todo app - solve problems you've lived through.

Happy to discuss:
- Security career transitions
- Building developer tools
- SaaS pricing strategies
- The reality of solo entrepreneurship

**Edit:** Wow, this blew up! For those asking - yes, I do limited consulting for teams preparing for SOC 2. DM if interested.`,
    bestTimeToPost: "Friday 10AM EST"
  }
];

// 生成Reddit内容
const outputDir = path.join(__dirname, 'ai-agent-projects', 'marketing', 'reddit-campaign');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

redditCampaign.forEach((post, index) => {
  let content = `# Reddit Post: ${post.subreddit}\n\n`;
  content += `**Title:** ${post.title}\n\n`;
  content += `**Type:** ${post.type}\n\n`;
  content += `**Best Time to Post:** ${post.bestTimeToPost}\n\n`;
  content += `---\n\n`;
  content += post.content;
  content += `\n\n---\n\n`;
  content += `**Posting Strategy:**\n`;
  content += `- Engage with comments within first 2 hours\n`;
  content += `- Don't include links in main post (let people ask)\n`;
  content += `- Be genuinely helpful, not salesy\n`;
  content += `- Follow up with interested commenters via DM\n`;
  
  const filename = `reddit-${String(index + 1).padStart(2, '0')}-${post.subreddit.replace('r/', '')}.md`;
  fs.writeFileSync(path.join(outputDir, filename), content);
  console.log(`✅ Generated: ${filename}`);
});

// 生成发布日历
const calendar = {
  campaignName: "Reddit Multi-Subreddit Campaign",
  duration: "2 weeks",
  posts: redditCampaign.map((p, i) => ({
    day: i * 2 + 1,
    subreddit: p.subreddit,
    title: p.title,
    type: p.type,
    scheduledTime: p.bestTimeToPost
  }))
};

fs.writeFileSync(
  path.join(outputDir, 'campaign-calendar.json'),
  JSON.stringify(calendar, null, 2)
);

console.log(`\n🎉 Generated ${redditCampaign.length} Reddit posts for campaign!`);
console.log(`📁 Location: ${outputDir}`);
console.log(`📅 Campaign duration: ${calendar.duration}`);
