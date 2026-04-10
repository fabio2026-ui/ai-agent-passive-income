# Railway 手动部署指南
# 无需CLI，网页操作

---

## 步骤1: 准备代码

确保以下文件已准备好:
- `Dockerfile` ✅
- `backend/main.py` ✅
- `payment/stripe_integration.py` ✅
- `frontend/index.html` ✅
- `frontend/pricing.html` ✅

---

## 步骤2: 创建Railway项目

1. 访问 https://railway.app
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择: `fabio2026-ui/ai-agent-passive-income`
5. 选择目录: `ai-agent-projects/products/api-scanner/saas`

---

## 步骤3: 配置环境变量

在项目页面，点击 "Variables" → "New Variable":

```
STRIPE_API_KEY=sk_live_你的密钥
STRIPE_WEBHOOK_SECRET=whsec_LIOC54Mu4B0GIInSj0SSfIbQ4A5zgMT0
APP_ENV=production
DEBUG=False
```

**获取 Stripe API Key:**
1. 访问 https://dashboard.stripe.com/apikeys
2. 复制 Secret key (格式: sk_live_...)

---

## 步骤4: 部署

点击 "Deploy" 按钮，等待部署完成。

---

## 步骤5: 配置Webhook

1. 获取Railway域名 (如: api-scanner.up.railway.app)
2. 访问 https://dashboard.stripe.com/webhooks
3. 点击 "Add endpoint"
4. 填写:
   - Endpoint URL: `https://你的域名/webhook`
   - Description: API Scanner Webhook
5. 选择事件:
   - ✅ checkout.session.completed
   - ✅ invoice.paid
   - ✅ customer.subscription.deleted
6. 点击 "Add endpoint"

---

## 步骤6: 测试

1. 访问: `https://你的域名/pricing.html`
2. 点击 "Get Started" (Pro计划)
3. 使用Stripe测试卡: `4242 4242 4242 4242`
4. 完成支付流程

---

## 完成! 🎉

你的API扫描器SaaS已上线。

**定价:**
- Free: €0 (3次扫描/月)
- Pro: €29/月 (无限扫描)
- Team: €99/月 (10用户)

**预估收入:** €500+/月 (20个Pro用户)
