const fs = require('fs');
const path = require('path');

// 批量28-30：FAQ、词汇表、资源中心

// 28：FAQ页面
const faqs = [
  { q: "How does the free tier work?", a: "The free tier includes 1 project with basic scans forever. No credit card required." },
  { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time with no penalties." },
  { q: "Do you offer refunds?", a: "We offer a 30-day money-back guarantee for all paid plans." },
  { q: "How long does setup take?", a: "Most users are up and running in under 5 minutes." },
  { q: "Is my data secure?", a: "Yes, we use enterprise-grade encryption and never sell your data." },
  { q: "Do you support on-premise deployment?", a: "Yes, our Enterprise plan includes on-premise options." }
];

const faqDir = path.join(__dirname, 'ai-agent-projects', 'content', 'faq');
fs.mkdirSync(faqDir, { recursive: true });

let faqContent = `# Frequently Asked Questions\n\n`;
faqs.forEach((f, i) => {
  faqContent += `## Q${i+1}: ${f.q}\n${f.a}\n\n`;
});
fs.writeFileSync(path.join(faqDir, 'faq-page.md'), faqContent);

// 29：安全词汇表
const glossary = {
  "CVE": "Common Vulnerabilities and Exposures - standardized identifiers for security vulnerabilities",
  "XSS": "Cross-Site Scripting - injection attack where malicious scripts are injected into trusted websites",
  "CSRF": "Cross-Site Request Forgery - attack that tricks users into executing unwanted actions",
  "SAST": "Static Application Security Testing - analyzes source code for security vulnerabilities",
  "DAST": "Dynamic Application Security Testing - tests running applications for vulnerabilities",
  "Zero Trust": "Security model that requires strict identity verification for every access request"
};

const glossDir = path.join(__dirname, 'ai-agent-projects', 'content', 'glossary');
fs.mkdirSync(glossDir, { recursive: true });

let glossContent = `# Security Glossary\n\n`;
Object.entries(glossary).forEach(([term, def]) => {
  glossContent += `## ${term}\n${def}\n\n`;
});
fs.writeFileSync(path.join(glossDir, 'security-glossary.md'), glossContent);

// 30：资源下载中心
const resources = [
  { name: "Security Checklist PDF", type: "PDF", size: "2MB" },
  { name: "API Security Poster", type: "Image", size: "5MB" },
  { name: "Incident Response Template", type: "DOCX", size: "500KB" },
  { name: "SOC 2 Preparation Guide", type: "PDF", size: "3MB" },
  { name: "Docker Security Scripts", type: "ZIP", size: "1MB" }
];

const resDir = path.join(__dirname, 'ai-agent-projects', 'content', 'resources');
fs.mkdirSync(resDir, { recursive: true });

let resContent = `# Resource Center\n\n## Downloads\n\n`;
resources.forEach(r => {
  resContent += `- **${r.name}** (${r.type}, ${r.size})\n`;
});
resContent += `\n[Access All Resources]\n`;
fs.writeFileSync(path.join(resDir, 'resource-center.md'), resContent);

console.log('✅ Batch 28: FAQ page');
console.log('✅ Batch 29: Security glossary');
console.log('✅ Batch 30: Resource center');
