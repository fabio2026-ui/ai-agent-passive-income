# Incident Response Playbook: Preparation, Detection, and Initial Response

## Introduction

When a security incident occurs, every second counts. Organizations with well-defined incident response (IR) plans detect breaches faster, contain damage more effectively, and recover with minimal business impact. According to IBM's Cost of a Data Breach Report 2024, organizations with incident response teams and tested plans saved an average of $2.66 million compared to those without.

This comprehensive playbook provides actionable guidance for the first three phases of incident response: Preparation, Detection & Analysis, and Containment. Whether you're building your first IR program or refining existing processes, this guide will help you establish effective incident response capabilities.

## Table of Contents

1. Understanding Incident Response Frameworks
2. Building Your IR Team and Capabilities
3. Preparation: Tools, Playbooks, and Documentation
4. Detection: Monitoring and Alerting Strategies
5. Analysis: Triage and Investigation
6. Containment: Short-term and Long-term Strategies

## Understanding Incident Response Frameworks

### NIST SP 800-61 Revision 2

The National Institute of Standards and Technology provides the most widely adopted incident response framework:

```
┌─────────────────────────────────────────────────────────────────┐
│                    NIST Incident Response Lifecycle              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐                                              │
│   │ Preparation  │◄──────────────────────────────────────┐      │
│   └──────┬───────┘                                      │      │
│          │                                              │      │
│          ▼                                              │      │
│   ┌──────────────┐     ┌──────────────┐                │      │
│   │ Detection &  │────►│ Containment, │                │      │
│   │  Analysis    │     │ Eradication, │                │      │
│   └──────────────┘     │ & Recovery   │                │      │
│                        └──────┬───────┘                │      │
│                               │                        │      │
│                               ▼                        │      │
│                        ┌──────────────┐                │      │
│                        │ Post-Incident│────────────────┘      │
│                        │  Activity    │  (Lessons Learned)     │
│                        └──────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Incident Severity Classification

| Severity | Definition | Response Time | Examples |
|----------|------------|---------------|----------|
| **P1 - Critical** | Active breach, data exfiltration | 15 minutes | Ransomware deployment, active APT |
| **P2 - High** | Confirmed compromise, no active exfiltration | 1 hour | Malware infection, credential theft |
| **P3 - Medium** | Suspicious activity, potential incident | 4 hours | Failed intrusion attempts, policy violations |
| **P4 - Low** | Minor security event | 24 hours | Port scans, spam emails |

### Incident Categories

```yaml
incident_categories:
  malware:
    subtypes:
      - ransomware
      - trojan
      - virus
      - worm
      - cryptominer
    
  unauthorized_access:
    subtypes:
      - account_compromise
      - privilege_escalation
      - lateral_movement
      - data_exfiltration
    
  availability:
    subtypes:
      - ddos_attack
      - service_outage
      - resource_exhaustion
      - ransomware_encryption
    
  data_breach:
    subtypes:
      - pii_exposure
      - intellectual_property_theft
      - database_dump
      - misconfigured_storage
    
  insider_threat:
    subtypes:
      - malicious_employee
      - negligence
      - credential_sharing
      - data_theft
    
  supply_chain:
    subtypes:
      - compromised_software
      - third_party_breach
      - dependency_poisoning
```

## Building Your IR Team and Capabilities

### Incident Response Team Structure

```yaml
ir_team_structure:
  core_team:
    incident_commander:
      role: "Overall incident management and decision making"
      prerequisites:
        - executive_authority
        - technical_understanding
        - crisis_management_training
      
    technical_lead:
      role: "Technical investigation and containment"
      skills:
        - forensic_analysis
        - malware_analysis
        - network_analysis
        - log_analysis
      
    communications_lead:
      role: "Internal and external communications"
      responsibilities:
        - executive_briefings
        - regulatory_notifications
        - customer_communications
        - media_statements
      
    legal_counsel:
      role: "Legal and compliance guidance"
      responsibilities:
        - regulatory_requirements
        - breach_notification_laws
        - litigation_hold
        - law_enforcement_coordination
  
  extended_team:
    - system_administrators
    - network_engineers
    - application_owners
    - database_administrators
    - security_analysts
    - hr_representative
    - public_relations
  
  external_resources:
    - ir_retainer_firm
    - forensic_specialists
    - legal_counsel
    - cyber_insurance_carrier
    - law_enforcement_contacts
