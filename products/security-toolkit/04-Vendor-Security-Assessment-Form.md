# Vendor Security Assessment Form
## Third-Party Security Risk Evaluation

---

## Instructions

This assessment form evaluates the security posture of vendors and third-party service providers. Use this form during:
- New vendor onboarding
- Annual vendor reviews
- Mergers and acquisitions due diligence
- Critical vendor re-assessments

**Scoring Guide:**
- **5** - Fully compliant with industry best practices
- **4** - Meets most requirements with minor gaps
- **3** - Partial compliance, moderate gaps
- **2** - Significant gaps, improvement needed
- **1** - Non-compliant or no evidence
- **N/A** - Not applicable to this vendor

**Risk Ratings:**
- **Critical (80-100 points):** Approved with enhanced monitoring
- **High (60-79 points):** Approved with conditions
- **Medium (40-59 points):** Requires remediation plan
- **Low (Below 40):** Not approved without significant improvements

---

## Section 1: Vendor Information

### Basic Information
| Field | Response |
|-------|----------|
| Vendor Name | |
| Primary Contact | |
| Contact Email | |
| Contact Phone | |
| Assessment Date | |
| Assessed By | |
| Vendor Type | ☐ Cloud Provider ☐ Software ☐ Professional Services ☐ Hardware ☐ Other: _____ |
| Data Access Level | ☐ None ☐ Public ☐ Internal ☐ Confidential ☐ Restricted/Critical |
| Criticality Rating | ☐ Critical ☐ High ☐ Medium ☐ Low |

### Service Details
| Field | Response |
|-------|----------|
| Service Description | |
| Data Processed/Stored | |
| Number of Users Affected | |
| Geographic Location of Data | |
| Sub-processors Used | |
| Integration Type | ☐ API ☐ SSO ☐ Data Export/Import ☐ Direct Network ☐ Standalone |

---

## Section 2: Corporate Security (10 Points)

### 2.1 Security Governance
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 2.1.1 | Does the vendor have a documented information security policy? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 2.1.2 | Is there a designated security officer or team? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 2.1.3 | Does the vendor conduct regular security awareness training? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 2.1.4 | Is there a security incident response plan? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

**Section 2 Subtotal:** ___ / 20 (Average of scores × 2)

---

## Section 3: Compliance & Certifications (15 Points)

### 3.1 Security Certifications
| # | Certification | Status | Date Issued | Expiration | Score |
|---|---------------|--------|-------------|------------|-------|
| 3.1.1 | SOC 2 Type II | ☐ Yes ☐ No ☐ N/A | | | ☐ 5 ☐ 0 |
| 3.1.2 | ISO 27001 | ☐ Yes ☐ No ☐ N/A | | | ☐ 5 ☐ 0 |
| 3.1.3 | PCI DSS | ☐ Yes ☐ No ☐ N/A | Level: _____ | | ☐ 5 ☐ 0 |
| 3.1.4 | HIPAA/HITECH | ☐ Yes ☐ No ☐ N/A | | | ☐ 5 ☐ 0 |
| 3.1.5 | FedRAMP | ☐ Yes ☐ No ☐ N/A | Level: _____ | | ☐ 5 ☐ 0 |
| 3.1.6 | GDPR Compliance | ☐ Yes ☐ No ☐ N/A | | | ☐ 5 ☐ 0 |
| 3.1.7 | Other: _________ | ☐ Yes ☐ No ☐ N/A | | | ☐ 5 ☐ 0 |

### 3.2 Audit & Assessment History
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 3.2.1 | Are external security audits performed annually? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 3.2.2 | Are penetration tests performed annually? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 3.2.3 | Are audit reports available for review? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 3.2.4 | Have there been any material findings in the last 12 months? | ☐ 5 (No) ☐ 3 (Minor) ☐ 1 (Major) ☐ N/A | | |

**Section 3 Subtotal:** ___ / 30 (Average of scores × 3)

---

## Section 4: Data Protection (20 Points)

### 4.1 Data Classification & Handling
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 4.1.1 | Is there a data classification policy? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 4.1.2 | Is data encrypted at rest? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | Algorithm: _____ | |
| 4.1.3 | Is data encrypted in transit (TLS 1.2+)? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | Version: _____ | |
| 4.1.4 | Is there a data retention policy? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 4.1.5 | Is there a secure data disposal procedure? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

### 4.2 Access Control
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 4.2.1 | Is role-based access control (RBAC) implemented? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 4.2.2 | Is multi-factor authentication required? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | Coverage: _____ | |
| 4.2.3 | Are access reviews performed regularly? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | Frequency: _____ | |
| 4.2.4 | Is privileged access monitored and controlled? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 4.2.5 | Are there account lockout policies? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

