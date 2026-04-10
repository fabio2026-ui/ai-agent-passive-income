# Incident Response Playbook Part 2: Eradication, Recovery, and Post-Incident Excellence

## Introduction

The final phases of incident response—Eradication, Recovery, and Post-Incident Activity—determine whether an organization truly overcomes a security incident or merely survives it. While containment stops the bleeding, eradication removes the threat, recovery restores operations, and post-incident activities ensure the organization emerges stronger.

This guide provides detailed procedures for completing the incident response lifecycle and building lasting organizational resilience.

## Table of Contents

1. Eradication: Removing the Threat
2. Recovery: Restoring Normal Operations
3. Forensic Analysis and Evidence Preservation
4. Post-Incident Activities
5. Continuous Improvement Framework
6. Special Incident Types
7. Metrics and Reporting

## Eradication: Removing the Threat

### Eradication Strategy Framework

Eradication must be thorough but carefully planned to avoid disrupting business operations:

```yaml
eradication_phases:
  phase_1_threat_elimination:
    priority: immediate
    actions:
      - terminate_malicious_processes
      - remove_malware_files
      - delete_persistence_mechanisms
      - clean_registry_entries
      - remove_rogue_accounts
    
  phase_2_vulnerability_remediation:
    priority: within_24_hours
    actions:
      - patch_exploited_vulnerabilities
      - update_security_configurations
      - strengthen_access_controls
      - implement_additional_monitoring
    
  phase_3_environment_hardening:
    priority: within_1_week
    actions:
      - segment_network
      - deploy_additional_controls
      - enhance_detection_rules
      - update_policies
```

### Malware Eradication Procedures

```python
class MalwareEradicator:
    def __init__(self):
        self.removal_tools = {
            'windows': ['defender', 'malwarebytes', 'kaspersky'],
            'linux': ['chkrootkit', 'rkhunter', 'clamav'],
            'macos': ['malwarebytes', 'knockknock']
        }
    
    def create_eradication_plan(self, infected_systems, malware_analysis):
        """Create comprehensive eradication plan."""
        plan = {
            'preparation': [],
            'eradication_sequence': [],
            'validation': [],
            'rollback_plan': None
        }
        
        # Preparation phase
        plan['preparation'].extend([
            'backup_critical_data',
            'verify_backup_integrity',
            'document_current_state',
            'prepare_clean_install_media'
        ])
        
        # Determine eradication approach
        if malware_analysis['persistence_level'] == 'high':
            plan['eradication_sequence'] = self.plan_rebuild_sequence(
                infected_systems
            )
        else:
            plan['eradication_sequence'] = self.plan_cleaning_sequence(
                infected_systems,
                malware_analysis
            )
        
        # Validation steps
        plan['validation'] = [
            'verify_no_malware_detected',
            'confirm_persistence_removed',
            'validate_system_integrity',
            'test_critical_functions'
        ]
        
        return plan
    
    def execute_eradication(self, plan, system):
        """Execute eradication on a single system."""
        results = []
        
        for step in plan['eradication_sequence']:
            try:
                if step['type'] == 'process_termination':
                    result = self.kill_malicious_processes(
                        system,
                        step['processes']
                    )
                
                elif step['type'] == 'file_deletion':
                    result = self.delete_malicious_files(
                        system,
                        step['files']
                    )
                
                elif step['type'] == 'registry_cleanup':
                    result = self.clean_registry(system, step['keys'])
                
                elif step['type'] == 'account_removal':
                    result = self.remove_rogue_accounts(
                        system,
                        step['accounts']
                    )
                
                results.append({
                    'step': step['type'],
                    'status': 'success',
                    'details': result
                })
                
            except Exception as e:
                results.append({
                    'step': step['type'],
                    'status': 'failed',
                    'error': str(e)
                })
                
                # Determine if failure is critical
                if step['critical']:
                    return {'status': 'failed', 'results': results}
        
        return {'status': 'success', 'results': results}
    
    def verify_eradication(self, system, iocs):
        """Verify that malware has been completely removed."""
        verification_results = {
            'processes_clean': self.check_processes(system, iocs['processes']),
            'files_clean': self.check_files(system, iocs['files']),
            'registry_clean': self.check_registry(system, iocs['registry']),
            'network_clean': self.check_network_connections(system, iocs['network']),
            'accounts_clean': self.check_accounts(system, iocs['accounts'])
        }
        
        # Run additional scans
        scan_results = self.run_security_scans(system)
        
        all_clean = all(verification_results.values()) and scan_results['clean']
        
        return {
            'verified': all_clean,
            'details': verification_results,
            'scan_results': scan_results
        }
```

