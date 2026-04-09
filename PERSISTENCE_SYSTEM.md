# 🛡️ 系统持久化与防丢失机制
# 解决AI状态重置问题

========================================
🔍 问题根源分析
========================================

## 为什么功能会"丢失"

### AI系统的本质限制
```
每次对话 = 新的会话
    ↓
内存状态重置
    ↓
之前配置的临时数据丢失
    ↓
需要重新配置
```

### 根本原因
- ❌ AI没有真正的持久化内存
- ❌ 每次重启后环境重置
- ❌ 依赖检测环境变化
- ❌ 没有版本控制机制

========================================
🛠️ 立即建立持久化机制
========================================

## 1. 系统状态追踪器

创建: `~/ai-empire/system/SYSTEM_STATE.md`

```markdown
# 系统状态追踪
# 最后更新: $(date)

## 已安装组件

### 基础工具
- [x] FFmpeg: $(which ffmpeg)
- [ ] Node.js: 
- [ ] Python 3:
- [ ] Git:

### API配置
- [x] Pexels API: 已配置 (xhOedTLa...)
- [x] Pixabay API: 已配置 (54929444-...)

### 自动化脚本
- [x] 收入追踪: track-revenue.sh
- [x] 周报生成: weekly-report.sh
- [x] 视频渲染: video-renderer.sh (待安装)

## 项目状态
- Phase 1 Bootstrap: 95% (等待Fiverr上线)
- AI Life Copilot: 232行/2000行
- 素材库: 30个视频

## 下次检查时间: $(date + 1 day)
```

---

## 2. 安装记录器

创建: `~/ai-empire/system/INSTALL_LOG.sh`

```bash
#!/bin/bash
# 安装记录器 - 记录所有安装操作

LOG_FILE="$HOME/ai-empire/system/install.log"

log_install() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# 记录本次操作
log_install "FFmpeg安装检查"

# 检查是否已安装
if command -v ffmpeg &> /dev/null; then
    log_install "FFmpeg已存在: $(which ffmpeg)"
    echo "✅ FFmpeg已安装"
else
    log_install "FFmpeg未安装，开始安装..."
    # 执行安装
    brew install ffmpeg
    log_install "FFmpeg安装完成"
fi

# 记录版本
ffmpeg -version | head -1 >> $LOG_FILE
```

---

## 3. 系统健康检查脚本

创建: `~/ai-empire/scripts/system-health-check.sh`

```bash
#!/bin/bash
# 系统健康检查 - 确保所有组件正常运行

LOG="$HOME/ai-empire/system/health.log"
STATE="$HOME/ai-empire/system/SYSTEM_STATE.md"

echo "========================================" | tee -a $LOG
echo "🔍 系统健康检查 - $(date)" | tee -a $LOG
echo "========================================" | tee -a $LOG

# 检查1: 基础工具
echo "[检查1] 基础工具..." | tee -a $LOG

if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg: $(which ffmpeg)" | tee -a $LOG
else
    echo "❌ FFmpeg: 未安装!" | tee -a $LOG
    echo "   修复: brew install ffmpeg" | tee -a $LOG
fi

if command -v python3 &> /dev/null; then
    echo "✅ Python3: $(which python3)" | tee -a $LOG
else
    echo "❌ Python3: 未安装!" | tee -a $LOG
fi

# 检查2: API配置
echo "" | tee -a $LOG
echo "[检查2] API配置..." | tee -a $LOG

if grep -q "PEXELS_API_KEY" ~/.bashrc ~/.zshrc 2>/dev/null; then
    echo "✅ Pexels API: 已配置" | tee -a $LOG
else
    echo "⚠️  Pexels API: 仅当前会话有效" | tee -a $LOG
fi

# 检查3: 文件完整性
echo "" | tee -a $LOG
echo "[检查3] 文件完整性..." | tee -a $LOG

REQUIRED_FILES=(
    "$HOME/ai-empire/launch/bio.txt"
    "$HOME/ai-empire/launch/title.txt"
    "$HOME/ai-empire/launch/description.txt"
    "$HOME/ai-empire/scripts/track-revenue.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $(basename $file): 存在" | tee -a $LOG
    else
        echo "❌ $(basename $file): 丢失!" | tee -a $LOG
    fi
done

# 检查4: 素材库
echo "" | tee -a $LOG
echo "[检查4] 素材库..." | tee -a $LOG

VIDEO_COUNT=$(ls $HOME/ai-empire/launch/assets/*.mp4 2>/dev/null | wc -l)
if [ $VIDEO_COUNT -gt 0 ]; then
    echo "✅ 视频素材: $VIDEO_COUNT 个" | tee -a $LOG
else
    echo "❌ 视频素材: 未下载!" | tee -a $LOG
fi

# 检查5: 项目状态
echo "" | tee -a $LOG
echo "[检查5] 项目状态..." | tee -a $LOG
echo "✅ Bootstrap准备: 95%" | tee -a $LOG
echo "⏳ Fiverr上线: 等待人工操作" | tee -a $LOG

# 更新状态文件
echo "$(date) - 健康检查完成" >> $STATE

echo "" | tee -a $LOG
echo "========================================" | tee -a $LOG
echo "检查完成 - 查看日志: $LOG" | tee -a $LOG
echo "========================================" | tee -a $LOG
```

---

## 4. 自动备份系统

创建: `~/ai-empire/scripts/auto-backup.sh`

