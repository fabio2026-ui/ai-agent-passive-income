# YouTube Video Script: Container Security - Docker & Kubernetes Hardening
**Topic:** Container Security Best Practices
**Duration:** 10-12 minutes
**Target Audience:** DevOps engineers, platform engineers, security teams

---

## 🎬 INTRO HOOK (0:00 - 0:45)

*[Terminal showing Docker commands, Kubernetes dashboards]*

**HOST:**
"Containers were supposed to make security easier. Same environment everywhere, immutable infrastructure, smaller attack surface. But here's the reality: most containers running in production right now are ticking time bombs.

Insecure base images. Root users by default. Secrets hardcoded in Dockerfiles. Vulnerabilities that have been patched for months but nobody updated. And let's not even talk about Kubernetes RBAC—the majority of clusters I've audited have enough permission sprawl to make a sysadmin cry.

I've secured container environments processing billions of transactions. I've also cleaned up breaches that started with a single vulnerable container. In this video, I'm giving you the complete container security playbook—from Dockerfile hardening to Kubernetes network policies.

By the end, you'll know exactly how to lock down your containers without killing your DevOps velocity. Let's get started."

---

## 📋 CONTENT STRUCTURE

### Section 1: Container Security Fundamentals (0:45 - 2:30)

**Why Container Security is Different:**

**Traditional Security vs. Container Security:**

| Aspect | Traditional | Containers |
|--------|-------------|------------|
| Unit of Security | Server/VM | Container/Pod |
| Lifecycle | Months/Years | Minutes/Hours |
| Immutability | Mutable | Immutable (should be) |
| Density | 10-50 VMs | 100-1000 containers |
| Attack Surface | OS + Apps | Image + Runtime |

**The Container Security Lifecycle:**
```
Build → Ship → Run
  ↓      ↓      ↓
Secure  Scan   Protect
```

**Key Principles:**
1. **Defense in Depth** - Multiple security layers
2. **Least Privilege** - Minimal permissions everywhere
3. **Immutable Infrastructure** - Don't modify running containers
4. **Shift Left** - Security starts in development

### Section 2: Secure Container Images (2:30 - 5:00)

**Base Image Selection:**

**Image Hierarchy (Best to Worst):**
1. **Distroless** (Google) - No shell, minimal packages
2. **Alpine** - 5MB base, musl libc
3. **Slim** variants (Debian/Ubuntu slim)
4. **Scratch** - Empty base (for Go/static binaries)
5. **Full OS images** - Avoid if possible

**Example: Distroless vs. Alpine**
```dockerfile
# BEFORE: Bloated image
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y python3 python3-pip
COPY app.py /app/
CMD ["python3", "/app/app.py"]

# AFTER: Distroless (production)
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt
COPY app.py .

FROM gcr.io/distroless/python3-debian12
COPY --from=builder /root/.local /root/.local
COPY --from=builder /app/app.py /app/
ENV PATH=/root/.local/bin:$PATH
WORKDIR /app
CMD ["app.py"]
```

**Dockerfile Security Best Practices:**

**1. Use Non-Root User:**
```dockerfile
# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser
```

**2. Pin Base Image Versions:**
```dockerfile
# BAD - Latest tag changes
FROM node:latest

# GOOD - Specific version
FROM node:20.11.0-alpine3.19

# BEST - Digest for immutability
FROM node:20.11.0-alpine3.19@sha256:abc123...
```

**3. Minimize Layers:**
```dockerfile
# BAD - Multiple RUN commands
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y vim
RUN apt-get install -y wget

# GOOD - Single layer
RUN apt-get update && apt-get install -y \
    curl \
    vim \
    wget \
    && rm -rf /var/lib/apt/lists/*
```

**4. Copy Specific Files:**
```dockerfile
# BAD - Copies everything including .env, secrets
COPY . /app

# GOOD - Specific files only
COPY requirements.txt /app/
COPY src/ /app/src/
```

**5. Use .dockerignore:**
```
# .dockerignore
.git
.env
*.pem
node_modules/
__pycache__/
*.log
.vscode/
.idea/
```

**Secrets Management (CRITICAL):**

**NEVER do this:**
```dockerfile
# NEVER HARDCODE SECRETS
ENV AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
ENV AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
COPY secrets.json /app/
```

