#!/bin/bash
# ContentAI 自动化部署 - 使用localtunnel

echo "🚀 ContentAI 自动部署"
echo "====================="

cd /root/.openclaw/workspace/contentai/src

# 确保构建完成
if [ ! -d "dist" ]; then
    echo "📦 构建中..."
    npm run build > /dev/null 2>&1
fi

# 启动本地服务器
echo "🖥️  启动本地服务器..."
(pkill -f "serve -s dist" 2>/dev/null || true)
serve -s dist -l 3456 > /dev/null 2>&1 &
echo "服务器PID: $!"
sleep 3

# 启动localtunnel
echo "🌐 创建公网访问..."
npx localtunnel --port 3456 &
echo "隧道PID: $!"
sleep 5

echo ""
echo "✅ 部署完成！"
echo ""

# 获取URL
echo "🌎 公网地址:"
curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "检查localtunnel输出..."

echo ""
echo "📊 状态检查:"
curl -s http://localhost:3456 > /dev/null && echo "✅ 本地服务器运行中" || echo "❌ 本地服务器异常"

echo ""
echo "⚠️ 注意: 这是临时公网地址，重启后会变化"
echo "如需永久部署，请使用Vercel/Netlify/Cloudflare Pages"
