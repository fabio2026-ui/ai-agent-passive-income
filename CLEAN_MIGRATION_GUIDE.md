# AI工厂 - 去身份化纯净模板迁移方案

## 🎯 目标
将AI工厂的功能架构迁移到新电脑，**完全不包含任何个人信息**（用户名、邮箱、历史记录等）。

新电脑将获得：
- ✅ 完整的功能架构（机器人、引擎、工作流）
- ✅ 全新的身份配置
- ❌ 不含：旧用户名、旧日志、旧视频产出、个人路径

---

## 📦 需要复制的「纯净功能文件」

### 1. 核心架构代码（只复制这些）

```bash
# 在旧电脑上执行：创建纯净模板文件夹
mkdir -p ~/ai_factory_clean_template

# 复制APP工厂 - 只复制代码，不复制运行日志
cp -r ~/ai-app-factory-v3/robots ~/ai_factory_clean_template/
cp -r ~/ai-app-factory-v3/products ~/ai_factory_clean_template/

# 复制内容工厂 - 只复制机器人代码，不复制视频产出
cp ~/ai-company/ai-content-factory/ai_video_engine_v3.py ~/ai_factory_clean_template/
cp ~/ai-company/ai-content-factory/ai_video_supervisor.py ~/ai_factory_clean_template/
cp ~/ai-company/ai-content-factory/viral_video_factory.py ~/ai_factory_clean_template/
cp ~/ai-company/ai-content-factory/viral_video_factory_pro.py ~/ai_factory_clean_template/

# 复制新部署的文字工厂
cp -r ~/ai-company/ai-content-factory/text_division ~/ai_factory_clean_template/ 2>/dev/null || echo "文字工厂可选"

# 查看大小（应该很小，只有代码）
du -sh ~/ai_factory_clean_template/
# 预期：小于 50MB（纯代码，不含视频）
```

---

## 🔧 去身份化处理（必须做）

### 步骤1：清理代码中的个人信息

```bash
cd ~/ai_factory_clean_template

# 查找所有包含旧用户名的文件（fabiofu → YOUR_USERNAME）
grep -r "fabiofu" . 2>/dev/null

# 批量替换（使用sed）
find . -type f -name "*.py" -exec sed -i '' 's/fabiofu/YOUR_USERNAME/g' {} \;
find . -type f -name "*.sh" -exec sed -i '' 's/fabiofu/YOUR_USERNAME/g' {} \;
find . -type f -name "*.json" -exec sed -i '' 's/fabiofu/YOUR_USERNAME/g' {} \;

# 替换主机名
find . -type f \( -name "*.py" -o -name "*.sh" -o -name "*.json" \) -exec sed -i '' 's/fabiomacbook-air/YOUR_HOSTNAME/g' {} \;

# 验证清理完成
grep -r "fabiofu" . 2>/dev/null || echo "✅ 清理完成"
```

---

## 📝 创建全新配置文件

### config.json（新电脑使用）

创建文件 `~/ai_factory_clean_template/config.json`：

```json
{
  "user": {
    "username": "新用户名",
    "email": "新邮箱@example.com",
    "auth_token": "新安全密码"
  },
  "paths": {
    "home": "/Users/新用户名",
    "projects": "/Users/新用户名/ai-projects"
  },
  "tailscale": {
    "hostname": "新主机名",
    "port": 9999
  },
  "ai_models": {
    "default": "qwen2.5:7b",
    "coding": "deepseek-coder:6.7b",
    "english": "llama3:8b"
  }
}
```

---

## 🚀 新电脑部署脚本（一键初始化）

创建文件 `~/ai_factory_clean_template/setup_new_mac.sh`：

