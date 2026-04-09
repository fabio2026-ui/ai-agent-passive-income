# 邮件营销自动化系统 - 配置文档

## ⚠️ 重要发现

**mail.tm API 仅支持接收邮件，不支持发送邮件！**

mail.tm 是一个临时邮箱服务，用于：
- ✅ 创建临时邮箱账户
- ✅ 接收邮件
- ❌ **不支持发送邮件**

## 替代方案

我为您准备了两种可行的邮件发送方案：

### 方案1: 模拟邮件系统（JSON数据存储）
适合：开发测试、演示环境
- 将邮件内容存储为JSON
- 可查看邮件内容
- 无真实发送功能

### 方案2: SMTP/邮件服务API
推荐生产环境使用：
- **SendGrid** - 免费12,000封/月
- **AWS SES** - 按量付费，经济实惠
- **Mailgun** - 免费5,000封/月
- **Resend** - 免费3,000封/月
- **Gmail SMTP** - 个人/小量使用

## 7天用户引导邮件序列

| 天数 | 主题 | 内容概要 |
|------|------|----------|
| Day 0 | 欢迎使用！快速开始指南 🚀 | 欢迎新用户，引导完成初始设置 |
| Day 1 | 连接您的Apple Watch ⌚ | Apple Watch连接步骤详解 |
| Day 2 | 读懂您的心率数据 ❤️ | 心率数据解读，健康指标说明 |
| Day 3 | 他们是如何改变的 💪 | 用户成功案例分享 |
| Day 4 | 解锁Pro功能 ✨ | 高级功能介绍，价值展示 |
| Day 5 | 常见问题解答 ❓ | FAQ，解决常见疑问 |
| Day 6 | 限时优惠最后机会 ⏰ | 升级优惠，限时折扣 |
| Day 7 | 您的反馈很重要 📝 | 满意度调查，推荐奖励计划 |

## 文件结构

```
email-automation/
├── emails/                    # 邮件模板
│   ├── day0_welcome.html
│   ├── day1_apple_watch.html
│   ├── day2_heart_rate.html
│   ├── day3_success_stories.html
│   ├── day4_pro_features.html
│   ├── day5_faq.html
│   ├── day6_promotion.html
│   └── day7_feedback.html
├── data/
│   └── email_queue.json       # 待发送邮件队列
├── config/
│   └── email_config.json      # 邮件配置
└── scheduler.js               # 自动化调度脚本
```

## 使用方法

1. 选择邮件发送方案（方案1或方案2）
2. 配置邮件模板
3. 运行调度脚本
4. 监控发送状态

---
*配置时间: 2026-03-21*
