# YouTube Video Script: Building a SOC - Security Operations Center Guide
**Topic:** SOC Design, Operations, and Best Practices
**Duration:** 10-12 minutes
**Target Audience:** Security managers, aspiring SOC analysts, CISOs

---

## 🎬 INTRO HOOK (0:00 - 0:45)

*[SOC room footage, analysts at screens, dashboards with alerts]*

**HOST:**
"In the time it takes you to watch this video, a mid-sized company will experience 5 security alerts. By the end of the day, they'll have hundreds—thousands if it's a bad day. And most of those alerts will never be investigated.

Not because the security team doesn't care. But because they're drowning. Alert fatigue. Tool overload. Constant context switching. And an adversary who only needs to be right once.

A Security Operations Center isn't just a room with monitors. It's a capability. A process. A team that knows what to look for, how to investigate, and when to escalate. Done right, it's your early warning system. Done wrong, it's an expensive ticket-punching operation that misses the real threats.

I've built SOCs from scratch. I've turned around failing operations. And in this video, I'm sharing everything you need to know to build, run, or improve a Security Operations Center.

Whether you're a one-person security team or managing a 24/7 global operation, this is your blueprint."

---

## 📋 CONTENT STRUCTURE

### Section 1: SOC Fundamentals (0:45 - 2:30)

**What is a SOC?**

A Security Operations Center is a centralized function responsible for:
- **Monitoring** security events 24/7
- **Detecting** threats and anomalies
- **Analyzing** security incidents
- **Responding** to security events
- **Reporting** on security posture

**SOC Models:**

| Model | Description | Best For |
|-------|-------------|----------|
| **In-House** | Dedicated internal team | Large enterprises, regulated industries |
| **Outsourced (MSSP)** | Managed security service provider | SMBs, rapid deployment |
| **Co-Managed** | Hybrid internal + external | Growing security programs |
| **Virtual SOC** | Distributed team, cloud tools | Remote-first organizations |
| **Fusion Center** | Combined physical + cyber | Critical infrastructure |

**SOC Tiers:**

**Tier 1 - Alert Triage:**
- Monitor alerts and dashboards
- Initial triage and classification
- Basic incident handling
- Ticket creation and routing

**Tier 2 - Incident Analysis:**
- Deep-dive investigations
- Threat hunting
- Malware analysis (basic)
- Incident containment

**Tier 3 - Expert Response:**
- Advanced persistent threat (APT) hunting
- Forensic analysis
- Incident command
- Threat intelligence analysis

**Tier 4 - Strategic Security:**
- Architecture review
- Tool optimization
- Process improvement
- Executive reporting

### Section 2: SOC Architecture & Technology (2:30 - 5:00)

**Core SOC Technology Stack:**

```
┌─────────────────────────────────────────────────────────┐
│                    DATA SOURCES                         │
│  (Endpoints, Network, Cloud, Identity, Applications)    │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│              DATA COLLECTION & PROCESSING               │
│         (Log collectors, Forwarders, Normalization)     │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│                  SIEM / DATA LAKE                       │
│     (Splunk, Sentinel, Chronicle, Elastic, QRadar)      │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│              DETECTION & ANALYSIS                       │
│    (Correlation rules, ML/UEBA, SOAR, Threat Intel)     │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│              TICKETING & CASE MANAGEMENT                │
│         (ServiceNow, TheHive, XSOAR, Jira)              │
└─────────────────────────────────────────────────────────┘
```

**Log Sources (In Priority Order):**

1. **Critical (Must Have):**
   - EDR/XDR logs
   - Firewall logs
   - Authentication logs (AD, Azure AD, Okta)
   - Cloud platform logs (AWS CloudTrail, Azure Activity)
   - VPN logs

2. **High Priority:**
   - Web proxy logs
   - DNS logs
   - Email gateway logs
   - Database audit logs
   - Web application firewall (WAF)

3. **Medium Priority:**
   - OS system logs
   - Application logs
   - Network flow logs (NetFlow)
   - Vulnerability scan results
   - DHCP logs

**SIEM Selection Guide:**

| SIEM | Strengths | Best For |
|------|-----------|----------|
| **Splunk** | Flexibility, ecosystem | Large enterprises, complex use cases |
| **Microsoft Sentinel** | Cloud-native, cost-effective | Microsoft shops, cloud-first |
| **Google Chronicle** | Speed, scalability | Google Cloud, large data volumes |
| **IBM QRadar** | Enterprise features, support | Traditional enterprises |
| **Elastic Security** | Open source, cost-effective | Technical teams, budget-conscious |
| **Sumo Logic** | Cloud-native, easy deployment | Cloud-first organizations |
| **SentinelOne Singularity** | XDR focus, automation | EDR-first strategies |

**Detection Engineering:**

