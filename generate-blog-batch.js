const fs = require('fs');
const path = require('path');

// 生成10篇SEO博客文章 - 网络安全长尾关键词
const blogPosts = [
  {
    title: "How to Implement Zero Trust Architecture in 2025: A Step-by-Step Guide",
    keywords: ["zero trust architecture", "zero trust implementation", "cybersecurity framework"],
    outline: [
      "What is Zero Trust Architecture?",
      "Core Principles of Zero Trust",
      "Step-by-Step Implementation Guide",
      "Tools and Technologies Needed",
      "Common Pitfalls to Avoid",
      "ROI and Business Benefits"
    ],
    wordCount: 2500
  },
  {
    title: "SOC 2 Compliance Checklist 2025: Complete Guide for Startups",
    keywords: ["SOC 2 compliance", "SOC 2 checklist", "startup compliance"],
    outline: [
      "What is SOC 2 and Why It Matters",
      "Type I vs Type II: Which Do You Need?",
      "The 5 Trust Service Criteria Explained",
      "Preparation Checklist",
      "Audit Process Timeline",
      "Cost Breakdown and Budget Planning"
    ],
    wordCount: 3000
  },
  {
    title: "API Security Best Practices: Protecting Your Digital Infrastructure",
    keywords: ["API security", "API protection", "REST API security"],
    outline: [
      "The Growing Threat to APIs",
      "Authentication and Authorization",
      "Rate Limiting and Throttling",
      "Input Validation and Sanitization",
      "API Gateway Security",
      "Monitoring and Logging"
    ],
    wordCount: 2200
  },
  {
    title: "DevSecOps Tools Comparison 2025: Top 15 Solutions Reviewed",
    keywords: ["DevSecOps tools", "security automation", "DevSecOps comparison"],
    outline: [
      "What is DevSecOps?",
      "Categories of DevSecOps Tools",
      "Top 5 SAST Tools Compared",
      "Top 5 DAST Tools Compared",
      "Top 5 Container Security Tools",
      "Integration and Implementation Tips"
    ],
    wordCount: 3500
  },
  {
    title: "Ransomware Protection Strategy: Defense in Depth Approach",
    keywords: ["ransomware protection", "ransomware defense", "malware prevention"],
    outline: [
      "Understanding Modern Ransomware",
      "Layer 1: Endpoint Protection",
      "Layer 2: Network Segmentation",
      "Layer 3: Email Security",
      "Layer 4: Backup and Recovery",
      "Incident Response Playbook"
    ],
    wordCount: 2800
  },
  {
    title: "Passwordless Authentication: Implementation Guide for Developers",
    keywords: ["passwordless authentication", "FIDO2", "WebAuthn"],
    outline: [
      "Why Passwords Are Obsolete",
      "Passwordless Authentication Methods",
      "FIDO2 and WebAuthn Explained",
      "Implementation Steps",
      "User Experience Considerations",
      "Migration Strategy from Passwords"
    ],
    wordCount: 2400
  },
  {
    title: "Cloud Security Posture Management (CSPM): Complete Guide",
    keywords: ["CSPM", "cloud security", "AWS security", "Azure security"],
    outline: [
      "What is CSPM?",
      "Key Capabilities of CSPM Tools",
      "AWS Security Best Practices",
      "Azure Security Best Practices",
      "GCP Security Best Practices",
      "Top CSPM Tools Compared"
    ],
    wordCount: 2600
  },
  {
    title: "Security Automation: Building Your First SOAR Playbook",
    keywords: ["SOAR", "security automation", "SOAR playbook"],
    outline: [
      "Introduction to SOAR",
      "Benefits of Security Automation",
      "Common Use Cases",
      "Building Your First Playbook",
      "Integration with SIEM",
      "Measuring ROI"
    ],
    wordCount: 2300
  },
  {
    title: "Container Security Scanning: Docker and Kubernetes Guide",
    keywords: ["container security", "Docker security", "Kubernetes security"],
    outline: [
      "Container Security Challenges",
      "Image Vulnerability Scanning",
      "Runtime Protection",
      "Kubernetes Security Best Practices",
      "Supply Chain Security",
      "Tool Recommendations"
    ],
    wordCount: 2100
  },
  {
    title: "GDPR Compliance for SaaS: Technical Implementation Guide",
    keywords: ["GDPR compliance", "SaaS compliance", "data privacy"],
    outline: [
      "GDPR Requirements for SaaS",
      "Data Mapping and Classification",
      "Consent Management",
      "Right to Erasure Implementation",
      "Data Portability Solutions",
      "Audit and Reporting"
    ],
    wordCount: 2700
  }
];

// 生成博客文章内容
function generateBlogContent(post) {
  let content = `# ${post.title}\n\n`;
  content += `**Keywords:** ${post.keywords.join(', ')}\n\n`;
  content += `**Word Count:** ${post.wordCount} words\n\n`;
  content += `---\n\n`;
  
  post.outline.forEach((section, index) => {
    content += `## ${index + 1}. ${section}\n\n`;
    content += `[Content placeholder - ${Math.round(post.wordCount / post.outline.length)} words]\n\n`;
    content += `Key points to cover:\n`;
    content += `- Important detail #1\n`;
    content += `- Important detail #2\n`;
    content += `- Actionable insight\n\n`;
  });
  
  content += `---\n\n`;
  content += `## Conclusion\n\n`;
  content += `Summary of key takeaways and call to action.\n\n`;
  content += `## FAQ\n\n`;
  content += `**Q: Common question?**\n`;
  content += `A: Detailed answer.\n\n`;
  
  return content;
}

// 写入文件
const blogDir = path.join(__dirname, 'ai-agent-projects', 'content', 'blog-posts');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

blogPosts.forEach((post, index) => {
  const filename = `blog-${String(index + 1).padStart(2, '0')}-${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)}.md`;
  const filepath = path.join(blogDir, filename);
  const content = generateBlogContent(post);
  fs.writeFileSync(filepath, content);
  console.log(`✅ Generated: ${filename}`);
});

console.log(`\n🎉 Generated ${blogPosts.length} blog posts!`);
console.log(`📁 Location: ${blogDir}`);

// 生成内容日历
const contentCalendar = {
  weeks: [
    { week: 1, posts: ["Zero Trust Guide", "SOC 2 Checklist"], channels: ["Blog", "Twitter", "LinkedIn"] },
    { week: 2, posts: ["API Security", "DevSecOps Tools"], channels: ["Blog", "Reddit", "Twitter"] },
    { week: 3, posts: ["Ransomware Protection", "Passwordless Auth"], channels: ["Blog", "Newsletter"] },
    { week: 4, posts: ["CSPM Guide", "SOAR Playbook"], channels: ["Blog", "LinkedIn", "Twitter"] },
    { week: 5, posts: ["Container Security", "GDPR Guide"], channels: ["Blog", "Reddit", "Dev.to"] }
  ]
};

fs.writeFileSync(
  path.join(__dirname, 'ai-agent-projects', 'content', 'content-calendar.json'),
  JSON.stringify(contentCalendar, null, 2)
);
console.log(`✅ Generated: content-calendar.json`);
