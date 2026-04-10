# Obsidian Skill 使用指南

## 安装状态
✅ **Obsidian Skill** 已安装到 `/skills/obsidian/`

## 功能特性
- 📁 管理 Obsidian vaults (Markdown 笔记)
- 🔍 搜索笔记内容
- 📝 创建、移动、删除笔记
- 🔗 自动更新 wikilinks

## 我的 Vault 结构

### 📍 Vault 位置
```
/root/.openclaw/workspace/obsidian-vault/
├── 🔐 Credentials/
│   └── Master-Credentials.md
├── 🚀 Deployments/
│   └── Deployment-Registry.md
├── 📁 Projects/
│   └── Project-Index.md
├── 🌐 APIs/
│   └── API-Directory.md
├── ⚙️ Configs/
│   └── Configuration-Templates.md
├── 📝 Daily-Notes/
│   └── 2026-04-10.md
└── 🧠 Memory-Quick-Reference.md
```

## 常用命令

### 设置默认 Vault
```bash
obsidian-cli set-default "openclaw-workspace"
```

### 搜索笔记
```bash
# 按标题搜索
obsidian-cli search "container security"

# 按内容搜索
obsidian-cli search-content "cloudflare"
```

### 创建笔记
```bash
obsidian-cli create "Projects/New-Idea" --content "# New Idea\n\n..."
```

### 查看 Vault 路径
```bash
obsidian-cli print-default --path-only
```

## 快速链接

| 内容 | 文件路径 |
|------|----------|
| 🔐 所有凭证 | `obsidian-vault/Credentials/Master-Credentials.md` |
| 🚀 部署状态 | `obsidian-vault/Deployments/Deployment-Registry.md` |
| 📁 项目索引 | `obsidian-vault/Projects/Project-Index.md` |
| 🌐 API 文档 | `obsidian-vault/APIs/API-Directory.md` |
| 🧠 快速参考 | `obsidian-vault/Memory-Quick-Reference.md` |

---
**安装时间：** 2026-04-10 02:21 GMT+8
