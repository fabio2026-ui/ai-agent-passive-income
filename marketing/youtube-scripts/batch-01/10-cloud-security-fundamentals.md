# YouTube Video Script: Cloud Security Fundamentals - AWS, Azure, GCP
**Topic:** Multi-Cloud Security Best Practices
**Duration:** 10-12 minutes
**Target Audience:** Cloud engineers, security architects, DevSecOps

---

## 🎬 INTRO HOOK (0:00 - 0:45)

*[Cloud console interfaces, architecture diagrams, security icons]*

**HOST:**
"The cloud was supposed to be more secure. No more patching servers in the basement. No more worrying about physical security. Automatic updates, managed services, enterprise-grade infrastructure available with a credit card.

But here's what actually happened: companies moved to the cloud and brought all their bad habits with them. Public S3 buckets with customer data. Overprivileged IAM roles. Security groups open to 0.0.0.0/0. Secrets in GitHub repos. And attackers who know cloud APIs better than the defenders.

In 2023 alone, misconfigured cloud storage led to billions of exposed records. And the scary part? Most of those breaches weren't sophisticated APT attacks. They were basic configuration mistakes. The kind that automated tools can find in seconds.

I've secured cloud environments across AWS, Azure, and GCP—from startups to enterprises processing petabytes of sensitive data. In this video, I'm giving you the cloud security fundamentals that work across all platforms. Identity, networking, encryption, monitoring, and the common misconfigurations that keep me up at night.

Whether you're AWS-only, multi-cloud, or just starting your cloud journey, this is your security foundation."

---

## 📋 CONTENT STRUCTURE

### Section 1: Cloud Security Shared Responsibility Model (0:45 - 2:30)

**Understanding the Model:**

```
┌─────────────────────────────────────────┐
│              CUSTOMER                   │
│  ┌─────────────────────────────────┐    │
│  │  Data, Identity, Applications   │    │
│  │  Network traffic protection     │    │
│  │  Client-side encryption         │    │
│  │  Server-side encryption         │    │
│  │  Network firewalls              │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│              CLOUD PROVIDER             │
│  ┌─────────────────────────────────┐    │
│  │  Physical security              │    │
│  │  Host infrastructure            │    │
│  │  Network infrastructure         │    │
│  │  Virtualization layer           │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Responsibility by Service Model:**

| Layer | IaaS | PaaS | SaaS |
|-------|------|------|------|
| Data | Customer | Customer | Shared |
| Applications | Customer | Provider | Provider |
| Runtime | Customer | Provider | Provider |
| Middleware | Customer | Provider | Provider |
| OS | Customer | Provider | Provider |
| Virtualization | Provider | Provider | Provider |
| Hardware | Provider | Provider | Provider |

**Common Misconceptions:**
- "The cloud provider handles security" - WRONG
- "Moving to the cloud makes us secure" - WRONG
- "Cloud-native tools are enough" - WRONG

**Cloud Security Alliance (CSA) Shared Responsibilities:**
- Infrastructure security
- Application security
- Data security
- Identity management
- Compliance

### Section 2: Identity and Access Management (2:30 - 5:00)

**The #1 Cloud Security Control:**

**Why Identity is Everything:**
- APIs are the new perimeter
- Credentials = access to everything
- Identity-based attacks are #1 vector
- Cloud environments are API-driven

**IAM Best Practices (Universal):**

**1. Principle of Least Privilege:**
```json
// BAD: Wildcard permissions
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "*",
    "Resource": "*"
  }]
}

// GOOD: Specific permissions
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
      "s3:PutObject"
    ],
    "Resource": "arn:aws:s3:::mybucket/uploads/*"
  }]
}
```

**2. No Root/Admin Account Usage:**
- Create individual user accounts
- Use service accounts for automation
- Enable MFA on all admin accounts
- Rotate access keys regularly

**3. Role-Based Access Control (RBAC):**

**AWS IAM Roles:**
```bash
# Create role with trust policy
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ec2.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role \
  --role-name AppServerRole \
  --assume-role-policy-document file://trust-policy.json
```

**Azure RBAC:**
```bash
# Assign role to user
az role assignment create \
  --assignee user@example.com \
  --role "Storage Blob Data Contributor" \
  --scope /subscriptions/xxx/resourceGroups/myRG
```

**GCP IAM:**
```bash
# Grant role to service account
gcloud projects add-iam-policy-binding my-project \
  --member="serviceAccount:app@my-project.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"
