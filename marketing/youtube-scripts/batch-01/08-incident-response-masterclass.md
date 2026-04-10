# YouTube Video Script: Incident Response Masterclass
**Topic:** Cybersecurity Incident Response Framework
**Duration:** 12-15 minutes
**Target Audience:** SOC analysts, security engineers, CISOs, IT leaders

---

## 🎬 INTRO HOOK (0:00 - 0:50)

*[SOC room footage, alert screens, urgent atmosphere]*

**HOST:**
"It's 3 AM. Your phone is blowing up. The monitoring system is screaming. Someone—or something—is moving through your network.

Your CEO is asking questions. Your board is panicking. The media is already calling. And you're supposed to somehow figure out what happened, stop the bleeding, and explain everything—all while the attacker is still inside your systems.

This is incident response. And if you don't have a plan before it happens, you're already losing.

I've led incident response for Fortune 500 companies, healthcare systems, and critical infrastructure. I've seen breaches contained in hours and breaches that dragged on for months because the team wasn't prepared.

In this video, I'm giving you the complete incident response playbook—from preparation through post-incident analysis. The frameworks, the tools, the communication templates, and the war room procedures that separate the professionals from the amateurs.

Because when the breach happens, you don't rise to the occasion. You fall to your level of preparation."

---

## 📋 CONTENT STRUCTURE

### Section 1: The Incident Response Framework (0:50 - 2:30)

**NIST SP 800-61: The Gold Standard**

```
┌─────────────────────────────────────────────────────────┐
│              INCIDENT RESPONSE LIFECYCLE                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Preparation ──▶ Detection & Analysis ──▶ Containment  │
│        ▲                                           │    │
│        │                                           ▼    │
│   Lessons Learned ◀── Post-Incident ◀── Eradication &  │
│        Activity        Activity           Recovery      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**The 6 Phases:**

1. **Preparation** - Before anything happens
2. **Detection & Analysis** - Finding and understanding
3. **Containment** - Stopping the spread
4. **Eradication** - Removing the threat
5. **Recovery** - Restoring operations
6. **Post-Incident Activity** - Learning and improving

**Alternative Frameworks:**
- **SANS PICERL** (Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned)
- **ISO 27035** - International standard
- **NIST CSF** - Cybersecurity Framework

### Section 2: Preparation - The Foundation (2:30 - 5:00)

**Why Preparation is 80% of Success:**

"The best time to plant a tree was 20 years ago. The second best time is now."

**Building Your IR Capability:**

**1. Incident Response Policy**
```
Required Elements:
- Definition of security incidents
- Classification criteria (P1/P2/P3/P4)
- Roles and responsibilities
- Escalation procedures
- Communication protocols
- Legal and regulatory requirements
```

**2. Incident Response Team (IRT)**

**Core Team:**
| Role | Responsibility |
|------|----------------|
| Incident Commander | Overall coordination, decision making |
| Technical Lead | Technical investigation, containment |
| Communications Lead | Internal/external communications |
| Legal Counsel | Regulatory, liability, legal issues |
| HR Representative | Employee-related incidents |
| Executive Sponsor | Board/boardroom interface |

**Extended Team (On-Call):**
- Network engineers
- System administrators
- Application owners
- Database administrators
- Security analysts
- Forensic specialists

**3. Incident Classification Matrix:**

| Severity | Definition | Response Time | Examples |
|----------|------------|---------------|----------|
| **P1 - Critical** | Active data breach, critical system down | 15 minutes | Ransomware, data exfiltration in progress |
| **P2 - High** | Potential breach, major system impact | 1 hour | Suspected compromise, DDoS affecting revenue |
| **P3 - Medium** | Confirmed security issue, limited impact | 4 hours | Malware on single endpoint, policy violation |
| **P4 - Low** | Minor issue, no immediate threat | 24 hours | Phishing attempt, port scan detected |

**4. Playbooks (Tactical Guides):**

**Common Playbook Templates:**
- Malware outbreak
- Ransomware
- Data breach
- Insider threat
- DDoS attack
- Phishing campaign
- Cloud account compromise
- Supply chain attack

**Playbook Structure:**
```
1. Detection Criteria
2. Initial Response Steps
3. Containment Procedures
4. Investigation Checklist
5. Eradication Steps
6. Recovery Procedures
7. Communication Templates
```

**5. Tooling Arsenal:**

**Essential Tools:**
| Category | Tools |
|----------|-------|
| SIEM | Splunk, Sentinel, QRadar, Chronicle |
| EDR | CrowdStrike, SentinelOne, Microsoft Defender |
| Forensics | Velociraptor, KAPE, Autopsy, Volatility |
| Threat Intel | MISP, ThreatConnect, Anomali |
| Case Management | TheHive, ServiceNow, XSOAR |
| Communication | Slack/Teams war rooms, PagerDuty |

**6. Communications Plan:**

**Stakeholder Matrix:**
| Audience | Timing | Channel | Message Owner |
|----------|--------|---------|---------------|
| IR Team | Immediate | War room | Incident Commander |
| Leadership | Within 1 hour | Phone/Secure chat | Executive Sponsor |
| Legal | Within 2 hours | Secure email | IR Lead |
| Employees | As needed | Email/Intranet | Communications |
| Customers | If affected | Email/Status page | Communications |
| Regulators | Per requirements | Official channels | Legal |
| Media | If public | PR team | Communications |

**Communication Templates:**
- Internal notification
- Executive briefing
- Customer notification
- Regulatory notification
- Media statement

**7. Tabletop Exercises:**

**Exercise Scenarios:**
- Ransomware hits your primary DC
- Employee sells customer data
- Cloud account compromised
- Supply chain attack via vendor
- Insider threat deletes backups

**Exercise Structure:**
1. **Inject** - Present new information
2. **Discuss** - Team discusses response
3. **Decide** - Make decisions
4. **Evaluate** - Assess effectiveness
5. **Improve** - Update playbooks

### Section 3: Detection & Analysis (5:00 - 7:30)

**Detection Sources:**

**1. Automated Detection:**
- SIEM correlation rules
- EDR behavioral analytics
- IDS/IPS alerts
- DLP alerts
- Cloud security tools
- Threat intelligence feeds

**2. Human Detection:**
- Employee reports
- Customer reports
- Security researcher reports
- Law enforcement notification
- Media reports

**Alert Triage Process:**

```
Alert Generated
      ↓