**Rule Development Process:**
```
1. Threat Identification
   └─ MITRE ATT&CK mapping
   └─ Threat intelligence
   └─ Incident lessons learned

2. Logic Design
   └─ Data source selection
   └─ Query development
   └─ False positive analysis

3. Testing
   └─ Synthetic data testing
   └─ Historical data validation
   └─ Tuning

4. Deployment
   └─ Staged rollout
   └─ Documentation
   └─ Playbook creation

5. Maintenance
   └─ Performance monitoring
   └─ False positive review
   └─ Continuous tuning
```

**Example Detection Rule (Sigma):**
```yaml
title: Suspicious PowerShell Encoded Command
logsource:
  product: windows
  service: powershell
selection:
  EventID: 4104
  ScriptBlockText|contains:
    - '-enc '
    - '-encodedcommand '
    - 'FromBase64String'
condition: selection
falsepositives:
  - Legitimate admin scripts
level: high
tags:
  - attack.execution
  - attack.t1059.001
```

### Section 3: SOC Processes & Procedures (5:00 - 7:30)

**The Alert Lifecycle:**

```
Alert Generated
      ↓
[Auto-Triage] ──▶ False Positive? ──▶ Close with notes
      ↓
Manual Triage (Tier 1)
      ↓
Investigation Required?
      ↓
┌─────┴─────┐
│           │
No         Yes
│           │
Close    Escalate to Tier 2
              ↓
         Investigation
              ↓
         Confirmed Incident?
              ↓
         ┌────┴────┐
         │         │
        No        Yes
         │         │
      Close    Incident Response
                  ↓
              Containment
                  ↓
              Recovery
                  ↓
              Lessons Learned
```

**Triage Decision Tree:**

**Key Questions for Tier 1:**
1. Is this alert related to a known-good activity?
2. Does the user/device have a legitimate reason for this behavior?
3. Is this a known false positive pattern?
4. Are there multiple related alerts (correlation)?
5. Does this match any threat intel indicators?

**SLA Targets:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Alert Triage Time | < 15 minutes | Time to initial review |
| Tier 1 Escalation | < 30 minutes | Time to escalate if needed |
| Tier 2 Response | < 1 hour | Time to acknowledge escalations |
| Incident Declaration | < 4 hours | Time to declare confirmed incident |
| Critical Escalation | < 15 minutes | Executive notification |

**Shift Handover Process:**

**Outgoing Shift:**
1. Update shift log with key events
2. Highlight open investigations
3. Note any system issues
4. Update threat intel brief

**Incoming Shift:**
1. Review shift log
2. Check open tickets and priorities
3. Verify system health
4. Ask clarifying questions

**Handover Template:**
```markdown
# Shift Handover - [Date] [Shift]

## Key Events
- 2 confirmed phishing incidents handled
- 1 malware outbreak contained
- SIEM maintenance completed at 02:00

## Open Investigations
- INC-2024-015: Suspicious lateral movement (Tier 2 assigned)
- INC-2024-016: Data exfiltration investigation (pending logs)

## Threat Intelligence Updates
- New APT29 campaign targeting our industry
- Updated IOCs pushed to EDR

## System Status
- SIEM: Healthy
- EDR: Healthy  
- Firewall: Healthy
- Ticketing: Degraded (scheduled fix tonight)

## Notes for Next Shift
- Monitor for APT29 indicators
- Follow up on data exfil case at 08:00
```

### Section 4: Metrics & KPIs (7:30 - 9:00)

**Operational Metrics:**

**Volume Metrics:**
| Metric | Description | Target |
|--------|-------------|--------|
| Alerts per day | Total alerts generated | Baseline trend |
| Incidents per week | Confirmed security incidents | Decreasing trend |
| Tickets created | Total SOC tickets | Baseline trend |

**Efficiency Metrics:**
| Metric | Description | Target |
|--------|-------------|--------|
| MTTD | Mean time to detect | < 24 hours |
| MTTR | Mean time to respond | < 4 hours |
| MTTC | Mean time to contain | < 8 hours |
| Alert closure rate | % alerts properly closed | > 95% |

**Quality Metrics:**
| Metric | Description | Target |
|--------|-------------|--------|
| False positive rate | % alerts that are false | < 20% |
| Escalation accuracy | % escalations that become incidents | > 70% |
| Missed detections | Incidents not detected by SOC | 0 |

**Business Metrics:**
| Metric | Description |
|--------|-------------|
| Dwell time | Time attacker is in environment |
| Incident cost | Financial impact per incident |
| SOC cost per alert | Total SOC cost / alert volume |

**Dashboard Design:**

**SOC Manager Dashboard:**
- Alert volume trends
- Open incident summary
- SLA compliance
- Team workload distribution
- System health

**Analyst Dashboard:**
- Assigned alerts/incidents
- Queue depth
- Threat intel feed
- Investigation tools
- Knowledge base

**Executive Dashboard:**
- Risk score trend
- Incident summary (last 30 days)
- MTTD/MTTR trends
- Compliance status
- Cost per incident