### 4.3 Data Privacy
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 4.3.1 | Is there a privacy policy published? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 4.3.2 | Are data subject rights processes implemented? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 4.3.3 | Is consent management implemented? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 4.3.4 | Are data processing agreements available? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

**Section 4 Subtotal:** ___ / 35 (Average of scores × 3.5)

---

## Section 5: Infrastructure Security (15 Points)

### 5.1 Network Security
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 5.1.1 | Are firewalls and IDS/IPS in place? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 5.1.2 | Is network segmentation implemented? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 5.1.3 | Are DDoS protection measures in place? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 5.1.4 | Is wireless security (WPA2-Enterprise/WPA3) enforced? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

### 5.2 Endpoint Security
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 5.2.1 | Is anti-malware deployed on all endpoints? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 5.2.2 | Are endpoints encrypted (FDE)? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 5.2.3 | Is mobile device management (MDM) implemented? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 5.2.4 | Is patch management automated? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

### 5.3 Cloud Security (if applicable)
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 5.3.1 | Is cloud security posture management used? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 5.3.2 | Are cloud resources properly configured? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 5.3.3 | Is cloud IAM properly managed? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

**Section 5 Subtotal:** ___ / 30 (Average of scores × 3)

---

## Section 6: Application Security (15 Points)

### 6.1 Secure Development
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 6.1.1 | Is there a documented SDLC? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 6.1.2 | Are security requirements defined? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 6.1.3 | Is threat modeling performed? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 6.1.4 | Are secure coding standards used? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

### 6.2 Testing & Validation
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 6.2.1 | Is SAST integrated in CI/CD? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 6.2.2 | Is DAST performed regularly? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 6.2.3 | Are dependencies scanned for vulnerabilities? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 6.2.4 | Is a WAF deployed? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

### 6.3 API Security (if applicable)
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 6.3.1 | Is API authentication enforced? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 6.3.2 | Is API rate limiting implemented? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 6.3.3 | Are API security best practices followed? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

**Section 6 Subtotal:** ___ / 30 (Average of scores × 3)

---

## Section 7: Security Operations (10 Points)

### 7.1 Monitoring & Detection
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 7.1.1 | Is a SIEM deployed? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 7.1.2 | Is 24/7 security monitoring in place? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 7.1.3 | Are security events correlated and analyzed? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

### 7.2 Incident Response
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 7.2.1 | Is there an incident response plan? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 7.2.2 | Is the IR plan tested annually? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 7.2.3 | Are forensic capabilities available? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

### 7.3 Vulnerability Management
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 7.3.1 | Is vulnerability scanning performed regularly? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 7.3.2 | Are critical vulnerabilities patched promptly? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | SLA: _____ | |
| 7.3.3 | Is there a vulnerability disclosure program? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

**Section 7 Subtotal:** ___ / 25 (Average of scores × 2.5)

---

## Section 8: Business Continuity (10 Points)

### 8.1 Availability & Resilience
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 8.1.1 | Is there a documented BCP/DR plan? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 8.1.2 | Are RPO and RTO defined? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | RPO: ___ RTO: ___ | |
| 8.1.3 | Are backups automated and tested? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 8.1.4 | Is there redundancy for critical components? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 8.1.5 | Are disaster recovery tests performed? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | Frequency: _____ | |

### 8.2 Business Resilience
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 8.2.1 | Does the vendor have cyber insurance? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | Coverage: $_____ | |
| 8.2.2 | Is there a documented exit strategy? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 8.2.3 | Is data portability supported? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

**Section 8 Subtotal:** ___ / 25 (Average of scores × 2.5)

---

## Section 9: Subprocessors & Supply Chain (5 Points)

### 9.1 Fourth-Party Risk
| # | Question | Score | Evidence | Notes |
|---|----------|-------|----------|-------|
| 9.1.1 | Are subprocessors disclosed? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 9.1.2 | Are subprocessor agreements in place? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 9.1.3 | Is subprocessor security assessed? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |
| 9.1.4 | Is there a notification process for new subprocessors? | ☐ 5 ☐ 4 ☐ 3 ☐ 2 ☐ 1 ☐ N/A | | |

**Section 9 Subtotal:** ___ / 20 (Average of scores × 2)

---

## Score Summary

| Section | Weight | Raw Score | Weighted Score |
|---------|--------|-----------|----------------|
| 2. Corporate Security | 10% | /20 | /10 |
| 3. Compliance & Certifications | 15% | /30 | /15 |
| 4. Data Protection | 20% | /35 | /20 |
| 5. Infrastructure Security | 15% | /30 | /15 |
| 6. Application Security | 15% | /30 | /15 |
| 7. Security Operations | 10% | /25 | /10 |
| 8. Business Continuity | 10% | /25 | /10 |
| 9. Subprocessors & Supply Chain | 5% | /20 | /5 |
| **TOTAL** | **100%** | | **/100** |

