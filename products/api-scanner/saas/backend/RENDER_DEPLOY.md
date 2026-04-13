# 🚀 Render.com 部署指南 (5分钟完成)
# 小七自动部署包

---

## 快速部署 (一键)

### 方法1: Render Dashboard (推荐)

1. **访问 Render**
   ```
   https://dashboard.render.com
   ```

2. **点击 "New +" → "Web Service"**

3. **连接 GitHub**
   - 选择: `fabio2026-ui/ai-agent-passive-income`

4. **配置:**
   ```
   Name: api-scanner-backend
   Branch: master
   Root Directory: products/api-scanner/saas/backend
   Build Command: npm install
   Start Command: node server.js
   Plan: Free
   ```

5. **环境变量:**
   ```
   STRIPE_SECRET_KEY = sk_live_你的密钥
   FRONTEND_URL = https://scanner.eucrossborder.com
   NODE_ENV = production
   ```

6. **点击 "Create Web Service"**

完成！Render 会自动构建并部署。

---

## 部署后配置

### 1. 获取后端地址
部署完成后，Render 会给你一个地址：
```
https://api-scanner-backend-xxxxx.onrender.com
```

### 2. 更新前端 API 地址
编辑 `frontend/pricing.html`，找到：
```javascript
const API_BASE = 'https://api-scanner-backend-xxxxx.onrender.com';
```

### 3. 配置 Stripe Webhook
在 Stripe Dashboard:
```
https://dashboard.stripe.com/webhooks

Endpoint URL: https://api-scanner-backend-xxxxx.onrender.com/api/webhook
Events: checkout.session.completed
```

---

## 收入预测

部署完成后:

| 用户 | 转化率 | 月收入 |
|------|--------|--------|
| 100访客 | 5% | - |
| 5付费用户 | - | €145-495 |
| 1000访客 | 5% | - |
| 50付费用户 | - | €1,450-4,950 |

---

## 下一步行动

1. ✅ 点击部署 (5分钟)
2. ✅ 配置 Stripe Secret Key
3. ✅ 更新前端 API 地址
4. ✅ 配置 Webhook

**完成后 scanner.eucrossborder.com 开始收钱！**

---

*小七部署包*
*2026-04-10 23:26 GMT+8*