Initial Triage (5 min)
      ↓
┌──────────┴──────────┐
│                     │
False Positive      Confirmed
│                     │
Close Ticket    Escalate to
                Investigation
```

**Triage Questions:**
1. Is this a real security incident?
2. What systems/users are affected?
3. What is the potential impact?
4. Is the attack ongoing?
5. Do we need to escalate?

**Analysis Framework:**

**The 5 W's of Incident Analysis:**

| Question | Information Needed |
|----------|-------------------|
| **WHAT** happened? | Artifacts, logs, system state |
| **WHEN** did it occur? | Timeline of events |
| **WHERE** did it happen? | Affected systems, network segments |
| **WHO** was involved? | Accounts, IP addresses, actors |
| **HOW** did it happen? | Attack vector, vulnerabilities |

**Evidence Collection:**

**Volatile Data (Collect First):**
- Running processes
- Network connections
- Memory contents
- Logged-in users
- Open files

**Non-Volatile Data:**
- Disk images
- Log files
- Configuration files
- Registry hives
- Malware samples

**Chain of Custody:**
```
1. Identify evidence
2. Document location/state
3. Collect using forensic tools
4. Generate hash (MD5/SHA256)
5. Store securely
6. Maintain documentation
7. Track all access
```

**Memory Forensics Quick Guide:**
```bash
# Capture memory (if possible)
winpmem_mini_x64.exe memdump.raw