---

## Risk Assessment

### Overall Risk Rating
| Score Range | Rating | Recommendation |
|-------------|--------|----------------|
| 80-100 | Critical/Approved | Approved with standard monitoring |
| 60-79 | High/Conditional | Approved with conditions and enhanced monitoring |
| 40-59 | Medium/Remediation | Requires remediation plan before approval |
| Below 40 | Low/Not Approved | Not approved - significant improvements required |

**Calculated Score:** _____ / 100
**Risk Rating:** ☐ Critical ☐ High ☐ Medium ☐ Low

### Risk Factors
| Factor | Risk Level | Mitigation Required |
|--------|------------|---------------------|
| Data sensitivity handled | ☐ High ☐ Med ☐ Low | |
| System criticality | ☐ High ☐ Med ☐ Low | |
| Network connectivity | ☐ High ☐ Med ☐ Low | |
| Geographic risk | ☐ High ☐ Med ☐ Low | |
| Concentration risk | ☐ High ☐ Med ☐ Low | |

---

## Findings & Observations

### Critical Findings
| # | Finding | Risk | Remediation Required | Timeline |
|---|---------|------|---------------------|----------|
| 1 | | ☐ High ☐ Med ☐ Low | | |
| 2 | | ☐ High ☐ Med ☐ Low | | |
| 3 | | ☐ High ☐ Med ☐ Low | | |

### Areas of Strength
1. 
2. 
3. 

### Areas for Improvement
1. 
2. 
3. 

---

## Remediation Plan

| # | Finding | Action Required | Owner | Target Date | Status |
|---|---------|-----------------|-------|-------------|--------|
| 1 | | | | | ☐ Open ☐ In Progress ☐ Closed |
| 2 | | | | | ☐ Open ☐ In Progress ☐ Closed |
| 3 | | | | | ☐ Open ☐ In Progress ☐ Closed |

---

## Required Documentation Checklist

| Document | Requested | Received | Reviewed | Notes |
|----------|-----------|----------|----------|-------|
| SOC 2 Type II Report | ☐ | ☐ | ☐ | |
| ISO 27001 Certificate | ☐ | ☐ | ☐ | |
| Penetration Test Report | ☐ | ☐ | ☐ | |
| Vulnerability Scan Results | ☐ | ☐ | ☐ | |
| Data Processing Agreement | ☐ | ☐ | ☐ | |
| Business Associate Agreement | ☐ | ☐ | ☐ | |
| Subprocessor List | ☐ | ☐ | ☐ | |
| Incident Response Plan | ☐ | ☐ | ☐ | |
| DR/BCP Documentation | ☐ | ☐ | ☐ | |
| Cyber Insurance Certificate | ☐ | ☐ | ☐ | |

---

## Contract Security Requirements

The following security requirements must be included in the contract:

| # | Requirement | Included |
|---|-------------|----------|
| 1 | Data encryption (at rest and in transit) | ☐ Yes ☐ No |
| 2 | Access control and authentication | ☐ Yes ☐ No |
| 3 | Security incident notification (24 hours) | ☐ Yes ☐ No |
| 4 | Right to audit | ☐ Yes ☐ No |
| 5 | Data deletion/return upon termination | ☐ Yes ☐ No |
| 6 | Breach notification requirements | ☐ Yes ☐ No |
| 7 | Subprocessor restrictions | ☐ Yes ☐ No |
| 8 | Compliance with applicable regulations | ☐ Yes ☐ No |
| 9 | Liability and indemnification | ☐ Yes ☐ No |
| 10 | Security standards maintenance | ☐ Yes ☐ No |

---

## Decision

| Decision | Selected |
|----------|----------|
| **Approved** | ☐ |
| **Approved with Conditions** | ☐ |
| **Deferred - Pending Remediation** | ☐ |
| **Not Approved** | ☐ |

### If Approved with Conditions:
| Condition | Monitoring Frequency |
|-----------|---------------------|
| | ☐ Monthly ☐ Quarterly ☐ Semi-Annual ☐ Annual |
| | ☐ Monthly ☐ Quarterly ☐ Semi-Annual ☐ Annual |
| | ☐ Monthly ☐ Quarterly ☐ Semi-Annual ☐ Annual |

### Next Review Date: _______________

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Assessor | | | |
| Information Security | | | |
| Legal/Compliance | | | |
| Procurement | | | |
| Executive Sponsor | | | |

---

**Document Control**
- Version: 1.0
- Classification: Internal Use Only
- Review Cycle: Annual or upon significant change
- Template Version: 2025

© 2025 Cybersecurity Implementation Toolkit. All rights reserved.
