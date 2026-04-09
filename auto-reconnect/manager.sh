#!/bin/bash
# 断线自动重连守护进程 - 管理脚本

CMD="$1"

show_help() {
    echo "断线自动重连守护进程管理器"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start       启动服务"
    echo "  stop        停止服务"
    echo "  restart     重启服务"
    echo "  status      查看状态"
    echo "  logs        查看实时日志"
    echo "  state       查看当前状态"
    echo "  test        测试连接检测"
    echo "  disable     禁用开机自启"
    echo "  enable      启用开机自启"
    echo "  help        显示帮助"
}

case "$CMD" in
    start)
        echo "启动断线自动重连守护进程..."
        systemctl start auto-reconnect
        ;;
    stop)
        echo "停止断线自动重连守护进程..."
        systemctl stop auto-reconnect
        ;;
    restart)
        echo "重启断线自动重连守护进程..."
        systemctl restart auto-reconnect
        ;;
    status)
        systemctl status auto-reconnect --no-pager
        ;;
    logs)
        echo "按 Ctrl+C 退出日志查看"
        journalctl -u auto-reconnect -f
        ;;
    state)
        echo "=== 当前状态 ==="
        cat /var/lib/auto-reconnect/state.json 2>/dev/null || echo "状态文件不存在"
        echo ""
        echo "=== 最新日志 ==="
        tail -5 /var/log/auto-reconnect.log
        ;;
    test)
        echo "测试连接检测..."
        /usr/local/bin/auto-reconnect-daemon --test 2>/dev/null || python3 -c "
import subprocess
result = subprocess.run(['openclaw', 'gateway', 'status'], capture_output=True, text=True)
print(f'Gateway状态: {result.returncode}')
print(f'输出: {result.stdout[:200]}')
"
        ;;
    enable)
        systemctl enable auto-reconnect
        echo "已启用开机自启"
        ;;
    disable)
        systemctl disable auto-reconnect
        echo "已禁用开机自启"
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo "未知命令: $CMD"
        show_help
        exit 1
        ;;
esac
