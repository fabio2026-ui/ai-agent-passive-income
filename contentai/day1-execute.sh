#!/bin/bash
# ContentAI Day 1 执行脚本
# 使用方法: ./day1-execute.sh

echo "🚀 ContentAI Day 1 执行脚本"
echo "=========================="
echo ""

# 1. Vercel部署
echo "📦 Step 1: Vercel部署"
echo "----------------------"
echo "请执行以下命令:"
echo ""
echo "cd /root/.openclaw/workspace/contentai/src"
echo "npx vercel login"
echo "npx vercel --prod"
echo ""
read -p "按Enter继续..."

# 2. Railway数据库
echo ""
echo "🗄️  Step 2: Railway数据库"
echo "-------------------------"
echo "请执行以下命令:"
echo ""
echo "cd /root/.openclaw/workspace/contentai/src"
echo "railway login"
echo "railway init"
echo "railway add postgres"
echo ""
read -p "按Enter继续..."

# 3. 环境变量
echo ""
echo "⚙️  Step 3: 配置环境变量"
echo "------------------------"
echo "在Vercel Dashboard中设置:"
echo "- DATABASE_URL"
echo "- KIMI_API_KEY"
echo "- NEXTAUTH_SECRET"
echo "- NEXTAUTH_URL"
echo ""
read -p "按Enter继续..."

# 4. 数据库迁移
echo ""
echo "🔄 Step 4: 数据库迁移"
echo "---------------------"
echo "请执行:"
echo "npx prisma migrate deploy"
echo ""
read -p "按Enter继续..."

echo ""
echo "✅ Day 1 上午任务完成!"
echo ""
echo "下午任务:"
echo "- 微信小程序申请"
echo "- 小红书账号注册"
echo "- 内容素材准备"
