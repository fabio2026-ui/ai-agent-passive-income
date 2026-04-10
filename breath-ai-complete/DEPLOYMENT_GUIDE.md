# Breathing AI 完整版部署指南 (带Stripe支付)

## 🚀 快速开始

### 前提条件
- Node.js 18+
- Cloudflare 账号
- Stripe 账号
- Wrangler CLI 已安装并登录

### 1. 配置 Stripe 密钥

由于提供的 API key 已过期，需要更新为有效的密钥：

1. 前往 [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. 复制 Publishable key (pk_test_...)
3. 复制 Secret key (sk_test_...)
4. 更新以下文件：

**backend/wrangler.toml:**
```toml
[vars]
STRIPE_PUBLISHABLE_KEY = "pk_test_your_actual_key"
```

**frontend/.env:**
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your_actual_key
```

### 2. 创建 Stripe 产品和价格

```bash
# 编辑脚本，更新 STRIPE_SECRET_KEY
vim setup-stripe-products.sh

# 运行脚本
./setup-stripe-products.sh
```

这将在 Stripe 中创建两个订阅计划：
- **专业版**: ¥28/月 (约 $4 USD)
- **家庭版**: ¥48/月 (约 $7 USD)

### 3. 部署后端

```bash
# 进入后端目录
cd backend

# 设置 Stripe Secret Key 为 Cloudflare Secret
wrangler secret put STRIPE_SECRET_KEY
# 输入: sk_test_your_actual_secret_key

# 设置 Webhook Secret
wrangler secret put STRIPE_WEBHOOK_SECRET
# 输入: whsec_... (先部署后从 Stripe Dashboard 获取)

# 部署
wrangler deploy
```

### 4. 配置 Stripe Webhook

1. 部署后获取 Worker URL: `https://breath-ai-backend.your-subdomain.workers.dev`
2. 前往 [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
3. 添加 endpoint: `https://your-worker-url.workers.dev/api/stripe/webhook`
4. 选择以下事件：
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. 复制 Signing secret (whsec_...)
6. 更新 Cloudflare Secret:
   ```bash
   wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

### 5. 部署前端

```bash
cd frontend

# 安装依赖
npm install

# 构建
npm run build

# 部署到 Cloudflare Pages (可选)
wrangler pages deploy dist
```

### 6. 更新 Price IDs

运行 `setup-stripe-products.sh` 后，会生成 `stripe-price-ids.json`：

```json
{
  "premium_monthly": "price_xxxxx",
  "premium_plus_monthly": "price_xxxxx"
}
```

更新 `frontend/.env`:
```env
VITE_STRIPE_PREMIUM_PRICE_ID=price_xxxxx
VITE_STRIPE_PREMIUM_PLUS_PRICE_ID=price_xxxxx
```

重新构建并部署前端。

## 🧪 测试支付流程

### 使用测试卡

| 卡号 | 结果 |
|------|------|
| 4242 4242 4242 4242 | 支付成功 |
| 4000 0000 0000 0002 | 支付被拒绝 |
| 4000 0025 0000 3155 | 需要3D验证 |

### 测试步骤

1. 打开前端应用
2. 点击底部导航 "会员"
3. 选择 "专业版" 或 "家庭版"
4. 点击 "订阅"
5. 在 Stripe Checkout 页面输入测试卡号
6. 完成支付
7. 验证订阅状态更新

## 📁 项目结构

```
breath-ai-complete/
├── backend/
│   ├── src/
│   │   ├── index.ts          # 主入口 (包含所有 API 路由)
│   │   └── router.ts         # 路由工具
│   ├── wrangler.toml         # Cloudflare Worker 配置
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # 主应用组件
│   │   ├── services/
│   │   │   ├── stripe.ts     # Stripe 服务
│   │   │   ├── bluetooth.ts  # 蓝牙心率监测
│   │   │   ├── aiEngine.ts   # AI 推荐引擎
│   │   │   └── duoSync.ts    # 双人同步
│   │   └── ...
│   ├── .env                  # 环境变量
│   └── package.json
├── setup-stripe-products.sh  # Stripe 产品创建脚本
├── deploy-full.sh            # 完整部署脚本
└── test-payment-flow.sh      # 支付流程测试脚本
```

## 🔧 环境变量

### 后端 (Cloudflare Secrets)
- `STRIPE_SECRET_KEY` - Stripe Secret Key
- `STRIPE_WEBHOOK_SECRET` - Stripe Webhook Signing Secret

### 后端 (Cloudflare Vars)
- `STRIPE_PUBLISHABLE_KEY` - Stripe Publishable Key (public)

### 前端
- `VITE_STRIPE_PUBLIC_KEY` - Stripe Publishable Key
- `VITE_API_URL` - 后端 API URL
- `VITE_STRIPE_PREMIUM_PRICE_ID` - 专业版 Price ID
- `VITE_STRIPE_PREMIUM_PLUS_PRICE_ID` - 家庭版 Price ID

## 📊 支付流程

```
用户点击订阅
    ↓
前端调用 stripeService.redirectToCheckout(priceId)
    ↓
调用 POST /api/stripe/checkout
    ↓
后端创建 Stripe Checkout Session
    ↓
返回 { sessionId, url }
    ↓
前端重定向到 Stripe Checkout 页面
    ↓
用户完成支付
    ↓
Stripe 发送 webhook → POST /api/stripe/webhook
    ↓
后端验证并更新订阅到 KV
    ↓
用户重定向回 success_url
    ↓
前端检查订阅状态
```

## 🔒 安全注意事项

1. **永远不要**将 Secret Key 提交到代码仓库
2. 使用 Cloudflare Secrets 存储敏感信息
3. 在生产环境使用 HTTPS
4. 验证所有 webhook 签名
5. 在生产环境使用 Live API keys

## 🐛 故障排除

### 支付失败
- 检查 Stripe Dashboard 中的日志
- 确认 Price ID 正确
- 测试卡号是否有效

### Webhook 不工作
- 确认 endpoint URL 正确
- 检查 Webhook Secret 是否正确设置
- 查看 Cloudflare Worker 日志: `wrangler tail`

### 订阅状态不更新
- 检查 KV namespace 绑定
- 确认 webhook 事件被正确处理
- 查看 Worker 日志

## 📈 监控

使用以下命令监控 Worker：
```bash
cd backend
wrangler tail
```

## 📝 许可证

MIT
