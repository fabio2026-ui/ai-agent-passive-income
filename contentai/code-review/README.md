# ContentAI 多Agent代码审查服务

## 🚀 项目简介

纯前端实现的多Agent代码审查系统，完全免费、零成本运行，支持IPFS去中心化部署。

## ✨ 特性

- 🤖 **6个专业AI Agent**：架构师、安全专家、性能专家、质量专家、Bug猎手、报告生成
- 🔒 **完全前端化**：所有API调用在浏览器本地完成，代码和密钥不上传到任何服务器
- 📦 **零成本部署**：支持IPFS、GitHub Pages、Cloudflare Pages等免费平台
- 🌐 **GitHub集成**：支持公开和私有仓库审查
- 📊 **综合评分**：多维度评分和详细报告

## 🛠️ 技术栈

- 纯HTML/CSS/JavaScript，无需构建
- GitHub API (原生Fetch)
- Moonshot AI API (Kimi大模型)
- IPFS去中心化存储

## 📁 文件结构

```
code-review/
├── index.html      # 主应用文件（单文件部署）
└── README.md       # 说明文档
```

## 🚀 部署方式

### 方式一：IPFS部署（推荐）

#### 1. 使用Pinata免费版
```bash
# 1. 注册Pinata免费账户: https://app.pinata.cloud/
# 2. 上传index.html到Pinata
# 3. 获取IPFS CID
# 4. 通过IPFS网关访问: https://gateway.pinata.cloud/ipfs/{CID}
```

#### 2. 使用Web3.Storage
```bash
# 1. 注册: https://web3.storage/
# 2. 上传index.html
# 3. 获取IPFS链接
```

#### 3. 使用IPFS Desktop
```bash
# 1. 安装IPFS Desktop: https://docs.ipfs.tech/install/ipfs-desktop/
# 2. 打开IPFS Desktop
# 3. 拖拽index.html到窗口
# 4. 点击"Share link"获取CID
```

### 方式二：GitHub Pages（最简单）

```bash
# 1. Fork本仓库或创建新仓库
# 2. 上传index.html
# 3. 进入Settings -> Pages
# 4. Source选择main分支
# 5. 访问: https://{username}.github.io/{repo-name}/
```

### 方式三：Cloudflare Pages

```bash
# 1. 登录 https://dash.cloudflare.com/
# 2. 进入Pages -> Create a project
# 3. 上传index.html
# 4. 获取部署链接
```

### 方式四：Netlify Drop

```bash
# 1. 访问 https://app.netlify.com/drop
# 2. 拖拽index.html到页面
# 3. 立即获得访问链接
```

### 方式五：Surge.sh

```bash
# 1. 安装Surge CLI
npm install -g surge

# 2. 进入项目目录
cd code-review

# 3. 部署
surge

# 4. 获得免费*.surge.sh域名
```

## 🔧 使用说明

### 获取API Key

1. **Moonshot API Key**：访问 https://platform.moonshot.cn/ 免费注册
2. **GitHub Token**（可选）：访问 https://github.com/settings/tokens 生成

### 使用步骤

1. 打开部署后的页面
2. 输入GitHub仓库URL
3. 输入API Key（首次使用后自动保存到浏览器本地）
4. 可选：输入GitHub Token（用于私有仓库）
5. 可选：指定代码路径和分支
6. 点击"开始代码审查"
7. 等待6个Agent完成审查
8. 查看综合报告和各维度分析

## 🎭 Agent说明

| Agent | 职责 |
|-------|------|
| 🏗️ 架构师 | 分析代码结构、设计模式、架构合理性 |
| 🔒 安全专家 | 检测安全漏洞、注入风险、敏感信息泄露 |
| ⚡ 性能专家 | 分析性能瓶颈、资源泄漏、算法效率 |
| ✨ 质量专家 | 检查代码规范、可读性、可维护性 |
| 🐛 Bug猎手 | 发现潜在Bug、逻辑错误、边界情况 |
| 📝 报告生成 | 汇总所有结果，生成综合报告 |

## 🔒 安全说明

- ✅ API Key仅保存在浏览器本地(localStorage)
- ✅ 所有API调用直接从浏览器发送到官方API
- ✅ 代码和密钥不会上传到任何第三方服务器
- ✅ 支持使用只读GitHub Token

## 📊 输出示例

```json
{
  "overallScore": 85,
  "executiveSummary": "代码整体质量良好，架构清晰，但存在部分性能优化空间",
  "topIssues": [
    {
      "priority": 1,
      "category": "性能",
      "description": "数据库查询未使用索引",
      "action": "为user_id字段添加索引"
    }
  ],
  "actionItems": [
    "优化数据库查询",
    "添加错误处理",
    "补充单元测试"
  ]
}
```

## 💰 成本分析

| 项目 | 成本 |
|------|------|
| IPFS存储 | 免费（Pinata/Web3.Storage免费版） |
| GitHub Pages | 免费 |
| Cloudflare Pages | 免费 |
| Moonshot API | 免费额度（新用户15元） |
| 域名 | 免费子域名 |

**总计：完全免费**

## 🔗 相关链接

- [Moonshot AI](https://platform.moonshot.cn/)
- [IPFS](https://ipfs.tech/)
- [Pinata](https://www.pinata.cloud/)

## 📄 许可证

MIT License
