# ContentAI 使用指南

## 系统概述

ContentAI 是一个全自动闭环系统，实现从获客到交付到收款的完整自动化流程：

```
获客 (Reddit/Twitter) → 网站访问 → 创建订单 → 加密货币支付 → AI生成 → 邮件交付
```

## 用户流程

### 1. 客户访问网站
客户通过 Reddit、Twitter 或其他渠道访问你的网站。

### 2. 创建订单
客户在网站填写表单：
- 邮箱地址（用于接收内容）
- 选择套餐（基础/专业/企业）
- 选择内容类型（博客/产品描述/社媒等）
- 输入主题和具体要求

### 3. 支付
系统生成加密货币支付链接：
- 支持 BTC、ETH、USDT、USDC 等
- 客户完成支付后自动跳转

### 4. AI 生成
支付确认后，系统自动：
- 调用 Moonshot AI 生成内容
- 根据主题和要求定制
- 生成高质量原创内容

### 5. 内容交付
内容生成完成后，自动：
- 发送到客户邮箱
- 包含完整内容和格式
- 提供使用建议

## 管理员操作

### 查看订单
```bash
# 在 Cloudflare Dashboard 中
# 进入 D1 数据库，查询 orders 表
```

### 手动触发处理
```bash
curl -X POST https://your-domain.com/api/admin/process \
  -H "Content-Type: application/json" \
  -d '{"action": "generate"}'
```

### 手动获客
```bash
# 发布 Reddit
curl -X POST https://your-domain.com/api/admin/process \
  -d '{"action": "reddit_post"}'

# 发布 Twitter
curl -X POST https://your-domain.com/api/admin/process \
  -d '{"action": "twitter_post"}'
```

### 查看统计
```bash
curl https://your-domain.com/api/admin/stats
```

## 常见问题

### Q: 客户支付后多久能收到内容？
A: 通常在 5-15 分钟内完成生成和发送。

### Q: 支持哪些加密货币？
A: Bitcoin (BTC)、Ethereum (ETH)、USDT、USDC、DAI 等。

### Q: 如何修改定价？
A: 编辑 `shared/config.js` 中的 PRICING 配置，然后重新部署。

### Q: 可以添加新的内容类型吗？
A: 可以，编辑 `shared/config.js` 和 `ai/moonshot.js` 添加新类型。

### Q: 获客脚本安全吗？
A: 脚本遵循各平台规则，建议使用官方 API，控制发布频率。

## 收入预测

基于不同定价和转化率的收入估算：

| 月订单量 | 平均单价 | 月收入 | 年收入 |
|---------|---------|--------|--------|
| 20 | $15 | $300 | $3,600 |
| 50 | $15 | $750 | $9,000 |
| 100 | $15 | $1,500 | $18,000 |
| 200 | $15 | $3,000 | $36,000 |

## 优化建议

### 提升转化率
1. 优化落地页设计
2. 添加客户评价
3. 提供免费试用/样例
4. A/B 测试不同定价

### 提升客单价
1. 增加更多套餐选项
2. 提供批量折扣
3. 推出订阅模式
4. 添加加急服务

### 获客优化
1. 在相关 subreddit 提供有价值的内容
2. 在 Twitter 分享行业洞见
3. 建立邮件列表
4. SEO 优化

## 维护建议

### 每日
- 检查新订单
- 查看是否有失败的订单
- 监控收入

### 每周
- 分析获客效果
- 查看社交媒体互动
- 更新营销内容

### 每月
- 查看整体统计
- 优化定价策略
- 更新 AI 提示词
- 检查 API 密钥有效期

## 联系支持

如有问题，请联系：
- Email: support@contentai.com
- Telegram: @contentai_support

---

**祝您使用愉快！🚀**
