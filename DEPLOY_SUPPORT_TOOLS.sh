#!/bin/bash
# 🚀 执行支持包 - 接单后自动支持系统
# 让AI帮你完成80%的交付工作

echo "========================================"
echo "🤖 部署执行支持系统"
echo "========================================"
echo ""

# 创建AI提示词库
echo "【支持1】创建AI提示词库..."

mkdir -p ~/ai-empire/prompts

cat > ~/ai-empire/prompts/video-editing.txt << 'PROMPT'
# AI视频剪辑提示词

## 基础剪辑
"你是一个专业的短视频剪辑师。请帮我剪辑这段视频：
- 时长：控制在1-3分钟
- 风格：快节奏，适合TikTok/抖音
- 添加：字幕、转场、背景音乐
- 输出：1080p MP4"

## 产品介绍视频
"请帮我制作一个产品介绍短视频：
- 产品：[产品名称]
- 卖点：[核心卖点]
- 时长：60秒
- 风格：专业但有活力
- 需要：开场抓眼球、产品展示、CTA结尾"

## 教程视频
"请帮我剪辑一个教程视频：
- 主题：[教程主题]
- 目标受众：[受众描述]
- 要求：步骤清晰、重点标注、节奏适中
- 添加：步骤编号、关键提示、总结"
PROMPT

cat > ~/ai-empire/prompts/copywriting.txt << 'PROMPT'
# AI文案写作提示词

## 小红书文案
"请帮我写一篇小红书笔记：
- 主题：[主题]
- 风格：亲切、实用、有emoji
- 结构：标题+正文+标签
- 要求：开头抓人、中间干货、结尾互动"

## 产品描述
"请帮我写一段产品描述：
- 产品：[产品名]
- 卖点：[卖点1, 卖点2, 卖点3]
- 长度：200字
- 风格：吸引购买、突出价值"

## 营销邮件
"请帮我写一封营销邮件：
- 目的：[目的]
- 受众：[受众]
- 语气：专业但友好
- 包含：主题行+正文+CTA"
PROMPT

cat > ~/ai-empire/prompts/design.txt << 'PROMPT'
# AI设计提示词

## Logo设计
"请帮我设计一个Logo：
- 品牌名：[名字]
- 行业：[行业]
- 风格：[风格偏好]
- 颜色：[颜色偏好]
- 需要：3个不同方案"

## 社交媒体图片
"请帮我设计一张社交媒体图片：
- 平台：[平台]
- 尺寸：[尺寸]
- 主题：[主题]
- 文字：[要显示的文字]
- 风格：[风格]"
PROMPT

echo "✅ AI提示词库创建完成"
echo ""

# 创建社交媒体内容日历
echo "【支持2】创建内容日历模板..."

cat > ~/ai-empire/docs/content-calendar.md << 'CALENDAR'
# 社交媒体内容日历

## 每日发布计划

### 周一：教育内容
- 上午9:00：发布AI工具教程
- 下午3:00：分享行业技巧
- 晚上8:00：回答粉丝问题

### 周二：案例展示
- 上午9:00：展示客户案例
- 下午3:00：分享前后对比
- 晚上8:00：客户评价

### 周三：幕后花絮
- 上午9:00：工作流程展示
- 下午3:00：工具使用技巧
- 晚上8:00：个人故事

### 周四：互动内容
- 上午9:00：提问互动
- 下午3:00：投票/调查
- 晚上8:00：直播/问答

### 周五：促销/转化
- 上午9:00：服务介绍
- 下午3:00：限时优惠
- 晚上8:00：客户见证

### 周末：轻松内容
- 周六：行业趣闻/灵感
- 周日：下周预告/总结

## 内容类型比例
- 教育内容：40%
- 案例展示：20%
- 互动内容：20%
- 促销内容：10%
- 个人内容：10%
CALENDAR

echo "✅ 内容日历创建完成"
echo ""

# 创建一键交付脚本
echo "【支持3】创建一键交付脚本..."

cat > ~/ai-empire/scripts/quick-deliver.sh << 'SCRIPT'
#!/bin/bash
# 一键交付脚本

ORDER_ID=$1
CLIENT_NAME=$2
SERVICE_TYPE=$3