# Analyze with Volatility
volatility -f memdump.raw windows.pslist
volatility -f memdump.raw windows.netscan
volatility -f memdump.raw windows.malfind
```

### Section 4: Containment (7:30 - 9:30)

**Containment Strategies:**

**Short-Term (Immediate):**
- Isolate affected systems
- Block malicious IPs
- Disable compromised accounts
- Revoke tokens/certificates
- Increase monitoring

**Long-Term (Strategic):**
- Segment network
- Implement additional controls
- Patch vulnerabilities
- Update firewall rules

**Containment Decision Matrix:**

| Factor | Isolate Immediately | Monitor & Investigate |
|--------|---------------------|------------------------|
| Active data exfiltration | ✓ | |
| Ransomware spreading | ✓ | |
| Single compromised endpoint | | ✓ |
| Suspicious but unconfirmed | | ✓ |
| Critical system involved | | Evaluate risk |

**Network Containment Techniques:**

**1. Network Segmentation:**
```bash
# Block at firewall
iptables -A INPUT -s 192.0.2.100 -j DROP

# VLAN isolation
# Move compromised host to quarantine VLAN

# ACL updates
# Restrict lateral movement between segments
```

**2. Endpoint Isolation:**

**EDR-Based Isolation:**
```bash
# CrowdStrike
falconctl -d -f --isolate

# SentinelOne
# Use management console to isolate

# Microsoft Defender
# Device isolation via Security Center
```

**Manual Isolation:**
```bash
# Linux
ip link set eth0 down
iptables -A INPUT -j DROP
iptables -A OUTPUT -j DROP

# Windows (be careful!)
netsh interface set interface "Ethernet" disable
```

**3. Account Containment:**

**Disable Compromised Accounts:**
```powershell
# Active Directory
Disable-ADAccount -Identity compromiseduser

# Azure AD
Set-AzureADUser -ObjectId user@domain.com -AccountEnabled $false

# AWS
aws iam update-access-key --access-key-id AKIA... --status Inactive --user-name username
```

**Token Revocation:**
```bash
# JWT (if you control the auth server)
# Add token to revocation list

# OAuth tokens
# Revoke at authorization server

# API keys
# Rotate or disable in API gateway
```

**4. Cloud-Specific Containment:**

**AWS:**
```bash
# Isolate EC2 instance
aws ec2 modify-instance-attribute \
  --instance-id i-1234567890abcdef0 \
  --no-source-dest-check

# Update security group
aws ec2 revoke-security-group-ingress \
  --group-id sg-12345678 \
  --protocol all \
  --source-group sg-12345678

# Snapshot for forensics
aws ec2 create-snapshot --volume-id vol-12345678
```

**Azure:**
```powershell
# Isolate VM
Set-AzVM -ResourceGroupName RG -Name VM -Generalized

# Update NSG
Remove-AzNetworkSecurityRuleConfig -NetworkSecurityGroup NSG -Name RuleName
```

**GCP:**
```bash
# Isolate instance
gcloud compute instances add-labels instance-1 --labels=quarantine=true

# Update firewall
gcloud compute firewall-rules delete allow-internal
```

### Section 5: Eradication & Recovery (9:30 - 11:30)

**Eradication Principles:**

1. **Complete Removal** - Partial eradication = reinfection
2. **Verify Clean** - Scan everything, trust nothing
3. **Patch Root Cause** - Don't just clean, fix the vulnerability
4. **Document Everything** - For forensics and lessons learned

**Eradication Checklist:**

**Malware Removal:**
- [ ] Run updated antivirus/EDR scans
- [ ] Check for persistence mechanisms
  - Scheduled tasks
  - Registry run keys
  - Startup folders
  - WMI subscriptions
  - Services
- [ ] Verify no backdoors remain
- [ ] Check for legitimate tools repurposed (LOLBAS)

**Account Security:**
- [ ] Force password reset for all potentially affected accounts
- [ ] Review and revoke OAuth grants
- [ ] Rotate service account credentials
- [ ] Review SSH keys and API keys
- [ ] Audit privilege escalations

**Network Clean-Up:**
- [ ] Remove malicious firewall rules
- [ ] Block attacker infrastructure
- [ ] Review and clean DNS records
- [ ] Audit VPN access logs

**Recovery Prioritization:**

**Recovery Priority Matrix:**

| System | Business Impact | Recovery Priority |
|--------|-----------------|-------------------|
| Customer-facing production | Critical | P1 |
| Internal business systems | High | P2 |
| Development environments | Medium | P3 |
| Archive/backup systems | Low | P4 |

**Recovery Procedures:**

**Clean System Rebuild:**
```
1. Verify eradication complete
2. Restore from known-good backups
3. Patch all vulnerabilities
4. Harden configuration
5. Verify integrity
6. Gradual reconnection
7. Enhanced monitoring
```

**Backup Verification:**
```bash
# Verify backup integrity
restic check --read-data

