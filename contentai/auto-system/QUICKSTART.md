# ContentAI 快速启动指南

## 🚀 5分钟完成部署

### 步骤1: 配置API密钥 (2分钟)

```bash
cd /root/.openclaw/workspace/contentai/auto-system
cp .env.example .env
nano .env
```

**必填项**:
```
# Moonshot AI (必需)
MOONSHOT_API_KEY=sk-你的密钥

# Stripe (必需 - 你有这个！)
STRIPE_SECRET_KEY=sk_live_你的密钥
STRIPE_WEBHOOK_SECRET=whsec_你的密钥

# Resend邮件 (必需)
RESEND_API_KEY=re_你的密钥

# 网站地址
APP_URL=https://contentai.yourdomain.com
```

### 步骤2: 获取API密钥

| 服务 | 获取地址 | 用途 |
|------|---------|------|
| **Moonshot** | https://platform.moonshot.cn/ | AI内容生成 |
| **Stripe** | https://dashboard.stripe.com/apikeys | 收款 |
| **Resend** | https://resend.com/ | 自动邮件发送 |

### 步骤3: 部署 (1分钟)

```bash
bash deploy.sh
```

或手动:
```bash
npm install
npx wrangler deploy
```

### 步骤4: 配置Stripe Webhook

1. 访问 https://dashboard.stripe.com/webhooks
2. 添加 Endpoint: `https://你的域名/webhook/stripe`
3. 选择事件: `checkout.session.completed`
4. 复制 Signing secret 到 `.env`

### 步骤5: 启动获客脚本

```bash
# Reddit自动发帖
npx wrangler kv:key put --namespace-id=YOUR_KV_ID "reddit_enabled" "true"

# Twitter自动发布  
npx wrangler kv:key put --namespace-id=YOUR_KV_ID "twitter_enabled" "true"
```

---

## ✅ 部署完成后

**你的全自动闭环系统**: 
- 🌐 网站: https://你的域名
- 💰 收款: Stripe自动处理
- 🤖 生成: AI自动创作
- 📧 交付: 自动邮件发送
- 🎯 获客: Reddit/Twitter自动发帖

**收入直接进入你的Stripe账户！**
