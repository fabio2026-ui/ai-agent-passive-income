#!/usr/bin/env python3
"""
Enhanced Code Review Service
增强版代码审查服务 - 更多检测规则
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import re
import sys
from pathlib import Path

class EnhancedCodeReviewHandler(BaseHTTPRequestHandler):
    """增强版代码审查处理器"""
    
    def do_GET(self):
        if self.path == '/health':
            self.send_json({
                "status": "ok", 
                "service": "code-review-enhanced",
                "version": "2.0",
                "features": ["security", "performance", "style", "sql-injection", "xss", "secrets"]
            })
        elif self.path == '/':
            self.send_html("""
            <h1>🔍 Enhanced Code Review Service</h1>
            <h2>Features:</h2>
            <ul>
                <li>🔒 Security Analysis (eval, exec, SQL injection)</li>
                <li>⚡ Performance Checks (complexity, length)</li>
                <li>🎨 Style Review (PEP8, line length)</li>
                <li>🔑 Secret Detection (API keys, passwords)</li>
                <li>🛡️ XSS Prevention</li>
            </ul>
            <p><strong>POST /review</strong> to analyze code</p>
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
                language = data.get('language', 'python')
                
                result = self.enhanced_review(code, language)
                self.send_json(result)
                
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
        else:
            self.send_error(404)
    
    def enhanced_review(self, code: str, language: str) -> dict:
        """增强版代码审查"""
        all_issues = []
        
        # 1. 安全检查
        all_issues.extend(self.check_security(code))
        
        # 2. SQL注入检查
        all_issues.extend(self.check_sql_injection(code))
        
        # 3. XSS检查
        all_issues.extend(self.check_xss(code))
        
        # 4. 硬编码密钥检查
        all_issues.extend(self.check_hardcoded_secrets(code))
        
        # 5. 性能检查
        all_issues.extend(self.check_performance(code))
        
        # 6. 风格检查
        all_issues.extend(self.check_style(code))
        
        # 计算分数
        score = max(0, 100 - len(all_issues) * 5)
        
        # 按严重程度排序
        severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        all_issues.sort(key=lambda x: severity_order.get(x['severity'], 4))
        
        return {
            "overall_score": score,
            "grade": self.get_grade(score),
            "issues_found": len(all_issues),
            "critical": len([i for i in all_issues if i['severity'] == 'critical']),
            "high": len([i for i in all_issues if i['severity'] == 'high']),
            "medium": len([i for i in all_issues if i['severity'] == 'medium']),
            "low": len([i for i in all_issues if i['severity'] == 'low']),
            "issues": all_issues[:20],  # 最多返回20个
            "summary": self.generate_summary(all_issues),
            "recommendations": self.generate_recommendations(all_issues)
        }
    
    def check_security(self, code: str) -> list:
        """安全检查"""
        issues = []
        
        dangerous_functions = [
            (r'\beval\s*\(', 'eval() is dangerous', 'Use ast.literal_eval() or json.loads()'),
            (r'\bexec\s*\(', 'exec() is dangerous', 'Avoid dynamic code execution'),
            (r'\bos\.system\s*\(', 'os.system() is unsafe', 'Use subprocess.run() with proper sanitization'),
            (r'\bsubprocess\.call\s*\([^)]*shell\s*=\s*True', 'shell=True is dangerous', 'Avoid shell=True, pass list instead'),
            (r'\bpickle\.loads?\s*\(', 'pickle is insecure for untrusted data', 'Use json or MessagePack'),
            (r'\byaml\.load\s*\([^)]*\)', 'yaml.load() is unsafe', 'Use yaml.safe_load()'),
        ]
        
        for pattern, description, suggestion in dangerous_functions:
            for match in re.finditer(pattern, code, re.IGNORECASE):
                line_num = code[:match.start()].count('\n') + 1
                issues.append({
                    "severity": "critical",
                    "category": "security",
                    "line": line_num,
                    "description": description,
                    "suggestion": suggestion,
                    "code": match.group()[:50]
                })
        
        return issues
    
    def check_sql_injection(self, code: str) -> list:
        """SQL注入检查"""
        issues = []
        
        # 检测字符串拼接SQL
        sql_patterns = [
            (r'["\']\s*SELECT\s+.+\s+FROM\s+.+\s*["\']\s*\+', 'Possible SQL injection via string concatenation'),
            (r'["\']\s*INSERT\s+INTO\s+.+\s*["\']\s*\+', 'Possible SQL injection via string concatenation'),
            (r'["\']\s*UPDATE\s+.+\s+SET\s+.+\s*["\']\s*\+', 'Possible SQL injection via string concatenation'),
            (r'["\']\s*DELETE\s+FROM\s+.+\s*["\']\s*\+', 'Possible SQL injection via string concatenation'),
            (r'\.format\s*\([^)]*\)\s*.*[Ss][Qq][Ll]', 'SQL query using .format()'),
            (r'%\s*\([^)]*\)\s*.*[Ss][Qq][Ll]', 'SQL query using % formatting'),
            (r'f["\'].*SELECT\s+.+\s+FROM\s+.+\s*["\']', 'SQL query using f-string (potential injection)'),
        ]
        
        for pattern, description in sql_patterns:
            for match in re.finditer(pattern, code, re.IGNORECASE):
                line_num = code[:match.start()].count('\n') + 1
                issues.append({
                    "severity": "critical",
                    "category": "sql-injection",
                    "line": line_num,
                    "description": description,
                    "suggestion": "Use parameterized queries or ORM",
                    "code": match.group()[:50]
                })
        
        return issues
    
    def check_xss(self, code: str) -> list:
        """XSS检查"""
        issues = []
        
        xss_patterns = [
            (r'\.innerHTML\s*=\s*[^"\']', 'Potential XSS via innerHTML'),
            (r'\.outerHTML\s*=\s*[^"\']', 'Potential XSS via outerHTML'),
            (r'document\.write\s*\(', 'Potential XSS via document.write'),
            (r'eval\s*\(', 'XSS via eval'),
        ]
        
        for pattern, description in xss_patterns:
            for match in re.finditer(pattern, code, re.IGNORECASE):
                line_num = code[:match.start()].count('\n') + 1
                issues.append({
                    "severity": "high",
                    "category": "xss",
                    "line": line_num,
                    "description": description,
                    "suggestion": "Use textContent instead of innerHTML, sanitize user input",
                    "code": match.group()[:50]
                })
        
        return issues
    
    def check_hardcoded_secrets(self, code: str) -> list:
        """硬编码密钥检查"""
        issues = []
        
        secret_patterns = [
            (r'[Aa][Pp][Ii][_-]?[Kk][Ee][Yy]\s*[=:]\s*["\'][a-zA-Z0-9]{16,}["\']', 'Hardcoded API key'),
            (r'[Ss][Ee][Cc][Rr][Ee][Tt]\s*[=:]\s*["\'][^"\']{8,}["\']', 'Hardcoded secret'),
            (r'[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd]\s*[=:]\s*["\'][^"\']+["\']', 'Hardcoded password'),
            (r'[Tt][Oo][Kk][Ee][Nn]\s*[=:]\s*["\'][a-zA-Z0-9]{20,}["\']', 'Hardcoded token'),
            (r'sk-[a-zA-Z0-9]{20,}', 'OpenAI API key pattern'),
            (r'ghp_[a-zA-Z0-9]{36}', 'GitHub personal access token'),
            (r'AKIA[0-9A-Z]{16}', 'AWS Access Key ID'),
        ]
        
        for pattern, description in secret_patterns:
            for match in re.finditer(pattern, code):
                line_num = code[:match.start()].count('\n') + 1
                issues.append({
                    "severity": "critical",
                    "category": "secrets",
                    "line": line_num,
                    "description": description,
                    "suggestion": "Use environment variables or secret management service",
                    "code": "***HIDDEN***"  # 不显示实际密钥
                })
        
        return issues
    
    def check_performance(self, code: str) -> list:
        """性能检查"""
        issues = []
        lines = code.split('\n')
        
        # 文件长度
        if len(lines) > 500:
            issues.append({
                "severity": "medium",
                "category": "performance",
                "line": 1,
                "description": f"File is very long ({len(lines)} lines)",
                "suggestion": "Consider splitting into smaller modules"
            })
        
        # 嵌套循环检测
        nested_loops = re.finditer(r'(for|while).*:.*\n.*(for|while).*:.*\n.*(for|while)', code)
        for match in nested_loops:
            line_num = code[:match.start()].count('\n') + 1
            issues.append({
                "severity": "medium",
                "category": "performance",
                "line": line_num,
                "description": "Deeply nested loops detected (O(n³) complexity)",
                "suggestion": "Consider optimizing algorithm or using vectorization"
            })
        
        return issues
    
    def check_style(self, code: str) -> list:
        """风格检查"""
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            # 行长度
            if len(line) > 120:
                issues.append({
                    "severity": "low",
                    "category": "style",
                    "line": i,
                    "description": f"Line too long ({len(line)} > 120 chars)",
                    "suggestion": "Break into multiple lines"
                })
            
            # 尾部空格
            if line.rstrip() != line:
                issues.append({
                    "severity": "low",
                    "category": "style",
                    "line": i,
                    "description": "Trailing whitespace",
                    "suggestion": "Remove trailing spaces"
                })
        
        return issues
    
    def get_grade(self, score: int) -> str:
        """获取等级"""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    def generate_summary(self, issues: list) -> str:
        """生成总结"""
        if not issues:
            return "✅ No issues found! Your code looks great."
        
        critical = len([i for i in issues if i['severity'] == 'critical'])
        if critical > 0:
            return f"⚠️  Found {critical} critical issues that need immediate attention!"
        
        return f"Found {len(issues)} issues. Review and fix recommended."
    
    def generate_recommendations(self, issues: list) -> list:
        """生成建议"""
        recommendations = []
        
        categories = set(i['category'] for i in issues)
        
        if 'security' in categories:
            recommendations.append("🔒 Review and fix security vulnerabilities immediately")
        if 'sql-injection' in categories:
            recommendations.append("🗄️  Use parameterized queries to prevent SQL injection")
        if 'secrets' in categories:
            recommendations.append("🔑 Move hardcoded secrets to environment variables")
        if 'xss' in categories:
            recommendations.append("🛡️  Sanitize user input to prevent XSS attacks")
        if 'performance' in categories:
            recommendations.append("⚡ Consider optimizing performance bottlenecks")
        if 'style' in categories:
            recommendations.append("🎨 Run a linter to fix style issues automatically")
        
        return recommendations
    
    def send_json(self, data: dict, status: int = 200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode())
    
    def send_html(self, html: str):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(html.encode())
    
    def log_message(self, format, *args):
        print(f"[{self.date_time_string()}] {args[0]}")

def main():
    port = 8788
    server = HTTPServer(('0.0.0.0', port), EnhancedCodeReviewHandler)
    
    print(f"🚀 Enhanced Code Review Service v2.0")
    print(f"📍 http://localhost:{port}")
    print(f"🔍 Enhanced features: SQL injection, XSS, Secrets detection")
    print("\nPress Ctrl+C to stop\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")

if __name__ == "__main__":
    main()
