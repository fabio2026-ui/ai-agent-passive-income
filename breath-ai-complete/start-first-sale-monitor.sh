#!/bin/bash
# Breath AI 首单监控启动脚本
# 创建时间: 2026-03-21

SCRIPT_DIR="/root/.openclaw/workspace"
LOG_DIR="$SCRIPT_DIR/logs"
MONITOR_SCRIPT="$SCRIPT_DIR/first-sale-monitor.py"
CONFIG_FILE="/root/.openclaw/workspace/breath-ai-complete/first-sale-monitor.conf"
PID_FILE="/tmp/breath-ai-monitor.pid"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧘 Breath AI 首单监控系统${NC}"
echo "=========================================="

# 创建日志目录
mkdir -p "$LOG_DIR"

# 检查Python脚本是否存在
if [ ! -f "$MONITOR_SCRIPT" ]; then
    echo -e "${RED}❌ 错误: 找不到监控脚本 $MONITOR_SCRIPT${NC}"
    exit 1
fi

# 检查配置文件
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}⚠️ 警告: 配置文件不存在，将使用默认配置${NC}"
fi

# 检查是否已在运行
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ 监控进程已在运行 (PID: $PID)${NC}"
        echo "   使用 ./stop-monitor.sh 停止"
        exit 0
    else
        rm -f "$PID_FILE"
    fi
fi

# 添加Breath AI到监控列表
echo -e "${BLUE}📋 配置监控项目...${NC}"

# 更新first-sale-state.json以包含Breath AI
STATE_FILE="$SCRIPT_DIR/first-sale-state.json"
if [ -f "$STATE_FILE" ]; then
    python3 << EOF
import json
import os

state_file = "$STATE_FILE"
with open(state_file, 'r') as f:
    state = json.load(f)

# 添加Breath AI到监控列表
if 'breath-ai' not in state.get('projects', {}):
    state.setdefault('projects', {})
    state['projects']['breath-ai'] = {
        'name': 'Breath AI',
        'status': 'active',
        'first_sale_detected': False,
        'keywords': ['breath', 'breath ai', 'breathing'],
        'target_amount': 19.99,
        'currency': 'USD'
    }
    with open(state_file, 'w') as f:
        json.dump(state, f, indent=2)
    print("✅ Breath AI 已添加到监控列表")
else:
    print("✅ Breath AI 已在监控列表中")
EOF
else
    # 创建新的状态文件
    cat > "$STATE_FILE" << 'EOF'
{
  "projects": {
    "breath-ai": {
      "name": "Breath AI",
      "status": "active",
      "first_sale_detected": false,
      "keywords": ["breath", "breath ai", "breathing"],
      "target_amount": 19.99,
      "currency": "USD"
    }
  },
  "last_check": null,
  "total_orders": 0
}
EOF
    echo "✅ 已创建新的监控状态文件"
fi

# 启动监控进程
echo -e "${BLUE}🚀 启动首单监控...${NC}"
nohup python3 "$MONITOR_SCRIPT" --daemon > "$LOG_DIR/breath-ai-monitor.log" 2>&1 &
PID=$!
echo $PID > "$PID_FILE"

sleep 2

# 检查进程是否成功启动
if ps -p "$PID" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 监控进程已启动 (PID: $PID)${NC}"
    echo ""
    echo -e "${BLUE}📊 监控状态:${NC}"
    echo "   进程ID: $PID"
    echo "   日志文件: $LOG_DIR/breath-ai-monitor.log"
    echo "   状态文件: $STATE_FILE"
    echo ""
    echo -e "${BLUE}📈 监控项目:${NC}"
    echo "   - Breath AI ($19.99)"
    echo ""
    echo -e "${YELLOW}💡 提示:${NC}"
    echo "   查看日志: tail -f $LOG_DIR/breath-ai-monitor.log"
    echo "   停止监控: kill $PID"
    echo ""
    echo -e "${GREEN}🎯 目标: 获取首单收入，系统将自动通知！${NC}"
else
    echo -e "${RED}❌ 启动失败，请检查日志${NC}"
    exit 1
fi
