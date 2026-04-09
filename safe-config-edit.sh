#!/bin/bash
# =============================================================================
# Safe Configuration Edit Script
# 配置变更安全系统 - 安全编辑脚本
# =============================================================================
# 功能：
# 1. 配置修改前自动创建备份
# 2. 显示修改前后对比
# 3. 危险配置要求确认
# 4. 渐进式修改 + 自动测试 + 失败回滚
# 5. 完整变更日志记录
# =============================================================================

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-${SCRIPT_DIR}/.config-backups}"
LOG_FILE="${LOG_FILE:-${SCRIPT_DIR}/change-log.md}"
VALIDATOR="${SCRIPT_DIR}/config-validator.py"
EDITOR="${EDITOR:-vi}"
DIFF_TOOL="${DIFF_TOOL:-diff -u}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 危险配置文件模式（需要额外确认）
DANGEROUS_PATTERNS=(
    "*passwd*"
    "*shadow*"
    "*ssh*"
    "*.key"
    "*.pem"
    "*ssl*"
    "*tls*"
    "*credential*"
    "*secret*"
    "*token*"
    "*/etc/nginx/*"
    "*/etc/apache2/*"
    "*/etc/ssh/*"
    "*firewall*"
    "*iptables*"
    "*crontab*"
    "*systemd*"
)

# =============================================================================
# 工具函数
# =============================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 生成时间戳
timestamp() {
    date '+%Y%m%d_%H%M%S'
}

# 获取当前用户信息
get_user_info() {
    echo "$(whoami)@$(hostname) ($(date '+%Y-%m-%d %H:%M:%S'))"
}

# 检查是否为危险配置文件
is_dangerous_config() {
    local file="$1"
    local basename=$(basename "$file")
    
    for pattern in "${DANGEROUS_PATTERNS[@]}"; do
        if [[ "$file" == $pattern ]] || [[ "$basename" == $pattern ]]; then
            return 0
        fi
    done
    return 1
}

# 创建备份目录
init_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
        log_info "创建备份目录: $BACKUP_DIR"
    fi
}

# 创建配置文件备份
create_backup() {
    local original_file="$1"
    local backup_id="$(timestamp)_$(basename "$original_file")"
    local backup_path="${BACKUP_DIR}/${backup_id}"
    
    if [[ -f "$original_file" ]]; then
        cp -p "$original_file" "$backup_path"
        echo "$backup_path"
        return 0
    else
        # 新文件，创建空备份标记
        touch "${backup_path}.NEWFILE"
        echo "${backup_path}.NEWFILE"
        return 0
    fi
}

# 恢复备份
restore_backup() {
    local original_file="$1"
    local backup_path="$2"
    
    log_step "正在恢复备份..."
    if [[ "$backup_path" == *.NEWFILE ]]; then
        # 新创建的文件，直接删除
        rm -f "$original_file"
        log_info "已删除新创建的文件: $original_file"
    else
        cp -p "$backup_path" "$original_file"
        log_info "已从备份恢复: $original_file"
    fi
}

# 显示差异对比
show_diff() {
    local original="$1"
    local modified="$2"
    
    echo ""
    echo "=========================================="
    echo "           配置变更对比"
    echo "=========================================="
    
    if [[ "$original" == *.NEWFILE ]]; then
        echo -e "${GREEN}[新增文件]${NC}"
        cat "$modified"
    else
        $DIFF_TOOL "$original" "$modified" 2>/dev/null || true
    fi
    
    echo "=========================================="
    echo ""
}

# 请求用户确认
confirm() {
    local message="$1"
    local dangerous="${2:-false}"
    
    if [[ "$dangerous" == "true" ]]; then
        echo -e "${RED}⚠️  危险配置警告!${NC}"
        echo -e "${YELLOW}$message${NC}"
        echo -n "请输入 'YES' 确认继续: "
        read -r response
        [[ "$response" == "YES" ]]
    else
        echo -n "$message [y/N]: "
        read -r response
        [[ "$response" =~ ^[Yy]$ ]]
    fi
}

