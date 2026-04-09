# GitHub Action for CodeGuard AI

Automatically scan your code for security vulnerabilities and quality issues on every push and pull request.

## Features

- 🔍 **Security Scanning** - Detect SQL injection, XSS, and other vulnerabilities
- 📊 **Quality Scoring** - Get a grade (A-F) for your codebase
- 🚨 **PR Comments** - Auto-comment on pull requests with findings
- 📈 **Trend Tracking** - Track code quality over time

## Usage

```yaml
name: CodeGuard Scan
on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: codeguard-ai/codeguard-action@v1
        with:
          api-key: ${{ secrets.CODEGUARD_API_KEY }}
          fail-on: 'grade-c'  # Fail build if grade below C
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `api-key` | Required | Your CodeGuard API key |
| `fail-on` | `grade-f` | Minimum grade to pass (grade-a to grade-f) |
| `include` | `src/` | Directories to scan |
| `exclude` | `node_modules/` | Directories to exclude |

## Example PR Comment

```
🛡️ CodeGuard Security Scan
━━━━━━━━━━━━━━━━━━━━━━━━
Overall Grade: B (78/100)

Security: 85/100 ✅
Performance: 72/100 ⚠️
Complexity: 80/100 ✅

No critical issues found. Ready to merge!
```

## Get Started

1. Sign up at https://codeguard-ai-prod.yhongwb.workers.dev
2. Get your API key
3. Add to repository secrets
4. Add this action to your workflow

---

**Free for open source projects!**