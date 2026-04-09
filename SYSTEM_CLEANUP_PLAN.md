# 📁 AI商业帝国系统整理方案
# 生成时间: 2026-03-14 18:30

========================================
🔍 当前系统状态
========================================

## 主目录结构

```
~/
├── ai-empire/          (431M) - ✅ 主系统，保留
│   ├── assets/         - 视频素材
│   ├── backup/         - 自动备份
│   ├── content/        - 内容生产
│   ├── docs/           - 文档
│   ├── launch/         - Fiverr上线文件
│   ├── logs/           - 运行日志
│   ├── projects/       - 项目文件
│   ├── prompts/        - AI提示词
│   ├── scripts/        - 自动化脚本
│   ├── system/         - 系统追踪
│   └── templates/      - 模板文件
│
└── project-matrix/     (120K) - ✅ 保留
```

## workspace目录 (需要整理)

位置: `~/.openclaw/workspace/`

**问题：**
- 50+ 文件混乱堆放
- 多个版本重复 (V2/V3)
- 临时文件未清理
- 缺少分类组织

**发现的问题文件:**
- AI_AGENT_PRO_v3.sh - 旧部署脚本
- ai_agent_pro_deploy.sh - 重复
- ai_quality_system_v2.py - 旧版本
- ai_server_secure.py - 可能已废弃
- 多个备份文件在extensions-backups/

## 空间占用

| 目录 | 大小 | 状态 |
|------|------|------|
| ai-empire | 431M | ✅ 正常 |
| project-matrix | 120K | ✅ 正常 |
| workspace | ~50M | ⚠️ 需整理 |
| extensions-backups | ~200M | ⚠️ 可清理 |

========================================
🧹 整理方案
========================================

## Phase 1: 清理旧版本文件 (释放300MB+)

### 1.1 删除废弃脚本
```bash
# 移动到trash而不是直接删除
trash ~/.openclaw/workspace/AI_AGENT_PRO_v3.sh
trash ~/.openclaw/workspace/ai_agent_pro_deploy.sh
trash ~/.openclaw/workspace/ai_quality_system_v2.py
trash ~/.openclaw/workspace/ai_server_secure.py
```

### 1.2 清理旧备份
```bash
# extensions-backups占用~200M
trash ~/.openclaw/extensions-backups/kimi-claw/kimi-search.bak.*
trash ~/.openclaw/extensions-backups/kimi-claw/kimi-claw.bak.*
```

### 1.3 合并重复文档
- 多个CONNECTION_GUIDE合并为一个
- 多个DEPLOY脚本保留最新版

---

## Phase 2: 建立清晰目录结构

### 新目录结构
```
~/.openclaw/workspace/
├── 📄 CORE/                 # 核心配置文件
│   ├── AGENTS.md
│   ├── SOUL.md
│   ├── USER.md
│   └── MEMORY.md
│
├── 🚀 ACTIVE/               # 当前活跃项目
│   ├── FIVERR/             # Fiverr相关
│   │   ├── FIVERR_REGISTRATION_GUIDE.md
│   │   ├── MAC_COPY_PASTE_GUIDE.md
│   │   └── EXTENSION_INSTALL_GUIDE.md
│   │
│   └── SYSTEM/             # 系统相关
│       ├── SYSTEM_FULL_CHECK.md
│       ├── CONNECTION_FIX_GUIDE.md
│       └── ROBOT_COLLABORATION.md
│
├── 📚 ARCHIVE/              # 归档文件
│   ├── v1/                 # 旧版本系统
│   ├── v2/
│   ├── v3/
│   └── DEPRECATED/         # 废弃脚本
│
├── 🛠️ SCRIPTS/              # 脚本集合
│   ├── deploy/
│   ├── monitor/
│   └── backup/
│
└── 🗂️ TEMPLATES/            # 模板库
    ├── proposals/
    ├── scripts/
    └── checklists/
```

---

## Phase 3: 建立版本控制

### 3.1 Git初始化
```bash
cd ~/.openclaw/workspace
git init
git add .
git commit -m "Initial: System reorganization - 2026-03-14"
```

### 3.2 建立清理规则 (.gitignore)
```
*.bak
*.tmp
*.log
node_modules/
extensions-backups/
```

---

## Phase 4: 自动化维护

### 4.1 每周自动清理脚本
```bash
#!/bin/bash
# weekly-cleanup.sh

# 清理旧备份 (保留最近5个)
ls -t ~/.openclaw/extensions-backups/* | tail -n +6 | xargs rm -rf

# 清理临时文件
find ~/.openclaw/workspace -name "*.tmp" -mtime +7 -delete

# 生成报告
echo "Cleanup completed: $(date)" >> ~/ai-empire/logs/cleanup.log
```

### 4.2 系统健康检查增强版
- 检查重复文件
- 检查过期备份
- 检查空间使用

========================================
💾 预计释放空间
========================================

| 操作 | 释放空间 |
|------|----------|
| 清理extensions-backups | ~200MB |
| 删除旧脚本 | ~5MB |
| 合并重复文档 | ~2MB |
| **总计** | **~207MB** |

========================================
⚡ 立即执行
========================================

**回复：**

**"开始整理"** → 我立即执行Phase 1-2，先释放空间

**"全部执行"** → 执行全部4个Phase，完全重组系统

**"先备份"** → 先创建完整备份，再开始整理

**"给我看"** → 先列出要删除的具体文件，你确认后再执行

========================================
🎯 推荐：先备份再整理
========================================

```bash
# 1. 创建完整备份
tar -czf ~/ai-empire/backup/system-full-backup-$(date +%Y%m%d).tar.gz \
  ~/.openclaw/workspace \
  ~/ai-empire

# 2. 执行整理
# ... 整理操作 ...

# 3. 验证
ls -lh ~/.openclaw/workspace/
```

**选哪个？** 🗂️
========================================
