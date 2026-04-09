#!/bin/bash
# 🔐 AI Empire 环境变量配置脚本
# 使用方法: source setup-env.sh
# 或者: bash setup-env.sh 然后复制export命令

echo "========================================"
echo "🔐 AI Empire 环境变量配置向导"
echo "========================================"
echo ""
echo "这个脚本会帮你设置所有需要的环境变量"
echo "所有信息只保存在当前会话，不会写入文件"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}提示: 输入时不会显示字符（安全保护）${NC}"
echo ""

# 1. Cloudflare配置
echo "========================================"
echo "1️⃣ Cloudflare 配置（部署API服务）"
echo "========================================"
echo ""
echo "方式A: API Token (推荐)"
echo "获取: https://dash.cloudflare.com/profile/api-tokens"
echo "选择 'Edit Cloudflare Workers' 模板"
echo ""
read -s -p "输入 Cloudflare API Token: " CF_TOKEN
echo ""

if [ -n "$CF_TOKEN" ]; then
    export CLOUDFLARE_API_TOKEN="$CF_TOKEN"
    echo -e "${GREEN}✅ CLOUDFLARE_API_TOKEN 已设置${NC}"
else
    echo -e "${RED}⚠️  跳过 Cloudflare 配置${NC}"
fi

echo ""

# 2. Stripe配置
echo "========================================"
echo "2️⃣ Stripe 配置（收款功能）"
echo "========================================"
echo ""
echo "获取: https://dashboard.stripe.com/apikeys"
echo "确保切换到 'Live mode'"
echo ""
read -s -p "输入 Stripe Publishable Key (pk_live_...): " STRIPE_PK
echo ""
read -s -p "输入 Stripe Secret Key (sk_live_...): " STRIPE_SK
echo ""

if [ -n "$STRIPE_PK" ]; then
    export STRIPE_PUBLISHABLE_KEY="$STRIPE_PK"
    echo -e "${GREEN}✅ STRIPE_PUBLISHABLE_KEY 已设置${NC}"
fi

if [ -n "$STRIPE_SK" ]; then
    export STRIPE_SECRET_KEY="$STRIPE_SK"
    echo -e "${GREEN}✅ STRIPE_SECRET_KEY 已设置${NC}"
fi

echo ""

# 3. 域名配置
echo "========================================"
echo "3️⃣ 域名配置（已购买的域名）"
echo "========================================"
echo ""
echo "示例: eucrossborder.com, ukcrossborder.com"
echo ""
read -p "输入欧盟域名: " DOMAIN_EU
read -p "输入英国域名: " DOMAIN_UK
read -p "输入美国域名 (可选): " DOMAIN_US
read -p "输入加拿大域名 (可选): " DOMAIN_CA

if [ -n "$DOMAIN_EU" ]; then
    export DOMAIN_EU="$DOMAIN_EU"
    echo -e "${GREEN}✅ DOMAIN_EU=$DOMAIN_EU${NC}"
fi

if [ -n "$DOMAIN_UK" ]; then
    export DOMAIN_UK="$DOMAIN_UK"
    echo -e "${GREEN}✅ DOMAIN_UK=$DOMAIN_UK${NC}"
fi

if [ -n "$DOMAIN_US" ]; then
    export DOMAIN_US="$DOMAIN_US"
    echo -e "${GREEN}✅ DOMAIN_US=$DOMAIN_US${NC}"
fi

if [ -n "$DOMAIN_CA" ]; then
    export DOMAIN_CA="$DOMAIN_CA"
    echo -e "${GREEN}✅ DOMAIN_CA=$DOMAIN_CA${NC}"
fi

echo ""

# 4. Reddit配置
echo "========================================"
echo "4️⃣ Reddit 配置（自动发帖获客）"
echo "========================================"
echo ""
echo "获取: https://www.reddit.com/prefs/apps"
echo "创建 'script' 类型应用"
echo ""
read -p "输入 Reddit 用户名: " REDDIT_USER
read -s -p "输入 Reddit 密码: " REDDIT_PASS
echo ""
read -p "输入 Reddit Client ID: " REDDIT_ID
read -s -p "输入 Reddit Client Secret: " REDDIT_SECRET
echo ""

if [ -n "$REDDIT_USER" ]; then
    export REDDIT_USERNAME="$REDDIT_USER"
    export REDDIT_PASSWORD="$REDDIT_PASS"
    export REDDIT_CLIENT_ID="$REDDIT_ID"
    export REDDIT_CLIENT_SECRET="$REDDIT_SECRET"
    echo -e "${GREEN}✅ Reddit 配置已设置${NC}"
