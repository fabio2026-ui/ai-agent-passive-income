#!/bin/bash
# Agent协调器启动脚本

cd /root/.openclaw/workspace

echo "🤖 Agent 协调器系统"
echo "==================="

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3"
    exit 1
fi

# 安装依赖
echo "📦 检查依赖..."
pip3 install aiohttp -q 2>/dev/null || true

# 启动协调器
echo "🚀 启动协调器..."
python3 -m agent_coordinator.run "$@"
