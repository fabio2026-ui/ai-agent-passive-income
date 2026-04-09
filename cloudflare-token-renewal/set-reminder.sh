#!/bin/bash
# Cloudflare Token 到期提醒设置脚本
# 支持: Telegram通知、本地提醒

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"
RENEWAL_DIR="$WORKSPACE_DIR/cloudflare-token-renewal"

# 配置
TOKEN_DEADLINE="2026-03-27"
WARNING_DAYS_BEFORE=(14 7 3 1)  # 提前提醒天数

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查日期并提醒
check_and_remind() {
    local deadline_ts=$(date -d "$TOKEN_DEADLINE" +%s)
    local now_ts=$(date +%s)
    local days_remaining=$(( (deadline_ts - now_ts) / 86400 ))
    
    print_info "Token续期截止: $TOKEN_DEADLINE"
    print_info "距离截止还有: $days_remaining 天"
    
    local should_remind=false
    local urgency="normal"
    
    for days in "${WARNING_DAYS_BEFORE[@]}"; do
        if [ "$days_remaining" -eq "$days" ]; then
            should_remind=true
            if [ "$days" -le 3 ]; then
                urgency="urgent"
            elif [ "$days" -le 7 ]; then
                urgency="high"
            fi
            break
        fi
    done
    
    # 如果已经过期
    if [ "$days_remaining" -lt 0 ]; then
        should_remind=true
        urgency="critical"
        print_error "⚠️  Token已过期 $((days_remaining * -1)) 天!"
    fi
    
    # 如果在最后3天内
    if [ "$days_remaining" -ge 0 ] && [ "$days_remaining" -le 3 ]; then
        should_remind=true
        urgency="critical"
        print_error "⚠️  Token即将过期，只剩 $days_remaining 天!"
    fi
    
    if [ "$should_remind" = true ]; then
        generate_reminder "$days_remaining" "$urgency"
    else
        print_success "今天不需要发送提醒，距离截止还有 $days_remaining 天"
    fi
}

# 生成提醒消息
generate_reminder() {
    local days=$1
    local urgency=$2
    local emoji="⏰"
    local title="Cloudflare Token续期提醒"
    
    case "$urgency" in
        critical)
            emoji="🚨"
            title="🔴 URGENT: Cloudflare Token续期紧急提醒"
            ;;
        urgent)
            emoji="⚠️"
            title="🟠 WARNING: Cloudflare Token续期提醒"
            ;;
        high)
            emoji="📢"
            title="🟡 Cloudflare Token续期提醒"
            ;;
    esac
    
    local message="$emoji $title

📅 续期截止日期: $TOKEN_DEADLINE
⏳ 剩余时间: $days 天

请按照以下步骤完成续期:

1️⃣ 备份当前配置
2️⃣ 登录 Cloudflare Dashboard 创建新Token
3️⃣ 更新所有服务配置
4️⃣ 验证服务正常运行
5️⃣ 删除旧Token

详细指南: cloudflare-token-renewal/README.md
运行检查: ./cloudflare-token-renewal/cloudflare-token-renewal.sh check"

    # 保存到文件
    echo "$message" > "$RENEWAL_DIR/daily-reminder.txt"
    
    print_success "提醒已生成: $RENEWAL_DIR/daily-reminder.txt"
    
    echo ""
    echo "========== 提醒内容 =========="
    echo "$message"
    echo "=============================="
    
    # 尝试发送Telegram通知
    send_telegram_notification "$message"
}

# 发送Telegram通知 (如果配置了)
send_telegram_notification() {
    local message="$1"
    
    # 检查是否有Telegram Bot配置
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
        print_info "尝试发送Telegram通知..."
        
        local response=$(curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
            -d "chat_id=$TELEGRAM_CHAT_ID" \
            -d "text=$message" \
            -d "parse_mode=Markdown" 2>/dev/null || echo '{"ok":false}')
        
        if echo "$response" | grep -q '"ok":true'; then
            print_success "Telegram通知已发送"
        else
            print_warning "Telegram通知发送失败"
        fi
    else
        print_info "未配置Telegram Bot (设置 TELEGRAM_BOT_TOKEN 和 TELEGRAM_CHAT_ID 环境变量以启用)"
    fi
}

# 设置定时提醒 (使用cron)
setup_cron_reminder() {
    print_info "设置每日检查提醒 (cron)..."
    
    local script_path="$SCRIPT_DIR/set-reminder.sh"
    local cron_entry="0 9 * * * $script_path --check >> $RENEWAL_DIR/cron.log 2>&1"
    
    # 检查是否已存在
    if crontab -l 2>/dev/null | grep -q "$script_path"; then
        print_warning "定时任务已存在"
        return 0
    fi
    
    # 添加到crontab
    (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
    
    print_success "定时任务已设置: 每天上午9点检查Token状态"
    print_info "查看所有定时任务: crontab -l"
}

# 移除定时提醒
remove_cron_reminder() {
    print_info "移除定时提醒..."
    
    local script_path="$SCRIPT_DIR/set-reminder.sh"
    
    crontab -l 2>/dev/null | grep -v "$script_path" | crontab -
    
    print_success "定时提醒已移除"
}

# 创建系统日历事件 (如果支持)
create_calendar_event() {
    print_info "尝试创建日历提醒..."
    
    # Linux桌面环境检测
    if command -v gio &> /dev/null; then
        # GNOME
        print_info "检测到GNOME桌面环境"
        print_warning "请手动创建日历事件: $TOKEN_DEADLINE - Cloudflare Token续期"
    elif command -v kdialog &> /dev/null; then
        # KDE
        print_info "检测到KDE桌面环境"
        print_warning "请手动创建日历事件: $TOKEN_DEADLINE - Cloudflare Token续期"
    else
        print_info "无法自动创建日历事件，请手动设置"
    fi
    
    # 创建提醒文件
    cat > "$RENEWAL_DIR/calendar-reminder.ics" << EOF
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cloudflare Token Renewal//EN
BEGIN:VEVENT
DTSTART:$TOKEN_DEADLINE
DTEND:$TOKEN_DEADLINE
SUMMARY:Cloudflare Token续期截止
DESCRIPTION:请在今天之前完成Cloudflare API Token续期。详细步骤请参考cloudflare-token-renewal/README.md
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Token续期提醒
TRIGGER:-P7D
END:VALARM
END:VEVENT
END:VCALENDAR
EOF

    print_success "日历事件文件已创建: $RENEWAL_DIR/calendar-reminder.ics"
    print_info "可导入到Google Calendar/Outlook等日历应用"
}

# 显示帮助
show_help() {
    echo "Cloudflare Token 到期提醒设置脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --check          检查并生成提醒 (默认)"
    echo "  --setup-cron     设置每日自动检查"
    echo "  --remove-cron    移除自动检查"
    echo "  --calendar       创建日历提醒文件"
    echo "  --all            执行所有设置"
    echo "  --help           显示帮助"
    echo ""
    echo "环境变量:"
    echo "  TELEGRAM_BOT_TOKEN    Telegram Bot Token (可选)"
    echo "  TELEGRAM_CHAT_ID      Telegram Chat ID (可选)"
}

# 主函数
main() {
    local command="${1:---check}"
    
    case "$command" in
        --check)
            check_and_remind
            ;;
        --setup-cron)
            setup_cron_reminder
            ;;
        --remove-cron)
            remove_cron_reminder
            ;;
        --calendar)
            create_calendar_event
            ;;
        --all)
            setup_cron_reminder
            create_calendar_event
            check_and_remind
            ;;
        --help|-h)
            show_help
            ;;
        *)
            print_error "未知选项: $command"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
