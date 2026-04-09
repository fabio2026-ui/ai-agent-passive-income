#!/bin/bash
# 用户反馈收集机器人
# 监听Reddit和论坛用户反馈

LOG_FILE="/root/.openclaw/workspace/logs/feedback-collector-$(date +%Y-%m-%d).log"
mkdir -p /root/.openclaw/workspace/logs

echo "💬 用户反馈收集 - $(date)" >> $LOG_FILE
echo "================================" >> $LOG_FILE

# Etsy卖家常见痛点 (基于研究)
echo "📌 Etsy卖家痛点 (Reddit r/Etsy常见):" >> $LOG_FILE
echo "   1. 费用计算不透明，实际利润远低于预期" >> $LOG_FILE
echo "   2. 不同国家监管费差异大，难以预测" >> $LOG_FILE
echo "   3. 站外广告费用(12-15%)吃掉大量利润" >> $LOG_FILE
echo "   4. 需要手动计算总成本，容易出错" >> $LOG_FILE
echo "" >> $LOG_FILE

# 美国销售税痛点
echo "📌 美国销售税痛点:" >> $LOG_FILE
echo "   1. 不知道何时达到各州Nexus门槛" >> $LOG_FILE
echo "   2. Shopify不代缴，需要自己申报" >> $LOG_FILE
echo "   3. 多渠道销售难以汇总计算" >> $LOG_FILE
echo "   4. 错过申报截止日期产生罚款" >> $LOG_FILE
echo "" >> $LOG_FILE

# Feature Request汇总
echo "📝 Feature Request 优先级:" >> $LOG_FILE
echo "   P0: 精准费用计算器 (包含所有隐藏费用)" >> $LOG_FILE
echo "   P1: 自动Nexus追踪和预警" >> $LOG_FILE
echo "   P2: 多平台费用对比" >> $LOG_FILE
echo "   P3: 定价建议功能" >> $LOG_FILE
echo "" >> $LOG_FILE

echo "✅ 收集完成 - $(date)" >> $LOG_FILE
echo "================================" >> $LOG_FILE
echo "" >> $LOG_FILE

# 输出最新日志
tail -20 $LOG_FILE
