## Security Advisory: oracle/mcp

**Repository**: https://github.com/oracle/mcp  
**Audit Date**: April 14, 2026  
**Severity**: High (17 vulnerabilities: 1 Critical, 16 High)

---

### Overview

Official Oracle MCP server implementation with multiple security findings. Despite being an official repository from a major vendor, the codebase shows security gaps that could impact production deployments.

---

### Findings Summary

| Category | Count | Severity |
|----------|-------|----------|
| Path Traversal | 10 | High |
| Privilege Escalation | 4 | High |
| Credential Exposure | 2 | Critical + High |
| Command Injection | 1 | High |

**Total**: 17 findings (1 Critical, 16 High)

---

### Key Issues

1. **Path Traversal Vulnerabilities (10 instances)**
   - Multiple locations where file paths are constructed from user input
   - Could allow reading arbitrary files on the system
   - Affects file upload/download operations

2. **Privilege Escalation (4 instances)**
   - Docker configuration issues
   - Process running with unnecessary privileges
   - Container escape risks

3. **Credential Exposure (2 instances)**
   - Hardcoded API endpoints with embedded credentials
   - Test credentials in production paths

---

### Recommendations for Oracle

Given the official nature of this repository, we recommend:

1. **Security review** of all file operations
2. **Container hardening** with least-privilege principles
3. **Credential management** overhaul
4. **CI/CD security scanning** integration
5. **Bug bounty program** for MCP servers

---

### Contact

For detailed remediation guidance:
📧 hello@mcp-audit.pro

Free security scanner:
🔗 https://mcp-audit.pro/scanner

---

*This advisory is provided as part of independent security research into the MCP ecosystem. Oracle and all maintainers are encouraged to verify these findings independently.*
