#!/bin/bash
# ContentAI MVP 快速部署 (无支付版本)
# 先上线，后加支付！

set -e

echo "🚀 ContentAI MVP 快速部署"
echo "=========================="
echo ""

cd /root/.openclaw/workspace/contentai/auto-system

# 检查配置
echo "🔧 检查配置..."
if [ ! -f ".env" ]; then
    echo "📄 创建配置文件..."
    cp .env.simple .env
    echo "⚠️  请先编辑 .env 填入API密钥"
    echo "   nano .env"
    echo ""
    echo "只需要2个密钥:"
    echo "1. MOONSHOT_API_KEY - https://platform.moonshot.cn/"
    echo "2. RESEND_API_KEY - https://resend.com/"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install 2>/dev/null || true

# 部署
echo "🌐 部署到Cloudflare..."
npx wrangler deploy

echo ""
echo "🎉 MVP上线完成！"
echo ""
echo "网站地址: https://contentai.yourdomain.com"
echo ""
echo "后续步骤:"
echo "1. 测试AI生成和邮件交付"
echo "2. 收集用户反馈"
echo "3. 添加Stripe支付 (支付时切换 .env)")
