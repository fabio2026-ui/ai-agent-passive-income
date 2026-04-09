#!/bin/bash
# ContentAI 全自动部署脚本
# 使用Stripe支付 + Cloudflare Workers

set -e

echo "🚀 ContentAI 全自动部署"
echo "======================="
echo ""

# 检查目录
cd /root/.openclaw/workspace/contentai/auto-system

echo "📋 部署检查清单"
echo "---------------"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装"
    exit 1
fi
echo "✅ Node.js: $(node -v)"

# 检查wrangler
if ! command -v npx &> /dev/null; then
    echo "❌ npx未安装"
    exit 1
fi
echo "✅ npx可用"

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install 2>/dev/null || echo "依赖已安装"

# 检查.env
echo ""
echo "🔧 检查配置..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env文件不存在，从模板创建..."
    cp .env.example .env
    echo "⚠️  请编辑.env文件填入你的API密钥"
    echo "   nano .env"
    exit 1
fi

# 检查必要配置
if grep -q "sk-your-moonshot-api-key" .env; then
    echo "❌ 请配置Moonshot API Key"
    exit 1
fi

if grep -q "sk_test_... or sk_live_" .env; then
    echo "❌ 请配置Stripe Secret Key"
    exit 1
fi

if grep -q "re_your-resend-api-key" .env; then
    echo "❌ 请配置Resend API Key"
    exit 1
fi

echo "✅ 配置检查通过"

# 部署到Cloudflare
echo ""
echo "🌐 部署到Cloudflare Workers..."
npx wrangler deploy

echo ""
echo "🎉 部署完成！"
echo ""
echo "下一步:"
echo "1. 在Stripe后台配置Webhook: 你的域名/webhook/stripe"
echo "2. 测试支付流程"
echo "3. 启动获客脚本"
