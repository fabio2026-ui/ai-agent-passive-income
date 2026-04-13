# YouTube Video Script: Container Supply Chain Security
**Topic:** Supply Chain Security for Containers (SLSA, Sigstore, SBOMs)
**Duration:** 10-12 minutes
**Target Audience:** Security engineers, DevOps, SREs

---

## 🎬 INTRO HOOK (0:00 - 0:45)

*[Supply chain diagram, lock icons, code signing visualization]*

**HOST:**
"You trust your container images, right? You built them yourself, pushed them to your registry, deployed them to production. Safe and secure.

But what about the base image you pulled from Docker Hub? The npm package you installed? The Python library from PyPI? The compiler that built your Go binary?

The SolarWinds breach taught us a brutal lesson: attackers don't need to break into your systems when they can poison your supply chain. And in the container world, that supply chain is complex—hundreds of dependencies, multiple registries, build systems, and distribution channels.

In this video, we're going deep on container supply chain security. SBOMs, SLSA provenance, Sigstore signing, and how to verify that what you built is exactly what you're running in production.

This is the defense against the next SolarWinds. Let's build it."

---

## 📋 CONTENT STRUCTURE

### Section 1: Understanding the Container Supply Chain (0:45 - 2:30)

**The Container Supply Chain:**

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Source     │───▶│    Build     │───▶│  Registry    │
│   Code       │    │   System     │    │              │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                                │
                                                ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Production  │◀───│  Deployment  │◀───│ Distribution │
│  Runtime     │    │   Pipeline   │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Supply Chain Attack Vectors:**

1. **Source Code Compromise**
   - Compromised developer accounts
   - Malicious commits
   - Dependency confusion attacks

2. **Build System Compromise**
   - Compromised CI/CD systems
   - Malicious build scripts
   - Build environment poisoning

3. **Registry Compromise**
   - Registry account takeover
   - Image replacement attacks
   - Tag mutation

4. **Distribution Attacks**
   - Man-in-the-middle
   - DNS hijacking
   - Mirror poisoning

**Real-World Examples:**
- SolarWinds (2020) - Build system compromise
- Codecov (2021) - CI/CD credential theft
- UA Parser (2022) - NPM account compromise
- PyTorch (2023) - Dependency confusion

### Section 2: Software Bill of Materials (SBOM) (2:30 - 5:00)

**What is an SBOM?**

A machine-readable inventory of all components in your software—packages, libraries, files, licenses.

**Why SBOMs Matter:**
- Visibility into dependencies
- Rapid vulnerability response
- License compliance
- Provenance tracking
- Regulatory compliance (EO 14028)

**SBOM Formats:**

1. **SPDX (Software Package Data Exchange)**
   - Linux Foundation standard
   - Rich license information
   - Industry adoption

2. **CycloneDX**
   - OWASP project
   - Security-focused
   - Smaller footprint
   - Preferred for security use cases

**Generating SBOMs:**

**With Syft:**
```bash
# Install Syft
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh

# Generate SBOM from image
syft myimage:latest -o spdx-json > sbom.spdx.json
syft myimage:latest -o cyclonedx-json > sbom.cyclonedx.json

# Generate from directory
syft dir:./my-project -o spdx-json > sbom.spdx.json

# Include files
syft myimage:latest -o spdx-json --scope all-layers > sbom.spdx.json
```

**SBOM Contents Example (CycloneDX):**
```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "serialNumber": "urn:uuid:3e671687-395b-41f5-a30f-a58921a74b9e",
  "version": 1,
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "tools": [{"name": "syft", "version": "0.100.0"}],
    "component": {
      "type": "container",
      "name": "myapp",
      "version": "1.0.0"
    }
  },
  "components": [
    {
      "type": "library",
      "name": "express",
      "version": "4.18.2",
      "purl": "pkg:npm/express@4.18.2",
      "licenses": [{"license": {"id": "MIT"}}]
    },
    {
      "type": "library", 
      "name": "lodash",
      "version": "4.17.21",
      "purl": "pkg:npm/lodash@4.17.21",
      "licenses": [{"license": {"id": "MIT"}}]
    }
  ]
}
```

**SBOM in CI/CD:**

**GitHub Actions:**
```yaml
name: Generate SBOM
on:
  push:
    branches: [main]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          image: myapp:${{ github.sha }}
          format: spdx-json
          output-file: sbom.spdx.json
      
      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.spdx.json
      
      - name: Attach to release
        uses: anchore/sbom-action/publish-sbom@v0
        with:
          sbom-artifact-match: ".*\.spdx\.json$"
```

**Storing and Distributing SBOMs:**

**OCI Artifact Approach:**
```bash
# Attach SBOM to image
oras attach myregistry/myapp:v1.0.0 \
  --artifact-type application/spdx+json \
  sbom.spdx.json

# Retrieve SBOM
oras discover myregistry/myapp:v1.0.0
```

**Registry Storage:**
```bash
# Push SBOM to registry alongside image
cosign attach sbom --sbom sbom.spdx.json \
  myregistry/myapp:v1.0.0
```

