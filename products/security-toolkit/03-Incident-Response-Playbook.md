# Incident Response Playbook
## Cybersecurity Incident Response Framework

---

## Table of Contents
1. [Introduction & Objectives](#1-introduction--objectives)
2. [Incident Response Team](#2-incident-response-team)
3. [Incident Classification](#3-incident-classification)
4. [Response Phases](#4-response-phases)
5. [Specific Playbooks](#5-specific-playbooks)
6. [Communication Templates](#6-communication-templates)
7. [Appendices](#7-appendices)

---

## 1. Introduction & Objectives

### Purpose
This playbook provides step-by-step procedures for responding to cybersecurity incidents. It ensures a coordinated, effective response that minimizes damage, reduces recovery time, and preserves evidence.

### Scope
This playbook covers:
- Malware infections
- Data breaches
- Ransomware attacks
- Phishing incidents
- Insider threats
- Denial of service attacks
- System compromises
- Unauthorized access

### Objectives
1. **Contain** the incident to prevent further damage
2. **Eradicate** the threat from the environment
3. **Recover** affected systems to normal operations
4. **Learn** from the incident to improve defenses

---

## 2. Incident Response Team

### 2.1 Team Structure

| Role | Responsibility | Primary | Backup |
|------|---------------|---------|--------|
| **Incident Commander** | Overall coordination, decision making | | |
| **Technical Lead** | Technical analysis and response | | |
| **Communications Lead** | Internal/external communications | | |
| **Legal Counsel** | Legal implications, regulatory notifications | | |
| **HR Representative** | Employee-related incidents | | |
| **Executive Sponsor** | Resource allocation, major decisions | | |

### 2.2 Escalation Matrix

| Severity | Notification Time | Who to Notify |
|----------|-------------------|---------------|
| Low | Within 4 hours | IT Security Manager |
| Medium | Within 1 hour | CIO + Legal |
| High | Within 30 minutes | Executive Team + Legal |
| Critical | Immediate | Board + All Stakeholders |

---

## 3. Incident Classification

### 3.1 Severity Levels

#### 🔴 CRITICAL (Severity 1)
**Definition:** Active breach affecting critical systems or large-scale data exfiltration

**Characteristics:**
- Active data exfiltration in progress
- Ransomware deployed across multiple systems
- Critical infrastructure compromised
- Regulatory notification required

**Response Time:** Immediate (15 minutes)

#### 🟠 HIGH (Severity 2)
**Definition:** Confirmed security incident with significant impact

**Characteristics:**
- Confirmed unauthorized access to sensitive data
- Malware on multiple endpoints
- Privileged account compromise
- DDoS affecting service availability

**Response Time:** Within 1 hour

#### 🟡 MEDIUM (Severity 3)
**Definition:** Suspicious activity or limited security incident

**Characteristics:**
- Single system infection
- Successful phishing (limited scope)
- Policy violation
- Attempted unauthorized access (blocked)

**Response Time:** Within 4 hours

#### 🟢 LOW (Severity 4)
**Definition:** Minor security event or policy violation

**Characteristics:**
- Spam emails
- Blocked intrusion attempts
- Minor policy violations
- Routine security alerts

**Response Time:** Next business day

### 3.2 Incident Categories

| Category | Description | Example |
|----------|-------------|---------|
| **MALWARE** | Malicious software infection | Ransomware, trojans, worms |
| **BREACH** | Unauthorized data access | Database exfiltration, insider theft |
| **PHISHING** | Social engineering attack | Credential harvesting, BEC |
| **DOS** | Denial of service | DDoS attack, resource exhaustion |
| **INTRUSION** | System compromise | Unauthorized access, privilege escalation |
| **INSIDER** | Internal threat | Data theft, sabotage |
| **PHYSICAL** | Physical security breach | Unauthorized facility access, theft |

---

## 4. Response Phases

### PHASE 1: PREPARATION

#### Before an Incident Occurs

**☐ Checklist: Preparation Tasks**

| Task | Status | Owner | Last Verified |
|------|--------|-------|---------------|
| IR Plan documented and approved | ☐ | | |
| IR Team contacts current | ☐ | | |
| Communication templates ready | ☐ | | |
| Forensic tools licensed and available | ☐ | | |
| Backup and recovery tested | ☐ | | |
| Legal retainers established | ☐ | | |
| PR/Communications contacts confirmed | ☐ | | |
| Escalation procedures tested | ☐ | | |

#### Required Tools & Resources
- **Forensic Workstation:** Isolated, write-blocking capable
- **Network Analysis:** Wireshark, tcpdump, Zeek
- **Memory Analysis:** Volatility, Rekall
- **Disk Imaging:** FTK Imager, dd, Guymager
- **Malware Analysis:** Isolated sandbox environment
- **Communication:** Secure out-of-band communication channel

---

### PHASE 2: DETECTION & ANALYSIS

#### Initial Detection

**Step 1: Alert Validation (First 15 minutes)**

```
☐ Verify the alert is not a false positive
☐ Document initial detection time and method
☐ Gather basic information:
   - Affected system(s)
   - Nature of suspicious activity
   - Time of detection
   - Initial scope assessment
☐ Create incident ticket/case number
☐ Notify on-call security analyst
```

**Step 2: Initial Assessment (Next 15 minutes)**

```
☐ Determine if incident is in progress
☐ Identify affected systems/networks
☐ Estimate potential impact
☐ Classify severity (Critical/High/Medium/Low)
☐ Identify attack vector if known
☐ Check if data exfiltration occurred
☐ Assess if regulatory notification required
```

**Step 3: Evidence Preservation**

```
☐ Enable detailed logging on affected systems
☐ Preserve system memory (RAM dump)
   Command: winpmem.exe -o memory.dmp
☐ Capture network traffic if ongoing
   Command: tcpdump -i eth0 -w incident.pcap
☐ Document current state with screenshots
☐ Identify and secure log sources
☐ Chain of custody documentation started
```

---

### PHASE 3: CONTAINMENT

#### Short-Term Containment (First 30 minutes)

**Goal:** Stop the bleeding

```
☐ Isolate affected systems from network
   Options:
   - Physical disconnection
   - VLAN isolation
   - Firewall blocking
   - Endpoint agent quarantine
   
☐ Block malicious IPs/domains at perimeter
☐ Disable compromised accounts
☐ Revoke active sessions for affected users
☐ Preserve volatile evidence before changes
☐ Document all containment actions with timestamps
```

#### Long-Term Containment (Next 2-4 hours)

**Goal:** Stabilize the environment

```
☐ Implement monitoring on affected systems
☐ Deploy additional detection rules
☐ Enhance logging on related systems
☐ Prepare clean environment for recovery
☐ Begin root cause analysis
☐ Estimate timeline for full containment
```

**Containment Decision Tree:**

```
Is the system critical for operations?
├─ YES → Can it be isolated without business impact?
│        ├─ YES → Isolate immediately
│        └─ NO → Monitor closely, plan maintenance window
└─ NO → Isolate immediately

Is data exfiltration occurring?
├─ YES → Emergency network disconnect
└─ NO → Controlled isolation
```

---

### PHASE 4: ERADICATION

#### Remove the Threat

**Step 1: Identify Root Cause**

```
☐ Determine initial compromise vector
☐ Identify all affected systems
☐ Map attacker movement (lateral movement)
☐ Find persistence mechanisms
   - Scheduled tasks
   - Registry entries
   - Startup items
   - Services
   - Backdoor accounts
☐ Identify all malware/samples
☐ Determine data accessed/exfiltrated
```

**Step 2: Eliminate Threat**

```
☐ Remove malware from all systems
☐ Delete persistence mechanisms
☐ Patch exploited vulnerabilities
☐ Reset all compromised credentials
☐ Rotate critical service accounts
☐ Update firewall/IDS rules
☐ Review and fix security gaps
```

**Step 3: Verify Eradication**

```
☐ Full system scans on all affected hosts
☐ Network traffic analysis for beaconing
☐ Memory analysis for fileless malware
☐ Review logs for suspicious activity
☐ Validate no unauthorized access remains
☐ Third-party verification if high severity
```

---

### PHASE 5: RECOVERY

#### Restore Operations

**Step 1: System Recovery**

```
☐ Restore from known-good backups
☐ Rebuild compromised systems (clean install preferred)
☐ Apply all security patches
☐ Implement additional hardening
☐ Verify system integrity before reconnection
☐ Conduct security scan before production release
```

**Step 2: Monitoring Enhancement**

```
☐ Deploy additional monitoring on recovered systems
☐ Increase logging retention temporarily
☐ Enable enhanced detection rules
☐ Schedule additional vulnerability scans
☐ Monitor for signs of re-compromise
```

**Step 3: Return to Normal**

```
☐ Gradual restoration of services
☐ User communication and awareness
☐ Monitor user reports of issues
☐ Validate all systems functioning normally
☐ Document any permanent changes made
```

**Recovery Checklist:**

| System | Recovery Method | Tested | Restored | Notes |
|--------|-----------------|--------|----------|-------|
| | ☐ Rebuild ☐ Restore | ☐ | ☐ | |
| | ☐ Rebuild ☐ Restore | ☐ | ☐ | |
| | ☐ Rebuild ☐ Restore | ☐ | ☐ | |

---

### PHASE 6: POST-INCIDENT ACTIVITY

#### Lessons Learned

**Within 1 Week:**

```
☐ Conduct post-incident review meeting
☐ Document timeline of events
☐ Identify what worked well
☐ Identify areas for improvement
☐ Calculate incident cost/impact
☐ Update IR procedures based on lessons
☐ Provide feedback to detection systems
```

**Report Contents:**

| Section | Contents |
|---------|----------|
| Executive Summary | High-level overview for leadership |
| Timeline | Detailed chronology of events |
| Root Cause | How the incident occurred |
| Impact Assessment | Systems affected, data involved |
| Response Actions | What was done and when |
| Lessons Learned | What we learned |
| Recommendations | Security improvements needed |
| Attachments | Evidence, logs, screenshots |

#### Metrics to Capture

| Metric | Value |
|--------|-------|
| Mean Time to Detect (MTTD) | |
| Mean Time to Respond (MTTR) | |
| Mean Time to Contain (MTTC) | |
| Systems Affected | |
| Data Records Compromised | |
| Estimated Financial Impact | |
| Recovery Cost | |

---

## 5. Specific Playbooks

### 5.1 RANSOMWARE RESPONSE

#### Immediate Actions (First 30 minutes)

```
1. ISOLATE
   ☐ Disconnect affected systems from network
   ☐ Block C2 communications at firewall
   ☐ Isolate backup systems (protect from encryption)

2. IDENTIFY
   ☐ Identify ransomware variant (ID Ransomware, VirusTotal)
   ☐ Determine encryption method
   ☐ Check for known decryptors (NoMoreRansom.org)

3. ASSESS
   ☐ Scope of encrypted systems
   ☐ Backup availability and integrity
   ☐ Critical business impact

4. DECISION POINT
   ☐ Do NOT pay ransom (generally recommended)
   ☐ If paying: Engage specialized negotiator
   ☐ Restore from backups if available
```

#### Recovery Steps

```
☐ Verify backup integrity on isolated system
☐ Rebuild from scratch (don't trust cleaning)
☐ Restore data from clean backups only
☐ Patch all vulnerabilities before reconnection
☐ Implement additional ransomware protections
```

---

### 5.2 DATA BREACH RESPONSE

#### Immediate Actions (First Hour)

```
1. CONTAIN
   ☐ Stop ongoing data exfiltration
   ☐ Revoke attacker access
   ☐ Preserve evidence

2. ASSESS
   ☐ What data was accessed?
   ☐ How many records affected?
   ☐ Whose data (customers, employees, partners)?
   ☐ Data sensitivity classification

3. LEGAL
   ☐ Notify legal counsel immediately
   ☐ Determine regulatory notification requirements
   ☐ Preserve attorney-client privilege
```

#### Regulatory Notifications

| Regulation | Timeline | Requirement |
|------------|----------|-------------|
| GDPR | 72 hours | Supervisory authority |
| GDPR (high risk) | Without delay | Affected individuals |
| CCPA/CPRA | Without delay | California residents |
| HIPAA | 60 days | HHS + affected individuals |
| State Laws | Varies | See state requirements |

#### Notification Letter Template Elements

```
- What happened
- What information was involved
- What we are doing
- What you can do
- Contact information
- Identity protection offered (if applicable)
```

---

### 5.3 PHISHING INCIDENT RESPONSE

#### Initial Response

```
☐ Identify affected users
☐ Reset compromised credentials
☐ Check for successful logins from phishing
☐ Review email logs for scope
☐ Block phishing domain/IPs
☐ Submit to email security vendor for updates
```

#### Investigation Steps

```
☐ Analyze phishing email:
   - Sender information
   - Links and destinations
   - Attachments
   - Targeting scope
☐ Check proxy/firewall logs for clicks
☐ Review authentication logs
☐ Search for related indicators
☐ Determine if credentials compromised
☐ Check for mailbox rules created by attacker
```

#### Remediation

```
☐ Force password reset for affected users
☐ Terminate active sessions
☐ Remove malicious emails from all mailboxes
☐ Add indicators to blocklist
☐ Conduct user awareness training
☐ Adjust email security policies
```

---

### 5.4 INSIDER THREAT RESPONSE

#### Handling Considerations

```
⚠️ DO NOT confront suspect directly
⚠️ DO preserve evidence covertly
⚠️ DO involve HR and Legal early
⚠️ DO follow established procedures
⚠️ DO maintain confidentiality
```

#### Investigation Steps

```
☐ Document suspicious activity
☐ Preserve logs and evidence
☐ Consult with Legal and HR
☐ Limit access to investigation
☐ Monitor ongoing activity
☐ Prepare for potential termination
☐ Plan evidence handover to law enforcement if needed
```

---

## 6. Communication Templates

### 6.1 Internal Notification - Initial Alert

**Subject:** SECURITY INCIDENT - [Severity] - [Incident #]

```
A security incident has been detected and the Incident Response Team 
has been activated.

Incident Details:
- Incident Number: [XXX]
- Detection Time: [Time]
- Severity: [Critical/High/Medium/Low]
- Affected Systems: [Description]
- Current Status: [Status]

Actions Being Taken:
[Description of containment actions]

Do NOT:
- Discuss this incident on unsecured channels
- Access affected systems
- Power off affected systems

Report any suspicious activity to: [Contact]

Updates will be provided every [X] hours.
```

### 6.2 Executive Briefing Template

| Item | Details |
|------|---------|
| Incident Summary | One-line description |
| Timeline | Key events |
| Current Status | Contained/Ongoing/Resolved |
| Business Impact | Operations affected |
| Data Impact | Records affected |
| Public Exposure | Media/regulatory risk |
| Actions Taken | Response summary |
| Next Steps | Immediate priorities |
| Resources Needed | Budget/personnel |

### 6.3 External Notification - Customers

**Subject:** Important Security Notice - [Company Name]

```
Dear Valued Customer,

We are writing to inform you of a security incident that may have 
affected your personal information.

What Happened:
[Brief, factual description]

What Information Was Involved:
[List of data elements]

What We Are Doing:
- Actions taken to secure systems
- Enhancements being implemented
- Investigation status

What You Can Do:
- Recommended protective steps
- Monitoring suggestions
- Credit freeze information

We sincerely apologize for this incident and any inconvenience it 
may cause.

For questions: [Phone] | [Email]

Sincerely,
[Name], [Title]
```

### 6.4 Regulatory Notification Template

**To:** [Regulatory Authority]
**Subject:** Data Breach Notification - [Organization] - [Date]

```
NOTIFICATION OF PERSONAL DATA BREACH

1. Nature of the Breach:
   [Description of breach type]

2. Categories of Data:
   [List of data categories affected]

3. Approximate Number of Data Subjects:
   [Number]

4. Likely Consequences:
   [Potential impact assessment]

5. Measures Taken:
   [Remediation actions]

6. Contact Details:
   [DPO or responsible contact]

[Signature]
[Date]
```

---

## 7. Appendices

### Appendix A: IR Contact List

| Role | Name | Phone | Email | Alternate Contact |
|------|------|-------|-------|-------------------|
| Incident Commander | | | | |
| Technical Lead | | | | |
| Legal Counsel | | | | |
| HR Representative | | | | |
| PR/Communications | | | | |
| Executive Sponsor | | | | |
| External Forensics | | | | |
| Cyber Insurance | | | | |

### Appendix B: External Resources

| Resource | Contact | Purpose |
|----------|---------|---------|
| FBI IC3 | https://ic3.gov | Report cybercrime |
| CISA | report@cisa.gov | Report incidents |
| Secret Service | Local field office | Financial crimes |
| Legal Counsel | [Firm] | Legal guidance |
| PR Firm | [Agency] | Crisis communications |
| Forensics Vendor | [Vendor] | Technical investigation |
| Cyber Insurance | [Carrier] | Claims notification |

### Appendix C: Evidence Handling

**Chain of Custody Form**

| Date/Time | Handler | Action | Evidence ID | Signature |
|-----------|---------|--------|-------------|-----------|
| | | | | |
| | | | | |

**Evidence Categories:**
- Digital: Disk images, memory dumps, logs
- Physical: Servers, workstations, mobile devices
- Network: Packet captures, firewall logs
- Documents: Screenshots, photographs, notes

### Appendix D: Common Indicators

**Suspicious Process Names:**
- Mimikatz, Cobalt Strike, PsExec
- Unusual PowerShell activity
- Base64 encoded commands

**Suspicious Network Activity:**
- Beaconing to external IPs
- Large data transfers to unknown destinations
- DNS queries to DGA domains

**Suspicious File Locations:**
- %TEMP% with unusual executables
- Startup folders with unknown files
- WMI repository modifications

### Appendix E: Quick Reference Commands

**Windows Forensics:**
```cmd
# Memory acquisition
winpmem.exe -o memory.raw

# List network connections
netstat -anob

# List running processes
tasklist /v

# List scheduled tasks
schtasks /query /fo LIST /v

# List services
sc query

# Export registry
reg export HKLM\Software\Microsoft\Windows\CurrentVersion\Run run.reg
```

**Linux Forensics:**
```bash
# Memory acquisition
sudo dd if=/dev/mem of=memory.raw

# List network connections
sudo netstat -tulpn
sudo lsof -i

# List processes
ps auxf

# List cron jobs
sudo crontab -l
sudo cat /etc/crontab
sudo ls /etc/cron.*

# Recent logins
last
lastb

# List listening services
sudo ss -tulpn
```

---

**Document Control**
- Version: 1.0
- Classification: INTERNAL USE ONLY
- Last Updated: 2025
- Owner: Information Security Team
- Review Cycle: Annual

© 2025 Cybersecurity Implementation Toolkit. All rights reserved.