if [ -z "$ORDER_ID" ]; then
  echo "用法: bash quick-deliver.sh <订单ID> <客户名> <服务类型>"
  exit 1
fi

echo "========================================"
echo "🚀 开始交付: $ORDER_ID"
echo "客户: $CLIENT_NAME"
echo "服务: $SERVICE_TYPE"
echo "========================================"

# 记录到日志
echo "$(date),$ORDER_ID,$CLIENT_NAME,$SERVICE_TYPE,start" >> ~/ai-empire/logs/delivery.log

# 根据服务类型执行不同流程
case $SERVICE_TYPE in
  "video")
    echo "📹 视频剪辑流程"
    echo "1. 接收素材"
    echo "2. AI生成初稿 (使用提示词: ~/ai-empire/prompts/video-editing.txt)"
    echo "3. 人工审核调整"
    echo "4. 导出交付"
    ;;
  "copy")
    echo "📝 文案写作流程"
    echo "1. 确认需求"
    echo "2. AI生成文案 (使用提示词: ~/ai-empire/prompts/copywriting.txt)"
    echo "3. 人工审核优化"
    echo "4. 交付"
    ;;
  "design")
    echo "🎨 设计流程"
    echo "1. 确认需求"
    echo "2. AI生成设计 (使用提示词: ~/ai-empire/prompts/design.txt)"
    echo "3. 人工调整"
    echo "4. 交付"
    ;;
  *)
    echo "通用交付流程"
    ;;
esac

echo ""
echo "✅ 交付完成!"
echo "记得:"
echo "1. 上传作品到平台"
echo "2. 发送交付消息"
echo "3. 请求好评"
echo "4. 记录收入"
echo ""

# 记录完成
echo "$(date),$ORDER_ID,$CLIENT_NAME,$SERVICE_TYPE,complete" >> ~/ai-empire/logs/delivery.log
SCRIPT
chmod +x ~/ai-empire/scripts/quick-deliver.sh

echo "✅ 一键交付脚本创建完成"
echo ""

# 创建自动化邮件模板
echo "【支持4】创建邮件模板库..."

mkdir -p ~/ai-empire/templates/emails

cat > ~/ai-empire/templates/emails/welcome.txt << 'EMAIL'
Subject: Welcome! Let's create something amazing 🚀

Hi [Client Name],

Thank you for choosing my service! I'm excited to work with you.

Here's what happens next:
1. Please send me all the materials/files
2. I'll start working within 2 hours
3. First draft delivered in 24 hours
4. You can request up to 3 revisions

If you have any specific requirements or references, please share them now.

Looking forward to creating something great together!

Best regards,
[Your Name]
EMAIL

cat > ~/ai-empire/templates/emails/delivery.txt << 'EMAIL'
Subject: Your order is ready! 🎉

Hi [Client Name],

Great news! Your order is complete and ready for review.

📎 Download link: [Link]

Please review and let me know if you need any adjustments. I'm happy to make up to 3 revisions to ensure you're 100% satisfied.

If everything looks good, I would greatly appreciate if you could leave a review. It helps me grow my business and serve more clients like you!

Thank you for your business!

Best regards,
[Your Name]
EMAIL

cat > ~/ai-empire/templates/emails/revision.txt << 'EMAIL'
Subject: Revisions completed ✨

Hi [Client Name],

I've made the requested changes to your order.

📎 Updated files: [Link]

Please review and let me know if there's anything else you'd like me to adjust. Remember, you have [X] revisions remaining.

Looking forward to your feedback!

Best regards,
[Your Name]
EMAIL

cat > ~/ai-empire/templates/emails/review-request.txt << 'EMAIL'
Subject: Quick favor? 🙏

Hi [Client Name],

I hope you're enjoying the work I delivered!

If you have a moment, I would be incredibly grateful if you could leave a review. Your feedback helps other clients find my services and helps me improve.

It only takes 2 minutes and means a lot to me!

[Review Link]

Thank you so much!

Best regards,
[Your Name]
EMAIL

echo "✅ 邮件模板库创建完成"
echo ""

# 创建竞争对手监控脚本
echo "【支持5】创建竞争监控系统..."