### Section 3: Image Signing with Sigstore (5:00 - 7:30)

**The Signing Problem:**

**Traditional Signing Issues:**
- Key management complexity
- Certificate authority costs
- Key distribution challenges
- Developer friction

**Sigstore Solution:**

```
┌──────────────┐
│   Developer  │
└──────┬───────┘
       │ Sign with Fulcio
       ▼
┌──────────────┐     ┌──────────────┐
│   Fulcio     │────▶│   Rekor      │
│   (CA)       │     │   (Transparency)│
└──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│  Signed      │
│  Image       │
└──────────────┘
```

**Sigstore Components:**

1. **Cosign** - CLI tool for signing and verifying
2. **Fulcio** - Free, short-lived code signing CA
3. **Rekor** - Immutable transparency log
4. **OIDC** - Identity federation (GitHub, Google, etc.)

**Signing with Cosign:**

**Keyless Signing (Recommended):**
```bash
# Sign with OIDC (no key management!)
cosign sign --yes myregistry/myapp:v1.0.0

# Output:
# Generating ephemeral keys...
# Retrieving signed certificate...
# Successfully signed myregistry/myapp@sha256:abc123...
```

**Verification:**
```bash
# Verify signature
cosign verify myregistry/myapp:v1.0.0 \
  --certificate-identity=user@example.com \
  --certificate-oidc-issuer=https://accounts.google.com

# Verify with policy (only GitHub Actions)
cosign verify myregistry/myapp:v1.0.0 \
  --certificate-identity-regexp="^https://github.com/myorg/.*" \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com
```

**CI/CD Signing:**

**GitHub Actions with OIDC:**
```yaml
name: Sign Container
on:
  push:
    branches: [main]

jobs:
  sign:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write  # Required for OIDC
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Cosign
        uses: sigstore/cosign-installer@v3
      
      - name: Build image
        run: docker build -t myregistry/myapp:${{ github.sha }} .
      
      - name: Sign image
        run: |
          cosign sign --yes \
            myregistry/myapp:${{ github.sha }}
```

**Kubernetes Admission with Sigstore:**

**Policy Controller:**
```yaml
apiVersion: policy.sigstore.dev/v1beta1
kind: ClusterImagePolicy
metadata:
  name: signed-images-required
spec:
  images:
  - glob: "myregistry/**"
  authorities:
  - keyless:
      url: https://fulcio.sigstore.dev
      identities:
      - issuer: https://token.actions.githubusercontent.com
        subject: https://github.com/myorg/myrepo/.github/workflows/build.yaml@refs/heads/main
```

### Section 4: SLSA Provenance (7:30 - 10:00)

**What is SLSA?**

Supply Chain Levels for Software Artifacts—a framework for improving software supply chain security.

**SLSA Levels:**

```
Level 4: Full Hermetic Build
         Reproducible, verifiable
         
Level 3: Hardened Build
         Source integrity, isolated builds
         
Level 2: Hosted Build Platform
         Signed provenance, build service
         
Level 1: Provenance Available
         Build process documented
```

**SLSA Provenance:**

A signed attestation describing how an artifact was built:
- Source repository and commit
- Build system used
- Build parameters
- Dependencies
- Build timestamp

**Generating Provenance:**

**GitHub Actions + SLSA:**
```yaml
name: SLSA Provenance
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image: ${{ steps.build.outputs.image }}
      digest: ${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push
        id: build
        run: |
          docker build -t myregistry/myapp:${{ github.sha }} .
          docker push myregistry/myapp:${{ github.sha }}
          echo "digest=$(docker inspect --format='{{index .RepoDigests 0}}' myregistry/myapp:${{ github.sha }} | cut -d'@' -f2)" >> $GITHUB_OUTPUT

  provenance:
    needs: build
    permissions:
      actions: read
      id-token: write
      contents: write
    uses: slsa-framework/slsa-github-generator/.github/workflows/generator_container_slsa3.yml@v1.9.0
    with:
      image: ${{ needs.build.outputs.image }}
      digest: ${{ needs.build.outputs.digest }}
      registry-username: ${{ github.actor }}
    secrets:
      registry-password: ${{ secrets.GITHUB_TOKEN }}
```

**Provenance Attestation Example:**
```json
{
  "_type": "https://in-toto.io/Statement/v0.1",
  "predicateType": "https://slsa.dev/provenance/v0.2",
  "subject": [{
    "name": "myregistry/myapp",
    "digest": {"sha256": "abc123..."}
  }],
  "predicate": {
    "builder": {
      "id": "https://github.com/slsa-framework/slsa-github-generator/.github/workflows/generator_container_slsa3.yml@refs/tags/v1.9.0"
    },
    "buildType": "https://slsa.dev/container-based-build/v0.1",
    "invocation": {
      "configSource": {
        "uri": "git+https://github.com/myorg/myrepo@refs/heads/main",
        "digest": {"sha1": "def456..."}
      },
      "parameters": {},
      "environment": {
        "GITHUB_EVENT_NAME": "push",
        "GITHUB_RUN_ID": "123456789",
        "GITHUB_SHA": "def456..."
      }
    },
    "materials": [{
      "uri": "git+https://github.com/myorg/myrepo@refs/heads/main",
      "digest": {"sha1": "def456..."}
    }]
  }
}
```

