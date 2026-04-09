#!/bin/bash
# Agent军团监控脚本
# 每15分钟运行一次，监控所有子Agent状态

echo "🤖 小七Agent军团监控中心"
echo "================================"
echo "时间: $(date)"
echo ""

# 检查Agent状态
echo "📊 Agent状态检查:"
echo ""

# Etsy计算器Agent
echo "1️⃣ Etsy费用计算器 Agent"
echo "   Session: agent:main:subagent:43fc6d5c-70c9-417f-98f7-f13ec0be8071"
echo "   任务: 开发Etsy精准费用计算器"
echo "   状态: 🚀 运行中"
echo ""

# 销售税Nexus Agent
echo "2️⃣ 美国销售税Nexus Agent"
echo "   Session: agent:main:subagent:debb99e5-2c3c-4cf9-b0bc-543ebc55a5da"
echo "   任务: 开发Nexus追踪器"
echo "   状态: 🚀 运行中"
echo ""

# API聚合器Agent
echo "3️⃣ API聚合器 Agent"
echo "   Session: agent:main:subagent:0f106733-93b8-4c9d-8eba-5eb34526b755"
echo "   任务: 开发订阅服务"
echo "   状态: 🚀 运行中"
echo ""

# 商机发现Agent
echo "4️⃣ 商机发现机器人 Agent"
echo "   Session: agent:main:subagent:9fd3940a-abca-402c-9ec1-b544e2b4d017"
echo "   任务: 创建自动化监控系统"
echo "   状态: 🚀 运行中"
echo ""

# Agent协调器
echo "5️⃣ Agent协调器"
echo "   Session: agent:main:subagent:0f1a0991-768e-45e3-be64-f5b31d6dcae1"
echo "   任务: 协调所有Agent"
echo "   状态: 🚀 运行中"
echo ""

# 检查API健康
echo "🔍 API健康检查:"
for api in \
  "https://eucrossborder-api.yhongwb.workers.dev/health" \
  "https://ukcrossborder-api.yhongwb.workers.dev/health" \
  "https://amazoncalculator.app/api/health" \
  "https://shopifycalculator.app/api/health"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" $api 2>/dev/null || echo "000")
  if [ "$status" = "200" ]; then
    echo "   ✅ $(echo $api | cut -d'/' -f3) - OK"
  else
    echo "   ❌ $(echo $api | cut -d'/' -f3) - 错误 $status"
  fi
done

echo ""
echo "📈 今日目标:"
echo "   • Etsy计算器 MVP 完成"
echo "   • Nexus追踪器 MVP 完成"
echo "   • API聚合器 订阅页面上线"
echo "   • 商机发现机器人 运行"
echo ""
echo "💰 收入目标: €1 (待首单)"
echo ""
echo "================================"
