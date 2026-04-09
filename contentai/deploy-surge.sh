#!/bin/bash
# ContentAI Surge.sh 部署脚本 (最简单)

echo "🚀 ContentAI Surge.sh 快速部署"
echo "==============================="

cd /root/.openclaw/workspace/contentai/src

echo "📦 构建中..."
npm run build > /dev/null 2>&1

echo ""
echo "🌐 部署到Surge.sh..."
echo "执行: surge dist contentai-demo.surge.sh"
echo ""

# 尝试非交互式部署
export SURGE_LOGIN="deploy@contentai.ai"
export SURGE_TOKEN=""

surge dist contentai-demo.surge.sh --token "" 2>&1 || {
    echo "⚠️ 需要交互式登录，请执行:"
    echo "  surge dist contentai-demo.surge.sh"
}