### Account Compromise Eradication

```yaml
account_compromise_eradication:
  immediate_actions:
    - disable_compromised_account
    - revoke_all_active_sessions
    - block_mfa_device_changes
    - prevent_password_reset_attempts
    
  investigation:
    - audit_account_activity_last_90_days
    - identify_data_accessed
    - trace_lateral_movement
    - check_forwarding_rules
    - review_api_key_usage
    
  remediation:
    - force_password_reset
    - reset_mfa_devices
    - review_and_revoke_oauth_grants
    - regenerate_api_keys
    - remove_email_forwarding_rules
    - check_calendar_sharing
    
  verification:
    - confirm_no_unauthorized_access
    - validate_all_sessions_terminated
    - test_account_security_settings
    - monitor_for_re compromise
```

### Persistence Mechanism Removal

| Persistence Type | Location | Detection Method | Removal Approach |
|------------------|----------|------------------|------------------|
| **Registry Run Keys** | HKLM/HKCU\Software\Microsoft\Windows\CurrentVersion\Run | Registry monitoring | Delete malicious entries |
| **Scheduled Tasks** | Task Scheduler | Task audit | Remove unauthorized tasks |
| **Services** | Windows Services | Service list review | Delete malicious services |
| **WMI Events** | WMI Repository | WMI event query | Remove event subscriptions |
| **Startup Folders** | %AppData%\Microsoft\Windows\Start Menu\Startup | File monitoring | Delete malicious files |
| **DLL Hijacking** | Application directories | DLL analysis | Replace legitimate DLLs |
| **Browser Extensions** | Browser profiles | Extension audit | Remove malicious extensions |
| **SSH Keys** | ~/.ssh/authorized_keys | Key comparison | Remove unauthorized keys |
| **Cron Jobs** | /etc/cron.* | Cron audit | Remove malicious jobs |
| **Systemd Services** | /etc/systemd/system | Service audit | Remove malicious services |

## Recovery: Restoring Normal Operations

### Recovery Planning Framework

```python
class RecoveryPlanner:
    def __init__(self):
        self.recovery_priorities = {
            'critical': 1,  # Business cannot function
            'high': 2,      # Significant business impact
            'medium': 3,    # Moderate business impact
            'low': 4        # Minimal business impact
        }
    
    def create_recovery_plan(self, affected_systems, incident_scope):
        """Create prioritized recovery plan."""
        plan = {
            'phases': [],
            'dependencies': {},
            'timeline': {},
            'verification_steps': []
        }
        
        # Categorize systems by criticality
        systems_by_priority = self.categorize_by_priority(affected_systems)
        
        # Phase 1: Critical Infrastructure
        phase1 = {
            'name': 'Critical Systems Recovery',
            'systems': systems_by_priority['critical'],
            'estimated_duration': '4-8 hours',
            'prerequisites': [
                'threat_confirmed_eliminated',
                'forensic_evidence_preserved'
            ]
        }
        plan['phases'].append(phase1)
        
        # Phase 2: High Priority Systems
        phase2 = {
            'name': 'High Priority Systems Recovery',
            'systems': systems_by_priority['high'],
            'estimated_duration': '8-24 hours',
            'dependencies': ['phase_1_complete']
        }
        plan['phases'].append(phase2)
        
        # Phase 3: Remaining Systems
        phase3 = {
            'name': 'Full Environment Recovery',
            'systems': systems_by_priority['medium'] + systems_by_priority['low'],
            'estimated_duration': '24-72 hours',
            'dependencies': ['phase_2_complete']
        }
        plan['phases'].append(phase3)
        
        # Define verification steps
        plan['verification_steps'] = [
            'all_systems_online',
            'services_functioning',
            'security_controls_active',
            'monitoring_operational',
            'user_access_verified',
            'data_integrity_confirmed'
        ]
        
        return plan
    
    def execute_recovery(self, plan):
        """Execute recovery plan with monitoring."""
        results = []
        
        for phase in plan['phases']:
            phase_result = {
                'phase': phase['name'],
                'systems': [],
                'status': 'in_progress'
            }
            
            # Check prerequisites
            if not self.check_prerequisites(phase.get('prerequisites', [])):
                phase_result['status'] = 'blocked'
                phase_result['reason'] = 'prerequisites_not_met'
                results.append(phase_result)
                continue
            
            # Recover each system
            for system in phase['systems']:
                try:
                    recovery_result = self.recover_system(system)
                    phase_result['systems'].append({
                        'system': system,
                        'status': 'recovered',
                        'details': recovery_result
                    })
                except Exception as e:
                    phase_result['systems'].append({
                        'system': system,
                        'status': 'failed',
                        'error': str(e)
                    })
            
            # Determine phase status
            all_recovered = all(
                s['status'] == 'recovered' 
                for s in phase_result['systems']
            )
            phase_result['status'] = 'complete' if all_recovered else 'partial'
            
            results.append(phase_result)
            
            # Don't proceed if phase failed
            if not all_recovered and phase.get('block_on_failure', True):
                break
        
        return results
```

