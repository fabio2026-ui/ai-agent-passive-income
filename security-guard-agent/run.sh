#!/bin/bash
#
# Security Guard Agent 启动脚本
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="/tmp/security-guard.pid"

case "$1" in
    start)
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "⚠️  Security Guard Agent 已经在运行中 (PID: $(cat $PID_FILE))"
            exit 1
        fi
        
        echo "🚀 启动 Security Guard Agent..."
        cd "$SCRIPT_DIR"
        
        # 确保日志目录存在
        mkdir -p logs/scan-results logs/metrics logs/alerts reports
        
        # 启动主控制器
        nohup python3 scripts/main_controller.py --mode continuous > logs/service.log 2>&1 &
echo $! > "$PID_FILE"
        
        sleep 2
        
        if kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "✅ Security Guard Agent 已启动 (PID: $(cat $PID_FILE))"
            echo "📊 监控面板: python3 scripts/dashboard_server.py"
            echo "📝 查看日志: tail -f logs/security-guard-$(date +%Y%m%d).log"
        else
            echo "❌ 启动失败，请检查日志"
            exit 1
        fi
        ;;
        
    stop)
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if kill -0 "$PID" 2>/dev/null; then
                echo "🛑 停止 Security Guard Agent (PID: $PID)..."
                kill -TERM "$PID"
                rm -f "$PID_FILE"
                echo "✅ 已停止"
            else
                echo "⚠️  进程不存在"
                rm -f "$PID_FILE"
            fi
        else
            echo "⚠️  未找到PID文件，尝试查找进程..."
            PID=$(pgrep -f "main_controller.py.*continuous")
            if [ -n "$PID" ]; then
                kill -TERM $PID
                echo "✅ 已停止进程 $PID"
            else
                echo "⚠️  未找到运行中的进程"
            fi
        fi
        ;;
        
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
        
    status)
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "✅ Security Guard Agent 正在运行 (PID: $(cat $PID_FILE))"
            echo ""
            echo "📊 运行状态:"
            python3 "$SCRIPT_DIR/scripts/main_controller.py" --status 2>/dev/null || echo "   无法获取详细状态"
        else
            echo "⏹️  Security Guard Agent 未运行"
        fi
        ;;
        
    scan)
        echo "🔍 执行安全扫描..."
        python3 "$SCRIPT_DIR/scripts/main_controller.py" --mode once --task scan
        ;;
        
    monitor)
        echo "📊 执行系统监控..."
        python3 "$SCRIPT_DIR/scripts/main_controller.py" --mode once --task monitor
        ;;
        
    report)
        echo "📈 生成安全报告..."
        python3 "$SCRIPT_DIR/scripts/main_controller.py" --mode once --task report
        echo ""
        echo "📄 报告位置: $SCRIPT_DIR/reports/"
        ls -la "$SCRIPT_DIR/reports/" 2>/dev/null | tail -5
        ;;
        
    dashboard)
        echo "🌐 启动监控面板..."
        echo "📊 访问地址: http://localhost:9999"
        echo "🛑 按 Ctrl+C 停止"
        echo ""
        python3 "$SCRIPT_DIR/scripts/dashboard_server.py"
        ;;
        
    logs)
        LOG_FILE="$SCRIPT_DIR/logs/security-guard-$(date +%Y%m%d).log"
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            echo "未找到日志文件: $LOG_FILE"
            echo "可用日志文件:"
            ls -la "$SCRIPT_DIR/logs/" 2>/dev/null | grep security-guard
        fi
        ;;
        
    *)
        echo "🛡️  Security Guard Agent 管理脚本"
        echo ""
        echo "用法: ./run.sh [命令]"
        echo ""
        echo "命令:"
        echo "  start      启动服务"
        echo "  stop       停止服务"
        echo "  restart    重启服务"
        echo "  status     查看运行状态"
        echo "  scan       立即执行安全扫描"
        echo "  monitor    立即执行系统监控"
        echo "  report     立即生成安全报告"
        echo "  dashboard  启动Web监控面板"
        echo "  logs       查看实时日志"
        echo ""
        ;;
esac
