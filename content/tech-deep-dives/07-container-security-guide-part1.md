# Container Security Guide: Comprehensive Protection for Docker and Kubernetes Environments

## Introduction

Containers have revolutionized application deployment, offering unprecedented speed, consistency, and resource efficiency. However, they also introduce unique security challenges that traditional security approaches struggle to address. From image vulnerabilities to runtime threats, securing containerized environments requires specialized knowledge and tools.

This comprehensive guide covers everything you need to know about container security, from secure image building to runtime protection in Kubernetes clusters.

## Table of Contents

1. Container Security Fundamentals
2. Secure Container Image Building
3. Image Scanning and Vulnerability Management
4. Container Runtime Security
5. Kubernetes Security Deep Dive
6. Supply Chain Security for Containers
7. Monitoring and Incident Response

## Container Security Fundamentals

### Understanding Container Security Layers

Container security operates at multiple layers, each requiring specific controls:

```
┌─────────────────────────────────────────────────────────────┐
│                    Container Security Layers                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 6: Application                                        │
│  ├── Secure coding practices                                 │
│  ├── Dependency management                                   │
│  └── Secrets handling                                        │
│                                                              │
│  Layer 5: Container Runtime                                  │
│  ├── Container isolation                                     │
│  ├── Resource limits                                         │
│  └── Security profiles (AppArmor/Seccomp)                    │
│                                                              │
│  Layer 4: Container Image                                    │
│  ├── Base image selection                                    │
│  ├── Minimal images                                          │
│  └── Image signing                                           │
│                                                              │
│  Layer 3: Container Engine                                   │
│  ├── Docker security options                                 │
│  ├── Privileged mode restrictions                            │
│  └── Network policies                                        │
│                                                              │
│  Layer 2: Host OS                                            │
│  ├── OS hardening                                            │
│  ├── Kernel security                                         │
│  └── Container-optimized OS                                  │
│                                                              │
│  Layer 1: Infrastructure                                     │
│  ├── Hardware security                                       │
│  ├── Network segmentation                                    │
│  └── Physical security                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Container Threat Landscape

| Threat Category | Examples | Impact |
|-----------------|----------|--------|
| **Image Vulnerabilities** | Outdated packages, CVEs in base images | Data breach, system compromise |
| **Misconfiguration** | Privileged containers, exposed APIs | Unauthorized access, privilege escalation |
| **Runtime Threats** | Cryptomining, container escape | Resource theft, host compromise |
| **Supply Chain** | Compromised registries, poisoned images | Widespread infection |
| **Secrets Exposure** | Hardcoded credentials, env vars | Credential theft, lateral movement |

## Secure Container Image Building

### Dockerfile Security Best Practices

```dockerfile
# ❌ INSECURE Dockerfile
FROM ubuntu:latest
RUN apt-get update && apt-get install -y python
COPY . /app
ENV DB_PASSWORD=supersecret123
CMD python /app/server.py

# ✅ SECURE Dockerfile
# Use specific, minimal base image
FROM python:3.11-slim-bookworm@sha256:abc123...

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install dependencies with pinned versions
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
WORKDIR /app
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Use exec form for proper signal handling
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

CMD ["python", "server.py"]
```

### Multi-Stage Builds for Security

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Security scanning stage
FROM aquasec/trivy:latest AS scanner
COPY --from=builder /build /scan
RUN trivy fs --exit-code 1 --severity HIGH,CRITICAL /scan

# Production stage - minimal image
FROM node:18-alpine AS production
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy only necessary artifacts
COPY --from=builder --chown=nodejs:nodejs /build/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /build/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /build/package.json ./

USER nodejs

EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

### Base Image Selection Criteria

| Base Image | Size | Security | Use Case |
|------------|------|----------|----------|
| `scratch` | ~0 MB | Highest | Go, Rust binaries |
| `distroless` | ~20 MB | Very High | Most applications |
| `alpine` | ~5 MB | Good | When package manager needed |
| `slim` | ~50 MB | Good | Python/Node applications |
| `ubuntu/debian` | ~100 MB | Moderate | Complex dependencies |

### Image Hardening Script

```bash
#!/bin/bash
# container-hardening.sh

set -euo pipefail

IMAGE_NAME=$1
TAG=$2

echo "🔒 Hardening container image: ${IMAGE_NAME}:${TAG}"

# 1. Update base image
docker build --target base -t temp-base -f Dockerfile .