```

**4. Privileged Access Management:**

**Just-in-Time (JIT) Access:**
```bash
# AWS - Request temporary elevated access
# Use IAM Identity Center or third-party PAM

# Azure PIM
az rest --method post \
  --url "https://management.azure.com/.../roleAssignmentScheduleRequests" \
  --body '{
    "properties": {
      "principalId": "user-id",
      "roleDefinitionId": "role-id",
      "requestType": "AdminActivate",
      "scheduleInfo": {
        "startDateTime": "2024-01-15T10:00:00Z",
        "expiration": {"type": "AfterDuration", "duration": "PT8H"}
      }
    }
  }'
```

**5. Service Account Security:**

**Best Practices:**
- One service account per application
- No human user service accounts
- Regular key rotation
- Short-lived credentials where possible
- IP restrictions on service accounts

**AWS IAM Roles for Service Accounts (IRSA):**
```yaml
# EKS Pod with IAM role
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myapp
  namespace: default
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/MyAppRole
```

**6. MFA Everywhere:**

**Enforcement Options:**
- AWS: IAM policy conditions
- Azure: Conditional Access
- GCP: Organization policies

**AWS MFA Enforcement:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "*",
    "Resource": "*",
    "Condition": {
      "BoolIfExists": {"aws:MultiFactorAuthPresent": "false"}
    }
  }]
}
```

### Section 3: Network Security (5:00 - 7:30)

**Cloud Networking Fundamentals:**

**Virtual Private Cloud (VPC) Architecture:**

```
┌─────────────────────────────────────────┐
│               VPC (10.0.0.0/16)         │
│  ┌─────────────────────────────────┐    │
│  │      Public Subnets             │    │
│  │   (10.0.1.0/24, 10.0.2.0/24)    │    │
│  │                                 │    │
│  │  ┌─────┐  ┌─────┐  ┌─────────┐  │    │
│  │  │ ALB │  │ NAT │  │ Bastion │  │    │
│  │  └─────┘  │ GW  │  │  Host   │  │    │
│  │           └─────┘  └─────────┘  │    │
│  └──────────────┬──────────────────┘    │
│                 │                       │
│  ┌──────────────┴──────────────────┐    │
│  │      Private Subnets            │    │
│  │   (10.0.3.0/24, 10.0.4.0/24)    │    │
│  │                                 │    │
│  │  ┌─────────┐  ┌─────────────┐   │    │
│  │  │ Web App │  │  Database   │   │    │
│  │  └─────────┘  └─────────────┘   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Network Security Checklist:**

**1. Default Deny Security Groups:**

**AWS Security Groups:**
```bash
# Only allow necessary traffic
# Inbound rules:
# - Port 443 from 0.0.0.0/0 (if public)
# - Port 22 from specific bastion IP only
# - Port 3306 from application security group only

# Outbound rules:
# - Restrict to necessary destinations
```

**2. Network Segmentation:**

**Tier-Based Segmentation:**
- Public tier (load balancers, CDN)
- Application tier (web servers, APIs)
- Data tier (databases, caches)
- Management tier (bastion, monitoring)

**AWS NACLs vs Security Groups:**
| Feature | Security Group | NACL |
|---------|----------------|------|
| Level | Instance | Subnet |
| State | Stateful | Stateless |
| Rules | Allow only | Allow/Deny |
| Default | Deny all | Allow all |

**3. Private Connectivity:**

**VPC Peering vs Transit Gateway:**
- **VPC Peering:** Direct 1:1 connection, simpler
- **Transit Gateway:** Hub-and-spoke, scales better

**Private Link/Endpoint Services:**
```bash
# AWS PrivateLink
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-12345678 \
  --service-name com.amazonaws.us-east-1.s3 \
  --vpc-endpoint-type Gateway

# Azure Private Link
az network private-endpoint create \
  --name myEndpoint \
  --resource-group myRG \
  --vnet-name myVNet \
  --subnet mySubnet \
  --private-connection-resource-id $resourceId
```

**4. DDoS Protection:**

**Cloud-Native Options:**
- AWS Shield (Standard/Advanced)
- Azure DDoS Protection
- Google Cloud Armor

**AWS Shield Advanced:**
```bash
# Enable Shield Advanced
aws shield create-protection \
  --name my-protection \
  --resource-arn arn:aws:cloudfront::123456789:distribution/EXAMPLE