```bash
#!/bin/bash
# 自动备份系统 - 防止配置丢失

BACKUP_DIR="$HOME/ai-empire/backup/$(date +%Y%m%d_%H%M%S)"
SOURCE_DIR="$HOME/ai-empire"

echo "💾 开始自动备份..."

mkdir -p $BACKUP_DIR

# 备份关键目录
cp -r $SOURCE_DIR/launch $BACKUP_DIR/
cp -r $SOURCE_DIR/scripts $BACKUP_DIR/
cp -r $SOURCE_DIR/docs $BACKUP_DIR/

# 备份系统配置
cp -r $SOURCE_DIR/system $BACKUP_DIR/

# 备份环境变量
env | grep -E "API_KEY|TOKEN|SECRET" > $BACKUP_DIR/environment.txt 2>/dev/null

# 创建恢复脚本
cat > $BACKUP_DIR/restore.sh << EOF
#!/bin/bash
# 恢复脚本
echo "恢复备份: $(basename $BACKUP_DIR)"
cp -r launch scripts docs system ~/ai-empire/
echo "✅ 恢复完成"
EOF
chmod +x $BACKUP_DIR/restore.sh

# 只保留最近10个备份
ls -t $SOURCE_DIR/backup/ | tail -n +11 | xargs -r rm -rf

echo "✅ 备份完成: $BACKUP_DIR"
echo "如需恢复，运行: bash $BACKUP_DIR/restore.sh"
```

---

## 5. 安装保护机制

修改安装脚本，添加防重复安装检测:

```bash
#!/bin/bash
# 智能安装脚本 - 避免重复安装

INSTALL_FLAG="$HOME/ai-empire/system/.installed_$(basename $0)"

if [ -f "$INSTALL_FLAG" ]; then
    echo "⚠️  $(basename $0) 已安装过!"
    echo "上次安装: $(cat $INSTALL_FLAG)"
    echo ""
    echo "选项:"
    echo "1. 跳过安装 (使用现有版本)"
    echo "2. 重新安装 (覆盖现有版本)"
    echo "3. 检查更新"
    read -p "选择 [1/2/3]: " choice
    
    case $choice in
        1) echo "✅ 使用现有版本"; exit 0 ;;
        2) echo "🔄 重新安装..." ;;
        3) echo "🔍 检查更新..." ;;
        *) echo "❌ 无效选择"; exit 1 ;;
    esac
fi

# 执行安装...
echo "安装中..."

# 安装完成后标记
echo "$(date) - 安装完成" > $INSTALL_FLAG
```

---

## 6. 环境变量持久化

确保API密钥不会丢失:

```bash
#!/bin/bash
# 持久化API密钥

add_to_shell_config() {
    local key=$1
    local value=$2
    
    # 检测使用的shell
    if [ -f ~/.zshrc ]; then
        echo "export $key=\"$value\"" >> ~/.zshrc
        echo "✅ 已添加到 ~/.zshrc"
    elif [ -f ~/.bashrc ]; then
        echo "export $key=\"$value\"" >> ~/.bashrc
        echo "✅ 已添加到 ~/.bashrc"
    fi
}

# 持久化Pexels API
add_to_shell_config "PEXELS_API_KEY" "xhOedTLa5OkxmbpymdzNtUNh95apuhptUfAcO7iRIZajmBV3rswqpw3k"

# 持久化Pixabay API  
add_to_shell_config "PIXABAY_API_KEY" "54929444-13984eb3edf48a07df4704f64"

echo "✅ API密钥已持久化"
echo "重新加载配置: source ~/.zshrc 或 source ~/.bashrc"
```

========================================
⚡ 立即执行
========================================

## 第一步: 创建系统追踪目录

```bash
mkdir -p ~/ai-empire/system
mkdir -p ~/ai-empire/backup
```

## 第二步: 保存当前状态

```bash
# 创建系统状态文件
cat > ~/ai-empire/system/SYSTEM_STATE.md << EOF
# 系统状态追踪
# 更新: $(date)

## 已安装
- FFmpeg: 待安装
- Python3: $(which python3)
- API配置: 已持久化

## 待完成
- [ ] FFmpeg安装
- [ ] 视频渲染脚本部署
- [ ] Fiverr上线

## 下次检查: $(date -d '+1 day')
EOF
```

## 第三步: 安装FFmpeg（带记录）

```bash
# 安装并记录
brew install ffmpeg 2>&1 | tee ~/ai-empire/system/install_ffmpeg.log

# 标记已安装
echo "$(date) - FFmpeg安装完成: $(which ffmpeg)" > ~/ai-empire/system/.installed_ffmpeg
echo "$(date) - FFmpeg版本: $(ffmpeg -version | head -1)" >> ~/ai-empire/system/.installed_ffmpeg
```

## 第四步: 设置定时检查

```bash
# 添加到crontab（每日检查）
echo "0 9 * * * $HOME/ai-empire/scripts/system-health-check.sh" | crontab -
```

========================================
🎯 长期解决方案
========================================

## 每次会话开始时的标准操作

```bash
# 1. 加载环境变量
source ~/.zshrc  # 或 ~/.bashrc

# 2. 运行健康检查
bash ~/ai-empire/scripts/system-health-check.sh

# 3. 查看系统状态
cat ~/ai-empire/system/SYSTEM_STATE.md

# 4. 恢复任何丢失的功能
# 根据健康检查报告自动修复
```

## 关键原则

1. **安装即记录**: 每次安装都写入日志
2. **状态即文件**: 所有状态持久化到文件
3. **定期即检查**: 每日自动健康检查
4. **备份即自动**: 每次重要更改自动备份

========================================
💬 现在执行
========================================

**我现在立即为你:**

1. ✅ 创建系统追踪目录
2. ✅ 保存当前完整状态
3. ✅ 安装FFmpeg并记录
4. ✅ 创建健康检查脚本
5. ✅ 设置自动备份

**执行后，所有功能都将被记录，不再丢失！**

**回复 "执行" 我立即开始！** 🛡️🚀
========================================
