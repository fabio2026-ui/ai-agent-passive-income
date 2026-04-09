# ContentAI 跨平台自动发布系统

## 功能概述

本系统实现了一键发布内容到多个平台的功能：
- **Dev.to** - 使用官方API自动发布
- **Hashnode** - 使用GraphQL API自动发布
- **Medium** - 使用官方API自动发布（支持Import备选方案）
- **Twitter/X** - 生成推文文本（支持API自动发布或手动复制）

## 工作原理

参考 Crier 工具的设计理念：
1. **单一数据源** - `content/post.md` 是内容唯一来源
2. **Front Matter 解析** - 自动提取标题、标签、描述等元数据
3. **发布状态追踪** - `.github/publish-status.json` 记录已发布内容
4. **防重复发布** - 自动检测已发布内容，避免重复
5. **规范URL支持** - 支持 canonical_url 设置，避免SEO重复内容惩罚

## 快速开始

### 1. 创建内容文件

编辑 `content/post.md`：

```markdown
---
title: "我的文章标题"
description: "文章简短描述，用于社交分享"
tags: ["技术", "AI", "教程"]
canonical_url: "https://yourblog.com/posts/my-article"
cover_image: "https://yourblog.com/images/cover.jpg"
---

# 文章正文

这里是文章内容，支持完整的 Markdown 语法。

## 二级标题

- 列表项1
- 列表项2

> 引用块

代码块：
```javascript
console.log('Hello World');
```
```

### 2. 配置API密钥

在 GitHub 仓库设置中添加以下 Secrets：

#### Dev.to
- `DEVTO_API_KEY` - 在 https://dev.to/settings/extensions 生成

#### Hashnode
- `HASHNODE_PAT` - 在 https://hashnode.com/settings/developer 生成
- `HASHNODE_PUBLICATION_ID` - 你的 Hashnode Publication ID

#### Medium
- `MEDIUM_API_KEY` - 在 https://medium.com/me/settings/security 生成 Integration Token
- `MEDIUM_AUTHOR_ID` - 你的 Medium User ID（可通过 API 获取）

#### Twitter/X (可选)
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_SECRET`

> ⚠️ **注意**: Twitter/X API v2 需要 Elevated Access 才能发布推文。未配置时会生成推文文本供手动复制。

### 3. 触发发布

#### 自动触发
当有内容推送到 `main` 分支且 `content/post.md` 文件变更时，workflow 会自动触发。

```bash
git add content/post.md
git commit -m "发布新文章: 我的文章标题"
git push origin main
```

#### 手动触发
在 GitHub Actions 页面选择 "Cross-Platform Post Publisher" workflow，点击 "Run workflow"。

可选参数：
- **Force publish** - 强制重新发布，即使已经发布过

## 发布状态

发布完成后，系统会自动更新 `.github/publish-status.json`：

```json
{
  "my-article-title": {
    "title": "我的文章标题",
    "firstPublishedAt": "2024-01-15T08:30:00Z",
    "lastUpdatedAt": "2024-01-15T08:35:00Z",
    "platforms": {
      "devto": {
        "id": "1234567",
        "url": "https://dev.to/username/my-article-title",
        "publishedAt": "2024-01-15T08:30:00Z"
      },
      "hashnode": {
        "id": "abc123",
        "url": "https://username.hashnode.dev/my-article-title",
        "publishedAt": "2024-01-15T08:32:00Z"
      }
    }
  }
}
```

## 各平台注意事项

### Dev.to
- ✅ 支持 canonical URL
- ✅ 最多4个标签
- ✅ 自动发布为公开文章

### Hashnode
- ✅ 支持 canonical URL
- ✅ 支持封面图片
- ✅ 最多5个标签

### Medium
- ⚠️ API 可能有频率限制
- ✅ 支持 canonical URL
- ✅ 最多5个标签
- 🔧 如果 API 失败，建议使用 Medium Import 工具手动导入

### Twitter/X
- ⚠️ 需要 Elevated Access 才能自动发布
- ✅ 自动生成推文文本（含标题、描述、标签、链接）
- ✅ 字数限制自动处理（280字符）

## 故障排除

### Workflow 失败

1. 检查 GitHub Actions 日志获取详细错误信息
2. 确认所有 Secrets 已正确配置
3. 验证 post.md 文件包含有效的 front matter

### Medium 发布失败

Medium API 较为严格，建议：
1. 检查 API Token 权限
2. 使用手动 Import 作为备选
3. 在 https://medium.com/p/import 粘贴原文链接

### Twitter 发布失败

1. 确认应用有 Write 权限
2. 申请 Elevated Access
3. 或使用生成的推文文本手动发布

## 自定义配置

### 修改触发路径

编辑 `.github/workflows/cross-post.yml`：

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'content/post.md'      # 默认
      - 'content/blog/**'      # 支持多文件
```

### 添加更多平台

可以参考现有脚本，添加新的发布脚本到 `.github/scripts/` 目录。

## 安全注意事项

- 所有 API 密钥存储在 GitHub Secrets 中，不会泄露到日志
- 发布状态文件包含公开URL，可以放心提交到仓库
- 建议定期轮换 API 密钥

## 参考

- [Crier](https://github.com/queelius/crier) - 跨平台内容发布CLI工具
- [Dev.to API Docs](https://docs.forem.com/api/)
- [Hashnode API Docs](https://api.hashnode.com/)
- [Medium API Docs](https://github.com/Medium/medium-api-docs)
