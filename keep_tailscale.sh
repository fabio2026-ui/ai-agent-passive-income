#!/bin/bash
# Tailscale 永久连接脚本
# 保存为 ~/keep_tailscale.sh

while true; do
    # 检查是否已连接
    if ! curl -s http://localhost:9999 > /dev/null; then
        # 重启本地服务
        pkill -f ai_bridge
        python3 /tmp/ai_bridge.py &
    fi
    
    # 检查funnel状态
    tailscale funnel status | grep -q "Funnel on" || tailscale funnel --bg 9999
    
    sleep 300  # 每5分钟检查一次
done
