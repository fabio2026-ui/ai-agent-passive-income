# ReplyAI - 智能客服邮件助手

🚀 **零成本运营，用户自带API Key的Chrome Extension**

## 产品概述

ReplyAI是一款智能客服邮件助手Chrome扩展，帮助用户一键生成专业、个性化的邮件回复。

### 核心特性

- ✅ **一键生成回复** - 基于邮件内容智能生成专业回复
- ✅ **学习用户风格** - 支持多种回复风格（专业/友好/简洁/自定义）
- ✅ **Gmail/Outlook** - 完美支持主流邮件平台
- ✅ **零成本运营** - 用户自带OpenAI API Key
- ✅ **数据本地存储** - 所有数据保存在浏览器本地

## 技术栈

- Chrome Extension (Manifest V3)
- HTML/CSS/JavaScript 纯前端
- OpenAI API (GPT-4o Mini)
- IPFS 部署

## 目录结构

```
replyai/
├── manifest.json          # 扩展配置
├── popup.html/js/css      # 弹出界面
├── content.js             # 内容脚本（读取邮件）
├── background.js          # 后台脚本
├── options.html/js        # 设置页面
├── icons/                 # 图标文件
├── deploy.sh              # IPFS部署脚本
└── README.md              # 本文件
```

## 安装方法

### 方式1: 开发者模式安装（推荐）

1. 下载扩展ZIP包
2. 解压到任意文件夹
3. 打开Chrome，访问 `chrome://extensions/`
4. 开启"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择解压后的文件夹

### 方式2: IPFS直接安装

1. 访问IPFS网关链接下载ZIP
2. 按方式1的步骤安装

## 使用指南

### 首次配置

1. 点击浏览器工具栏的ReplyAI图标
2. 输入您的OpenAI API Key
3. 选择默认回复风格
4. 点击保存

### 生成邮件回复

1. 打开Gmail或Outlook，进入具体邮件
2. 点击ReplyAI扩展图标
3. 点击"📥 读取当前邮件"
4. 选择回复风格
5. 点击"✨ 生成智能回复"
6. 点击"📤 插入到邮件"或"📋 复制"

### 快捷模板

支持快速生成以下类型的邮件：
- 🙏 感谢邮件
- ✅ 确认邮件
- 😔 道歉邮件
- 🔄 跟进邮件
- ❌ 拒绝邮件

## 获取OpenAI API Key

1. 访问 https://platform.openai.com/api-keys
2. 注册/登录OpenAI账号
3. 点击 "Create new secret key"
4. 复制以 `sk-` 开头的密钥

### 费用说明

- ReplyAI本身是**免费工具**
- OpenAI API按使用量计费
- GPT-4o Mini: ~$0.00015/1K tokens
- 一封普通邮件: ~$0.001-0.003

## 部署到IPFS

```bash
# 安装IPFS
# https://docs.ipfs.io/install/

# 运行部署脚本
./deploy.sh
```

脚本会自动：
1. 打包扩展文件
2. 上传到IPFS
3. 生成安装指南
4. 输出访问链接

## 开发计划

### v1.0 (当前)
- [x] Chrome Extension基础框架
- [x] Gmail/Outlook邮件读取
- [x] OpenAI API集成
- [x] 多种回复风格
- [x] IPFS部署

### v1.1 (规划中)
- [ ] 学习用户历史回复风格
- [ ] 自定义快捷回复模板
- [ ] 多语言支持
- [ ] 回复历史记录

### v1.2 (规划中)
- [ ] 企业版团队管理
- [ ] 回复效果分析
- [ ] 智能推荐最佳回复时间

## 隐私说明

- ✅ API Key仅存储在浏览器本地
- ✅ 邮件内容不上传到任何第三方服务器
- ✅ 直接调用OpenAI API，不经过中间服务器
- ✅ 可随时清除所有本地数据

## 许可证

MIT License

## 联系反馈

如有问题或建议，欢迎反馈！

---

**ReplyAI** - 让邮件回复更智能、更高效 ✨
