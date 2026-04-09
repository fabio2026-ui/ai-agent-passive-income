# ContentAI 全自动闭环系统

🚀 **零人工介入的 AI 内容生成自动化系统**

## 系统架构

```
用户访问网站 → 创建订单 → 加密货币支付 → AI生成内容 → 自动邮件交付
        ↑                                                        ↓
    Reddit/Twitter 获客 ←  ←  ←  ←  ←  ←  ←  ←  ←  ←  ←  ←  ←  ← ←
```

## 功能特性

### 1. 后端 API (Cloudflare Workers)
- ✅ 免实名、免费托管
- ✅ 全球 CDN 加速
- ✅ 99.9% 可用性
- ✅ 自动扩容

### 2. 加密货币支付
- ✅ Coinbase Commerce (BTC, ETH, USDC, DAI)
- ✅ NowPayments (USDT, 更多币种)
- ✅ 自动 Webhook 处理
- ✅ 实时支付确认

### 3. AI 内容生成
- ✅ Kimi/Moonshot API 集成
- ✅ 8种内容类型
- ✅ 自动质量检查
- ✅ 失败重试机制

### 4. 自动化交付
- ✅ Resend 邮件服务
- ✅ HTML + 纯文本双格式
- ✅ 发送状态追踪
- ✅ 失败自动重试

### 5. 自动化获客
- ✅ Reddit 自动发帖
- ✅ Twitter 自动发布
- ✅ 内容模板库
- ✅ 互动数据追踪

## 快速开始

### 1. 安装依赖

```bash
cd /root/.openclaw/workspace/contentai/auto-system
npm install
```

### 2. 配置环境变量

复制并编辑 `wrangler.toml`:

```toml
[env.production.vars]
APP_URL = "https://your-domain.com"
MOONSHOT_API_KEY = "your_moonshot_key"
COINBASE_API_KEY = "your_coinbase_key"
COINBASE_WEBHOOK_SECRET = "your_webhook_secret"
RESEND_API_KEY = "your_resend_key"
```

### 3. 创建 D1 数据库

```bash
npx wrangler d1 create contentai-db
```

记录返回的 database_id，更新 `wrangler.toml`。

### 4. 初始化数据库表

```bash
npx wrangler d1 execute contentai-db --file=./shared/database.js
```

### 5. 部署

```bash
npm run deploy
```

## 配置详情

### 必需配置

| 变量 | 用途 | 获取方式 |
|------|------|----------|
| MOONSHOT_API_KEY | AI 生成 | [Moonshot](https://platform.moonshot.cn/) |
| COINBASE_API_KEY | 支付 | [Coinbase Commerce](https://commerce.coinbase.com/) |
| RESEND_API_KEY | 邮件 | [Resend](https://resend.com/) |

### 可选配置

| 变量 | 用途 |
|------|------|
| NOWPAYMENTS_API_KEY | 备选支付 |
| REDDIT_CLIENT_ID | Reddit 获客 |
| TWITTER_BEARER_TOKEN | Twitter 获客 |

## API 端点

### 公共端点

```
GET  /api/health           # 健康检查
GET  /api/pricing          # 获取定价
GET  /api/content/types    # 内容类型列表
POST /api/order/create     # 创建订单
GET  /api/order/status     # 查询订单状态
```

### Webhook 端点

```
POST /webhook/coinbase     # Coinbase 支付回调
POST /webhook/nowpayments  # NowPayments 支付回调
```

### 管理端点

```
POST /api/admin/process    # 手动触发处理任务
GET  /api/admin/stats      # 获取统计数据
```

## 自动化流程

### 订单流程

1. **用户下单**
   - 访问网站填写表单
   - 选择内容类型和套餐
   - 系统自动创建订单和支付链接

2. **支付处理**
   - 用户跳转到加密货币支付页面
   - 支付完成后 Webhook 自动通知
   - 订单状态更新为 "paid"

3. **AI 生成**
   - 定时任务检测已支付订单
   - 调用 Moonshot API 生成内容
   - 保存生成结果到数据库

4. **内容交付**
   - 检测到已完成生成的订单
   - 发送邮件到用户邮箱
   - 包含完整的生成内容

### 获客流程

1. **Reddit 自动化**
   ```javascript
   // 手动触发
   POST /api/admin/process
   { "action": "reddit_post" }
   
   // 或通过 Cron 定时执行
   ```

2. **Twitter 自动化**
   ```javascript
   // 手动触发
   POST /api/admin/process
   { "action": "twitter_post" }
   ```

## 定价配置

在 `shared/config.js` 中修改:

```javascript
PRICING: {
  BASIC: { price: 5, words: 500, description: '基础版 - 500词' },
  PRO: { price: 15, words: 1500, description: '专业版 - 1500词' },
  ENTERPRISE: { price: 49, words: 5000, description: '企业版 - 5000词' }
}
```

## 监控与日志

### 查看日志

```bash
npm run logs
```

### 关键指标

- 订单转化率
- 支付成功率
- 内容生成成功率
- 邮件送达率
- 社交媒体互动

## 安全注意事项

1. **API 密钥**: 只在 Cloudflare Dashboard 设置，不要提交到代码仓库
2. **Webhook 签名**: 始终验证支付回调的签名
3. **输入验证**: 所有用户输入都经过严格验证
4. **限流**: API 默认有速率限制保护

## 故障排查

### 订单未处理

1. 检查定时任务是否正常运行
2. 查看 `orders` 表中的状态
3. 检查 AI API 密钥是否有效

### 邮件未发送

1. 验证 Resend API 密钥
2. 检查邮箱格式是否正确
3. 查看 `email_deliveries` 表中的状态

### 支付未到账

1. 检查 Webhook URL 配置
2. 验证 Webhook Secret 是否正确
3. 查看 `payments` 表中的记录

## 扩展开发

### 添加新的内容类型

1. 在 `shared/config.js` 中添加配置
2. 在 `ai/moonshot.js` 中添加提示词模板
3. 更新前端表单选项

### 添加新的支付方式

1. 在 `payment/` 目录创建新模块
2. 实现 `createPayment` 和 `handleWebhook` 方法
3. 在 `api/index.js` 中添加路由

### 添加新的获客渠道

1. 在 `acquisition/` 目录创建新模块
2. 实现发布功能
3. 在管理端点中添加触发方式

## 许可证

MIT License

## 支持

如有问题，请通过以下方式联系:
- Email: support@contentai.com
- Telegram: @contentai_support
