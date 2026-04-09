# AI连接本地电脑 - 完整部署指南

## 方案对比

| 方案 | 稳定性 | 成本 | 难度 | 推荐度 |
|------|--------|------|------|--------|
| **Tailscale Funnel** | ⭐⭐⭐ | 免费 | 低 | ⭐⭐⭐⭐⭐ |
| **Cloudflare Tunnel** | ⭐⭐⭐⭐ | 免费 | 中 | ⭐⭐⭐⭐ |
| **Ngrok** | ⭐⭐ | 免费/付费 | 低 | ⭐⭐ |
| **云服务器+FRP** | ⭐⭐⭐⭐⭐ | ¥50/月 | 中 | ⭐⭐⭐⭐⭐ |

---

## 方案一：Tailscale Funnel（推荐，免费）

### 步骤1：安装 Tailscale
```bash
# macOS
brew install tailscale

# 或下载安装包
https://tailscale.com/download
```

### 步骤2：登录 Tailscale
```bash
# 启动 Tailscale
tailscale up

# 浏览器会打开，用你的账号登录（Google/Microsoft/GitHub）
```

### 步骤3：开启 Funnel（关键步骤）
```bash
# 1. 创建控制通道脚本
cat > ~/ai_node.py << 'EOF'
#!/usr/bin/env python3
import http.server, json, subprocess, socketserver

class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            data = json.loads(self.rfile.read(length).decode())
            cmd = data.get('c', '')
            
            result = subprocess.run(
                cmd, shell=True, capture_output=True, 
                text=True, timeout=60
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
    
    def log_message(self, *args):
        pass

print("🟢 AI控制通道已启动: http://localhost:9999")
httpd = socketserver.TCPServer(('0.0.0.0', 9999), Handler)
httpd.serve_forever()
EOF

# 2. 启动控制通道
chmod +x ~/ai_node.py
python3 ~/ai_node.py &

# 3. 开启 Funnel（暴露到公网）
tailscale funnel --bg 9999

# 4. 获取公网地址
tailscale funnel status | grep https
```

### 步骤4：保持连接（防止断开）
```bash
# 创建保活脚本
cat > ~/keep_alive.sh << 'EOF'
#!/bin/bash
while true; do
    # 检查本地服务
    if ! curl -s http://localhost:9999 > /dev/null; then
        echo "$(date): 重启本地服务"
        pkill -f ai_node.py
        python3 ~/ai_node.py &
    fi
    
    # 检查 funnel
    tailscale funnel status | grep -q "Funnel on" || {
        echo "$(date): 重启 funnel"
        tailscale funnel --bg 9999
    }
    
    sleep 300  # 每5分钟检查一次
done
EOF

chmod +x ~/keep_alive.sh

# 后台运行保活
nohup ~/keep_alive.sh > ~/ai_keep_alive.log 2>&1 &

# 防止 Mac 休眠
caffeinate -d -i -m -s &
```

### 步骤5：给 AI 发送地址
```
执行 tailscale funnel status | grep https
把显示的 https://xxxx.ts.net 发给 AI
```

---

## 方案二：云服务器 + FRP（最稳定）

### 购买云服务器
- 阿里云/腾讯云/华为云
- 配置：1核2G，带宽1Mbps
- 价格：约 ¥50-100/月

### 服务器端（FRP服务端）
```bash
# 下载 FRP
wget https://github.com/fatedier/frp/releases/download/v0.52.3/frp_0.52.3_linux_amd64.tar.gz
tar -xzf frp_0.52.3_linux_amd64.tar.gz
cd frp_0.52.3_linux_amd64

# 创建服务端配置
cat > frps.ini << EOF
[common]
bind_port = 7000
token = your_secure_token_123456
EOF

# 启动服务端
./frps -c frps.ini
```

### 本地 Mac（FRP客户端）
```bash
# 下载 FRP（Mac版）
brew install frpc

# 或手动下载
wget https://github.com/fatedier/frp/releases/download/v0.52.3/frp_0.52.3_darwin_amd64.tar.gz

# 创建客户端配置
cat > frpc.ini << EOF
[common]
server_addr = 你的服务器IP
server_port = 7000
token = your_secure_token_123456

[ai_node]
type = http
local_port = 9999
custom_domains = ai.yourdomain.com
EOF

# 启动客户端
./frpc -c frpc.ini
```

### AI 连接地址
```
http://ai.yourdomain.com
或
http://你的服务器IP:自定义端口
```

---

## 方案三：Cloudflare Tunnel（免费，更稳定）

### 步骤1：安装 cloudflared
```bash
brew install cloudflared
```

### 步骤2：登录 Cloudflare
```bash
cloudflared tunnel login
# 浏览器会打开，选择你的域名
```

### 步骤3：创建隧道
```bash
# 创建隧道
cloudflared tunnel create ai-node

# 获取隧道ID（记下来）
cloudflared tunnel list
```

### 步骤4：配置隧道
```bash
# 编辑配置
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << EOF
tunnel: 你的隧道ID
credentials-file: /Users/你的用户名/.cloudflared/你的隧道ID.json

ingress:
  - hostname: ai-node.你的域名.com
    service: http://localhost:9999
  - service: http_status:404
EOF
```

### 步骤5：启动隧道
```bash
# 启动控制通道
python3 ~/ai_node.py &

# 启动隧道
cloudflared tunnel run ai-node
```

### 步骤6：给 AI 地址
```
https://ai-node.你的域名.com
```

---

## 故障排查

### 问题1：连接超时
```bash
# 检查本地服务
curl http://localhost:9999

# 检查 funnel 状态
tailscale funnel status

# 重启所有
pkill -f ai_node.py
python3 ~/ai_node.py &
tailscale funnel --bg 9999
```

### 问题2：Mac 休眠导致断开
```bash
# 防止休眠
caffeinate -d -i -m -s &

# 或系统设置
# 系统偏好设置 → 节能 → 防止自动休眠（勾选）
```

### 问题3：网络波动
```bash
# 使用保活脚本（见方案一步骤4）
# 或改用云服务器方案（方案二）
```

---

## 安全建议

1. **不要共享你的 URL** - 知道地址就能控制你的电脑
2. **使用强 Token** - 防止被猜测
3. **设置防火墙** - 只开放必要端口
4. **定期检查日志** - 发现异常连接

---

## 快速命令总结

```bash
# 一键启动（保存为 ~/start_ai.sh）
#!/bin/bash
pkill -f ai_node.py
sleep 1
python3 ~/ai_node.py &
sleep 2
tailscale funnel --bg 9999
tailscale funnel status | grep https

# 执行
chmod +x ~/start_ai.sh
~/start_ai.sh
```

---

**推荐方案：Tailscale Funnel（简单免费）或 云服务器（最稳定）**
