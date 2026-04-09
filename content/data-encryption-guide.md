---
title: "Data Encryption: At Rest, In Transit, and In Use"
category: "Cryptography"
tags: ["Encryption", "Cryptography", "Data Protection", "Privacy"]
date: "2026-04-09"
---

# Data Encryption: At Rest, In Transit, and In Use

## Encryption States

### At Rest
Data stored on disk, databases, backups.

### In Transit
Data moving across networks.

### In Use
Data being processed in memory.

## Encryption at Rest

### Database Encryption
- Transparent Data Encryption (TDE)
- Column-level encryption
- Application-level encryption

### File Encryption
- Full disk encryption (BitLocker, FileVault, LUKS)
- File-level encryption (EFS, EncFS)
- Container encryption (VeraCrypt)

### Cloud Storage
- Server-side encryption (SSE-S3, SSE-KMS)
- Client-side encryption
- Bucket policies enforcement

## Encryption in Transit

### TLS/SSL
- TLS 1.3 (preferred)
- Certificate pinning
- HSTS headers

### VPN Technologies
- IPsec (site-to-site)
- SSL VPN (remote access)
- WireGuard (modern, fast)

### Application Level
- HTTPS everywhere
- mTLS for service-to-service
- SSH for administration

## Encryption in Use

### Confidential Computing
- Intel SGX
- AMD SEV
- ARM TrustZone

### Homomorphic Encryption
- Compute on encrypted data
- Performance overhead
- Emerging technology

### Secure Enclaves
- AWS Nitro Enclaves
- Azure Confidential Computing
- Google Confidential VMs

## Key Management

### Key Types
- Symmetric (AES)
- Asymmetric (RSA, ECC)
- Hybrid (TLS handshake)

### Key Management Services
- AWS KMS
- Azure Key Vault
- Google Cloud KMS
- HashiCorp Vault

### Best Practices
- Rotate keys regularly
- Separate duties
- HSM for root keys
- Audit all access

## Common Algorithms

| Use Case | Algorithm | Notes |
|----------|-----------|-------|
| Symmetric | AES-256-GCM | Authenticated encryption |
| Asymmetric | RSA-4096 | Key exchange, signatures |
| Elliptic Curve | Curve25519 | Faster, smaller keys |
| Hashing | SHA-256 | Integrity verification |
| Passwords | Argon2 | Memory-hard, slow |

## Implementing Encryption

### Checklist
- [ ] Inventory all data locations
- [ ] Classify data sensitivity
- [ ] Choose appropriate algorithms
- [ ] Implement key management
- [ ] Test recovery procedures
- [ ] Monitor and audit

## Common Mistakes

- Hardcoding keys
- Weak algorithm choices (MD5, SHA1, DES)
- Improper key storage
- Missing certificate validation
- Insufficient randomness

## Conclusion

Encrypt everything by default. Strong cryptography is essential but implementation matters.
