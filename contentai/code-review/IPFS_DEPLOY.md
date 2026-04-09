# 🌐 IPFS 部署指南

## 当前部署

**最新版本CID**: `QmbmhhyfSGQDg5pA88FUtc6mqfokkixiRTqfBKuKiri5KD`

**访问链接**:
- https://ipfs.io/ipfs/QmbmhhyfSGQDg5pA88FUtc6mqfokkixiRTqfBKuKiri5KD
- https://gateway.pinata.cloud/ipfs/QmbmhhyfSGQDg5pA88FUtc6mqfokkixiRTqfBKuKiri5KD
- https://dweb.link/ipfs/QmbmhhyfSGQDg5pA88FUtc6mqfokkixiRTqfBKuKiri5KD

**旧版本CID**: `QmYfzYYwhR9UikooyxyMmLECnHBFx6c5wAeayUkneQ6STC`

---

## 什么是IPFS？

IPFS（InterPlanetary File System）是一个点对点的分布式文件系统，具有：
- ✅ 去中心化存储，抗审查
- ✅ 内容寻址，永久保存
- ✅ 全球CDN加速
- ✅ 完全免费

## 🚀 快速部署到IPFS

### 方式一：Pinata（推荐，最简单）

#### 步骤1：注册Pinata账户
1. 访问 https://www.pinata.cloud/
2. 点击 "Sign Up" 注册免费账户
3. 完成邮箱验证

#### 步骤2：获取API Key
1. 登录后点击右上角头像 → "Account Settings"
2. 选择 "API Keys" 标签
3. 点击 "New Key"
4. 选择 "Admin" 权限
5. 复制生成的JWT Token

#### 步骤3：部署
```bash
# 使用Pinata Web界面
1. 登录 https://app.pinata.cloud/pinmanager
2. 点击 "Upload" → "File"
3. 选择 index.html
4. 点击 "Upload"
5. 复制CID (类似: QmXxXxXxXx...)
```

或者使用命令行：
```bash
# 安装Pinata CLI
npm install -g pinata-upload-cli

# 配置JWT
pinata-cli --jwt YOUR_JWT_TOKEN

# 上传
cd /root/.openclaw/workspace/contentai/code-review
pinata-cli index.html
```

#### 步骤4：访问
```
https://gateway.pinata.cloud/ipfs/{YOUR_CID}
https://ipfs.io/ipfs/{YOUR_CID}
https://dweb.link/ipfs/{YOUR_CID}
```

---

### 方式二：Web3.Storage（免费10GB）

#### 步骤1：注册
1. 访问 https://web3.storage/
2. 使用GitHub登录
3. 创建新Space

#### 步骤2：获取API Token
1. 进入 "Account" → "Create API Token"
2. 复制Token

#### 步骤3：部署
```bash
# 安装CLI
npm install -g @web3-storage/w3cli

# 登录
w3 login

# 上传
cd /root/.openclaw/workspace/contentai/code-review
w3 put index.html
```

---

### 方式三：IPFS Desktop（本地节点）

#### 步骤1：安装
```bash
# macOS
brew install --cask ipfs

# Windows
# 下载: https://github.com/ipfs/ipfs-desktop/releases

# Linux
wget https://github.com/ipfs/ipfs-desktop/releases/latest/download/ipfs-desktop-linux-amd64.deb
sudo dpkg -i ipfs-desktop-linux-amd64.deb
```

#### 步骤2：上传
1. 打开IPFS Desktop
2. 点击 "Files" 标签
3. 点击 "Import" → "File"
4. 选择 index.html
5. 右键点击文件 → "Share link"
6. 复制CID

---

### 方式四：Fleek.co（自动化部署）

#### 步骤1：注册Fleek
1. 访问 https://fleek.co/
2. 使用GitHub登录

#### 步骤2：创建项目
1. 点击 "Add new site"
2. 选择 "Upload folder"
3. 上传包含index.html的文件夹
4. 自动获得IPFS链接和自定义域名

---

## 📋 部署对比

| 平台 | 免费额度 | 易用性 | 速度 | 额外功能 |
|------|---------|--------|------|----------|
| Pinata | 1GB/月 | ⭐⭐⭐⭐⭐ | 快 | 自定义网关 |
| Web3.Storage | 10GB/月 | ⭐⭐⭐⭐ | 中等 | Filecoin备份 |
| IPFS Desktop | 无限制 | ⭐⭐⭐ | 依赖节点 | 完全控制 |
| Fleek | 3GB/月 | ⭐⭐⭐⭐⭐ | 快 | CI/CD集成 |

## 🔗 推荐方案

### 个人使用
- **快速体验**: Pinata Web上传（1分钟完成）
- **长期使用**: Web3.Storage（额度更大）

### 团队协作
- **自动化**: Fleek + GitHub（自动部署）
- **自定义**: IPFS Desktop + 自定义网关

## 🌍 自定义域名（可选）

### Cloudflare IPFS网关 + 自定义域名

1. 注册Cloudflare账户
2. 添加你的域名
3. 创建CNAME记录：
   ```
   code-review.yourdomain.com → cloudflare-ipfs.com
   ```
4. 在DNS记录中添加：
   ```
   _dnslink.code-review.yourdomain.com TXT "dnslink=/ipfs/{YOUR_CID}"
   ```

## 💡 小贴士

1. **CID不可变**: 文件内容改变，CID也会改变
2. **更新网站**: 重新上传获取新CID，或保留旧CID作为历史版本
3. **加速访问**: 使用Cloudflare IPFS网关更快
4. **备份CID**: 记下你的CID，这是访问网站的唯一标识

## 🆘 常见问题

**Q: 文件上传到IPFS后会丢失吗？**
A: 只要有一个节点保存了该文件，内容就不会丢失。使用Pinata等 pinning 服务可确保文件长期可用。

**Q: IPFS链接在国内能访问吗？**
A: 可以，但可能需要使用VPN或选择国内友好的网关。

**Q: 如何更新已部署的网站？**
A: 重新上传文件获得新CID，然后更新引用。或使用IPNS发布可变地址。

**Q: 免费额度用完怎么办？**
A: 可以创建多个账户，或升级到付费计划，或使用多个平台分散存储。