```

### Skills Matrix

| Role | Required Skills | Proficiency Level |
|------|-----------------|-------------------|
| **Incident Commander** | Crisis management, decision making, communication | Expert |
| **Technical Lead** | Forensics, malware analysis, threat hunting | Expert |
| **SOC Analyst** | Log analysis, SIEM, alert triage | Intermediate |
| **System Admin** | System internals, backup/recovery | Intermediate |
| **Network Engineer** | Packet analysis, network forensics | Intermediate |
| **Communications** | Crisis communications, PR | Expert |

### Training and Exercises

```python
# Incident Response Exercise Framework
class IRExercise:
    def __init__(self):
        self.exercise_types = [
            'tabletop',
            'functional',
            'full_scale'
        ]
    
    def plan_tabletop_exercise(self, scenario):
        """Plan a tabletop exercise."""
        return {
            'duration': '2-4 hours',
            'participants': ['incident_commander', 'technical_lead', 'communications'],
            'scenario': scenario,
            'injects': self.generate_injects(scenario),
            'evaluation_criteria': [
                'decision_making_speed',
                'communication_effectiveness',
                'technical_accuracy',
                'process_adherence'
            ]
        }
    
    def plan_functional_exercise(self, scenario):
        """Plan a functional exercise with actual tool usage."""
        return {
            'duration': '4-8 hours',
            'participants': 'full_ir_team',
            'scenario': scenario,
            'technical_components': [
                'live_forensics',
                'containment_actions',
                'communication_drills'
            ],
            'evaluation_criteria': [
                'detection_time',
                'containment_time',
                'tool_proficiency',
                'coordination'
            ]
        }
    
    def evaluate_exercise(self, observations, metrics):
        """Evaluate exercise performance."""
        evaluation = {
            'strengths': [],
            'improvement_areas': [],
            'action_items': []
        }
        
        # Evaluate detection time
        if metrics['detection_time_minutes'] > 60:
            evaluation['improvement_areas'].append(
                'Detection time exceeds target'
            )
            evaluation['action_items'].append(
                'Review and tune detection rules'
            )
        else:
            evaluation['strengths'].append('Detection within SLA')
        
        # Evaluate containment
        if metrics['containment_time_minutes'] > 120:
            evaluation['improvement_areas'].append(
                'Containment time exceeds target'
            )
        
        return evaluation
```

## Preparation: Tools, Playbooks, and Documentation

### Essential Tools Inventory

| Category | Tool | Purpose | Alternative |
|----------|------|---------|-------------|
| **Endpoint Forensics** | Velociraptor | Artifact collection | GRR, KAPE |
| **Memory Forensics** | Volatility | RAM analysis | Rekall |
| **Network Analysis** | Wireshark | Packet capture | tcpdump |
| **Log Analysis** | Splunk/ELK | SIEM and correlation | Graylog |
| **Malware Analysis** | Cuckoo Sandbox | Dynamic analysis | Any.Run |
| **Threat Intel** | MISP | IOC management | OpenCTI |
| **Case Management** | TheHive | Incident tracking | RTIR |
| **Communication** | Slack/Teams | Team coordination | Mattermost |

### IR Jump Bag Contents

```yaml
ir_jump_bag:
  hardware:
    - laptop_dedicated_to_forensics:
        os: linux_live_cd
        tools_preinstalled: true
        write_blocked: true
    
    - external_storage:
        encrypted_ssd: 2tb
        write_blockers: usb_and_sata
    
    - network_tools:
        network_tap: 1gbps
        ethernet_cables: various_lengths
        usb_ethernet_adapters
    
    - mobile_hotspot:
        provider: different_from_corporate
        purpose: out_of_band_communication
  
  software:
    - bootable_usb:
        - paladin_forensic_suite
        - kali_linux
        - helix_iii
    
    - portable_tools:
        - sysinternals_suite
        - forensic_utilities
        - network_scanners
    
    - documentation:
      - ir_playbooks_printed
      - contact_lists
      - network_diagrams
      - system_documentation
  
  credentials:
    - sealed_envelope:
        description: "break_glass_credentials"
        location: ciso_safe
        update_frequency: quarterly
