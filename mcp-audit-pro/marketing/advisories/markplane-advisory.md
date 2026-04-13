## Security Advisory: zerowand01/markplane

**Repository**: https://github.com/zerowand01/markplane  
**Audit Date**: April 14, 2026  
**Severity**: Critical (7 vulnerabilities: 3 Critical, 4 High)

---

### Findings Summary

| # | Type | Severity | Description |
|---|------|----------|-------------|
| 1 | Path Traversal | 🔴 Critical | Unrestricted file access via path manipulation |
| 2 | Command Injection | 🔴 Critical | User input passed to shell commands |
| 3 | Credential Exposure | 🔴 Critical | Sensitive data in source code |
| 4 | Privilege Escalation | 🟠 High | Container running as root |
| 5 | Unrestricted Fetch | 🟠 High | External URL fetching without validation |
| 6 | Unsafe File Operations | 🟠 High | Dangerous file operations detected |
| 7 | Input Validation | 🟠 High | Insufficient input sanitization |

---

### Impact

If exploited, these vulnerabilities could allow:
- Arbitrary file read on the host system
- Remote code execution
- Data exfiltration
- Lateral movement within network

---

### Remediation Priority

**Critical (Fix immediately)**:
1. Sanitize all file paths before operations
2. Use parameterized commands instead of shell execution
3. Remove hardcoded credentials

**High (Fix within 1 week)**:
4. Update Dockerfile to use non-root user
5. Add URL allowlist for external requests
6. Implement input validation middleware

---

### Resources

- Free MCP Scanner: https://mcp-audit.pro/scanner
- Professional Audit: https://mcp-audit.pro
