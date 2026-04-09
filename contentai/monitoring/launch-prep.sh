#!/bin/bash
# ContentAI 自动发布准备脚本
# 每日检查并准备发布内容

DATE=$(date +%Y%m%d)
LAUNCH_DIR="/root/.openclaw/workspace/contentai/launch-ready"

mkdir -p $LAUNCH_DIR

echo "=== 准备发布内容 $DATE ==="

# 检查今日是否需要发布
if [ -f "$LAUNCH_DIR/scheduled-$DATE.txt" ]; then
    echo "今日有 scheduled 发布任务"
    cat "$LAUNCH_DIR/scheduled-$DATE.txt"
fi

# 准备通用发布模板
if [ ! -f "$LAUNCH_DIR/ih-template.md" ]; then
    echo "创建 IH 模板..."
    cat > "$LAUNCH_DIR/ih-template.md" << 'EOF'
# IndieHackers 发布模板

## 标题选项
1. Show IH: ContentAI - Free AI content generator for Chinese cross-border e-commerce
2. Show IH: I built 4 AI tools in 1 day. Here's how:
3. Show IH: Zero-cost AI writing tool that beats $13/month alternatives

## 正文
[根据具体日期调整]

## 标签
#ai #content #free #cross-border
EOF
fi

if [ ! -f "$LAUNCH_DIR/hn-template.md" ]; then
    echo "创建 HN 模板..."
    cat > "$LAUNCH_DIR/hn-template.md" << 'EOF'
# HackerNews 发布模板

## 标题
Show HN: ContentAI – Free AI content generator (BYOK model)

## 正文
[根据具体日期调整]
EOF
fi

echo "=== 发布准备完成 ==="