# 记录变更日志
log_change() {
    local action="$1"
    local file="$2"
    local backup_path="$3"
    local reason="${4:-}"
    local result="${5:-success}"
    local details="${6:-}"
    
    local log_entry="
## $(date '+%Y-%m-%d %H:%M:%S') - $action

- **文件**: \`$file\`
- **操作人**: $(whoami)
- **主机**: $(hostname)
- **备份位置**: \`$backup_path\`
- **结果**: $result
"
    
    if [[ -n "$reason" ]]; then
        log_entry="${log_entry}- **变更原因**: $reason
"
    fi
    
    if [[ -n "$details" ]]; then
        log_entry="${log_entry}- **详细信息**: $details
"
    fi
    
    log_entry="${log_entry}
---
"
    
    # 追加到日志文件
    echo "$log_entry" >> "$LOG_FILE"
}

# 显示编辑界面
edit_file() {
    local file="$1"
    $EDITOR "$file"
}

# 验证配置
validate_config() {
    local file="$1"
    local phase="$2"  # pre or post
    
    log_step "[$phase] 验证配置: $file"
    
    if [[ -x "$VALIDATOR" ]]; then
        if "$VALIDATOR" --file="$file" --phase="$phase"; then
            log_info "配置验证通过"
            return 0
        else
            log_error "配置验证失败"
            return 1
        fi
    else
        # 基础语法检查
        if [[ ! -r "$file" ]]; then
            log_error "文件不可读: $file"
            return 1
        fi
        
        # 根据文件类型进行基础验证
        case "$file" in
            *.json)
                if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
                    log_error "JSON 语法错误"
                    return 1
                fi
                ;;
            *.yaml|*.yml)
                if command -v yamllint &> /dev/null; then
                    if ! yamllint -d relaxed "$file" > /dev/null 2>&1; then
                        log_warn "YAML 可能有语法问题"
                    fi
                fi
                ;;
            *.sh)
                if ! bash -n "$file" 2>/dev/null; then
                    log_error "Shell 脚本语法错误"
                    return 1
                fi
                ;;
            *.py)
                if ! python3 -m py_compile "$file" 2>/dev/null; then
                    log_error "Python 语法错误"
                    return 1
                fi
                ;;
        esac
        
        log_info "基础配置验证通过"
        return 0
    fi
}

# 测试配置（在应用修改后）
test_config() {
    local file="$1"
    
    log_step "测试配置..."
    
    # 根据配置文件类型执行不同的测试
    case "$file" in
        *nginx*.conf|*/nginx/*)
            if command -v nginx &> /dev/null; then
                if nginx -t 2>/dev/null; then
                    log_info "Nginx 配置测试通过"
                    return 0
                else
                    log_error "Nginx 配置测试失败"
                    return 1
                fi
            fi
            ;;
        *apache*.conf|*httpd*.conf|*/apache2/*|*/httpd/*)
            if command -v apachectl &> /dev/null; then
                if apachectl configtest 2>/dev/null; then
                    log_info "Apache 配置测试通过"
                    return 0
                else
                    log_error "Apache 配置测试失败"
                    return 1
                fi
            fi
            ;;
        *ssh*config*|*sshd*config*)
            if command -v sshd &> /dev/null; then
                if sshd -t -f "$file" 2>/dev/null; then
                    log_info "SSH 配置测试通过"
                    return 0
                else
                    log_error "SSH 配置测试失败"
                    return 1
                fi
            fi
            ;;
        *.json)
            if python3 -m json.tool "$file" > /dev/null 2>&1; then
                log_info "JSON 格式有效"
                return 0
            else
                log_error "JSON 格式无效"
                return 1
            fi
            ;;
    esac
    
    # 通用测试：文件可读取
    if [[ -r "$file" ]]; then
        log_info "配置文件可读性测试通过"
        return 0
    fi
    
    return 0
}

# =============================================================================
# 主流程
# =============================================================================

show_help() {
    cat << 'EOF'
Safe Configuration Edit - 安全配置编辑工具

用法:
    safe-config-edit.sh [选项] <配置文件路径>

选项:
    -h, --help          显示帮助信息
    -r, --reason        变更原因（用于日志记录）
    -n, --no-backup     不创建备份（危险！不推荐）
    -f, --force         跳过危险配置确认
    --restore <备份ID>  恢复到指定备份
    --list-backups      列出所有备份
    --diff <备份ID>     对比当前文件与备份

示例:
    safe-config-edit.sh /etc/nginx/nginx.conf
    safe-config-edit.sh -r "更新SSL证书" /etc/nginx/nginx.conf
    safe-config-edit.sh --restore 20250321_203600_nginx.conf
    safe-config-edit.sh --list-backups

环境变量:
    BACKUP_DIR          备份目录（默认: ./.config-backups）
    EDITOR              编辑器（默认: vi）
    LOG_FILE            日志文件（默认: ./change-log.md）

EOF
}

list_backups() {
    log_info "可用备份列表:"
    if [[ -d "$BACKUP_DIR" ]]; then
        ls -la "$BACKUP_DIR" | tail -n +4 | awk '{printf "  %s %s %s\n", $6, $7, $9}'
    else
        echo "  暂无备份"
    fi
}

do_restore() {
    local backup_id="$1"
    local backup_path="${BACKUP_DIR}/${backup_id}"
    
    if [[ ! -f "$backup_path" ]]; then
        log_error "备份不存在: $backup_id"
        exit 1
    fi
    
    # 从备份ID中提取原始文件名
    local original_file=$(echo "$backup_id" | sed 's/^[0-9]\{8\}_[0-9]\{6\}_//')
    
    log_warn "即将恢复备份到: $original_file"
    if confirm "确认恢复?"; then
        cp -p "$backup_path" "$original_file"
        log_info "已恢复: $original_file"
        log_change "RESTORE" "$original_file" "$backup_path" "恢复到备份: $backup_id"
    else
        log_info "已取消恢复"
    fi
}

show_backup_diff() {
    local backup_id="$1"
    local backup_path="${BACKUP_DIR}/${backup_id}"
    
    if [[ ! -f "$backup_path" ]]; then
        log_error "备份不存在: $backup_id"
        exit 1
    fi
    
    local original_file=$(echo "$backup_id" | sed 's/^[0-9]\{8\}_[0-9]\{6\}_//')
    
    if [[ -f "$original_file" ]]; then
        show_diff "$backup_path" "$original_file"
    else
        log_error "原始文件不存在: $original_file"
    fi
}

# 安全编辑主流程
safe_edit() {
    local config_file="$1"
    local reason="${2:-}"
    local no_backup="${3:-false}"
    local force="${4:-false}"
    
    # 检查文件
    if [[ ! -f "$config_file" && ! "$no_backup" == "true" ]]; then
        log_warn "配置文件不存在，将创建新文件: $config_file"
        if ! confirm "是否创建新文件?"; then
            exit 0
        fi
        touch "$config_file"
    fi
    
    local real_config_file
    real_config_file=$(realpath "$config_file")
    
    log_step "开始安全配置编辑: $real_config_file"
    
    # 1. 创建备份
    local backup_path=""
    if [[ "$no_backup" != "true" ]]; then
        init_backup_dir
        backup_path=$(create_backup "$real_config_file")
        log_info "已创建备份: $backup_path"
    fi
    
    # 2. 检查是否为危险配置
    local is_dangerous=false
    if is_dangerous_config "$real_config_file"; then
        is_dangerous=true
        log_warn "检测到危险配置文件!"
        if [[ "$force" != "true" ]]; then
            if ! confirm "这是一个危险配置文件，请确认是否继续编辑" "true"; then
                log_info "已取消编辑"
                exit 0
            fi
        fi
    fi
    
    # 3. 预修改验证
    if [[ -f "$real_config_file" ]]; then
        if ! validate_config "$real_config_file" "pre"; then
            log_error "配置预验证失败，中止编辑"
            exit 1
        fi
    fi
    
    # 4. 创建临时编辑文件
    local temp_file=$(mktemp)
    if [[ -f "$real_config_file" ]]; then
        cp -p "$real_config_file" "$temp_file"
    fi
    
    # 5. 编辑文件
    log_step "启动编辑器..."
    edit_file "$temp_file"
    
    # 6. 显示差异对比
    if [[ -f "$real_config_file" ]]; then
        show_diff "$real_config_file" "$temp_file"
    else
        log_info "新文件内容:"
        cat "$temp_file"
    fi
    
    # 7. 确认应用修改
    if ! confirm "确认应用以上修改?"; then
        log_info "已取消，保留原始配置"
        rm -f "$temp_file"
        exit 0
    fi
    
    # 8. 应用修改
    log_step "应用修改..."
    
    # 渐进式修改：先写入临时文件验证
    local test_file=$(mktemp)
    cp "$temp_file" "$test_file"
    
    # 9. 修改后验证
    if ! validate_config "$test_file" "post"; then
        log_error "修改后验证失败，中止应用"
        rm -f "$temp_file" "$test_file"
        exit 1
    fi
    
    # 10. 应用修改到实际文件
    cp -p "$temp_file" "$real_config_file"
    rm -f "$temp_file" "$test_file"
    
    # 11. 测试配置
    local test_result=0
    if ! test_config "$real_config_file"; then
        test_result=1
        log_error "配置测试失败!"
        
        # 自动回滚
        if [[ -n "$backup_path" ]]; then
            log_warn "正在自动回滚..."
            restore_backup "$real_config_file" "$backup_path"
            log_change "EDIT+ROLLBACK" "$real_config_file" "$backup_path" "$reason" "failed" "配置测试失败，已自动回滚"
        fi
        exit 1
    fi
    
    # 12. 记录成功日志
    log_info "配置修改成功!"
    log_change "EDIT" "$real_config_file" "$backup_path" "$reason" "success"
    
    # 13. 清理
    rm -f "$temp_file" "$test_file"
}

# =============================================================================
# 命令行解析
# =============================================================================

main() {
    local config_file=""
    local reason=""
    local no_backup="false"
    local force="false"
    local restore_backup_id=""
    local list_backups_flag="false"
    local diff_backup_id=""
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                exit 0
                ;;
            -r|--reason)
                reason="$2"
                shift 2
                ;;
            -n|--no-backup)
                no_backup="true"
                shift
                ;;
            -f|--force)
                force="true"
                shift
                ;;
            --restore)
                restore_backup_id="$2"
                shift 2
                ;;
            --list-backups)
                list_backups_flag="true"
                shift
                ;;
            --diff)
                diff_backup_id="$2"
                shift 2
                ;;
            -*)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
            *)
                if [[ -z "$config_file" ]]; then
                    config_file="$1"
                else
                    log_error "多余的参数: $1"
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # 处理特殊命令
    if [[ "$list_backups_flag" == "true" ]]; then
        list_backups
        exit 0
    fi
    
    if [[ -n "$restore_backup_id" ]]; then
        do_restore "$restore_backup_id"
        exit 0
    fi
    
    if [[ -n "$diff_backup_id" ]]; then
        show_backup_diff "$diff_backup_id"
        exit 0
    fi
    
    # 检查配置文件参数
    if [[ -z "$config_file" ]]; then
        log_error "请指定配置文件路径"
        show_help
        exit 1
    fi
    
    # 执行安全编辑
    safe_edit "$config_file" "$reason" "$no_backup" "$force"
}

main "$@"
