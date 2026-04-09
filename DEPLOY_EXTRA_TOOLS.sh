#!/bin/bash
# 🚀 额外支持工具包 - 继续优化

echo "========================================"
echo "🚀 部署额外支持工具"
echo "========================================"
echo ""

# 创建视频脚本生成器
echo "【额外1】创建视频脚本生成器..."

mkdir -p ~/ai-empire/content/video-scripts

cat > ~/ai-empire/content/video-scripts/hook-formulas.txt << 'HOOK'
# 短视频爆款开头公式

## 公式1: 痛点+解决方案
"你是不是也遇到[痛点]?今天教你[解决方案]"

## 公式2: 数字+结果
"我用30天，从0做到[结果]，秘诀是..."

## 公式3: 反常识
"千万别[做某事]，真相是..."

## 公式4: 身份+成果
"作为[身份]，我是如何[做到某事]的"

## 公式5: 对比
"普通人[做法]vs高手[做法]"

## 公式6: 悬念
"最后一条90%的人都不知道..."

## 公式7: 直接承诺
"看完这个视频，你会[得到什么]"
HOOK

cat > ~/ai-empire/content/video-scripts/script-template.txt << 'SCRIPT'
# 视频脚本模板 (1分钟)

## 开头 (5秒) - 抓注意力
[使用hook公式]
"你是不是也想用AI赚钱?"

## 问题 (10秒) - 建立共鸣
"很多人想做副业，但是：
- 没时间
- 没资金
- 没技能"

## 解决方案 (20秒) - 提供价值
"今天分享3个方法：
1. AI写作服务
2. AI视频剪辑
3. AI设计服务

每个都不需要本金，只需要AI工具"

## 证明 (15秒) - 建立信任
"我自己用这些方法，
第一个月赚了XXX，
现在已经做到XXX"

## CTA (10秒) - 引导行动
"关注我，明天分享具体操作步骤
评论区告诉我你想学哪个"
SCRIPT

echo "✅ 视频脚本生成器创建完成"
echo ""

# 创建Upwork投标模板
echo "【额外2】创建Upwork投标模板..."

mkdir -p ~/ai-empire/templates/proposals

cat > ~/ai-empire/templates/proposals/upwork-proposal-1.txt << 'PROP'
Subject: I can help you with [项目类型] - Here's my plan

Hi [Client Name],

I read your job posting for [项目类型] and I'd love to help.

Here's my approach:
1. [具体步骤1]
2. [具体步骤2]
3. [具体步骤3]

Why choose me:
✓ [相关经验1]
✓ [相关经验2]
✓ [相关技能]

Recent results:
- [成果1]
- [成果2]

I'd be happy to discuss your project in more detail.

Best regards,
[Your Name]
PROP

cat > ~/ai-empire/templates/proposals/upwork-proposal-2.txt << 'PROP'
Subject: Expert in [技能] - Let's discuss your project

Hello [Client Name],

I noticed you're looking for [技能/服务].

I specialize in:
• [专业技能1]
• [专业技能2]
• [专业技能3]

My recent work includes:
[作品/案例描述]

I can deliver:
✓ [交付物1]
✓ [交付物2]
✓ [交付物3]

Timeline: [时间]
Budget: [报价] (negotiable)

Let's chat about your specific needs!

Best,
[Your Name]
PROP

echo "✅ Upwork投标模板创建完成"
echo ""

# 创建客户培育邮件序列
echo "【额外3】创建客户培育序列..."

mkdir -p ~/ai-empire/templates/email-sequences

cat > ~/ai-empire/templates/email-sequences/new-client-sequence.txt << 'EMAIL'
# 新客户培育序列 (7天)

## Day 1: 欢迎
Subject: Welcome! Here's what happens next

Hi [Name],

Thanks for your order! I'm excited to work with you.

Next steps:
1. Send me your materials
2. I'll start working within 2 hours
3. First draft in 24 hours
4. Up to 3 revisions included

Questions? Just reply to this email.

Best,
[Your Name]

---

## Day 3: 进度更新
Subject: Quick update on your project

Hi [Name],

Just wanted to let you know I'm making good progress on your project.

Current status: [进度]
Expected delivery: [时间]

I'll send you the draft soon!

