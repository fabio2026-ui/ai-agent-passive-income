# Chrome Web Store API 自动化配置指南
# 完成这3步后，所有扩展自动上传

## Step 1: 创建Google Cloud项目

1. 访问: https://console.cloud.google.com/projectcreate
2. 项目名称: `ai-empire-extensions`
3. 点击 "创建"

## Step 2: 启用Chrome Web Store API

1. 访问: https://console.cloud.google.com/apis/library?project=ai-empire-extensions
2. 搜索: "Chrome Web Store API"
3. 点击 "启用"

## Step 3: 创建OAuth凭证

1. 访问: https://console.cloud.google.com/apis/credentials
2. 点击 "创建凭证" → "OAuth 客户端 ID"
3. 应用类型: "桌面应用"
4. 名称: "AI Empire Uploader"
5. 点击 "创建"
6. **复制 Client ID 和 Client Secret**

## Step 4: 获取Refresh Token

运行以下命令（终端里）：

```bash
# 安装依赖
npm install -g chrome-webstore-upload-cli

# 登录获取token
npx chrome-webstore-upload login \
  --client-id "你的Client_ID" \
  --client-secret "你的Client_Secret"
```

会弹出浏览器让你登录Google账号，授权后得到 **Refresh Token**。

## Step 5: 给我密钥

把这三个值发给我：
- Client ID
- Client Secret  
- Refresh Token

我会配置自动上传脚本，以后扩展自动部署！
