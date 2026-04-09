# 部署脚本
#!/bin/bash

echo "🚀 Deploying EU CrossBorder API to Cloudflare Workers..."

# 检查 wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
fi

# 登录 Cloudflare (如果需要)
echo "🔐 Checking Cloudflare authentication..."
wrangler whoami || wrangler login

# 部署
echo "📤 Deploying..."
wrangler deploy

echo "✅ Deployment complete!"
echo "🌐 API URL: https://eucrossborder-api.yhongwb.workers.dev"