# Test restore procedure
restic restore latest --target /restore-test

# Verify restored data
# Check file hashes, database consistency
```

### Section 6: Post-Incident Activity (11:30 - 13:00)

**The After-Action Review:**

**Timeline:**
- 24-48 hours: Hot wash (immediate feedback)
- 1 week: Initial lessons learned
- 2-4 weeks: Comprehensive report

**Post-Incident Report Template:**

```markdown
# Incident Report: INC-2024-001

## Executive Summary
- Incident type: Ransomware
- Duration: 6 hours
- Systems affected: 12 servers
- Data impact: None (encrypted backups)
- Financial impact: $250K (downtime + recovery)

## Timeline
| Time | Event |
|------|-------|
| 03:15 | Initial detection (EDR alert) |
| 03:22 | Incident declared, team activated |
| 03:45 | Containment complete (isolated 12 systems) |
| 06:30 | Eradication complete |
| 08:15 | Recovery initiated |
| 14:00 | All systems operational |

## Root Cause Analysis
Initial infection vector: Phishing email → credential theft → lateral movement → ransomware deployment

## Response Effectiveness
**What Went Well:**
- Fast detection (7 minutes)
- Effective containment
- Recent backups available

**What Needs Improvement:**
- Phishing simulation training
- Network segmentation
- MFA coverage gaps

## Recommendations
1. Implement mandatory MFA for all accounts
2. Enhance email security (ATP)
3. Improve network segmentation
4. Quarterly tabletop exercises
5. Update IR playbooks

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| MFA rollout | IT Security | 2024-02-15 | In Progress |
| Network segmentation review | Network Team | 2024-03-01 | Not Started |
```

**Continuous Improvement:**

**Metrics to Track:**
- Mean Time to Detect (MTTD)
- Mean Time to Respond (MTTR)
- Mean Time to Contain (MTTC)
- False positive rate
- Incident volume trends
- Playbook effectiveness

**Update Playbooks Based On:**
- New attack techniques
- Tool changes
- Process improvements
- Lessons from incidents

---

## 🎯 CTA / OUTRO (13:00 - 15:00)

**HOST:**
"Incident response isn't glamorous. It's not the shiny AI-powered threat detection that gets the budget. But when the breach happens—and it will—your IR capability is the difference between a controlled response and a career-ending disaster.

We've covered the full lifecycle: preparation, detection, containment, eradication, recovery, and continuous improvement. But here's the truth: this video is just the beginning.

To actually be ready, you need to do the work:

1. **Download my Incident Response Playbook Bundle**—it includes templates for playbooks, communication plans, and post-incident reports
2. **Schedule a tabletop exercise this month**—pick a scenario, gather your team, run through it
3. **Audit your detection capabilities**—are you collecting the right logs? Do your alerts actually work?
4. **Subscribe for more IR content**—we're diving into digital forensics next
5. **Comment 'IR READY'** when you've completed your first tabletop exercise

Remember: attackers have a plan. They practice. They rehearse. The only way to beat them is to be just as prepared.

Build your capability, train your team, test your plans. Because when that 3 AM call comes—and it will—you want to be the person who knows exactly what to do.

Stay ready. Stay vigilant. I'll see you in the next video."

*[End screen with playbook download and subscribe]*

---

## 📝 INCIDENT RESPONSE RESOURCES

**NIST Resources:**
- SP 800-61: Computer Security Incident Handling Guide
- SP 800-150: Cyber Threat Information Sharing

**SANS Resources:**
- Incident Handler's Handbook
- 504: Incident Response & Forensics
- 508: Advanced IR & Threat Hunting

**Free Tools:**
- TheHive: Incident response platform
- MISP: Threat intelligence platform
- Velociraptor: Endpoint monitoring
- Sigma: Generic signature format

**Certifications:**
- GCIH (GIAC Certified Incident Handler)
- GCFA (GIAC Certified Forensic Analyst)
- CISSP (Incident Response domain)
- EC-Council E|CIH