Best,
[Your Name]

---

## Day 7: 完成+复购引导
Subject: Your project is complete + special offer

Hi [Name],

Your project is complete! [交付链接]

If you need similar work in the future, I offer:
• 10% discount for repeat clients
• Priority scheduling
• Bundle pricing

Just let me know!

Best,
[Your Name]
EMAIL

echo "✅ 客户培育序列创建完成"
echo ""

# 创建应急方案
echo "【额外4】创建危机应急方案..."

cat > ~/ai-empire/docs/crisis-management.md << 'CRISIS'
# 危机管理手册

## 情况1: 客户不满意

### 立即行动
1. 道歉并承认问题
2. 询问具体不满点
3. 提供免费修改
4. 适当退款(必要时)

### 沟通模板
"I'm sorry the delivery didn't meet your expectations.
Let me fix this for you right away.
I'll provide [解决方案] within [时间]."

---

## 情况2:  deadline无法完成

### 立即行动
1. 提前通知客户
2. 解释原因(简短)
3. 提供补偿(折扣/加量)
4. 给出新的交付时间

### 沟通模板
"I need to update you on the timeline.
Due to [原因], I'll need [额外时间].
As compensation, I'll [提供什么].
New delivery: [新时间]"

---

## 情况3: 技术问题(文件损坏等)

### 立即行动
1. 立即通知客户
2. 解释情况
3. 重新开始制作
4. 加急完成

---

## 情况4: 客户要求退款

### 处理流程
1. 了解原因
2. 如果已部分完成: 提供部分退款
3. 如果未开始: 全额退款
4. 保持专业态度

### 模板
"I understand. I'll process the refund immediately.
Thank you for giving me the opportunity.
If you need help in the future, I'm here."

---

## 预防机制
- 不接能力范围外的单
- 预留缓冲时间
- 定期备份工作
- 保持良好沟通
CRISIS

echo "✅ 危机管理手册创建完成"
echo ""

# 创建扩张路线图
echo "【额外5】创建详细扩张路线图..."

cat > ~/ai-empire/docs/expansion-roadmap.md << 'ROADMAP'
# 扩张路线图 (详细版)

## Phase 1: Bootstrap (Month 1-3) - 详细执行

### Week 1: 启动
- Day 1-2: 注册平台，完善profile
- Day 3-4: 创建服务，制作样片
- Day 5-7: 发布服务，接第一单

### Week 2: 优化
- 分析数据(曝光/点击/转化)
- 优化标题和描述
- 调整定价策略
- 目标: 5单

### Week 3-4: 稳定
- 建立交付SOP
- 积累5-10个好评
- 开始有复购
- 目标: 10单，$500收入

### Month 2: 增长
- 涨价20-30%
- 增加服务类型
- 目标: $2000收入

### Month 3: 准备Phase 2
- 收入稳定$3000+/月
- 积累$5000+资金
- 观察市场需求
- 选择2-3个项目验证

---

## Phase 2: 验证 (Month 4-6) - 详细执行

### Month 4: 第一个验证项目
- 选择项目A
- 设计假门测试
- 投放$500测试
- 分析结果

### Month 5: 第二个验证项目
- 选择项目B
- 预售测试
- 看付费意愿
- 收集反馈

### Month 6: 决策
- 分析两个项目数据
- 选择1-2个继续
- 停止失败的
- 准备Phase 3

---

## Phase 3: 规模化 (Month 7-12)

### Month 7-8: All in
- 投入积累资金的60-80%
- 全力运营选中的项目
- 建立团队/自动化

### Month 9-10: 优化
- 数据驱动优化
- 提高效率
- 扩大市场份额

### Month 11-12: 收获
- 稳定收入$10000+/月
- 或准备退出
- 规划下一阶段

---

## 关键决策点

### Decision 1 (Month 3): Bootstrap足够?
条件: 收入>$3000/月 且 资金>$5000
Yes → Phase 2
No → 继续Bootstrap

### Decision 2 (Month 6): 哪个项目?
标准: 转化率>5%, 付费用户>20, 复购>30%
选择: 满足标准的1-2个

### Decision 3 (Month 12): 放大还是退出?
标准: 月收入>$10000, 利润率>50%
Yes → 继续放大
No → 转型或重来
ROADMAP

