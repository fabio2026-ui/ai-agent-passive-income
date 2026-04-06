# GitHub部署指南

## 快速部署 (推荐)

### 方法1: 使用GitHub CLI (需要Token)

```bash
cd /root/.openclaw/workspace/ai-agent-projects

# 方式A: 交互式登录
gh auth login

# 方式B: Token登录 (如果你已有Token)
export GH_TOKEN='ghp_你的Token'
echo $GH_TOKEN | gh auth login --with-token

# 运行部署脚本
./deploy-to-github.sh
```

### 方法2: 手动部署

```bash
# 1. 在GitHub创建新仓库 (例如: ai-agent-passive-income)
# 访问: https://github.com/new

# 2. 添加remote
git remote add origin https://github.com/你的用户名/ai-agent-passive-income.git

# 3. 推送代码
git push -u origin master

# 4. 启用GitHub Pages
# 访问仓库 → Settings → Pages → Source: master branch
```

## 当前代码状态

```
分支: master
提交数: 4
最新提交: 4950a77 - Auto: Generated remaining 4 articles

文件统计:
- 8篇SEO文章 (content/)
- 4个自动化脚本
- 5条Twitter帖子
- 3套Reddit模板
- 完整支付系统集成
```

## 部署后配置

### 1. 启用GitHub Pages
- 仓库 → Settings → Pages
- Source: Deploy from a branch
- Branch: master / (root)
- Save

### 2. 设置Secrets (可选)
如果需要GitHub Actions自动化:
- Settings → Secrets and variables → Actions
- 添加: `CLOUDFLARE_API_TOKEN`
- 添加: `STRIPE_SECRET_KEY`

### 3. 验证部署
访问: `https://你的用户名.github.io/ai-agent-passive-income`

## 替代部署方案

### Cloudflare Pages (Token权限受限)
当前Token缺少Pages权限，需要:
1. 访问 Cloudflare Dashboard
2. My Profile → API Tokens
3. 创建新Token，添加Zone:Read, Page:Edit权限
4. 或使用直接上传

### Vercel
```bash
npm i -g vercel
vercel --prod
```

## 当前阻塞

| 平台 | 状态 | 原因 |
|------|------|------|
| GitHub | ⏳ 等待Token | 需要 `ghp_xxx` Token |
| Cloudflare Pages | ⏳ 权限不足 | Token缺少Pages:Edit |
| Cloudflare Workers | ❌ 权限不足 | Token缺少Workers:Edit |

## 建议

1. **最快路径**: 提供GitHub Token，自动部署
2. **手动路径**: 创建仓库 → 添加remote → 推送
3. **替代方案**: 使用Vercel (npm i -g vercel)

---
*生成时间: 2026-04-07*
