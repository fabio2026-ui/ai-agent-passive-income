#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const articles = [
  {
    id: "ai-security-prompt-injection",
    title: "AI Prompt Injection Attacks: How Hackers Manipulate LLMs",
    category: "AI Security",
    tags: ["AI Security", "LLM", "Prompt Injection", "ChatGPT"],
    content: `# AI Prompt Injection Attacks: How Hackers Manipulate LLMs

## The New Attack Vector

As AI models like GPT-4, Claude, and Gemini become integrated into applications, a new security threat has emerged: **prompt injection attacks**.

## What is Prompt Injection?

Prompt injection is an attack where malicious users craft inputs that override system instructions, extract hidden prompts, manipulate AI behavior, and access restricted data.

## Defense Strategies

1. Input Validation - Sanitize user inputs, block known injection patterns
2. Prompt Segregation - Separate system and user contexts
3. Least Privilege - Limit AI access to sensitive data

## Tools for Protection

- LangChain Guardrails
- Rebuff.ai
- Lakera Guard

## Conclusion

Prompt injection is the SQL injection of the AI era. Defend accordingly.`
  },
  {
    id: "supply-chain-security",
    title: "Supply Chain Security: Protecting Your Dependencies",
    category: "DevSecOps",
    tags: ["Supply Chain", "Dependencies", "npm", "PyPI"],
    content: `# Supply Chain Security: Protecting Your Dependencies

## The Supply Chain Threat

Modern applications depend on hundreds of external packages. Each dependency is a potential attack vector.

## Attack Vectors

- Dependency Confusion
- Typosquatting
- Compromised Maintainers

## Defense Checklist

- Audit all dependencies
- Pin exact versions
- Enable lock files
- Set up automated scanning

## Conclusion

Supply chain security is not optional. Use Snyk, Dependabot, and regular audits.`
  },
  {
    id: "zero-trust-architecture",
    title: "Zero Trust Architecture: Never Trust, Always Verify",
    category: "Architecture",
    tags: ["Zero Trust", "Architecture", "Network Security"],
    content: `# Zero Trust Architecture: Never Trust, Always Verify

## What is Zero Trust?

A security model that assumes breach and verifies each request.

## The Three Pillars

1. Verify Identity - MFA, identity-aware proxy
2. Validate Device - EDR, MDM, device health
3. Least Privilege - JIT access, micro-segmentation

## Implementation

Start small, prove value, expand incrementally.

## Conclusion

Zero Trust is a journey, not a destination.`
  },
  {
    id: "kubernetes-security",
    title: "Kubernetes Security: 15 Essential Best Practices",
    category: "Cloud Security",
    tags: ["Kubernetes", "K8s", "Container Security"],
    content: `# Kubernetes Security: 15 Essential Best Practices

## Security Checklist

1. Pod Security Standards
2. RBAC Configuration
3. Network Policies
4. Secrets Management
5. Image Security
6. Admission Controllers
7. Audit Logging
8. API Server Security
9. etcd Encryption
10. Runtime Security (Falco)
11. Resource Limits
12. Service Mesh
13. CIS Benchmarks
14. Vulnerability Scanning
15. Backup and Recovery

## Tools

- kube-bench
- Falco
- Trivy
- OPA/Gatekeeper

## Conclusion

Automate security checks in your CI/CD pipeline.`
  }
];

const outputDir = path.join(__dirname, 'content');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

let generated = 0;
const date = new Date().toISOString().split('T')[0];

articles.forEach(article => {
  const fileName = article.id + '.md';
  const filePath = path.join(outputDir, fileName);
  
  const frontmatter = '---\ntitle: "' + article.title + '"\ncategory: "' + article.category + '"\ntags: [' + article.tags.map(t => '"' + t + '"').join(', ') + ']\ndate: "' + date + '"\n---\n\n';
  
  fs.writeFileSync(filePath, frontmatter + article.content);
  console.log('Generated: ' + fileName);
  generated++;
});

console.log('\nGenerated ' + generated + ' new articles');
console.log('Location: ' + outputDir + '/');