### System Recovery Approaches

| Recovery Method | When to Use | Advantages | Disadvantages |
|-----------------|-------------|------------|---------------|
| **Clean Rebuild** | Severe compromise, rootkit suspected | Complete confidence | Time consuming, data loss risk |
| **Restore from Backup** | Known good backup exists | Fast recovery | May lose recent data |
| **Malware Cleaning** | Limited infection, good backups | Preserves configuration | May miss advanced threats |
| **Failover to DR** | Active-active setup available | Minimal downtime | Requires DR infrastructure |
| **Rebuild from Gold Image** | Standard workstation/server | Standardized, fast | May need application reinstall |

### Data Recovery and Integrity Verification

```yaml
data_recovery_procedures:
  database_recovery:
    steps:
      - restore_from_last_clean_backup
      - apply_transaction_logs
      - verify_data_integrity
      - compare_row_counts
      - run_consistency_checks
      - validate_critical_queries
    
    integrity_checks:
      - checksum_verification
      - referential_integrity
      - audit_log_reconciliation
      - data_classification_verification
    
  file_server_recovery:
    steps:
      - scan_backup_for_malware
      - restore_files_to_clean_system
      - verify_file_integrity
      - restore_permissions
      - validate_access_controls
    
    integrity_checks:
      - file_hash_comparison
      - permission_validation
      - ownership_verification
      - shadow_copy_analysis
```

## Forensic Analysis and Evidence Preservation

### Digital Forensics Process

```python
class DigitalForensics:
    def __init__(self):
        self.tools = {
            'memory': 'volatility3',
            'disk': 'autopsy',
            'network': 'wireshark',
            'mobile': 'cellebrite',
            'cloud': 'aws_forensic_tools'
        }
    
    def acquire_evidence(self, system, evidence_type):
        """Acquire forensic evidence with chain of custody."""
        acquisition = {
            'timestamp': datetime.utcnow(),
            'investigator': get_current_investigator(),
            'system': system,
            'evidence_type': evidence_type
        }
        
        if evidence_type == 'memory':
            # Live memory acquisition
            memory_dump = self.acquire_memory(system)
            acquisition['hash_md5'] = hashlib.md5(memory_dump).hexdigest()
            acquisition['hash_sha256'] = hashlib.sha256(memory_dump).hexdigest()
            acquisition['size_bytes'] = len(memory_dump)
            
        elif evidence_type == 'disk':
            # Disk imaging
            disk_image = self.create_disk_image(system)
            acquisition['hash_md5'] = self.calculate_hash(disk_image, 'md5')
            acquisition['hash_sha256'] = self.calculate_hash(disk_image, 'sha256')
            acquisition['image_format'] = 'E01'
            
        # Store with chain of custody
        self.store_evidence(acquisition)
        
        return acquisition
    
    def analyze_memory_dump(self, memory_dump_path):
        """Analyze memory dump for forensic artifacts."""
        findings = {
            'processes': [],
            'network_connections': [],
            'loaded_dlls': [],
            'registry_hives': [],
            'malware_indicators': []
        }
        
        # Extract running processes
        vol = volatility3.framework.contexts.Context()
        # ... Volatility analysis code ...
        
        return findings
    
    def timeline_analysis(self, evidence_sources, start_time, end_time):
        """Create comprehensive timeline of events."""
        timeline = []
        
        for source in evidence_sources:
            events = self.extract_events(source, start_time, end_time)
            
            for event in events:
                timeline.append({
                    'timestamp': event['timestamp'],
                    'source': source,
                    'event_type': event['type'],
                    'description': event['description'],
                    'evidence': event['raw_data']
                })
        
        # Sort chronologically
        timeline.sort(key=lambda x: x['timestamp'])
        
        return timeline
```

### Chain of Custody Documentation