**DO this instead:**
```dockerfile
# Use build secrets (BuildKit)
# syntax=docker/dockerfile:1
FROM python:3.11
RUN --mount=type=secret,id=pipconfig \
    pip config set global.extra-index-url $(cat /run/secrets/pipconfig)
```

```bash
# Build with secrets (not in final image)
docker build --secret id=pipconfig,src=$HOME/.pip/config .
```

**Runtime secrets:**
- Kubernetes Secrets
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- Mount at runtime, never in image

### Section 3: Image Scanning & Vulnerability Management (5:00 - 7:00)

**Container Image Scanners:**

| Tool | Type | Best For |
|------|------|----------|
| Trivy | Open source | CI/CD integration |
| Grype | Open source | Syft integration |
| Snyk | Commercial | Developer experience |
| Anchore | Commercial | Enterprise policy |
| Clair | Open source | Harbor integration |

**Trivy Scanning Example:**
```bash
# Install Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh

# Scan image
trivy image myapp:latest

# Scan with severity filter
trivy image --severity HIGH,CRITICAL myapp:latest

# Scan with exit code on vulnerabilities
trivy image --exit-code 1 --severity CRITICAL myapp:latest

# Generate SARIF for GitHub
trivy image --format sarif --output report.sarif myapp:latest
```

**CI/CD Integration:**

**GitHub Actions:**
```yaml
name: Container Security Scan
on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
      
      - name: Upload results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

**Vulnerability Management Workflow:**

```
Developer pushes code
        ↓
CI builds container image
        ↓
Image scanner runs
        ↓
┌─────────────────┬─────────────────┐
│ No critical vulns│ Critical found   │
│                 │                  │
│ Deploy to dev   │ Block pipeline   │
└─────────────────┴─────────────────┘
        ↓
Image signed (Cosign/Notation)
        ↓
Pushed to registry
        ↓
Admission controller validates
        ↓
Deployed to cluster
```

**Image Signing with Cosign:**
```bash
# Generate key pair
cosign generate-key-pair

# Sign image
cosign sign --key cosign.key myregistry/myapp:v1.0.0

# Verify signature
cosign verify --key cosign.pub myregistry/myapp:v1.0.0
```

### Section 4: Kubernetes Security (7:00 - 10:00)

**Pod Security Standards:**

**Three Policy Levels:**

1. **Privileged** - Unrestricted (avoid in production)
2. **Baseline** - Minimal restrictions, prevents known privilege escalations
3. **Restricted** - Best practice, heavily locked down

**Enabling Pod Security:**
```yaml
# Pod Security Standards admission
apiVersion: apiserver.config.k8s.io/v1
kind: AdmissionConfiguration
plugins:
- name: PodSecurity
  configuration:
    apiVersion: pod-security.admission.config.k8s.io/v1
    kind: PodSecurityConfiguration
    defaults:
      enforce: "restricted"
      audit: "restricted"
      warn: "restricted"
    exemptions:
      usernames: []
      runtimeClasses: []
      namespaces: [kube-system]
```

**Secure Pod Spec:**
```yaml
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
    image: myapp:v1.0.0
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
    resources:
      limits:
        cpu: "500m"
        memory: "512Mi"
      requests:
        cpu: "250m"
        memory: "256Mi"
    volumeMounts:
    - name: tmp
      mountPath: /tmp
  volumes:
  - name: tmp
    emptyDir: {}
```

**Key Security Settings Explained:**

| Setting | Purpose |
|---------|---------|
| `runAsNonRoot: true` | Prevents running as root |
| `readOnlyRootFilesystem: true` | Makes root filesystem read-only |
| `allowPrivilegeEscalation: false` | Prevents privilege escalation |
| `capabilities: drop: - ALL` | Removes all Linux capabilities |
| `seccompProfile: RuntimeDefault` | Enables syscall filtering |

**Network Policies:**

**Default Deny All:**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
```

**Allow Specific Traffic:**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-frontend
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
```

**RBAC (Role-Based Access Control):**

**Principle: Least Privilege**

**Service Account Best Practices:**
```yaml
# Dedicated SA per application
apiVersion: v1
kind: ServiceAccount
metadata:
  name: api-service
  namespace: production
