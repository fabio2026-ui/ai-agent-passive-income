#!/bin/bash
# 首单监控系统一键配置脚本
# 运行此脚本完成所有配置

echo "🚀 Stripe首单监控系统配置"
echo "================================"
echo ""

SCRIPT_DIR="/root/.openclaw/workspace"
cd "$SCRIPT_DIR"

# 检查Python3
echo "✓ 检查Python3..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3未安装"
    exit 1
fi
echo "  Python3已安装"

# 创建必要目录
echo "✓ 创建目录结构..."
mkdir -p logs
mkdir -p notifications

echo "  目录创建完成"

# 检查Stripe密钥
echo ""
echo "📋 Stripe密钥配置"
echo "=================="

if [ -f ".stripe-secret" ]; then
    echo "✓ Stripe密钥文件已存在"
else
    echo "⚠️ 未找到Stripe密钥文件"
    echo ""
    echo "请执行以下操作之一:"
    echo "1. 创建 .stripe-secret 文件，内容为 sk_test_... 或 sk_live_..."
    echo "2. 设置环境变量: export STRIPE_SECRET_KEY=sk_..."
    echo ""
fi

# 检查cron任务
echo ""
echo "📋 Cron任务配置"
echo "================"

if crontab -l 2>/dev/null | grep -q "first-sale-monitor"; then
    echo "✓ 首单监控cron任务已配置"
    crontab -l | grep -A1 "首单监控"
else
    echo "⚠️ 未找到cron任务"
fi

# 检查状态文件
echo ""
echo "📋 状态文件"
echo "==========="

if [ -f "first-sale-state.json" ]; then
    echo "✓ 状态文件已创建"
    cat first-sale-state.json | head -20
else
    echo "⚠️ 状态文件不存在"
fi

# 显示当前配置
echo ""
echo "📧 通知配置"
echo "==========="
echo "通知邮箱: ai_67dd6c1a002c@sharebot.net"
echo "检查频率: 每分钟"

echo ""
echo "================================"
echo "✅ 配置检查完成"
echo ""
echo "📖 使用说明:"
echo "1. 确保设置了 STRIPE_SECRET_KEY"
echo "2. 系统每分钟自动检查一次"
echo "3. 检测首单时自动发送邮件通知"
echo "4. 查看日志: tail -f logs/first-sale-monitor.log"
echo "5. 查看状态: cat first-sale-state.json"
echo ""
echo "🧪 手动测试运行:"
echo "   cd $SCRIPT_DIR && python3 first-sale-monitor.py"
echo ""
