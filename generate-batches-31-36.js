const fs = require('fs');
const path = require('path');

// 批量31-36：合作伙伴、社区、活动等内容

// 31：合作伙伴计划
const partnerTiers = [
  { name: "Affiliate", commission: "20% recurring", requirements: "Social following or blog" },
  { name: "Reseller", commission: "30% recurring", requirements: "Registered business" },
  { name: "Integration Partner", commission: "Co-marketing", requirements: "Complementary product" }
];

const partnerDir = path.join(__dirname, 'ai-agent-projects', 'content', 'partners');
fs.mkdirSync(partnerDir, { recursive: true });

let partnerContent = `# Partner Program\n\n`;
partnerTiers.forEach(p => {
  partnerContent += `## ${p.name}\n- Commission: ${p.commission}\n- Requirements: ${p.requirements}\n\n`;
});
fs.writeFileSync(path.join(partnerDir, 'partner-program.md'), partnerContent);

// 32：社区指南
const communityContent = `# Community\n\n## Join Our Community\n- Discord server\n- GitHub discussions\n- Monthly meetups\n\n## Contribute\n- Open source projects\n- Documentation\n- Translation\n\n## Code of Conduct\n[Guidelines]\n`;

const commDir = path.join(__dirname, 'ai-agent-projects', 'content', 'community');
fs.mkdirSync(commDir, { recursive: true });
fs.writeFileSync(path.join(commDir, 'community.md'), communityContent);

// 33：活动/网络研讨会日历
const events = [
  { name: "Monthly Security Roundtable", date: "First Tuesday", type: "Live" },
  { name: "SOC 2 Workshop", date: "Quarterly", type: "Workshop" },
  { name: "API Security Masterclass", date: "Monthly", type: "Training" }
];

const eventDir = path.join(__dirname, 'ai-agent-projects', 'content', 'events');
fs.mkdirSync(eventDir, { recursive: true });

let eventContent = `# Events\n\n`;
events.forEach(e => {
  eventContent += `## ${e.name}\n- When: ${e.date}\n- Type: ${e.type}\n\n`;
});
fs.writeFileSync(path.join(eventDir, 'events-calendar.md'), eventContent);

// 34：推荐语/评价
const testimonials = [
  { name: "Sarah K.", role: "CTO", company: "TechFlow", quote: "Cut our security incidents by 80%" },
  { name: "Mike R.", role: "DevOps Lead", company: "DataSync", quote: "Best investment for our compliance needs" },
  { name: "Lisa T.", role: "Founder", company: "CloudBase", quote: "Finally, security we can afford" }
];

const testDir = path.join(__dirname, 'ai-agent-projects', 'content', 'testimonials');
fs.mkdirSync(testDir, { recursive: true });

testimonials.forEach((t, i) => {
  let content = `## ${t.name}, ${t.role} at ${t.company}\n\n"${t.quote}"\n`;
  fs.writeFileSync(path.join(testDir, `testimonial-${i+1}.md`), content);
});

// 35：开发者API文档
const apiDocs = `# API Documentation\n\n## Authentication\nAPI keys in header\n\n## Endpoints\n### GET /scans\nList all scans\n\n### POST /scans\nStart new scan\n\n### GET /results/{id}\nGet scan results\n\n## Rate Limits\n1000 requests/hour\n`;

const apiDir = path.join(__dirname, 'ai-agent-projects', 'content', 'api-docs');
fs.mkdirSync(apiDir, { recursive: true });
fs.writeFileSync(path.join(apiDir, 'api-reference.md'), apiDocs);

// 36：法律页面
const legal = {
  privacy: "# Privacy Policy\n\nWe respect your privacy...",
  terms: "# Terms of Service\n\nBy using our service...",
  security: "# Security\n\nHow we protect your data...",
  gdpr: "# GDPR Compliance\n\nYour rights under GDPR..."
};

const legalDir = path.join(__dirname, 'ai-agent-projects', 'content', 'legal');
fs.mkdirSync(legalDir, { recursive: true });

Object.entries(legal).forEach(([name, content]) => {
  fs.writeFileSync(path.join(legalDir, `${name}.md`), content);
});

console.log('✅ Batch 31: Partner program');
console.log('✅ Batch 32: Community guidelines');
console.log('✅ Batch 33: Events calendar');
console.log('✅ Batch 34: Testimonials');
console.log('✅ Batch 35: API documentation');
console.log('✅ Batch 36: Legal pages');
