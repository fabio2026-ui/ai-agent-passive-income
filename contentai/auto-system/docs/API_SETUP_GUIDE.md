# ContentAI API 申请完全指南

**目标**: 获取运行ContentAI所需的全部API密钥
**预计时间**: 15-30分钟
**难度**: ⭐⭐ 简单

---

## 📋 申请清单

- [ ] Moonshot AI API (AI内容生成)
- [ ] Resend API (邮件发送)
- [ ] Stripe账户 (信用卡支付) - 可选但推荐
- [ ] Cloudflare账户 (部署托管) - 必需

---

## 1️⃣ Moonshot AI API 申请

**用途**: AI内容生成核心引擎
**费用**: 新用户免费送15元额度
**链接**: https://platform.moonshot.cn/

### 申请步骤

1. **访问官网**
   ```
   https://platform.moonshot.cn/
   ```

2. **注册账户**
   - 点击"注册"
   - 使用手机号或邮箱注册
   - 完成实名认证（需要身份证）

3. **创建API密钥**
   - 登录后点击左侧菜单"API Key管理"
   - 点击"创建API Key"
   - 给密钥起个名字，如 "ContentAI-Production"
   - 点击"创建"

4. **复制密钥**
   ```
   sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ **重要**: 密钥只显示一次，立即复制保存！

5. **充值（可选）**
   - 新用户免费送15元
   - 用完后充值，价格约￥0.006/千token
   - 充值￥50足够初期使用

### 费用预估
| 内容类型 | 字数 | Token消耗 | 成本 |
|---------|------|----------|------|
| 基础版 | 500词 | ~800 token | ￥0.005 |
| 专业版 | 1500词 | ~2400 token | ￥0.015 |
| 企业版 | 5000词 | ~8000 token | ￥0.05 |

---

## 2️⃣ Resend API 申请

**用途**: 发送订单确认邮件和内容交付邮件
**费用**: 每月免费3000封
**链接**: https://resend.com/

### 申请步骤

1. **访问官网**
   ```
   https://resend.com/
   ```

2. **注册账户**
   - 点击"Get Started"
   - 使用GitHub或邮箱注册

3. **验证域名（可选，初期可跳过）**
   - 在Dashboard点击"Domains"
   - 点击"Add Domain"
   - 输入你的域名（如 contentai.com）
   - 按提示添加DNS记录
   - ⚠️ 没有域名可用默认域名：onboarding@resend.dev

4. **创建API密钥**
   - 点击左侧"API Keys"
   - 点击"Create API Key"
   - 选择权限：Sending access
   - 给密钥命名："ContentAI-Sending"
   - 点击"Create"

5. **复制密钥**
   ```
   re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ **重要**: 密钥只显示一次，立即复制！

### 免费额度
- 每月3000封免费邮件
- 超出后$0.001/封
- 初期完全够用

---

## 3️⃣ Stripe 账户申请（推荐）

**用途**: 信用卡支付
**费用**: 2.9% + $0.30/笔
**链接**: https://dashboard.stripe.com/

### 申请步骤

1. **访问官网**
   ```
   https://dashboard.stripe.com/register
   ```

2. **注册账户**
   - 输入邮箱和密码
   - 验证邮箱
   - 完成账户信息

3. **获取API密钥**
   - 登录后点击左侧"Developers" → "API keys"
   - 复制"Secret key"（以sk_live_或sk_test_开头）
   - 复制"Publishable key"（以pk_live_或pk_test_开头）

4. **创建Webhook（部署后配置）**
   - 点击"Webhooks"
   - 点击"Add endpoint"
   - Endpoint URL: `https://your-domain.com/webhook/stripe`
   - 选择事件：`checkout.session.completed`
   - 保存后复制Webhook Secret

### 测试模式
- 使用Test密钥测试支付流程
- 测试卡号：4242 4242 4242 4242
- 任意未来日期和3位CVC

---

## 4️⃣ Cloudflare 账户设置

**用途**: 部署Workers和D1数据库
**费用**: 免费额度完全够用
**链接**: https://dash.cloudflare.com/

### 申请步骤

1. **访问官网**
   ```
   https://dash.cloudflare.com/sign-up
   ```

2. **注册账户**
   - 使用邮箱注册
   - 验证邮箱

3. **获取API Token（用于部署）**
   - 点击右上角头像 → "My Profile"
   - 点击"API Tokens"标签
   - 点击"Create Token"
   - 选择"Custom token"
   - 配置权限：
     - Account: Cloudflare Workers:Edit
     - Zone: Zone:Read (选你的域名)
     - Zone: Workers Routes:Edit
   - 点击"Continue" → "Create Token"
   - 复制Token

4. **或使用Global API Key**
   - 在"API Tokens"页面
   - 滚动到"Global API Key"
   - 点击"View"，输入密码
   - 复制Key

### 登录Wrangler
```bash
npx wrangler login
# 按提示在浏览器授权
```

---

## 🔧 配置.env文件

获取所有API密钥后，编辑`.env`文件：

```bash
cd /root/.openclaw/workspace/contentai/auto-system
cp .env.example .env
nano .env
```

填入你的密钥：

```env
# ============================================
# 应用配置
# ============================================
APP_URL=https://contentai.yourdomain.com
APP_NAME=ContentAI
EMAIL_FROM=noreply@contentai.com

# ============================================
# Moonshot AI API (必需)
# ============================================
MOONSHOT_API_KEY=sk-你的密钥

# ============================================
# Stripe (推荐)
# ============================================
STRIPE_SECRET_KEY=sk_live_你的密钥
STRIPE_WEBHOOK_SECRET=whsec_你的密钥
STRIPE_PUBLISHABLE_KEY=pk_live_你的密钥

# ============================================
# Resend 邮件服务 (必需)
# ============================================
RESEND_API_KEY=re_你的密钥
```

---

## ✅ 验证配置

配置完成后，运行验证脚本：

```bash
cd /root/.openclaw/workspace/contentai/auto-system
node scripts/verify-config.js
```

---

## 🆘 常见问题

### Q: 没有域名怎么办？
**A**: 可以使用Cloudflare Pages免费子域名或购买一个便宜域名($10/年)

### Q: Moonshot实名认证不通过？
**A**: 确保身份证照片清晰，光线充足，四角完整

### Q: Stripe需要公司吗？
**A**: 个人也可以用，选择Individual账户类型

### Q: 可以先不用支付功能吗？
**A**: 可以！系统支持免费模式，先上线后加支付

---

## 📞 支持

遇到问题？
- Moonshot: https://platform.moonshot.cn/docs
- Resend: https://resend.com/docs
- Stripe: https://stripe.com/docs

**下一步**: 获取所有密钥后，运行 `./deploy-mvp.sh` 开始部署！
