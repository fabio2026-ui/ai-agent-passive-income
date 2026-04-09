# ContentAI GitHub Actions 配置指南
**目标**: 配置自动发布到Dev.to/Hashnode/Medium/Twitter
**时间**: 约10分钟
**安全**: 你独自操作，我全程看不到你的API Key

---

## 第一步：获取API Keys (5分钟)

### 1.1 Dev.to API Key

```
1. 浏览器访问: https://dev.to/settings/extensions
2. 找到 "DEV Community API Keys" 部分
3. 点击 "Generate API Key"
4. 复制生成的key (格式: 一串字母数字)
5. 临时保存在一个安全的地方 (不要截图发给我！)
```

### 1.2 Hashnode API Token

```
1. 浏览器访问: https://hashnode.com/settings/developer
2. 点击 "Create a new Personal Access Token"
3. Token name: "ContentAI Auto Publish"
4. 权限勾选: publish_post, update_post, delete_post
5. 点击生成
6. 复制token (格式: 很长一串)
7. 临时保存
```

### 1.3 Hashnode Publication ID

```
1. 访问你的Hashnode博客 (如: yourname.hashnode.dev)
2. 或者使用API查询:
   curl -X POST https://gql.hashnode.com \
     -H "Content-Type: application/json" \
     -d '{"query":"{ publication(host:\"yourname.hashnode.dev\") { id } }"}'
3. 复制返回的id字段
4. 临时保存
```

---

## 第二步：配置GitHub Secrets (3分钟)

### 2.1 打开Secrets设置

```
1. 访问GitHub: https://github.com/yourusername/contentai
2. 点击顶部菜单: Settings
3. 左侧菜单: Secrets and variables → Actions
4. 点击绿色按钮: New repository secret
```

### 2.2 添加第一个Secret (DEVTO_API_KEY)

```
Name: DEVTO_API_KEY
Secret: [粘贴你从dev.to复制的API Key]
点击: Add secret
```

### 2.3 添加第二个Secret (HASHNODE_PAT)

```
Name: HASHNODE_PAT
Secret: [粘贴你的Hashnode Token]
点击: Add secret
```

### 2.4 添加第三个Secret (HASHNODE_PUBLICATION_ID)

```
Name: HASHNODE_PUBLICATION_ID
Secret: [粘贴你的Publication ID]
点击: Add secret
```

### 2.5 验证

```
设置页面应该显示3个Secrets:
- DEVTO_API_KEY
- HASHNODE_PAT
- HASHNODE_PUBLICATION_ID

注意: Secret值显示为 *** 是正常，安全！
```

---

## 第三步：测试发布 (2分钟)

### 3.1 编辑文章

```
1. 访问GitHub仓库: contentai
2. 进入目录: content/
3. 点击: post.md
4. 点击铅笔图标编辑
5. 修改内容 (随意改几个字)
6. 底部填写: Commit changes
   - 标题: "测试自动发布"
   - 描述: "测试GitHub Actions"
   - 选择: Commit directly to main
   - 点击: Commit changes
```

### 3.2 查看Actions运行

```
1. 回到仓库首页
2. 点击顶部: Actions 标签
3. 看到 workflow "Cross-Post Content" 正在运行 (黄色)
4. 等待1-2分钟
5. 变成绿色 ✅ 表示成功
```

### 3.3 验证发布

```
1. 访问你的Dev.to: https://dev.to/yourname
2. 应该看到新发布的文章
3. 访问你的Hashnode: yourname.hashnode.dev
4. 也应该看到文章
```

---

## 常见问题

### Q1: Actions运行失败 (红色)
```
检查:
- Secrets是否拼写正确 (大小写敏感)
- API Key是否有效 (去dev.to/hashnode重新生成)
- 查看错误日志: Actions → 失败的workflow → 点击看日志
```

### Q2: 只想发布到其中一个平台
```
编辑 .github/workflows/cross-post.yml
注释掉不想发布的步骤:
# - name: Publish to Dev.to
#   run: ...
```

### Q3: 不想用了怎么删除
```
Settings → Secrets and variables → Actions
找到Secret → 点击Delete
```

---

## 安全提醒

✅ **正确的做法**:
- API Key只在GitHub Secrets中使用
- 不要在代码里写死API Key
- 不要把Key发给任何人 (包括我！)
- 定期检查API Key使用记录

❌ **危险的做法**:
- 把Key发给我
- 把Key写在代码里提交
- 截图包含Key的页面分享

---

## 完成后的便利

配置完成后，以后发布文章只需：
```
1. 编辑 content/post.md
2. Commit & Push
3. 自动发布到所有平台！
```

**预计每年节省手动发布的时间: 50+小时**

---

**遇到问题随时问我！但记住：不要给我看你的API Key！**
