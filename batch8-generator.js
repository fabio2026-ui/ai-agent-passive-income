#!/usr/bin/env node
/**
 * Batch Content Generator v8 - Emerging Threats & Trends
 */

const fs = require('fs');
const path = require('path');

const articles = [
  {
    id: "ransomware-defense-2025",
    title: "Ransomware Defense 2025: Modern Protection Strategies",
    category: "Threat Defense",
    tags: ["Ransomware", "Malware", "Backup", "EDR"],
    content: `# Ransomware Defense 2025: Modern Protection Strategies

## The Ransomware Landscape

Ransomware has evolved from simple file encryption to sophisticated operations including:
- Double extortion (encrypt + exfiltrate)
- Triple extortion (DDoS, regulatory threats)
- Ransomware-as-a-Service (RaaS)
- Supply chain attacks

## Major Groups to Watch

| Group | TTPs | Targets |
|-------|------|---------|
| LockBit | Stealth, fast encryption | Healthcare, government |
| BlackCat/ALPHV | Rust, cross-platform | Critical infrastructure |
| Clop | Data theft focus | Large enterprises |
| Play | Simple but effective | SMEs |

## Defense Layers

### 1. Prevention
- Email security (phishing is #1 vector)
- Web filtering
- Patch management
- Application control

### 2. Detection
- EDR on all endpoints
- Behavioral analytics
- Deception technology (honeypots)
- Network traffic analysis

### 3. Response
- Incident response plan
- Isolation procedures
- Forensic readiness
- Communication protocols

### 4. Recovery
- Immutable backups (3-2-1 rule)
- Recovery time objectives (RTO)
- Recovery point objectives (RPO)
- Regular restore testing

## The 3-2-1 Backup Rule

- **3** copies of data
- **2** different media types
- **1** offsite/air-gapped

Plus: Immutable backups that can't be deleted or modified

## Technical Controls

### Application Whitelisting
Allow only approved software to run:
- Windows AppLocker
- macOS Gatekeeper
- Linux SELinux/AppArmor

### Network Segmentation
- VLANs for critical systems
- Micro-segmentation
- Zero Trust architecture

### Privilege Management
- Remove local admin rights
- Just-in-time elevation
- PAM solutions

## Incident Response Checklist

1. Isolate affected systems
2. Preserve forensic evidence
3. Identify the ransomware variant
4. Check for decryptors (NoMoreRansom.org)
5. Assess backup integrity
6. Decide: Pay or restore?
7. Report to authorities
8. Communicate with stakeholders

## Should You Pay?

**Arguments Against:**
- Funds criminal organizations
- No guarantee of decryption
- Marks you as paying target
- May violate sanctions

**Arguments For:**
- Business survival at stake
- No viable backups
- Public safety impact

**Recommendation**: Do NOT pay. Restore from backups.

## Emerging Trends

- **Encryption-less extortion**: Pure data theft
- **Intermittent encryption**: Faster, harder to detect
- **Living off the land**: Using legitimate tools
- **Cloud-targeting**: AWS/Azure/GCP compromises

## Conclusion

Ransomware defense requires defense in depth, immutable backups, and a tested incident response plan.
`
  },
  {
    id: "cloud-security-misconfigurations",
    title: "Top 10 Cloud Security Misconfigurations and How to Fix Them",
    category: "Cloud Security",
    tags: ["Cloud Security", "AWS", "Azure", "GCP", "Misconfiguration"],
    content: `# Top 10 Cloud Security Misconfigurations and How to Fix Them

Cloud misconfigurations are the #1 cause of cloud breaches. Here are the most common:

## 1. Exposed Storage Buckets

**Risk**: Public S3 buckets containing sensitive data

**Detection**:
\`\`\`bash
aws s3api get-bucket-acl --bucket my-bucket
aws s3api get-public-access-block --bucket my-bucket
\`\`\`

**Fix**:
- Enable "Block Public Access" at account level
- Use bucket policies to enforce encryption
- Enable access logging

## 2. Overly Permissive IAM Policies

**Risk**: Wildcard permissions granting excessive access

**Detection**:
- IAM Access Analyzer
- Prowler security scanner
- Cloud Custodian

**Fix**:
- Least privilege principle
- Regular access reviews
- Remove unused credentials

## 3. Unencrypted Data at Rest

**Risk**: Data theft if storage is compromised

**Fix**:
- Enable default encryption on all storage
- Use customer-managed keys (CMK)
- Enforce with SCPs (Service Control Policies)

## 4. Unencrypted Data in Transit

**Risk**: Man-in-the-middle attacks

**Fix**:
- TLS 1.2+ everywhere
- Enforce HTTPS only
- Disable weak cipher suites

## 5. Default Security Groups

**Risk**: Open inbound rules (0.0.0.0/0)

**Fix**:
- Restrict to specific IPs
- Use security group references
- Regular rule audits

## 6. Exposed Database Ports

**Risk**: Direct internet access to databases

**Fix**:
- Private subnets only
- Bastion hosts or VPN
- Database firewalls

## 7. Lack of Logging

**Risk**: Blind to security events

**Fix**:
- Enable CloudTrail (all regions)
- VPC Flow Logs
- S3 Access Logs
- SIEM integration

## 8. Missing MFA

**Risk**: Credential compromise leads to full access

**Fix**:
- MFA required for all users
- Hardware keys for privileged users
- Conditional Access policies

## 9. Hardcoded Secrets

**Risk**: Credentials in code repositories

**Fix**:
- Secrets Manager (AWS/Azure/GCP)
- Pre-commit hooks (git-secrets)
- Regular repository scanning

## 10. Unpatched Systems

**Risk**: Known vulnerabilities exploited

**Fix**:
- Automated patch management
- Vulnerability scanning
- Container image scanning

## Automated Detection Tools

| Tool | Clouds | Cost |
|------|--------|------|
| Prowler | AWS | Free |
| ScoutSuite | AWS, Azure, GCP | Free |
| CloudSploit | All | Freemium |
| Lacework | All | Commercial |

## Prevention Strategy

1. Infrastructure as Code (Terraform/CloudFormation)
2. Policy as Code (OPA, Sentinel)
3. CI/CD security scanning
4. Continuous compliance monitoring

## Conclusion

Automated tools + regular audits = secure cloud environment.
`
  },
  {
    id: "password-security-2025",
    title: "Password Security in 2025: Beyond Complexity Rules",
    category: "Identity Security",
    tags: ["Passwords", "Authentication", "MFA", "Passwordless"],
    content: `# Password Security in 2025: Beyond Complexity Rules

## The Password Problem

- 81% of breaches involve weak or stolen passwords
- Average person has 100+ passwords
- 65% reuse passwords across sites

## Modern Password Guidelines (NIST 800-63)

### What Changed

❌ **Old Rules**:
- Complexity requirements (upper, lower, number, symbol)
- Regular forced changes (90 days)
- Maximum length limits

✅ **New Approach**:
- Minimum 8 characters (64+ recommended)
- Check against breached password lists
- No forced rotation unless compromised
- Support password managers

## Password Manager Strategy

### Enterprise Solutions
- 1Password Business
- LastPass Enterprise
- Bitwarden
- Dashlane Business

### Benefits
- Unique passwords everywhere
- Secure sharing
- Audit logs
- Easy offboarding

## Multi-Factor Authentication (MFA)

### MFA Methods (Ranked by Security)

1. **Hardware Security Keys** (YubiKey, Titan)
   - Phishing-resistant
   - Highest security

2. **Authenticator Apps** (TOTP)
   - Google Authenticator
   - Authy
   - Microsoft Authenticator

3. **Push Notifications**
   - Convenient
   - Vulnerable to MFA fatigue

4. **SMS/Email Codes**
   - Vulnerable to SIM swap
   - Better than nothing

### MFA Everywhere

Enable MFA on:
- Email (critical - password reset vector)
- Cloud admin accounts
- VPN access
- Financial accounts
- Code repositories

## Passwordless Authentication

### FIDO2/WebAuthn
- Biometrics (Touch ID, Face ID)
- Security keys
- Device-based authentication

### Passkeys
- Apple's implementation
- Google's implementation
- Cross-platform sync

## Enterprise Implementation

### Conditional Access
- Require MFA for risky sign-ins
- Block legacy authentication
- Enforce compliant devices

### Password Policies
- Minimum length: 14 characters
- Breached password check
- No common passwords
- No username in password

## Testing Your Passwords

\`\`\`bash
# Check if password is breached
# (Use API securely - hash first)
curl -s https://api.pwnedpasswords.com/range/ABCDE

# Password strength testing
# Use zxcvbn or similar library
\`\`\`

## Migration Strategy

1. Deploy password manager
2. Enable MFA everywhere
3. Eliminate shared accounts
4. Implement SSO where possible
5. Plan for passwordless future

## Conclusion

Passwords are still necessary, but supplement with MFA and plan for passwordless.
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
console.log('Total articles: ' + fs.readdirSync(outputDir).length);
