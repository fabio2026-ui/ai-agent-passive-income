#!/bin/bash
# 安装脚本 - 部署智能磁盘清理系统

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="/opt/auto-cleanup-system"
SERVICE_NAME="auto-cleanup"

echo "🧹 智能磁盘清理系统 - 安装程序"
echo "================================"

# 检查root权限
if [[ $EUID -ne 0 ]]; then
   echo "❌ 请使用 sudo 运行此脚本"
   exit 1
fi

# 创建安装目录
echo "📁 创建安装目录..."
mkdir -p "$INSTALL_DIR"
cp -r "$SCRIPT_DIR"/* "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR"/*.sh

# 安装系统服务
echo "🔧 安装系统服务..."
if command -v systemctl >/dev/null 2>&1; then
    cp "$SCRIPT_DIR/auto-cleanup.service" /etc/systemd/system/
    sed -i "s|/root/.openclaw/workspace/auto-cleanup-system|$INSTALL_DIR|g" /etc/systemd/system/auto-cleanup.service
    systemctl daemon-reload
    echo "✅ 系统服务已安装"
    echo ""
    echo "服务命令:"
    echo "  systemctl start $SERVICE_NAME   # 启动"
    echo "  systemctl stop $SERVICE_NAME    # 停止"
    echo "  systemctl status $SERVICE_NAME  # 状态"
    echo "  systemctl enable $SERVICE_NAME  # 开机自启"
else
    echo "⚠️  未检测到systemd，跳过服务安装"
fi

# 安装crontab任务
echo "⏰ 安装定时任务..."
(crontab -l 2>/dev/null || true; cat "$SCRIPT_DIR/crontab.config" | grep -v "^#") | crontab -
echo "✅ 定时任务已安装"

# 创建命令快捷方式
echo "🔗 创建命令快捷方式..."
ln -sf "$INSTALL_DIR/cleanup-manager.sh" /usr/local/bin/cleanup-manager
ln -sf "$INSTALL_DIR/disk-monitor.sh" /usr/local/bin/disk-monitor
echo "✅ 快捷方式已创建: cleanup-manager, disk-monitor"

echo ""
echo "================================"
echo "✅ 安装完成!"
echo ""
echo "使用方法:"
echo "  cleanup-manager          # 交互式管理控制台"
echo "  disk-monitor status      # 查看状态"
echo "  disk-monitor dry-run     # 模拟清理"
echo "  disk-monitor start       # 启动监控"
echo ""
echo "日志位置: $INSTALL_DIR/cleanup.log"
echo ""
