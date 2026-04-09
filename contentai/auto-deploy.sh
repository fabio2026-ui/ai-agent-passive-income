#!/bin/bash
# ContentAI 完全自动部署方案
# 无需交互，使用GitHub Pages

set -e

echo "🚀 ContentAI 自动部署"
echo "====================="

# 方案1: 使用已有Git配置推送到GitHub Pages
if [ -n "$GITHUB_TOKEN" ]; then
    echo "✅ 检测到GITHUB_TOKEN，使用GitHub Pages部署"
    
    REPO="contentai-mvp"
    USER=$(git config user.name)
    
    # 创建GitHub仓库并推送
    curl -H "Authorization: token $GITHUB_TOKEN" \
         -d "{\"name\":\"$REPO\",\"private\":false}" \
         https://api.github.com/user/repos 2>/dev/null || true
    
    # 设置远程仓库
    git remote add origin "https://$GITHUB_TOKEN@github.com/$USER/$REPO.git" 2>/dev/null || true
    
    # 推送到gh-pages分支
    git checkout -b gh-pages 2>/dev/null || git checkout gh-pages
    
    # 只保留dist内容
    git rm -rf . 2>/dev/null || true
    cp -r dist/* .
    git add .
    git commit -m "Deploy to GitHub Pages"
    git push -f origin gh-pages
    
    echo "✅ 部署完成: https://$USER.github.io/$REPO"
    exit 0
fi

# 方案2: 使用Cloudflare Workers (如果用户有账号)
if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    echo "✅ 检测到Cloudflare Token"
    # Cloudflare部署逻辑
fi

# 方案3: 本地静态服务器 + ngrok (临时方案)
echo "🔄 启动本地服务器 + 内网穿透..."
cd /root/.openclaw/workspace/contentai/src

# 构建
npm run build > /dev/null 2>&1

# 检查npx serve
if ! command -v serve &> /dev/null; then
    npm install -g serve
fi

# 启动服务器
echo "启动静态服务器..."
serve -s dist -l 3456 &
echo $! > /tmp/contentai-server.pid

sleep 2

echo ""
echo "✅ 本地服务器已启动: http://localhost:3456"
echo ""
echo "可选 - 内网穿透:"
echo "  npx ngrok http 3456"
echo ""
echo "PID: $(cat /tmp/contentai-server.pid)"
