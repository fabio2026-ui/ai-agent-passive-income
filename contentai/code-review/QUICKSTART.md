# 🚀 快速入门（5分钟部署）

## 方式一：GitHub Pages（最简单，推荐新手）

### 步骤1：创建GitHub仓库
```bash
# 在GitHub创建新仓库，名为 code-review
```

### 步骤2：推送代码
```bash
cd /root/.openclaw/workspace/contentai/code-review

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/code-review.git
git push -u origin main
```

### 步骤3：启用GitHub Pages
1. 访问 `https://github.com/YOUR_USERNAME/code-review/settings/pages`
2. Source选择 "Deploy from a branch"
3. Branch选择 "main", folder选择 "/ (root)"
4. 点击Save
5. 等待1-2分钟

### 步骤4：访问
```
https://YOUR_USERNAME.github.io/code-review/
```

---

## 方式二：IPFS去中心化部署（完全免费）

### 步骤1：注册Pinata
```bash
访问 https://www.pinata.cloud/
注册免费账户
```

### 步骤2：获取API Key
```
登录 → Account Settings → API Keys → New Key
选择Admin权限，复制JWT Token
```

### 步骤3：上传文件
```bash
# 安装CLI
npm install -g pinata-upload-cli

# 配置
pinata-cli --jwt YOUR_JWT_TOKEN

# 上传
cd /root/.openclaw/workspace/contentai/code-review
pinata-cli index.html
```

### 步骤4：获取链接
```
上传后会显示CID，例如: QmXxXxXx...
访问: https://gateway.pinata.cloud/ipfs/QmXxXxXx...
```

---

## 方式三：Netlify Drop（拖拽即可）

### 步骤1：访问Netlify
```
打开 https://app.netlify.com/drop
```

### 步骤2：上传
```
将index.html拖拽到页面
自动生成随机域名
```

### 步骤3：完成
```
立即获得访问链接，如:
https://ab12cd34.netlify.app
```

---

## ⚡ 最快速部署（60秒）

使用脚本自动部署：

```bash
cd /root/.openclaw/workspace/contentai/code-review
make deploy-netlify
# 或
bash deploy.sh
```

---

## 🎯 使用流程

1. **打开部署的网站**
2. **获取API Key**: https://platform.moonshot.cn/
3. **输入GitHub仓库URL**
4. **点击"开始代码审查"**
5. **等待6个Agent完成分析**
6. **查看综合报告**

---

## 💰 成本

| 项目 | 成本 |
|------|------|
| 部署平台 | 免费 |
| Moonshot API | 新用户15元免费额度 |
| GitHub API | 免费（5000请求/小时）|
| **总计** | **完全免费** |

---

## 🆘 常见问题

### 部署后页面空白？
- 检查浏览器控制台错误
- 确认index.html文件完整

### API Key无效？
- 确认以`sk-`开头
- 检查是否已激活

### 私有仓库无法访问？
- 需要添加GitHub Token
- Token需要有`repo`权限

### 审查失败？
- 检查网络连接
- 确认仓库存在且可访问
- 代码文件数量不超过10个（默认）

---

## 📚 更多文档

- [详细部署指南](README.md)
- [IPFS部署指南](IPFS_DEPLOY.md)
- [使用指南](USER_GUIDE.md)

---

## 🎉 完成！

你的多Agent代码审查服务已经部署完成。
现在可以：
- 🔗 分享给团队成员
- 🔗 添加到书签
- 🔗 嵌入到文档中

完全免费，永久运行！
