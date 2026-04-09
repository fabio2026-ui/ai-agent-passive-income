#!/bin/bash
# 部署脚本

set -e

echo "🚀 Tax API Aggregator 部署脚本"
echo "================================"

# 检查wrangler是否安装
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装"
    echo "运行: npm install -g wrangler"
    exit 1
fi

# 检查登录状态
echo "🔑 检查Cloudflare登录状态..."
wrangler whoami || (echo "请先运行: wrangler login" && exit 1)

# 安装依赖
echo "📦 安装依赖..."
npm install

# 类型检查
echo "🔍 TypeScript类型检查..."
npm run typecheck

# 创建D1数据库 (如果不存在)
echo "🗄️ 检查D1数据库..."
DB_LIST=$(wrangler d1 list 2>/dev/null || echo "")
if ! echo "$DB_LIST" | grep -q "tax-api-db"; then
    echo "创建数据库..."
    wrangler d1 create tax-api-db
fi

# 提示设置secrets
echo ""
echo "⚙️  请确保已设置以下Secrets:"
echo "   wrangler secret put STRIPE_SECRET_KEY"
echo "   wrangler secret put STRIPE_WEBHOOK_SECRET"  
echo "   wrangler secret put JWT_SECRET"
echo ""

# 部署
echo "🚀 部署到Cloudflare Workers..."
wrangler deploy

echo ""
echo "✅ 部署完成!"
echo "API地址: https://api.taxaggregator.eu"
echo ""
echo "📝 下一步:"
echo "1. 设置Stripe Webhook: https://api.taxaggregator.eu/webhooks/stripe"
echo "2. 在Stripe Dashboard创建€29/月的Price"
echo "3. 更新wrangler.toml中的STRIPE_PRICE_ID"
echo "4. 运行数据库迁移: wrangler d1 migrations apply tax-api-db"