**Verifying Provenance:**
```bash
# Download and verify attestation
cosign verify-attestation \
  --type slsaprovenance \
  --certificate-identity-regexp="^https://github.com/slsa-framework/.*" \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
  myregistry/myapp:v1.0.0

# Verify specific source
cosign verify-attestation \
  --type slsaprovenance \
  myregistry/myapp:v1.0.0 | jq '.predicate.invocation.configSource.uri'
# Expected: git+https://github.com/myorg/myrepo@refs/heads/main
```

**Policy Enforcement:**

**OPA/Gatekeeper Policy:**
```rego
package slsa

# Deny images without SLSA provenance
deny[msg] {
  input.review.object.spec.containers[_].image
  not input.review.object.metadata.annotations["slsa.provenance"]
  msg := "Image must have SLSA provenance attestation"
}

# Require specific builder
deny[msg] {
  provenance := input.review.object.metadata.annotations["slsa.provenance"]
  not contains(provenance, "github.com/myorg")
  msg := "Image must be built by trusted builder"
}
```

### Section 5: Complete Supply Chain Pipeline (10:00 - 11:30)

**End-to-End Secure Pipeline:**

```
Developer pushes code
        ↓
┌─────────────────────────────────────┐
│  GitHub Actions / CI Pipeline       │
│  ┌─────────────────────────────┐    │
│  │ 1. Build container image    │    │
│  │ 2. Generate SBOM (Syft)     │    │
│  │ 3. Scan vulnerabilities     │    │
│  │ 4. Run tests                │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 5. Sign image (Cosign)      │    │
│  │ 6. Generate SLSA provenance │    │
│  │ 7. Attach SBOM to image     │    │
│  │ 8. Push to registry         │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Container Registry (ECR/GCR/ACR)   │
│  - Signed image                     │
│  - SBOM attached                    │
│  - Provenance attestation           │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Kubernetes Admission Controller    │
│  ┌─────────────────────────────┐    │
│  │ Verify signature            │    │
│  │ Verify provenance           │    │
│  │ Check vulnerability scan    │    │
│  │ Enforce policies            │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
        ↓
    Deploy to Production
```

**Implementation Checklist:**

**Source:**
- [ ] Branch protection rules
- [ ] Required code reviews
- [ ] Signed commits (optional but good)
- [ ] Dependency scanning

**Build:**
- [ ] Hardened build environment
- [ ] No secrets in build logs
- [ ] Immutable build outputs
- [ ] Build provenance generation

**Artifacts:**
- [ ] Image signing (Cosign)
- [ ] SBOM generation
- [ ] SLSA provenance
- [ ] Vulnerability scan results

**Deployment:**
- [ ] Admission controller policies
- [ ] Signature verification
- [ ] Provenance verification
- [ ] SBOM availability

---

## 🎯 CTA / OUTRO (11:30 - 12:00)

**HOST:**
"Supply chain security isn't just about protecting your code—it's about protecting your users, your customers, and your business.

From SBOMs that give you visibility, to Sigstore that eliminates key management headaches, to SLSA provenance that proves your builds are trustworthy—you now have the tools to secure your entire supply chain.

But knowledge without action is worthless. So here's what I want you to do:

1. **Download my Supply Chain Security Toolkit**—it includes SBOM templates, Cosign scripts, and Kubernetes policies ready to deploy
2. **Generate an SBOM for your main application today**—just run Syft and see what you're shipping
3. **Set up Cosign signing in your CI/CD**—it takes 30 minutes and eliminates a massive attack vector
4. **Subscribe and hit the bell**—next week we're covering runtime security with eBPF and Falco
5. **Comment 'SUPPLY'** if you're implementing SLSA in your organization

The next SolarWinds is being built right now. Make sure it's not yours.

Secure your supply chain, verify everything, trust nothing by default. I'll see you in the next video."

*[End screen with toolkit download and subscribe]*

---

## 📝 SUPPLY CHAIN SECURITY RESOURCES

**Key Standards:**
- SLSA: slsa.dev
- Sigstore: sigstore.dev
- SPDX: spdx.dev
- CycloneDX: cyclonedx.org
- In-Toto: in-toto.io

**Tools Mentioned:**
- Syft: github.com/anchore/syft
- Cosign: github.com/sigstore/cosign
- Rekor CLI: sigstore.dev
- SLSA GitHub Generator: slsa-framework/slsa-github-generator

**Learning Resources:**
- SLSA Specification: slsa.dev/spec/v1.0/
- Sigstore Documentation: docs.sigstore.dev
- NIST SSDF: nist.gov/cyberframework
- CISA SSC: cisa.gov/supply-chain-security
