# SOC2 Compliance for SaaS Companies: A Practical Implementation Guide

**Difficulty:** Intermediate  
**Keywords:** SOC2, compliance, SaaS security, trust services criteria, audit preparation  
**Estimated Reading Time:** 15-18 minutes

---

## Table of Contents

1. [Introduction](#introduction)
2. [Understanding SOC2 Framework](#understanding-soc2-framework)
3. [The Five Trust Services Criteria](#the-five-trust-services-criteria)
4. [SOC2 Type I vs Type II](#soc2-type-i-vs-type-ii)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Security Controls and Documentation](#security-controls-and-documentation)
7. [Audit Preparation](#audit-preparation)
8. [Maintaining Compliance](#maintaining-compliance)

---

## Introduction

### Overview

SOC2 (Service Organization Control 2) has become the gold standard for SaaS companies demonstrating their commitment to security and data protection. Unlike certifications that focus on specific technical controls, SOC2 evaluates how organizations manage customer data based on five trust services criteria.

For SaaS companies, SOC2 compliance is often a prerequisite for enterprise sales and partnerships. It provides assurance to customers that your organization has implemented effective controls for security, availability, processing integrity, confidentiality, and privacy. This guide provides a practical roadmap for achieving and maintaining SOC2 compliance.

### Key Points

- SOC2 is essential for B2B SaaS companies selling to enterprises
- Compliance requires both technical controls and process documentation
- Type II requires sustained compliance over time, not just a point-in-time assessment
- SOC2 is a framework, not a prescriptive checklist

## Understanding SOC2 Framework

### Overview

SOC2 was developed by the American Institute of CPAs (AICPA) as an auditing standard for service organizations. Unlike SOC1 which focuses on financial reporting, SOC2 evaluates controls relevant to security, availability, processing integrity, confidentiality, and privacy.

The framework is principle-based rather than prescriptive, allowing organizations to design controls appropriate for their specific environment. This flexibility means two SOC2-compliant companies may have very different control implementations while both meeting the trust services criteria.

### Code Example

```yaml
# SOC2 Control Framework Structure
soc2_framework:
  trust_services_criteria:
    security:
      common_criteria:
        - cc6.1: logical_access_security
        - cc6.2: access_removal
        - cc6.3: access_changes
        - cc6.6: encryption
        - cc6.7: transmission_security
      
    availability:
      common_criteria:
        - a1.1: availability_commitments
        - a1.2: system_monitoring
        - a1.3: incident_response
        
    processing_integrity:
      common_criteria:
        - pi1.1: processing_commitments
        - pi1.2: input_validation
        - pi1.3: error_handling
        
    confidentiality:
      common_criteria:
        - c1.1: confidentiality_commitments
        - c1.2: access_restrictions
        
    privacy:
      common_criteria:
        - p1.1: notice_practices
        - p1.2: choice_consent
        - p1.3: collection_limits

  control_categories:
    organizational:
      - governance_structure
      - risk_assessment
      - vendor_management
      
    technical:
      - access_control
      - encryption
      - monitoring
      - backup_recovery
      
    operational:
      - change_management
      - incident_response
      - business_continuity
      
  evidence_types:
    - policies: documented_procedures
    - screenshots: system_configurations
    - logs: system_activity
    - tickets: change_records
    - training: completion_certificates
```

### Key Points

- SOC2 is based on the Trust Services Criteria (TSC)
- Controls must address common criteria for each selected category
- Evidence collection is ongoing, not a one-time activity
- Controls should match organizational risk tolerance

## The Five Trust Services Criteria

### Overview

The five Trust Services Criteria form the foundation of SOC2. While Security is always required, the other four criteria are optional based on customer requirements and organizational priorities.

Security (Common Criteria) addresses protection against unauthorized access. Availability focuses on system uptime commitments. Processing Integrity ensures data processing is complete and accurate. Confidentiality protects sensitive information. Privacy addresses personal information handling practices.

### Code Example

```javascript
// Trust Services Criteria Implementation Mapping
const trustServicesCriteria = {
  // SECURITY - Always Required
  security: {
    description: 'Information and systems are protected against unauthorized access',
    keyControls: [
      {
        id: 'CC6.1',
        description: 'Logical access security',
        implementation: {
          technical: [
            'Multi-factor authentication (MFA) for all privileged access',
            'SSO integration with centralized identity provider',
            'Role-based access control (RBAC) enforcement',
            'Just-in-time (JIT) access for sensitive operations'
          ],
          processes: [
            'Quarterly access reviews',
            'Automated access provisioning/deprovisioning',
            'Privileged access monitoring'
          ],
          evidence: [
            'Access control policy document',
            'MFA configuration screenshots',
            'Access review meeting minutes',
            'Identity provider audit logs'
          ]
        }
      },
      {
        id: 'CC6.6',
        description: 'Encryption of data at rest and in transit',
        implementation: {
          technical: [
            'AES-256 encryption for database storage',
            'TLS 1.3 for all external connections',
            'Certificate management automation',
            'Key rotation every 90 days'
          ],
          processes: [
            'Quarterly encryption audit',
            'Vulnerability scanning for weak ciphers',
            'Certificate expiry monitoring'
          ],
          evidence: [
            'Encryption policy document',
            'SSL Labs scan results',
            'Database encryption configuration',
            'Key management system logs'
          ]
        }
      }
    ]
  },
  
  // AVAILABILITY - Optional
  availability: {
    description: 'Systems are available for operation and use as committed',
    keyControls: [
      {
        id: 'A1.2',
        description: 'System monitoring and incident handling',
        implementation: {
          technical: [
            '24/7 infrastructure monitoring',
            'Automated alerting on SLA breaches',
            'Performance dashboards and KPI tracking',
            'Capacity planning automation'
          ],
          processes: [
            'Incident response procedures',
            'Escalation matrix definition',
            'Post-incident review process',
            'Customer communication templates'
          ],
          evidence: [
            'Monitoring configuration screenshots',
            'Incident tickets with timestamps',
            'SLA commitment documentation',
            'Uptime reports from monitoring tool'
          ]
        }
      }
    ]
  },
  
  // PROCESSING INTEGRITY - Optional
  processingIntegrity: {
    description: 'System processing is complete, valid, accurate, timely, and authorized',
    keyControls: [
      {
        id: 'PI1.2',
        description: 'Input processing controls',
        implementation: {
          technical: [
            'Input validation on all API endpoints',
            'Schema validation for data ingestion',
            'Transaction logging for audit trails',
            'Data integrity checksums'
          ],
          processes: [
            'Data quality monitoring',
            'Reconciliation procedures',
            'Exception handling workflows'
          ],
          evidence: [
            'Input validation test results',
            'Error handling documentation',
            'Data reconciliation reports'
          ]
        }
      }
    ]
  },
  
  // CONFIDENTIALITY - Optional
  confidentiality: {
    description: 'Information designated as confidential is protected',
    keyControls: [
      {
        id: 'C1.1',
        description: 'Confidentiality commitments',
        implementation: {
          technical: [
            'Data classification tagging',
            'DLP (Data Loss Prevention) tools',
            'Access logging for sensitive data',
            'Secure data disposal procedures'
          ],
          processes: [
            'NDA requirements for personnel',
            'Confidential data handling procedures',
            'Secure disposal workflows'
          ],
          evidence: [
            'Data classification policy',
            'Signed NDAs for employees',
            'DLP configuration screenshots'
          ]
        }
      }
    ]
  },
  
  // PRIVACY - Optional
  privacy: {
    description: 'Personal information is collected, used, retained, and disposed of properly',
    keyControls: [
      {
        id: 'P1.1',
        description: 'Notice and communication of privacy practices',
        implementation: {
          technical: [
            'Privacy policy hosted on website',
            'Cookie consent management',
            'Data subject request portal',
            'Privacy preference center'
          ],
          processes: [
            'Privacy impact assessments',
            'Data retention policy enforcement',
            'Breach notification procedures',
            'Third-party privacy agreements'
          ],
          evidence: [
            'Privacy policy document',
            'Cookie consent configuration',
            'DSR (Data Subject Request) tracking'
          ]
        }
      }
    ]
  }
};
```

### Key Points

- Security (CC) is mandatory; other criteria are optional
- Choose criteria based on customer requirements and business needs
- Each criterion has specific common criteria (CC) to address
- Controls should be proportional to the risk

## SOC2 Type I vs Type II

### Overview

SOC2 offers two types of reports with different scopes and value propositions. Type I evaluates the design of controls at a specific point in time, while Type II assesses both design and operating effectiveness over a period (typically 6-12 months).

Type I is faster to achieve and demonstrates commitment to security. Type II provides stronger assurance that controls are operating effectively over time. Most enterprise customers prefer or require Type II reports.

### Code Example

```javascript
// SOC2 Report Type Comparison
const soc2ReportTypes = {
  typeI: {
    description: 'Report on design of controls',
    auditPeriod: 'Point in time (specific date)',
    scope: 'Design of controls only',
    timeline: '2-4 months from readiness',
    cost: '$$',
    value: [
      'Faster time to report',
      'Demonstrates security commitment',
      'Good for early-stage companies',
      'Can serve as foundation for Type II'
    ],
    useCases: [
      'First SOC2 report',
      'Customer requires quick compliance proof',
      'Preparing for Type II'
    ],
    auditProcess: [
      'Control design assessment',
      'Policy and procedure review',
      'Sample evidence collection',
      'Auditor walkthroughs',
      'Report issuance'
    ]
  },
  
  typeII: {
    description: 'Report on design and operating effectiveness',
    auditPeriod: '6-12 months of operation',
    scope: 'Design and operating effectiveness',
    timeline: '6-14 months (including observation period)',
    cost: '$$$$',
    value: [
      'Highest level of assurance',
      'Required by most enterprises',
      'Demonstrates sustained compliance',
      'Covers historical period'
    ],
    useCases: [
      'Enterprise sales requirements',
      'Renewal of existing compliance',
      'Competitive differentiation'
    ],
    auditProcess: [
      'Control design assessment (like Type I)',
      'Minimum 6-month observation period',
      'Ongoing evidence collection',
      'Sample testing across the period',
      'Exception identification and remediation',
      'Report issuance'
    ]
  }
};

// Timeline for Type II implementation
const typeIITimeline = {
  months1_2: {
    phase: 'Gap Analysis & Planning',
    activities: [
      'Conduct gap analysis against TSC',
      'Define scope and criteria',
      'Select audit firm',
      'Create implementation roadmap',
      'Assign control owners'
    ]
  },
  months3_4: {
    phase: 'Control Implementation',
    activities: [
      'Implement missing controls',
      'Document policies and procedures',
      'Configure technical controls',
      'Begin evidence collection',
      'Conduct training sessions'
    ]
  },
  months5_6: {
    phase: 'Readiness Assessment',
    activities: [
      'Internal audit of controls',
      'Remediate identified gaps',
      'Begin formal evidence collection',
      'Start observation period'
    ]
  },
  months7_12: {
    phase: 'Observation Period',
    activities: [
      'Continuous evidence collection',
      'Monitor control operation',
      'Address any control failures',
      'Prepare for auditor review'
    ]
  },
  months13_14: {
    phase: 'Audit & Reporting',
    activities: [
      'Auditor fieldwork',
      'Testing of controls',
      'Exception remediation',
      'Report drafting',
      'Final report issuance'
    ]
  }
};
```

### Key Points

- Type I: Design only, point in time, faster
- Type II: Design and operation, 6-12 month period, more valuable
- Most enterprises require Type II
- Plan 6-14 months for Type II implementation

## Implementation Roadmap

### Overview

Successful SOC2 implementation requires a structured approach covering people, processes, and technology. The roadmap should address control design, documentation, implementation, evidence collection, and audit preparation.

Starting with a gap analysis helps identify existing controls and areas needing improvement. Organizations should prioritize controls based on risk and implement them systematically to ensure sustainable compliance.

### Code Example

```yaml
# SOC2 Implementation Checklist
soc2_implementation:
  phase1_preparation:
    duration: "2-4 weeks"
    tasks:
      - define_scope:
          - select_trust_services_criteria
          - identify_systems_in_scope
          - determine_audit_period
          
      - gap_analysis:
          - review_existing_controls
          - identify_control_gaps
          - assess_risk_level
          
      - stakeholder_alignment:
          - executive_sponsorship
          - assign_control_owners
          - establish_project_team
          
  phase2_control_design:
    duration: "4-8 weeks"
    tasks:
      - policy_documentation:
          - information_security_policy
          - access_control_policy
          - change_management_policy
          - incident_response_policy
          - business_continuity_policy
          - vendor_management_policy
          
      - procedure_development:
          - user_access_procedures
          - privileged_access_procedures
          - change_management_workflows
          - incident_response_runbooks
          - backup_recovery_procedures
          
      - technical_controls:
          - identity_and_access_management
          - encryption_configuration
          - logging_and_monitoring
          - vulnerability_management
          - network_security
          
  phase3_implementation:
    duration: "4-8 weeks"
    tasks:
      - control_deployment:
          - configure_technical_controls
          - implement_automation
          - establish_monitoring
          
      - training:
          - security_awareness_training
          - role_specific_training
          - control_owner_training
          
      - evidence_collection_system:
          - define_evidence_requirements
          - setup_collection_processes
          - establish_document_repository
          
  phase4_readiness:
    duration: "2-4 weeks"
    tasks:
      - internal_audit:
          - test_control_effectiveness
          - identify_exceptions
          - remediate_findings
          
      - evidence_review:
          - validate_evidence_completeness
          - ensure_evidence_quality
          - organize_evidence_repository
          
      - auditor_preparation:
          - prepare_evidence_packages
          - schedule_walkthroughs
          - brief_control_owners

  phase5_audit:
    duration: "4-8 weeks"
    tasks:
      - fieldwork:
          - provide_evidence_to_auditor
          - participate_in_walkthroughs
          - respond_to_inquiries
          
      - remediation:
          - address_audit_findings
          - implement_corrective_actions
          - document_remediation
          
      - reporting:
          - review_draft_report
          - management_response
          - final_report_issuance
```

### Key Points

- Begin with gap analysis and scope definition
- Document policies before implementing technical controls
- Evidence collection must start early for Type II
- Internal audit before formal audit reduces surprises

## Security Controls and Documentation

### Overview

SOC2 requires comprehensive documentation of security controls across multiple domains. Each control must have clearly defined objectives, implementation details, and evidence of operation.

Documentation should be living documents that evolve with your organization. Policies should be reviewed annually at minimum, while procedures may need more frequent updates based on operational changes.

### Code Example

```markdown
# Sample Access Control Policy Document

## 1. Purpose
This policy defines the requirements for logical access to company systems and data in support of SOC2 CC6.1 through CC6.3.

## 2. Scope
This policy applies to all employees, contractors, and third parties with access to company systems.

## 3. Policy Statements

### 3.1 Account Management
- All user accounts must be uniquely identifiable and tied to an individual
- Shared accounts are prohibited except for specific service accounts
- Account provisioning requires manager approval documented in the IAM system
- Access must be granted based on the principle of least privilege

### 3.2 Authentication Requirements
- Multi-factor authentication (MFA) is required for:
  - All remote access
  - All privileged access
  - All production system access
- Passwords must meet complexity requirements:
  - Minimum 12 characters
  - Include uppercase, lowercase, numbers, and special characters
  - Not reused across systems

### 3.3 Access Reviews
- Quarterly access reviews are required for all systems
- Managers must certify user access within their team
- Privileged access requires monthly review
- Terminated user access must be revoked within 24 hours

### 3.4 Privileged Access
- Privileged accounts require additional approval
- Privileged access is logged and monitored
- Just-in-time (JIT) access is used for elevated permissions
- Break-glass accounts require CISO approval

## 4. Roles and Responsibilities
- **IT Security**: Policy maintenance, access monitoring
- **Managers**: Access approval, quarterly certifications
- **HR**: Termination notification within 24 hours
- **Employees**: Compliance with access requirements

## 5. Enforcement
Violations of this policy may result in disciplinary action up to and including termination.

## 6. Review and Updates
This policy is reviewed annually and updated as needed.

---
Effective Date: [DATE]
Last Reviewed: [DATE]
Next Review: [DATE]
Approved By: [CISO NAME]
```

```yaml
# Evidence Collection Framework
evidence_collection:
  frequency:
    continuous:
      - system_logs
      - access_logs
      - audit_trails
      - monitoring_alerts
      
    monthly:
      - access_review_certifications
      - vulnerability_scan_results
      - security_metrics_report
      
    quarterly:
      - policy_acknowledgments
      - access_review_meetings
      - risk_assessment_updates
      - vendor_reviews
      
    annually:
      - policy_reviews
      - disaster_recovery_tests
      - penetration_test_results
      - security_training_completion
      
  storage_requirements:
    retention_period: "7 years"
    access_controls: "restricted_to_audit_team"
    backup: "encrypted_offsite"
    integrity: "hash_verification"
    
  evidence_types:
    screenshots:
      description: "Visual proof of configuration"
      requirements:
        - include_timestamp
        - include_system_identifier
        - show_full_context
        - signed_by_administrator
        
    logs:
      description: "System generated records"
      requirements:
        - immutable_storage
        - centralized_collection
        - tamper_detection
        - regular_backup
        
    documents:
      description: "Policies, procedures, and records"
      requirements:
        - version_control
        - approval_signatures
        - review_dates
        - change_history
        
    tickets:
      description: "Change and incident records"
      requirements:
        - unique_identifier
        - timestamped_entries
        - approval_workflow
        - complete_audit_trail
```

### Key Points

- Document policies before implementing controls
- Evidence collection must be systematic and ongoing
- Use version control for policy documents
- Ensure evidence integrity through proper storage

## Audit Preparation

### Overview

Preparing for a SOC2 audit requires organizing evidence, briefing control owners, and ensuring systems are ready for auditor review. The goal is to demonstrate that controls are designed appropriately and operating effectively.

Auditors will test controls through inquiry, observation, inspection of documentation, and re-performance. Being well-prepared reduces audit duration, minimizes exceptions, and results in a cleaner report.

### Code Example

```javascript
// Audit Preparation Checklist
const auditPreparation = {
  // 30 Days Before Audit
  preAudit30Days: {
    documentation: [
      'Finalize all policy documents',
      'Complete procedure documentation',
      'Update system architecture diagrams',
      'Prepare network topology documentation'
    ],
    
    evidence: [
      'Organize evidence by control',
      'Verify evidence covers entire audit period',
      'Ensure evidence is properly labeled',
      'Confirm evidence accessibility'
    ],
    
    stakeholderPrep: [
      'Notify control owners of audit dates',
      'Schedule auditor walkthroughs',
      'Brief executive sponsor',
      'Prepare conference room and access'
    ]
  },
  
  // 7 Days Before Audit
  preAudit7Days: {
    systemReadiness: [
      'Verify auditor system access',
      'Test evidence retrieval processes',
      'Ensure log retention compliance',
      'Confirm sample population availability'
    ],
    
    teamReadiness: [
      'Conduct mock interviews',
      'Review control owner responsibilities',
      'Prepare FAQs for common questions',
      'Establish escalation process'
    ]
  },
  
  // During Audit
  duringAudit: {
    dailyActivities: [
      'Morning briefing with audit team',
      'Provide requested evidence promptly',
      'Document auditor requests',
      'Track open items and exceptions'
    ],
    
    communication: [
      'Designate single point of contact',
      'Schedule daily status meetings',
      'Escalate issues quickly',
      'Maintain professional demeanor'
    ]
  },
  
  // Common Auditor Requests
  commonEvidenceRequests: {
    accessControl: [
      'User access list with permissions',
      'Access provisioning tickets',
      'Access review meeting minutes',
      'Terminated user access removal logs',
      'Privileged access logs'
    ],
    
    changeManagement: [
      'Change request tickets',
      'Change approval records',
      'Emergency change documentation',
      'Post-implementation reviews',
      'Change calendar'
    ],
    
    monitoring: [
      'Security incident tickets',
      'Monitoring alert logs',
      'Incident response documentation',
      'Vulnerability scan reports',
      'Security metrics dashboards'
    ],
    
    backupRecovery: [
      'Backup configuration screenshots',
      'Backup test results',
      'Disaster recovery plan',
      'DR test documentation',
      'Recovery time objective evidence'
    ]
  }
};

// Evidence Package Template
const evidencePackage = {
  controlId: 'CC6.1',
  controlDescription: 'Logical access to system components is restricted',
  
  evidence: [
    {
      type: 'policy',
      name: 'Access Control Policy v2.3',
      date: '2024-01-15',
      location: '/policies/access-control-policy.pdf'
    },
    {
      type: 'screenshot',
      name: 'IAM Configuration - MFA Enforcement',
      date: '2024-03-01',
      location: '/evidence/cc6.1/iam-mfa-config.png'
    },
    {
      type: 'log',
      name: 'Access Provisioning Logs Q1 2024',
      dateRange: '2024-01-01 to 2024-03-31',
      location: '/evidence/cc6.1/access-logs-q1.csv'
    },
    {
      type: 'ticket',
      name: 'Q1 2024 Access Review Meeting',
      date: '2024-03-31',
      location: '/evidence/cc6.1/access-review-q1.pdf'
    }
  ],
  
  controlOwner: {
    name: 'Jane Smith',
    title: 'IT Security Manager',
    contact: 'jane.smith@company.com'
  },
  
  testingNotes: 'Controls tested through inspection of configuration settings, review of access logs, and observation of access review process. No exceptions noted.'
};
```

### Key Points

- Start preparation at least 30 days before audit
- Organize evidence by control for easy retrieval
- Brief all control owners on their responsibilities
- Track auditor requests and follow up promptly

## Maintaining Compliance

### Overview

SOC2 compliance is not a one-time achievement but an ongoing commitment. Maintaining compliance requires continuous monitoring, regular reviews, and timely updates to controls as your organization evolves.

Organizations must balance business agility with compliance requirements. Changes to systems, processes, or personnel must be evaluated for their impact on SOC2 controls. Regular internal audits help ensure controls remain effective between formal audits.

### Code Example

```yaml
# Ongoing Compliance Program
compliance_maintenance:
  daily_operations:
    activities:
      - monitor_security_alerts
      - review_access_requests
      - process_change_tickets
      - respond_to_incidents
      
  weekly_activities:
    - vulnerability_scan_review
    - access_log_analysis
    - security_metrics_review
    - control_exception_tracking
    
  monthly_activities:
    - access_review_followup
    - policy_compliance_check
    - evidence_collection_verification
    - security_committee_meeting
    
  quarterly_activities:
    - formal_access_reviews
    - risk_assessment_updates
    - vendor_risk_reviews
    - compliance_metrics_reporting
    - policy_acknowledgment_verification
    
  annual_activities:
    - comprehensive_policy_review
    - disaster_recovery_testing
    - penetration_testing
    - security_training_program
    - SOC2_audit_preparation
    
  change_management:
    process:
      - assess_change_impact:
          - identify_affected_controls
          - evaluate_risk_level
          - determine_testing_requirements
          
      - implement_change:
          - update_documentation
          - configure_technical_controls
          - train_affected_personnel
          
      - verify_compliance:
          - test_control_effectiveness
          - collect_new_evidence
          - document_compliance_status
          
    triggers:
      - new_system_implementation
      - major_application_updates
      - organizational_changes
      - vendor_changes
      - regulatory_updates
      
  continuous_monitoring:
    kpis:
      - name: "Security Incident Response Time"
        target: "< 4 hours"
        
      - name: "Critical Vulnerability Remediation"
        target: "< 30 days"
        
      - name: "Access Review Completion"
        target: "100% on time"
        
      - name: "Policy Acknowledgment Rate"
        target: "> 95%"
        
      - name: "Control Exception Count"
        target: "< 5 per quarter"
        
    tooling:
      - grafana_dashboards
      - splunk_alerts
      - jira_tracking
      - drata_automation
```

### Key Points

- Compliance requires ongoing effort, not just audit preparation
- Implement change management to assess control impacts
- Conduct regular internal audits
- Automate evidence collection where possible

---

## Conclusion

SOC2 compliance is a journey that transforms how organizations approach security and trust. While the process requires significant investment in time and resources, the benefits include improved security posture, increased customer trust, and competitive advantage in enterprise sales.

Success requires commitment from leadership, engagement across the organization, and a sustainable approach to control operation. By treating compliance as an ongoing program rather than a checkbox exercise, organizations can build lasting security capabilities that protect both their business and their customers.

## Further Reading

- [AICPA Trust Services Criteria](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/trustdataintegritytaskforce.html)
- [SOC2 Implementation Guide](https://www.aicpa.org/content/dam/aicpa/interestareas/frc/assuranceadvisoryservices/downloadabledocuments/soc-2-guide.pdf)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [ISO 27001 vs SOC2 Comparison](https://www.isms.online/iso-27001/iso-27001-vs-soc-2/)
