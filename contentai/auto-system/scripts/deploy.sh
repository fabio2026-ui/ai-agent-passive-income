#!/bin/bash
# ContentAI 全自动系统部署脚本

set -e

echo "🚀 ContentAI 全自动闭环系统部署"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查依赖
echo -e "${YELLOW}检查依赖...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo -e "${RED}错误: npx 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 依赖检查通过${NC}"

# 安装依赖
echo -e "${YELLOW}安装依赖...${NC}"
npm install
echo -e "${GREEN}✓ 依赖安装完成${NC}"

# 登录 Cloudflare
echo -e "${YELLOW}检查 Cloudflare 登录状态...${NC}"
npx wrangler whoami || npx wrangler login
echo -e "${GREEN}✓ 已登录 Cloudflare${NC}"

# 检查 D1 数据库
echo -e "${YELLOW}检查 D1 数据库...${NC}"
DB_LIST=$(npx wrangler d1 list 2>/dev/null || echo "")

if echo "$DB_LIST" | grep -q "contentai-db"; then
    echo -e "${GREEN}✓ 数据库已存在${NC}"
else
    echo -e "${YELLOW}创建 D1 数据库...${NC}"
    npx wrangler d1 create contentai-db
    echo -e "${YELLOW}请复制上面的 database_id 并更新 wrangler.toml${NC}"
    echo -e "${RED}更新后继续执行脚本${NC}"
    exit 0
fi

# 获取 database_id
DB_ID=$(echo "$DB_LIST" | grep -A 1 "contentai-db" | grep "UUID" | awk '{print $2}')
echo -e "${GREEN}数据库 ID: $DB_ID${NC}"

# 初始化数据库表
echo -e "${YELLOW}初始化数据库表...${NC}"
npx wrangler d1 execute contentai-db --file=./scripts/schema.sql
echo -e "${GREEN}✓ 数据库表创建完成${NC}"

# 检查环境变量
echo -e "${YELLOW}检查环境变量配置...${NC}"

if ! grep -q "your_moonshot_api_key" wrangler.toml; then
    echo -e "${GREEN}✓ Moonshot API Key 已配置${NC}"
else
    echo -e "${RED}警告: Moonshot API Key 需要配置${NC}"
fi

if ! grep -q "your_coinbase_api_key" wrangler.toml; then
    echo -e "${GREEN}✓ Coinbase API Key 已配置${NC}"
else
    echo -e "${RED}警告: Coinbase API Key 需要配置${NC}"
fi

# 本地测试
echo -e "${YELLOW}启动本地开发服务器测试...${NC}"
echo -e "按 Ctrl+C 停止测试服务器"
npx wrangler dev &
DEV_PID=$!
sleep 5

# 健康检查
if curl -s http://localhost:8787/api/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ 本地服务器运行正常${NC}"
else
    echo -e "${RED}警告: 本地服务器测试失败${NC}"
fi

kill $DEV_PID 2>/dev/null || true

# 部署到生产
echo -e "${YELLOW}准备部署到生产环境...${NC}"
read -p "确认部署? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}部署中...${NC}"
    npx wrangler deploy
    echo -e "${GREEN}✓ 部署完成!${NC}"
    
    # 获取部署 URL
    DEPLOY_URL=$(grep "pattern" wrangler.toml | head -1 | sed 's/.*pattern = "\(.*\)".*/\1/')
    echo -e "${GREEN}应用地址: https://$DEPLOY_URL${NC}"
else
    echo -e "${YELLOW}部署已取消${NC}"
fi

# 配置定时任务
echo -e "${YELLOW}配置定时任务...${NC}"
npx wrangler triggers update
echo -e "${GREEN}✓ 定时任务配置完成${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🎉 部署完成!${NC}"
echo ""
echo "下一步:"
echo "1. 配置 Coinbase Commerce Webhook: https://commerce.coinbase.com/settings"
echo "   Webhook URL: https://your-domain.com/webhook/coinbase"
echo ""
echo "2. 配置 NowPayments IPN:"
echo "   IPN URL: https://your-domain.com/webhook/nowpayments"
echo ""
echo "3. 测试完整流程:"
echo "   - 访问网站"
echo "   - 创建测试订单"
echo "   - 完成支付"
echo "   - 确认内容生成和邮件发送"
echo ""
echo "4. 开始获客:"
echo "   POST /api/admin/process {\"action\": \"reddit_post\"}"
echo "   POST /api/admin/process {\"action\": \"twitter_post\"}"
echo ""
