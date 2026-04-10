const fs = require('fs');
const path = require('path');

// 生成10篇技术深度文章 - 面向开发者
const techArticles = [
  {
    title: "Implementing JWT Authentication with Refresh Tokens: A Complete Guide",
    keywords: ["JWT", "authentication", "refresh tokens", "security"],
    difficulty: "Intermediate",
    codeExamples: true,
    sections: ["Introduction", "JWT Basics", "Access vs Refresh Tokens", "Implementation", "Security Best Practices", "Common Pitfalls"]
  },
  {
    title: "OAuth 2.0 and OpenID Connect: Enterprise Authentication Patterns",
    keywords: ["OAuth 2.0", "OpenID Connect", "SSO", "enterprise"],
    difficulty: "Advanced",
    codeExamples: true,
    sections: ["OAuth 2.0 Flows", "OpenID Connect Layer", "Enterprise Patterns", "Implementation Guide", "Testing Strategies"]
  },
  {
    title: "Secure Session Management in Modern Web Applications",
    keywords: ["session management", "cookies", "security", "web apps"],
    difficulty: "Intermediate",
    codeExamples: true,
    sections: ["Session Basics", "Cookie Security", "Session Storage", "Distributed Systems", "Attack Prevention"]
  },
  {
    title: "Building a Real-time Security Monitoring Dashboard with WebSockets",
    keywords: ["WebSockets", "real-time", "monitoring", "dashboard"],
    difficulty: "Advanced",
    codeExamples: true,
    sections: ["Architecture", "WebSocket Implementation", "Data Flow", "UI Components", "Performance Optimization"]
  },
  {
    title: "Automated Security Testing: Integrating SAST and DAST in CI/CD",
    keywords: ["SAST", "DAST", "CI/CD", "security testing", "automation"],
    difficulty: "Advanced",
    codeExamples: true,
    sections: ["SAST vs DAST", "Tool Selection", "CI/CD Integration", "Pipeline Configuration", "Results Analysis"]
  },
  {
    title: "Kubernetes Security: Pod Security Policies and Network Policies",
    keywords: ["Kubernetes", "security", "PSP", "network policies"],
    difficulty: "Advanced",
    codeExamples: true,
    sections: ["K8s Security Model", "Pod Security", "Network Isolation", "RBAC", "Runtime Security"]
  },
  {
    title: "Implementing Rate Limiting and Throttling for APIs",
    keywords: ["rate limiting", "throttling", "API", "performance"],
    difficulty: "Intermediate",
    codeExamples: true,
    sections: ["Rate Limiting Strategies", "Algorithms", "Implementation", "Distributed Systems", "Monitoring"]
  },
  {
    title: "Database Security: Encryption, Masking, and Access Control",
    keywords: ["database security", "encryption", "masking", "access control"],
    difficulty: "Intermediate",
    codeExamples: true,
    sections: ["Encryption at Rest", "Encryption in Transit", "Data Masking", "Access Control", "Audit Logging"]
  },
  {
    title: "Web Application Firewall (WAF) Rules and Configuration",
    keywords: ["WAF", "firewall", "web security", "rules"],
    difficulty: "Intermediate",
    codeExamples: true,
    sections: ["WAF Basics", "Rule Types", "OWASP Core Rule Set", "Custom Rules", "Tuning and Maintenance"]
  },
  {
    title: "Penetration Testing Methodology: From Recon to Report",
    keywords: ["penetration testing", "pentest", "security assessment"],
    difficulty: "Advanced",
    codeExamples: false,
    sections: ["Planning and Scoping", "Reconnaissance", "Vulnerability Discovery", "Exploitation", "Reporting"]
  }
];

// 生成文章
function generateTechArticle(article) {
  let content = `# ${article.title}\n\n`;
  content += `**Difficulty:** ${article.difficulty}  \n`;
  content += `**Keywords:** ${article.keywords.join(', ')}  \n`;
  content += `**Estimated Reading Time:** 15-20 minutes\n\n`;
  content += `---\n\n`;
  
  content += `## Table of Contents\n\n`;
  article.sections.forEach((section, i) => {
    content += `${i + 1}. [${section}](#${section.toLowerCase().replace(/\s+/g, '-')})\n`;
  });
  content += `\n---\n\n`;
  
  article.sections.forEach((section, i) => {
    content += `## ${section}\n\n`;
    content += `### Overview\n\n`;
    content += `[Detailed explanation of ${section} goes here...]\n\n`;
    
    if (article.codeExamples && i % 2 === 0) {
      content += `### Code Example\n\n`;
      content += '\`\`\`javascript\n';
      content += `// Example code for ${section}\n`;
      content += `const implementation = () => {\n`;
      content += `  // TODO: Add actual implementation\n`;
      content += `  return 'example';\n`;
      content += `};\n`;
      content += '\`\`\`\n\n';
    }
    
    content += `### Key Points\n\n`;
    content += `- Important point 1\n`;
    content += `- Important point 2\n`;
    content += `- Important point 3\n\n`;
  });
  
  content += `---\n\n`;
  content += `## Conclusion\n\n`;
  content += `Summary and next steps...\n\n`;
  content += `## Further Reading\n\n`;
  content += `- [Related Article 1](#)\n`;
  content += `- [Related Article 2](#)\n`;
  content += `- [Official Documentation](#)\n\n`;
  
  return content;
}

// 保存文章
const outputDir = path.join(__dirname, 'ai-agent-projects', 'content', 'tech-deep-dives');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

techArticles.forEach((article, index) => {
  const filename = `tech-${String(index + 1).padStart(2, '0')}-${article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)}.md`;
  const content = generateTechArticle(article);
  fs.writeFileSync(path.join(outputDir, filename), content);
  console.log(`✅ Generated: ${filename}`);
});

// 生成技术文章索引
const index = {
  generated: new Date().toISOString(),
  count: techArticles.length,
  articles: techArticles.map((a, i) => ({
    id: i + 1,
    title: a.title,
    difficulty: a.difficulty,
    keywords: a.keywords,
    hasCode: a.codeExamples
  }))
};

fs.writeFileSync(
  path.join(outputDir, 'index.json'),
  JSON.stringify(index, null, 2)
);

console.log(`\n🎉 Generated ${techArticles.length} technical deep-dive articles!`);
console.log(`📁 Location: ${outputDir}`);
