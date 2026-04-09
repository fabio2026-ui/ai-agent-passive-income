---
title: "Penetration Testing Methodology: From Recon to Report"
category: "Offensive Security"
tags: ["Pentest", "Methodology", "Ethical Hacking", "Assessment"]
date: "2026-04-09"
---

# Penetration Testing Methodology: From Recon to Report

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
