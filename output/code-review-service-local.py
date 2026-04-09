#!/usr/bin/env python3
"""
Local Code Review Service
本地代码审查服务 - 无需部署，直接运行
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import subprocess
import sys
from pathlib import Path

# 添加 crewai 路径
sys.path.insert(0, '/root/.openclaw/workspace/output/multi-agent-research')

class CodeReviewHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """处理GET请求"""
        if self.path == '/health':
            self.send_json({"status": "ok", "service": "code-review-local"})
        elif self.path == '/':
            self.send_html("""
            <h1>Code Review Service (Local)</h1>
            <p>Endpoints:</p>
            <ul>
                <li><a href="/health">/health</a> - Health check</li>
                <li>POST /review - Review code</li>
            </ul>
            """)
        else:
            self.send_error(404)
    
    def do_POST(self):
        """处理POST请求"""
        if self.path == '/review':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                data = json.loads(body)
                code = data.get('code', '')
                
                # 简化的代码审查（模拟）
                result = self.simple_review(code)
                self.send_json(result)
                
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
        else:
            self.send_error(404)
    
    def simple_review(self, code: str) -> dict:
        """简化版代码审查"""
        issues = []
        
        # 安全检查
        if "eval(" in code or "exec(" in code:
            issues.append({
                "severity": "critical",
                "category": "security",
                "description": "Use of eval()/exec() is dangerous",
                "suggestion": "Use ast.literal_eval() or json.loads() instead"
            })
        
        # 性能检查
        lines = code.split('\n')
        if len(lines) > 100:
            issues.append({
                "severity": "medium",
                "category": "performance",
                "description": f"File is quite long ({len(lines)} lines)",
                "suggestion": "Consider splitting into smaller modules"
            })
        
        # 风格检查
        for i, line in enumerate(lines, 1):
            if len(line) > 120:
                issues.append({
                    "severity": "low",
                    "category": "style",
                    "description": f"Line {i} is too long ({len(line)} chars)",
                    "suggestion": "Keep lines under 120 characters"
                })
        
        return {
            "overall_score": max(0, 100 - len(issues) * 10),
            "issues_found": len(issues),
            "issues": issues,
            "summary": f"Found {len(issues)} issues in {len(lines)} lines of code"
        }
    
    def send_json(self, data: dict, status: int = 200):
        """发送JSON响应"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode())
    
    def send_html(self, html: str):
        """发送HTML响应"""
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(html.encode())
    
    def log_message(self, format, *args):
        """自定义日志"""
        print(f"[{self.date_time_string()}] {args[0]}")

def main():
    """主函数"""
    port = 8787
    server = HTTPServer(('0.0.0.0', port), CodeReviewHandler)
    
    print(f"🚀 Code Review Service (Local)")
    print(f"📍 Running at: http://localhost:{port}")
    print(f"🔗 Health check: http://localhost:{port}/health")
    print(f"📝 POST review: curl -X POST http://localhost:{port}/review -d '{{\"code\":\"print(1)\"}}'")
    print("\nPress Ctrl+C to stop\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")
        sys.exit(0)

if __name__ == "__main__":
    main()