automountServiceAccountToken: false  # Disable if not needed
```

**Minimal Role:**
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: api-role
  namespace: production
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list"]
  resourceNames: ["api-config"]  # Specific resource only
```

**RBAC Audit Commands:**
```bash
# List all cluster admins
kubectl get clusterrolebinding -o json | \
  jq -r '.items[] | select(.roleRef.name=="cluster-admin") | .subjects'

# Check what a user can do
kubectl auth can-i --list --as=user@example.com

# Check specific permissions
kubectl auth can-i create pods --as=user@example.com
```

**Admission Controllers:**

**Kyverno Policy Example:**
```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-ro-rootfs
spec:
  validationFailureAction: enforce
  rules:
  - name: check-read-only-root-fs
    match:
      resources:
        kinds:
        - Pod
    validate:
      message: "Root filesystem must be read-only"
      pattern:
        spec:
          containers:
          - securityContext:
              readOnlyRootFilesystem: true
```

### Section 5: Runtime Security & Monitoring (10:00 - 11:30)

**Runtime Security Tools:**

| Tool | Purpose |
|------|---------|
| Falco | Runtime threat detection |
| Tetragon | eBPF-based security |
| Sysdig | Monitoring + security |
| Aqua | Commercial CNAPP |
| Prisma Cloud | Commercial security platform |

**Falco Rule Example:**
```yaml
- rule: Terminal shell in container
  desc: Detect shell spawned in container
  condition: spawned_process and container and shell_procs
  output: "Shell spawned in container (user=%user.name container=%container.name)"
  priority: WARNING

- rule: Write to /etc
  desc: Unauthorized write to system directories
  condition: write_etc_common
  output: "File write to /etc (file=%fd.name)"
  priority: CRITICAL
```

**Runtime Monitoring Checklist:**
- [ ] Unexpected process execution
- [ ] Privilege escalation attempts
- [ ] File integrity monitoring
- [ ] Network connections to unexpected destinations
- [ ] Cryptocurrency mining detection
- [ ] Reverse shell detection

**Security Monitoring Stack:**
```
┌─────────────────────────────────────────┐
│           Falco (Runtime)               │
│         - Threat detection              │
│         - Anomaly detection             │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         Fluentd/Fluent Bit              │
│         - Log collection                │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│      Elasticsearch / Loki               │
│      - Log storage                      │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│    Kibana / Grafana                     │
│    - Visualization & Alerting           │
└─────────────────────────────────────────┘
```

---

## 🎯 CTA / OUTRO (11:30 - 12:00)

**HOST:**
"Containers are the future of infrastructure. But that future is only secure if we build it that way.

From distroless images to Pod Security Standards to Falco runtime detection—you now have the complete toolkit to secure your container environment.

But here's the thing: security is a journey, not a destination. Start with one thing. Scan your images. Enable read-only root filesystems. Implement a NetworkPolicy. Small steps compound into massive security gains.

Your action items:

1. **Download my Container Security Checklist**—it's a step-by-step guide for auditing your current setup
2. **Run Trivy on your images today**—see what vulnerabilities you're shipping
3. **Subscribe for more DevSecOps content**—next week we're diving into supply chain security with SLSA and Sigstore
4. **Comment 'CONTAINER'** if you want a deep-dive on Kubernetes hardening

Remember: every container is a potential attack vector. Make yours a dead end.

Secure your containers, protect your clusters, build with confidence. See you in the next video."

*[End screen with resources and subscribe]*

---

## 📝 CONTAINER SECURITY CHECKLIST

**Image Security:**
- [ ] Use minimal base images (distroless/Alpine)
- [ ] Pin image versions with digests
- [ ] Run as non-root user
- [ ] No secrets in images
- [ ] Multi-stage builds
- [ ] .dockerignore configured
- [ ] Image scanning in CI/CD
- [ ] Image signing enabled

**Kubernetes Security:**
- [ ] Pod Security Standards enforced
- [ ] NetworkPolicies defined
- [ ] RBAC least privilege
- [ ] Secrets management (external)
- [ ] Admission controllers enabled
- [ ] Node hardening
- [ ] etcd encryption
- [ ] API server audit logging

**Runtime Security:**
- [ ] Falco or equivalent deployed
- [ ] Runtime monitoring configured
- [ ] Log aggregation in place
- [ ] Alerting rules defined
- [ ] Incident response playbook
