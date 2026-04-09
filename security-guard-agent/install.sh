#!/bin/bash
#
# Security Guard Agent - 安装脚本
# 设置24/7自动运行的系统安全维护机器人
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_NAME="security-guard-agent"
INSTALL_DIR="/opt/$BASE_NAME"
SERVICE_NAME="security-guard"

echo "🔧 Security Guard Agent 安装程序"
echo "=================================="
echo ""

# 检查root权限
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  请使用 sudo 运行此脚本"
    exit 1
fi

# 检查Python版本
echo "📋 检查Python版本..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✓ Python版本: $PYTHON_VERSION"

# 安装依赖
echo ""
echo "📦 安装Python依赖..."
pip3 install -q -r "$SCRIPT_DIR/requirements.txt"
echo "✓ 依赖安装完成"

# 创建安装目录
echo ""
echo "📁 创建安装目录..."
mkdir -p "$INSTALL_DIR"
cp -r "$SCRIPT_DIR/scripts" "$INSTALL_DIR/"
cp -r "$SCRIPT_DIR/config" "$INSTALL_DIR/"
mkdir -p "$INSTALL_DIR/logs"
mkdir -p "$INSTALL_DIR/reports"
echo "✓ 安装目录: $INSTALL_DIR"

# 设置权限
chmod +x "$INSTALL_DIR/scripts/main_controller.py"
chmod 755 "$INSTALL_DIR" -R

# 创建systemd服务（如果是Linux）
echo ""
echo "🔌 创建系统服务..."

if command -v systemctl &> /dev/null; then
    cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=Security Guard Agent - 24/7 System Security Monitor
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/python3 $INSTALL_DIR/scripts/main_controller.py --mode continuous
ExecStop=/bin/kill -SIGTERM \$MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    echo "✓ Systemd服务已创建: $SERVICE_NAME.service"
    
    # 创建定时任务（用于每小时扫描和每日报告）
    echo ""
    echo "⏰ 设置定时任务..."
    
    # 创建cron文件
    cat > "/etc/cron.d/$SERVICE_NAME" << EOF
# Security Guard Agent 定时任务
# 每小时执行一次安全扫描
0 * * * * root /usr/bin/python3 $INSTALL_DIR/scripts/main_controller.py --mode once --task scan >> /var/log/security-guard-cron.log 2>&1

# 每天凌晨2点生成报告
0 2 * * * root /usr/bin/python3 $INSTALL_DIR/scripts/main_controller.py --mode once --task report >> /var/log/security-guard-cron.log 2>&1
EOF

    chmod 644 "/etc/cron.d/$SERVICE_NAME"
    echo "✓ 定时任务已设置"
    
else
    echo "⚠️  未检测到systemd，将使用cron方式运行"
    
    # 创建启动脚本
    cat > "$INSTALL_DIR/start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
nohup python3 scripts/main_controller.py --mode continuous > logs/service.log 2>&1 &
echo $! > /tmp/security-guard.pid
echo "Security Guard Agent 已启动 (PID: $(cat /tmp/security-guard.pid))"
EOF

    cat > "$INSTALL_DIR/stop.sh" << 'EOF'
#!/bin/bash
if [ -f /tmp/security-guard.pid ]; then
    kill $(cat /tmp/security-guard.pid) 2>/dev/null
    rm -f /tmp/security-guard.pid
    echo "Security Guard Agent 已停止"
else
    echo "未找到运行中的进程"
fi
EOF

    chmod +x "$INSTALL_DIR/start.sh"
    chmod +x "$INSTALL_DIR/stop.sh"
    
    # 添加到cron
    (crontab -l 2>/dev/null || echo "") | grep -v "security-guard" | \
    { cat; echo "0 * * * * /usr/bin/python3 $INSTALL_DIR/scripts/main_controller.py --mode once --task scan"; \
      echo "0 2 * * * /usr/bin/python3 $INSTALL_DIR/scripts/main_controller.py --mode once --task report"; } | crontab -
      
    echo "✓ Cron任务已设置"
