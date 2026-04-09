#!/bin/bash
# 🔧 EU CrossBorder API 故障排查与修复脚本
# 问题: 522错误 (Cloudflare无法连接源服务器)

echo "=========================================="
echo "🔧 EU CrossBorder API 故障修复"
echo "=========================================="
echo ""

# 1. 检查域名DNS设置
echo "📋 步骤1: 检查DNS配置..."
echo "当前DNS记录:"
dig +short eucrossborder.com
 dig +short www.eucrossborder.com
echo ""

# 2. 检查Worker状态
echo "📋 步骤2: 检查Cloudflare Worker..."
# 通过Cloudflare API检查Worker状态
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=eucrossborder.com" \
  -H "Authorization: Bearer W-rQqHrEX2WTU1F2nfI92c6ioOvjzPkvWMjXqim3" \
  -H "Content-Type: application/json" 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$ZONE_ID" ]; then
    echo "Zone ID: $ZONE_ID"
    
    # 获取Worker脚本
    curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/script" \
      -H "Authorization: Bearer W-rQqHrEX2WTU1F2nfI92c6ioOvjzPkvWMjXqim3" 2>/dev/null | head -5
else
    echo "⚠️ 无法获取Zone ID"
fi
echo ""

# 3. 重新部署Worker
echo "📋 步骤3: 重新部署Worker..."

# 检查wrangler配置
if [ -d "/root/ai-empire/api/eu-crossborder" ]; then
    cd /root/ai-empire/api/eu-crossborder
    echo "找到项目目录"
    
    # 检查wrangler.toml
    if [ -f "wrangler.toml" ]; then
        echo "✅ wrangler.toml 存在"
        cat wrangler.toml
    else
        echo "⚠️ wrangler.toml 不存在"
    fi
else
    echo "⚠️ 项目目录不存在，检查其他路径..."
    find /root -name "*eu*crossborder*" -type d 2>/dev/null | head -5
fi
echo ""

# 4. 临时解决方案: 设置备用路由
echo "📋 步骤4: 检查备用方案..."
echo "如果主Worker无法恢复，考虑:"
echo "  1. 创建新的Worker子域名"
echo "  2. 使用UK API作为备用"
echo "  3. 直接访问Worker.dev域名"
echo ""

# 5. 测试Worker.dev直接访问
echo "📋 步骤5: 测试Worker直接访问..."
curl -s -o /dev/null -w "HTTP状态: %{http_code}, 耗时: %{time_total}s\n" \
  https://eu-crossborder-api.yhongwb.workers.dev/health 2>/dev/null || echo "Worker.dev也无法访问"
echo ""

echo "=========================================="
echo "🔧 修复建议"
echo "=========================================="
echo ""
echo "522错误通常意味着:"
echo "1. 源服务器宕机"
echo "2. Cloudflare Worker脚本错误"
echo "3. DNS指向错误"
echo ""
echo "下一步行动:"
echo "1. 检查Worker脚本是否有错误"
echo "2. 重新部署Worker"
echo "3. 如果无法修复，临时使用worker.dev域名"
echo ""
