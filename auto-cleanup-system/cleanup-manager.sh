#!/bin/bash

# 智能磁盘清理系统 - 管理脚本
# cleanup-manager.sh - 便捷的命令行管理工具

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITOR_SCRIPT="${SCRIPT_DIR}/disk-monitor.sh"
CLEANUP_SCRIPT="${SCRIPT_DIR}/safe-cleanup.sh"
LOG_FILE="${SCRIPT_DIR}/cleanup.log"
RULES_FILE="${SCRIPT_DIR}/cleanup-rules.json"

# 颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

show_header() {
    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║                                                  ║"
    echo "║         🧹 智能磁盘清理系统 管理控制台           ║"
    echo "║                                                  ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo ""
}

show_menu() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  📊 [1] 查看磁盘状态"
    echo "  🔍 [2] 模拟清理 (dry-run)"
    echo "  🧹 [3] 执行P0快速清理"
    echo "  🧹 [4] 执行P1深度清理"
    echo "  🚀 [5] 启动监控服务"
    echo "  🛑 [6] 停止监控服务"
    echo "  📜 [7] 查看清理日志"
    echo "  ⚙️  [8] 编辑清理规则"
    echo "  ❓ [9] 查看帮助"
    echo "  🚪 [0] 退出"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

get_choice() {
    echo -n "请选择操作 [0-9]: "
    read -r choice
    echo ""
}

view_status() {
    echo -e "${BLUE}正在获取磁盘状态...${NC}"
    "$MONITOR_SCRIPT" status
}

dry_run() {
    echo -e "${YELLOW}正在模拟清理，分析可释放空间...${NC}"
    "$MONITOR_SCRIPT" dry-run
}

cleanup_p0() {
    echo -e "${YELLOW}执行P0快速清理...${NC}"
    echo "将清理: node_modules, build目录, 缓存, 7天前日志"
    echo -n "确认执行? (y/N): "
    read -r confirm
    if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
        "$MONITOR_SCRIPT" p0
    else
        echo "已取消"
    fi
}

cleanup_p1() {
    echo -e "${YELLOW}执行P1深度清理...${NC}"
    echo "将清理: P0内容 + 30天临时文件 + 旧压缩包"
    echo -n "确认执行? (y/N): "
    read -r confirm
    if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
        "$MONITOR_SCRIPT" p1
    else
        echo "已取消"
    fi
}

start_monitor() {
    if pgrep -f "disk-monitor.sh start" > /dev/null; then
        echo -e "${YELLOW}监控服务已在运行${NC}"
    else
        echo -e "${GREEN}启动监控服务...${NC}"
        nohup "$MONITOR_SCRIPT" start > /dev/null 2>&1 &
        sleep 1
        if pgrep -f "disk-monitor.sh start" > /dev/null; then
            echo -e "${GREEN}✅ 监控服务已启动${NC}"
            echo "   每分钟自动检查磁盘空间"
            echo "   日志: $LOG_FILE"
        else
            echo -e "${RED}❌ 启动失败${NC}"
        fi
    fi
}

stop_monitor() {
    "$MONITOR_SCRIPT" stop
}

view_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        echo -e "${BLUE}最近20条日志:${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        tail -20 "$LOG_FILE"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "提示: 使用 'tail -f $LOG_FILE' 实时查看"
    else
        echo -e "${YELLOW}日志文件不存在${NC}"
    fi
}

edit_rules() {
    if command -v nano >/dev/null 2>&1; then
        nano "$RULES_FILE"
    elif command -v vim >/dev/null 2>&1; then
        vim "$RULES_FILE"
    else
        echo -e "${YELLOW}请手动编辑: $RULES_FILE${NC}"
    fi
}

show_help() {
    "$MONITOR_SCRIPT" help
}

main() {
    show_header
    
    # 如果是直接传入命令
    if [[ $# -gt 0 ]]; then
        case "$1" in
            status) view_status ;;
            dry-run|test) dry_run ;;
            p0|quick) cleanup_p0 ;;
            p1|deep) cleanup_p1 ;;
            start) start_monitor ;;
            stop) stop_monitor ;;
            log|logs) view_logs ;;
            edit|config) edit_rules ;;
            help) show_help ;;
            *) echo "未知命令: $1"; show_help ;;
        esac
        return
    fi
    
    # 交互模式
    while true; do
        show_menu
        get_choice
        
        case "$choice" in
            1) view_status ;;
            2) dry_run ;;
            3) cleanup_p0 ;;
            4) cleanup_p1 ;;
            5) start_monitor ;;
            6) stop_monitor ;;
            7) view_logs ;;
            8) edit_rules ;;
            9) show_help ;;
            0) 
                echo -e "${GREEN}再见! 👋${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}无效选择，请重试${NC}"
                ;;
        esac
        
        echo ""
        echo "按回车键继续..."
        read -r
    done
}

main "$@"
