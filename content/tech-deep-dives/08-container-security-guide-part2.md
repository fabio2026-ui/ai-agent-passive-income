# Advanced Container Security: Kubernetes Hardening, Supply Chain Security, and Compliance

## Introduction

Building on the foundational container security practices, this guide dives into advanced topics essential for production-grade container deployments. We'll explore Kubernetes hardening techniques, comprehensive supply chain security, compliance frameworks, and emerging security patterns for cloud-native environments.

## Table of Contents

1. Advanced Kubernetes Hardening
2. Service Mesh Security
3. Supply Chain Security Deep Dive
4. Compliance and Auditing
5. Emerging Container Security Patterns
6. Tool Comparison and Selection

## Advanced Kubernetes Hardening

### API Server Security

The Kubernetes API server is the central management point and primary attack target. Harden it with these configurations:

```yaml
# API Server Security Configuration
apiVersion: v1
kind: Pod
metadata:
  name: kube-apiserver
  namespace: kube-system
spec:
  containers:
  - name: kube-apiserver
    image: k8s.gcr.io/kube-apiserver:v1.28.0
    command:
    - kube-apiserver
    # Authentication
    - --oidc-issuer-url=https://accounts.google.com
    - --oidc-client-id=kubernetes
    - --oidc-username-claim=email
    - --oidc-groups-claim=groups
    
    # Authorization
    - --authorization-mode=Node,RBAC
    - --enable-admission-plugins=NodeRestriction,PodSecurityPolicy,ResourceQuota
    
    # Audit Logging
    - --audit-log-path=/var/log/audit.log
    - --audit-log-maxage=30
    - --audit-log-maxbackup=10
    - --audit-log-maxsize=100
    - --audit-policy-file=/etc/kubernetes/audit-policy.yaml
    
    # Security Headers
    - --tls-cert-file=/etc/kubernetes/pki/apiserver.crt
    - --tls-private-key-file=/etc/kubernetes/pki/apiserver.key
    - --tls-cipher-suites=TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
    
    # API Settings
    - --anonymous-auth=false
    - --basic-auth-file=""
    - --token-auth-file=""
    - --kubelet-certificate-authority=/etc/kubernetes/pki/ca.crt
    - --kubelet-client-certificate=/etc/kubernetes/pki/apiserver-kubelet-client.crt
    - --kubelet-client-key=/etc/kubernetes/pki/apiserver-kubelet-client.key
    - --kubelet-https=true
    
    # Etcd Security
    - --etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt
    - --etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt
    - --etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key
```

### etcd Security

etcd stores all cluster state and secrets. Protect it with these measures:

```yaml
# etcd Encryption at Rest
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
    - secrets
    - configmaps
    - ingresses.extensions
    providers:
    - aescbc:
        keys:
        - name: key1
          secret: <base64-encoded-32-byte-key>
    - identity: {}
```

```bash
#!/bin/bash
# etcd-backup-encrypt.sh

ETCDCTL_API=3 etcdctl snapshot save snapshot.db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key

# Encrypt backup
gpg --symmetric --cipher-algo AES256 snapshot.db

# Upload to secure storage
aws s3 cp snapshot.db.gpg s3://secure-backups/etcd/
```

### Admission Controllers

Use admission controllers for policy enforcement:

```yaml
# OPA Gatekeeper Policy
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          properties:
            labels:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels
        violation[{"msg": msg, "details": {"missing_labels": missing}}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {label | label := input.parameters.labels[_]}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("Missing required labels: %v", [missing])
        }
---
# Constraint using the template
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: require-security-labels
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    excludedNamespaces: ["kube-system"]
  parameters:
    labels:
      - "app.kubernetes.io/name"
      - "app.kubernetes.io/version"
      - "security-tier"
```

### Pod Security Admission (PSA)

Replace Pod Security Policies with the new Pod Security Admission:

```yaml
# Pod Security Standards Enforcement
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
---
# Example compliant pod
apiVersion: v1
kind: Pod
metadata:
  name: compliant-app
  namespace: production
  labels:
    app.kubernetes.io/name: secure-app
    app.kubernetes.io/version: "1.0.0"
    security-tier: critical
spec:
  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: nginx:alpine
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
      readOnlyRootFilesystem: true
      runAsUser: 1000
      runAsGroup: 1000
      seccompProfile:
        type: RuntimeDefault
    resources:
      limits:
        cpu: "500m"
        memory: "256Mi"
      requests:
        cpu: "100m"
        memory: "128Mi"
    volumeMounts:
    - name: tmp
      mountPath: /tmp
    - name: cache
      mountPath: /var/cache/nginx
    - name: run
      mountPath: /var/run
  volumes:
  - name: tmp
    emptyDir: {}
  - name: cache
    emptyDir: {}
  - name: run
    emptyDir: {}
```

