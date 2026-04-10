const fs = require('fs');
const path = require('path');

// 22-24：功能页面、定价、关于我们

// 22：产品功能页面
const features = [
  { name: "Vulnerability Scanning", benefits: ["Automated daily scans", "Priority risk ranking", "Fix suggestions"], icon: "🔍" },
  { name: "Compliance Dashboard", benefits: ["SOC 2 tracking", "Evidence collection", "Audit readiness"], icon: "📊" },
  { name: "Real-time Alerts", benefits: ["Instant notifications", "Smart filtering", "Team assignments"], icon: "🔔" },
  { name: "API Security", benefits: ["Endpoint discovery", "Authentication checks", "Rate limiting"], icon: "🔐" },
  { name: "CI CD Integration", benefits: ["GitHub Actions", "GitLab CI", "Jenkins support"], icon: "🔄" }
];

const featDir = path.join(__dirname, 'ai-agent-projects', 'content', 'feature-pages');
fs.mkdirSync(featDir, { recursive: true });

features.forEach((f, i) => {
  let content = `# ${f.icon} ${f.name}\n\n`;
  content += `## Key Benefits\n`;
  f.benefits.forEach(b => content += `- ${b}\n`);
  content += `\n## How It Works\n[Feature description]\n\n## Get Started\n[CTA]\n`;
  fs.writeFileSync(path.join(featDir, `feature-${String(i+1).padStart(2,'0')}.md`), content);
});

// 23：定价策略页面
const pricingTiers = [
  { name: "Free", price: "$0", features: ["1 project", "Basic scans", "Email alerts"], cta: "Get Started" },
  { name: "Pro", price: "$29/mo", features: ["Unlimited projects", "Advanced scans", "Slack integration", "API access"], cta: "Start Free Trial", popular: true },
  { name: "Team", price: "$79/mo", features: ["5 users", "Priority support", "Custom rules", "SSO"], cta: "Contact Sales" },
  { name: "Enterprise", price: "Custom", features: ["Unlimited users", "Dedicated support", "SLA", "On-premise option"], cta: "Book Demo" }
];

const pricingDir = path.join(__dirname, 'ai-agent-projects', 'content', 'pricing');
fs.mkdirSync(pricingDir, { recursive: true });

let pricingContent = `# Pricing\n\n`;
pricingTiers.forEach(t => {
  pricingContent += `## ${t.name} - ${t.price}\n`;
  if (t.popular) pricingContent += `⭐ Most Popular\n`;
  t.features.forEach(f => pricingContent += `- ${f}\n`);
  pricingContent += `\n**[${t.cta}]**\n\n`;
});
fs.writeFileSync(path.join(pricingDir, 'pricing-page.md'), pricingContent);

// 24：关于我们/团队页面
const aboutContent = `# About Us\n\n## Our Story\nFounded by developers who were tired of overpriced, bloated security tools.\n\n## Mission\nMake enterprise-grade security accessible to every development team.\n\n## Values\n- Security should be simple\n- Pricing should be transparent\n- Support should be human\n\n## Team\n[Team member bios]\n\n## Investors\n[If applicable]\n`;

const aboutDir = path.join(__dirname, 'ai-agent-projects', 'content', 'about');
fs.mkdirSync(aboutDir, { recursive: true });
fs.writeFileSync(path.join(aboutDir, 'about-page.md'), aboutContent);

console.log('✅ Batch 22: 5 feature pages');
console.log('✅ Batch 23: Pricing tiers');
console.log('✅ Batch 24: About us page');
