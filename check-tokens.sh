#!/bin/bash
# 🔐 AI Empire Token 自动刷新脚本
# 使用方法: bash refresh-tokens.sh

echo "========================================"
echo "🔐 Token 状态检查和刷新"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查Cloudflare Token
echo "📋 检查 Cloudflare Token..."
CF_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}")

if [ "$CF_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Cloudflare Token 有效${NC}"
else
    echo -e "${RED}❌ Cloudflare Token 无效或过期${NC}"
    echo "   请访问: https://dash.cloudflare.com/profile/api-tokens"
    echo "   创建新的 Token，然后更新 env-export.sh"
fi

echo ""

# 检查Stripe Key
echo "📋 检查 Stripe Key..."
STRIPE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  https://api.stripe.com/v1/account \
  -u "${STRIPE_SECRET_KEY}:")

if [ "$STRIPE_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Stripe Key 有效${NC}"
else
    echo -e "${RED}❌ Stripe Key 无效${NC}"
    echo "   请访问: https://dashboard.stripe.com/apikeys"
    echo "   获取新的 Secret Key"
fi

echo ""
echo "========================================"
echo "📅 建议设置日历提醒"
echo "========================================"
echo ""
echo "Token 通常7-90天过期，建议:"
echo "  - 设置日历提醒: 每6个月检查一次"
echo "  - 或者创建永不过期的 Token"
echo ""
echo "创建永不过期 Token:"
echo "  1. https://dash.cloudflare.com/profile/api-tokens"
echo "  2. Create Token → Custom token"
echo "  3. TTL 选择 'Never'"
echo ""
