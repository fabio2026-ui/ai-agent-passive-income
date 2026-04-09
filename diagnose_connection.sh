#!/bin/bash
# 🔍 OpenClaw 连接诊断脚本
# 复制全部内容，在Mac终端执行

echo "========================================"
echo "🔍 OpenClaw 连接诊断"
echo "时间: $(date)"
echo "========================================"
echo ""

# 1. 检查Chrome扩展
echo "📱 [1/8] 检查Chrome扩展..."
CHROME_EXT_DIR="$HOME/Library/Application Support/Google/Chrome/Default/Extensions"
if [ -d "$CHROME_EXT_DIR" ]; then
    OPENCLAW_EXT=$(find "$CHROME_EXT_DIR" -name "*openclaw*" -o -name "*claw*" 2>/dev/null | head -5)
    if [ -n "$OPENCLAW_EXT" ]; then
        echo "✅ 找到Chrome扩展:"
        echo "$OPENCLAW_EXT" | sed 's/^/   /'
    else
        echo "❌ 未找到OpenClaw Chrome扩展"
    fi
else
    echo "⚠️  Chrome配置目录不存在"
fi
echo ""

# 2. 检查OpenClaw CLI
echo "🔧 [2/8] 检查OpenClaw CLI..."
if command -v openclaw &>/dev/null; then
    echo "✅ OpenClaw已安装:"
    openclaw version 2>/dev/null | sed 's/^/   /'
else
    echo "❌ OpenClaw CLI未安装"
fi
echo ""

# 3. 检查Tailscale
echo "🌐 [3/8] 检查Tailscale..."
if command -v tailscale &>/dev/null; then
    echo "✅ Tailscale已安装"
    echo "状态:"
    tailscale status 2>/dev/null | head -10 | sed 's/^/   /'
    echo ""
    echo "Funnel状态:"
    tailscale funnel status 2>/dev/null | head -5 | sed 's/^/   /'
else
    echo "❌ Tailscale未安装"
fi
echo ""

# 4. 检查端口占用
echo "🔌 [4/8] 检查端口占用..."
PORTS=(18789 18792 9999 18800)
for port in "${PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ 端口 $port: 占用中"
        lsof -Pi :$port -sTCP:LISTEN 2>/dev/null | tail -1 | sed 's/^/   /'
    else
        echo "❌ 端口 $port: 未占用"
    fi
done
echo ""

# 5. 检查OpenClaw配置
echo "⚙️  [5/8] 检查OpenClaw配置..."
OPENCLAW_CONFIG="$HOME/.openclaw/openclaw.json"
if [ -f "$OPENCLAW_CONFIG" ]; then
    echo "✅ 配置文件存在: $OPENCLAW_CONFIG"
    echo "最后修改: $(stat -f%Sm "$OPENCLAW_CONFIG" 2>/dev/null || stat -c%y "$OPENCLAW_CONFIG" 2>/dev/null)"
    
    # 检查Tailscale模式
    TAILSCALE_MODE=$(grep -o '"mode": "[^"]*"' "$OPENCLAW_CONFIG" | grep tailscale -A1 | tail -1 | cut -d'"' -f4)
    if [ -n "$TAILSCALE_MODE" ]; then
        echo "Tailscale模式: $TAILSCALE_MODE"
    fi
else
    echo "❌ 配置文件不存在"
fi
echo ""

# 6. 检查Python控制服务器
echo "🐍 [6/8] 检查Python控制服务器..."
if pgrep -f "ai_secure" >/dev/null 2>&1; then
    echo "✅ ai_secure服务运行中"
    pgrep -f "ai_secure" | sed 's/^/   PID: /'
else
    echo "❌ ai_secure服务未运行"
fi
echo ""

# 7. 检查网络连接
echo "🌐 [7/8] 检查网络连接..."
if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    echo "✅ 网络连接正常"
else
    echo "❌ 网络连接异常"
fi

# 检查到服务器的连接
if curl -s --max-time 5 https://fabiomacbook-air.tail284095.ts.net/health >/dev/null 2>&1; then
    echo "✅ Tailscale Funnel连接正常"
else
    echo "❌ Tailscale Funnel连接失败"
fi
echo ""

# 8. 检查系统信息
echo "💻 [8/8] 系统信息..."
echo "主机名: $(hostname)"
echo "系统: $(uname -s) $(uname -r)"
echo "架构: $(uname -m)"
echo "用户: $(whoami)"
echo ""

echo "========================================"
echo "✅ 诊断完成!"
echo "========================================"
echo ""
echo "📋 请复制上面全部输出发给我"
echo ""
