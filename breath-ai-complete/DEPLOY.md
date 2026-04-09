# Breath AI 部署指南

## 1. 准备工作

### 1.1 创建 Stripe 账户
1. 访问 https://stripe.com
2. 创建账户并完成验证
3. 获取 API Keys:
   - 开发: `pk_test_...` 和 `sk_test_...`
   - 生产: `pk_live_...` 和 `sk_live_...`
4. 创建产品:
   - 专业版 (¥28/月)
   - 家庭版 (¥48/月)
5. 获取 Price IDs (格式: `price_...`)

### 1.2 创建 Cloudflare 账户
1. 访问 https://dash.cloudflare.com
2. 创建账户
3. 安装 Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```
4. 登录:
   ```bash
   wrangler login
   ```

## 2. 后端部署

### 2.1 创建 KV 命名空间
```bash
cd backend

# 创建 Subscriptions KV
wrangler kv:namespace create "SUBSCRIPTIONS"
# 输出类似: { id = "xxxxx" }

# 创建 Duo Sessions KV  
wrangler kv:namespace create "DUO_SESSIONS"
# 输出类似: { id = "yyyyy" }
```

### 2.2 更新 wrangler.toml
```toml
[[kv_namespaces]]
binding = "SUBSCRIPTIONS"
id = "xxxxx"  # 替换为上一步的输出

[[kv_namespaces]]
binding = "DUO_SESSIONS"  
id = "yyyyy"  # 替换为上一步的输出
```

### 2.3 设置环境变量
```bash
# 设置 Stripe 密钥
wrangler secret put STRIPE_SECRET_KEY
# 输入: sk_test_... 或 sk_live_...

# 设置 Webhook Secret
wrangler secret put STRIPE_WEBHOOK_SECRET
# 输入: whsec_...
```

### 2.4 部署
```bash
npm run deploy
```

### 2.5 配置 Stripe Webhook
1. 在 Stripe Dashboard 中，添加 Webhook Endpoint
2. URL: `https://your-worker.your-subdomain.workers.dev/api/stripe/webhook`
3. 选择事件:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`

## 3. 前端部署

### 3.1 配置环境变量
创建 `frontend/.env`:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
```

### 3.2 构建
```bash
cd frontend
npm run build
```

### 3.3 部署到 Cloudflare Pages
```bash
# 使用 Wrangler
wrangler pages publish dist
```

或连接到 Git 仓库自动部署。

## 4. 域名配置 (可选)

### 4.1 添加自定义域名
1. 在 Cloudflare Dashboard 中，选择 Workers & Pages
2. 添加自定义域名
3. 配置 DNS

### 4.2 更新 Stripe Webhook URL
使用自定义域名更新 webhook URL。

## 5. 测试

### 5.1 测试支付
使用 Stripe 测试卡号:
- 成功: `4242 4242 4242 4242`
- 失败: `4000 0000 0000 0002`
- 任何未来日期 + 任意 3 位 CVC

### 5.2 测试心率监测
1. 使用 Chrome 浏览器
2. 访问应用
3. 点击"心率"标签
4. 连接支持蓝牙心率服务的设备

### 5.3 测试双人同步
1. 订阅家庭版
2. 创建房间
3. 在另一设备上加入房间
4. 测试实时同步

## 6. 生产环境检查清单

- [ ] 使用 Stripe 生产模式密钥
- [ ] 配置正确的域名
- [ ] 设置 Webhook 签名验证
- [ ] 启用 HTTPS
- [ ] 测试支付流程
- [ ] 测试取消订阅功能
- [ ] 测试心率连接
- [ ] 测试双人同步

## 7. 故障排除

### 问题: 支付后订阅未更新
- 检查 Stripe Webhook 是否正确配置
- 查看 Cloudflare Workers 日志: `wrangler tail`

### 问题: 蓝牙无法连接
- 确保使用 HTTPS
- 确保使用 Chrome/Edge 浏览器
- 检查设备支持蓝牙心率服务

### 问题: 双人同步失败
- 检查 WebRTC 连接
- 确保双方都订阅了家庭版
- 检查防火墙设置
