#!/bin/bash
# 部署状态监控脚本
# 每30秒检查一次

echo "🔍 监控Cloudflare Pages部署状态..."
echo ""

URLS=(
    "https://codeguard-landing.pages.dev|CodeGuard Landing"
    "https://mcp-marketplace.pages.dev|MCP Marketplace"
    "https://contentai-landing.pages.dev|ContentAI Landing"
    "https://fabio2026-ui.github.io/codeguard-blog|CodeGuard Blog"
)

check_deployment() {
    local url=$1
    local name=$2
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$status" = "200" ]; then
        echo "✅ $name: ONLINE ($url)"
        return 0
    else
        echo "⏳ $name: Deploying... (status: $status)"
        return 1
    fi
}

# 持续监控
while true; do
    clear
    echo "================================"
    echo "  Cloudflare Pages 部署监控"
    echo "  $(date '+%Y-%m-%d %H:%M:%S')"
    echo "================================"
    echo ""
    
    all_ready=true
    for item in "${URLS[@]}"; do
        IFS='|' read -r url name <<< "$item"
        if ! check_deployment "$url" "$name"; then
            all_ready=false
        fi
    done
    
    echo ""
    if [ "$all_ready" = true ]; then
        echo "🎉 所有部署完成！"
        echo ""
        echo "下一步:"
        echo "1. 访问各个URL确认"
        echo "2. 开始Reddit/Dev.to推广"
        break
    else
        echo "⏰ 30秒后重新检查..."
        sleep 30
    fi
done