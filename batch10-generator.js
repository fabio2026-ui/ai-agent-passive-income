#!/usr/bin/env node
/**
 * Batch Content Generator v10 - Final Comprehensive Topics
 */

const fs = require('fs');
const path = require('path');

const articles = [
  {
    id: "compliance-frameworks-guide",
    title: "Security Compliance: ISO 27001, SOC 2, and PCI DSS",
    category: "Compliance",
    tags: ["Compliance", "ISO 27001", "SOC 2", "PCI DSS", "Audit"],
    content: `# Security Compliance: ISO 27001, SOC 2, and PCI DSS

## Why Compliance Matters

Compliance frameworks provide structured approaches to security. They're often required by customers, regulators, and partners.

## ISO 27001

### What It Is
International standard for information security management systems (ISMS).

### Key Components
- Risk assessment
- Security policies
- Access control
- Incident management
- Business continuity

### Certification Process
1. Gap analysis
2. Risk treatment
3. Documentation
4. Internal audit
5. Stage 1 audit
6. Stage 2 audit
7. Certification
8. Surveillance audits

### Timeline
6-18 months for initial certification

## SOC 2

### What It Is
Service Organization Control - audit of security controls for service providers.

### Trust Services Criteria
- Security (CC6.1-CC6.8)
- Availability
- Processing integrity
- Confidentiality
- Privacy

### Type I vs Type II
- **Type I**: Point-in-time assessment
- **Type II**: Operating effectiveness over time (6-12 months)

### Audit Process
1. Readiness assessment
2. Control implementation
3. Evidence collection
4. Auditor testing
5. Report issuance

## PCI DSS

### What It Is
Payment Card Industry Data Security Standard for handling credit card data.

### 12 Requirements
1. Install and maintain firewalls
2. Default passwords changed
3. Protect stored cardholder data
4. Encrypt transmission
5. Anti-virus software
6. Secure systems and applications
7. Restrict access to need-to-know
8. Unique user IDs
9. Restrict physical access
10. Monitor network access
11. Regular security testing
12. Information security policy

### Compliance Levels
| Level | Transactions | Requirements |
|-------|--------------|--------------|
| 1 | >6M/year | Annual QSA audit |
| 2 | 1-6M/year | SAQ + ASV scan |
| 3 | 20k-1M/year | SAQ + ASV scan |
| 4 | <20k/year | SAQ |

## Comparison

| Aspect | ISO 27001 | SOC 2 | PCI DSS |
|--------|-----------|-------|---------|
| Focus | ISMS | Service providers | Payment data |
| Geographic | Global | US-focused | Global |
| Validity | 3 years | 1 year | Annual |
| Auditor | Accredited CB | CPA firm | QSA/ISA |

## Preparation Tips

1. Start with gap assessment
2. Implement controls incrementally
3. Document everything
4. Regular internal audits
5. Management commitment

## Tools

- GRC platforms (Vanta, Drata, Hyperproof)
- Evidence collection automation
- Policy management
- Risk registers

## Conclusion

Compliance is not security, but good security enables compliance. Choose frameworks based on business needs.
`
  },
  {
    id: "penetration-testing-methodology",
    title: "Penetration Testing Methodology: From Recon to Report",
    category: "Offensive Security",
    tags: ["Pentest", "Methodology", "Ethical Hacking", "Assessment"],
    content: `# Penetration Testing Methodology: From Recon to Report

## The PTES Standard

Penetration Testing Execution Standard - industry framework for testing.

## Phases

### 1. Pre-Engagement
- Scope definition
- Rules of engagement
- Legal agreements
- Emergency contacts

### 2. Intelligence Gathering
#### Passive Recon
- WHOIS lookups
- DNS enumeration
- OSINT (social media, GitHub)
- Shodan, Censys

#### Active Recon
- Port scanning
- Service enumeration
- Network mapping

### 3. Threat Modeling
- Identify assets
- Determine threats
- Prioritize targets

### 4. Vulnerability Analysis
- Automated scanning
- Manual verification
- Business logic flaws
- Configuration review

### 5. Exploitation
- Proof of concept
- Privilege escalation
- Lateral movement
- Data access demonstration

### 6. Post-Exploitation
- Persistence mechanisms
- Impact assessment
- Cleanup procedures

### 7. Reporting
- Executive summary
- Technical findings
- Risk ratings
- Remediation advice

## Tools by Phase

| Phase | Tools |
|-------|-------|
| Recon | Nmap, Masscan, Amass, theHarvester |
| Web | Burp Suite, OWASP ZAP, Nikto |
| Network | Metasploit, Responder, Impacket |
| Wireless | Aircrack-ng, WiFite |
| Social | Gophish, SET |

## Writing Reports

### Structure
1. Executive Summary
2. Scope and Methodology
3. Findings (severity ordered)
4. Risk Matrix
5. Remediation Roadmap
6. Appendices

### Risk Rating
- Critical: Immediate exploit, high impact
- High: Easy exploit, significant impact
- Medium: Moderate difficulty or impact
- Low: Difficult or limited impact
- Informational: No direct risk

## Types of Tests

| Type | Knowledge | Access | Use Case |
|------|-----------|--------|----------|
| Black Box | None | External | Real attacker simulation |
| Gray Box | Limited | Some credentials | Efficient testing |
| White Box | Full | Full access | Comprehensive assessment |

## Rules of Engagement

- Never test without written authorization
- Respect scope boundaries
- Minimize business impact
- Protect discovered data
- Report immediately if out of scope

## Conclusion

Methodology ensures thoroughness and professionalism. Adapt to context but maintain structure.
`
  },
  {
    id: "network-security-fundamentals",
    title: "Network Security: Firewalls, IDS, and Network Segmentation",
    category: "Network Security",
    tags: ["Network", "Firewall", "IDS", "IPS", "Segmentation"],
    content: `# Network Security: Firewalls, IDS, and Network Segmentation

## Network Security Layers

### Perimeter Security
- Firewalls (stateful inspection)
- Intrusion Detection/Prevention Systems
- Web Application Firewalls
- DDoS protection

### Internal Security
- Network segmentation
- Access control lists
- Private VLANs
- Internal firewalls

## Firewall Types

### Packet Filtering
- Layer 3/4 decisions
- Fast but limited visibility
- Stateless or stateful

### Application Layer (Proxy)
- Deep packet inspection
- Protocol awareness
- Higher latency

### Next-Generation (NGFW)
- Application identification
- User identity
- Threat intelligence
- SSL inspection

## IDS vs IPS

### Intrusion Detection System (IDS)
- Monitors and alerts
- Passive
- High false positive tolerance

### Intrusion Prevention System (IPS)
- Active blocking
- Inline deployment
- Risk of false positive disruption

### Common Solutions
- Snort (open source)
- Suricata (open source)
- Cisco Firepower
- Palo Alto Threat Prevention

## Network Segmentation

### Benefits
- Limit lateral movement
- Contain breaches
- Regulatory compliance
- Performance isolation

### Approaches

#### VLANs
- Layer 2 separation
- Cost-effective
- Limited security

#### Micro-segmentation
- Workload-level policies
- Software-defined
- Zero Trust compatible

#### Air Gapping
- Physical separation
- Highest security
- Highest inconvenience

## DMZ Architecture

\`\`\`
Internet → Firewall → DMZ (public servers) → Firewall → Internal Network
\`\`\`

## Zero Trust Networking

Principles:
- Never trust, always verify
- Least privilege access
- Assume breach
- Comprehensive monitoring

Implementations:
- Software-Defined Perimeter (SDP)
- Identity-aware proxies
- Micro-segmentation

## Monitoring

### NetFlow/sFlow
- Traffic patterns
- Bandwidth usage
- Anomaly detection

### Packet Capture
- Deep analysis
- Forensics
- Protocol debugging

### Network Behavior Analysis
- Baseline establishment
- Deviation detection
- Threat hunting

## Best Practices

1. Default deny all
2. Explicit allow rules
3. Regular rule review
4. Document all exceptions
5. Test failover scenarios
6. Monitor everything

## Conclusion

Network security is foundational. Layer defenses and segment aggressively.
`
  },
  {
    id: "data-encryption-guide",
    title: "Data Encryption: At Rest, In Transit, and In Use",
    category: "Cryptography",
    tags: ["Encryption", "Cryptography", "Data Protection", "Privacy"],
    content: `# Data Encryption: At Rest, In Transit, and In Use

## Encryption States

### At Rest
Data stored on disk, databases, backups.

### In Transit
Data moving across networks.

### In Use
Data being processed in memory.

## Encryption at Rest

### Database Encryption
- Transparent Data Encryption (TDE)
- Column-level encryption
- Application-level encryption

### File Encryption
- Full disk encryption (BitLocker, FileVault, LUKS)
- File-level encryption (EFS, EncFS)
- Container encryption (VeraCrypt)

### Cloud Storage
- Server-side encryption (SSE-S3, SSE-KMS)
- Client-side encryption
- Bucket policies enforcement

## Encryption in Transit

### TLS/SSL
- TLS 1.3 (preferred)
- Certificate pinning
- HSTS headers

### VPN Technologies
- IPsec (site-to-site)
- SSL VPN (remote access)
- WireGuard (modern, fast)

### Application Level
- HTTPS everywhere
- mTLS for service-to-service
- SSH for administration

## Encryption in Use

### Confidential Computing
- Intel SGX
- AMD SEV
- ARM TrustZone

### Homomorphic Encryption
- Compute on encrypted data
- Performance overhead
- Emerging technology

### Secure Enclaves
- AWS Nitro Enclaves
- Azure Confidential Computing
- Google Confidential VMs

## Key Management

### Key Types
- Symmetric (AES)
- Asymmetric (RSA, ECC)
- Hybrid (TLS handshake)

### Key Management Services
- AWS KMS
- Azure Key Vault
- Google Cloud KMS
- HashiCorp Vault

### Best Practices
- Rotate keys regularly
- Separate duties
- HSM for root keys
- Audit all access

## Common Algorithms

| Use Case | Algorithm | Notes |
|----------|-----------|-------|
| Symmetric | AES-256-GCM | Authenticated encryption |
| Asymmetric | RSA-4096 | Key exchange, signatures |
| Elliptic Curve | Curve25519 | Faster, smaller keys |
| Hashing | SHA-256 | Integrity verification |
| Passwords | Argon2 | Memory-hard, slow |

## Implementing Encryption

### Checklist
- [ ] Inventory all data locations
- [ ] Classify data sensitivity
- [ ] Choose appropriate algorithms
- [ ] Implement key management
- [ ] Test recovery procedures
- [ ] Monitor and audit

## Common Mistakes

- Hardcoding keys
- Weak algorithm choices (MD5, SHA1, DES)
- Improper key storage
- Missing certificate validation
- Insufficient randomness

## Conclusion

Encrypt everything by default. Strong cryptography is essential but implementation matters.
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
