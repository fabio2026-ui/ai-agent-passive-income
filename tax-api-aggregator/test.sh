#!/bin/bash
# API测试脚本

BASE_URL="${BASE_URL:-http://localhost:8787}"
API_KEY="${API_KEY:-}"

echo "🧪 Tax API Aggregator 测试"
echo "=========================="
echo "Base URL: $BASE_URL"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 测试函数
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $API_KEY" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $API_KEY" 2>/dev/null)
    fi
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "Response: $response"
        return 1
    fi
}

# 健康检查
echo "📋 健康检查"
curl -s "$BASE_URL/health" | grep -q '"status":"ok"' && echo -e "${GREEN}✓ Health check OK${NC}" || echo -e "${RED}✗ Health check failed${NC}"
echo ""

# 如果没有API密钥，跳过认证测试
if [ -z "$API_KEY" ]; then
    echo "⚠️  未设置API_KEY，跳过认证测试"
    echo "请先注册获取API密钥: curl -X POST $BASE_URL/auth/register ..."
    exit 0
fi

echo "📊 税务计算API测试"
test_endpoint "VAT计算" "POST" "/v1/tax/vat" '{"amount":100,"country":"DE"}'
test_endpoint "企业所得税" "POST" "/v1/tax/corporate" '{"amount":50000,"country":"DE"}'
test_endpoint "个人所得税" "POST" "/v1/tax/personal-income" '{"amount":60000,"country":"DE"}'
test_endpoint "关税计算" "POST" "/v1/tax/customs" '{"amount":1000,"productType":"electronics"}'
test_endpoint "消费税" "POST" "/v1/tax/excise" '{"amount":50,"productCategory":"alcohol","quantity":10}'
test_endpoint "房产税" "POST" "/v1/tax/property" '{"propertyValue":300000,"propertyType":"residential","country":"DE"}'
test_endpoint "印花税" "POST" "/v1/tax/stamp-duty" '{"amount":200000,"transactionType":"property","country":"DE"}'
test_endpoint "车船税" "POST" "/v1/tax/vehicle" '{"engineSize":2000,"co2Emissions":130,"vehicleType":"car","country":"DE"}'
test_endpoint "资源税" "POST" "/v1/tax/resource" '{"amount":100,"resourceType":"mineral","volume":500}'
test_endpoint "土地增值税" "POST" "/v1/tax/land-value" '{"landValue":500000,"holdingPeriod":3}'
test_endpoint "城镇土地使用税" "POST" "/v1/tax/land-use" '{"area":2000,"locationType":"urban","country":"DE"}'
test_endpoint "环境保护税" "POST" "/v1/tax/environmental" '{"emissionAmount":50,"pollutantType":"co2"}'

echo ""
echo "🔑 管理API测试"
test_endpoint "订阅状态" "GET" "/v1/subscription/status" ""
test_endpoint "API密钥列表" "GET" "/v1/api-keys" ""
test_endpoint "使用统计" "GET" "/v1/usage" ""

echo ""
echo "🎉 测试完成!"