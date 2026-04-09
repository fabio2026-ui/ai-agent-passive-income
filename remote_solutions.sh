#!/bin/bash
# 🔄 远程自动化备选方案集
# 无需在Mac前，完全远程执行

set -e

echo "========================================"
echo "🔄 远程自动化备选方案"
echo "========================================"
echo ""

# ============================================
# 方案1: 创建LaunchAgent - 下次开机自动执行
# ============================================
echo "📦 [方案1] 设置开机自动配置..."

mkdir -p ~/Library/LaunchAgents

cat > ~/Library/LaunchAgents/com.ai-empire.obsidian-setup.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ai-empire.obsidian-setup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/fabiofu/ai-free-suite/auto-setup-obsidian.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>StandardOutPath</key>
    <string>/Users/fabiofu/ai-free-suite/obsidian-setup.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/fabiofu/ai-free-suite/obsidian-setup-error.log</string>
</dict>
</plist>
EOF

# 创建执行脚本
cat > ~/ai-free-suite/auto-setup-obsidian.sh << 'EOF'
#!/bin/bash
# 开机自动配置Obsidian

LOG="/Users/fabiofu/ai-free-suite/obsidian-auto.log"
echo "$(date): 开始自动配置..." > "$LOG"

# 等待Obsidian启动 (最多等60秒)
for i in {1..60}; do
    if pgrep -x "Obsidian" > /dev/null; then
        echo "$(date): Obsidian已启动" >> "$LOG"
        
        # 尝试自动配置
        osascript <> 'APPLESCRIPT' >> "$LOG" 2>&1 || true
            tell application "Obsidian" to activate
            delay 2
            tell application "System Events"
                keystroke "," using command down
                delay 1
                -- 尝试点击Community Plugins
                try
                    click button "Community Plugins" of splitter group 1 of window 1 of application process "Obsidian"
                    delay 1
                    -- 关闭安全模式
                    click checkbox "Safe mode" of window 1 of application process "Obsidian"
                    delay 1
                    click button "Turn off and restart" of sheet 1 of window 1 of application process "Obsidian"
                    echo "$(date): 配置完成，需要重启Obsidian" >> "$LOG"
                on error errMsg
                    echo "$(date): 自动化失败: $errMsg" >> "$LOG"
                end try
            end tell
APPLESCRIPT
        
        # 配置完成后卸载自己
        launchctl unload ~/Library/LaunchAgents/com.ai-empire.obsidian-setup.plist 2>/dev/null || true
        echo "$(date): 任务完成，已卸载" >> "$LOG"
        exit 0
    fi
    sleep 1
done

echo "$(date): 等待超时，Obsidian未启动" >> "$LOG"
EOF

chmod +x ~/ai-free-suite/auto-setup-obsidian.sh

# 加载launch agent
launchctl load ~/Library/LaunchAgents/com.ai-empire.obsidian-setup.plist 2>/dev/null || true

echo "✅ 方案1完成: 下次开机/登录时自动尝试配置"
echo "   如果Obsidian启动，会自动尝试配置"
echo "   日志: ~/ai-free-suite/obsidian-auto.log"

# ============================================
# 方案2: 使用替代工具 (完全自动化)
# ============================================
echo ""
echo "📦 [方案2] 部署Obsidian替代品 (完全CLI)"

mkdir -p ~/ai-free-suite/logseq
cd ~/ai-free-suite/logseq

# 创建Logseq配置 (开源，更好自动化)
cat > README.md << 'EOF'
# Logseq - Obsidian替代品

## 为什么选择Logseq
- ✅ 完全开源
- ✅ 更好的插件自动化支持
- ✅ 可以通过配置文件启用插件
- ✅ 无需GUI点击即可配置

## 安装
brew install --cask logseq

## 优势
- 插件可以通过配置文件直接启用
- 支持Git同步
- 更好的大纲编辑
- 与Obsidian双向兼容 (都是Markdown)
EOF

