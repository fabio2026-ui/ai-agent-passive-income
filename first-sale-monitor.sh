#!/bin/bash
# Stripe首单自动监控系统 - 每分钟运行
# 邮件通知: ai_67dd6c1a002c@sharebot.net
# 创建时间: 2026-03-21 17:14

SCRIPT_DIR="/root/.openclaw/workspace"
LOG_FILE="$SCRIPT_DIR/logs/first-sale-monitor.log"
STATE_FILE="$SCRIPT_DIR/first-sale-state.json"
LOCK_FILE="/tmp/first-sale-monitor.lock"

# 邮件配置
NOTIFICATION_EMAIL="ai_67dd6c1a002c@sharebot.net"

# 防止重复运行
if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE" 2>/dev/null)
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "[$(date)] 监控脚本已在运行，PID: $PID" >> "$LOG_FILE"
        exit 0
    fi
fi
echo $$ > "$LOCK_FILE"

# 确保日志目录存在
mkdir -p "$SCRIPT_DIR/logs"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "===== 开始检查Stripe付款 ====="

# 从stripe-config.json读取配置
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-}"

# 如果环境变量没有设置，尝试从其他位置读取
if [ -z "$STRIPE_SECRET_KEY" ]; then
    # 尝试读取配置
    if [ -f "$SCRIPT_DIR/.stripe-secret" ]; then
        STRIPE_SECRET_KEY=$(cat "$SCRIPT_DIR/.stripe-secret" 2>/dev/null)
    fi
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    log "❌ 错误: STRIPE_SECRET_KEY 未设置"
    rm -f "$LOCK_FILE"
    exit 1
fi

# 初始化状态文件
if [ ! -f "$STATE_FILE" ]; then
    echo '{"first_sale_detected": false, "check_count": 0, "last_check": "", "sales": []}' > "$STATE_FILE"
fi

# 读取当前状态
FIRST_SALE_DETECTED=$(cat "$STATE_FILE" | grep -o '"first_sale_detected": true' | wc -l)

# 如果已检测到首单，只记录日志不重复通知
if [ "$FIRST_SALE_DETECTED" -gt 0 ]; then
    log "首单已检测到，跳过检查"
    rm -f "$LOCK_FILE"
    exit 0
fi

# 检查Stripe付款 - 使用charges API
CHARGES_RESPONSE=$(curl -s -X GET "https://api.stripe.com/v1/charges?limit=10" \
    -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
    -H "Stripe-Version: 2023-10-16" 2>/dev/null)

# 检查是否有付款
CHARGES_COUNT=$(echo "$CHARGES_RESPONSE" | grep -o '"has_more"' | wc -l)
HAS_CHARGES=$(echo "$CHARGES_RESPONSE" | grep -o '"data": \[' | head -1)

# 更新检查次数
CURRENT_COUNT=$(cat "$STATE_FILE" | grep -o '"check_count": [0-9]*' | grep -o '[0-9]*')
NEW_COUNT=$((CURRENT_COUNT + 1))

# 保存检查时间
TEMP_STATE=$(cat "$STATE_FILE" | sed "s/\"check_count\": [0-9]*/\"check_count\": $NEW_COUNT/" | sed "s/\"last_check\": \"[^\"]*\"/\"last_check\": \"$(date -Iseconds)\"/")
echo "$TEMP_STATE" > "$STATE_FILE"

log "第 $NEW_COUNT 次检查完成"

