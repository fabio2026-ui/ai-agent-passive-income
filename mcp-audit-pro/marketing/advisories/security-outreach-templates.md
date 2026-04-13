# Security Outreach Templates

**Goal**: Notify MCP server maintainers about vulnerabilities found during audit
**Tone**: Professional, helpful, non-accusatory
**CTA**: Free scanner + professional audit service

---

## Template 1: GitHub Security Advisory Comment

```
Hi @maintainer,

I ran a security audit on [repo name] as part of research into MCP server security posture and found [N] potential issues that might be worth reviewing.

**Summary**:
- [List top 1-2 findings with file paths]

**Example**:
```
[code snippet]
```

**Suggested fix**:
[Brief remediation]

I built a free scanner specifically for MCP servers if you'd like to run your own check:
🔗 https://mcp-audit.pro/scanner

If you'd like a full professional audit with detailed remediation guide, I also offer that as a service.

Happy to help however I can.
```

---

## Template 2: Direct Email to Maintainer

**Subject**: Security findings in [Repo Name] - MCP Audit

```
Hi [Name],

I'm reaching out because I recently conducted a security audit of open-source MCP servers, including [repo name].

I found [N] security issues that I wanted to share with you privately before any public disclosure:

1. [Vulnerability type] in [file:line]
2. [Vulnerability type] in [file:line]

I can provide a detailed PDF report with exact remediation steps at no cost for open-source projects if you're interested.

Free scanner (runs in browser): https://mcp-audit.pro/scanner

Let me know the best way to share the details securely.

Best regards,
MCP Audit Pro
hello@mcp-audit.pro
```

---

## Template 3: Twitter DM / LinkedIn Message (Short)

```
Hi [Name], I ran a security audit on [repo] and found [N] issues including [top issue]. Happy to share details and a free remediation guide. DM me if interested.
```

---

## Target List (High Priority)

| Repository | Vulns | Maintainer | Contact Method |
|------------|-------|------------|----------------|
| naveenraj-17/synapse-ai | 8 (6C) | naveenraj-17 | GitHub Issue |
| zerowand01/markplane | 7 (3C) | zerowand01 | GitHub Issue |
| oracle/mcp | 17 (1C, 16H) | oracle | GitHub Issue |
| vespo92/OPNSenseMCP | 14 (12H) | vespo92 | GitHub Issue |
| Palm1r/llmcore | 5 (2C, 3H) | Palm1r | GitHub Issue |
| chernistry/bernstein | 3 (3C) | chernistry | GitHub Issue |
| opentabs-dev/opentabs | 6 (5C, 1H) | opentabs-dev | GitHub Issue |
| avelino/mcp | 6 (1C, 3H) | avelino | GitHub Issue |
| Snowflake-Labs/mcp | 5 (1C) | Snowflake-Labs | GitHub Issue |

---

## Ethical Guidelines

- ✅ Give maintainers time to fix before public mention
- ✅ Focus on helping, not shaming
- ✅ Offer free remediation guidance
- ✅ Only mention publicly if already disclosed or fixed
- ❌ Never exploit vulnerabilities
- ❌ Don't demand payment for disclosure
