# Security Audit Template
## Comprehensive IT Security Assessment Framework

---

## Instructions

This template is designed for:
- Internal security assessments
- Third-party security audits
- Compliance gap analysis
- Vendor security evaluations

**How to Use:**
1. Customize the scope section for your organization
2. Rate each control as: ✓ Pass, ✗ Fail, ~ Partial, N/A Not Applicable
3. Document evidence for each finding
4. Prioritize remediation efforts by risk level

---

## 1. Audit Scope & Information

### Basic Information
| Field | Value |
|-------|-------|
| Organization Name | |
| Audit Date | |
| Auditor Name | |
| Audit Type | ☐ Internal ☐ External ☐ Third-Party |
| Scope Definition | |
| Audit Standard | ☐ ISO 27001 ☐ SOC 2 ☐ NIST CSF ☐ CIS Controls ☐ Custom |

### Systems in Scope
| System Name | Environment | Criticality | Data Classification |
|-------------|-------------|-------------|---------------------|
| | ☐ Prod ☐ Dev ☐ Test | ☐ High ☐ Med ☐ Low | ☐ Critical ☐ Confidential ☐ Internal ☐ Public |
| | ☐ Prod ☐ Dev ☐ Test | ☐ High ☐ Med ☐ Low | ☐ Critical ☐ Confidential ☐ Internal ☐ Public |
| | ☐ Prod ☐ Dev ☐ Test | ☐ High ☐ Med ☐ Low | ☐ Critical ☐ Confidential ☐ Internal ☐ Public |

---

## 2. Governance & Risk Management

### 2.1 Security Governance
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| G.1 | Security policy exists and is approved | ☐ | | ☐ High ☐ Med ☐ Low | |
| G.2 | Security roles and responsibilities defined | ☐ | | ☐ High ☐ Med ☐ Low | |
| G.3 | Security steering committee meets regularly | ☐ | | ☐ High ☐ Med ☐ Low | |
| G.4 | Security budget allocated and tracked | ☐ | | ☐ High ☐ Med ☐ Low | |
| G.5 | Third-party risk management program | ☐ | | ☐ High ☐ Med ☐ Low | |

### 2.2 Risk Management
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| R.1 | Risk assessment methodology defined | ☐ | | ☐ High ☐ Med ☐ Low | |
| R.2 | Risk register maintained and current | ☐ | | ☐ High ☐ Med ☐ Low | |
| R.3 | Risk treatment plans implemented | ☐ | | ☐ High ☐ Med ☐ Low | |
| R.4 | Risk acceptance documented and approved | ☐ | | ☐ High ☐ Med ☐ Low | |
| R.5 | Emerging risks monitored | ☐ | | ☐ High ☐ Med ☐ Low | |

---

## 3. Access Control

### 3.1 Identity Management
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| AC.1 | Unique user accounts required | ☐ | | ☐ High ☐ Med ☐ Low | |
| AC.2 | Identity proofing process exists | ☐ | | ☐ High ☐ Med ☐ Low | |
| AC.3 | Account provisioning automated | ☐ | | ☐ High ☐ Med ☐ Low | |
| AC.4 | Guest/contractor accounts managed | ☐ | | ☐ High ☐ Med ☐ Low | |
| AC.5 | Service accounts inventoried | ☐ | | ☐ High ☐ Med ☐ Low | |

### 3.2 Authentication
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| AU.1 | Password policy enforced | ☐ | | ☐ High ☐ Med ☐ Low | |
| AU.2 | MFA enabled for all users | ☐ | | ☐ High ☐ Med ☐ Low | |
| AU.3 | MFA enabled for privileged users | ☐ | | ☐ High ☐ Med ☐ Low | |
| AU.4 | MFA enabled for remote access | ☐ | | ☐ High ☐ Med ☐ Low | |
| AU.5 | Single sign-on (SSO) implemented | ☐ | | ☐ High ☐ Med ☐ Low | |
| AU.6 | Password manager recommended/provided | ☐ | | ☐ High ☐ Med ☐ Low | |