## Service Mesh Security

### Istio Security Configuration

```yaml
# Peer Authentication - mTLS
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT
---
# Destination Rule - TLS Settings
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: tls-settings
  namespace: production
spec:
  host: "*.production.svc.cluster.local"
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        maxRequestsPerConnection: 2
    outlierDetection:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
---
# Authorization Policy
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: api-access-policy
  namespace: production
spec:
  selector:
    matchLabels:
      app: api-service
  action: ALLOW
  rules:
  # Allow frontend to access API
  - from:
    - source:
        principals: ["cluster.local/ns/production/sa/frontend"]
    to:
    - operation:
        methods: ["GET", "POST"]
        paths: ["/api/v1/*"]
    when:
    - key: request.auth.claims[scope]
      values: ["api:read", "api:write"]
  
  # Allow admin to access admin endpoints
  - from:
    - source:
        principals: ["cluster.local/ns/production/sa/admin"]
    to:
    - operation:
        methods: ["*"]
        paths: ["/admin/*"]
    when:
    - key: request.auth.claims[groups]
      values: ["administrators"]
  
  # Deny all other access
  - to:
    - operation:
        methods: ["*"]
        paths: ["*"]
---
# Request Authentication
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: jwt-validation
  namespace: production
spec:
  selector:
    matchLabels:
      app: api-service
  jwtRules:
  - issuer: "https://accounts.google.com"
    jwksUri: "https://www.googleapis.com/oauth2/v3/certs"
    audiences: ["my-app-client-id"]
    forwardOriginalToken: false
    outputPayloadToHeader: x-jwt-claim
```

### mTLS Certificate Management

```bash
#!/bin/bash
# cert-rotation.sh - Automated certificate rotation

NAMESPACES=$(kubectl get ns -o jsonpath='{.items[*].metadata.name}')

for ns in $NAMESPACES; do
  echo "Checking certificates in namespace: $ns"
  
  # Check certificate expiration
  kubectl get certificates -n $ns -o json | \
    jq -r '.items[] | select(.status.conditions[] | select(.type=="Ready" and .status!="True")) | .metadata.name' | \
    while read cert; do
      echo "Certificate $cert needs attention in $ns"
      kubectl certificate renew $cert -n $ns
    done
done

# Force Istio sidecar certificate rotation
echo "Triggering Istio certificate rotation..."
kubectl rollout restart deployment -n istio-system
```

## Supply Chain Security Deep Dive

### SLSA Compliance

Implement Supply-chain Levels for Software Artifacts (SLSA):

```yaml
# SLSA Level Requirements
slsa_levels:
  level_1:
    requirements:
      - build_process_fully_scripted
      - provenance_available
    implementation:
      - use_ci_cd_pipeline
      - generate_provenance
      
  level_2:
    requirements:
      - version_controlled_builds
      - hosted_build_service
      - authenticated_provenance
    implementation:
      - use_github_actions
      - signed_build_provenance
      
  level_3:
    requirements:
      - hermetic_builds
      - reproducible_builds
      - tamper_resistant_builds
    implementation:
      - pinned_dependencies
      - build_isolation
      - slsa_compliant_builder
      
  level_4:
    requirements:
      - two_person_review
      - hermetic_and_reproducible
      - full_auditability
    implementation:
      - mandatory_code_review
      - immutable_build_process
      - comprehensive_audit_logs
```

### Sigstore Integration