fi

echo ""
echo "========================================"
echo "✅ 环境变量配置完成！"
echo "========================================"
echo ""
echo "已设置的环境变量:"
echo "-------------------"
env | grep -E "(CLOUDFLARE|STRIPE|DOMAIN|REDDIT)" | sed 's/=.*$/=***/' || echo "无"
echo ""
echo -e "${YELLOW}注意: 这些变量只在当前终端会话有效${NC}"
echo ""
echo "💡 永久保存方法:"
echo "   1. 添加到 ~/.bashrc 或 ~/.zshrc:"
echo "      echo 'export CLOUDFLARE_API_TOKEN=$CF_TOKEN' >> ~/.bashrc"
echo "   2. 或创建 ~/.env 文件并在脚本中加载"
echo ""
echo "🔧 现在可以运行部署命令:"
echo "   cd /root/ai-empire/projects/eucrossborder-api && npm run deploy"
echo ""

# 生成永久保存脚本
SCRIPT_FILE="/tmp/save-ai-empire-env.sh"
cat > "$SCRIPT_FILE" << 'INNER_EOF'
#!/bin/bash
# AI Empire 环境变量永久保存脚本
# 运行: bash /tmp/save-ai-empire-env.sh

echo "选择保存方式:"
echo "1) 保存到 ~/.bashrc (推荐 for bash)"
echo "2) 保存到 ~/.zshrc (推荐 for zsh)"
echo "3) 保存到 ~/.ai-empire-env (专用文件)"
echo "4) 退出不保存"
read -p "选择 (1-4): " choice

case $choice in
    1)
        cat >> ~/.bashrc << EOF

# AI Empire 环境变量配置
export CLOUDFLARE_API_TOKEN='${CLOUDFLARE_API_TOKEN}'
export STRIPE_PUBLISHABLE_KEY='${STRIPE_PUBLISHABLE_KEY}'
export STRIPE_SECRET_KEY='${STRIPE_SECRET_KEY}'
export DOMAIN_EU='${DOMAIN_EU}'
export DOMAIN_UK='${DOMAIN_UK}'
export DOMAIN_US='${DOMAIN_US}'
export DOMAIN_CA='${DOMAIN_CA}'
EOF
        echo "✅ 已保存到 ~/.bashrc"
        echo "   运行 'source ~/.bashrc' 加载"
        ;;
    2)
        cat >> ~/.zshrc << EOF

# AI Empire 环境变量配置
export CLOUDFLARE_API_TOKEN='${CLOUDFLARE_API_TOKEN}'
export STRIPE_PUBLISHABLE_KEY='${STRIPE_PUBLISHABLE_KEY}'
export STRIPE_SECRET_KEY='${STRIPE_SECRET_KEY}'
export DOMAIN_EU='${DOMAIN_EU}'
export DOMAIN_UK='${DOMAIN_UK}'
export DOMAIN_US='${DOMAIN_US}'
export DOMAIN_CA='${DOMAIN_CA}'
EOF
        echo "✅ 已保存到 ~/.zshrc"
        echo "   运行 'source ~/.zshrc' 加载"
        ;;
    3)
        mkdir -p ~/.ai-empire
        cat > ~/.ai-empire/env << EOF
# AI Empire 环境变量配置
export CLOUDFLARE_API_TOKEN='${CLOUDFLARE_API_TOKEN}'
export STRIPE_PUBLISHABLE_KEY='${STRIPE_PUBLISHABLE_KEY}'
export STRIPE_SECRET_KEY='${STRIPE_SECRET_KEY}'
export DOMAIN_EU='${DOMAIN_EU}'
export DOMAIN_UK='${DOMAIN_UK}'
export DOMAIN_US='${DOMAIN_US}'
export DOMAIN_CA='${DOMAIN_CA}'
EOF
        chmod 600 ~/.ai-empire/env
        echo "✅ 已保存到 ~/.ai-empire/env (权限: 600)"
        echo "   运行 'source ~/.ai-empire/env' 加载"
        ;;
    4)
        echo "已退出，环境变量未永久保存"
        ;;
    *)
        echo "无效选择"
        ;;
esac
INNER_EOF

echo "💾 永久保存脚本已生成: $SCRIPT_FILE"
echo "   运行: bash $SCRIPT_FILE"
echo ""
