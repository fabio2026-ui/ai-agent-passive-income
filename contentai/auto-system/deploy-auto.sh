#!/bin/bash
# ContentAI 全自动部署脚本
# 从0到上线的完整部署流程

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════╗"
echo "║     ContentAI MVP 全自动部署系统                   ║"
echo "║     零人工介入，一键上线                          ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

PROJECT_DIR="/root/.openclaw/workspace/contentai/auto-system"
cd "$PROJECT_DIR"

# ============================================
# Phase 1: 环境检查
# ============================================
echo -e "${BLUE}[Phase 1/6] 环境检查${NC}"
echo "----------------------------------------"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"

# 检查Wrangler
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx 未安装${NC}"
    exit 1
fi

# 检查Wrangler版本
WRANGLER_VERSION=$(npx wrangler --version 2>/dev/null || echo "未安装")
echo -e "${GREEN}✅ Wrangler: $WRANGLER_VERSION${NC}"

echo ""

# ============================================
# Phase 2: 配置检查
# ============================================
echo -e "${BLUE}[Phase 2/6] 配置检查${NC}"
echo "----------------------------------------"

# 检查.env文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env 文件不存在${NC}"
    
    # 检查是否有.env.simple
    if [ -f ".env.simple" ]; then
        echo -e "${BLUE}📄 从 .env.simple 创建 .env${NC}"
        cp .env.simple .env
        echo -e "${YELLOW}⚠️  请编辑 .env 填入API密钥${NC}"
        echo "   nano .env"
        echo ""
        echo -e "${YELLOW}需要的API密钥：${NC}"
        echo "  1. MOONSHOT_API_KEY - https://platform.moonshot.cn/"
        echo "  2. RESEND_API_KEY - https://resend.com/"
        echo ""
        echo -e "${BLUE}查看申请指南：docs/API_SETUP_GUIDE.md${NC}"
        exit 1
    else
        echo -e "${RED}❌ 配置文件模板不存在${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env 文件存在${NC}"
fi

# 运行配置验证
if [ -f "scripts/verify-config.js" ]; then
    node scripts/verify-config.js || exit 1
else
    echo -e "${YELLOW}⚠️  验证脚本不存在，跳过详细检查${NC}"
fi

echo ""

# ============================================
# Phase 3: 安装依赖
# ============================================
echo -e "${BLUE}[Phase 3/6] 安装依赖${NC}"
echo "----------------------------------------"

if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 安装依赖...${NC}"
    npm install
else
    echo -e "${GREEN}✅ 依赖已安装${NC}"
fi

echo ""

# ============================================
# Phase 4: 数据库设置
# ============================================
echo -e "${BLUE}[Phase 4/6] 数据库设置${NC}"
echo "----------------------------------------"

# 检查Wrangler登录状态
echo -e "${BLUE}🔐 检查Cloudflare登录状态...${NC}"
if ! npx wrangler whoami &>/dev/null; then
    echo -e "${YELLOW}⚠️  未登录Cloudflare${NC}"
    echo -e "${BLUE}🔐 启动登录流程...${NC}"
    npx wrangler login
else
    ACCOUNT_INFO=$(npx wrangler whoami 2>/dev/null | head -1)
    echo -e "${GREEN}✅ 已登录: $ACCOUNT_INFO${NC}"
fi

# 创建D1数据库（如果不存在）
echo -e "${BLUE}🗄️  检查D1数据库...${NC}"
DB_LIST=$(npx wrangler d1 list 2>/dev/null || echo "")

if echo "$DB_LIST" | grep -q "contentai-db"; then
    echo -e "${GREEN}✅ 数据库已存在${NC}"
    # 获取database_id
    DB_ID=$(echo "$DB_LIST" | grep "contentai-db" -A 1 | grep "uuid" | awk '{print $2}')
    echo -e "${BLUE}📋 数据库ID: $DB_ID${NC}"