# 分析charges响应
if echo "$CHARGES_RESPONSE" | grep -q '"id": "ch_'; then
    # 有付款数据
    FIRST_CHARGE=$(echo "$CHARGES_RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if data.get('data') and len(data['data']) > 0:
    charge = data['data'][0]
    print(json.dumps({
        'id': charge.get('id'),
        'amount': charge.get('amount'),
        'currency': charge.get('currency'),
        'status': charge.get('status'),
        'created': charge.get('created'),
        'description': charge.get('description', ''),
        'customer': charge.get('receipt_email', 'anonymous')
    }))
" 2>/dev/null)

    if [ ! -z "$FIRST_CHARGE" ]; then
        # 解析付款信息
        CHARGE_ID=$(echo "$FIRST_CHARGE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('id','unknown'))")
        AMOUNT=$(echo "$FIRST_CHARGE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('amount',0))")
        CURRENCY=$(echo "$FIRST_CHARGE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('currency','usd'))")
        STATUS=$(echo "$FIRST_CHARGE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('status','unknown'))")
        CREATED=$(echo "$FIRST_CHARGE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('created',0))")
        CUSTOMER=$(echo "$FIRST_CHARGE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('customer','anonymous'))")
        
        # 转换金额（Stripe以分为单位）
        AMOUNT_DECIMAL=$(echo "scale=2; $AMOUNT / 100" | bc 2>/dev/null || echo "$AMOUNT")
        
        # 转换时间戳
        CREATED_DATE=$(date -d "@$CREATED" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || date -r "$CREATED" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "unknown")
        
        log "🎉 检测到付款! ID: $CHARGE_ID, 金额: $AMOUNT_DECIMAL $CURRENCY"
        
        # 保存首单信息
        cat > "$STATE_FILE" << EOF
{
    "first_sale_detected": true,
    "detected_at": "$(date -Iseconds)",
    "check_count": $NEW_COUNT,
    "first_sale": {
        "charge_id": "$CHARGE_ID",
        "amount": "$AMOUNT_DECIMAL",
        "currency": "$CURRENCY",
        "status": "$STATUS",
        "created_timestamp": $CREATED,
        "created_date": "$CREATED_DATE",
        "customer": "$CUSTOMER"
    },
    "sales": [{"id": "$CHARGE_ID", "amount": "$AMOUNT_DECIMAL", "currency": "$CURRENCY", "date": "$CREATED_DATE"}]
}
EOF
        
        # 创建通知内容
        NOTIFICATION_MSG="🎉 第一单到账！

项目: Stripe收款
金额: $AMOUNT_DECIMAL $CURRENCY
时间: $CREATED_DATE
客户: $CUSTOMER
付款ID: $CHARGE_ID
状态: $STATUS

检测时间: $(date '+%Y-%m-%d %H:%M:%S')
检查次数: $NEW_COUNT

---
这是您的首单自动通知系统"
        
        # 记录到日志
        log "$NOTIFICATION_MSG"
        
        # 发送邮件通知 (使用mail命令)
        echo "$NOTIFICATION_MSG" | mail -s "🎉 Stripe首单到账通知 - $AMOUNT_DECIMAL $CURRENCY" "$NOTIFICATION_EMAIL" 2>/dev/null || {
            # 如果mail命令失败，使用sendmail
            echo -e "Subject: 🎉 Stripe首单到账通知 - $AMOUNT_DECIMAL $CURRENCY\nTo: $NOTIFICATION_EMAIL\n\n$NOTIFICATION_MSG" | sendmail "$NOTIFICATION_EMAIL" 2>/dev/null || {
                log "⚠️ 邮件发送失败，尝试其他方式..."
            }
        }
        
        # 发送系统通知（如果可用）
        if command -v notify-send >/dev/null 2>&1; then
            notify-send "🎉 Stripe首单到账!" "$AMOUNT_DECIMAL $CURRENCY" 2>/dev/null || true
        fi
        
        # 创建首单庆祝文件
        cat > "$SCRIPT_DIR/FIRST-SALE-CELEBRATION.txt" << EOF
╔═══════════════════════════════════════════╗
║                                           ║
║   🎉🎉🎉 恭喜！您的首单已到账！ 🎉🎉🎉    ║
║                                           ║
╚═══════════════════════════════════════════╝

首单详情:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 付款ID:    $CHARGE_ID
💰 金额:      $AMOUNT_DECIMAL $CURRENCY
📅 时间:      $CREATED_DATE
👤 客户:      $CUSTOMER
✅ 状态:      $STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

检测统计:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 总检查次数: $NEW_COUNT
⏰ 首次检测:   $(date '+%Y-%m-%d %H:%M:%S')
📧 通知邮箱:   $NOTIFICATION_EMAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

里程碑达成！继续加油！💪

EOF
        
        log "✅ 首单通知已发送到 $NOTIFICATION_EMAIL"
    fi
else
    log "暂无新付款 (第 $NEW_COUNT 次检查)"
fi

# 清理锁文件
rm -f "$LOCK_FILE"

log "===== 检查完成 ====="
exit 0
