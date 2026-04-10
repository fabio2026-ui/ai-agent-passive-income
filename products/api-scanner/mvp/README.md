# API Security Scanner MVP

A lightweight API security scanner that analyzes OpenAPI specifications and tests for common vulnerabilities.

## Features

- **OpenAPI Parser**: Parse and analyze OpenAPI 3.0 specifications
- **Vulnerability Scanner**: Detect SQL Injection, XSS, and Authentication Bypass vulnerabilities
- **HTML Report Generator**: Generate professional security audit reports
- **CLI Interface**: Easy-to-use command-line interface

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### CLI Mode

```bash
# Scan an OpenAPI spec file
python -m api_scanner scan spec.yaml --output report.html

# Scan with custom configuration
python -m api_scanner scan spec.yaml --base-url https://api.example.com --output report.html
```

### Programmatic Usage

```python
from api_scanner import OpenAPIParser, VulnerabilityScanner, ReportGenerator

# Parse OpenAPI spec
parser = OpenAPIParser("spec.yaml")
endpoints = parser.parse()

# Scan for vulnerabilities
scanner = VulnerabilityScanner(base_url="https://api.example.com")
results = scanner.scan_all(endpoints)

# Generate report
generator = ReportGenerator()
generator.generate(results, "report.html")
```

## Project Structure

```
api_scanner/
├── __init__.py           # Package exports
├── __main__.py           # CLI entry point
├── parser.py             # OpenAPI parser
├── scanner.py            # Vulnerability scanner
├── vulnerabilities/      # Vulnerability detection modules
│   ├── __init__.py
│   ├── base.py          # Base vulnerability class
│   ├── sqli.py          # SQL Injection detection
│   ├── xss.py           # XSS detection
│   └── auth_bypass.py   # Auth bypass detection
├── report.py            # HTML report generator
└── models.py            # Data models
```

## License

MIT