cat > ~/ai-empire/scripts/competitor-watch.sh << 'SCRIPT'
#!/bin/bash
# 竞争对手监控

echo "========================================"
echo "👀 竞争对手监控报告"
echo "时间: $(date)"
echo "========================================"
echo ""

echo "📝 监控任务:"
echo "1. 定期检查Fiverr/Upwork上的竞品"
echo "2. 记录竞品价格变化"
echo "3. 分析竞品服务更新"
echo "4. 跟踪竞品评价"
echo ""

echo "📊 本周行动:"
echo "□ 查看5个竞品的价格"
echo "□ 分析3个竞品的描述"
echo "□ 记录竞品的新服务"
echo "□ 更新自己的定价策略"
echo ""

echo "💡 竞争策略:"
echo "- 价格: 比竞品低10-20%起步"
echo "- 服务: 提供竞品没有的增值服务"
echo "- 速度: 承诺更快交付"
echo "- 质量: 提供更多修改次数"
echo ""

echo "========================================"
echo "记录到: ~/ai-empire/logs/competitor.log"
echo "========================================"
SCRIPT
chmod +x ~/ai-empire/scripts/competitor-watch.sh

echo "✅ 竞争监控系统创建完成"
echo ""

# 创建价格优化分析器
echo "【支持6】创建价格优化工具..."

cat > ~/ai-empire/scripts/pricing-optimizer.sh << 'SCRIPT'
#!/bin/bash
# 价格优化建议

echo "========================================"
echo "💰 价格优化分析"
echo "时间: $(date)"
echo "========================================"
echo ""

# 读取当前收入数据
if [ -f ~/ai-empire/logs/revenue.csv ]; then
  TOTAL=$(tail -n +2 ~/ai-empire/logs/revenue.csv | awk -F',' '{sum+=$4} END {print sum}')
  ORDERS=$(tail -n +2 ~/ai-empire/logs/revenue.csv | wc -l)
  
  if [ $ORDERS -gt 0 ]; then
    AVG=$(echo "scale=2; $TOTAL / $ORDERS" | bc)
    echo "📊 当前数据:"
    echo "  总订单: $ORDERS"
    echo "  总收入: $TOTAL"
    echo "  平均客单价: $AVG"
    echo ""
  fi
fi

echo "💡 定价建议:"
echo ""
echo "如果订单太多(忙不过来):"
echo "  → 涨价20%"
echo ""
echo "如果订单太少(需要更多客户):"
echo "  → 降价10%或提供优惠"
echo ""
echo "如果订单稳定(平衡状态):"
echo "  → 保持价格，优化服务"
echo ""
echo "🎯 涨价时机:"
echo "  - 完成10单后: +20%"
echo "  - 获得10个好评后: +30%"
echo "  - 有5个复购客户后: +50%"
echo ""

echo "========================================"
SCRIPT
chmod +x ~/ai-empire/scripts/pricing-optimizer.sh

echo "✅ 价格优化工具创建完成"
echo ""

# 创建每日任务清单生成器
echo "【支持7】创建每日任务生成器..."

cat > ~/ai-empire/scripts/daily-tasks.sh << 'SCRIPT'
#!/bin/bash
# 每日任务清单

DAY=$(date +%A)
DATE=$(date +%Y-%m-%d)

echo "========================================"
echo "📋 今日任务清单 - $DAY"
echo "日期: $DATE"
echo "========================================"
echo ""

echo "🌅 上午任务 (9:00-12:00)"
echo "----------------------------------------"
echo "□ 检查新订单 (5分钟)"
echo "□ 回复所有客户消息 (15分钟)"
echo "□ 处理紧急交付 (根据订单)"
echo "□ 社交媒体内容发布 (30分钟)"
echo ""

echo "☀️ 下午任务 (13:00-18:00)"
echo "----------------------------------------"
echo "□ 完成当日交付任务 (2-3小时)"
echo "□ 主动投标新项目 (30分钟)"
echo "□ 优化服务页面 (30分钟)"
echo "□ 学习新技能 (30分钟)"
echo ""

