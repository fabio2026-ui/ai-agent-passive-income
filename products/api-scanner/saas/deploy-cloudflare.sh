#!/bin/bash
# Cloudflare Pages 一键部署
# 使用已有Token和域名

set -e

echo "🚀 Cloudflare Pages 部署"
echo "========================"
echo ""

# 配置
TOKEN="cfat_Kq2d2bLPJItUCdjvQ74OKdy31fL4Ve0Hkfp8Reng949b5c67"
DOMAIN="eucrossborder.com"
PROJECT_NAME="api-security-scanner"

echo "📁 准备部署文件..."

# 创建部署目录
mkdir -p /tmp/cf-deploy
cd /tmp/cf-deploy

# 复制前端文件
cp -r /root/.openclaw/workspace/ai-agent-projects/products/api-scanner/saas/frontend/* .

# 注入Stripe密钥到HTML
sed -i "s|YOUR_STRIPE_PUBLIC_KEY|pk_live_51TCfcBDRLWt3rKvb0I0gfVnf94mlg3QDkl9hGUaJqqB8pPCMEy7Lj46SW4oxMIDbglx6qqBbqxzLSpDpvII25chX00nC0SzxLR|g" *.html

echo "🌐 部署到 Cloudflare Pages..."

# 使用 Wrangler CLI (如已安装)
if command -v wrangler &> /dev/null; then
    echo "✅ Wrangler 已安装"
    
    # 登录
    echo "$TOKEN" | wrangler login
    
    # 创建项目
    wrangler pages project create "$PROJECT_NAME" || true
    
    # 部署
    wrangler pages deploy . --project-name="$PROJECT_NAME"
    
    echo ""
    echo "✅ 部署完成!"
    echo "🌐 访问地址:"
    echo "   https://api-security-scanner.pages.dev"
    echo "   https://scanner.$DOMAIN (需配置DNS)"
    
else
    echo "⚠️  Wrangler 未安装"
    echo ""
    echo "手动部署步骤:"
    echo "  1. 访问 https://dash.cloudflare.com"
    echo "  2. Pages → Create a project"
    echo "  3. 上传 frontend/ 文件夹"
    echo "  4. 部署完成"
    echo ""
    echo "或安装 Wrangler:"
    echo "  npm install -g wrangler"
fi

# 清理
cd /
rm -rf /tmp/cf-deploy

echo ""
echo "📋 部署后配置:"
echo "  1. 添加自定义域名: scanner.$DOMAIN"
echo "  2. 配置 Stripe Webhook"
echo "  3. 设置后端API (Railway/Workers)"
