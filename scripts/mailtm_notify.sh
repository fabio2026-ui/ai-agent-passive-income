#!/bin/bash
# mail.tm 系统通知集成脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAILTM_SCRIPT="${SCRIPT_DIR}/mailtm.sh"

# 检查邮件并发送通知
check_and_notify() {
    local output=$($MAILTM_SCRIPT check 2>&1)
    
    # 如果有新邮件，输出到控制台并记录
    if echo "$output" | grep -q "检测到"; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - $output" >> /tmp/mailtm_notifications.log
        echo "$output"
        return 0
    fi
    
    return 1
}

# 发送测试通知
send_test() {
    echo "📧 Mail.tm 邮箱系统测试通知"
    echo "邮箱地址: ai_67dd6c1a002c@sharebot.net"
    echo "测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
}

case "${1:-check}" in
    check)
        check_and_notify
        ;;
    test)
        send_test
        ;;
    *)
        echo "用法: $0 [check|test]"
        ;;
esac
