# 🧹 智能磁盘清理系统

智能磁盘空间监控与自动清理系统，防止磁盘爆满导致服务中断。

## 功能特性

- 📊 **实时监控**: 每分钟检查磁盘使用率
- 🎯 **多级阈值**: 70%警告 / 80%自动清理 / 90%紧急清理
- 🛡️ **安全清理**: 智能识别重要文件，永不删除源码/配置/数据库
- 📦 **P0/P1/P2分级**: 按重要性分优先级清理
- 📝 **详细日志**: 完整的清理记录与报告
- ⚙️ **灵活配置**: JSON格式的清理规则配置

## 快速开始

### 1. 查看状态
```bash
./disk-monitor.sh status
```

### 2. 模拟清理 (查看可释放空间)
```bash
./disk-monitor.sh dry-run
```

### 3. 启动监控服务
```bash
./disk-monitor.sh start
```

### 4. 交互式管理
```bash
./cleanup-manager.sh
```

## 清理优先级

### P0 - 立即清理 (最安全)
- `node_modules` - 可重新安装的依赖
- `.next/dist/build` - 可重新构建的输出
- `.cache/__pycache__` - 临时缓存
- `*.log` (7天前) - 旧日志文件
- 重复文件

### P1 - 需要时清理
- 30天前的临时文件 (`*.tmp`, `*.temp`)
- 旧的备份文件 (保留最近3个)
- 90天前的压缩包
- 测试文件

### P2 - 谨慎清理 (需确认)
- 大媒体文件 (>500MB, 半年以上)
- 历史数据归档

### 永不清理
- 源代码 (`.py`, `.js`, `.ts` 等)
- 配置文件 (`.conf`, `.json`, `.yaml` 等)
- 数据库文件 (`.db`, `.sqlite`)
- 当前项目关键文件
- `.git/` 版本控制

## 文件结构

```
auto-cleanup-system/
├── disk-monitor.sh      # 监控主脚本
├── safe-cleanup.sh      # 安全清理执行器
├── cleanup-manager.sh   # 交互式管理工具
├── cleanup-rules.json   # 清理规则配置
├── cleanup.log          # 清理日志
├── crontab.config       # 定时任务配置
├── auto-cleanup.service # systemd服务文件
├── install.sh           # 安装脚本
└── README.md            # 本文件
```

## 命令参考

### disk-monitor.sh
```bash
./disk-monitor.sh status      # 显示磁盘状态
./disk-monitor.sh check       # 执行单次检查
./disk-monitor.sh start       # 启动持续监控
./disk-monitor.sh stop        # 停止监控
./disk-monitor.sh dry-run     # 模拟清理
./disk-monitor.sh cleanup     # 立即清理
./disk-monitor.sh p0          # P0快速清理
./disk-monitor.sh p1          # P1深度清理
```

### cleanup-manager.sh
交互式管理控制台，提供菜单选择各项功能。

## 配置说明

编辑 `cleanup-rules.json` 可自定义:
- 阈值设置
- 清理规则
- 保护路径
- 保留策略

## 日志查看

```bash
# 查看最新日志
tail -f cleanup.log

# 查看清理历史
grep "清理完成" cleanup.log

# 查看错误记录
grep "ERROR" cleanup.log
```

## 系统安装

```bash
sudo ./install.sh
```

安装后:
- 系统服务: `systemctl start auto-cleanup`
- 定时任务: 自动添加到crontab
- 快捷命令: `cleanup-manager`, `disk-monitor`

## 定时任务配置

默认定时任务 (`crontab.config`):
```cron
# 每小时生成状态报告
0 * * * * /path/disk-monitor.sh status

# 每天凌晨3点深度清理
0 3 * * * /path/disk-monitor.sh p1

# 每周日完整检查
0 0 * * 0 /path/disk-monitor.sh status
```

## 安全机制

1. **路径保护**: 内置多层路径保护，禁止删除系统关键目录
2. **冷却机制**: 清理后有5分钟冷却期，避免频繁清理
3. **模拟模式**: dry-run模式可预览清理效果
4. **日志记录**: 所有操作完整记录，可审计追溯

## 注意事项

1. 首次使用建议先运行 `dry-run` 查看效果
2. 监控服务启动后会持续运行，占用极小资源
3. 重要数据请确保已备份
4. 可编辑 `cleanup-rules.json` 自定义保护规则

## 故障排查

### 监控服务无法启动
```bash
# 检查权限
chmod +x *.sh

# 检查日志
cat cleanup.log

# 手动测试
./disk-monitor.sh check
```

### 清理效果不理想
```bash
# 查看当前磁盘状态
./disk-monitor.sh status

# 手动执行深度清理
./disk-monitor.sh p1
```

## 更新日志

### v1.0
- 基础监控功能
- P0/P1/P2分级清理
- 安全保护机制
- 日志与报告
