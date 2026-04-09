#!/bin/bash
# 🔧 修复ai_secure_v2.py脚本
# 在你的Mac执行这个

echo "🛡️ 开始修复Python服务器..."

# 1. 杀死旧进程
echo "1. 杀死旧进程..."
pkill -9 Python 2>/dev/null
sleep 2

# 2. 备份原文件
echo "2. 备份原文件..."
cp ~/ai_secure_v2.py ~/ai_secure_v2.py.bak.$(date +%Y%m%d-%H%M)

# 3. 创建修复后的新文件
echo "3. 创建修复后的代码..."
cat > ~/ai_secure_v2_fixed.py << 'PYTHON_EOF'
#!/usr/bin/env python3
# 🔧 修复版ai_secure服务器

import http.server
import socketserver
import json
import subprocess
import os

PORT = 9999
TOKEN = "Fabio_Secure_999"

class SecureHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # 静默日志
    
    def do_POST(self):
        try:
            # 获取请求内容长度
            content_length = int(self.headers.get('Content-Length', 0))
            
            # 读取请求体
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(post_data)
            
            # 验证Token
            auth_header = self.headers.get('X-Auth-Token', '')
            if auth_header != TOKEN:
                self.send_response(401)
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Unauthorized"}).encode())
                return
            
            # 获取命令
            command = data.get('command', '')
            
            # 执行命令并捕获输出
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=os.path.expanduser('~')  # 在用户主目录执行
            )
            
            # 返回结果
            response = {
                "o": result.stdout,
                "e": result.stderr,
                "rc": result.returncode
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'OK')

# 启动服务器
print(f"🛡️  Secure Server Starting on {PORT}...")
print(f"   Token: {TOKEN}")
print(f"   URL: http://0.0.0.0:{PORT}")
print(f"   Ready for connections!")

with socketserver.TCPServer(("0.0.0.0", PORT), SecureHandler) as httpd:
    httpd.serve_forever()
PYTHON_EOF

# 4. 替换原文件
echo "4. 替换原文件..."
mv ~/ai_secure_v2_fixed.py ~/ai_secure_v2.py

# 5. 启动新服务
echo "5. 启动修复后的服务..."
python3 ~/ai_secure_v2.py &

# 6. 等待启动
sleep 3

# 7. 测试连接
echo "6. 测试连接..."
curl -s -X POST -H "X-Auth-Token: Fabio_Secure_999" \
  http://127.0.0.1:9999/execute \
  -d '{"command":"echo 修复成功!"}'

echo ""
echo "✅ 修复完成！"
echo ""
echo "如果测试返回了结果，说明修复成功！"
echo ""

# 8. 验证端口
echo "7. 验证端口..."
lsof -i :9999