```

### Pre-Authorized Actions

```yaml
pre_authorized_actions:
  containment:
    - isolate_infected_system
    - disable_compromised_account
    - revoke_active_sessions
    - block_ip_address
    - disable_vpn_access
    - force_password_reset
    
  evidence_preservation:
    - capture_memory_dump
    - create_disk_image
    - export_system_logs
    - preserve_network_traffic
    - snapshot_cloud_resources
    
  notification:
    - activate_ir_team
    - notify_executive_team
    - contact_legal_counsel
    - alert_compliance_team
    
  communication:
    - post_internal_status_update
    - notify_affected_customers
    - contact_law_enforcement
    - engage_pr_team
  
  approval_required:
    - take_systems_offline
    - pay_ransom
    - contact_media
    - notify_regulators
    - engage_external_forensics
```

## Detection: Monitoring and Alerting Strategies

### Detection Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Detection Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Data Sources                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Endpoint │ │ Network  │ │  Cloud   │ │Identity  │           │
│  │   EDR    │ │   NDR    │ │  Logs    │ │  Logs    │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                  │
│       └────────────┴────────────┴────────────┘                  │
│                    │                                             │
│                    ▼                                             │
│         ┌─────────────────┐                                     │
│         │   Data Lake /   │                                     │
│         │      SIEM       │                                     │
│         └────────┬────────┘                                     │
│                  │                                               │
│       ┌──────────┼──────────┐                                   │
│       │          │          │                                   │
│       ▼          ▼          ▼                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                          │
│  │   UEBA  │ │  Threat │ │   SOAR  │                          │
│  │         │ │Intel    │ │         │                          │
│  └────┬────┘ └────┬────┘ └────┬────┘                          │
│       │           │           │                                 │
│       └───────────┴───────────┘                                 │
│                   │                                             │
│                   ▼                                             │
│          ┌─────────────────┐                                   │
│          │  Alert Triage   │                                   │
│          │    & Response   │                                   │
│          └─────────────────┘                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Detection Rules and Use Cases

```yaml
detection_use_cases:
  initial_access:
    - name: phishing_email_with_attachment
      data_source: email_gateway
      detection_logic: |
        email.attachment.exists AND
        (email.sender.domain != corporate_domain OR
         email.header.suspicious)
      severity: medium
      
    - name: vulnerable_web_exploitation
      data_source: waf_logs
      detection_logic: |
        waf.blocked AND
        waf.rule_category in (sqli, xss, rce, lfi)
      severity: high
      
    - name: external_remote_access_tool
      data_source: endpoint_process
      detection_logic: |
        process.name in (anydesk, teamviewer, chrome_remote_desktop) AND
        network.connection.external == true
      severity: high
  
  persistence:
    - name: new_local_admin_account
      data_source: windows_security_log
      detection_logic: |
        event_id == 4720 AND
        user.group == "Administrators"
      severity: high
      
    - name: scheduled_task_creation
      data_source: windows_security_log
      detection_logic: |
        event_id == 4698 AND
        task.command contains suspicious_paths
      severity: medium
      
    - name: service_creation
      data_source: windows_system_log
      detection_logic: |
        event_id == 7045 AND
        service.binary_path contains suspicious_patterns
      severity: medium
  
  lateral_movement:
    - name: psexec_usage
      data_source: windows_security_log
      detection_logic: |
        event_id == 4688 AND
        process.command_line contains "psexec"
      severity: high
      
    - name: smb_executable_transfer
      data_source: network_traffic
      detection_logic: |
        protocol == smb AND
        file.extension in (exe, dll, ps1, bat)
      severity: high
      
    - name: kerberoasting
      data_source: windows_security_log
      detection_logic: |
        event_id == 4769 AND
        ticket_encryption_type == 0x17 AND
        ticket_options == 0x40810010
      severity: high
  
  exfiltration:
    - name: large_data_transfer
      data_source: network_traffic
      detection_logic: |
        bytes_out > threshold AND
        destination not in corporate_networks
      severity: medium
      
    - name: unusual_cloud_storage_access
      data_source: cloud_audit_logs
      detection_logic: |
        storage.bulk_download AND
        source_ip not in corporate_ranges
      severity: high
