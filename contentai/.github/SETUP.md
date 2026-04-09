# ContentAI 自动发布配置

## GitHub Secrets 配置

在仓库 Settings > Secrets and variables > Actions 中添加以下 secrets：

```bash
# Dev.to
DEVTO_API_KEY=your_devto_api_key_here

# Hashnode
HASHNODE_PAT=your_hashnode_personal_access_token
HASHNODE_PUBLICATION_ID=your_publication_id

# Medium
MEDIUM_API_KEY=your_medium_integration_token
MEDIUM_AUTHOR_ID=your_medium_user_id

# Twitter/X (可选)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
```

## 如何获取 API 密钥

### Dev.to API Key
1. 访问 https://dev.to/settings/extensions
2. 点击 "Generate API Key"
3. 复制生成的 key

### Hashnode PAT
1. 访问 https://hashnode.com/settings/developer
2. 点击 "Create new token"
3. 选择 scopes: `write:post`, `read:post`
4. 复制 token

### Hashnode Publication ID
运行以下命令获取你的 Publication ID：

```bash
curl -X POST https://gql.hashnode.com \
  -H "Authorization: YOUR_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetPublications { me { publications(first: 10) { edges { node { id title } } } } }"
  }'
```

### Medium Integration Token
1. 访问 https://medium.com/me/settings/security
2. 找到 "Integration Tokens"
3. 点击 "Get token"

### Medium Author ID
```bash
curl -H "Authorization: Bearer YOUR_MEDIUM_API_KEY" \
  https://api.medium.com/v1/me
```

### Twitter/X API 凭证
1. 访问 https://developer.twitter.com
2. 创建应用或选择现有应用
3. 在 Keys and Tokens 中获取凭证
4. 申请 Elevated Access（如需要发布推文）

## 内容文件模板

创建 `content/post.md`：

```markdown
---
title: "文章标题"
description: "文章描述，显示在搜索结果和社交分享中"
tags: ["标签1", "标签2", "标签3"]
canonical_url: "https://yourblog.com/article-slug"
cover_image: "https://yourblog.com/cover.jpg"  # 可选
---

# 文章标题

正文内容...

## 小标题

- 要点1
- 要点2

> 引用

代码：
```python
print("Hello World")
```
```

## Front Matter 字段说明

| 字段 | 必需 | 说明 |
|------|------|------|
| title | ✅ | 文章标题 |
| description | ❌ | 文章描述（用于社交分享） |
| tags | ❌ | 标签数组，最多5个 |
| canonical_url | ❌ | 原文链接（SEO用） |
| cover_image | ❌ | 封面图URL（Hashnode支持） |