### 3.3 Authorization
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| AZ.1 | Role-based access control implemented | ☐ | | ☐ High ☐ Med ☐ Low | |
| AZ.2 | Principle of least privilege enforced | ☐ | | ☐ High ☐ Med ☐ Low | |
| AZ.3 | Segregation of duties documented | ☐ | | ☐ High ☐ Med ☐ Low | |
| AZ.4 | Access reviews performed quarterly | ☐ | | ☐ High ☐ Med ☐ Low | |
| AZ.5 | Privileged access monitored | ☐ | | ☐ High ☐ Med ☐ Low | |
| AZ.6 | Just-in-time access for critical systems | ☐ | | ☐ High ☐ Med ☐ Low | |

### 3.4 Access Removal
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| AR.1 | Termination checklist includes IT access | ☐ | | ☐ High ☐ Med ☐ Low | |
| AR.2 | Access revoked within 24 hours | ☐ | | ☐ High ☐ Med ☐ Low | |
| AR.3 | Access revocation automated where possible | ☐ | | ☐ High ☐ Med ☐ Low | |
| AR.4 | Transfer process updates access appropriately | ☐ | | ☐ High ☐ Med ☐ Low | |

---

## 4. Data Protection

### 4.1 Data Classification
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| DC.1 | Data classification policy exists | ☐ | | ☐ High ☐ Med ☐ Low | |
| DC.2 | Data inventory maintained | ☐ | | ☐ High ☐ Med ☐ Low | |
| DC.3 | Data owners assigned | ☐ | | ☐ High ☐ Med ☐ Low | |
| DC.4 | Classification labels applied | ☐ | | ☐ High ☐ Med ☐ Low | |
| DC.5 | Handling procedures defined per classification | ☐ | | ☐ High ☐ Med ☐ Low | |

### 4.2 Data at Rest
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| DR.1 | Encryption for critical data | ☐ | | ☐ High ☐ Med ☐ Low | |
| DR.2 | Encryption for confidential data | ☐ | | ☐ High ☐ Med ☐ Low | |
| DR.3 | Database encryption enabled | ☐ | | ☐ High ☐ Med ☐ Low | |
| DR.4 | File server encryption enabled | ☐ | | ☐ High ☐ Med ☐ Low | |
| DR.5 | Endpoint encryption (full disk) | ☐ | | ☐ High ☐ Med ☐ Low | |
| DR.6 | Key management program established | ☐ | | ☐ High ☐ Med ☐ Low | |

### 4.3 Data in Transit
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| DT.1 | TLS 1.2+ enforced for all connections | ☐ | | ☐ High ☐ Med ☐ Low | |
| DT.2 | Certificate management program | ☐ | | ☐ High ☐ Med ☐ Low | |
| DT.3 | VPN required for remote access | ☐ | | ☐ High ☐ Med ☐ Low | |
| DT.4 | Email encryption for sensitive data | ☐ | | ☐ High ☐ Med ☐ Low | |
| DT.5 | Secure file transfer protocols | ☐ | | ☐ High ☐ Med ☐ Low | |

### 4.4 Data Loss Prevention
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| DLP.1 | DLP solution implemented | ☐ | | ☐ High ☐ Med ☐ Low | |
| DLP.2 | USB/port controls enabled | ☐ | | ☐ High ☐ Med ☐ Low | |
| DLP.3 | Cloud access security broker (CASB) | ☐ | | ☐ High ☐ Med ☐ Low | |
| DLP.4 | Email DLP rules configured | ☐ | | ☐ High ☐ Med ☐ Low | |
| DLP.5 | Data masking for non-production | ☐ | | ☐ High ☐ Med ☐ Low | |

---

## 5. Network Security

### 5.1 Perimeter Security
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| NS.1 | Firewall rules reviewed quarterly | ☐ | | ☐ High ☐ Med ☐ Low | |
| NS.2 | Default deny rule implemented | ☐ | | ☐ High ☐ Med ☐ Low | |
| NS.3 | Ingress/egress filtering enabled | ☐ | | ☐ High ☐ Med ☐ Low | |
| NS.4 | DMZ properly segmented | ☐ | | ☐ High ☐ Med ☐ Low | |
| NS.5 | Intrusion prevention system (IPS) | ☐ | | ☐ High ☐ Med ☐ Low | |
| NS.6 | DDoS protection implemented | ☐ | | ☐ High ☐ Med ☐ Low | |

