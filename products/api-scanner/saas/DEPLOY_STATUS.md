# ⚡ Cloudflare 部署完成准备
# 小七配置 - 使用你的 Token 和域名

---

## ✅ 已配置

| 项目 | 值 |
|------|-----|
| **域名** | eucrossborder.com |
| **Token** | cfat_Kq2d2bLPJItUCdjvQ74OKdy31fL4Ve0Hkfp8Reng949b5c67 |
| **Stripe PK** | pk_live_51TCfcBDRLWt3rKvb0I0gfVnf94mlg3QDkl9hGUaJqqB8pPCMEy7Lj46SW4oxMIDbglx6qqBbqxzLSpDpvII25chX00nC0SzxLR |
| **Webhook Secret** | whsec_LIOC54Mu4B0GIInSj0SSfIbQ4A5zgMT0 |

---

## 🚀 一键部署

由于缺少 Wrangler CLI，使用以下手动步骤：

### 步骤1: 下载前端文件
```bash
cd /tmp
curl -L https://github.com/fabio2026-ui/ai-agent-passive-income/raw/master/products/api-scanner/saas/frontend/index.html -o index.html
curl -L https://github.com/fabio2026-ui/ai-agent-passive-income/raw/master/products/api-scanner/saas/frontend/pricing.html -o pricing.html
```

### 步骤2: 部署到 Cloudflare Pages
1. 访问 https://dash.cloudflare.com
2. Pages → Create a project
3. 拖放上传 index.html 和 pricing.html
4. 项目名: `api-security-scanner`

### 步骤3: 配置自定义域名
1. 项目设置 → Custom domains
2. 添加: `scanner.eucrossborder.com`
3. Cloudflare 自动配置 DNS

---

## 🎯 部署后配置

### 设置 Stripe Webhook
1. 访问 https://dashboard.stripe.com/webhooks
2. Add endpoint:
   - URL: `https://scanner.eucrossborder.com/webhook`
   - Secret: `whsec_LIOC54Mu4B0GIInSj0SSfIbQ4A5zgMT0`
   - 事件: `checkout.session.completed`, `invoice.paid`

### 配置后端（可选）
由于缺少 Stripe Secret Key，前端支付流程已完成，后端处理需补充。

---

## 📊 部署状态

```
[██████████░░░░░░░░░░] 50%

✅ 域名配置    - eucrossborder.com
✅ Token验证   - 已配置
✅ 前端文件    - 已准备
✅ Stripe PK   - 已注入
⏳ 部署执行    - 等待手动上传
⏳ 后端API     - 需 Stripe Secret Key
```

---

## 立即行动

**最快方式**: 手动上传
1. 访问 https://dash.cloudflare.com
2. Pages → Create → Upload
3. 选择 `products/api-scanner/saas/frontend/` 文件夹
4. 部署完成！

**15分钟内上线**

---

*小七配置完成*
*等待你完成最后一步上传*
