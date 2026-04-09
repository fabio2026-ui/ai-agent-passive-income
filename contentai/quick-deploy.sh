#!/bin/bash
# ContentAI 一键部署脚本
# 执行方式: bash quick-deploy.sh

set -e

echo "🚀 ContentAI 一键部署"
echo "======================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安装，正在安装..."
        npm install -g $1
    fi
    echo -e "${GREEN}✅ $1 就绪${NC}"
}

echo "📋 步骤1: 检查工具"
echo "-------------------"
check_command "vercel"
check_command "railway"

echo ""
echo "📦 步骤2: Vercel部署"
echo "--------------------"
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  未设置VERCEL_TOKEN，使用交互式登录${NC}"
    echo "执行: npx vercel login"
    npx vercel login
fi

echo "部署到Vercel..."
cd /root/.openclaw/workspace/contentai/src
npx vercel --prod

echo ""
echo "🗄️ 步骤3: Railway数据库"
echo "------------------------"
echo "登录Railway..."
railway login

echo "初始化项目..."
railway init

echo "添加PostgreSQL..."
railway add postgres

echo ""
echo "⚙️ 步骤4: 环境变量配置"
echo "----------------------"
echo "请在Vercel Dashboard中设置以下环境变量:"
echo ""
echo "  DATABASE_URL     - 从Railway获取"
echo "  KIMI_API_KEY     - 你的Kimi API密钥"
echo "  NEXTAUTH_SECRET  - $(openssl rand -base64 32)"
echo "  NEXTAUTH_URL     - 部署后的域名"
echo ""

echo ""
echo -e "${GREEN}✅ 部署脚本准备完成！${NC}"
echo ""
echo "下一步:"
echo "1. 执行此脚本完成部署"
echo "2. 配置环境变量"
echo "3. 访问部署后的网站"
