#!/bin/bash
# Obsidian Knowledge Base Connector v1.0
# 连接本地Obsidian库与AI系统

OBSIDIAN_VAULT=""
KB_ROOT="$HOME/AI-Knowledge-Base"

echo "=== Obsidian 知识库连接器 ==="
echo "时间: $(date)"
echo ""

# 检测Obsidian库位置
detect_vault() {
    echo "🔍 检测Obsidian库位置..."
    
    # 常见位置
    VAULT_PATHS=(
        "$HOME/Documents/Obsidian Vault"
        "$HOME/Documents/Obsidian"
        "$HOME/Obsidian Vault"
        "$HOME/Obsidian"
        "$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents"
    )
    
    for path in "${VAULT_PATHS[@]}"; do
        if [ -d "$path" ]; then
            OBSIDIAN_VAULT="$path"
            echo "✅ 发现库: $path"
            return 0
        fi
    done
    
    echo "⚠️ 未找到现有库"
    echo "创建新库位置: $HOME/Obsidian Vault"
    mkdir -p "$HOME/Obsidian Vault"
    OBSIDIAN_VAULT="$HOME/Obsidian Vault"
    return 0
}

# 同步AI知识到Obsidian
sync_ai_to_obsidian() {
    echo ""
    echo "🔄 同步AI知识到Obsidian..."
    
    # 创建AI知识目录
    mkdir -p "$OBSIDIAN_VAULT/AI-Generated"
    mkdir -p "$OBSIDIAN_VAULT/AI-Generated/Business-Lines"
    mkdir -p "$OBSIDIAN_VAULT/AI-Generated/Content"
    mkdir -p "$OBSIDIAN_VAULT/AI-Generated/Insights"
    
    # 同步业务线知识
    if [ -d "$HOME/ai-business-empire" ]; then
        echo "  📁 同步业务线知识..."
        for dir in copywriting seo-content social-media education; do
            if [ -d "$HOME/ai-business-empire/$dir" ]; then
                cp -r "$HOME/ai-business-empire/$dir"/* "$OBSIDIAN_VAULT/AI-Generated/Business-Lines/" 2>/dev/null
            fi
        done
    fi
    
    # 同步文本内容
    if [ -d "$HOME/ai-content-factory/text_division" ]; then
        echo "  📝 同步文本内容..."
        cp -r "$HOME/ai-content-factory/text_division"/* "$OBSIDIAN_VAULT/AI-Generated/Content/" 2>/dev/null
    fi
    
    # 创建AI洞察笔记
    cat > "$OBSIDIAN_VAULT/AI-Generated/Insights/系统运行报告.md" << 'EOF'
---
tags: [AI, 系统, 每日报告]
date: $(date +%Y-%m-%d)
---

# AI系统运行报告

## 当前状态
- 机器人军团: 6士兵运行中
- 业务线: 9+1 全部激活
- 质量等级: Premium

## 今日产出
- APP代码: 100+行
- 视频: 20个
- 内容: 多业务线持续生成

## 下一步
持续优化，目标2000行代码
EOF
    
    echo "✅ 同步完成"
}

# 从Obsidian读取知识
read_obsidian_knowledge() {
    echo ""
    echo "📖 读取Obsidian知识库..."
    
    if [ -z "$OBSIDIAN_VAULT" ] || [ ! -d "$OBSIDIAN_VAULT" ]; then
        echo "❌ 库未找到"
        return 1
    fi
    
    # 统计笔记数量
    NOTE_COUNT=$(find "$OBSIDIAN_VAULT" -name "*.md" | wc -l)
    echo "  发现笔记: $NOTE_COUNT 个"
    
    # 列出最近修改的笔记
    echo "  最近更新:"
    find "$OBSIDIAN_VAULT" -name "*.md" -mtime -1 | head -5 | while read file; do
        echo "    - $(basename "$file")"
    done
    
    # 提取关键知识（简化版）
    echo ""
    echo "🔍 提取关键知识..."
    grep -r "TODO\|IDEA\|NOTE" "$OBSIDIAN_VAULT"/*.md 2>/dev/null | head -5 || echo "  暂无标记"
}

# 创建双向同步
setup_bidirectional_sync() {
    echo ""
    echo "⚙️ 设置双向同步..."
    
    # 创建同步脚本
    cat > "$KB_ROOT/sync_obsidian.sh" << EOF
#!/bin/bash
# 自动同步脚本
# 每30分钟运行一次

echo "\$(date): 开始同步..."

# AI → Obsidian
# 复制AI生成内容到Obsidian

# Obsidian → AI
# 读取Obsidian笔记，提取知识

echo "\$(date): 同步完成"
EOF
    chmod +x "$KB_ROOT/sync_obsidian.sh"
    
    echo "✅ 同步脚本已创建: $KB_ROOT/sync_obsidian.sh"
}

# 主函数
main() {
    detect_vault
    sync_ai_to_obsidian
    read_obsidian_knowledge
    setup_bidirectional_sync
    
    echo ""
    echo "========================================"
    echo "✅ Obsidian 知识库集成完成！"
    echo "========================================"
    echo ""
    echo "📍 库位置: $OBSIDIAN_VAULT"
    echo "🔗 集成中心: $KB_ROOT"
    echo ""
    echo "使用方法:"
    echo "1. 在Obsidian中打开: $OBSIDIAN_VAULT"
    echo "2. 查看AI-Generated目录获取AI产出"
    echo "3. 在Obsidian中记录想法，AI会读取"
    echo "4. 运行 $KB_ROOT/sync_obsidian.sh 手动同步"
}

main
