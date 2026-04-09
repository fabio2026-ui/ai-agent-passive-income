#!/bin/bash

# 智能磁盘清理系统 - 监控主脚本
# disk-monitor.sh - 监控磁盘空间并触发清理

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RULES_FILE="${SCRIPT_DIR}/cleanup-rules.json"
LOG_FILE="${SCRIPT_DIR}/cleanup.log"
CLEANUP_SCRIPT="${SCRIPT_DIR}/safe-cleanup.sh"
PID_FILE="${SCRIPT_DIR}/monitor.pid"

# 阈值配置
WARNING_THRESHOLD=70
AUTO_CLEANUP_THRESHOLD=80
EMERGENCY_THRESHOLD=90

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 状态跟踪
LAST_STATUS=""
LAST_CLEANUP_TIME=0
CLEANUP_COOLDOWN=300  # 5分钟冷却

# 日志函数
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" >> "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[MONITOR]${NC} $1" >&2
    log "INFO" "$1"
}

log_warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1" >&2
    log "WARN" "$1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    log "ERROR" "$1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
    log "SUCCESS" "$1"
}

# 获取磁盘使用率
get_disk_usage() {
    df -h / | awk 'NR==2 {gsub(/%/,""); print $5}'
}

# 获取磁盘可用空间
get_disk_available() {
    df -h / | awk 'NR==2 {print $4}'
}

# 获取磁盘总空间
get_disk_total() {
    df -h / | awk 'NR==2 {print $2}'
}

# 获取磁盘已用空间
get_disk_used() {
    df -h / | awk 'NR==2 {print $3}'
}

# 发送通知
send_notification() {
    local level="$1"
    local message="$2"
    
    log_info "[通知] [$level] $message"
    
    # 控制台通知
    case "$level" in
        "WARNING")
            echo -e "${YELLOW}⚠️  磁盘空间警告${NC}"
            ;;
        "AUTO_CLEANUP")
            echo -e "${PURPLE}🧹 自动清理已触发${NC}"
            ;;
        "EMERGENCY")
            echo -e "${RED}🚨 紧急清理！磁盘空间严重不足！${NC}"
            ;;
        "INFO")
            echo -e "${GREEN}ℹ️  $message${NC}"
            ;;
    esac
    
    echo -e "   消息: $message"
    
    # 如果系统支持，尝试桌面通知
    if command -v notify-send &>/dev/null; then
        notify-send "磁盘清理系统" "$message" --urgency=normal 2>/dev/null || true
    fi
}

# 检查冷却时间
check_cooldown() {
    local current_time=$(date +%s)
    local time_since_last_cleanup=$((current_time - LAST_CLEANUP_TIME))
    
    if [[ $time_since_last_cleanup -lt $CLEANUP_COOLDOWN ]]; then
        local remaining=$((CLEANUP_COOLDOWN - time_since_last_cleanup))
        log_info "清理冷却中，还需 ${remaining} 秒"
        return 1
    fi
    
    return 0
}

# 执行清理
execute_cleanup() {
    local priority="$1"
    local dry_run="${2:-false}"
    
    if [[ "$dry_run" != "true" ]]; then
        LAST_CLEANUP_TIME=$(date +%s)
    fi
    
    log_info "执行 $priority 级别清理..."
    
    if [[ ! -x "$CLEANUP_SCRIPT" ]]; then
        chmod +x "$CLEANUP_SCRIPT"
    fi
    
    local freed_mb
    freed_mb=$($CLEANUP_SCRIPT "$priority" "$dry_run")
    
    if [[ "$dry_run" == "true" ]]; then
        send_notification "INFO" "模拟清理完成，预计释放 ${freed_mb}MB"
    else
        send_notification "INFO" "清理完成，实际释放 ${freed_mb}MB"
    fi
    
    echo "$freed_mb"
}

# 警告级别处理
handle_warning() {
    local usage="$1"
    
    if [[ "$LAST_STATUS" != "WARNING" ]]; then
        send_notification "WARNING" "磁盘使用率达到 ${usage}%，建议关注"
        LAST_STATUS="WARNING"
    fi
}