fi

# 创建命令别名
echo ""
echo "🔗 创建命令别名..."

cat > "/usr/local/bin/security-guard" << EOF
#!/bin/bash
case "\$1" in
    start)
        if command -v systemctl &> /dev/null; then
            systemctl start $SERVICE_NAME
        else
            $INSTALL_DIR/start.sh
        fi
        ;;
    stop)
        if command -v systemctl &> /dev/null; then
            systemctl stop $SERVICE_NAME
        else
            $INSTALL_DIR/stop.sh
        fi
        ;;
    restart)
        if command -v systemctl &> /dev/null; then
            systemctl restart $SERVICE_NAME
        else
            $INSTALL_DIR/stop.sh
            sleep 2
            $INSTALL_DIR/start.sh
        fi
        ;;
    status)
        if command -v systemctl &> /dev/null; then
            systemctl status $SERVICE_NAME
        else
            if [ -f /tmp/security-guard.pid ] && kill -0 \$(cat /tmp/security-guard.pid) 2>/dev/null; then
                echo "Security Guard Agent 正在运行 (PID: \$(cat /tmp/security-guard.pid))"
            else
                echo "Security Guard Agent 未运行"
            fi
        fi
        ;;
    scan)
        python3 $INSTALL_DIR/scripts/main_controller.py --mode once --task scan
        ;;
    report)
        python3 $INSTALL_DIR/scripts/main_controller.py --mode once --task report
        ;;
    logs)
        tail -f $INSTALL_DIR/logs/security-guard-\$(date +%Y%m%d).log
        ;;
    *)
        echo "Security Guard Agent 管理工具"
        echo ""
        echo "用法: security-guard [命令]"
        echo ""
        echo "命令:"
        echo "  start    启动服务"
        echo "  stop     停止服务"
        echo "  restart  重启服务"
        echo "  status   查看状态"
        echo "  scan     立即执行安全扫描"
        echo "  report   立即生成报告"
        echo "  logs     查看实时日志"
        echo ""
        ;;
esac
EOF

chmod +x "/usr/local/bin/security-guard"
echo "✓ 命令别名已创建: security-guard"

# 创建Web面板入口
echo ""
echo "🌐 设置Web监控面板..."
WEB_PORT=9999

cat > "$INSTALL_DIR/start-web.sh" << EOF
#!/bin/bash
cd "$INSTALL_DIR"
python3 -m http.server $WEB_PORT --directory reports &
echo "Web面板已启动: http://localhost:$WEB_PORT"
echo "报告目录: $INSTALL_DIR/reports"
EOF

chmod +x "$INSTALL_DIR/start-web.sh"
echo "✓ Web面板脚本已创建"

# 启动服务
echo ""
echo "🚀 启动 Security Guard Agent..."

if command -v systemctl &> /dev/null; then
    systemctl enable "$SERVICE_NAME"
    systemctl start "$SERVICE_NAME"
    sleep 2
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo "✓ 服务已成功启动"
    else
        echo "⚠️  服务启动失败，请检查日志: journalctl -u $SERVICE_NAME"
    fi
else
    "$INSTALL_DIR/start.sh"
fi

echo ""
echo "=================================="
echo "✅ 安装完成!"
echo ""
echo "📚 使用指南:"
echo "  • 启动服务:   security-guard start"
echo "  • 停止服务:   security-guard stop"
echo "  • 查看状态:   security-guard status"
echo "  • 查看日志:   security-guard logs"
echo "  • 立即扫描:   security-guard scan"
echo "  • 生成报告:   security-guard report"
echo ""
echo "📂 安装目录: $INSTALL_DIR"
echo "📊 Web面板:  http://localhost:$WEB_PORT (运行 start-web.sh 后)"
echo ""
echo "📝 配置文件: $INSTALL_DIR/config/config.json"
echo ""
