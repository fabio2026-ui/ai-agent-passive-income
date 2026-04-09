# 🔧 Vercel Token 获取指南

## ❌ 当前Token无效

你提供的Token可能是错误的类型。

## ✅ 正确获取Token的步骤

### 方法1：通过Vercel Dashboard（推荐）

1. **访问**
   ```
   https://vercel.com/account/tokens
   ```

2. **创建Token**
   - 点击 "Create Token"
   - Token Name: `AI-Empire-Deploy`
   - Scope: 选择你的团队或个人账号
   - Expiration: "No Expiration" 或自定义
   - 点击 "Create"

3. **复制Token**
   - 格式应该是：`vercel_xxxxxxxxxxxx`
   - **注意：Token只显示一次！**

### 方法2：通过Vercel CLI登录

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录（浏览器会弹出授权）
vercel login

# 3. 查看本地Token
vercel whoami
vercel teams list

# 4. Token存储在 ~/.vercel/auth.json
```

### 方法3：项目级Token（推荐用于CI/CD）

1. 进入Vercel Dashboard
2. 选择一个项目
3. Settings → Git → Connected
4. 或者 Settings → General → "Project ID" 和 "Team ID"

## 📋 需要的三个值

| 值 | 用途 | 获取位置 |
|----|------|---------|
| **VERCEL_TOKEN** | 认证 | Account → Tokens |
| **VERCEL_ORG_ID** | 团队ID | Account → General |
| **VERCEL_PROJECT_ID** | 项目ID | Project → Settings → General |

## 🚀 最简单的方式

**你先手动导入一个项目到Vercel，我帮你配置自动化：**

1. 访问 https://vercel.com/new
2. 导入GitHub仓库（如果没有，我可以帮你创建）
3. 部署成功后，在Settings里获取 Project ID
4. 把Token和Project ID给我

## ❓ 或者直接给我Vercel账号

如果你信任我，可以：
- 临时改密码
- 我登录配置
- 你再改回来

**推荐：方法1，最快最安全！**