# 自动清理级别处理
handle_auto_cleanup() {
    local usage="$1"
    
    send_notification "AUTO_CLEANUP" "磁盘使用率达到 ${usage}%，开始自动清理"
    
    # 先执行P0清理
    local freed_p0=$(execute_cleanup "P0" "false")
    
    # 检查是否还需要P1清理
    sleep 2
    local new_usage=$(get_disk_usage)
    
    if [[ $new_usage -ge $AUTO_CLEANUP_THRESHOLD ]]; then
        log_warn "P0清理后使用率仍为 ${new_usage}%，执行P1清理"
        local freed_p1=$(execute_cleanup "P1" "false")
    fi
    
    LAST_STATUS="AUTO_CLEANUP"
}

# 紧急清理级别处理
handle_emergency() {
    local usage="$1"
    
    send_notification "EMERGENCY" "磁盘使用率达到 ${usage}%！执行紧急清理！"
    
    # 执行P0+P1清理
    local freed_p0=$(execute_cleanup "P0" "false")
    sleep 1
    local freed_p1=$(execute_cleanup "P1" "false")
    
    local total_freed=$((freed_p0 + freed_p1))
    
    # 再次检查
    sleep 2
    local new_usage=$(get_disk_usage)
    
    if [[ $new_usage -ge $EMERGENCY_THRESHOLD ]]; then
        log_error "紧急清理后使用率仍为 ${new_usage}%，需要人工介入！"
        send_notification "EMERGENCY" "紧急清理后仍为 ${new_usage}%，需要人工介入！"
    else
        send_notification "INFO" "紧急清理完成，释放 ${total_freed}MB，当前使用率 ${new_usage}%"
    fi
    
    LAST_STATUS="EMERGENCY"
}