```yaml
# Tekton Pipeline with Sigstore
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: secure-build-pipeline
spec:
  workspaces:
  - name: source
  - name: dockerconfig
  params:
  - name: image-reference
  tasks:
  - name: fetch-source
    taskRef:
      name: git-clone
    workspaces:
    - name: output
      workspace: source
    params:
    - name: url
      value: $(params.repo-url)
    - name: revision
      value: $(params.revision)
      
  - name: run-tests
    runAfter: [fetch-source]
    workspaces:
    - name: source
      workspace: source
    taskSpec:
      steps:
      - name: unit-tests
        image: golang:1.21
        workingDir: $(workspaces.source.path)
        script: |
          go test -v ./...
          
  - name: build-and-sign
    runAfter: [run-tests]
    workspaces:
    - name: source
      workspace: source
    taskSpec:
      steps:
      - name: build
        image: gcr.io/kaniko-project/executor:latest
        args:
        - --context=$(workspaces.source.path)
        - --destination=$(params.image-reference)
        - --digest-file=/tmp/digest
        
      - name: sign
        image: gcr.io/projectsigstore/cosign:latest
        script: |
          cosign sign \
            --fulcio-url=https://fulcio.sigstore.dev \
            --rekor-url=https://rekor.sigstore.dev \
            --oidc-issuer=https://accounts.google.com \
            $(params.image-reference)@$(cat /tmp/digest)
```

### Dependency Management

```python
# Dependency Security Scanner
class DependencyScanner:
    def __init__(self):
        self.advisory_dbs = [
            'npm_audit',
            'snyk_vuln_db',
            'osv_dev',
            'github_advisory'
        ]
    
    def scan_lockfile(self, lockfile_path):
        """Scan package lock file for vulnerabilities."""
        dependencies = self.parse_lockfile(lockfile_path)
        findings = []
        
        for dep in dependencies:
            vulns = self.check_vulnerabilities(dep)
            if vulns:
                findings.append({
                    'package': dep['name'],
                    'version': dep['version'],
                    'vulnerabilities': vulns
                })
        
        return findings
    
    def generate_sbom(self, project_path):
        """Generate Software Bill of Materials."""
        sbom = {
            'specVersion': '1.4',
            'bomFormat': 'CycloneDX',
            'components': []
        }
        
        dependencies = self.get_all_dependencies(project_path)
        
        for dep in dependencies:
            component = {
                'type': 'library',
                'name': dep['name'],
                'version': dep['version'],
                'purl': dep['purl'],
                'licenses': self.get_licenses(dep),
                'hashes': self.get_hashes(dep)
            }
            sbom['components'].append(component)
        
        return sbom
    
    def check_licenses(self, sbom, allowed_licenses):
        """Check for license compliance."""
        violations = []
        
        for component in sbom['components']:
            licenses = component.get('licenses', [])
            if not any(lic in allowed_licenses for lic in licenses):
                violations.append({
                    'component': component['name'],
                    'licenses': licenses
                })
        
        return violations
```

## Compliance and Auditing

### CIS Benchmarks

```bash
#!/bin/bash
# run-cis-benchmarks.sh

# Master Node Checks
echo "=== Master Node Configuration ==="

# Check API server authorization mode
ps -ef | grep kube-apiserver | grep -v grep | grep "authorization-mode=Node,RBAC" > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ API server using Node,RBAC authorization"
else
    echo "✗ API server not using Node,RBAC authorization"
fi

# Check anonymous auth
ps -ef | grep kube-apiserver | grep -v grep | grep "anonymous-auth=false" > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Anonymous authentication disabled"
else
    echo "✗ Anonymous authentication enabled"
fi

# Worker Node Checks
echo "=== Worker Node Configuration ==="

# Check kubelet read-only port
ps -ef | grep kubelet | grep -v grep | grep "read-only-port=0" > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Kubelet read-only port disabled"
else
    echo "✗ Kubelet read-only port enabled"
fi

# Check protecting kernel defaults
ps -ef | grep kubelet | grep -v grep | grep "protect-kernel-defaults=true" > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Kubelet protecting kernel defaults"
else
    echo "✗ Kubelet not protecting kernel defaults"
fi
```

### Audit Policy Configuration

```yaml
# Comprehensive Kubernetes Audit Policy
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
# Log pod changes at RequestResponse level
- level: RequestResponse
  resources:
  - group: ""
    resources: ["pods"]
  namespaces: ["production", "staging"]

# Log secret access at Metadata level
- level: Metadata
  resources:
  - group: ""
    resources: ["secrets", "configmaps"]
  omitStages:
  - RequestReceived

# Log authn/authz at Request level
- level: Request
  resources:
  - group: "authentication.k8s.io"
  - group: "authorization.k8s.io"

# Log privileged pod creation
- level: RequestResponse
  resources:
  - group: ""
    resources: ["pods"]
  omitStages:
  - RequestReceived

# Log everything else at Metadata level
- level: Metadata
  omitStages:
  - RequestReceived
```

## Emerging Container Security Patterns

### Confidential Computing