```

### Alert Triage Matrix

| Alert | Initial Triage | Escalation Criteria |
|-------|---------------|---------------------|
| Failed login spike | Check if legitimate user, check source IP | > 10 failures from single IP |
| Malware detection | Isolate endpoint, check hash reputation | Confirmed malware |
| Data exfiltration | Verify data classification, check destination | > 1GB or classified data |
| Privilege escalation | Check if authorized admin activity | Unauthorized elevation |
| Lateral movement | Identify source system, check for compromise | Confirmed movement |
| Ransomware indicators | Isolate immediately, check file extensions | File encryption confirmed |

## Analysis: Triage and Investigation

### Investigation Framework

```python
class IncidentInvestigation:
    def __init__(self, alert):
        self.alert = alert
        self.timeline = []
        self.evidence = []
        self.indicators = {
            'ip_addresses': set(),
            'domains': set(),
            'file_hashes': set(),
            'user_accounts': set()
        }
    
    def initial_triage(self):
        """Perform initial triage of alert."""
        triage_result = {
            'severity': None,
            'confirmed': False,
            'scope': None,
            'priority': None
        }
        
        # Gather initial context
        context = self.gather_context()
        
        # Check for false positives
        if self.is_false_positive(context):
            triage_result['confirmed'] = False
            triage_result['resolution'] = 'false_positive'
            return triage_result
        
        # Determine severity based on impact
        if context['sensitive_data_involved']:
            triage_result['severity'] = 'critical'
        elif context['production_systems_affected']:
            triage_result['severity'] = 'high'
        else:
            triage_result['severity'] = 'medium'
        
        # Determine scope
        affected_systems = self.identify_affected_systems()
        triage_result['scope'] = len(affected_systems)
        
        triage_result['confirmed'] = True
        return triage_result
    
    def build_timeline(self):
        """Build timeline of attacker activity."""
        # Query all relevant logs
        logs = self.query_logs(
            start_time=self.alert['timestamp'] - timedelta(hours=24),
            end_time=datetime.utcnow(),
            systems=self.affected_systems
        )
        
        timeline = []
        for log in sorted(logs, key=lambda x: x['timestamp']):
            event = {
                'timestamp': log['timestamp'],
                'system': log['source'],
                'event_type': self.classify_event(log),
                'description': log['message'],
                'raw_log': log
            }
            timeline.append(event)
        
        return timeline
    
    def identify_indicators(self):
        """Extract IOCs from investigation."""
        iocs = {
            'file_hashes': [],
            'ip_addresses': [],
            'domains': [],
            'user_agents': [],
            'registry_keys': [],
            'file_paths': []
        }
        
        for event in self.timeline:
            if 'file_hash' in event:
                iocs['file_hashes'].append(event['file_hash'])
            if 'ip_address' in event:
                iocs['ip_addresses'].append(event['ip_address'])
            if 'domain' in event:
                iocs['domains'].append(event['domain'])
        
        return iocs
```

### Evidence Collection Checklist

```yaml
evidence_collection:
  endpoints:
    volatile_data:
      - memory_dump
      - running_processes
      - network_connections
      - logged_on_users
      - open_files
      
    system_data:
      - full_disk_image
      - system_logs
      - application_logs
      - registry_hives
      - browser_history
      - recent_files
      
    malware_samples:
      - suspicious_executables
      - scripts
      - documents
      - email_attachments
      
  network:
    traffic_captures:
      - packet_captures_affected_segments
      - netflow_data
      - firewall_logs
      - proxy_logs
      - dns_logs
      
  cloud:
    aws:
      - cloudtrail_logs
      - vpc_flow_logs
      - s3_access_logs
      - iam_logs
      
    azure:
      - activity_logs
      - diagnostic_logs
      - signin_logs
      
    gcp:
      - audit_logs
      - cloud_dns_logs
      - vpc_flow_logs
  
  preservation:
    - hash_all_evidence
    - chain_of_custody_form
    - secure_storage
    - access_logging
