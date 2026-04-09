#!/usr/bin/env python3
"""
AI控制服务器 - 安全版 v3.0
带密码保护和命令过滤
"""
import http.server, json, subprocess, socketserver, base64

# ⚠️ 修改这里设置强密码
AUTH_PASSWORD = "FabioAI2024!@#"

class SecureHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. 检查认证
        auth = self.headers.get('Authorization', '')
        if not self.check_auth(auth):
            self.send_response(401)
            self.send_header('WWW-Authenticate', 'Basic realm="AI Control"')
            self.end_headers()
            self.wfile.write(b'Unauthorized - Wrong Password')
            return
        
        try:
            l = int(self.headers.get('Content-Length', 0))
            d = json.loads(self.rfile.read(l))
            cmd = d.get('c', '')
            
            # 2. 危险命令拦截
            blocked_keywords = [
                'rm -rf /', 'mkfs', 'dd if=/dev/zero',
                'shutdown', 'reboot', 'poweroff', 'halt',
                '> /dev/sda', 'format', ':(){:|:&};:'
            ]
            for keyword in blocked_keywords:
                if keyword in cmd.lower():
                    self.send_response(403)
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'e': f'🚫 危险命令被拦截: {keyword}'
                    }).encode())
                    return
            
            # 3. 执行命令
            result = subprocess.run(
                cmd, shell=True, capture_output=True, 
                text=True, timeout=30
            )
            resp = {
                'o': result.stdout, 
                'e': result.stderr, 
                'code': result.returncode
            }
        except Exception as e:
            resp = {'o': '', 'e': str(e), 'code': -1}
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(resp).encode())
    
    def check_auth(self, auth_header):
        if not auth_header.startswith('Basic '):
            return False
        try:
            creds = base64.b64decode(auth_header[6:]).decode()
            # 格式: admin:密码
            return creds == f"admin:{AUTH_PASSWORD}"
        except:
            return False
    
    def log_message(self, *args):
        pass  # 静默日志

if __name__ == '__main__':
    print("🔒 Secure AI Server running on http://localhost:9999")
    print(f"   Password: {AUTH_PASSWORD}")
    server = socketserver.TCPServer(('0.0.0.0', 9999), SecureHandler)
    server.serve_forever()
