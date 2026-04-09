#!/usr/bin/env node
/**
 * Auto Content Generator - Continuous Mode
 * Generates content indefinitely until stopped
 */

const fs = require('fs');
const path = require('path');

// Topic database for endless generation
const topics = [
  { id: "secure-coding-practices", title: "Secure Coding Practices: OWASP Top 10 Prevention", category: "AppSec", tags: ["OWASP", "Secure Coding", "SDLC"] },
  { id: "api-security-testing", title: "API Security Testing: Tools and Techniques", category: "API Security", tags: ["API", "REST", "GraphQL", "Testing"] },
  { id: "mobile-app-security", title: "Mobile App Security: iOS and Android Best Practices", category: "Mobile Security", tags: ["iOS", "Android", "Mobile", "AppSec"] },
  { id: "iot-security-guide", title: "IoT Security: Protecting Connected Devices", category: "IoT", tags: ["IoT", "Embedded", "Smart Home"] },
  { id: "docker-security", title: "Docker Security: 12 Best Practices for Containers", category: "Container Security", tags: ["Docker", "Containers", "DevSecOps"] },
  { id: "siem-implementation", title: "SIEM Implementation: From Selection to Operation", category: "Security Operations", tags: ["SIEM", "Splunk", "ELK", "SOC"] },
  { id: "phishing-defense", title: "Phishing Defense: Technical and Human Controls", category: "Email Security", tags: ["Phishing", "Email", "Training"] },
  { id: "bug-bounty-guide", title: "Bug Bounty Guide: From Beginner to Pro", category: "Offensive Security", tags: ["Bug Bounty", "Hacking", "Research"] },
  { id: "red-team-vs-blue-team", title: "Red Team vs Blue Team: Understanding the Exercise", category: "Security Testing", tags: ["Red Team", "Blue Team", "Purple Team"] },
  { id: "compliance-frameworks", title: "Security Compliance: ISO 27001, SOC 2, and More", category: "Compliance", tags: ["Compliance", "ISO 27001", "SOC 2", "GDPR"] },
  { id: "penetration-testing", title: "Penetration Testing: A Complete Methodology", category: "Offensive Security", tags: ["Pentest", "Ethical Hacking", "Assessment"] },
  { id: "cryptography-basics", title: "Cryptography Basics for Security Professionals", category: "Cryptography", tags: ["Encryption", "TLS", "PKI", "Hashing"] },
  { id: "network-security", title: "Network Security: Firewalls, IDS, and Beyond", category: "Network Security", tags: ["Network", "Firewall", "IDS", "IPS"] },
  { id: "endpoint-security", title: "Endpoint Security: EDR, XDR, and Traditional AV", category: "Endpoint Security", tags: ["EDR", "XDR", "Antivirus", "Endpoint"] },
  { id: "dlp-strategies", title: "Data Loss Prevention: Strategies and Tools", category: "Data Protection", tags: ["DLP", "Data Protection", "Exfiltration"] },
  { id: "vpn-security", title: "VPN Security: IPsec, SSL, and WireGuard Compared", category: "Network Security", tags: ["VPN", "IPsec", "WireGuard", "SSL"] },
  { id: "ssltls-best-practices", title: "TLS/SSL Best Practices: Certificates and Configuration", category: "Cryptography", tags: ["TLS", "SSL", "Certificates", "HTTPS"] },
  { id: "web-application-firewall", title: "Web Application Firewall: WAF Deployment Guide", category: "AppSec", tags: ["WAF", "ModSecurity", "Protection"] },
  { id: "security-automation", title: "Security Automation: SOAR and Playbooks", category: "Security Operations", tags: ["SOAR", "Automation", "Playbooks"] },
  { id: "devsecops-pipeline", title: "DevSecOps Pipeline: Integrating Security into CI/CD", category: "DevSecOps", tags: ["DevSecOps", "CI/CD", "Pipeline", "Shift Left"] }
];

const templates = {
  intro: (title) => `# ${title}\n\n## Introduction\n\nThis comprehensive guide covers essential concepts, best practices, and actionable strategies.`,
  checklist: () => `\n\n## Quick Checklist\n\n- [ ] Assess current state\n- [ ] Implement controls\n- [ ] Monitor and measure\n- [ ] Review and improve`,
  conclusion: () => `\n\n## Conclusion\n\nSecurity is an ongoing journey. Stay updated with the latest threats and continuously improve your defenses.`,
  tools: (tools) => `\n\n## Recommended Tools\n\n${tools.map(t => `- ${t}`).join('\n')}`
};

function generateArticle(topic) {
  const content = [
    templates.intro(topic.title),
    `\n\n## Key Concepts\n\nUnderstanding ${topic.category} fundamentals is crucial for building robust security postures.`,
    `\n\n## Best Practices\n\n### 1. Risk Assessment\nIdentify and evaluate potential risks in your environment.\n\n### 2. Defense in Depth\nLayer multiple security controls for comprehensive protection.\n\n### 3. Continuous Monitoring\nImplement real-time monitoring and alerting.`,
    templates.tools([`Tool A for ${topic.category}`, `Tool B for ${topic.tags[0]}`, 'Industry-standard solution']),
    templates.checklist(),
    templates.conclusion()
  ].join('');
  
  return content;
}

function generate() {
  const outputDir = path.join(__dirname, 'content');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  const existing = fs.readdirSync(outputDir).filter(f => f.endsWith('.md'));
  const startIndex = existing.length;
  
  if (startIndex >= topics.length) {
    console.log('All topics generated!');
    return 0;
  }
  
  const topic = topics[startIndex];
  const fileName = topic.id + '.md';
  const filePath = path.join(outputDir, fileName);
  
  const date = new Date().toISOString().split('T')[0];
  const frontmatter = `---\ntitle: "${topic.title}"\ncategory: "${topic.category}"\ntags: [${topic.tags.map(t => `"${t}"`).join(', ')}]\ndate: "${date}"\n---\n\n`;
  
  fs.writeFileSync(filePath, frontmatter + generateArticle(topic));
  console.log(`Generated: ${fileName}`);
  return 1;
}

// Generate up to 5 articles per run
let count = 0;
const max = 5;

while (count < max) {
  const result = generate();
  if (result === 0) break;
  count += result;
}

const total = fs.readdirSync(path.join(__dirname, 'content')).filter(f => f.endsWith('.md')).length;
console.log(`\nGenerated ${count} articles`);
console.log(`Total: ${total} articles`);
