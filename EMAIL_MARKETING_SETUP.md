# 邮件营销系统设置

## 系统功能
- 订阅者管理
- 邮件模板
- 活动管理
- 统计追踪
- Mailchimp导出

## 快速开始

### 1. 添加订阅者
```bash
node email-marketing.js add user@example.com "User Name"
```

### 2. 查看订阅者列表
```bash
node email-marketing.js list
```

### 3. 查看统计
```bash
node email-marketing.js stats
```

### 4. 导出到Mailchimp
```bash
node email-marketing.js export
```

## 邮件模板

### 已配置模板
1. **welcome** - 欢迎邮件
2. **weekly** - 周报
3. **affiliate** - 工具推荐

### 自定义模板
编辑 `email-marketing.js` 中的 `EMAIL_TEMPLATES`。

## 集成选项

### Option 1: Mailchimp (推荐免费版)
- 免费: 500订阅者, 1000封/月
- 注册: https://mailchimp.com
- 导入: 使用生成的CSV文件

### Option 2: ConvertKit
- 适合创作者
- 注册: https://convertkit.com

### Option 3: SendGrid
- 开发者友好
- 免费: 100封/天

## 收集订阅者

### 网站表单
在网站添加订阅表单:
```html
<form action="YOUR_ENDPOINT" method="POST">
  <input type="email" name="email" placeholder="Your email" required>
  <input type="text" name="name" placeholder="Your name">
  <button type="submit">Subscribe</button>
</form>
```

### 文章CTA
在每篇文章末尾添加:
> 💌 订阅周报，获取最新安全资讯

### 弹窗 (可选)
使用 ConvertKit 或 Mailchimp 的弹窗功能。

## 自动化工作流

### 欢迎序列
1. 立即: 欢迎邮件
2. 第3天: 热门文章推荐
3. 第7天: 工具推荐 (affiliate)

### 周报
- 每周二发送
- 包含: 新文章、工具推荐、安全新闻

## 合规注意

- 必须提供退订链接
- 遵守 GDPR/CCPA
- 使用真实发件人地址
- 不要购买邮件列表

## 收入预估

| 订阅者 | 打开率 | CTR | Affiliate收入/月 |
|--------|--------|-----|-----------------|
| 100 | 30% | 5% | $50 |
| 500 | 25% | 4% | $200 |
| 1000 | 22% | 3.5% | $350 |

---
*设置状态: 待配置邮件服务商*
