#!/bin/bash
# ContentAI Cloudflare Pages 部署脚本

echo "🚀 ContentAI Cloudflare Pages 部署"
echo "=================================="

# 检查wrangler
if ! command -v wrangler &> /dev/null; then
    echo "安装 wrangler..."
    npm install -g wrangler
fi

cd /root/.openclaw/workspace/contentai/src

# 创建pages配置
cat > wrangler.toml << 'EOF'
name = "contentai"
compatibility_date = "2024-04-03"

[site]
bucket = "./dist"
EOF

echo "📦 构建静态文件..."
npm run build

echo ""
echo "🚀 部署到Cloudflare Pages..."
echo "执行: wrangler pages deploy dist --project-name contentai"
echo ""
echo "⚠️ 需要Cloudflare认证，执行以下命令:"
echo "  wrangler login"
echo "  wrangler pages deploy dist --project-name contentai"