```

**5. Web Application Firewall (WAF):**

**Core Rule Set Coverage:**
- SQL injection
- Cross-site scripting (XSS)
- OWASP Top 10
- Rate limiting
- Geo-blocking

**AWS WAF Rule Example:**
```json
{
  "Name": "SQLInjectionRule",
  "Priority": 1,
  "Statement": {
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesSQLiRuleSet"
    }
  },
  "Action": {"Block": {}},
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true
  }
}
```

### Section 4: Data Protection & Encryption (7:30 - 9:30)

**Encryption Strategy:**

**Defense in Depth:**
```
┌─────────────────────────────────────────┐
│  Application-Level Encryption           │
│  (Field-level encryption)               │
├─────────────────────────────────────────┤
│  Database Encryption (TDE)              │
│  (Transparent Data Encryption)          │
├─────────────────────────────────────────┤
│  Storage Encryption                     │
│  (Volume/Bucket encryption)             │
├─────────────────────────────────────────┤
│  Network Encryption                     │
│  (TLS 1.3)                              │
└─────────────────────────────────────────┘
```

**Encryption at Rest:**

**AWS:**
```bash
# S3 bucket encryption
aws s3api put-bucket-encryption \
  --bucket mybucket \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms",
        "KMSMasterKeyID": "arn:aws:kms:..."
      },
      "BucketKeyEnabled": true
    }]
  }'

# EBS volume encryption (default)
aws ec2 enable-ebs-encryption-by-default
```

**Azure:**
```bash
# Storage account encryption
az storage account create \
  --name mystorageaccount \
  --resource-group myRG \
  --encryption-services blob file

# Disk encryption
az vm encryption enable \
  --resource-group myRG \
  --name myVM \
  --disk-encryption-keyvault myVault
```

**GCP:**
```bash
# Bucket encryption
gsutil kms encryption -k projects/my-project/locations/us/keyRings/my-keyring/cryptoKeys/my-key gs://mybucket

# Disk encryption (CMEK)
gcloud compute disks create my-disk \
  --kms-key projects/my-project/locations/us/keyRings/my-keyring/cryptoKeys/my-key
```

**Key Management:**

**Cloud KMS Best Practices:**
- Use customer-managed keys (CMK) for sensitive data
- Key rotation (automatic or manual)
- Separation of duties for key admin vs. key user
- Key access logging
- HSM-backed keys for highest sensitivity

**AWS KMS Key Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Enable IAM User Permissions",
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::123456789:root"},
      "Action": "kms:*",
      "Resource": "*"
    },
    {
      "Sid": "Allow use of the key",
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::123456789:role/AppRole"},
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:GenerateDataKey*"
      ],
      "Resource": "*"
    }
  ]
}
```

**Secrets Management:**

**Never Do This:**
```python
# NEVER HARDCODE SECRETS
db_password = "SuperSecret123!"
api_key = "AKIAIOSFODNN7EXAMPLE"
```

**Cloud Secrets Managers:**

**AWS Secrets Manager:**
```python
import boto3
from botocore.exceptions import ClientError

secret_name = "prod/myapp/database"
region_name = "us-east-1"

session = boto3.session.Session()
client = session.client(
    service_name='secretsmanager',
    region_name=region_name
)

try:
    secret_value = client.get_secret_value(SecretId=secret_name)
    password = secret_value['SecretString']
except ClientError as e:
    # Handle error
    pass
```

**Azure Key Vault:**
```python
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

credential = DefaultAzureCredential()
client = SecretClient(
    vault_url="https://myvault.vault.azure.net/",
    credential=credential
)

secret = client.get_secret("db-password")
password = secret.value
```

**GCP Secret Manager:**
```python
from google.cloud import secretmanager

client = secretmanager.SecretManagerServiceClient()
name = f"projects/my-project/secrets/db-password/versions/latest"
response = client.access_secret_version(request={"name": name})
password = response.payload.data.decode("UTF-8")
```

### Section 5: Monitoring & Compliance (9:30 - 11:00)

**Cloud Monitoring Architecture:**