### 5.2 Network Segmentation
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| SEG.1 | Network segmentation documented | ☐ | | ☐ High ☐ Med ☐ Low | |
| SEG.2 | VLANs properly configured | ☐ | | ☐ High ☐ Med ☐ Low | |
| SEG.3 | Critical systems isolated | ☐ | | ☐ High ☐ Med ☐ Low | |
| SEG.4 | East-west traffic monitored | ☐ | | ☐ High ☐ Med ☐ Low | |
| SEG.5 | Micro-segmentation where appropriate | ☐ | | ☐ High ☐ Med ☐ Low | |

### 5.3 Wireless Security
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| WS.1 | WPA2-Enterprise or WPA3 required | ☐ | | ☐ High ☐ Med ☐ Low | |
| WS.2 | Guest network isolated | ☐ | | ☐ High ☐ Med ☐ Low | |
| WS.3 | Wireless access points inventoried | ☐ | | ☐ High ☐ Med ☐ Low | |
| WS.4 | Rogue AP detection enabled | ☐ | | ☐ High ☐ Med ☐ Low | |

---

## 6. Endpoint Security

### 6.1 Endpoint Protection
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| EP.1 | Anti-malware on all endpoints | ☐ | | ☐ High ☐ Med ☐ Low | |
| EP.2 | EDR/XDR solution deployed | ☐ | | ☐ High ☐ Med ☐ Low | |
| EP.3 | Host firewall enabled | ☐ | | ☐ High ☐ Med ☐ Low | |
| EP.4 | USB controls implemented | ☐ | | ☐ High ☐ Med ☐ Low | |
| EP.5 | Application whitelisting where feasible | ☐ | | ☐ High ☐ Med ☐ Low | |

### 6.2 Patch Management
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| PM.1 | Patch management policy exists | ☐ | | ☐ High ☐ Med ☐ Low | |
| PM.2 | Critical patches within 7 days | ☐ | | ☐ High ☐ Med ☐ Low | |
| PM.3 | High patches within 30 days | ☐ | | ☐ High ☐ Med ☐ Low | |
| PM.4 | Automated patching where possible | ☐ | | ☐ High ☐ Med ☐ Low | |
| PM.5 | Exception process documented | ☐ | | ☐ High ☐ Med ☐ Low | |

### 6.3 Mobile Device Management
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| MDM.1 | MDM solution deployed | ☐ | | ☐ High ☐ Med ☐ Low | |
| MDM.2 | BYOD policy documented | ☐ | | ☐ High ☐ Med ☐ Low | |
| MDM.3 | Device encryption enforced | ☐ | | ☐ High ☐ Med ☐ Low | |
| MDM.4 | Remote wipe capability | ☐ | | ☐ High ☐ Med ☐ Low | |
| MDM.5 | App management/containerization | ☐ | | ☐ High ☐ Med ☐ Low | |

---

## 7. Application Security

### 7.1 Secure Development
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| SD.1 | SDLC policy documented | ☐ | | ☐ High ☐ Med ☐ Low | |
| SD.2 | Security requirements defined | ☐ | | ☐ High ☐ Med ☐ Low | |
| SD.3 | Threat modeling performed | ☐ | | ☐ High ☐ Med ☐ Low | |
| SD.4 | Secure coding standards adopted | ☐ | | ☐ High ☐ Med ☐ Low | |
| SD.5 | Security architecture reviews | ☐ | | ☐ High ☐ Med ☐ Low | |

### 7.2 Testing & Validation
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| TV.1 | SAST integrated in CI/CD | ☐ | | ☐ High ☐ Med ☐ Low | |
| TV.2 | DAST performed regularly | ☐ | | ☐ High ☐ Med ☐ Low | |
| TV.3 | Dependency scanning implemented | ☐ | | ☐ High ☐ Med ☐ Low | |
| TV.4 | Secrets detection in code | ☐ | | ☐ High ☐ Med ☐ Low | |
| TV.5 | Penetration testing annually | ☐ | | ☐ High ☐ Med ☐ Low | |
| TV.6 | Bug bounty or VDP established | ☐ | | ☐ High ☐ Med ☐ Low | |

