# EU Cross-border API 完整部署手册

## 📋 部署前检查清单

### 必需的账号
- [ ] Stripe账号（已注册）
- [ ] Cloudflare账号（已注册）
- [ ] 域名已购买（eucrossborder.io）

### 必需的信息
- [ ] Stripe Publishable Key
- [ ] Stripe Secret Key
- [ ] Stripe Webhook Secret
- [ ] Cloudflare Account ID
- [ ] Cloudflare API Token

---

## 第一步：账号注册（5分钟）

### 1.1 注册Stripe
1. 访问 https://stripe.com
2. 点击 "Start now" 或 "Sign up"
3. 使用邮箱注册（建议用商业邮箱）
4. 完成邮箱验证
5. 进入Dashboard → Developers → API keys
6. 复制：
   - Publishable key (pk_live_...)
   - Secret key (sk_live_...) ⚠️ 只显示一次，保存好

### 1.2 注册Cloudflare
1. 访问 https://dash.cloudflare.com/sign-up
2. 使用邮箱注册
3. 验证邮箱
4. 进入Dashboard → 右侧 "Account ID"（记下）
5. 进入 "My Profile" → "API Tokens" → "Create Token"
6. 选择 "Custom token"
7. 权限设置：
   - Zone:Read, Zone:Edit
   - Workers Scripts:Edit
   - Account:Read
8. 复制Token（⚠️ 只显示一次）

### 1.3 购买域名
推荐：
- Cloudflare Registrar（€10/年，无隐藏费用）
- Namecheap（$10/年）
- GoDaddy（€12/年，经常有折扣）

购买后，在Cloudflare添加域名：
1. Cloudflare Dashboard → "Add a Site"
2. 输入域名：**eucrossborder.com** ✅ 已购买
3. 选择Free Plan
4. 按照提示修改域名DNS（在购买域名的平台修改）

---

## 第二步：配置项目（10分钟）

### 2.1 安装依赖
```bash
cd /root/ai-empire/projects/eucrossborder-api
npm install
```

### 2.2 配置wrangler.toml
```toml
name = "eucrossborder"
main = "src/index.ts"
compatibility_date = "2026-03-19"

[vars]
STRIPE_PUBLISHABLE_KEY = "pk_live_你的key"

[[kv_namespaces]]
binding = "API_KEYS"
id = "创建后填入"

[[kv_namespaces]]
binding = "USAGE"
id = "创建后填入"
```

### 2.3 创建KV Namespaces
```bash
npx wrangler kv:namespace create "API_KEYS"
npx wrangler kv:namespace create "USAGE"
```

复制输出的ID到wrangler.toml中。

### 2.4 设置Secrets（敏感信息）
```bash
npx wrangler secret put STRIPE_SECRET_KEY
# 输入: sk_live_你的secret key

npx wrangler secret put STRIPE_WEBHOOK_SECRET
# 先随便输入，后面会更新
```

---

## 第三步：部署（2分钟）

### 3.1 运行部署脚本
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

或手动：
```bash
npm run deploy
```

### 3.2 验证部署
访问：
- https://eucrossborder.io/health
- 应返回：{"status":"ok"}

---

## 第四步：配置Stripe（10分钟）

### 4.1 创建产品（Products）
在Stripe Dashboard：
1. Products → "Add product"
2. 创建4个产品：

**Starter (€19/月)**
- Name: Starter Plan
- Price: €19.00 / month
- Metadata: tier: starter, requests: 1000

**Pro (€49/月)**
- Name: Pro Plan  
- Price: €49.00 / month
- Metadata: tier: pro, requests: 5000

**Enterprise (€199/月)**
- Name: Enterprise Plan
- Price: €199.00 / month
- Metadata: tier: enterprise, requests: unlimited

### 4.2 配置Webhook
1. Stripe Dashboard → Developers → Webhooks
2. "Add endpoint"
3. Endpoint URL: `https://eucrossborder.com/webhook`
4. 选择事件：
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. 复制Webhook Secret
6. 更新Cloudflare Secret：
   ```bash
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   # 输入复制的secret
   ```

---

## 第五步：配置域名（5分钟）

### 5.1 在Cloudflare添加域名
1. Cloudflare Dashboard → 你的域名
2. DNS → "Add record"
3. 添加CNAME：
   - Name: @
   - Target: eucrossborder.YOUR_ACCOUNT.workers.dev
   - Proxy status: Proxied (橙色云)

### 5.2 配置SSL
1. SSL/TLS → Overview
2. 选择 "Full (strict)"

### 5.3 验证
访问 https://eucrossborder.com 应看到着陆页。

---

## 第六步：测试（10分钟）

### 6.1 测试API健康
```bash
curl https://eucrossborder.io/health
```

### 6.2 测试免费API
```bash
curl "https://eucrossborder.com/api/v1/calculate?country=IT&product_value=100&shipping=15&platform=amazon"
```

### 6.3 测试订阅流程
1. 访问 https://eucrossborder.com
2. 点击 "Get Started"
3. 选择Starter Plan
4. 使用Stripe测试卡：
   - 卡号：4242 4242 4242 4242
   - 日期：12/25
   - CVC：123
   - 邮编：12345
5. 确认订阅成功

### 6.4 验证Webhook
在Stripe Dashboard → Webhooks → 查看最近事件，确认200状态码。

---

## 第七步：上线检查清单

### 7.1 功能检查
- [ ] API健康检查通过
- [ ] VAT计算正确（测试几个国家）
- [ ] 订阅创建成功
- [ ] 订阅取消成功
- [ ] 使用量追踪正确
- [ ] Webhook正常工作

### 7.2 安全设置
- [ ] 所有Secret已设置
- [ ] 域名使用HTTPS
- [ ] Rate limiting已启用
- [ ] CORS配置正确

### 7.3 监控设置
- [ ] Cloudflare Analytics开启
- [ ] Stripe Dashboard书签
- [ ] 设置每周数据检查提醒

---

## 故障排查

### 问题1：部署失败
**解决**: 
```bash
npx wrangler login
# 重新登录
npm run deploy
```

### 问题2：Stripe支付失败
**检查**:
- Secret key是否正确
- Webhook secret是否更新
- Stripe Dashboard → Logs查看错误

### 问题3：域名不生效
**解决**:
- DNS传播需要5分钟-48小时
- 检查DNS记录是否正确
- Cloudflare DNS → "Purge Cache"

---

## 上线后维护（每月5分钟）

### 每月检查
1. Stripe Dashboard → 查看收入和订阅数
2. Cloudflare Analytics → 查看API调用量
3. 检查是否有异常错误
4. 查看用户反馈邮件

### 续费提醒
- 域名：每年€10（设置自动续费）
- Cloudflare：免费计划够用
- Stripe：按交易额收费（无月费）

---

## 快速命令参考

```bash
# 部署
npm run deploy

# 查看日志
npx wrangler tail

# 更新Secret
npx wrangler secret put STRIPE_SECRET_KEY

# KV操作
npx wrangler kv:key list --namespace-id=xxx
```

---

## 需要帮助？

**Stripe文档**: https://stripe.com/docs  
**Cloudflare Workers文档**: https://developers.cloudflare.com/workers/  
**项目README**: `/root/ai-empire/projects/eucrossborder-api/README.md`

---

**部署完成后通知我，我会帮你验证并制定获客策略！**