```
┌─────────────────────────────────────────┐
│  Cloud Activity Logs                    │
│  (CloudTrail, Activity Log, Audit)      │
├─────────────────────────────────────────┤
│  Config/Compliance Monitoring           │
│  (Config, Policy, Security Command)     │
├─────────────────────────────────────────┤
│  SIEM / Log Analytics                   │
│  (Sentinel, Security Lake, Chronicle)   │
├─────────────────────────────────────────┤
│  Alerting & Response                    │
│  (SOAR, Case Management)                │
└─────────────────────────────────────────┘
```

**Critical Logs to Enable:**

**AWS CloudTrail:**
```bash
# Enable organization trail
aws cloudtrail create-trail \
  --name org-trail \
  --s3-bucket-name my-cloudtrail-bucket \
  --is-multi-region-trail \
  --enable-log-file-validation \
  --is-organization-trail

# Enable CloudTrail Insights
aws cloudtrail put-insight-selectors \
  --trail-name org-trail \
  --insight-selectors '[{"InsightType": "ApiCallRateInsight"}, {"InsightType": "ApiErrorRateInsight"}]'
```

**Azure Activity Log:**
```bash
# Create diagnostic setting
az monitor diagnostic-settings create \
  --name "subscription-logs" \
  --resource /subscriptions/{subscription-id} \
  --logs '[{"category": "Administrative", "enabled": true}]' \
  --workspace my-log-analytics-workspace
```

**GCP Audit Logs:**
```bash
# Export audit logs
gcloud logging sinks create audit-sink \
  bigquery.googleapis.com/projects/my-project/datasets/audit_logs \
  --log-filter='protoPayload.serviceName!=""'
```

**Configuration Monitoring:**

**AWS Config Rules:**
```bash
# Enable required rules
aws configservice put-config-rule \
  --config-rule '{
    "ConfigRuleName": "s3-bucket-public-read-prohibited",
    "Source": {
      "Owner": "AWS",
      "SourceIdentifier": "S3_BUCKET_PUBLIC_READ_PROHIBITED"
    }
  }'
```

**Security Posture Management (CSPM):**

**Tools:**
- AWS Security Hub
- Azure Security Center / Microsoft Defender for Cloud
- Google Security Command Center
- Third-party: Prisma Cloud, Orca, Wiz, Lacework

**Common Misconfigurations to Monitor:**
- Public S3 buckets / storage accounts
- Security groups with 0.0.0.0/0
- Unencrypted storage
- Missing MFA on root accounts
- Overprivileged IAM roles
- Unused access keys
- Unpatched instances

---

## 🎯 CTA / OUTRO (11:00 - 12:00)

**HOST:**
"The cloud is secure—if you configure it that way. The defaults are getting better, but they're not enough. You need defense in depth, least privilege, encryption everywhere, and continuous monitoring.

We've covered the fundamentals: identity, networking, encryption, and monitoring. But cloud security is a moving target. New services, new attack techniques, new compliance requirements.

Your action plan:

1. **Download my Cloud Security Checklist**—it's a comprehensive audit guide for AWS, Azure, and GCP
2. **Run a configuration audit this week**—use AWS Config, Azure Policy, or Security Command Center
3. **Enable MFA on every admin account**—if you do nothing else, do this
4. **Subscribe for cloud security deep dives**—next week we're covering Infrastructure as Code security with Terraform
5. **Comment 'CLOUD SECURE'** when you've audited your cloud environment

Remember: every cloud resource you create is a potential attack surface. Make sure it's a surface you've secured.

Secure your cloud, protect your data, build with confidence. I'll see you in the next video."

*[End screen with checklist download and subscribe]*

---

## 📝 CLOUD SECURITY RESOURCES

**Provider Security Centers:**
- AWS Security, Identity & Compliance: aws.amazon.com/security
- Azure Security: azure.microsoft.com/security
- Google Cloud Security: cloud.google.com/security

**Well-Architected Frameworks:**
- AWS Well-Architected Security Pillar
- Azure Well-Architected Framework - Security
- Google Cloud Architecture Framework - Security

**Compliance Resources:**
- AWS Artifact (compliance reports)
- Azure Compliance Manager
- Google Cloud Compliance

**Security Tools:**
- Prowler (AWS security scanner)
- ScoutSuite (Multi-cloud scanner)
- CloudSploit (Security monitoring)
- Steampipe (Cloud query engine)

**Certifications:**
- AWS Certified Security - Specialty
- Azure Security Engineer Associate
- Google Cloud Professional Cloud Security Engineer
- CCSK (Certificate of Cloud Security Knowledge)