### 7.3 Production Security
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| PS.1 | WAF deployed for web apps | ☐ | | ☐ High ☐ Med ☐ Low | |
| PS.2 | API security controls | ☐ | | ☐ High ☐ Med ☐ Low | |
| PS.3 | Input validation enforced | ☐ | | ☐ High ☐ Med ☐ Low | |
| PS.4 | Security headers configured | ☐ | | ☐ High ☐ Med ☐ Low | |
| PS.5 | Session management secure | ☐ | | ☐ High ☐ Med ☐ Low | |

---

## 8. Security Operations

### 8.1 Logging & Monitoring
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| LM.1 | Centralized log management | ☐ | | ☐ High ☐ Med ☐ Low | |
| LM.2 | Log retention policy implemented | ☐ | | ☐ High ☐ Med ☐ Low | |
| LM.3 | SIEM deployed and tuned | ☐ | | ☐ High ☐ Med ☐ Low | |
| LM.4 | Critical events alerted in real-time | ☐ | | ☐ High ☐ Med ☐ Low | |
| LM.5 | Log integrity protected | ☐ | | ☐ High ☐ Med ☐ Low | |

### 8.2 Vulnerability Management
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| VM.1 | Vulnerability scanning policy | ☐ | | ☐ High ☐ Med ☐ Low | |
| VM.2 | External scanning monthly | ☐ | | ☐ High ☐ Med ☐ Low | |
| VM.3 | Internal scanning quarterly | ☐ | | ☐ High ☐ Med ☐ Low | |
| VM.4 | Container scanning implemented | ☐ | | ☐ High ☐ Med ☐ Low | |
| VM.5 | Remediation SLAs defined | ☐ | | ☐ High ☐ Med ☐ Low | |

### 8.3 Incident Response
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| IR.1 | Incident response plan documented | ☐ | | ☐ High ☐ Med ☐ Low | |
| IR.2 | IR team roles defined | ☐ | | ☐ High ☐ Med ☐ Low | |
| IR.3 | IR procedures tested annually | ☐ | | ☐ High ☐ Med ☐ Low | |
| IR.4 | Forensic capabilities available | ☐ | | ☐ High ☐ Med ☐ Low | |
| IR.5 | Communication templates ready | ☐ | | ☐ High ☐ Med ☐ Low | |

---

## 9. Physical & Environmental Security

### 9.1 Physical Access
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| PA.1 | Facility access controls | ☐ | | ☐ High ☐ Med ☐ Low | |
| PA.2 | Visitor management process | ☐ | | ☐ High ☐ Med ☐ Low | |
| PA.3 | Badge/ID requirements | ☐ | | ☐ High ☐ Med ☐ Low | |
| PA.4 | Secure areas identified and protected | ☐ | | ☐ High ☐ Med ☐ Low | |
| PA.5 | Access logs reviewed | ☐ | | ☐ High ☐ Med ☐ Low | |

### 9.2 Environmental Controls
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| EC.1 | Fire detection and suppression | ☐ | | ☐ High ☐ Med ☐ Low | |
| EC.2 | Climate control for data centers | ☐ | | ☐ High ☐ Med ☐ Low | |
| EC.3 | Power backup (UPS/generator) | ☐ | | ☐ High ☐ Med ☐ Low | |
| EC.4 | Environmental monitoring | ☐ | | ☐ High ☐ Med ☐ Low | |
| EC.5 | Equipment disposal procedures | ☐ | | ☐ High ☐ Med ☐ Low | |

---

## 10. Business Continuity

### 10.1 Backup & Recovery
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| BR.1 | Backup policy documented | ☐ | | ☐ High ☐ Med ☐ Low | |
| BR.2 | RPO and RTO defined | ☐ | | ☐ High ☐ Med ☐ Low | |
| BR.3 | Automated backups configured | ☐ | | ☐ High ☐ Med ☐ Low | |
| BR.4 | Offsite/offline backups maintained | ☐ | | ☐ High ☐ Med ☐ Low | |
| BR.5 | Restoration tested quarterly | ☐ | | ☐ High ☐ Med ☐ Low | |

