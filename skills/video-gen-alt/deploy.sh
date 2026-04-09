#!/bin/bash
# 即梦AI API 快速部署脚本

echo "🚀 部署即梦AI API服务..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 请先安装Docker"
    echo "   Ubuntu: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# 停止并删除旧容器
if docker ps -a | grep -q jimeng-api; then
    echo "🛑 停止旧容器..."
    docker stop jimeng-api 2>/dev/null
    docker rm jimeng-api 2>/dev/null
fi

# 拉取最新镜像
echo "📥 拉取镜像..."
docker pull wwwzhouhui569/jimeng-free-api-all:latest

# 启动容器
echo "🟢 启动服务..."
docker run -d \
    --name jimeng-api \
    -p 8001:8000 \
    -e TZ=Asia/Shanghai \
    --restart unless-stopped \
    wwwzhouhui569/jimeng-free-api-all:latest

# 检查启动状态
sleep 3
if docker ps | grep -q jimeng-api; then
    echo "✅ 服务启动成功!"
    echo ""
    echo "📍 API地址: http://localhost:8001"
    echo "📖 文档: http://localhost:8001/docs"
    echo ""
    echo "🔑 使用方法:"
    echo "   export JIMENG_SESSION_ID='your_session_id'"
    echo "   python generate_video.py '你的prompt'"
    echo ""
    echo "⚠️  注意: 需要先获取即梦官网的sessionid"
else
    echo "❌ 服务启动失败，请检查日志:"
    docker logs jimeng-api
    exit 1
fi
