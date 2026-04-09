# ContentAI MVP - 5分钟快速上线

## 🎯 分阶段策略
**阶段1**: MVP上线 (今天) - 核心功能
**阶段2**: 添加支付 (后续) - 开始收费

---

## 🚀 阶段1: MVP上线 (只需2个API)

### 需要申请的API (都是免费额度)

| API | 用途 | 申请地址 | 时间 |
|-----|------|---------|------|
| **Moonshot** | AI内容生成 | https://platform.moonshot.cn/ | 2分钟 |
| **Resend** | 自动邮件发送 | https://resend.com/ | 1分钟 |

### 部署步骤

```bash
# 1. 进入目录
cd /root/.openclaw/workspace/contentai/auto-system

# 2. 创建配置
cp .env.simple .env
nano .env
# 填入 MOONSHOT_API_KEY 和 RESEND_API_KEY

# 3. 一键部署
bash deploy-mvp.sh
```

### 部署后功能

✅ 用户访问网站  
✅ 输入需求  
✅ AI自动生成内容  
✅ 自动邮件交付  
✅ 完全自动化！  

---

## 💰 阶段2: 添加支付 (随时升级)

当你准备好收费时：

```bash
# 1. 切换到完整配置
cp .env .env.backup
cp .env.example .env
# 填入 STRIPE_SECRET_KEY

# 2. 重新部署
npx wrangler deploy
```

---

## 📊 成本对比

| 阶段 | 成本 | 收入 |
|------|------|------|
| MVP | $0 | ¥0 (免费试用) |
| 完整版 | $0 | 自动进账 |

---

## ✅ 现在就可以做的事

1. 申请 Moonshot API (2分钟)
2. 申请 Resend API (1分钟)  
3. 部署上线 (2分钟)

**总共5分钟，MVP上线！**
