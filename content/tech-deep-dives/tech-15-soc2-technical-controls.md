# SOC2 Security Controls: Technical Implementation Deep Dive

**Difficulty:** Advanced  
**Keywords:** SOC2 controls, access management, encryption, monitoring, technical security  
**Estimated Reading Time:** 16-20 minutes

---

## Table of Contents

1. [Introduction](#introduction)
2. [Identity and Access Management](#identity-and-access-management)
3. [Encryption and Key Management](#encryption-and-key-management)
4. [Logging and Monitoring](#logging-and-monitoring)
5. [Network Security](#network-security)
6. [Vulnerability Management](#vulnerability-management)
7. [Change Management](#change-management)
8. [Incident Response](#incident-response)

---

## Introduction

### Overview

SOC2 compliance requires implementing technical controls that demonstrate your organization's commitment to security. While policies and procedures provide the framework, technical controls provide the actual protection for systems and data.

This deep dive explores the technical implementation of key SOC2 security controls, providing concrete examples and configuration guidance. These controls address the Common Criteria (CC) requirements that form the foundation of SOC2 compliance.

### Key Points

- Technical controls must align with documented policies
- Automation reduces human error and improves consistency
- Evidence of control operation is required for audits
- Controls should be layered for defense in depth

## Identity and Access Management

### Overview

Identity and Access Management (IAM) is the cornerstone of SOC2 compliance. Controls must ensure that only authorized users can access systems, that access is appropriate for their role, and that access is promptly removed when no longer needed.

Modern IAM implementations use centralized identity providers, enforce multi-factor authentication, and implement just-in-time access for privileged operations. Automated provisioning and deprovisioning ensure consistency and reduce manual errors.

### Code Example

```yaml
# Terraform: IAM Infrastructure for SOC2
# Main Identity Provider Configuration

# Okta Configuration
resource "okta_group" "engineering" {
  name        = "Engineering"
  description = "Engineering team members"
}

resource "okta_group" "production_access" {
  name        = "Production-Access"
  description = "Members with production system access"
}

resource "okta_group_rule" "production_access_rule" {
  name              = "Production Access Assignment"
  status            = "ACTIVE"
  group_assignments = [okta_group.production_access.id]
  expression_type   = "urn:okta:expression:1.0"
  expression_value  = "user.department == \"Engineering\" and user.profile.jobLevel >= 3"
}

# MFA Policy
resource "okta_policy_mfa" "soc2_mfa_policy" {
  name            = "SOC2 MFA Policy"
  status          = "ACTIVE"
  description     = "MFA policy for SOC2 compliance"
  priority        = 1
  
  okta_otp = {
    enroll = "REQUIRED"
  }
  
  google_otp = {
    enroll = "OPTIONAL"
  }
  
  fido_webauthn = {
    enroll = "OPTIONAL"
  }
}

# AWS IAM Configuration
resource "aws_iam_account_password_policy" "soc2_policy" {
  minimum_password_length        = 14
  require_lowercase_characters   = true
  require_numbers                = true
  require_uppercase_characters   = true
  require_symbols                = true
  allow_users_to_change_password = true
  max_password_age               = 90
  password_reuse_prevention      = 12
  hard_expiry                    = false
}

# IAM Roles with Least Privilege
resource "aws_iam_role" "developer_role" {
  name = "DeveloperRole"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_saml_provider.okta.arn
        }
        Condition = {
          StringEquals = {
            "SAML:aud" = "https://signin.aws.amazon.com/saml"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "developer_policy" {
  name = "DeveloperPolicy"
  role = aws_iam_role.developer_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowReadOnly"
        Effect = "Allow"
        Action = [
          "ec2:Describe*",
          "rds:Describe*",
          "s3:Get*",
          "s3:List*",
          "cloudwatch:Get*",
          "cloudwatch:List*"
        ]
        Resource = "*"
      },
      {
        Sid    = "DenyProduction"
        Effect = "Deny"
        Action = "*"
        Resource = "*"
        Condition = {
          StringEquals = {
            "ec2:ResourceTag/Environment" = "production"
          }
        }
      }
    ]
  })
}

# Just-in-Time Access Role
resource "aws_iam_role" "jit_admin_role" {
  name = "JITAdminRole"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Condition = {
          Bool = {
            "aws:MultiFactorAuthPresent" = "true"
          }
          IpAddress = {
            "aws:SourceIp" = ["10.0.0.0/8", "172.16.0.0/12"]
          }
        }
      }
    ]
  })
  
  max_session_duration = 3600  # 1 hour maximum
}

# Break-glass emergency access
resource "aws_iam_role" "break_glass_role" {
  name = "BreakGlassEmergencyRole"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Condition = {
          Bool = {
            "aws:MultiFactorAuthPresent" = "true"
          }
        }
      }
    ]
  })
  
  tags = {
    EmergencyAccess = "true"
    ApprovalRequired = "CISO"
  }
}
```

```python
# Access Review Automation Script
import boto3
from datetime import datetime, timedelta
import pandas as pd

def generate_access_review_report():
    """Generate quarterly access review report for SOC2"""
    
    iam = boto3.client('iam')
    report_data = []
    
    # Get all users
    users = iam.list_users()['Users']
    
    for user in users:
        user_name = user['UserName']
        user_arn = user['Arn']
        create_date = user['CreateDate']
        
        # Get user's groups
        groups = iam.list_groups_for_user(UserName=user_name)['Groups']
        group_names = [g['GroupName'] for g in groups]
        
        # Get user's attached policies
        attached_policies = iam.list_attached_user_policies(UserName=user_name)['AttachedPolicies']
        policy_names = [p['PolicyName'] for p in attached_policies]
        
        # Get user's inline policies
        inline_policies = iam.list_user_policies(UserName=user_name)['PolicyNames']
        
        # Get user's access keys
        access_keys = iam.list_access_keys(UserName=user_name)['AccessKeyMetadata']
        active_keys = [k for k in access_keys if k['Status'] == 'Active']
        
        # Check for old access keys (>90 days)
        old_keys = []
        for key in active_keys:
            key_age = (datetime.now(key['CreateDate'].tzinfo) - key['CreateDate']).days
            if key_age > 90:
                old_keys.append({
                    'AccessKeyId': key['AccessKeyId'],
                    'AgeDays': key_age
                })
        
        # Get last activity (requires CloudTrail)
        last_activity = get_last_activity(user_name)
        
        report_data.append({
            'UserName': user_name,
            'ARN': user_arn,
            'CreateDate': create_date.strftime('%Y-%m-%d'),
            'Groups': ', '.join(group_names),
            'AttachedPolicies': ', '.join(policy_names),
            'InlinePolicies': ', '.join(inline_policies),
            'ActiveAccessKeys': len(active_keys),
            'OldAccessKeys': len(old_keys),
            'LastActivity': last_activity,
            'ReviewStatus': 'Pending'
        })
    
    # Create DataFrame and save to CSV
    df = pd.DataFrame(report_data)
    output_file = f"access_review_{datetime.now().strftime('%Y-%m-%d')}.csv"
    df.to_csv(output_file, index=False)
    
    print(f"Access review report generated: {output_file}")
    print(f"Total users: {len(report_data)}")
    print(f"Users with old access keys: {sum(1 for r in report_data if r['OldAccessKeys'] > 0)}")
    
    return output_file

def get_last_activity(user_name):
    """Get last console login or API activity from CloudTrail"""
    cloudtrail = boto3.client('cloudtrail')
    
    # Look back 90 days
    start_time = datetime.now() - timedelta(days=90)
    
    try:
        response = cloudtrail.lookup_events(
            LookupAttributes=[
                {
                    'AttributeKey': 'Username',
                    'AttributeValue': user_name
                }
            ],
            StartTime=start_time,
            MaxResults=1
        )
        
        if response['Events']:
            return response['Events'][0]['EventTime'].strftime('%Y-%m-%d')
        else:
            return 'No activity in last 90 days'
    except Exception as e:
        return f'Error: {str(e)}'

def check_privileged_access():
    """Check for privileged access and MFA requirements"""
    iam = boto3.client('iam')
    
    # Define privileged actions
    privileged_actions = [
        'iam:*',
        'organizations:*',
        'account:*',
        'sts:AssumeRole',
        'sts:GetFederationToken'
    ]
    
    findings = []
    
    # Check all policies for privileged access
    paginator = iam.get_paginator('list_policies')
    for page in paginator.paginate(Scope='Local'):
        for policy in page['Policies']:
            policy_version = iam.get_policy_version(
                PolicyArn=policy['Arn'],
                VersionId=policy['DefaultVersionId']
            )
            
            document = policy_version['PolicyVersion']['Document']
            
            for statement in document.get('Statement', []):
                if statement.get('Effect') == 'Allow':
                    actions = statement.get('Action', [])
                    if isinstance(actions, str):
                        actions = [actions]
                    
                    for action in actions:
                        for privileged in privileged_actions:
                            if action == privileged or action.endswith(':*'):
                                findings.append({
                                    'PolicyName': policy['PolicyName'],
                                    'Action': action,
                                    'Privileged': True,
                                    'Recommendation': 'Ensure MFA is required for this policy'
                                })
    
    return findings

if __name__ == '__main__':
    generate_access_review_report()
```

### Key Points

- Centralize identity management with SSO
- Enforce MFA for all privileged access
- Implement just-in-time access for elevated permissions
- Automate quarterly access reviews

## Encryption and Key Management

### Overview

Encryption protects data confidentiality both at rest and in transit. SOC2 requires encryption for sensitive data, proper key management, and secure transmission protocols. The implementation must include key generation, storage, rotation, and destruction procedures.

Modern encryption implementations use hardware security modules (HSMs) or cloud-based key management services. Automated key rotation reduces the impact of key compromise while maintaining operational continuity.

### Code Example

```yaml
# Terraform: Encryption Configuration for SOC2

# AWS KMS Key for Data Encryption
resource "aws_kms_key" "main_encryption_key" {
  description             = "Main encryption key for SOC2 compliance"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  multi_region            = true
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow EC2 Service"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:GenerateDataKey*"
        ]
        Resource = "*"
      },
      {
        Sid    = "Allow CloudWatch Logs"
        Effect = "Allow"
        Principal = {
          Service = "logs.${data.aws_region.current.name}.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:GenerateDataKey*"
        ]
        Resource = "*"
        Condition = {
          ArnLike = {
            "kms:EncryptionContext:aws:logs:arn" = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:*"
          }
        }
      }
    ]
  })
  
  tags = {
    Purpose = "SOC2"
    Rotation = "Automatic"
  }
}

resource "aws_kms_alias" "main_key_alias" {
  name          = "alias/soc2-main-key"
  target_key_id = aws_kms_key.main_encryption_key.key_id
}

# RDS Encryption
resource "aws_db_instance" "encrypted_database" {
  identifier           = "soc2-production-db"
  engine              = "postgres"
  engine_version      = "15.4"
  instance_class      = "db.r6g.xlarge"
  allocated_storage   = 100
  storage_encrypted   = true
  kms_key_id         = aws_kms_key.main_encryption_key.arn
  
  # Additional security settings
  publicly_accessible = false
  deletion_protection = true
  
  # Backup configuration
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"
  
  # Logging
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  tags = {
    Encryption = "Enabled"
    Compliance = "SOC2"
  }
}

# S3 Bucket Encryption
resource "aws_s3_bucket" "encrypted_bucket" {
  bucket = "soc2-encrypted-data-bucket"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "bucket_encryption" {
  bucket = aws_s3_bucket.encrypted_bucket.id
  
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.main_encryption_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "bucket_public_block" {
  bucket = aws_s3_bucket.encrypted_bucket.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# EBS Volume Encryption
resource "aws_ebs_encryption_by_default" "default_encryption" {
  enabled = true
}

# Secrets Manager for Credentials
resource "aws_secretsmanager_secret" "database_credentials" {
  name                    = "soc2/production/database"
  description             = "Database credentials for production"
  kms_key_id             = aws_kms_key.main_encryption_key.arn
  recovery_window_in_days = 30
}

resource "aws_secretsmanager_secret_version" "database_credentials_value" {
  secret_id = aws_secretsmanager_secret.database_credentials.id
  secret_string = jsonencode({
    username = "db_admin"
    password = random_password.database_password.result
    host     = aws_db_instance.encrypted_database.address
    port     = 5432
    dbname   = "production"
  })
}

resource "random_password" "database_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}|:,?"
}

# TLS Certificate Management
resource "aws_acm_certificate" "main_certificate" {
  domain_name               = "api.example.com"
  subject_alternative_names = ["app.example.com", "admin.example.com"]
  validation_method         = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Environment = "Production"
  }
}

# CloudFront with TLS
resource "aws_cloudfront_distribution" "secure_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_All"
  
  aliases = ["api.example.com", "app.example.com"]
  
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALB"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
    
    custom_header {
      name  = "X-Origin-Verify"
      value = var.origin_verify_header
    }
  }
  
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB"
    
    forwarded_values {
      query_string = true
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]
      
      cookies {
        forward = "whitelist"
        whitelisted_names = ["session", "auth"]
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["US", "CA", "GB", "DE"]
    }
  }
  
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.main_certificate.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  
  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.encrypted_bucket.bucket_domain_name
    prefix          = "cloudfront-logs/"
  }
}
```

```python
# Key Rotation Automation
import boto3
from datetime import datetime, timedelta
import json

def rotate_access_keys():
    """Automatically rotate IAM access keys older than 90 days"""
    iam = boto3.client('iam')
    sns = boto3.client('sns')
    
    rotated_keys = []
    notifications = []
    
    # Get all users
    users = iam.list_users()['Users']
    
    for user in users:
        user_name = user['UserName']
        access_keys = iam.list_access_keys(UserName=user_name)['AccessKeyMetadata']
        
        for key in access_keys:
            if key['Status'] != 'Active':
                continue
                
            key_age = (datetime.now(key['CreateDate'].tzinfo) - key['CreateDate']).days
            
            # Notify if key is approaching rotation (75 days)
            if 75 <= key_age < 90:
                notifications.append({
                    'user': user_name,
                    'key_id': key['AccessKeyId'],
                    'age': key_age,
                    'action': 'notify'
                })
            
            # Rotate if key is older than 90 days
            elif key_age >= 90:
                try:
                    # Create new access key
                    new_key = iam.create_access_key(UserName=user_name)
                    
                    # Deactivate old key (don't delete immediately for safety)
                    iam.update_access_key(
                        UserName=user_name,
                        AccessKeyId=key['AccessKeyId'],
                        Status='Inactive'
                    )
                    
                    # Store new key in Secrets Manager
                    secretsmanager = boto3.client('secretsmanager')
                    secret_name = f"iam-access-keys/{user_name}"
                    
                    try:
                        secretsmanager.put_secret_value(
                            SecretId=secret_name,
                            SecretString=json.dumps({
                                'AccessKeyId': new_key['AccessKey']['AccessKeyId'],
                                'SecretAccessKey': new_key['AccessKey']['SecretAccessKey'],
                                'CreatedDate': new_key['AccessKey']['CreateDate'].isoformat()
                            })
                        )
                    except secretsmanager.exceptions.ResourceNotFoundException:
                        # Create secret if it doesn't exist
                        secretsmanager.create_secret(
                            Name=secret_name,
                            SecretString=json.dumps({
                                'AccessKeyId': new_key['AccessKey']['AccessKeyId'],
                                'SecretAccessKey': new_key['AccessKey']['SecretAccessKey'],
                                'CreatedDate': new_key['AccessKey']['CreateDate'].isoformat()
                            })
                        )
                    
                    rotated_keys.append({
                        'user': user_name,
                        'old_key_id': key['AccessKeyId'],
                        'new_key_id': new_key['AccessKey']['AccessKeyId'],
                        'age': key_age
                    })
                    
                    # Notify user
                    notifications.append({
                        'user': user_name,
                        'key_id': key['AccessKeyId'],
                        'age': key_age,
                        'action': 'rotated'
                    })
                    
                except Exception as e:
                    notifications.append({
                        'user': user_name,
                        'key_id': key['AccessKeyId'],
                        'error': str(e),
                        'action': 'failed'
                    })
    
    # Send notification
    if notifications:
        sns.publish(
            TopicArn='arn:aws:sns:region:account:key-rotation-notifications',
            Subject='IAM Access Key Rotation Report',
            Message=json.dumps({
                'timestamp': datetime.now().isoformat(),
                'rotated_keys': rotated_keys,
                'notifications': notifications
            }, indent=2)
        )
    
    return rotated_keys

def check_tls_configuration():
    """Check TLS configuration across resources"""
    import ssl
    import socket
    
    endpoints = [
        'api.example.com',
        'app.example.com',
        'admin.example.com'
    ]
    
    findings = []
    
    for endpoint in endpoints:
        try:
            context = ssl.create_default_context()
            with socket.create_connection((endpoint, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=endpoint) as ssock:
                    cipher = ssock.cipher()
                    version = ssock.version()
                    cert = ssock.getpeercert()
                    
                    finding = {
                        'endpoint': endpoint,
                        'tls_version': version,
                        'cipher': cipher[0],
                        'cert_expiry': cert.get('notAfter'),
                        'compliant': version in ['TLSv1.2', 'TLSv1.3']
                    }
                    
                    if version not in ['TLSv1.2', 'TLSv1.3']:
                        finding['severity'] = 'HIGH'
                        finding['recommendation'] = 'Upgrade to TLS 1.2 or higher'
                    
                    findings.append(finding)
                    
        except Exception as e:
            findings.append({
                'endpoint': endpoint,
                'error': str(e),
                'severity': 'HIGH'
            })
    
    return findings

if __name__ == '__main__':
    # Run key rotation
    rotated = rotate_access_keys()
    print(f"Rotated {len(rotated)} access keys")
    
    # Check TLS configuration
    tls_findings = check_tls_configuration()
    print(f"TLS findings: {len(tls_findings)}")
```

### Key Points

- Use KMS or equivalent for key management
- Enable automatic key rotation where supported
- Enforce TLS 1.2 or higher for all connections
- Encrypt data at rest in all storage services

## Logging and Monitoring

### Overview

Comprehensive logging and monitoring are essential for SOC2 compliance. Organizations must collect, protect, and analyze logs to detect security incidents, support investigations, and demonstrate control effectiveness.

Logs should cover authentication events, access to sensitive data, system changes, and security-relevant activities. Retention periods typically range from one to seven years depending on regulatory requirements and organizational policy.

### Code Example

```yaml
# Terraform: Logging and Monitoring Infrastructure

# CloudTrail for API Logging
resource "aws_cloudtrail" "main_trail" {
  name                          = "soc2-audit-trail"
  s3_bucket_name               = aws_s3_bucket.cloudtrail_logs.id
  s3_key_prefix                = "cloudtrail"
  is_multi_region_trail        = true
  enable_logging               = true
  enable_log_file_validation   = true
  kms_key_id                   = aws_kms_key.main_encryption_key.arn
  
  event_selector {
    read_write_type                 = "All"
    include_management_events       = true
    exclude_management_event_sources = []
    
    data_resource {
      type   = "AWS::S3::Object"
      values = ["${aws_s3_bucket.encrypted_bucket.arn}/"]
    }
    
    data_resource {
      type   = "AWS::Lambda::Function"
      values = ["arn:aws:lambda"]
    }
  }
  
  insight_selector {
    insight_type = "ApiCallRateInsight"
  }
  
  insight_selector {
    insight_type = "ApiErrorRateInsight"
  }
}

resource "aws_s3_bucket" "cloudtrail_logs" {
  bucket = "soc2-cloudtrail-logs-bucket"
}

resource "aws_s3_bucket_policy" "cloudtrail_bucket_policy" {
  bucket = aws_s3_bucket.cloudtrail_logs.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudTrailAclCheck"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.cloudtrail_logs.arn
      },
      {
        Sid    = "AWSCloudTrailWrite"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.cloudtrail_logs.arn}/cloudtrail/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}

# Config for Compliance Monitoring
resource "aws_config_configuration_recorder" "main" {
  name     = "soc2-config-recorder"
  role_arn = aws_iam_role.config_role.arn
  
  recording_group {
    all_supported                 = true
    include_global_resource_types = true
  }
}

resource "aws_config_delivery_channel" "main" {
  name           = "soc2-config-delivery"
  s3_bucket_name = aws_s3_bucket.config_logs.id
  s3_key_prefix  = "config"
  sns_topic_arn  = aws_sns_topic.config_alerts.arn
  
  snapshot_delivery_properties {
    delivery_frequency = "Six_Hours"
  }
}

resource "aws_config_configuration_recorder_status" "main" {
  name       = aws_config_configuration_recorder.main.name
  is_enabled = true
}

# Config Rules for SOC2
resource "aws_config_config_rule" "encrypted_volumes" {
  name = "encrypted-volumes"
  
  source {
    owner             = "AWS"
    source_identifier = "EC2_ENCRYPTED_VOLUMES"
  }
  
  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "mfa_enabled" {
  name = "iam-user-mfa-enabled"
  
  source {
    owner             = "AWS"
    source_identifier = "IAM_USER_MFA_ENABLED"
  }
  
  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "password_policy" {
  name = "iam-password-policy"
  
  source {
    owner             = "AWS"
    source_identifier = "IAM_PASSWORD_POLICY"
  }
  
  input_parameters = jsonencode({
    RequireUppercaseCharacters = "true"
    RequireLowercaseCharacters = "true"
    RequireSymbols             = "true"
    RequireNumbers             = "true"
    MinimumPasswordLength      = "14"
    PasswordReusePrevention    = "12"
    MaxPasswordAge             = "90"
  })
  
  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "s3_bucket_encryption" {
  name = "s3-bucket-server-side-encryption-enabled"
  
  source {
    owner             = "AWS"
    source_identifier = "S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED"
  }
  
  depends_on = [aws_config_configuration_recorder.main]
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "application_logs" {
  name              = "/soc2/application"
  retention_in_days = 2555  # 7 years
  kms_key_id        = aws_kms_key.main_encryption_key.arn
  
  tags = {
    Compliance = "SOC2"
    Retention  = "7-years"
  }
}

resource "aws_cloudwatch_log_group" "security_logs" {
  name              = "/soc2/security"
  retention_in_days = 2555
  kms_key_id        = aws_kms_key.main_encryption_key.arn
}

resource "aws_cloudwatch_log_group" "audit_logs" {
  name              = "/soc2/audit"
  retention_in_days = 2555
  kms_key_id        = aws_kms_key.main_encryption_key.arn
}

# Metric Filters for Security Events
resource "aws_cloudwatch_log_metric_filter" "root_login" {
  name           = "root-login-attempts"
  pattern        = "{ $.userIdentity.type = \"Root\" && $.eventName = \"ConsoleLogin\" }"
  log_group_name = aws_cloudwatch_log_group.security_logs.name
  
  metric_transformation {
    name          = "RootLoginCount"
    namespace     = "SOC2/Security"
    value         = "1"
    default_value = "0"
  }
}

resource "aws_cloudwatch_log_metric_filter" "iam_policy_changes" {
  name           = "iam-policy-changes"
  pattern        = "{ $.eventSource = \"iam.amazonaws.com\" && ($.eventName = \"PutGroupPolicy\" || $.eventName = \"PutRolePolicy\" || $.eventName = \"PutUserPolicy\" || $.eventName = \"CreatePolicy\" || $.eventName = \"DeleteGroupPolicy\" || $.eventName = \"DeleteRolePolicy\" || $.eventName = \"DeleteUserPolicy\" || $.eventName = \"DeletePolicy\" || $.eventName = \"CreatePolicyVersion\" || $.eventName = \"DeletePolicyVersion\" || $.eventName = \"AttachRolePolicy\" || $.eventName = \"DetachRolePolicy\" || $.eventName = \"AttachUserPolicy\" || $.eventName = \"DetachUserPolicy\" || $.eventName = \"AttachGroupPolicy\" || $.eventName = \"DetachGroupPolicy\") }"
  log_group_name = aws_cloudwatch_log_group.security_logs.name
  
  metric_transformation {
    name          = "IAMPolicyChanges"
    namespace     = "SOC2/Security"
    value         = "1"
    default_value = "0"
  }
}

# Alarms
resource "aws_cloudwatch_metric_alarm" "root_login_alarm" {
  alarm_name          = "root-login-detected"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "RootLoginCount"
  namespace           = "SOC2/Security"
  period              = "60"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "This metric monitors root account logins"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}

# Security Hub
resource "aws_securityhub_account" "main" {}

resource "aws_securityhub_standards_subscription" "cis" {
  standards_arn = "arn:aws:securityhub:::ruleset/cis-aws-foundations-benchmark/v/1.2.0"
  depends_on    = [aws_securityhub_account.main]
}

resource "aws_securityhub_standards_subscription" "pci_dss" {
  standards_arn = "arn:aws:securityhub:${data.aws_region.current.name}::standards/pci-dss/v/3.2.1"
  depends_on    = [aws_securityhub_account.main]
}

# GuardDuty
resource "aws_guardduty_detector" "main" {
  enable = true
}
```

### Key Points

- Enable CloudTrail for all API activity logging
- Use AWS Config for configuration compliance monitoring
- Set up Security Hub for centralized security findings
- Implement CloudWatch alarms for security events

---

## Conclusion

Technical controls are the foundation of SOC2 compliance. By implementing strong identity management, encryption, monitoring, network security, vulnerability management, change control, and incident response capabilities, organizations can demonstrate effective security posture to auditors and customers.

Remember that technical controls must be accompanied by appropriate policies, procedures, and documentation. Regular testing and review ensure controls remain effective as your environment evolves.

## Further Reading

- [AWS SOC2 Compliance Guide](https://aws.amazon.com/compliance/soc-faqs/)
- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Cloud Security Alliance Controls](https://cloudsecurityalliance.org/research/cloud-controls-matrix/)
