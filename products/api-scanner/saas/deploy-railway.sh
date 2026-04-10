#!/bin/bash
# Railway一键部署脚本
# 小七生成

set -e

echo "🚀 API扫描器 SaaS 部署脚本"
echo "==========================="
echo ""

# 检查环境变量
if [ -z "$RAILWAY_TOKEN" ]; then
    echo "⚠️  需要 Railway Token"
    echo "获取方式:"
    echo "  1. 访问 https://railway.app"
    echo "  2. 登录 → Account Settings → Tokens"
    echo "  3. 创建 New Token"
    echo "  4. 复制并设置: export RAILWAY_TOKEN=你的token"
    exit 1
fi

if [ -z "$STRIPE_API_KEY" ]; then
    echo "⚠️  需要 Stripe API Key"
    echo "获取方式:"
    echo "  1. 访问 https://dashboard.stripe.com/apikeys"
    echo "  2. 复制 Secret key (sk_live_...)"
    echo "  3. 设置: export STRIPE_API_KEY=你的密钥"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 安装Railway CLI (如未安装)
if ! command -v railway &> /dev/null; then
    echo "📦 安装 Railway CLI..."
    npm install -g @railway/cli
fi

# 登录Railway
echo "🔑 登录 Railway..."
railway login --token "$RAILWAY_TOKEN"

# 创建项目
echo "📁 创建项目..."
cd "$(dirname "$0")"
PROJECT_NAME="api-security-scanner-$(date +%s)"
railway init --name "$PROJECT_NAME"

# 设置环境变量
echo "⚙️  配置环境变量..."
railway variables set STRIPE_API_KEY="$STRIPE_API_KEY"
railway variables set STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-whsec_LIOC54Mu4B0GIInSj0SSfIbQ4A5zgMT0}"
railway variables set APP_ENV=production
railway variables set DEBUG=False

# 部署
echo "🚀 开始部署..."
railway up --detach

# 获取域名
echo "🌐 获取域名..."
DOMAIN=$(railway domain)
echo ""
echo "✅ 部署完成!"
echo ""
echo "应用地址: https://$DOMAIN"
echo ""
echo "下一步:"
echo "  1. 配置 Stripe Webhook"
echo "     端点: https://$DOMAIN/webhook"
echo "     密钥: whsec_LIOC54Mu4B0GIInSj0SSfIbQ4A5zgMT0"
echo ""
echo "  2. 测试支付流程"
echo "     访问: https://$DOMAIN/pricing.html"