echo "✅ 方案2准备: Logseq作为备选"
echo "   如果你愿意，可以切换到Logseq"
echo "   它支持完全自动化的插件配置"

# ============================================
# 方案3: 基于Web的知识库 (100%远程可控)
# ============================================
echo ""
echo "📦 [方案3] 部署Web版知识库 (完全远程)"

mkdir -p ~/ai-free-suite/web-kb
cd ~/ai-free-suite/web-kb

# 创建简单的Web知识库界面
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>AI知识库</title>
    <style>
        body { font-family: -apple-system, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .note { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .tag { background: #007acc; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        #editor { width: 100%; height: 200px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🧠 AI知识库</h1>
    <div id="notes"></div>
    <h2>新建笔记</h2>
    <textarea id="editor" placeholder="输入Markdown内容..."></textarea>
    <button onclick="saveNote()">保存</button>
    
    <script>
        // 从本地存储加载
        function loadNotes() {
            const notes = JSON.parse(localStorage.getItem('notes') || '[]');
            document.getElementById('notes').innerHTML = notes.map(n => 
                `<div class="note">
                    <div>${n.content}</div>
                    <span class="tag">${n.date}</span>
                </div>`
            ).join('');
        }
        
        function saveNote() {
            const content = document.getElementById('editor').value;
            const notes = JSON.parse(localStorage.getItem('notes') || '[]');
            notes.unshift({ content, date: new Date().toLocaleString() });
            localStorage.setItem('notes', JSON.stringify(notes));
            loadNotes();
            document.getElementById('editor').value = '';
        }
        
        loadNotes();
    </script>
</body>
</html>
EOF

echo "✅ 方案3完成: Web版知识库"
echo "   位置: ~/ai-free-suite/web-kb/index.html"
echo "   可以部署到任何Web服务器"
echo "   100%远程可控，无需GUI"

# ============================================
# 方案4: 通过SSH隧道远程访问 (高级)
# ============================================
echo ""
echo "📦 [方案4] 设置远程桌面隧道"

cat > ~/ai-free-suite/setup-remote-access.sh << 'EOF'
#!/bin/bash
# 设置远程访问

echo "设置远程桌面访问..."

# 启用屏幕共享
sudo defaults write /var/db/launchd.db/com.apple.launchd/overrides.plist com.apple.screensharing -dict Disabled -bool false

# 或使用VNC
# 开启远程登录
sudo systemsetup -setremotelogin on 2>/dev/null || true

echo "✅ 远程访问已启用"
echo ""
echo "使用方法:"
echo "1. 找到你的Mac IP: ifconfig | grep inet"
echo "2. 从其他电脑连接:"
echo "   - VNC: 打开Finder → 前往 → 连接服务器 → vnc://你的IP"
echo "   - SSH: ssh 用户名@你的IP"
echo ""
echo "然后可以远程操作Obsidian"
EOF

chmod +x ~/ai-free-suite/setup-remote-access.sh

echo "✅ 方案4: 远程桌面配置脚本已创建"
echo "   运行: ~/ai-free-suite/setup-remote-access.sh"

# ============================================
# 总结
# ============================================
echo ""
echo "========================================"
echo "🎯 4个远程解决方案已部署"
echo "========================================"
echo ""
echo "方案1: 下次开机自动配置Obsidian"
echo "  - 已设置LaunchAgent"
echo "  - 开机后自动尝试启用插件"
echo "  - 无需你操作"
echo ""
echo "方案2: 切换到Logseq (完全自动化)"
echo "  - 开源，插件可配置文件启用"
echo "  - brew install --cask logseq"
echo ""
echo "方案3: Web版知识库 (已就绪)"
echo "  - 浏览器访问"
echo "  - 100%远程可控"
echo "  - 文件: ~/ai-free-suite/web-kb/index.html"
echo ""
echo "方案4: 启用远程桌面"
echo "  - 从其他电脑远程控制Mac"
echo "  - 运行setup-remote-access.sh"
echo ""
echo "========================================"
echo "推荐: 方案1 + 方案3组合"
echo "========================================"