```yaml
chain_of_custody:
  evidence_id: "IR-2025-001-HDD-001"
  description: "Workstation hard drive from compromised system"
  collected_by: "Jane Smith, Forensic Analyst"
  collection_date: "2025-04-10T14:30:00Z"
  collection_location: "123 Main St, Office 302"
  
  custody_log:
    - date: "2025-04-10T14:30:00Z"
      action: "collected"
      from: "workstation-ws-1234"
      by: "Jane Smith"
      to: "evidence_storage"
      signature: "JS-20250410"
      
    - date: "2025-04-10T16:00:00Z"
      action: "transferred"
      from: "evidence_storage"
      by: "Jane Smith"
      to: "forensic_lab"
      signature: "JS-20250410"
      
    - date: "2025-04-11T09:00:00Z"
      action: "analyzed"
      from: "forensic_lab"
      by: "Mike Johnson"
      signature: "MJ-20250411"
      notes: "Imaged drive, hash verified"
  
  storage_conditions:
    location: "secure_evidence_locker"
    temperature: "controlled"
    access_control: "dual_authorization"
    monitoring: "24x7_video"
```

## Post-Incident Activities

### Lessons Learned Process

```python
class LessonsLearned:
    def __init__(self):
        self.evaluation_areas = [
            'detection',
            'response_time',
            'containment',
            'communication',
            'tools_effectiveness',
            'team_coordination',
            'documentation',
            'recovery'
        ]
    
    def conduct_review(self, incident):
        """Conduct comprehensive lessons learned review."""
        review = {
            'incident_id': incident['id'],
            'review_date': datetime.utcnow(),
            'participants': [],
            'timeline': incident['timeline'],
            'evaluations': {},
            'findings': [],
            'action_items': []
        }
        
        # Gather participants
        review['participants'] = self.identify_participants(incident)
        
        # Evaluate each area
        for area in self.evaluation_areas:
            review['evaluations'][area] = self.evaluate_area(
                incident,
                area
            )
        
        # Identify strengths and weaknesses
        review['findings'] = self.analyze_findings(review['evaluations'])
        
        # Generate action items
        review['action_items'] = self.generate_action_items(
            review['findings']
        )
        
        return review
    
    def evaluate_detection(self, incident):
        """Evaluate detection effectiveness."""
        metrics = {
            'mean_time_to_detect': self.calculate_mttd(incident),
            'detection_source': incident['detection_source'],
            'false_negatives': self.identify_missed_detections(incident),
            'alert_quality': self.assess_alert_quality(incident)
        }
        
        # Compare against benchmarks
        benchmark_mttd = timedelta(hours=24)  # Industry average
        
        if metrics['mean_time_to_detect'] < benchmark_mttd:
            assessment = 'above_average'
        elif metrics['mean_time_to_detect'] < benchmark_mttd * 2:
            assessment = 'average'
        else:
            assessment = 'below_average'
        
        return {
            'metrics': metrics,
            'assessment': assessment,
            'recommendations': self.generate_recommendations(metrics)
        }
```

### After-Action Report Template

```markdown
# After-Action Report
## Incident: [INCIDENT_ID]

### Executive Summary
- **Incident Type:** [Type]
- **Date/Time:** [Start] - [End]
- **Severity:** [P1/P2/P3/P4]
- **Impact:** [Business impact summary]
- **Root Cause:** [Brief description]

### Timeline
| Time | Event | Action Taken |
|------|-------|--------------|
| T+0 | Detection | Alert triggered |
| T+15 | Triage | Confirmed incident |
| T+45 | Containment | Systems isolated |
| ... | ... | ... |

### Response Effectiveness

#### Strengths
1. [What went well]
2. [Effective actions]

#### Areas for Improvement
1. [What could be better]
2. [Gaps identified]

### Metrics
- Mean Time to Detect (MTTD): [X hours]
- Mean Time to Respond (MTTR): [X hours]
- Mean Time to Contain (MTTC): [X hours]
- Systems Affected: [X]
- Data Impacted: [X GB/records]

### Root Cause Analysis
[Detailed RCA using 5 Whys or similar methodology]

### Action Items
| ID | Action | Owner | Due Date | Priority |
|----|--------|-------|----------|----------|
| 1 | [Action description] | [Name] | [Date] | [P1/P2] |

### Lessons Learned
[Key insights from the incident]

### Appendix
- Detailed timeline
- IOCs
- Evidence references
- Communications log
```

## Continuous Improvement Framework

### Metrics and KPIs

