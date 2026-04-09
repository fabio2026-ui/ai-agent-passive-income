#!/usr/bin/env node
/**
 * Batch Content Generator v9 - Advanced Topics 2
 */

const fs = require('fs');
const path = require('path');

const articles = [
  {
    id: "secure-coding-owasp",
    title: "Secure Coding Practices: Defending Against OWASP Top 10",
    category: "AppSec",
    tags: ["OWASP", "Secure Coding", "SDLC", "Prevention"],
    content: `# Secure Coding Practices: Defending Against OWASP Top 10

## OWASP Top 10 Overview

The OWASP Top 10 represents the most critical security risks to web applications:

1. Broken Access Control
2. Cryptographic Failures
3. Injection (SQL, NoSQL, Command)
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable and Outdated Components
7. Identification and Authentication Failures
8. Software and Data Integrity Failures
9. Security Logging and Monitoring Failures
10. Server-Side Request Forgery (SSRF)

## Defense by Category

### A01: Broken Access Control
- Deny by default
- Implement once, reuse everywhere
- Disable web server directory listing
- Log access control failures

### A03: Injection Prevention
- Use parameterized queries
- Validate all inputs
- Escape special characters
- Use safe APIs

### A07: Authentication Best Practices
- Multi-factor authentication
- Strong password policies
- Secure session management
- Rate limiting on login

## Secure SDLC

1. Requirements: Define security requirements
2. Design: Threat modeling
3. Development: Secure coding standards
4. Testing: Security testing automation
5. Deployment: Secure configuration
6. Maintenance: Continuous monitoring

## Tools

- SAST: SonarQube, Checkmarx, Semgrep
- DAST: OWASP ZAP, Burp Suite
- SCA: Snyk, OWASP Dependency-Check
- IAST: Contrast Security, Seeker

## Conclusion

Shift security left. Find and fix vulnerabilities early in the SDLC.
`
  },
  {
    id: "api-security-guide",
    title: "API Security: REST, GraphQL, and gRPC Protection",
    category: "API Security",
    tags: ["API", "REST", "GraphQL", "gRPC", "Authentication"],
    content: `# API Security: REST, GraphQL, and gRPC Protection

## API Security Fundamentals

APIs are the backbone of modern applications and prime attack targets.

## Authentication Methods

### API Keys
- Simple but limited
- Good for rate limiting
- Not for sensitive data

### OAuth 2.0
- Industry standard
- Token-based
- Scope-based permissions

### JWT (JSON Web Tokens)
- Stateless authentication
- Self-contained
- Verify signature always

### mTLS (Mutual TLS)
- Client certificate authentication
- Highest security
- Certificate management overhead

## REST API Security

### Input Validation
- Schema validation (JSON Schema)
- Content-Type enforcement
- Size limits
- Parameter pollution prevention

### Rate Limiting
- Per user/IP
- Different tiers for endpoints
- Exponential backoff

### CORS Configuration
- Whitelist specific origins
- Limit allowed methods
- Control exposed headers

## GraphQL Security

### Query Depth Limiting
Prevent deeply nested queries causing DoS.

### Complexity Analysis
Assign costs to fields and limit total query cost.

### Introspection Control
Disable introspection in production.

## gRPC Security

- TLS encryption (ALTS on GCP)
- Authentication interceptors
- Deadline and timeout configuration

## API Gateway

Centralized security controls:
- Authentication
- Rate limiting
- Logging
- Request validation

Popular options: Kong, AWS API Gateway, Azure API Management

## Testing APIs

- Postman collections with security tests
- OWASP API Security Top 10
- Fuzz testing
- Contract testing

## Conclusion

API security requires defense in depth. Authenticate, authorize, validate, and monitor.
`
  },
  {
    id: "container-security-guide",
    title: "Container Security: Docker and Kubernetes Hardening",
    category: "Container Security",
    tags: ["Docker", "Kubernetes", "Containers", "Hardening"],
    content: `# Container Security: Docker and Kubernetes Hardening

## Container Security Layers

### 1. Image Security
- Use minimal base images (Alpine, Distroless)
- Regular base image updates
- Scan for vulnerabilities
- Sign and verify images

### 2. Registry Security
- Private registries
- Access control
- Image signing (Notary, Cosign)
- Vulnerability scanning

### 3. Runtime Security
- Read-only root filesystems
- Drop unnecessary capabilities
- Resource limits
- Network policies

### 4. Orchestration Security
- RBAC configuration
- Pod security policies
- Secrets management
- Audit logging

## Dockerfile Best Practices

\`\`\`dockerfile
# Use specific version
FROM node:18-alpine

# Run as non-root
USER node

# Copy only necessary files
COPY package*.json ./
RUN npm ci --only=production

# Read-only root filesystem
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD curl -f http://localhost:3000/health || exit 1
\`\`\`

## Kubernetes Security

### Pod Security Standards
- Restricted (maximum security)
- Baseline (minimal restrictions)
- Privileged (unrestricted)

### Network Policies
Segment traffic between pods:
\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
\`\`\`

### Secrets Management
- External Secrets Operator
- Sealed Secrets
- Vault integration
- Never commit secrets

## Scanning Tools

| Tool | Purpose |
|------|---------|
| Trivy | Image vulnerability scanning |
| Clair | Container vulnerability analysis |
| Falco | Runtime threat detection |
| kube-bench | CIS Kubernetes benchmarks |

## Supply Chain Security

- SBOM generation
- SLSA compliance
- Reproducible builds
- Signed artifacts

## Conclusion

Container security spans the entire lifecycle from build to runtime.
`
  },
  {
    id: "social-engineering-defense",
    title: "Social Engineering Defense: The Human Firewall",
    category: "Security Awareness",
    tags: ["Social Engineering", "Phishing", "Training", "Awareness"],
    content: `# Social Engineering Defense: The Human Firewall

## The Human Element

91% of cyberattacks start with social engineering. Technical controls alone are insufficient.

## Common Attack Types

### Phishing
- Mass emails with malicious links
- Urgency and fear tactics
- Spoofed sender addresses

### Spear Phishing
- Targeted at specific individuals
- Research-based personalization
- Often impersonate executives

### Pretexting
- Creating fabricated scenarios
- Impersonating authority figures
- Building trust over time

### Baiting
- Physical media (USB drives)
- Too-good-to-be-true offers
- Exploiting curiosity

### Quid Pro Quo
- Offering service in exchange for info
- Fake IT support calls
- Immediate problem resolution

## Red Flags

- Urgency and pressure
- Requests for sensitive info
- Unexpected attachments
- Mismatched URLs
- Generic greetings
- Grammar and spelling errors

## Defense Strategies

### Technical Controls
- Email filtering and sandboxing
- Link protection and rewriting
- Attachment scanning
- DMARC/DKIM/SPF

### Process Controls
- Verification procedures
- Out-of-band confirmation
- Segregation of duties
- Change management

### Training Programs
- Regular phishing simulations
- Interactive training modules
- Security newsletters
- Reward good behavior

## Building a Security Culture

1. Leadership buy-in
2. Make security easy
3. Positive reinforcement
4. Real-world examples
5. Regular updates

## Incident Response

When someone falls for an attack:
1. Report immediately (no punishment)
2. Contain the incident
3. Investigate scope
4. Remediate and recover
5. Update training based on lessons

## Metrics

- Phishing simulation click rates
- Reporting rates
- Training completion
- Time to report

## Conclusion

Your employees can be your strongest defense or weakest link. Invest in security awareness.
`
  },
  {
    id: "bug-bounty-beginners-guide",
    title: "Bug Bounty for Beginners: Getting Started Guide",
    category: "Offensive Security",
    tags: ["Bug Bounty", "Hacking", "Web Security", "Research"],
    content: `# Bug Bounty for Beginners: Getting Started Guide

## What is Bug Bounty?

Organizations pay security researchers to find vulnerabilities. It's a win-win: companies improve security, researchers earn money.

## Getting Started

### Prerequisites
- Understanding of web technologies
- Basic programming knowledge
- Familiarity with common vulnerabilities
- Patience and persistence

### Learning Path

1. **Web Fundamentals**
   - HTTP/HTTPS protocols
   - HTML, JavaScript, CSS
   - Web servers and databases

2. **Security Basics**
   - OWASP Top 10
   - Common vulnerability types
   - Tools of the trade

3. **Practice Platforms**
   - PortSwigger Web Security Academy (free)
   - Hack The Box
   - TryHackMe
   - Vulnerable web apps (DVWA, WebGoat)

## Essential Tools

| Category | Tools |
|----------|-------|
| Proxy | Burp Suite, OWASP ZAP |
| Recon | Nmap, Amass, Sublist3r |
| Discovery | ffuf, Gobuster, Dirsearch |
| Testing | SQLMap, XSStrike, Commix |
| Notes | Notion, Obsidian, CherryTree |

## First Bug Bounty Steps

1. Choose a platform (HackerOne, Bugcrowd, Intigriti)
2. Read program policies carefully
3. Start with VDP (Vulnerability Disclosure Programs) - no pay but good practice
4. Look for low-hanging fruit
5. Write clear, detailed reports

## Report Structure

1. Title: Clear and concise
2. Severity: CVSS score or severity rating
3. Summary: Executive overview
4. Steps to reproduce: Detailed, numbered
5. Impact: What could an attacker do?
6. Proof of Concept: Screenshots, videos
7. Remediation: How to fix

## Common First Bugs

- Reflected XSS
- CSRF on sensitive actions
- Information disclosure
- Weak password policy
- Missing rate limiting

## Building Reputation

- Start with low-severity findings
- Be professional and polite
- Accept duplicate gracefully
- Write quality reports
- Participate in community

## Income Expectations

| Level | Range | Timeline |
|-------|-------|----------|
| Beginner | $0-500/month | 6-12 months |
| Intermediate | $500-3000/month | 1-2 years |
| Advanced | $3000+/month | 2+ years |
| Elite | $10000+/month | Full-time |

## Staying Legal

- Only test on authorized programs
- Respect scope and rules
- Don't access customer data
- Report promptly
- No extortion or blackmail

## Conclusion

Bug bounty requires dedication and continuous learning. Start small, be persistent, and always be learning.
`
  },
  {
    id: "devsecops-implementation",
    title: "DevSecOps Implementation: Security as Code",
    category: "DevSecOps",
    tags: ["DevSecOps", "CI/CD", "Automation", "Shift Left"],
    content: `# DevSecOps Implementation: Security as Code

## What is DevSecOps?

Integrating security into the DevOps pipeline - "shifting left" to find vulnerabilities earlier when they're cheaper to fix.

## The DevSecOps Pipeline

\`\`\`
Plan → Code → Build → Test → Release → Deploy → Operate → Monitor
   ↑     ↑      ↑      ↑       ↑        ↑        ↑        ↑
Security integrated at every stage
\`\`\`

## Key Principles

1. **Automation First**
   - Automated security testing
   - Policy as code
   - Self-service security

2. **Shared Responsibility**
   - Security is everyone's job
   - Cross-functional teams
   - Common goals and metrics

3. **Feedback Loops**
   - Fast feedback to developers
   - Actionable remediation guidance
   - Continuous improvement

## Pipeline Security Stages

### 1. Code
- Pre-commit hooks (secrets scanning)
- IDE security plugins
- Linting for security issues

### 2. Build
- SAST (Static Analysis)
- SCA (Software Composition Analysis)
- License compliance

### 3. Test
- DAST (Dynamic Analysis)
- IAST (Interactive Analysis)
- Container scanning

### 4. Release
- Image signing
- Compliance gates
- Security sign-off automation

### 5. Deploy
- Infrastructure as Code scanning
- Configuration validation
- Runtime protection

## Tools Integration

| Stage | Tools |
|-------|-------|
| Pre-commit | git-secrets, detect-secrets |
| SAST | SonarQube, Semgrep, Checkmarx |
| SCA | Snyk, OWASP Dependency-Check |
| DAST | OWASP ZAP, Burp Suite |
| Container | Trivy, Clair, Snyk Container |
| IaC | Checkov, tfsec, terrascan |

## Cultural Transformation

### For Developers
- Security training
- Secure coding guidelines
- Self-service security tools
- Recognition for security focus

### For Security Teams
- Enable, don't block
- Automate reviews
- Provide clear guidance
- Measure outcomes, not just activity

## Metrics

- Mean time to remediate (MTTR)
- Vulnerability escape rate
- Security test coverage
- False positive rate
- Time to security sign-off

## Challenges

- Tool sprawl and integration
- Managing false positives
- Balancing speed and security
- Legacy application support
- Skills gap

## Success Factors

1. Executive sponsorship
2. Start small, expand gradually
3. Automate everything possible
4. Measure and communicate value
5. Continuous learning culture

## Conclusion

DevSecOps is a journey, not a destination. Start with automation, build culture, and continuously improve.
`
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
console.log('Total: ' + fs.readdirSync(outputDir).filter(f => f.endsWith('.md')).length);