echo "🌙 晚上任务 (19:00-21:00)"
echo "----------------------------------------"
echo "□ 回复客户消息 (15分钟)"
echo "□ 记录今日收入 (5分钟)"
echo "□ 规划明日任务 (10分钟)"
echo "□ 社交媒体互动 (30分钟)"
echo ""

echo "📊 每日KPI"
echo "----------------------------------------"
echo "□ 收入目标: $____"
echo "□ 订单目标: ____单"
echo "□ 新客户: ____个"
echo "□ 好评: ____个"
echo ""

echo "========================================"
echo "完成后记录: ~/ai-empire/logs/daily-completed.log"
echo "========================================"
SCRIPT
chmod +x ~/ai-empire/scripts/daily-tasks.sh

echo "✅ 每日任务生成器创建完成"
echo ""

# 创建收入预测计算器
echo "【支持8】创建收入预测计算器..."

cat > ~/ai-empire/scripts/revenue-forecast.sh << 'SCRIPT'
#!/bin/bash
# 收入预测计算器

echo "========================================"
echo "💰 收入预测计算器"
echo "========================================"
echo ""

# 基础参数
echo "请输入当前数据:"
echo -n "当前平均客单价 ($): "
read PRICE
echo -n "当前每周订单数: "
read ORDERS
echo -n "目标增长率 (%): "
read GROWTH

echo ""
echo "📊 预测结果:"
echo "----------------------------------------"

# 计算当前收入
WEEKLY=$(echo "$PRICE * $ORDERS" | bc)
MONTHLY=$(echo "$WEEKLY * 4" | bc)

# 计算目标收入 (增长后)
GROWTH_FACTOR=$(echo "scale=2; 1 + $GROWTH / 100" | bc)
TARGET_WEEKLY=$(echo "$WEEKLY * $GROWTH_FACTOR" | bc)
TARGET_MONTHLY=$(echo "$TARGET_WEEKLY * 4" | bc)

echo "当前收入:"
echo "  每周: $WEEKLY"
echo "  每月: $MONTHLY"
echo ""
echo "目标收入 (增长$GROWTH%):"
echo "  每周: $TARGET_WEEKLY"
echo "  每月: $TARGET_MONTHLY"
echo ""

# 计算需要的订单数
NEED_ORDERS=$(echo "scale=0; $TARGET_WEEKLY / $PRICE" | bc)
echo "需要的订单数: $NEED_ORDERS 单/周"
echo ""

echo "💡 达到目标的策略:"
echo "1. 增加投标数量 (+50%)"
echo "2. 优化服务描述 (提高转化率)"
echo "3. 适当涨价 (+20%)"
echo "4. 提高客户复购率"
echo ""

echo "========================================"
SCRIPT
chmod +x ~/ai-empire/scripts/revenue-forecast.sh

echo "✅ 收入预测计算器创建完成"
echo ""

# 最终统计
echo "========================================"
echo "✅ 执行支持系统部署完成!"
echo "========================================"
echo ""
echo "📦 新增支持工具:"
echo "  AI提示词库: 3套 (视频/文案/设计)"
echo "  内容日历: 7天发布计划"
echo "  一键交付: quick-deliver.sh"
echo "  邮件模板: 4套 (欢迎/交付/修改/好评)"
echo "  竞争监控: competitor-watch.sh"
echo "  价格优化: pricing-optimizer.sh"
echo "  每日任务: daily-tasks.sh"
echo "  收入预测: revenue-forecast.sh"
echo ""
echo "========================================"
echo "💡 使用方法"
echo "========================================"
echo ""
echo "接单后快速交付:"
echo "  bash ~/ai-empire/scripts/quick-deliver.sh <订单号> <客户> <类型>"
echo ""
echo "查看每日任务:"
echo "  bash ~/ai-empire/scripts/daily-tasks.sh"
echo ""
echo "计算收入预测:"
echo "  bash ~/ai-empire/scripts/revenue-forecast.sh"
echo ""
echo "优化定价:"
echo "  bash ~/ai-empire/scripts/pricing-optimizer.sh"
echo ""
echo "监控竞争:"
echo "  bash ~/ai-empire/scripts/competitor-watch.sh"
echo ""
echo "========================================"
