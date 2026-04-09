#!/bin/bash
# Mac AI 控制通道 - 一键部署
# 执行: chmod +x setup_ai_node.sh && ./setup_ai_node.sh

set -e
PORT=8888
TS_HOST=$(tailscale status --self --json 2>/dev/null | grep -o '"Name":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "🚀 正在部署 AI 控制通道..."

# 1. 清理旧进程
echo "🧹 清理旧进程..."
pkill -f "ai_bridge.py" 2>/dev/null || true
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
sleep 1

# 2. 写入控制服务
echo "📝 安装控制服务..."
cat > /tmp/ai_bridge.py << 'EOF'
#!/usr/bin/env python3
import http.server, json, subprocess, socketserver, os, sys

class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            data = json.loads(self.rfile.read(length).decode())
            cmd = data.get('c', '')
            
            # 执行命令
            result = subprocess.run(
                cmd, 
                shell=True, 
                capture_output=True, 
                text=True, 
                timeout=60,
                cwd=os.path.expanduser('~')
            )
            
            resp = {'o': result.stdout, 'e': result.stderr, 'code': result.returncode}
        except Exception as e:
            resp = {'o': '', 'e': str(e), 'code': -1}
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(resp).encode())
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'ok', 'node': 'mac-ai-node'}).encode())
    
    def log_message(self, *args):
        pass  # 静默日志

print(f"🟢 控制通道启动在 http://0.0.0.0:{os.environ.get('PORT', '8888')}")
httpd = socketserver.TCPServer(('0.0.0.0', int(os.environ.get('PORT', '8888'))), Handler)
httpd.serve_forever()
EOF

# 3. 启动服务（后台保活）
echo "🔌 启动控制通道..."
export PORT=$PORT
nohup python3 /tmp/ai_bridge.py > /tmp/ai_bridge.log 2>&1 &
sleep 2

# 4. 验证本地服务
echo "🔍 验证服务..."
if ! curl -s http://localhost:$PORT > /dev/null; then
    echo "❌ 本地服务启动失败，查看日志:"
    cat /tmp/ai_bridge.log
    exit 1
fi

# 5. 配置 Tailscale Funnel
echo "🌐 配置外网访问..."
tailscale funnel --https off 2>/dev/null || true
tailscale funnel --bg $PORT

# 6. 获取公网地址
echo "🎯 部署完成！"
echo ""
echo "=========================================="
echo "📍 公网地址: https://${TS_HOST}.tail284095.ts.net"
echo "📍 本地地址: http://localhost:$PORT"
echo "📍 局域网地址: http://$(ifconfig | grep "inet " | grep -v 127 | head -1 | awk '{print $2}'):$PORT"
echo "=========================================="
echo ""
echo "✅ AI 现在可以控制这台 Mac"
echo "📋 快捷命令已写入 ~/.ai_node"

# 7. 写入快捷命令
cat > ~/.ai_node << EOF
#!/bin/bash
# AI 节点控制快捷命令

case "\$1" in
    start)
        nohup python3 /tmp/ai_bridge.py > /tmp/ai_bridge.log 2>&1 &
        tailscale funnel --bg $PORT
        echo "✅ 已启动"
        ;;
    stop)
        pkill -f ai_bridge.py
        tailscale funnel --https off
        echo "🛑 已停止"
        ;;
    status)
        curl -s http://localhost:$PORT && echo "✅ 运行中" || echo "❌ 已停止"
        ;;
    url)
        echo "https://${TS_HOST}.tail284095.ts.net"
        ;;
    *)
        echo "用法: source ~/.ai_node [start|stop|status|url]"
        ;;
esac
EOF

chmod +x ~/.ai_node
