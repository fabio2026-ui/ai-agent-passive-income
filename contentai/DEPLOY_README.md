# ContentAI 部署包
**生成时间**: 2026-04-02 23:00 CST

## 部署方式

### 方式1: Vercel CLI (推荐)
```bash
cd /root/.openclaw/workspace/contentai/src
npx vercel login
npx vercel --prod
```

### 方式2: 手动上传
1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库或拖拽上传
3. 选择项目目录

### 方式3: 静态文件部署
已生成 `contentai-dist.tar.gz` 静态文件包
- 大小: 约 2MB
- 包含: HTML, CSS, JS, API路由

## 环境变量配置
部署后需在Vercel Dashboard设置:
- `KIMI_API_KEY` - Kimi API密钥
- `NEXTAUTH_SECRET` - 随机字符串
- `NEXTAUTH_URL` - 部署后的域名

## 构建输出
- ✅ 首页 /
- ✅ 生成页 /generate
- ✅ API /api/content/generate

---
**状态**: 构建完成，待部署