# 2. Remove unnecessary packages
cat > harden.dockerfile << 'EOF'
FROM temp-base
RUN apt-get purge -y --auto-remove \
    curl wget telnet \
    gcc g++ make \
    && rm -rf /var/lib/apt/lists/*
EOF

docker build -f harden.dockerfile -t ${IMAGE_NAME}:${TAG} .

# 3. Scan for vulnerabilities
echo "🔍 Scanning for vulnerabilities..."
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image --exit-code 1 --severity HIGH,CRITICAL \
    ${IMAGE_NAME}:${TAG}

# 4. Check image size
SIZE=$(docker images --format "{{.Size}}" ${IMAGE_NAME}:${TAG})
echo "📦 Image size: ${SIZE}"

# 5. Verify non-root user
echo "👤 Checking user configuration..."
docker run --rm --entrypoint sh ${IMAGE_NAME}:${TAG} -c "whoami"

# 6. Sign image
echo "✍️  Signing image..."
cosign sign --key cosign.key ${IMAGE_NAME}:${TAG}

echo "✅ Container hardening complete!"
```

## Image Scanning and Vulnerability Management

### Continuous Vulnerability Scanning

```yaml
# GitLab CI Pipeline for Container Scanning
stages:
  - build
  - test
  - scan
  - push

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: ""

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker save $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA > image.tar
  artifacts:
    paths:
      - image.tar
    expire_in: 1 hour

scan-trivy:
  stage: scan
  image: aquasec/trivy:latest
  script:
    - trivy image --input image.tar 
        --format template 
        --template "@contrib/gitlab.tpl" 
        -o gl-container-scanning-report.json
    - trivy image --input image.tar --severity HIGH,CRITICAL --exit-code 1
  artifacts:
    reports:
      container_scanning: gl-container-scanning-report.json
  allow_failure: false

scan-snyk:
  stage: scan
  image: snyk/snyk:docker
  script:
    - snyk container test $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA 
        --severity-threshold=high
  allow_failure: true

push:
  stage: push
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker load < image.tar
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main
```

### Vulnerability Management Workflow

```python
# Vulnerability Management System
class ContainerVulnerabilityManager:
    def __init__(self):
        self.scanners = ['trivy', 'snyk', 'grype']
        self.sla_hours = {
            'critical': 24,
            'high': 72,
            'medium': 168,
            'low': 720
        }
    
    def scan_image(self, image_name, tag):
        """Comprehensive vulnerability scan."""
        results = {}
        
        for scanner in self.scanners:
            try:
                results[scanner] = self.run_scanner(scanner, image_name, tag)
            except Exception as e:
                results[scanner] = {'error': str(e)}
        
        # Aggregate results
        return self.aggregate_results(results)
    
    def prioritize_vulnerabilities(self, vulnerabilities):
        """Prioritize vulnerabilities based on multiple factors."""
        prioritized = []
        
        for vuln in vulnerabilities:
            score = self.calculate_priority_score(vuln)
            prioritized.append({
                **vuln,
                'priority_score': score,
                'sla_deadline': self.calculate_sla(vuln['severity'])
            })
        
        return sorted(prioritized, key=lambda x: x['priority_score'], reverse=True)
    
    def calculate_priority_score(self, vuln):
        """Calculate priority based on CVSS and context."""
        base_score = vuln.get('cvss_score', 5.0)
        
        # Adjust based on exploit availability
        if vuln.get('exploit_available', False):
            base_score *= 1.5
        
        # Adjust based on fix availability
        if vuln.get('fixed_version'):
            base_score *= 0.9  # Slightly lower priority if fix exists
        
        # Adjust based on exposure
        if vuln.get('exposed_to_internet', False):
            base_score *= 1.3
        
        return min(base_score, 10.0)
    
    def generate_remediation_plan(self, vulnerabilities):
        """Generate actionable remediation plan."""
        plan = {
            'immediate_action': [],
            'short_term': [],
            'long_term': [],
            'monitoring': []
        }
        
        for vuln in vulnerabilities:
            if vuln['severity'] == 'critical':
                plan['immediate_action'].append({
                    'vulnerability': vuln['id'],
                    'action': 'upgrade_package',
                    'package': vuln['package_name'],
                    'from_version': vuln['installed_version'],
                    'to_version': vuln['fixed_version'],
                    'deadline': vuln['sla_deadline']
                })
            elif vuln['severity'] == 'high':
                plan['short_term'].append({
                    'vulnerability': vuln['id'],
                    'action': 'plan_upgrade',
                    'timeline': 'next_sprint'
                })
        
        return plan
```

## Container Runtime Security

### Runtime Security Monitoring

```yaml
# Falco Rules for Container Runtime Security
- rule: Unauthorized Container Privilege Escalation
  desc: Detect privilege escalation attempts in containers
  condition: >
    spawned_process and
    container and
    (user.uid != 0 and user.euid = 0)
  output: >
    Privilege escalation detected
    (user=%user.name command=%proc.cmdline
    container=%container.name)
  priority: CRITICAL

- rule: Unauthorized Sensitive File Access
  desc: Detect access to sensitive files
  condition: >
    open_read and
    container and
    (fd.name contains "/etc/shadow" or
     fd.name contains "/etc/passwd" or
     fd.name contains "/etc/kubernetes/pki")
  output: >
    Sensitive file accessed
    (file=%fd.name user=%user.name
    container=%container.name)
  priority: HIGH

- rule: Outbound Connection from Database Container
  desc: Database containers should not make outbound connections
  condition: >
    outbound and
    container and
    container.image contains "postgres" and
    not (fd.sip in trusted_cidrs)
  output: >
    Database container making external connection
    (connection=%fd.name container=%container.name)
  priority: HIGH

- rule: Cryptomining Detection
  desc: Detect cryptomining processes
  condition: >
    spawned_process and
    (proc.name in (xmrig, minerd, stratum, cgminer))
  output: >
    Cryptomining process detected
    (process=%proc.name cmdline=%proc.cmdline)
  priority: CRITICAL
```

### Seccomp Profiles

```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "archMap": [
    {
      "architecture": "SCMP_ARCH_X86_64",
      "subArchitectures": ["SCMP_ARCH_X86", "SCMP_ARCH_X32"]
    }
  ],
  "syscalls": [
    {
      "names": [
        "accept",
        "accept4",
        "bind",
        "clone",
        "close",
        "connect",
        "epoll_create",
        "epoll_create1",
        "epoll_ctl",
        "epoll_pwait",
        "epoll_wait",
        "exit",
        "exit_group",
        "fcntl",
        "fstat",
        "fstatfs",
        "getcwd",
        "getdents",
        "getdents64",
        "getegid",
        "geteuid",
        "getgid",
        "getpeername",
        "getpgrp",
        "getpid",
        "getppid",
        "getrandom",
        "getsockname",
        "getsockopt",
        "getuid",
        "ioctl",
        "listen",
        "lseek",
        "mkdir",
        "mkdirat",
        "mmap",
        "mprotect",
        "munmap",
        "nanosleep",
        "open",
        "openat",
        "poll",
        "read",
        "recvfrom",
        "recvmsg",
        "rt_sigaction",
        "rt_sigprocmask",
        "rt_sigreturn",
        "select",
        "sendmsg",
        "sendto",
        "setitimer",
        "setsockopt",
        "shutdown",
        "sigaltstack",
        "socket",
        "socketpair",
        "stat",
        "statfs",
        "sysinfo",
        "uname",
        "wait4",
        "waitid",
        "write",
        "writev"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

### Container Security Context

```yaml
# Kubernetes Pod Security Context
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: myapp:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
        add:
        - NET_BIND_SERVICE
    resources:
      limits:
        cpu: "500m"
        memory: "512Mi"
      requests:
        cpu: "100m"
        memory: "128Mi"
    volumeMounts:
    - name: tmp
      mountPath: /tmp
    - name: cache
      mountPath: /var/cache
  volumes:
  - name: tmp
    emptyDir: {}
  - name: cache
    emptyDir:
      sizeLimit: 100Mi
```

## Kubernetes Security Deep Dive

### Pod Security Standards

```yaml
# Pod Security Policy (Deprecated - use Pod Security Standards)
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
  supplementalGroups:
    rule: 'RunAsAny'
  readOnlyRootFilesystem: true
```

### RBAC Configuration

```yaml
# Service Account with Minimal Permissions
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-service-account
  namespace: production
automountServiceAccountToken: false
---
# Role with Specific Permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: app-role
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list"]
  resourceNames: ["app-config"]
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get"]
  resourceNames: ["app-credentials"]
---
# Role Binding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-role-binding
  namespace: production
subjects:
- kind: ServiceAccount
  name: app-service-account
  namespace: production
roleRef:
  kind: Role
  name: app-role
  apiGroup: rbac.authorization.k8s.io
```

### Network Policies

```yaml
# Default Deny All Ingress
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
---
# Allow Frontend to API
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-frontend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
---
# API to Database Only
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: database-allow-api
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api
    ports:
    - protocol: TCP
      port: 5432
```

### Kubernetes Security Scanning

```bash
#!/bin/bash
# k8s-security-scan.sh

echo "🔍 Running Kubernetes Security Scan"

# Check for privileged containers
echo "Checking for privileged containers..."
kubectl get pods --all-namespaces -o json | \
    jq '.items[] | select(.spec.containers[].securityContext.privileged==true) | .metadata.name'

# Check for containers running as root
echo "Checking for containers running as root..."
kubectl get pods --all-namespaces -o json | \
    jq '.items[] | select(.spec.containers[].securityContext.runAsUser==0) | .metadata.name'

# Check for missing resource limits
echo "Checking for missing resource limits..."
kubectl get pods --all-namespaces -o json | \
    jq '.items[] | select(.spec.containers[].resources.limits==null) | .metadata.name'

# Run kube-bench
echo "Running CIS Kubernetes Benchmark..."
kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml
kubectl wait --for=condition=complete job/kube-bench
kubectl logs job/kube-bench

# Run kube-hunter
echo "Running kube-hunter for penetration testing..."
docker run --rm --network host aquasec/kube-hunter --remote $(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')

echo "✅ Security scan complete!"
```

## Supply Chain Security for Containers

### Image Signing and Verification

```bash
# Sign image with Cosign
cosign generate-key-pair

cosign sign --key cosign.key \
    --annotations "version=1.0.0" \
    --annotations "build_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    myregistry.io/myapp:v1.0.0

# Verify image signature
cosign verify --key cosign.pub myregistry.io/myapp:v1.0.0
```

```yaml
# Kyverno Policy for Image Verification
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-image-signatures
spec:
  validationFailureAction: enforce
  background: false
  rules:
  - name: check-image-signature
    match:
      any:
      - resources:
          kinds:
          - Pod
    verifyImages:
    - imageReferences:
      - "myregistry.io/*"
      attestors:
      - entries:
        - keys:
            publicKeys: |
              -----BEGIN PUBLIC KEY-----
              MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
              -----END PUBLIC KEY-----
```

### SBOM Generation and Management

```bash
# Generate SBOM with Syft
syft packages myapp:latest -o spdx-json > sbom.spdx.json

# Generate SBOM with Trivy
trivy image --format cyclonedx -o sbom.cyclonedx.json myapp:latest

# Sign SBOM
cosign sign-blob --key cosign.key sbom.spdx.json

# Upload to registry
oras push myregistry.io/myapp:sha256-abc.sbom \
    --artifact-type application/spdx+json \
    sbom.spdx.json:application/spdx+json
```

## Monitoring and Incident Response

### Container Security Monitoring Stack

```yaml
# Prometheus Rules for Container Security
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: container-security-alerts
spec:
  groups:
  - name: container_security
    rules:
    - alert: ContainerHighCPUUsage
      expr: |
        rate(container_cpu_usage_seconds_total[5m]) > 0.8
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Container {{ $labels.container }} high CPU usage"
        
    - alert: ContainerMemoryLimit
      expr: |
        container_memory_working_set_bytes / container_spec_memory_limit_bytes > 0.9
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Container {{ $labels.container }} approaching memory limit"
        
    - alert: PrivilegedContainerRunning
      expr: |
        kube_pod_container_info{container_security_context_privileged="true"} == 1
      for: 0m
      labels:
        severity: critical
      annotations:
        summary: "Privileged container {{ $labels.container }} detected"
```

### Incident Response Playbook

```yaml
# Container Security Incident Response
incident_response:
  detection:
    - falco_alert
    - prometheus_alert
    - runtime_anomaly
    
  containment:
    immediate:
      - cordon_node
      - isolate_container
      - capture_logs
      - capture_memory_dump
      
    short_term:
      - block_registry_access
      - enable_enhanced_monitoring
      - notify_security_team
      
  eradication:
    - terminate_compromised_pods
    - revoke_compromised_credentials
    - patch_vulnerabilities
    - rebuild_images
    
  recovery:
    - verify_image_signatures
    - redeploy_clean_workloads
    - restore_from_backups
    - verify_integrity
    
  lessons_learned:
    - timeline_documentation
    - root_cause_analysis
    - control_improvements
    - team_debrief
```

## Conclusion

Container security requires a comprehensive approach spanning the entire lifecycle—from secure image building through runtime protection. Key takeaways:

1. **Start with secure base images** and minimize attack surface
2. **Scan continuously** for vulnerabilities in images and at runtime
3. **Enforce least privilege** with proper security contexts and RBAC
4. **Monitor everything** with runtime security tools and logging
5. **Secure the supply chain** with image signing and SBOMs

Remember that container security is not a one-time effort but a continuous process of improvement and adaptation to new threats.

---

*Last updated: April 2025*
*Tags: Container Security, Docker, Kubernetes, DevSecOps, Runtime Security*
