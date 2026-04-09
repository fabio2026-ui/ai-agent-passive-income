#!/bin/bash
# 🔧 API修复脚本 - 解决返回空结果问题

echo "🛠️ 修复AI Secure API..."

# 创建修复版本的Python服务器
cat > ~/ai_secure_fixed.py << 'ENDOFFILE'
#!/usr/bin/env python3
import http.server
import socketserver
import json
import subprocess
import os
import sys

PORT = 9999
TOKEN = "Fabio_Secure_999"

class SecureHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # 记录到文件
        with open('/tmp/ai_secure.log', 'a') as f:
            f.write(f"{format % args}\n")
    
    def do_POST(self):
        try:
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"error": "No data"}).encode())
                return
            
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            # 解析JSON
            try:
                data = json.loads(post_data)
            except json.JSONDecodeError:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
                return
            
            # 验证Token
            auth_header = self.headers.get('X-Auth-Token', '')
            if auth_header != TOKEN:
                self.send_response(401)
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Unauthorized", "token_received": auth_header}).encode())
                return
            
            # 获取命令
            command = data.get('command', '')
            if not command:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"error": "No command"}).encode())
                return
            
            # 记录命令
            with open('/tmp/ai_secure.log', 'a') as f:
                f.write(f"Executing: {command}\n")
            
            # 执行命令 - 关键修复：使用Popen获取实时输出
            process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=os.path.expanduser('~')
            )
            
            # 等待完成，设置超时
            try:
                stdout, stderr = process.communicate(timeout=30)
            except subprocess.TimeoutExpired:
                process.kill()
                stdout, stderr = process.communicate()
                self.send_response(408)
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Timeout", "o": stdout, "e": stderr}).encode())
                return
            
            # 返回结果
            response = {
                "o": stdout if stdout else "",
                "e": stderr if stderr else "",
                "rc": process.returncode
            }
            
            # 记录结果
            with open('/tmp/ai_secure.log', 'a') as f:
                f.write(f"Result: {response}\n")
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            self.wfile.flush()
            
        except Exception as e:
            import traceback
            error_msg = traceback.format_exc()
            with open('/tmp/ai_secure.log', 'a') as f:
                f.write(f"Error: {error_msg}\n")
            
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e), "traceback": error_msg}).encode())
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'AI Secure Server Running')

# 启动服务器
if __name__ == "__main__":
    print(f"🛡️  AI Secure Server Starting on {PORT}...")
    print(f"   Token: {TOKEN}")
    print(f"   Log: /tmp/ai_secure.log")
    
    try:
        with socketserver.TCPServer(("0.0.0.0", PORT), SecureHandler) as httpd:
            print("✅ Server ready!")
            httpd.serve_forever()
    except OSError as e:
        print(f"❌ Error: {e}")
        print("Port 9999 may be in use. Kill existing process first.")
        sys.exit(1)
ENDOFFILE

# 杀死旧进程
echo "1. 杀死旧进程..."
pkill -9 Python 2>/dev/null
sleep 2

# 备份旧文件
mv ~/ai_secure_v2.py ~/ai_secure_v2.old.py 2>/dev/null

# 使用新文件
mv ~/ai_secure_fixed.py ~/ai_secure_v2.py
chmod +x ~/ai_secure_v2.py

# 启动服务
echo "2. 启动修复后的服务..."
nohup python3 ~/ai_secure_v2.py > /tmp/ai_secure.out 2>&1 &
sleep 3

# 检查进程
echo "3. 检查进程..."
ps aux | grep ai_secure | grep -v grep

# 测试本地连接
echo "4. 测试本地连接..."
curl -s -X POST -H "X-Auth-Token: Fabio_Secure_999" \
  http://127.0.0.1:9999/execute \
  -d '{"command":"echo API修复成功"}'

echo ""
echo "5. 检查日志..."
tail -5 /tmp/ai_secure.log 2>/dev/null || echo "日志尚未生成"

echo ""
echo "✅ 修复完成！"
