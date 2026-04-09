#!/bin/bash
# Netlify 自动部署脚本 (尝试使用Drop API)

echo "🚀 Netlify 自动部署尝试"
echo "======================="

# 方式1: 检查是否有site ID和token
if [ -n "$NETLIFY_SITE_ID" ] && [ -n "$NETLIFY_AUTH_TOKEN" ]; then
    echo "✅ 使用已有Token部署..."
    cd /root/.openclaw/workspace/contentai/final-deploy
    curl -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
         -X POST "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/deploys" \
         -F "file=@" 2>&1
    exit 0
fi

# 方式2: 创建新的drop部署 (无需认证)
echo "📦 准备部署包..."
cd /root/.openclaw/workspace/contentai
zip -r final-deploy.zip final-deploy/ > /dev/null 2>&1

echo ""
echo "⚠️  Netlify自动部署需要以下之一:"
echo ""
echo "选项A: 设置环境变量"
echo "  export NETLIFY_AUTH_TOKEN='your_token'"
echo "  export NETLIFY_SITE_ID='your_site_id'"
echo ""
echo "选项B: 使用Netlify CLI交互式登录"
echo "  npx netlify login"
echo "  npx netlify deploy --prod --dir=final-deploy"
echo ""
echo "选项C: 手动拖拽上传 (最简单)"
echo "  1. 访问 https://app.netlify.com/drop"
echo "  2. 拖拽 final-deploy/ 文件夹"
echo ""

# 显示文件位置
ls -lh /root/.openclaw/workspace/contentai/final-deploy.zip