```bash
#!/bin/bash
set -e

echo "🚀 AI工厂 - 新电脑初始化"
echo "=========================="

# 读取配置
CONFIG_FILE="$(dirname $0)/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 错误：找不到 config.json"
    echo "请先编辑 config.json，填入你的新信息"
    exit 1
fi

USERNAME=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['user']['username'])")
AUTH_TOKEN=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['user']['auth_token'])")
HOSTNAME=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['tailscale']['hostname'])")

echo ""
echo "📋 配置信息："
echo "  用户名: $USERNAME"
echo "  主机名: $HOSTNAME"
echo ""

# 1. 安装依赖
echo "📦 安装依赖..."
brew install python@3.14 ffmpeg tailscale 2>/dev/null || echo "依赖已安装"

# 2. 创建项目目录
PROJECT_DIR="/Users/$USERNAME/ai-projects"
mkdir -p $PROJECT_DIR
cp -r "$(dirname $0)/robots" $PROJECT_DIR/
cp -r "$(dirname $0)/products" $PROJECT_DIR/
cp "$(dirname $0)"/*.py $PROJECT_DIR/ 2>/dev/null || true

# 3. 替换模板变量
echo "🔧 配置新环境..."
find $PROJECT_DIR -type f \( -name "*.py" -o -name "*.sh" \) -exec sed -i '' "s/YOUR_USERNAME/$USERNAME/g" {} \;
find $PROJECT_DIR -type f \( -name "*.py" -o -name "*.sh" \) -exec sed -i '' "s/YOUR_HOSTNAME/$HOSTNAME/g" {} \;
find $PROJECT_DIR -type f \( -name "*.py" -o -name "*.sh" \) -exec sed -i '' "s/YOUR_SECURE_TOKEN/$AUTH_TOKEN/g" {} \;

# 4. 创建安全控制服务
cat > "/Users/$USERNAME/ai_secure.py" << EOF
import http.server, json, subprocess, socketserver
AUTH_TOKEN = "$AUTH_TOKEN"
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
print("🛡️ Secure Server Ready on 9999")
server.serve_forever()
EOF

# 5. 启动服务
echo "🤖 启动AI机器人..."
pkill -f ai_secure.py 2>/dev/null || true
nohup python3 "/Users/$USERNAME/ai_secure.py" > ~/ai_secure.log 2>&1 &

# 6. 配置Tailscale
echo "🔗 配置Tailscale..."
tailscale up
tailscale funnel --bg 9999

echo ""
echo "✅ 部署完成！"
echo ""
echo "📍 你的新控制地址："
tailscale funnel status | grep https
echo ""
echo "🔑 安全密码：$AUTH_TOKEN"
echo ""
echo "💡 下一步："
echo "  1. 告诉AI新的Tailscale地址"
echo "  2. 测试连接"
echo "  3. 开始生产！"
```

---

## 📋 迁移检查清单

### 旧电脑（打包前）
- [ ] 创建 `ai_factory_clean_template/` 文件夹
- [ ] 只复制 `.py` 代码文件，不复制 `output/`（视频）
- [ ] 运行 `sed` 清理所有 `fabiofu` 和旧主机名
- [ ] 创建新的 `config.json`
- [ ] 验证总大小 < 100MB（纯代码）

### 传输方式
- [ ] U盘/移动硬盘（推荐，最快）
- [ ] iCloud/Google Drive（适合小文件）
- [ ] `scp` 命令行传输（适合技术用户）

### 新电脑（部署后）
- [ ] 编辑 `config.json`，填入新用户名、新密码
- [ ] 运行 `./setup_new_mac.sh`
- [ ] 记录新的 `https://xxx.ts.net` 地址
- [ ] 告诉AI新地址，完成切换

---

## 🎯 纯净模板内容预览

```
ai_factory_clean_template/
├── robots/                    # AI机器人代码
│   ├── 01_ceo_robot_v3.py
│   ├── content_engine.py
│   ├── deploy_engine.py
│   ├── product_engine.py
│   ├── revenue_engine.py
│   └── traffic_engine.py
├── products/                  # 6个APP模板
│   ├── ai_planner/
│   ├── budget_tracker/
│   ├── daily_journal/
│   ├── focus_timer/
│   ├── habit_tracker/
│   └── task_manager/
├── ai_video_engine_v3.py      # 视频生成
├── ai_video_supervisor.py     # 质量监督
├── viral_video_factory.py     # 爆款工厂
├── text_division/             # 文字工厂（可选）
├── config.json                # ← 新用户配置文件
└── setup_new_mac.sh           # ← 一键部署脚本
```

**总大小：约 10-50MB（纯代码，不含视频）**

---

## ⚠️ 不包含的内容（旧电脑保留）

| 内容 | 说明 | 处理方式 |
|------|------|----------|
| `output/videos/` | 466个视频产出 | ❌ 不迁移，新电脑重新生产 |
| `logs/` | 运行日志 | ❌ 不迁移，新电脑生成新日志 |
| `video_scripts/` | 旧脚本 | ❌ 不迁移，新风格重新写 |
| 个人路径 `/Users/fabiofu/` | 用户名 | ❌ 已清理，替换为模板变量 |
| 历史配置 | 旧Tailscale | ❌ 新电脑新账号 |

---

## 💡 新电脑首次连接AI

部署完成后，告诉AI：

```
我的新电脑已部署完成！
新地址：https://新主机名.tailxxxx.ts.net
新密码：你的新密码
```

AI会立即切换控制，你的AI工厂在新电脑上重新开始，**完全没有任何旧痕迹**！

---

**准备好开始制作纯净模板了吗？需要我帮你执行打包命令吗？**
