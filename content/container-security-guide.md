---
title: "Container Security: Docker and Kubernetes Hardening"
category: "Container Security"
tags: ["Docker", "Kubernetes", "Containers", "Hardening"]
date: "2026-04-09"
---

# Container Security: Docker and Kubernetes Hardening

## Container Security Layers

### 1. Image Security
- Use minimal base images (Alpine, Distroless)
- Regular base image updates
- Scan for vulnerabilities
- Sign and verify images

### 2. Registry Security
- Private registries
- Access control
- Image signing (Notary, Cosign)
- Vulnerability scanning

### 3. Runtime Security
- Read-only root filesystems
- Drop unnecessary capabilities
- Resource limits
- Network policies

### 4. Orchestration Security
- RBAC configuration
- Pod security policies
- Secrets management
- Audit logging

## Dockerfile Best Practices

```dockerfile
# Use specific version
FROM node:18-alpine

# Run as non-root
USER node

# Copy only necessary files
COPY package*.json ./
RUN npm ci --only=production

# Read-only root filesystem
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
```

## Kubernetes Security

### Pod Security Standards
- Restricted (maximum security)
- Baseline (minimal restrictions)
- Privileged (unrestricted)

### Network Policies
Segment traffic between pods:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

### Secrets Management
- External Secrets Operator
- Sealed Secrets
- Vault integration
- Never commit secrets

## Scanning Tools

| Tool | Purpose |
|------|---------|
| Trivy | Image vulnerability scanning |
| Clair | Container vulnerability analysis |
| Falco | Runtime threat detection |
| kube-bench | CIS Kubernetes benchmarks |

## Supply Chain Security

- SBOM generation
- SLSA compliance
- Reproducible builds
- Signed artifacts

## Conclusion

Container security spans the entire lifecycle from build to runtime.
