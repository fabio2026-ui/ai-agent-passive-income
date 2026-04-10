const fs = require('fs');
const path = require('path');

// 批量25-27

// 25：行业解决方案
const industries = [
  { name: "SaaS", pain: "Customer data protection", solution: "Automated compliance monitoring" },
  { name: "Fintech", pain: "Regulatory requirements", solution: "Audit-ready reporting" },
  { name: "Healthcare", pain: "HIPAA compliance", solution: "Data encryption and access controls" },
  { name: "E-commerce", pain: "Payment security", solution: "PCI DSS compliance tools" },
  { name: "Agency", pain: "Multi-client management", solution: "Project-based security" }
];

const indDir = path.join(__dirname, 'ai-agent-projects', 'content', 'industries');
fs.mkdirSync(indDir, { recursive: true });

industries.forEach((ind, i) => {
  let content = `# ${ind.name} Security Solutions\n\n`;
  content += `## The Challenge\n${ind.pain}\n\n`;
  content += `## Our Solution\n${ind.solution}\n\n`;
  content += `## Case Study\n[Success story]\n\n`;
  content += `## Get Started\n[CTA]\n`;
  fs.writeFileSync(path.join(indDir, `industry-${String(i+1).padStart(2,'0')}-${ind.name.toLowerCase()}.md`), content);
});

// 26：集成指南
const integrations = [
  { name: "GitHub", type: "CI/CD", setup: "5 minutes" },
  { name: "GitLab", type: "CI/CD", setup: "5 minutes" },
  { name: "Slack", type: "Notification", setup: "2 minutes" },
  { name: "Jira", type: "Project Management", setup: "3 minutes" },
  { name: "AWS", type: "Cloud", setup: "10 minutes" },
  { name: "Docker", type: "Container", setup: "5 minutes" }
];

const intDir = path.join(__dirname, 'ai-agent-projects', 'content', 'integrations');
fs.mkdirSync(intDir, { recursive: true });

integrations.forEach((int, i) => {
  let content = `# ${int.name} Integration\n\n`;
  content += `**Type:** ${int.type}  \n**Setup Time:** ${int.setup}\n\n`;
  content += `## Prerequisites\n[List requirements]\n\n`;
  content += `## Setup Steps\n1. Step one\n2. Step two\n3. Step three\n\n`;
  content += `## Troubleshooting\n[Common issues]\n`;
  fs.writeFileSync(path.join(intDir, `integration-${String(i+1).padStart(2,'0')}-${int.name.toLowerCase()}.md`), content);
});

// 27：安全指南系列
const securityGuides = [
  { title: "OWASP Top 10 2025", topics: ["Injection", "Broken Auth", "Sensitive Data Exposure"] },
  { title: "Secure Coding Practices", topics: ["Input validation", "Output encoding", "Authentication"] },
  { title: "Cloud Security Basics", topics: ["IAM", "Network security", "Data protection"] },
  { title: "Mobile App Security", topics: ["Data storage", "Transport security", "Code obfuscation"] }
];

const guideDir = path.join(__dirname, 'ai-agent-projects', 'content', 'security-guides');
fs.mkdirSync(guideDir, { recursive: true });

securityGuides.forEach((g, i) => {
  let content = `# ${g.title}\n\n`;
  content += `## Overview\n[Introduction]\n\n`;
  g.topics.forEach((t, j) => {
    content += `## ${j+1}. ${t}\n[Detailed guide]\n\n`;
  });
  content += `## Summary\n[Key takeaways]\n`;
  fs.writeFileSync(path.join(guideDir, `guide-${String(i+1).padStart(2,'0')}-${g.title.toLowerCase().replace(/\s+/g, '-')}.md`), content);
});

console.log('✅ Batch 25: 5 industry solutions');
console.log('✅ Batch 26: 6 integration guides');
console.log('✅ Batch 27: 4 security guides');
