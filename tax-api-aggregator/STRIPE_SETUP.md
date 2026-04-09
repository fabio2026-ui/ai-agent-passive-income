# Stripe配置指南

## 1. 创建Stripe账户

访问 https://stripe.com 注册账户

## 2. 获取API密钥

1. 进入 Stripe Dashboard → Developers → API keys
2. 复制 `Secret key` (以 sk_ 开头)
3. 设置到Cloudflare Workers:
   ```bash
   wrangler secret put STRIPE_SECRET_KEY
   ```

## 3. 创建产品定价

### 方式1: 通过Dashboard
1. Stripe Dashboard → Products → Add product
2. 产品名称: "Tax API Basic Plan"
3. 定价: €29/月
4. 复制 Price ID (以 price_ 开头)
5. 更新 wrangler.toml 中的 STRIPE_PRICE_ID

### 方式2: 通过API
```bash
curl -X POST https://api.stripe.com/v1/products \
  -u sk_test_xxx: \
  -d "name=Tax API Basic Plan" \
  -d "description=Access to 12 Tax APIs with 1000 requests/hour"

curl -X POST https://api.stripe.com/v1/prices \
  -u sk_test_xxx: \
  -d "product=prod_xxx" \
  -d "unit_amount=2900" \
  -d "currency=eur" \
  -d "recurring[interval]=month"
```

## 4. 配置Webhook

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint:
   - Endpoint URL: `https://api.taxaggregator.eu/webhooks/stripe`
   - Events to listen:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`

3. 复制 Signing secret (以 whsec_ 开头)
4. 设置到Cloudflare Workers:
   ```bash
   wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

## 5. 本地测试Webhooks

使用Stripe CLI:
```bash
# 安装Stripe CLI
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 转发webhook到本地
stripe listen --forward-to localhost:8787/webhooks/stripe

# 触发测试事件
stripe trigger checkout.session.completed
```

## 6. 测试支付流程

使用Stripe测试卡号:
- 成功支付: `4242 4242 4242 4242`
- 需要3D验证: `4000 0025 0000 3155`
- 支付失败: `4000 0000 0000 9995`

任意未来日期作为到期日，任意3位数字作为CVC

## 7. 生产环境检查清单

- [ ] 使用Live模式API密钥 (sk_live_xxx)
- [ ] 创建Live产品定价
- [ ] 配置Live Webhook endpoint
- [ ] 更新wrangler.toml中的STRIPE_PRICE_ID
- [ ] 在Stripe Dashboard中配置税务设置
- [ ] 设置Stripe邮件通知