# 检查磁盘状态
check_disk_status() {
    local usage=$(get_disk_usage)
    local available=$(get_disk_available)
    local total=$(get_disk_total)
    local used=$(get_disk_used)
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📊 磁盘状态检查${NC} ($(date '+%Y-%m-%d %H:%M:%S'))"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "   总空间: $total"
    echo "   已用:   $used (${usage}%)"
    echo "   可用:   $available"
    echo ""
    
    # 检查阈值
    if [[ $usage -ge $EMERGENCY_THRESHOLD ]]; then
        echo -e "   状态: ${RED}🚨 紧急${NC}"
        handle_emergency "$usage"
    elif [[ $usage -ge $AUTO_CLEANUP_THRESHOLD ]]; then
        echo -e "   状态: ${PURPLE}⚡ 自动清理${NC}"
        if check_cooldown; then
            handle_auto_cleanup "$usage"
        fi
    elif [[ $usage -ge $WARNING_THRESHOLD ]]; then
        echo -e "   状态: ${YELLOW}⚠️  警告${NC}"
        handle_warning "$usage"
    else
        echo -e "   状态: ${GREEN}✅ 正常${NC}"
        if [[ "$LAST_STATUS" != "OK" && -n "$LAST_STATUS" ]]; then
            send_notification "INFO" "磁盘空间已恢复正常 (${usage}%)"
        fi
        LAST_STATUS="OK"
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# 显示状态
show_status() {
    local usage=$(get_disk_usage)
    local available=$(get_disk_available)
    local total=$(get_disk_total)
    local used=$(get_disk_used)
    
    echo ""
    echo "╔════════════════════════════════════════════════╗"
    echo "║         🧹 智能磁盘清理系统 状态报告           ║"
    echo "╠════════════════════════════════════════════════╣"
    echo "║                                                ║"
    echo "║  📊 磁盘信息                                   ║"
    echo "║     总空间: $(printf '%-20s' "$total")          ║"
    echo "║     已用:   $(printf '%-20s' "$used")          ║"
    echo "║     可用:   $(printf '%-20s' "$available")          ║"
    echo "║     使用率: $(printf '%-20s' "${usage}%")          ║"
    echo "║                                                ║"
    echo "║  🎯 阈值设置                                   ║"
    echo "║     警告:     ${WARNING_THRESHOLD}%                              ║"
    echo "║     自动清理: ${AUTO_CLEANUP_THRESHOLD}%                              ║"
    echo "║     紧急:     ${EMERGENCY_THRESHOLD}%                              ║"
    echo "║                                                ║"
    echo "║  📈 当前状态                                   ║"
    if [[ $usage -ge $EMERGENCY_THRESHOLD ]]; then
    echo "║     🚨 紧急 - 需要立即处理                     ║"
    elif [[ $usage -ge $AUTO_CLEANUP_THRESHOLD ]]; then
    echo "║     ⚡ 自动清理 - 正在清理中                   ║"
    elif [[ $usage -ge $WARNING_THRESHOLD ]]; then
    echo "║     ⚠️  警告 - 建议关注                        ║"
    else
    echo "║     ✅ 正常 - 一切良好                         ║"
    fi
    echo "║                                                ║"
    echo "║  📝 日志文件: ./cleanup.log                    ║"
    echo "╚════════════════════════════════════════════════╝"
    echo ""
}

# 模拟运行
dry_run() {
    log_info "========== 模拟运行模式 =========="
    
    echo ""
    echo "🧪 模拟 P0 级别清理..."
    local freed_p0=$(execute_cleanup "P0" "true")
    
    echo ""
    echo "🧪 模拟 P1 级别清理..."
    local freed_p1=$(execute_cleanup "P1" "true")
    
    local total=$((freed_p0 + freed_p1))
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 模拟结果：预计可释放 ${total}MB 空间"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# 单次检查模式
single_check() {
    check_disk_status
}

# 监控循环
monitor_loop() {
    log_info "========== 磁盘监控服务启动 =========="
    log_info "PID: $$, 日志: $LOG_FILE"
    
    # 保存PID
    echo $$ > "$PID_FILE"
    
    # 清理退出
    trap 'log_info "监控服务停止"; rm -f "$PID_FILE"; exit 0' EXIT TERM INT
    
    while true; do
        check_disk_status
        sleep 60  # 每分钟检查一次
    done
}

# 停止监控
stop_monitor() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            rm -f "$PID_FILE"
            log_success "监控服务已停止 (PID: $pid)"
        else
            log_warn "监控服务未运行"
            rm -f "$PID_FILE"
        fi
    else
        log_warn "PID文件不存在，服务可能未运行"
    fi
}

# 显示帮助
show_help() {
    echo ""
    echo "🧹 智能磁盘清理系统"
    echo ""
    echo "用法: ./disk-monitor.sh [命令]"
    echo ""
    echo "命令:"
    echo "  status      显示当前磁盘状态和系统信息"
    echo "  check       执行单次磁盘检查"
    echo "  start       启动持续监控服务 (每分钟检查)"
    echo "  stop        停止监控服务"
    echo "  dry-run     模拟清理，显示可释放的空间"
    echo "  cleanup     立即执行清理"
    echo "  p0          仅执行P0级别清理"
    echo "  p1          执行P0+P1级别清理"
    echo "  help        显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./disk-monitor.sh status     # 查看状态"
    echo "  ./disk-monitor.sh dry-run    # 模拟清理"
    echo "  ./disk-monitor.sh start      # 启动监控"
    echo ""
}

# 主函数
main() {
    local command="${1:-status}"
    
    # 确保脚本可执行
    chmod +x "$CLEANUP_SCRIPT" 2>/dev/null || true
    
    case "$command" in
        status)
            show_status
            ;;
        check)
            single_check
            ;;
        start)
            monitor_loop
            ;;
        stop)
            stop_monitor
            ;;
        dry-run|dryrun|test)
            dry_run
            ;;
        cleanup|clean)
            check_cooldown && execute_cleanup "P1" "false"
            ;;
        p0)
            execute_cleanup "P0" "false"
            ;;
        p1)
            execute_cleanup "P1" "false"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
