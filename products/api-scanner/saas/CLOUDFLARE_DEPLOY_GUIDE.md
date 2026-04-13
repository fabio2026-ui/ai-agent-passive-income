# Cloudflare 手动部署指南
# 使用你的 Token 和域名 eucrossborder.com

---

## 方案A: Cloudflare Pages (前端)

### 步骤1: 登录 Cloudflare
1. 访问 https://dash.cloudflare.com
2. 使用已有账号登录

### 步骤2: 创建 Pages 项目
1. 点击左侧 "Pages"
2. 点击 "Create a project"
3. 选择 "Upload assets"

### 步骤3: 上传文件
1. 选择目录: `products/api-scanner/saas/frontend/`
2. 项目名: `api-security-scanner`
3. 点击 "Deploy site"

### 步骤4: 配置自定义域名
1. 项目设置 → Custom domains
2. 添加: `scanner.eucrossborder.com`
3. 按提示配置 DNS

### 步骤5: 配置 Stripe
1. 编辑 `index.html` 和 `pricing.html`
2. 替换 `YOUR_STRIPE_PUBLIC_KEY` 为:
   ```
   pk_live_51TCfcBDRLWt3rKvb0I0gfVnf94mlg3QDkl9hGUaJqqB8pPCMEy7Lj46SW4oxMIDbglx6qqBbqxzLSpDpvII25chX00nC0SzxLR
   ```

---

## 方案B: Cloudflare Workers (后端API)

### 部署 Workers

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录
wrangler login

# 创建 Worker
wrangler init api-scanner-worker

# 部署
wrangler deploy
```

### Worker 代码 (简化版)

```javascript
// worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/webhook') {
      // Stripe Webhook 处理
      const signature = request.headers.get('stripe-signature');
      const body = await request.text();
      
      // 验证签名
      // 使用 env.STRIPE_WEBHOOK_SECRET
      
      return new Response('OK');
    }
    
    if (url.pathname === '/create-checkout') {
      // 创建 Stripe Checkout 会话
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'subscription',
          'success_url': 'https://scanner.eucrossborder.com/success',
          'cancel_url': 'https://scanner.eucrossborder.com/pricing',
          'line_items[0][price]': 'price_xxx',
          'line_items[0][quantity]': '1',
        }),
      });
      
      const session = await response.json();
      return Response.json({ url: session.url });
    }
    
    return new Response('Not Found', { status: 404 });
  },
};
```

### 环境变量

```bash
wrangler secret put STRIPE_SECRET_KEY
# 输入: sk_live_...

wrangler secret put STRIPE_WEBHOOK_SECRET
# 输入: whsec_LIOC54Mu4B0GIInSj0SSfIbQ4A5zgMT0
```

---

## 方案C: 混合部署 (推荐)

```
前端 (Pages): scanner.eucrossborder.com
  └── 静态HTML/CSS/JS
  └── Stripe Checkout 客户端

后端 (Workers): api.eucrossborder.com
  └── /webhook - Stripe Webhook
  └── /create-checkout - 创建支付会话
  └── /scan - API扫描功能

数据库 (D1): Cloudflare D1
  └── 用户数据
  └── 扫描记录
  └── 订阅信息
```

---

## 立即执行

### 选项1: 我帮你一键部署
运行:
```bash
cd products/api-scanner/saas
./deploy-cloudflare.sh
```

### 选项2: 你手动部署
按上述步骤，15分钟完成。

---

## 完成后

- 访问: https://scanner.eucrossborder.com
- 测试支付流程
- 配置 Webhook
- 开始赚钱 💰

预估收入: €500+/月