### Section 5: Building Your SOC (9:00 - 11:00)

**Phase 1: Foundation (Months 1-3)**

**Week 1-2: Planning**
- Define SOC scope and objectives
- Identify stakeholders
- Budget planning
- Resource planning

**Week 3-6: Core Infrastructure**
- SIEM selection and deployment
- Critical log source onboarding
- Initial detection rules
- Ticketing system setup

**Week 7-10: Process Development**
- Triage procedures
- Escalation workflows
- Communication plans
- Documentation templates

**Week 11-12: Team Preparation**
- Analyst hiring/training
- Tool training
- Tabletop exercises
- Go-live preparation

**Phase 2: Optimization (Months 4-6)**

- Additional log sources
- Detection rule tuning
- Playbook development
- Automation implementation
- Metrics tracking

**Phase 3: Maturity (Months 7-12)**

- Threat hunting program
- Purple team exercises
- Advanced analytics
- SOAR integration
- Continuous improvement

**Staffing Models:**

**Small SOC (1-5 analysts):**
- Generalist approach
- 8x5 coverage initially
- Automation focus
- MSSP for off-hours

**Medium SOC (6-15 analysts):**
- Tiered structure
- 24x7 coverage (3 shifts)
- Specialization emerging
- Hybrid tools

**Large SOC (16+ analysts):**
- Full tier structure
- 24x7 coverage with follow-the-sun
- Subspecialties (cloud, network, endpoint)
- Advanced automation

**Analyst Skills Matrix:**

| Skill | Tier 1 | Tier 2 | Tier 3 |
|-------|--------|--------|--------|
| Log analysis | ★★★ | ★★★ | ★★★ |
| Network analysis | ★★☆ | ★★★ | ★★★ |
| Malware analysis | ★☆☆ | ★★☆ | ★★★ |
| Threat hunting | ★☆☆ | ★★☆ | ★★★ |
| Forensics | ★☆☆ | ★★☆ | ★★★ |
| Scripting | ★☆☆ | ★★☆ | ★★★ |
| Communication | ★★☆ | ★★★ | ★★★ |

### Section 6: Common SOC Challenges (11:00 - 12:00)

**Challenge 1: Alert Fatigue**

**Symptoms:**
- High false positive rate
- Analysts ignoring alerts
- Missing real incidents
- Burnout

**Solutions:**
- Tune detection rules
- Implement risk scoring
- Use ML/UEBA for prioritization
- Automation for known false positives
- Regular rule review

**Challenge 2: Skill Shortage**

**Solutions:**
- Internal training programs
- Certification support
- Knowledge base development
- Mentorship programs
- Competitive compensation

**Challenge 3: Tool Complexity**

**Solutions:**
- Integrated platforms over point solutions
- SOAR for orchestration
- Standardized playbooks
- Regular tool training
- Vendor management

**Challenge 4: Communication Gaps**

**Solutions:**
- Clear escalation procedures
- Regular stakeholder updates
- Executive reporting
- Cross-team collaboration
- War room protocols

---

## 🎯 CTA / OUTRO (12:00 - 12:30)

**HOST:**
"A SOC isn't built in a day. It's not just about the tools—it's about the people, the processes, and the culture of continuous improvement.

Whether you're building from scratch or optimizing an existing operation, the principles are the same: know what you're protecting against, collect the right data, detect the threats that matter, and respond fast.

Your action plan:

1. **Download my SOC Starter Kit**—it includes runbooks, RACI matrices, and metric templates
2. **Audit your current detection coverage**—are you logging the right sources? Do your rules actually work?
3. **Calculate your MTTD and MTTR**—if you don't measure it, you can't improve it
4. **Subscribe for more SOC content**—next week we're diving into threat hunting methodologies
5. **Comment 'SOC READY'** if you're building or improving your SOC

The threat landscape isn't getting easier. But with the right SOC capability, you can detect faster, respond smarter, and sleep better.

Build your SOC, train your team, hunt the threats. I'll see you in the next video."

*[End screen with starter kit download and subscribe]*

---

## 📝 SOC RESOURCES

**Frameworks:**
- NIST SP 800-61: Incident Handling
- MITRE ATT&CK: Detection and analytics
- MITRE D3FEND: Countermeasures
- CISA SOC Framework

**Training:**
- SANS SEC450: Blue Team Fundamentals
- SANS SEC555: SIEM with Tactical Analytics
- Blue Team Village (DEF CON)
- LetsDefend.io (SOC simulation)

**Communities:**
- Security Onion community
- Sigma project
- Detection Engineering Twitter
- /r/blueteamsec

**Certifications:**
- GCIH (GIAC Certified Incident Handler)
- GCIA (GIAC Certified Intrusion Analyst)
- Blue Team Level 1 (BTL1)
- CompTIA Security+