```

## Containment: Short-term and Long-term Strategies

### Containment Decision Matrix

| Scenario | Short-term Containment | Long-term Containment |
|----------|------------------------|----------------------|
| Single infected workstation | Network isolation | Reimage, restore data |
| Compromised server | Isolate, snapshot | Forensic analysis, rebuild |
| Ransomware (limited) | Disconnect shares | Isolate network segment |
| Ransomware (widespread) | Emergency network shutdown | Full recovery from backups |
| Active data exfiltration | Block external comms | Identify and secure data |
| Lateral movement detected | Disable compromised accounts | Full credential reset |

### Containment Automation

```python
class ContainmentOrchestrator:
    def __init__(self):
        self.actions = {
            'isolate_endpoint': self.isolate_endpoint,
            'disable_account': self.disable_account,
            'block_ip': self.block_ip,
            'revoke_sessions': self.revoke_sessions,
            'disable_vpn': self.disable_vpn,
            'quarantine_email': self.quarantine_email
        }
    
    def execute_containment(self, incident, actions):
        """Execute containment actions with approval."""
        results = []
        
        for action in actions:
            # Log intended action
            self.log_action(incident, action, 'pending')
            
            # Get approval if required
            if action['requires_approval']:
                approval = self.get_approval(incident, action)
                if not approval:
                    results.append({
                        'action': action['type'],
                        'status': 'denied',
                        'reason': 'approval_required'
                    })
                    continue
            
            # Execute action
            try:
                handler = self.actions[action['type']]
                result = handler(**action['parameters'])
                
                results.append({
                    'action': action['type'],
                    'status': 'success',
                    'result': result
                })
                
                self.log_action(incident, action, 'completed')
                
            except Exception as e:
                results.append({
                    'action': action['type'],
                    'status': 'failed',
                    'error': str(e)
                })
                
                self.log_action(incident, action, 'failed')
        
        return results
    
    def isolate_endpoint(self, hostname, isolation_type='network'):
        """Isolate compromised endpoint."""
        if isolation_type == 'network':
            # Disable network at switch level
            self.network_controller.isolate_port(hostname)
            
        elif isolation_type == 'agent':
            # Use EDR agent to isolate
            self.edr_client.isolate_host(hostname)
        
        return {'hostname': hostname, 'isolation': 'complete'}
    
    def disable_account(self, username, disable_type='all'):
        """Disable compromised user account."""
        actions = []
        
        # Disable AD account
        self.active_directory.disable_user(username)
        actions.append('ad_account_disabled')
        
        # Revoke cloud sessions
        if disable_type in ['all', 'cloud']:
            self.azure_ad.revoke_sessions(username)
            self.okta.revoke_sessions(username)
            actions.append('cloud_sessions_revoked')
        
        # Disable VPN access
        if disable_type in ['all', 'vpn']:
            self.vpn.disable_user(username)
            actions.append('vpn_access_disabled')
        
        return {'username': username, 'actions': actions}
```

### Communication Templates

```yaml
internal_communications:
  executive_briefing:
    frequency: every_4_hours_during_active_incident
    content:
      - incident_summary
      - current_status
      - business_impact
      - containment_actions
      - next_update_time
    
  all_hands_notification:
    trigger: significant_incident
    content:
      - incident_awareness
      - security_reminders
      - reporting_instructions
      - contact_information
    
  technical_team_update:
    frequency: hourly_during_active_incident
    content:
      - technical_details
      - ioc_updates
      - containment_status
      - investigation_progress
      - action_items
  
external_communications:
  customer_notification:
    trigger: confirmed_data_exposure
    timeline: within_72_hours
    content:
      - incident_description
      - affected_data
      - steps_taken
      - customer_actions
      - contact_information
    
  regulatory_notification:
    trigger: breach_threshold_met
    timeline: per_regulatory_requirements
    recipients:
      - gdpa_authority
      - state_attorneys_general
      - industry_regulators
    
  law_enagement:
    trigger: criminal_activity_suspected
    contact: fbi_cyber_division
```

## Conclusion

Effective incident response begins with thorough preparation. By building a capable team, establishing clear processes, implementing robust detection capabilities, and preparing containment strategies, organizations can dramatically reduce the impact of security incidents.

**Key Takeaways:**

1. **Preparation is everything** - The time to prepare is before an incident occurs
2. **Detection determines response time** - Better detection leads to faster response
3. **Containment limits damage** - Quick, decisive containment prevents escalation
4. **Communication is critical** - Keep stakeholders informed throughout
5. **Continuous improvement** - Every incident is a learning opportunity

In Part 2, we'll cover Eradication, Recovery, and Post-Incident Activities to complete the incident response lifecycle.

---

*Last updated: April 2025*
*Tags: Incident Response, IR, Security Operations, SOC, Detection, Containment*
