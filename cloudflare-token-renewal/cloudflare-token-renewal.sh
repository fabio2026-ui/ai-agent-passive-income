#!/bin/bash
# Cloudflare API Token 续期管理脚本
# 用法: ./cloudflare-token-renewal.sh [check|info|verify|reminder]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"
RENEWAL_DIR="$WORKSPACE_DIR/cloudflare-token-renewal"
DATA_FILE="$RENEWAL_DIR/token-data.json"
LOG_FILE="$RENEWAL_DIR/renewal.log"

# Token过期提醒阈值(天)
WARNING_DAYS=14
CRITICAL_DAYS=3

# 续期截止日期
DEADLINE="2026-03-27"

# 检查依赖
check_dependencies() {
    local missing=()
    
    if ! command -v curl &> /dev/null; then
        missing+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing+=("jq")
    fi
    
    if ! command -v date &> /dev/null; then
        missing+=("coreutils/date")
    fi
    
    if [ ${#missing[@]} -ne 0 ]; then
        echo -e "${RED}错误: 缺少以下依赖: ${missing[*]}${NC}"
        echo "请安装缺失的依赖后重试"
        exit 1
    fi
}

# 日志函数
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# 输出带颜色的消息
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

# 检查环境变量
check_env() {
    if [ -z "$CF_API_TOKEN" ]; then
        # 尝试从.env文件加载
        if [ -f "$WORKSPACE_DIR/.env" ]; then
            source "$WORKSPACE_DIR/.env" 2>/dev/null || true
        fi
        
        # 再次检查
        if [ -z "$CF_API_TOKEN" ]; then
            print_error "未设置 CF_API_TOKEN 环境变量"
            echo "请设置环境变量: export CF_API_TOKEN='your-token-here'"
            echo "或创建 $WORKSPACE_DIR/.env 文件并添加: CF_API_TOKEN=your-token-here"
            exit 1
        fi
    fi
}

# 验证Token
verify_token() {
    local token="$1"
    local response
    
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" 2>/dev/null)
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        echo "true"
    else
        echo "false"
    fi
}

# 获取Token信息
get_token_info() {
    local token="$1"
    local response
    
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" 2>/dev/null)
    
    echo "$response"
}

# 获取Token详情
get_token_details() {
    local token_id="$1"
    local token="$2"
    local response
    
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/$token_id" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" 2>/dev/null)
    
    echo "$response"
}

# 计算剩余天数
calculate_days_remaining() {
    local expires_on="$1"
    local now=$(date +%s)
    local expires=$(date -d "$expires_on" +%s 2>/dev/null || echo "0")
    
    if [ "$expires" -eq 0 ]; then
        echo "unknown"
        return
    fi
    
    local diff=$(( (expires - now) / 86400 ))
    echo "$diff"
}

# 检查Token状态
check_token() {
    print_info "正在检查 Cloudflare Token 状态..."
    
    # 验证Token有效性
    local is_valid=$(verify_token "$CF_API_TOKEN")
    
    if [ "$is_valid" != "true" ]; then
        print_error "当前Token无效或已过期!"
        log "ERROR" "Token validation failed"
        
        echo ""
        echo "⚠️  紧急处理步骤:"
        echo "1. 立即登录 Cloudflare Dashboard: https://dash.cloudflare.com/profile/api-tokens"
        echo "2. 检查Token状态并创建新Token"
        echo "3. 更新所有服务配置"
        echo ""
        
        return 1
    fi
    
    print_success "Token有效"
    log "INFO" "Token is valid"
    
    # 获取所有Token列表
    local tokens_info=$(get_token_info "$CF_API_TOKEN")
    
    if ! echo "$tokens_info" | jq -e '.success' > /dev/null 2>&1; then
        print_warning "无法获取Token列表，但当前Token可用"
        log "WARNING" "Failed to get token list"
        return 0
    fi
    
    echo ""
    echo "=== Token 列表 ==="
    echo ""
    
    # 解析并显示Token信息
    echo "$tokens_info" | jq -r '.result[] | select(.status == "active") | "\(.id) | \(.name) | 过期: \(.expires_on // \"永不\")"' | 
    while IFS='|' read -r id name expires; do
        local token_id=$(echo "$id" | xargs)
        local token_name=$(echo "$name" | xargs)
        local expires_on=$(echo "$expires" | xargs | sed 's/过期: //')
        
        if [ "$expires_on" != "永不" ] && [ -n "$expires_on" ]; then
            local days=$(calculate_days_remaining "$expires_on")
            
            if [ "$days" = "unknown" ]; then
                printf "%-40s %-30s %s\n" "$token_id" "$token_name" "过期: $expires_on"
            elif [ "$days" -le 0 ]; then
                printf "${RED}%-40s${NC} %-30s ${RED}%s${NC}\n" "$token_id" "$token_name" "⚠️ 已过期!"
            elif [ "$days" -le "$CRITICAL_DAYS" ]; then
                printf "${RED}%-40s${NC} %-30s ${RED}%s${NC}\n" "$token_id" "$token_name" "⚠️ 剩余 ${days}天"
            elif [ "$days" -le "$WARNING_DAYS" ]; then
                printf "${YELLOW}%-40s${NC} %-30s ${YELLOW}%s${NC}\n" "$token_id" "$token_name" "⚠️ 剩余 ${days}天"
            else
                printf "${GREEN}%-40s${NC} %-30s ${GREEN}%s${NC}\n" "$token_id" "$token_name" "✓ 剩余 ${days}天"
            fi
        else
            printf "${GREEN}%-40s${NC} %-30s ${GREEN}%s${NC}\n" "$token_id" "$token_name" "✓ 永不过期"
        fi
    done
    
    echo ""
    
    # 检查续期截止日期
    local deadline_ts=$(date -d "$DEADLINE" +%s)
    local now_ts=$(date +%s)
    local days_to_deadline=$(( (deadline_ts - now_ts) / 86400 ))
    
    echo "=== 续期计划 ==="
    echo "续期截止日期: $DEADLINE"
    echo "距离截止还有: $days_to_deadline 天"
    
    if [ "$days_to_deadline" -le 3 ]; then
        print_error "⚠️  距离续期截止只剩 $days_to_deadline 天，请立即执行续期!"
    elif [ "$days_to_deadline" -le 7 ]; then
        print_warning "⚠️  距离续期截止还有 $days_to_deadline 天，请尽快安排续期"
    else
        print_success "距离续期截止还有 $days_to_deadline 天，时间充足"
    fi
    
    log "INFO" "Check completed. Days to deadline: $days_to_deadline"
}

# 显示Token详细信息
show_token_info() {
    print_info "获取Token详细信息..."
    
    local is_valid=$(verify_token "$CF_API_TOKEN")
    
    if [ "$is_valid" != "true" ]; then
        print_error "Token无效"
        return 1
    fi
    
    # 获取当前Token的详细信息
    local verify_response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json")
    
    echo ""
    echo "=== 当前Token验证信息 ==="
    echo "$verify_response" | jq '.'
    
    # 获取用户所有Token
    echo ""
    echo "=== 所有Token列表 ==="
    local tokens_info=$(get_token_info "$CF_API_TOKEN")
    echo "$tokens_info" | jq '.result[] | {id: .id, name: .name, status: .status, expires_on: (.expires_on // "never"), issued_on: .issued_on}'
}

# 发送续期提醒
send_reminder() {
    print_info "生成续期提醒..."
    
    local reminder_file="$RENEWAL_DIR/REMINDER.txt"
    
    cat > "$reminder_file" << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║              Cloudflare Token 续期提醒                          ║
╚════════════════════════════════════════════════════════════════╝

📅 续期截止日期: 2026-03-27
🕐 提醒生成时间: TIMESTAMP

请按照以下步骤完成Token续期:

1. 【准备】备份当前配置
   - 导出环境变量: env | grep -i cloudflare
   - 备份 .env 文件

2. 【检查】登录 Dashboard 检查当前Token
   https://dash.cloudflare.com/profile/api-tokens

3. 【创建】生成新Token
   - 使用合适的权限模板
   - 设置3-6个月有效期
   - 添加IP白名单(可选但推荐)

4. 【更新】替换所有使用旧Token的服务
   - [ ] 更新环境变量
   - [ ] 更新CI/CD Secrets
   - [ ] 更新Terraform变量
   - [ ] 重启相关服务

5. 【验证】确认服务正常运行
   - 运行API测试
   - 检查DNS解析
   - 验证SSL证书

6. 【清理】删除旧Token
   - 确认所有服务正常后删除旧Token

详细步骤请参考: cloudflare-token-renewal/README.md

EOF

    # 替换时间戳
    sed -i "s/TIMESTAMP/$(date '+%Y-%m-%d %H:%M:%S')/" "$reminder_file"
    
    print_success "提醒已保存到: $reminder_file"
    
    # 显示提醒内容
    echo ""
    cat "$reminder_file"
    
    log "INFO" "Reminder generated"
}

# 生成Token续期报告
generate_report() {
    local report_file="$RENEWAL_DIR/renewal-report-$(date +%Y%m%d).md"
    
    cat > "$report_file" << EOF
# Cloudflare Token 续期报告

生成时间: $(date '+%Y-%m-%d %H:%M:%S')

## Token状态

EOF

    # 验证Token
    local is_valid=$(verify_token "$CF_API_TOKEN" 2>/dev/null || echo "false")
    
    if [ "$is_valid" = "true" ]; then
        echo "- Token状态: ✅ 有效" >> "$report_file"
        
        # 获取Token信息
        local tokens_info=$(get_token_info "$CF_API_TOKEN" 2>/dev/null || echo '{"result":[]}')
        
        echo "" >> "$report_file"
        echo "## Token列表" >> "$report_file"
        echo "" >> "$report_file"
        
        echo "| Token ID | 名称 | 状态 | 过期时间 | 剩余天数 |" >> "$report_file"
        echo "|----------|------|------|----------|----------|" >> "$report_file"
        
        echo "$tokens_info" | jq -r '.result[] | select(.status == "active") | "\(.id)|\(.name)|\(.status)|\(.expires_on // \"永不\")"' 2>/dev/null | 
        while IFS='|' read -r id name status expires; do
            if [ "$expires" != "永不" ] && [ -n "$expires" ]; then
                local days=$(calculate_days_remaining "$expires")
                if [ "$days" = "unknown" ]; then
                    days="未知"
                fi
                echo "| $id | $name | $status | $expires | $days |" >> "$report_file"
            else
                echo "| $id | $name | $status | $expires | N/A |" >> "$report_file"
            fi
        done
    else
        echo "- Token状态: ❌ 无效或已过期" >> "$report_file"
    fi
    
    echo "" >> "$report_file"
    echo "## 续期计划" >> "$report_file"
    echo "" >> "$report_file"
    echo "- 续期截止日期: $DEADLINE" >> "$report_file"
    echo "- 距离截止天数: $(( ($(date -d "$DEADLINE" +%s) - $(date +%s)) / 86400 ))" >> "$report_file"
    echo "" >> "$report_file"
    echo "## 下一步行动" >> "$report_file"
    echo "" >> "$report_file"
    echo "- [ ] 检查所有Token过期时间" >> "$report_file"
    echo "- [ ] 创建新Token" >> "$report_file"
    echo "- [ ] 更新服务配置" >> "$report_file"
    echo "- [ ] 验证服务状态" >> "$report_file"
    echo "- [ ] 删除旧Token" >> "$report_file"
    
    print_success "报告已生成: $report_file"
}

# 显示帮助信息
show_help() {
    echo "Cloudflare Token 续期管理脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  check       检查Token状态和过期时间 (默认)"
    echo "  info        显示Token详细信息"
    echo "  verify      验证当前Token是否有效"
    echo "  reminder    生成续期提醒文档"
    echo "  report      生成续期状态报告"
    echo "  help        显示帮助信息"
    echo ""
    echo "环境变量:"
    echo "  CF_API_TOKEN    Cloudflare API Token"
    echo ""
    echo "示例:"
    echo "  export CF_API_TOKEN='your-token-here'"
    echo "  $0 check"
    echo "  $0 reminder"
}

# 主函数
main() {
    # 确保目录存在
    mkdir -p "$RENEWAL_DIR"
    touch "$LOG_FILE"
    
    # 检查依赖
    check_dependencies
    
    # 解析命令
    local command="${1:-check}"
    
    case "$command" in
        check)
            check_env
            check_token
            ;;
        info)
            check_env
            show_token_info
            ;;
        verify)
            check_env
            if [ "$(verify_token "$CF_API_TOKEN")" = "true" ]; then
                print_success "Token有效"
                exit 0
            else
                print_error "Token无效"
                exit 1
            fi
            ;;
        reminder)
            send_reminder
            ;;
        report)
            check_env
            generate_report
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
