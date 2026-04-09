#!/bin/bash
# ContentAI Vercel 快速部署指南

echo "🚀 ContentAI Vercel 部署指南"
echo "=============================="
echo ""

# 方式1: 交互式登录
echo "📌 方式1: 交互式登录 (推荐)"
echo "----------------------------"
echo "执行命令:"
echo "  cd /root/.openclaw/workspace/contentai/src"
echo "  npx vercel login"
echo ""
echo "然后按提示完成登录，再执行:"
echo "  npx vercel --prod"
echo ""

# 方式2: Token部署
echo "📌 方式2: 使用Token"
echo "-------------------"
echo "1. 访问 https://vercel.com/account/tokens"
echo "2. 创建新Token"
echo "3. 设置环境变量:"
echo "   export VERCEL_TOKEN='your_token_here'"
echo "4. 执行部署:"
echo "   npx vercel --token \$VERCEL_TOKEN --prod"
echo ""

# 方式3: GitHub集成
echo "📌 方式3: GitHub集成 (最简单)"
echo "----------------------------"
echo "1. 将代码推送到GitHub"
echo "2. 访问 https://vercel.com/new"
echo "3. 导入GitHub仓库"
echo "4. 自动部署"
echo ""

# 环境变量配置
echo "⚙️  部署后环境变量配置"
echo "--------------------"
echo "在Vercel Dashboard中添加:"
echo "- KIMI_API_KEY: 你的Kimi API密钥"
echo "- NEXTAUTH_SECRET: 随机字符串 (openssl rand -base64 32)"
echo "- NEXTAUTH_URL: 部署后的域名"
echo ""

echo "✅ 准备就绪！"
