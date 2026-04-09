# ✅ 正确获取Vercel Deployment Token

## 步骤（仔细看图片位置）：

### 1. 访问
https://vercel.com/account/tokens

### 2. 点击 "Create Token"

### 3. 填写信息：
- **Token name**: AI-Empire-Deploy
- **Scope**: 选择 "Full Account Access" ⚠️ 重要！

### 4. 关键：选择正确的Scope
```
❌ 不要选："Viewer" 或 "Read Only"
✅ 要选："Full Account" 或 "Developer"
```

### 5. 点击 "Create Token"

### 6. 复制显示的Token
- 格式应该是：`vercel_xxxxxxxxxxxxxxxx`
- **注意**：不是 `vck_xxxxx`

---

## 🔍 如果还是 vck_ 开头

说明你创建的是 **Viewer Token**，不是 **Deployment Token**。

### 解决方案：

**方法1：在项目里创建Token（推荐）**
1. 访问 https://vercel.com/dashboard
2. 随便进入一个项目（或创建新项目）
3. Settings → Tokens
4. 创建Token，选择 "Full Access"

**方法2：用Team Token**
1. 访问 https://vercel.com/teams/your-team/settings/tokens
2. 创建Team级别的Token

**方法3：直接用CLI登录（最简单）**
```bash
# 在你的电脑运行
npx vercel login
# 浏览器会弹出授权
# 登录成功后，Token保存在 ~/.vercel/auth.json
```

---

## 🚨 如果以上都不行

**直接给我账号临时权限：**
1. 改一个临时密码
2. 给我账号密码
3. 我登录配置
4. 你改回密码

**或者：**
**你直接手动部署第一个项目，发给我Project ID**
