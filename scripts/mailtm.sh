#!/bin/bash
# mail.tm 自动邮件检查脚本
# 自动生成于 2026-03-21

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../config/mailtm/credentials.conf"

default() {
    CONFIG_FILE="/root/.openclaw/workspace/config/mailtm/credentials.conf"
}

# 加载配置
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "错误: 配置文件不存在: $CONFIG_FILE"
    exit 1
fi

# 获取邮件列表
fetch_messages() {
    local token="$TOKEN"
    local response=$(curl -s "${API_BASE}/messages" \
        -H "Authorization: Bearer $token" \
        -H "Accept: application/ld+json")
    
    echo "$response"
}

# 获取单封邮件详情
fetch_message_detail() {
    local message_id="$1"
    local token="$TOKEN"
    
    curl -s "${API_BASE}/messages/${message_id}" \
        -H "Authorization: Bearer $token" \
        -H "Accept: application/ld+json"
}

# 删除邮件
delete_message() {
    local message_id="$1"
    local token="$TOKEN"
    
    curl -s -X DELETE "${API_BASE}/messages/${message_id}" \
        -H "Authorization: Bearer $token"
}

# 检查新邮件并通知
check_and_notify() {
    local messages=$(fetch_messages)
    local total=$(echo "$messages" | jq -r '.["hydra:totalItems"] // 0')
    
    if [ "$total" -gt 0 ]; then
        echo "📧 检测到 $total 封新邮件"
        
        # 遍历邮件并显示
        echo "$messages" | jq -r '.["hydra:member"][] | "\(.id)|\(.from.address)|\(.subject)|\(.intro)"' | while IFS='|' read -r id from subject intro; do
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "发件人: $from"
            echo "主题: $subject"
            echo "预览: $intro"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            
            # 发送到系统通知（如果存在 notify 命令）
            if command -v notify-send &> /dev/null; then
                notify-send "📧 新邮件" "发件人: $from\n主题: $subject" -u normal
            fi
        done
        
        return 0
    else
        echo "📭 暂无新邮件"
        return 1
    fi
}

# 显示帮助
show_help() {
    cat << 'EOF'
mail.tm 自动邮件管理脚本

用法:
  ./mailtm.sh [命令] [参数]

命令:
  check       检查新邮件
  list        列出所有邮件
  read <id>   读取指定邮件
  delete <id> 删除指定邮件
  watch       持续监控新邮件（每30秒）
  token       刷新JWT Token
  help        显示帮助

示例:
  ./mailtm.sh check           # 检查一次
  ./mailtm.sh watch           # 持续监控
  ./mailtm.sh read abc123     # 读取邮件详情
EOF
}

# 刷新Token
refresh_token() {
    local response=$(curl -s -X POST "${API_BASE}/token" \
        -H "Content-Type: application/json" \
        -d "{\"address\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")
    
    local new_token=$(echo "$response" | jq -r '.token // empty')
    
    if [ -n "$new_token" ]; then
        # 更新配置文件
        sed -i "s|^TOKEN=.*|TOKEN=$new_token|" "$CONFIG_FILE"
        echo "✓ Token 已刷新"
    else
        echo "✗ Token 刷新失败"
        echo "$response"
    fi
}

# 持续监控
watch_mode() {
    echo "🔍 开始监控邮件 (每30秒检查一次, 按 Ctrl+C 停止)"
    while true; do
        check_and_notify
        sleep 30
    done
}

# 主程序
case "${1:-check}" in
    check)
        check_and_notify
        ;;
    list)
        fetch_messages | jq '.'
        ;;
    read)
        if [ -z "$2" ]; then
            echo "错误: 请提供邮件ID"
            echo "用法: $0 read <message_id>"
            exit 1
        fi
        fetch_message_detail "$2" | jq '.'
        ;;
    delete)
        if [ -z "$2" ]; then
            echo "错误: 请提供邮件ID"
            echo "用法: $0 delete <message_id>"
            exit 1
        fi
        delete_message "$2"
        echo "✓ 邮件已删除"
        ;;
    watch)
        watch_mode
        ;;
    token)
        refresh_token
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "未知命令: $1"
        show_help
        exit 1
        ;;
esac