```yaml
ir_metrics:
  effectiveness_metrics:
    mean_time_to_detect:
      definition: "Time from initial compromise to detection"
      target: < 24 hours
      measurement: "(detection_time - compromise_time)"
      
    mean_time_to_respond:
      definition: "Time from detection to initial response"
      target: < 1 hour
      measurement: "(response_time - detection_time)"
      
    mean_time_to_contain:
      definition: "Time from response to containment"
      target: < 4 hours
      measurement: "(containment_time - response_time)"
      
    containment_success_rate:
      definition: "Percentage of incidents contained within SLA"
      target: > 95%
      measurement: "contained_on_time / total_incidents"
  
  quality_metrics:
    false_positive_rate:
      definition: "Percentage of alerts that are false positives"
      target: < 10%
      measurement: "false_positives / total_alerts"
      
    escalation_accuracy:
      definition: "Percentage of correctly prioritized incidents"
      target: > 90%
      measurement: "correct_priorities / total_incidents"
      
    playbook_adherence:
      definition: "Percentage of incidents following playbook"
      target: > 95%
      measurement: "playbook_followed / total_incidents"
  
  operational_metrics:
    exercises_conducted:
      definition: "Number of IR exercises per quarter"
      target: >= 2
      
    training_completion:
      definition: "Percentage of IR team completing training"
      target: 100%
      
    tool_uptime:
      definition: "Availability of IR tools"
      target: > 99.9%
```

### Improvement Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    Continuous Improvement Cycle                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────┐     ┌─────────────────┐                  │
│   │     PLAN        │────►│      DO         │                  │
│   │                 │     │                 │                  │
│   │ - Update        │     │ - Implement     │                  │
│   │   playbooks     │     │   changes       │                  │
│   │ - Schedule      │     │ - Conduct       │                  │
│   │   training      │     │   exercises     │                  │
│   │ - Acquire tools │     │ - Respond to    │                  │
│   │                 │     │   incidents     │                  │
│   └─────────────────┘     └────────┬────────┘                  │
│                                    │                            │
│   ┌─────────────────┐              │                            │
│   │     ACT         │◄─────────────┘                            │
│   │                 │                                           │
│   │ - Implement     │     ┌─────────────────┐                  │
│   │   improvements  │◄────│     CHECK       │                  │
│   │ - Update        │     │                 │                  │
│   │   procedures    │     │ - Analyze       │                  │
│   │ - Communicate   │     │   metrics       │                  │
│   │   changes       │     │ - Review        │                  │
│   │                 │     │   incidents     │                  │
│   └─────────────────┘     │ - Assess        │                  │
│                           │   exercises     │                  │
│                           └─────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Special Incident Types

### Ransomware Response

```yaml
ransomware_response:
  immediate_actions:
    - do_not_pay_ransom_immediately
    - isolate_affected_systems
    - preserve_forensic_evidence
    - document_ransom_note
    - identify_ransomware_variant
    
  assessment:
    - determine_encryption_scope
    - identify_backup_availability
    - assess_data_criticality
    - evaluate_recovery_options
    - consult_legal_and_insurance
    
  recovery_options:
    clean_restore:
      description: "Restore from clean backups"
      considerations:
        - backup_integrity_verification
        - clean_system_build
        - data_validation
      
    decryption_tools:
      description: "Use available decryptors"
      sources:
        - id_ransomware
        - nomoreransom
        - security_vendors
      
    ransom_payment:
      description: "Pay ransom as last resort"
      considerations:
        - legal_implications
        - no_guarantee_of_recovery
        - funds_traceability
        - future_targeting_risk
```

### Data Breach Response

```yaml
data_breach_response:
  discovery_phase:
    - confirm_unauthorized_access
    - identify_affected_data
    - determine_access_duration
    - assess_exfiltration_volume
    
  notification_requirements:
    regulatory:
      gdpr:
        timeline: "72 hours to supervisory authority"
        recipients: "affected individuals if high risk"
        
      hipaa:
        timeline: "60 days to individuals"
        recipients: "HHS, affected individuals, media if >500"
        
      state_laws:
        timeline: "varies by state (usually 30-60 days)"
        recipients: "attorney general, affected residents"
    
    customer_notification:
      content:
        - incident_description
        - data_types_involved
        - steps_being_taken
        - protective_measures_for_individuals
        - contact_information
        
  remediation:
    - secure_vulnerability
    - enhance_monitoring
    - provide_identity_protection
    - review_and_update_policies
```

## Conclusion

Completing the incident response lifecycle through effective eradication, recovery, and post-incident activities transforms security incidents from disasters into learning opportunities. Organizations that master these phases emerge stronger, more resilient, and better prepared for future threats.

**Key Takeaways:**

1. **Thorough eradication** prevents recurrence
2. **Careful recovery** balances speed with security
3. **Evidence preservation** enables future prosecution
4. **Post-incident analysis** drives improvement
5. **Continuous refinement** builds organizational resilience

Remember: The goal isn't just to survive incidents, but to use them as catalysts for building a more robust security program.

---

*Last updated: April 2025*
*Tags: Incident Response, Eradication, Recovery, Forensics, Lessons Learned, Post-Incident*