```yaml
# Confidential Computing with AMD SEV
apiVersion: v1
kind: Pod
metadata:
  name: confidential-app
spec:
  runtimeClassName: kata-cc
  containers:
  - name: app
    image: myapp:latest
    resources:
      limits:
        memory: "4Gi"
        cpu: "2"
        amd.com/sev: 1
    env:
    - name: SEV_POLICY
      value: "encrypted-state"
```

### WebAssembly (WASM) Containers

```yaml
# WASM Container Runtime
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: wasmtime-spin
handler: spin
scheduling:
  nodeSelector:
    wasm-enabled: "true"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wasm-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wasm-app
  template:
    metadata:
      labels:
        app: wasm-app
    spec:
      runtimeClassName: wasmtime-spin
      containers:
      - name: spin-app
        image: ghcr.io/myorg/wasm-app:latest
        resources:
          limits:
            memory: "128Mi"
            cpu: "100m"
```

### eBPF-Based Security

```python
# eBPF Security Monitor
class EBPFMonitor:
    def __init__(self):
        self.bpf_programs = {
            'exec_monitor': 'execsnoop',
            'network_monitor': 'tcpconnect',
            'file_monitor': 'opensnoop',
            'syscall_monitor': 'syscount'
        }
    
    def load_monitor(self, program_name):
        """Load eBPF monitoring program."""
        bpf_code = self.get_bpf_code(program_name)
        
        bpf = BPF(text=bpf_code)
        
        # Attach to relevant kernel probes
        if program_name == 'exec_monitor':
            bpf.attach_kprobe(event=bpf.get_syscall_fnname("execve"), fn_name="trace_execve")
        
        return bpf
    
    def detect_anomalies(self, events):
        """Detect security anomalies from eBPF events."""
        alerts = []
        
        for event in events:
            # Detect cryptomining
            if self.is_mining_process(event['comm']):
                alerts.append({
                    'severity': 'critical',
                    'type': 'cryptomining',
                    'process': event['comm'],
                    'pid': event['pid']
                })
            
            # Detect privilege escalation
            if event['uid'] != 0 and event['euid'] == 0:
                alerts.append({
                    'severity': 'high',
                    'type': 'privilege_escalation',
                    'process': event['comm'],
                    'user': event['uid']
                })
        
        return alerts
```

## Tool Comparison and Selection

### Container Security Tools Matrix

| Tool | Category | Best For | Integration | Pricing |
|------|----------|----------|-------------|---------|
| **Trivy** | Scanning | Fast, comprehensive scans | CI/CD, CLI | Free/OSS |
| **Snyk** | Scanning | Developer-friendly | IDE, CI/CD | Freemium |
| **Aqua** | Platform | Enterprise runtime protection | K8s, Cloud | $$$ |
| **Sysdig** | Monitoring | Deep visibility + security | Prometheus | $$$ |
| **Falco** | Runtime | OSS runtime detection | K8s, Cloud | Free/OSS |
| **Prisma** | Platform | CNAPP comprehensive | Multi-cloud | $$$$ |
| **Anchore** | Scanning | Policy-based scanning | CI/CD | OSS/$$ |
| **Twistlock** | Platform | Now Prisma Cloud | K8s | $$$ |

### Selection Decision Tree

```
What is your primary need?
│
├── Image Scanning
│   ├── Need speed → Trivy
│   ├── Need developer UX → Snyk
│   └── Need policy enforcement → Anchore
│
├── Runtime Protection
│   ├── OSS preference → Falco
│   ├── Need managed service → Sysdig
│   └── Need full platform → Aqua/Prisma
│
└── Full Platform
    ├── Cloud-native focus → Prisma
    ├── K8s-native → Aqua
    └── Multi-cloud → Sysdig
```

## Conclusion

Advanced container security requires a defense-in-depth approach combining secure build practices, runtime protection, supply chain integrity, and continuous monitoring. As container technologies evolve, staying current with emerging patterns like confidential computing and eBPF-based security will be essential.

**Key Takeaways:**

1. Harden Kubernetes at every layer—API server, etcd, and workloads
2. Implement mTLS and service mesh for zero-trust networking
3. Secure the supply chain with SLSA practices and Sigstore
4. Automate compliance with CIS benchmarks
5. Stay ahead with emerging technologies like confidential computing

---

*Last updated: April 2025*
*Tags: Container Security, Kubernetes, Supply Chain Security, SLSA, Service Mesh, Compliance*