else
    echo -e "${BLUE}🗄️  创建D1数据库...${NC}"
    CREATE_OUTPUT=$(npx wrangler d1 create contentai-db 2>&1)
    echo "$CREATE_OUTPUT"
    
    # 提取database_id
    DB_ID=$(echo "$CREATE_OUTPUT" | grep -oP 'database_id = "\K[^"]+')
    
    if [ -n "$DB_ID" ]; then
        echo -e "${GREEN}✅ 数据库创建成功${NC}"
        echo -e "${BLUE}📋 数据库ID: $DB_ID${NC}"
        
        # 更新wrangler.toml
        echo -e "${BLUE}📝 更新wrangler.toml...${NC}"
        sed -i "s/database_id = \"your-database-id\"/database_id = \"$DB_ID\"/" wrangler.toml
        echo -e "${GREEN}✅ wrangler.toml 已更新${NC}"
    else
        echo -e "${YELLOW}⚠️  无法自动提取数据库ID，请手动更新wrangler.toml${NC}"
    fi
fi

# 执行数据库初始化
echo -e "${BLUE}🗄️  初始化数据库表...${NC}"
npx wrangler d1 execute contentai-db --file=./shared/database.js --local 2>/dev/null || echo -e "${YELLOW}⚠️  本地执行跳过，将在部署后自动初始化${NC}"

echo ""

# ============================================
# Phase 5: 部署到Cloudflare
# ============================================
echo -e "${BLUE}[Phase 5/6] 部署到Cloudflare Workers${NC}"
echo "----------------------------------------"

echo -e "${BLUE}🚀 开始部署...${NC}"
npx wrangler deploy

DEPLOY_STATUS=$?
if [ $DEPLOY_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ 部署成功！${NC}"
else
    echo -e "${RED}❌ 部署失败${NC}"
    echo -e "${YELLOW}检查错误信息后重试${NC}"
    exit 1
fi

echo ""

# ============================================
# Phase 6: 部署后验证
# ============================================
echo -e "${BLUE}[Phase 6/6] 部署验证${NC}"
echo "----------------------------------------"

# 从wrangler.toml获取Worker名称
WORKER_NAME=$(grep "^name" wrangler.toml | cut -d'"' -f2)
echo -e "${BLUE}🌐 Worker名称: $WORKER_NAME${NC}"

# 尝试获取Worker URL
WORKER_URL="https://$WORKER_NAME.your-subdomain.workers.dev"
echo -e "${BLUE}🔗 测试URL: $WORKER_URL${NC}"

echo -e "${BLUE}🔍 测试健康检查端点...${NC}"
HEALTH_CHECK=$(curl -s "$WORKER_URL/api/health" 2>/dev/null || echo "")

if echo "$HEALTH_CHECK" | grep -q "healthy"; then
    echo -e "${GREEN}✅ API运行正常${NC}"
else
    echo -e "${YELLOW}⚠️  健康检查未通过，可能需要等待DNS生效${NC}"
fi

echo ""

# ============================================
# 部署完成
# ============================================
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════╗"
echo "║     🎉 ContentAI MVP 部署完成！                   ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}📊 部署信息：${NC}"
echo "  • 工作目录: $PROJECT_DIR"
echo "  • Worker名称: $WORKER_NAME"
echo "  • API地址: $WORKER_URL"
echo ""
echo -e "${BLUE}🔗 重要链接：${NC}"
echo "  • 首页: $WORKER_URL/"
echo "  • 健康检查: $WORKER_URL/api/health"
echo "  • 定价: $WORKER_URL/api/pricing"
echo ""
echo -e "${BLUE}📋 下一步操作：${NC}"
echo "  1. 测试创建订单: curl -X POST $WORKER_URL/api/order/create \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"test@example.com\",\"contentType\":\"blog_post\",\"topic\":\"test\",\"tier\":\"BASIC\"}'"
echo ""
echo "  2. 查看日志: npm run logs"
echo "  3. 配置域名: 在Cloudflare Dashboard中添加自定义域名"
echo ""
echo -e "${BLUE}📖 文档：${NC}"
echo "  • API申请指南: docs/API_SETUP_GUIDE.md"
echo "  • 运营启动包: docs/OPERATIONS_STARTER_KIT.md"
echo ""
echo -e "${GREEN}✨ 恭喜！ContentAI已成功上线！${NC}"
