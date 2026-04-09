#!/bin/bash
# ContentAI 全自动获客系统启动脚本

echo "=============================================="
echo "🚀 ContentAI 全自动获客系统"
echo "=============================================="

WORK_DIR="/root/.openclaw/workspace/contentai/auto-execution"
cd $WORK_DIR

# 检查Python环境
echo "[*] 检查环境..."
python3 --version || { echo "[!] Python3 未安装"; exit 1; }

# 安装依赖
echo "[*] 安装依赖..."
pip3 install flask -q 2>/dev/null || echo "[!] Flask 安装跳过"

# 创建必要目录
mkdir -p data logs

# 启动落地页（后台运行）
echo "[*] 启动落地页服务..."
nohup python3 landing_page.py > logs/flask.log 2>&1 &
echo $! > logs/flask.pid
echo "[✓] 落地页服务已启动 (PID: $(cat logs/flask.pid))"
echo "    访问: http://localhost:5000"

# 运行发布机器人
echo ""
echo "[*] 启动内容发布机器人..."
python3 publishing_bot.py

echo ""
echo "=============================================="
echo "系统状态:"
echo "  - 落地页: http://localhost:5000"
echo "  - 日志: $WORK_DIR/logs/"
echo "  - 数据: $WORK_DIR/data/"
echo "=============================================="
echo ""
echo "获取收入的方式:"
echo "  1. 落地页捐赠 (加密货币)"
echo "  2. 收集的潜在客户邮箱"
echo "  3. 内容引流转化"
echo ""
echo "查看统计: curl http://localhost:5000/api/stats"
echo "=============================================="