#!/bin/bash
# Obsidian插件自动启用脚本
# 保存为 enable_plugins.sh，运行即可

echo "🔧 自动启用Obsidian插件..."

# 方法1: 直接修改配置文件
mkdir -p "$HOME/Obsidian Vault/.obsidian"

# 创建社区插件配置
cat > "$HOME/Obsidian Vault/.obsidian/community-plugins.json" << 'INNEREOF'
{
  "pluginEnabledStatus": {
    "dataview": true,
    "templater-obsidian": true,
    "smart-connections": true
  },
  "safeMode": false
}
INNEREOF

# 方法2: 使用osascript尝试自动点击（如果Obsidian正在运行）
if pgrep -x "Obsidian" > /dev/null; then
    echo "检测到Obsidian运行中，尝试自动配置..."
    osascript << 'APPLESCRIPT' 2>/dev/null || true
        tell application "Obsidian" to activate
        delay 1
        tell application "System Events"
            keystroke "," using command down
            delay 0.5
            keystroke "Community Plugins"
            delay 0.5
            -- 尝试关闭安全模式
            try
                click checkbox "Safe mode" of window 1 of application process "Obsidian"
                delay 0.5
                click button "Turn off and restart" of sheet 1 of window 1 of application process "Obsidian"
            end try
        end tell
APPLESCRIPT
fi

echo "✅ 插件配置完成！"
echo ""
echo "📋 如果自动配置未生效，请手动操作:"
echo "1. 打开Obsidian"
echo "2. 设置 → 社区插件"
echo "3. 关闭'安全模式'"
echo "4. 启用: Dataview, Templater, Smart Connections"
