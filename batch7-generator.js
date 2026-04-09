#!/usr/bin/env node
/**
 * Batch Content Generator v7 - Cloud & Infrastructure Security
 */

const fs = require('fs');
const path = require('path');

const articles = [
  {
    id: "aws-security-best-practices",
    title: "AWS Security: 20 Essential Best Practices for 2025",
    category: "Cloud Security",
    tags: ["AWS", "Cloud Security", "IAM", "S3", "EC2"],
    content: `# AWS Security: 20 Essential Best Practices for 2025

## Identity and Access Management (IAM)

### 1. Enable MFA Everywhere
- Root account must have hardware MFA
- All IAM users should have MFA enabled
- Use IAM Access Analyzer

### 2. Follow Least Privilege
- Start with zero permissions
- Add only what's necessary
- Regular access reviews

### 3. Use IAM Roles, Not Access Keys
- EC2 instances → IAM Roles
- Lambda functions → Execution Roles
- Applications → Service Roles

### 4. Rotate Credentials Regularly
- Access keys: 90 days max
- Passwords: 60 days
- Automate with AWS Config

## S3 Security

### 5. Block Public Access
\`\`\`json
{
  "BlockPublicAcls": true,
  "IgnorePublicAcls": true,
  "BlockPublicPolicy": true,
  "RestrictPublicBuckets": true
}
\`\`\`

### 6. Enable Encryption
- Server-side encryption (SSE-S3 or SSE-KMS)
- Default encryption on all buckets
- Enforce with bucket policies

### 7. Enable Access Logging
- Log to separate bucket
- Enable CloudTrail for API calls
- Use S3 Inventory

## Network Security

### 8. VPC Design
- Multi-AZ deployment
- Public and private subnets
- NAT Gateways for outbound

### 9. Security Groups
- Default deny all inbound
- Explicit allow rules only
- Document all open ports

### 10. NACLs
- Additional layer of defense
- Stateless rules
- Block known bad IPs

## Monitoring and Compliance

### 11. Enable CloudTrail
- All regions, all events
- Log file validation
- Integrated with CloudWatch

### 12. Use AWS Config
- Track resource changes
- Compliance rules
- Automated remediation

### 13. GuardDuty
- Enable in all regions
- Integrate with Security Hub
- Automate response

### 14. Security Hub
- Centralized findings
- CIS AWS Foundations
- Custom standards

## Data Protection

### 15. KMS for Key Management
- Customer-managed keys (CMK)
- Key rotation enabled
- Strict key policies

### 16. Secrets Manager
- Rotate secrets automatically
- Use with RDS, DocumentDB
- No hardcoded credentials

### 17. Macie for Data Discovery
- PII detection
- S3 bucket monitoring
- Alert on sensitive data

## Infrastructure

### 18. Systems Manager
- Patch management
- Session Manager (no SSH keys)
- Run Command for automation

### 19. Inspector
- Automated vulnerability scanning
- EC2 and container images
- CIS benchmarks

### 20. Backup Strategy
- AWS Backup for centralization
- Cross-region copies
- Regular restore testing

## Automation Tools

\`\`\`bash
# AWS Config Rules
aws configservice put-config-rule \
  --config-rule file://mfa-enabled-rule.json

# Security Hub enable
aws securityhub enable-import-findings-for-product \
  --product-arn arn:aws:securityhub:us-east-1::product/aws/guardduty

# Enable GuardDuty
aws guardduty create-detector --enable
\`\`\`

## Compliance Checklist

- [ ] CIS AWS Foundations Benchmark
- [ ] SOC 2 Type II
- [ ] PCI DSS (if applicable)
- [ ] HIPAA (if applicable)
- [ ] GDPR compliance

## Conclusion

AWS security is shared responsibility. Secure your side with these practices.
`
  },
  {
    id: "incident-response-playbook",
    title: "Incident Response Playbook: From Detection to Recovery",
    category: "Security Operations",
    tags: ["Incident Response", "SOC", "Playbook", "Forensics"],
    content: `# Incident Response Playbook: From Detection to Recovery

## Incident Response Lifecycle

### 1. Preparation
- Document assets and critical systems
- Establish communication channels
- Train the team
- Prepare tools and access

### 2. Detection and Analysis
- Monitor SIEM alerts
- Triage incoming reports
- Determine incident scope
- Classify severity (P1-P4)

### 3. Containment
- Short-term: Stop immediate damage
- Long-term: Secure the environment
- Document all actions

### 4. Eradication
- Remove threat actor access
- Patch vulnerabilities
- Clean infected systems

### 5. Recovery
- Restore from clean backups
- Monitor for reinfection
- Gradual return to operations

### 6. Post-Incident
- Lessons learned meeting
- Update playbooks
- Implement improvements

## Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P1 - Critical | Active data breach, ransomware | 15 minutes |
| P2 - High | Confirmed compromise, no exfiltration | 1 hour |
| P3 - Medium | Suspicious activity, needs investigation | 4 hours |
| P4 - Low | Policy violation, minor issue | 24 hours |

## Common Incident Types

### Ransomware Response

1. **Isolate immediately**
   - Disconnect from network
   - Preserve evidence
   - Do NOT pay ransom

2. **Assess scope**
   - What systems affected?
   - Is there a backup?
   - When was initial access?

3. **Eradicate**
   - Reimage all affected systems
   - Patch entry point
   - Reset all credentials

4. **Recover**
   - Restore from offline backup
   - Verify backup integrity
   - Monitor closely

### Data Breach Response

1. **Contain**
   - Stop exfiltration
   - Preserve logs
   - Notify legal team

2. **Investigate**
   - What data was accessed?
   - How many records?
   - Who is affected?

3. **Comply**
   - GDPR: 72-hour notification
   - State breach laws
   - Customer notification

4. **Remediate**
   - Fix root cause
   - Credit monitoring offer
   - PR coordination

## IR Team Roles

- **Incident Commander**: Overall coordination
- **Technical Lead**: Technical investigation
- **Communications**: Internal/external comms
- **Legal**: Regulatory compliance
- **HR**: Employee-related incidents

## Essential Tools

| Function | Tools |
|----------|-------|
| SIEM | Splunk, ELK, Sentinel |
| EDR | CrowdStrike, SentinelOne |
| Forensics | Velociraptor, KAPE |
| Communication | Slack, PagerDuty |
| Ticketing | Jira, ServiceNow |

## Communication Templates

### Internal Notification
\`\`\`
Subject: SECURITY INCIDENT - [SEVERITY] - [BRIEF DESCRIPTION]

We have detected a security incident affecting [SYSTEMS].
Incident ID: INC-2025-XXXX
Severity: P1/P2/P3/P4
Status: [CONTAINING/INVESTIGATING/RESOLVED]

Next update: [TIME]
\`\`\`

### External Notification
\`\`\`
We are writing to inform you of a security incident that may have affected your personal information...
[Required by GDPR, state laws, contracts]
\`\`\`

## Metrics to Track

- Mean Time to Detect (MTTD)
- Mean Time to Respond (MTTR)
- Mean Time to Contain (MTTC)
- False positive rate
- Incident volume trends

## Conclusion

Preparation is key. Have playbooks ready before incidents occur.
`
  },
  {
    id: "threat-intelligence-guide",
    title: "Threat Intelligence: From Feeds to Actionable Insights",
    category: "Threat Intelligence",
    tags: ["Threat Intel", "CTI", "IOC", "ATT&CK", "OSINT"],
    content: `# Threat Intelligence: From Feeds to Actionable Insights

## What is Threat Intelligence?

Evidence-based knowledge about threats, including context, mechanisms, indicators, implications, and actionable advice.

## Intelligence Types

### 1. Strategic
- High-level trends
- Nation-state actors
- Industry-specific threats
- For: C-suite, board

### 2. Tactical
- TTPs (Tactics, Techniques, Procedures)
- MITRE ATT&CK mappings
- Attack patterns
- For: Security managers

### 3. Operational
- Specific campaigns
- Threat actor attribution
- Intent and timing
- For: SOC leads

### 4. Technical
- IOCs (Indicators of Compromise)
- IP addresses, domains, hashes
- YARA rules, SNORT signatures
- For: SOC analysts, IR team

## The Intelligence Cycle

1. **Direction**: What do we need to know?
2. **Collection**: Gather from sources
3. **Processing**: Parse and normalize
4. **Analysis**: Contextualize and assess
5. **Dissemination**: Share with stakeholders
6. **Feedback**: Was it useful?

## IOC Types

| Type | Example | Use Case |
|------|---------|----------|
| IP | 192.0.2.100 | Block at firewall |
| Domain | evil.com | DNS sinkhole |
| Hash | a1b2c3... | File blocking |
| URL | http://bad/path | Proxy block |
| Email | bad@evil.com | Email filter |

## Threat Intelligence Platforms

### Commercial
- Mandiant Advantage
- Recorded Future
- ThreatConnect
- MISP (open source)

### Open Source Feeds
- Alienvault OTX
- Abuse.ch (MalwareBazaar, URLhaus)
- EmergingThreats
- CISA AIS

## Practical Applications

### 1. Detection Engineering
Turn intel into detection rules:
\`\`\`
Sigma Rule Example:
title: Suspicious PowerShell Download
detection:
  selection:
    CommandLine|contains:
      - 'IEX(New-Object Net.WebClient)'
  condition: selection
\`\`\`

### 2. Threat Hunting
Use intel to proactively search:
- Known actor TTPs
- Anomalous behaviors
- Historical IOCs

### 3. Incident Response
Enrich alerts with context:
- Is this IP known malicious?
- What malware family?
- Recommended actions?

### 4. Vulnerability Prioritization
- CISA KEV (Known Exploited Vulnerabilities)
- Threat actor targeting specific CVEs
- Exploit availability

## MITRE ATT&CK Framework

Map threats to standardized tactics and techniques:
- **Initial Access**: Phishing, Exploit Public-Facing App
- **Execution**: Command-Line Interface, PowerShell
- **Persistence**: Registry Run Keys, Scheduled Tasks
- **Privilege Escalation**: Process Injection, Token Impersonation

## Measuring CTI Value

- Alerts enriched with context
- Time saved in investigations
- Incidents prevented
- Mean time to detect improvement

## Conclusion

Threat intelligence transforms raw data into actionable insights. Start with free feeds, mature to TIP platforms.
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