### 10.2 Disaster Recovery
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| DR.1 | DR plan documented and current | ☐ | | ☐ High ☐ Med ☐ Low | |
| DR.2 | DR site identified and ready | ☐ | | ☐ High ☐ Med ☐ Low | |
| DR.3 | DR tested annually | ☐ | | ☐ High ☐ Med ☐ Low | |
| DR.4 | Crisis communication plan | ☐ | | ☐ High ☐ Med ☐ Low | |

---

## 11. Third-Party & Cloud Security

### 11.1 Vendor Management
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| VN.1 | Vendor risk assessment process | ☐ | | ☐ High ☐ Med ☐ Low | |
| VN.2 | Security requirements in contracts | ☐ | | ☐ High ☐ Med ☐ Low | |
| VN.3 | Vendor security reviews performed | ☐ | | ☐ High ☐ Med ☐ Low | |
| VN.4 | Subprocessor monitoring | ☐ | | ☐ High ☐ Med ☐ Low | |
| VN.5 | Vendor SOC reports reviewed | ☐ | | ☐ High ☐ Med ☐ Low | |

### 11.2 Cloud Security
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| CL.1 | Cloud security posture management | ☐ | | ☐ High ☐ Med ☐ Low | |
| CL.2 | Cloud IAM properly configured | ☐ | | ☐ High ☐ Med ☐ Low | |
| CL.3 | Cloud data encryption | ☐ | | ☐ High ☐ Med ☐ Low | |
| CL.4 | Cloud logging enabled | ☐ | | ☐ High ☐ Med ☐ Low | |
| CL.5 | Cloud compliance monitoring | ☐ | | ☐ High ☐ Med ☐ Low | |

---

## 12. Compliance & Audit

### 12.1 Regulatory Compliance
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| RG.1 | Applicable regulations identified | ☐ | | ☐ High ☐ Med ☐ Low | |
| RG.2 | Compliance monitoring program | ☐ | | ☐ High ☐ Med ☐ Low | |
| RG.3 | Legal holds process | ☐ | | ☐ High ☐ Med ☐ Low | |
| RG.4 | Privacy program implemented | ☐ | | ☐ High ☐ Med ☐ Low | |

### 12.2 Internal Audit
| ID | Control | Rating | Finding | Risk Level | Remediation |
|----|---------|--------|---------|------------|-------------|
| IA.1 | Internal audit charter | ☐ | | ☐ High ☐ Med ☐ Low | |
| IA.2 | Audit plan executed | ☐ | | ☐ High ☐ Med ☐ Low | |
| IA.3 | Findings tracked to closure | ☐ | | ☐ High ☐ Med ☐ Low | |

---

## Summary & Action Plan

### Overall Rating
| Category | Pass | Partial | Fail | N/A | Score |
|----------|------|---------|------|-----|-------|
| Governance & Risk | | | | | /5 |
| Access Control | | | | | /10 |
| Data Protection | | | | | /10 |
| Network Security | | | | | /6 |
| Endpoint Security | | | | | /6 |
| Application Security | | | | | /6 |
| Security Operations | | | | | /5 |
| Physical Security | | | | | /5 |
| Business Continuity | | | | | /4 |
| Third-Party Security | | | | | /5 |
| Compliance | | | | | /2 |
| **TOTAL** | | | | | **/64** |

### Risk Summary
| Risk Level | Count | Percentage |
|------------|-------|------------|
| High | | |
| Medium | | |
| Low | | |

### Priority Actions
| Priority | Action | Owner | Target Date |
|----------|--------|-------|-------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Auditor | | | |
| IT Security Manager | | | |
| CIO/CTO | | | |
| Executive Sponsor | | | |

---

**Document Control**
- Version: 1.0
- Classification: Internal Use Only
- Next Review: [Date]

© 2025 Cybersecurity Implementation Toolkit
