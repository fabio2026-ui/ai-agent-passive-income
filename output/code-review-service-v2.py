#!/usr/bin/env python3
"""
Enhanced Code Review Service v2.0
增强版代码审查服务 - 添加SQL注入、XSS、硬编码密钥检测

新增检测规则:
1. SQL注入检测 - 识别危险的SQL拼接
2. XSS漏洞检测 - 发现反射型和存储型XSS
3. 硬编码密钥检测 - 扫描API密钥、密码等
4. 敏感信息泄露 - 检测日志中的敏感数据
5. 不安全的反序列化 - pickle, yaml等
6. 路径遍历 - 文件操作安全检查
7. 命令注入 - system, exec等危险调用
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import re
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

class Severity(Enum):
    CRITICAL = "critical"    # 可能导致系统被入侵
    HIGH = "high"           # 严重安全问题
    MEDIUM = "medium"       # 潜在风险
    LOW = "low"             # 建议改进
    INFO = "info"           # 信息提示

class Category(Enum):
    SECURITY = "security"
    PERFORMANCE = "performance"
    STYLE = "style"
    MAINTAINABILITY = "maintainability"
    BEST_PRACTICE = "best_practice"

@dataclass
class Issue:
    severity: Severity
    category: Category
    rule_id: str
    description: str
    suggestion: str
    line_number: int = 0
    code_snippet: str = ""
    confidence: str = "medium"  # low, medium, high
    
    def to_dict(self) -> Dict:
        return {
            "severity": self.severity.value,
            "category": self.category.value,
            "rule_id": self.rule_id,
            "description": self.description,
            "suggestion": self.suggestion,
            "line_number": self.line_number,
            "code_snippet": self.code_snippet[:200] if self.code_snippet else "",
            "confidence": self.confidence
        }

class SecurityDetector:
    """安全漏洞检测器"""
    
    # SQL注入模式
    SQL_INJECTION_PATTERNS = [
        (r'execute\s*\(\s*["\'].*%s.*["\']\s*%', "字符串格式化SQL"),
        (r'execute\s*\(\s*f["\'].*\{.*\}.*["\']', "f-string SQL"),
        (r'\.format\s*\(.*\).*["\'].*SELECT|INSERT|UPDATE|DELETE', "format SQL"),
        (r'\+.*["\'].*SELECT|INSERT|UPDATE|DELETE', "字符串拼接SQL"),
        (r'execute\s*\(\s*["\'].*\$\{.*\}.*["\']', "模板字符串SQL (JS)"),
    ]
    
    # XSS模式
    XSS_PATTERNS = [
        (r'innerHTML\s*=\s*', "危险的innerHTML赋值"),
        (r'document\.write\s*\(', "document.write XSS风险"),
        (r'eval\s*\(', "eval XSS风险"),
        (r'\$\s*\(.*\)\.html\s*\(', "jQuery html() XSS"),
        (r'response\.send\s*\(.*\+', "Express 反射型XSS"),
        (r'render\s*\([^,]+,\s*\{.*:', "模板注入风险"),
    ]
    
    # 硬编码密钥模式
    SECRET_PATTERNS = [
        (r'api[_-]?key\s*[=:]\s*["\'][a-zA-Z0-9]{16,}["\']', "硬编码API Key", 0.9),
        (r'secret[_-]?key\s*[=:]\s*["\'][a-zA-Z0-9]{16,}["\']', "硬编码Secret Key", 0.95),
        (r'password\s*[=:]\s*["\'][^"\']{4,}["\']', "硬编码密码", 0.9),
        (r'token\s*[=:]\s*["\'][a-zA-Z0-9-_]{20,}["\']', "硬编码Token", 0.85),
        (r'aws_access_key_id\s*[=:]\s*["\'][^"\']+["\']', "AWS Access Key", 0.95),
        (r'aws_secret_access_key\s*[=:]\s*["\'][^"\']+["\']', "AWS Secret Key", 0.95),
        (r'private[_-]?key\s*[=:]\s*["\'][^"\']+["\']', "硬编码私钥", 0.95),
        (r'sk-[a-zA-Z0-9]{20,}', "OpenAI API Key格式", 0.9),
        (r'ghp_[a-zA-Z0-9]{36}', "GitHub Personal Token格式", 0.9),
        (r'sghr_[a-zA-Z0-9]{36}', "GitHub Repository Token格式", 0.9),
    ]
    
    # 命令注入模式
    COMMAND_INJECTION_PATTERNS = [
        (r'os\.system\s*\(', "os.system命令注入"),
        (r'subprocess\.call\s*\(\s*[^[]', "subprocess.call shell注入"),
        (r'subprocess\.run\s*\(\s*[^[]', "subprocess.run shell注入"),
        (r'exec\s*\(', "exec命令注入"),
        (r'child_process', "Node.js命令执行"),
    ]
    
    # 路径遍历模式
    PATH_TRAVERSAL_PATTERNS = [
        (r'open\s*\(\s*[^)]+\+', "文件路径拼接"),
        (r'readFile\s*\(.*\+', "读取拼接路径"),
        (r'sendFile\s*\(.*req\.', "Express sendFile路径遍历"),
        (r'\.\./', "相对路径遍历", 0.7),
    ]
    
    # 不安全反序列化
    DESERIALIZATION_PATTERNS = [
        (r'pickle\.loads?\s*\(', "pickle反序列化漏洞"),
        (r'yaml\.load\s*\([^)]*\)(?!.*Loader)', "yaml.load不安全使用"),
        (r'unserialize\s*\(', "PHP反序列化"),
        (r'JSON\.parse\s*\(.*req\.', "JSON解析未验证"),
    ]
    
    # 敏感日志
    SENSITIVE_LOGGING_PATTERNS = [
        (r'console\.log\s*\(.*password|token|secret|key', "日志泄露敏感信息"),
        (r'print\s*\(.*password|token|secret|key', "打印敏感信息"),
        (r'logger\..*\(.*password|token|secret|key', "日志记录敏感信息"),
    ]
    
    def __init__(self):
        self.issues: List[Issue] = []
    
    def detect(self, code: str, filename: str = "") -> List[Issue]:
        """运行所有安全检测"""
        self.issues = []
        lines = code.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            self._check_sql_injection(line, line_num)
            self._check_xss(line, line_num)
            self._check_hardcoded_secrets(line, line_num)
            self._check_command_injection(line, line_num)
            self._check_path_traversal(line, line_num)
            self._check_deserialization(line, line_num)
            self._check_sensitive_logging(line, line_num)
        
        # 整文件检查
        self._check_dangerous_functions(code)
        self._check_crypto_issues(code)
        
        return self.issues
    
    def _check_sql_injection(self, line: str, line_num: int):
        """检测SQL注入"""
        for pattern, desc in self.SQL_INJECTION_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                self.issues.append(Issue(
                    severity=Severity.CRITICAL,
                    category=Category.SECURITY,
                    rule_id="SQL_INJECTION",
                    description=f"Potential SQL injection: {desc}",
                    suggestion="Use parameterized queries (prepared statements) instead of string concatenation",
                    line_number=line_num,
                    code_snippet=line.strip(),
                    confidence="high"
                ))
    
    def _check_xss(self, line: str, line_num: int):
        """检测XSS漏洞"""
        for pattern, desc in self.XSS_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                self.issues.append(Issue(
                    severity=Severity.HIGH,
                    category=Category.SECURITY,
                    rule_id="XSS_VULNERABILITY",
                    description=f"Potential XSS vulnerability: {desc}",
                    suggestion="Use textContent instead of innerHTML, sanitize user input with DOMPurify or similar",
                    line_number=line_num,
                    code_snippet=line.strip(),
                    confidence="high"
                ))
    
    def _check_hardcoded_secrets(self, line: str, line_num: int):
        """检测硬编码密钥"""
        for pattern, desc, confidence_score in self.SECRET_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                # 排除注释和示例
                stripped = line.strip()
                if stripped.startswith('#') or stripped.startswith('//') or 'example' in line.lower():
                    continue
                    
                self.issues.append(Issue(
                    severity=Severity.CRITICAL,
                    category=Category.SECURITY,
                    rule_id="HARDCODED_SECRET",
                    description=f"Hardcoded secret detected: {desc}",
                    suggestion="Use environment variables, secret managers (AWS Secrets Manager, HashiCorp Vault), or config files excluded from git",
                    line_number=line_num,
                    code_snippet=re.sub(r'["\'][^"\']{4,}["\']', '"***REDACTED***"', line.strip()),
                    confidence="high" if confidence_score > 0.9 else "medium"
                ))
    
    def _check_command_injection(self, line: str, line_num: int):
        """检测命令注入"""
        for pattern, desc in self.COMMAND_INJECTION_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                self.issues.append(Issue(
                    severity=Severity.CRITICAL,
                    category=Category.SECURITY,
                    rule_id="COMMAND_INJECTION",
                    description=f"Potential command injection: {desc}",
                    suggestion="Avoid shell=True, use argument lists. Never pass user input directly to system commands",
                    line_number=line_num,
                    code_snippet=line.strip(),
                    confidence="high"
                ))
    
    def _check_path_traversal(self, line: str, line_num: int):
        """检测路径遍历"""
        for pattern, desc in self.PATH_TRAVERSAL_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                self.issues.append(Issue(
                    severity=Severity.HIGH,
                    category=Category.SECURITY,
                    rule_id="PATH_TRAVERSAL",
                    description=f"Potential path traversal: {desc}",
                    suggestion="Validate and sanitize file paths, use allowlists for permitted directories",
                    line_number=line_num,
                    code_snippet=line.strip(),
                    confidence="medium"
                ))
    
    def _check_deserialization(self, line: str, line_num: int):
        """检测不安全反序列化"""
        for pattern, desc in self.DESERIALIZATION_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                self.issues.append(Issue(
                    severity=Severity.HIGH,
                    category=Category.SECURITY,
                    rule_id="UNSAFE_DESERIALIZATION",
                    description=desc,
                    suggestion="Use yaml.safe_load(), avoid pickle for untrusted data, validate input before deserialization",
                    line_number=line_num,
                    code_snippet=line.strip(),
                    confidence="high"
                ))
    
    def _check_sensitive_logging(self, line: str, line_num: int):
        """检测敏感信息日志"""
        for pattern, desc in self.SENSITIVE_LOGGING_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                self.issues.append(Issue(
                    severity=Severity.MEDIUM,
                    category=Category.SECURITY,
                    rule_id="SENSITIVE_DATA_LOGGING",
                    description=desc,
                    suggestion="Never log passwords, tokens, or secrets. Use structured logging with PII redaction",
                    line_number=line_num,
                    code_snippet=line.strip(),
                    confidence="medium"
                ))
    
    def _check_dangerous_functions(self, code: str):
        """检查危险函数"""
        dangerous_funcs = [
            ('eval\s*\(', "Use of eval()", Severity.CRITICAL),
            ('exec\s*\(', "Use of exec()", Severity.CRITICAL),
            ('__import__\s*\(', "Dynamic import", Severity.MEDIUM),
        ]
        
        lines = code.split('\n')
        for line_num, line in enumerate(lines, 1):
            for pattern, desc, severity in dangerous_funcs:
                if re.search(pattern, line) and not line.strip().startswith('#'):
                    self.issues.append(Issue(
                        severity=severity,
                        category=Category.SECURITY,
                        rule_id="DANGEROUS_FUNCTION",
                        description=desc,
                        suggestion="Avoid these functions. Use safer alternatives like ast.literal_eval()",
                        line_number=line_num,
                        code_snippet=line.strip(),
                        confidence="high"
                    ))
    
    def _check_crypto_issues(self, code: str):
        """检查加密问题"""
        weak_crypto_patterns = [
            ('md5', "MD5 is cryptographically broken", Severity.HIGH),
            ('sha1', "SHA1 is deprecated for security use", Severity.MEDIUM),
            ('DES', "DES is insecure", Severity.CRITICAL),
            ('ECB', "ECB mode is insecure", Severity.HIGH),
            ('random\.random', "Not cryptographically secure", Severity.HIGH),
        ]
        
        lines = code.split('\n')
        for line_num, line in enumerate(lines, 1):
            for pattern, desc, severity in weak_crypto_patterns:
                if re.search(rf'\b{pattern}\b', line, re.IGNORECASE):
                    self.issues.append(Issue(
                        severity=severity,
                        category=Category.SECURITY,
                        rule_id="WEAK_CRYPTOGRAPHY",
                        description=desc,
                        suggestion="Use modern algorithms: SHA-256+, AES-GCM, ChaCha20-Poly1305. Use secrets module for randomness",
                        line_number=line_num,
                        code_snippet=line.strip(),
                        confidence="high"
                    ))

class PerformanceDetector:
    """性能问题检测器"""
    
    def detect(self, code: str) -> List[Issue]:
        issues = []
        lines = code.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            # N+1查询检测
            if re.search(r'for.*in.*:\s*\n.*\.filter\(|\.get\(', line):
                issues.append(Issue(
                    severity=Severity.MEDIUM,
                    category=Category.PERFORMANCE,
                    rule_id="N_PLUS_ONE_QUERY",
                    description="Potential N+1 query problem",
                    suggestion="Use select_related() or prefetch_related() in Django ORM, or JOIN queries in SQL",
                    line_number=line_num,
                    code_snippet=line.strip()
                ))
            
            # 重复字符串拼接
            if re.search(r'\+=.*["\']', line) and 'for' in code[:sum(len(l) for l in lines[:line_num])]:
                issues.append(Issue(
                    severity=Severity.LOW,
                    category=Category.PERFORMANCE,
                    rule_id="INEFFICIENT_STRING_CONCAT",
                    description="Inefficient string concatenation in loop",
                    suggestion="Use list.join() or StringBuilder instead of += in loops",
                    line_number=line_num,
                    code_snippet=line.strip()
                ))
        
        # 文件长度检查
        if len(lines) > 500:
            issues.append(Issue(
                severity=Severity.LOW,
                category=Category.MAINTAINABILITY,
                rule_id="FILE_TOO_LONG",
                description=f"File is quite long ({len(lines)} lines)",
                suggestion="Consider splitting into smaller modules (recommended: <300 lines per file)",
                confidence="info"
            ))
        
        return issues

class StyleDetector:
    """代码风格检测器"""
    
    def detect(self, code: str) -> List[Issue]:
        issues = []
        lines = code.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            # 行长度检查
            if len(line) > 120:
                issues.append(Issue(
                    severity=Severity.LOW,
                    category=Category.STYLE,
                    rule_id="LINE_TOO_LONG",
                    description=f"Line is too long ({len(line)} chars)",
                    suggestion="Keep lines under 120 characters (PEP 8 recommends 79)",
                    line_number=line_num,
                    code_snippet=line[:100] + "..."
                ))
            
            # 尾随空格
            if line.rstrip() != line:
                issues.append(Issue(
                    severity=Severity.INFO,
                    category=Category.STYLE,
                    rule_id="TRAILING_WHITESPACE",
                    description="Trailing whitespace",
                    suggestion="Remove trailing whitespace",
                    line_number=line_num
                ))
            
            # TODO注释
            if re.search(r'#\s*TODO|//\s*TODO', line, re.IGNORECASE):
                issues.append(Issue(
                    severity=Severity.INFO,
                    category=Category.MAINTAINABILITY,
                    rule_id="TODO_COMMENT",
                    description="TODO comment found",
                    suggestion="Consider creating an issue ticket instead of leaving TODOs in code",
                    line_number=line_num,
                    code_snippet=line.strip()
                ))
        
        return issues

class EnhancedCodeReviewService:
    """增强版代码审查服务"""
    
    def __init__(self):
        self.security_detector = SecurityDetector()
        self.performance_detector = PerformanceDetector()
        self.style_detector = StyleDetector()
    
    def review(self, code: str, filename: str = "") -> Dict[str, Any]:
        """执行完整代码审查"""
        all_issues = []
        
        # 运行所有检测器
        all_issues.extend(self.security_detector.detect(code, filename))
        all_issues.extend(self.performance_detector.detect(code))
        all_issues.extend(self.style_detector.detect(code))
        
        # 去重（基于规则ID和行号）
        unique_issues = {}
        for issue in all_issues:
            key = f"{issue.rule_id}:{issue.line_number}"
            if key not in unique_issues:
                unique_issues[key] = issue
        
        issues = list(unique_issues.values())
        
        # 计算得分
        severity_weights = {
            Severity.CRITICAL: 25,
            Severity.HIGH: 15,
            Severity.MEDIUM: 8,
            Severity.LOW: 3,
            Severity.INFO: 0
        }
        
        total_penalty = sum(severity_weights.get(i.severity, 0) for i in issues)
        base_score = 100
        score = max(0, base_score - total_penalty)
        
        # 确定等级
        if score >= 90:
            grade = "A"
            status = "Excellent"
        elif score >= 80:
            grade = "B"
            status = "Good"
        elif score >= 70:
            grade = "C"
            status = "Acceptable"
        elif score >= 60:
            grade = "D"
            status = "Needs Improvement"
        else:
            grade = "F"
            status = "Critical Issues Found"
        
        # 统计
        severity_counts = {s.value: 0 for s in Severity}
        category_counts = {c.value: 0 for c in Category}
        
        for issue in issues:
            severity_counts[issue.severity.value] += 1
            category_counts[issue.category.value] += 1
        
        # 安全建议汇总
        security_summary = self._generate_security_summary(issues)
        
        return {
            "overall_score": score,
            "grade": grade,
            "status": status,
            "issues_found": len(issues),
            "severity_breakdown": severity_counts,
            "category_breakdown": category_counts,
            "security_summary": security_summary,
            "issues": [i.to_dict() for i in sorted(issues, key=lambda x: (
                list(Severity).index(x.severity),
                x.line_number
            ))],
            "summary": f"Found {len(issues)} issues: {severity_counts['critical']} critical, {severity_counts['high']} high, {severity_counts['medium']} medium"
        }
    
    def _generate_security_summary(self, issues: List[Issue]) -> Dict[str, Any]:
        """生成安全摘要"""
        security_issues = [i for i in issues if i.category == Category.SECURITY]
        
        if not security_issues:
            return {
                "risk_level": "Low",
                "has_critical": False,
                "recommendations": ["No security issues found. Keep up the good work!"]
            }
        
        has_critical = any(i.severity == Severity.CRITICAL for i in security_issues)
        
        risk_level = "Critical" if has_critical else "High" if any(
            i.severity == Severity.HIGH for i in security_issues
        ) else "Medium"
        
        # 生成具体建议
        unique_rules = set(i.rule_id for i in security_issues)
        recommendations = []
        
        rule_messages = {
            "SQL_INJECTION": "🚨 Immediately switch to parameterized queries",
            "XSS_VULNERABILITY": "🚨 Sanitize all user input before rendering",
            "HARDCODED_SECRET": "🚨 Move all secrets to environment variables or vault",
            "COMMAND_INJECTION": "🚨 Never pass user input to system commands",
            "PATH_TRAVERSAL": "⚠️  Validate all file paths against allowlists",
            "UNSAFE_DESERIALIZATION": "⚠️  Use safe deserialization methods only",
            "SENSITIVE_DATA_LOGGING": "⚠️  Redact sensitive data from logs",
            "DANGEROUS_FUNCTION": "⚠️  Replace dangerous functions with safe alternatives",
            "WEAK_CRYPTOGRAPHY": "⚠️  Upgrade to modern cryptographic algorithms"
        }
        
        for rule in unique_rules:
            if rule in rule_messages:
                recommendations.append(rule_messages[rule])
        
        return {
            "risk_level": risk_level,
            "has_critical": has_critical,
            "security_issues_count": len(security_issues),
            "critical_rules_found": list(unique_rules),
            "recommendations": recommendations
        }

class CodeReviewHandler(BaseHTTPRequestHandler):
    """HTTP请求处理器"""
    
    service = EnhancedCodeReviewService()
    
    def do_GET(self):
        if self.path == '/health':
            self.send_json({
                "status": "ok",
                "service": "enhanced-code-review-v2",
                "detectors": [
                    "sql_injection",
                    "xss_vulnerability",
                    "hardcoded_secrets",
                    "command_injection",
                    "path_traversal",
                    "unsafe_deserialization",
                    "sensitive_data_logging",
                    "weak_cryptography",
                    "performance",
                    "style"
                ]
            })
        elif self.path == '/':
            self.send_html("""
            <h1>🔒 Enhanced Code Review Service v2.0</h1>
            <p>Security-first code analysis with comprehensive vulnerability detection.</p>
            
            <h3>Security Detectors:</h3>
            <ul>
                <li>🚨 SQL Injection Detection</li>
                <li>🚨 XSS Vulnerability Detection</li>
                <li>🚨 Hardcoded Secrets Detection</li>
                <li>🚨 Command Injection Detection</li>
                <li>⚠️  Path Traversal Detection</li>
                <li>⚠️  Unsafe Deserialization</li>
                <li>⚠️  Sensitive Data Logging</li>
                <li>⚠️  Weak Cryptography</li>
            </ul>
            
            <h3>API Endpoints:</h3>
            <ul>
                <li><code>GET /health</code> - Health check</li>
                <li><code>POST /review</code> - Review code</li>
            </ul>
            
            <h3>Example:</h3>
            <pre>curl -X POST http://localhost:8788/review \\
  -H "Content-Type: application/json" \\
  -d '{"code": "query = f'SELECT * FROM users WHERE id = {user_id}'", "filename": "example.py"}'</pre>
            """)
        else:
            self.send_error(404)
    
    def do_POST(self):
        if self.path == '/review':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                data = json.loads(body)
                code = data.get('code', '')
                filename = data.get('filename', 'unknown')
                
                result = self.service.review(code, filename)
                self.send_json(result)
                
            except json.JSONDecodeError:
                self.send_json({"error": "Invalid JSON"}, status=400)
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
        else:
            self.send_error(404)
    
    def send_json(self, data: dict, status: int = 200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2, ensure_ascii=False).encode())
    
    def send_html(self, html: str):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(html.encode())
    
    def log_message(self, format, *args):
        print(f"[{self.date_time_string()}] {args[0]}")

def main():
    port = 8788
    server = HTTPServer(('0.0.0.0', port), CodeReviewHandler)
    
    print("=" * 60)
    print("🔒 Enhanced Code Review Service v2.0")
    print("=" * 60)
    print(f"📍 Running at: http://localhost:{port}")
    print(f"🔗 Health check: http://localhost:{port}/health")
    print("\nSecurity Detectors:")
    print("  🚨 SQL Injection Detection")
    print("  🚨 XSS Vulnerability Detection")
    print("  🚨 Hardcoded Secrets Detection")
    print("  🚨 Command Injection Detection")
    print("  ⚠️  Path Traversal Detection")
    print("  ⚠️  Unsafe Deserialization")
    print("  ⚠️  Sensitive Data Logging")
    print("  ⚠️  Weak Cryptography")
    print("\nPress Ctrl+C to stop\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")
        sys.exit(0)

if __name__ == "__main__":
    main()
