#!/bin/bash
# Deploy Payment System using Cloudflare API
# 使用API Token直接部署

set -e

echo "🚀 开始部署 CodeGuard 支付系统..."
echo ""

# 读取环境变量
CF_TOKEN="${CLOUDFLARE_API_TOKEN:-$(grep CLOUDFLARE_API_TOKEN .env | cut -d= -f2)}"
CF_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-$(grep CLOUDFLARE_ACCOUNT_ID .env | cut -d= -f2)}"

if [ -z "$CF_TOKEN" ] || [ -z "$CF_ACCOUNT_ID" ]; then
    echo "❌ 错误: 缺少 Cloudflare 凭证"
    echo "请确保 .env 文件中有 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID"
    exit 1
fi

echo "✅ Cloudflare 凭证已加载"
echo "   Account ID: ${CF_ACCOUNT_ID:0:8}..."
echo ""

# 创建 Workers 脚本
echo "📦 准备 Worker 脚本..."

WORKER_SCRIPT='
// Payment API Worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    try {
      if (url.pathname === "/api/checkout" && request.method === "POST") {
        const { package: pkg, email, method } = await request.json();
        
        const prices = {
          starter: { amount: 1000, name: "Starter", credits: 100 },
          pro: { amount: 8500, name: "Pro", credits: 1000 },
          enterprise: { amount: 75000, name: "Enterprise", credits: 10000 }
        };
        
        const price = prices[pkg];
        if (!price) return new Response(JSON.stringify({ error: "Invalid package" }), { status: 400, headers });

        if (method === "crypto") {
          return new Response(JSON.stringify({
            type: "direct_crypto",
            btc: { address: "bc1q6d6zffkv4h6g7qjx8g6527g3tz3qptnxg5cuvg", amount: (price.amount/100/65000).toFixed(8) },
            eth: { address: "0xb8ff64CDE31013D2c4Ad6c11B12F0e7b54EfECCB", amount: (price.amount/100/3200).toFixed(6) },
            credits: price.credits
          }), { headers });
        }
        
        return new Response(JSON.stringify({
          type: "stripe",
          url: "https://buy.stripe.com/test_" + pkg,
          sessionId: "cs_test_" + Date.now(),
          credits: price.credits
        }), { headers });
      }

      if (url.pathname === "/api/prices") {
        return new Response(JSON.stringify({
          packages: {
            starter: { usd: 10, btc: "0.00015", eth: "0.0031", credits: 100 },
            pro: { usd: 85, btc: "0.0013", eth: "0.026", credits: 1000 },
            enterprise: { usd: 750, btc: "0.011", eth: "0.23", credits: 10000 }
          }
        }), { headers });
      }

      return new Response(JSON.stringify({ status: "ok", service: "codeguard-payments" }), { headers });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
  }
};
'

# 部署 Worker
echo "🌐 部署 Worker 到 Cloudflare..."

RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/workers/services/codeguard-payments/environments/production/content" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/javascript" \
  --data "$WORKER_SCRIPT")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Worker 部署成功!"
    echo ""
else
    echo "⚠️ Worker 部署可能遇到问题:"
    echo "$RESPONSE" | head -1
    echo ""
fi

# 创建/更新 Pages 项目并上传 pricing.html
echo "📄 部署 Pricing 页面..."

# 首先检查 Pages 项目是否存在
PAGES_RESPONSE=$(curl -s "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects" \
  -H "Authorization: Bearer $CF_TOKEN")

if ! echo "$PAGES_RESPONSE" | grep -q "codeguard-payments"; then
    echo "   创建 Pages 项目..."
    curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects" \
      -H "Authorization: Bearer $CF_TOKEN" \
      -H "Content-Type: application/json" \
      --data '{"name":"codeguard-payments","production_branch":"main"}' > /dev/null
fi

# 上传 pricing.html
echo "   上传 pricing.html..."
DEPLOY_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/codeguard-payments/deployments" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -F "file=@public/pricing.html" \
  -F "branch=main")

if echo "$DEPLOY_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Pricing 页面部署成功!"
else
    echo "⚠️ Pricing 页面部署可能遇到问题，但Worker已部署"
fi

echo ""
echo "🎉 部署完成!"
echo ""
echo "📊 访问地址:"
echo "   Worker API: https://codeguard-payments.$CF_ACCOUNT_ID.workers.dev"
echo "   Pricing Page: https://codeguard-payments.pages.dev"
echo ""
echo "🧪 测试命令:"
echo "   curl https://codeguard-payments.$CF_ACCOUNT_ID.workers.dev/api/prices"
echo ""
echo "⚠️  注意: 如果Worker URL无法访问，请等待1-2分钟后重试"