#!/bin/bash
# ContentAI Netlify 部署脚本

echo "🚀 ContentAI Netlify 部署"
echo "========================="

# 检查netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "安装 Netlify CLI..."
    npm install -g netlify-cli
fi

cd /root/.openclaw/workspace/contentai/src

echo "📦 构建静态文件..."
rm -rf dist
npm run build

echo ""
echo "🔗 部署到Netlify..."
echo ""
echo "方式1: 使用Token (需要设置NETLIFY_AUTH_TOKEN)"
echo "  netlify deploy --prod --dir=dist"
echo ""
echo "方式2: 交互式登录"
echo "  netlify login"
echo "  netlify deploy --prod --dir=dist"
echo ""
echo "方式3: 拖拽部署"
echo "  1. 访问 https://app.netlify.com/drop"
echo "  2. 拖拽 dist 文件夹上传"
