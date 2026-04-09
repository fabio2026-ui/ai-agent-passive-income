---
title: "Incident Response Playbook: From Detection to Recovery"
category: "Security Operations"
tags: ["Incident Response", "SOC", "Playbook", "Forensics"]
date: "2026-04-09"
---

# Incident Response Playbook: From Detection to Recovery

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
```
Subject: SECURITY INCIDENT - [SEVERITY] - [BRIEF DESCRIPTION]

We have detected a security incident affecting [SYSTEMS].
Incident ID: INC-2025-XXXX
Severity: P1/P2/P3/P4
Status: [CONTAINING/INVESTIGATING/RESOLVED]

Next update: [TIME]
```

### External Notification
```
We are writing to inform you of a security incident that may have affected your personal information...
[Required by GDPR, state laws, contracts]
```

## Metrics to Track

- Mean Time to Detect (MTTD)
- Mean Time to Respond (MTTR)
- Mean Time to Contain (MTTC)
- False positive rate
- Incident volume trends

## Conclusion

Preparation is key. Have playbooks ready before incidents occur.
