# AI无人工厂 - 完整迁移指南

## 📦 迁移包内容（已打包）

```
ai_factory_migration/
├── ai-app-factory-v3/          # APP工厂（6个APP + 机器人）
│   ├── products/               # 6个APP产品
│   ├── robots/                 # CEO机器人、引擎等
│   └── virtual_tester.py       # 测试机器人
├── ai-company/                 # 内容工厂（视频+文字）
│   ├── ai-content-factory/     # 视频生产线
│   │   ├── output/videos/      # 466个视频
│   │   ├── video_scripts/      # 26个脚本
│   │   └── ai_video*.py        # 视频机器人
│   └── ai-content-factory/     # 文字生产线（新增）
│       └── text_division/      # 网文/时评机器人
├── requirements.txt            # Python依赖清单
├── com.ai.autofix.plist        # 开机启动配置
└── com.ai.company.daily.plist  # 定时任务配置
```

---

## 🖥️ 新电脑部署步骤

### 第1步：系统准备（新电脑）

```bash
# 1. 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装必要软件
brew install python@3.14 ffmpeg tailscale

# 3. 安装 Docker（从官网下载 Docker Desktop）
# https://www.docker.com/products/docker-desktop
```

---

### 第2步：复制迁移包

```bash
# 从旧电脑复制到新电脑
# 方法A：使用移动硬盘/U盘
# 方法B：使用scp/rsync（两台电脑在同一网络）
scp -r ~/ai_factory_migration newmac:~/

# 或者使用云服务
# iCloud Drive / Google Drive / Dropbox
```

---

### 第3步：部署AI工厂（一键脚本）

创建 `deploy.sh`：

```bash
#!/bin/bash
set -e

echo "🚀 AI无人工厂部署开始..."

# 1. 解压到正确位置
mkdir -p ~/ai-projects
cp -r ~/ai_factory_migration/ai-app-factory-v3 ~/ai-projects/
cp -r ~/ai_factory_migration/ai-company ~/ai-projects/

# 2. 安装Python依赖
echo "📦 安装依赖..."
pip3 install -r ~/ai_factory_migration/requirements.txt || echo "手动安装: moviepy, flask, requests"

# 3. 创建虚拟环境（推荐）
cd ~/ai-projects/ai-app-factory-v3
python3 -m venv venv
source venv/bin/activate
pip install flask requests pillow

cd ~/ai-projects/ai-company/ai-content-factory
python3 -m venv venv
source venv/bin/activate
pip install moviepy flask requests

# 4. 安装Tailscale并登录
echo "🔗 配置Tailscale..."
tailscale up

# 5. 部署安全控制服务
echo "🔒 部署安全控制..."
cat > ~/ai_secure_v2.py << 'PYEOF'
import http.server, json, subprocess, socketserver
AUTH_TOKEN = "Fabio_Secure_999"
class H(http.server.BaseHTTPRequestHandler):
    def do_POST(s):
        if s.headers.get('X-Auth-Token') != AUTH_TOKEN:
            s.send_response(401); s.end_headers(); return
        l = int(s.headers.get('Content-Length', 0))
        d = json.loads(s.rfile.read(l))
        c = d.get('c', '')
        if any(b in c for b in ['rm -rf /', 'shutdown', 'reboot']):
            s.send_response(403); s.end_headers(); return
        r = subprocess.run(c, shell=True, capture_output=True, text=True, timeout=60)
        s.send_response(200)
        s.send_header('Content-Type', 'application/json')
        s.end_headers()
        s.wfile.write(json.dumps({'o': r.stdout, 'e': r.stderr}).encode())
    def log_message(s, *a): pass
server = socketserver.TCPServer(('0.0.0.0', 9999), H)
server.allow_reuse_address = True
print("🛡️ Secure Server Ready")
server.serve_forever()
PYEOF

# 6. 配置开机启动
echo "⚙️ 配置开机启动..."
cp ~/ai_factory_migration/com.ai.*.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.ai.autofix.plist
launchctl load ~/Library/LaunchAgents/com.ai.company.daily.plist

# 7. 启动核心服务
echo "🤖 启动AI机器人..."
nohup python3 ~/ai_secure_v2.py > ~/ai_secure.log 2>&1 &
nohup python3 ~/ai-projects/ai-app-factory-v3/robots/01_ceo_robot_v3.py > ~/ceo.log 2>&1 &
nohup python3 ~/ai-projects/ai-company/ai-content-factory/ai_video_engine_v3.py > ~/video.log 2>&1 &

# 8. 开启Tailscale Funnel
tailscale funnel --bg 9999

echo "✅ 部署完成！"
echo "📍 你的控制地址："
tailscale funnel status | grep https
echo ""
echo "🔑 安全密码：Fabio_Secure_999"
```

**执行：** `bash deploy.sh`

---

## 🔄 数据同步（可选）

如果新旧电脑要并行运行一段时间：

```bash
# 同步新增的视频产出
rsync -avz ~/ai-company/ai-content-factory/output/videos/ newmac:~/ai-company/ai-content-factory/output/videos/

# 同步新增的脚本
rsync -avz ~/ai-company/ai-content-factory/video_scripts/ newmac:~/ai-company/ai-content-factory/video_scripts/
```

---

## ⚠️ 注意事项

1. **Ollama模型**：新电脑需要重新下载
   ```bash
   brew install ollama
   ollama pull qwen2.5:7b
   ollama pull deepseek-coder:6.7b
   ollama pull llama3:8b
   ```

2. **Docker容器**：需要重新启动
   ```bash
   cd ~/ai-company/ai-content-factory
   docker-compose up -d
   ```

3. **Tailscale账号**：新电脑需要登录同一个Tailscale账号

4. **路径差异**：如果用户名不同，需要修改脚本中的路径

---

## 🎯 部署后验证

```bash
# 检查所有服务
ps aux | grep -E "ai_secure|ceo_robot|ai_video" | grep -v grep

# 检查Tailscale
tailscale status

# 测试连接（从旧电脑或手机）
curl -H "X-Auth-Token: Fabio_Secure_999" \
     -X POST https://NEW_MAC_NAME.tailxxxx.ts.net \
     -d '{"c":"echo 迁移成功"}'
```

---

## 💾 备份建议

部署完成后，立即创建备份：

```bash
# 创建快照
tar -czf ~/ai_factory_backup_$(date +%Y%m%d).tar.gz \
    ~/ai-projects \
    ~/ai_secure_v2.py \
    ~/Library/LaunchAgents/com.ai.*.plist

# 备份到云端
rsync -avz ~/ai_factory_backup_*.tar.gz iCloudDrive:Backups/
```

---

## 📞 迁移完成后的连接

新电脑部署完成后，告诉我新的Tailscale地址，我会立即切换控制到新机器！