echo "✅ 扩张路线图创建完成"
echo ""

# 创建成功案例模板
echo "【额外6】创建成功案例模板..."

cat > ~/ai-empire/templates/case-study.md << 'CASE'
# 成功案例模板

## 标题
"How I Helped [Client] Achieve [Result] with [Service]"

## 客户背景
- 客户: [客户类型]
- 行业: [行业]
- 挑战: [面临的问题]

## 解决方案
我们提供了:
1. [具体服务1]
2. [具体服务2]
3. [具体服务3]

## 执行过程
- 时间: [周期]
- 方法: [方法论]
- 工具: [使用的工具]

## 结果
- [具体成果1]
- [具体成果2]
- [具体成果3]

## 客户评价
"[客户原话评价]"

## 总结
这个案例展示了[什么价值/能力]。
如果你也有类似需求，欢迎联系我!
CASE

echo "✅ 成功案例模板创建完成"
echo ""

# 创建效率工具清单
echo "【额外7】创建效率工具清单..."

cat > ~/ai-empire/docs/productivity-tools.md << 'TOOLS'
# 效率工具清单

## 免费工具 (推荐)

### 设计
- Canva: 图形设计
- Remove.bg: 自动抠图
- Unsplash: 免费图片

### 视频
- CapCut: 视频剪辑
- OBS: 屏幕录制
- HandBrake: 视频压缩

### 文案
- Grammarly: 语法检查
- Hemingway: 可读性分析
- ChatGPT/Claude: AI写作

### 项目管理
- Trello: 看板管理
- Notion: 知识管理
- Google Sheets: 数据追踪

### 沟通
- Calendly: 预约安排
- Loom: 视频消息
- Grammarly: 邮件检查

## 付费工具 (收入>$1000后考虑)

- ChatGPT Plus: $20/月
- Canva Pro: $13/月
- Midjourney: $10/月
- Notion Plus: $8/月

## 自动化工具
- n8n: 工作流自动化 (免费)
- Zapier: 应用连接 (有免费版)
- IFTTT: 简单自动化 (免费)
TOOLS

echo "✅ 效率工具清单创建完成"
echo ""

# 创建心态管理指南
echo "【额外8】创建创业者心态指南..."

cat > ~/ai-empire/docs/mindset-guide.md << 'MINDSET'
# 创业者心态管理

## 1. 接受不完美
- 先完成，再完美
- 迭代优于一次性做好
- 客户要的是结果，不是完美

## 2. 专注过程
- 无法控制结果，只能控制努力
- 每天做该做的事，结果自然来
- 数据说话，情绪靠边

## 3. 长期思维
- 第一个月不赚钱正常
- 前3个月是学习和积累期
- 6个月后才能看到真实结果

## 4. 应对挫折
- 没订单? → 增加投标数量
- 客户不满意? → 改进服务
- 收入不稳定? → 多元化收入来源
- 累了? → 休息，但不要放弃

## 5. 保持动力
- 记录小胜利
- 庆祝里程碑
- 与其他创业者交流
- 持续学习

## 6. 边界管理
- 设定工作时间
- 学会说"不"
- 保护个人时间
- 避免 burnout

## 7. 财务心态
- 收入波动正常
- 储蓄应急资金
- 不要借债创业
-  reinvest wisely
MINDSET

echo "✅ 心态管理指南创建完成"
echo ""

# 最终统计
echo "========================================"
echo "✅ 额外支持工具部署完成!"
echo "========================================"
echo ""
echo "📦 新增工具:"
echo "  视频脚本: hook公式 + 脚本模板"
echo "  投标模板: 2套Upwork提案"
echo "  邮件序列: 7天客户培育"
echo "  危机管理: 应急处理手册"
echo "  扩张路线: 详细12个月计划"
echo "  案例模板: 成功案例撰写"
echo "  效率工具: 20+工具推荐"
echo "  心态管理: 心理建设指南"
echo ""
echo "总文件数: 150+"
echo "脚本数: 15+"
echo "模板数: 30+"
echo "文档数: 25+"
echo ""
echo "========================================"
echo "💡 系统已到极致优化!"
echo "========================================"
