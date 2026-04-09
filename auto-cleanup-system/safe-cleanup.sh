#!/bin/bash

# 智能磁盘清理系统 - 安全清理执行器
# safe-cleanup.sh - 执行实际的清理操作，确保安全

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RULES_FILE="${SCRIPT_DIR}/cleanup-rules.json"
LOG_FILE="${SCRIPT_DIR}/cleanup.log"
WORKSPACE="/root/.openclaw/workspace"
MAX_LOG_SIZE_MB=50

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" >> "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" >&2
    log "INFO" "$1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" >&2
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

# 旋转日志
rotate_log() {
    if [[ -f "$LOG_FILE" ]]; then
        local size_mb=$(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null)
        size_mb=$((size_mb / 1024 / 1024))
        if [[ $size_mb -gt $MAX_LOG_SIZE_MB ]]; then
            mv "$LOG_FILE" "${LOG_FILE}.old"
            touch "$LOG_FILE"
            log_info "日志文件已旋转"
        fi
    fi
}

# 检查路径是否在保护列表中
is_protected() {
    local path="$1"
    
    # 检查保护路径模式
    local protected_patterns=(
        "*/AGENTS.md"
        "*/USER.md"
        "*/MEMORY.md"
        "*/BOOTSTRAP.md"
        "*/SOUL.md"
        "*/memory/*"
        "*/.git/*"
        "*/.env*"
        "*/.env"
        "*/node_modules/.package-lock.json"
        "*.conf"
        "*.config.*"
        "*.db"
        "*.sqlite"
        "*/src/*"
        "*.py"
        "*.js"
        "*.ts"
        "*.go"
        "*.rs"
        "*.java"
        "*.sh"
        "/etc/*"
        "/usr/bin/*"
        "/usr/local/bin/*"
        "/var/lib/*"
        "*/.ssh/*"
        "*.md"
        "*.yml"
        "*.yaml"
        "*.json"
        "*.toml"
        "*.ini"
        "*.cfg"
    )
    
    for pattern in "${protected_patterns[@]}"; do
        if [[ "$path" == $pattern ]]; then
            return 0
        fi
    done
    
    # 检查是否在workspace外
    if [[ ! "$path" == "$WORKSPACE"* ]]; then
        return 0
    fi
    
    return 1
}

# 安全删除目录
safe_remove_dir() {
    local dir="$1"
    local dry_run="${2:-false}"
    
    # 安全检查
    if [[ -z "$dir" || "$dir" == "/" ]]; then
        log_error "拒绝删除根目录或空路径: '$dir'"
        return 1
    fi
    
    if is_protected "$dir"; then
        log_warn "跳过受保护路径: $dir"
        return 1
    fi
    
    if [[ ! -d "$dir" ]]; then
        log_warn "目录不存在: $dir"
        return 1
    fi
    
    # 计算大小
    local size=$(du -sh "$dir" 2>/dev/null | cut -f1)
    
    if [[ "$dry_run" == "true" ]]; then
        log_info "[DRY-RUN] 将删除目录: $dir (大小: $size)"
        return 0
    fi
    
    # 使用trash或安全删除
    log_info "正在删除: $dir (大小: $size)"
    if command -v trash &>/dev/null; then
        trash put "$dir"
    else
        rm -rf "$dir"
    fi
    
    log_success "已删除: $dir (释放: $size)"
    return 0
}

# 安全删除文件
safe_remove_file() {
    local file="$1"
    local dry_run="${2:-false}"
    
    # 安全检查
    if [[ -z "$file" ]]; then
        return 1
    fi
    
    if is_protected "$file"; then
        log_warn "跳过受保护文件: $file"
        return 1
    fi
    
    if [[ ! -f "$file" ]]; then
        return 1
    fi
    
    local size=$(du -h "$file" 2>/dev/null | cut -f1)
    
    if [[ "$dry_run" == "true" ]]; then
        log_info "[DRY-RUN] 将删除文件: $file (大小: $size)"
        return 0
    fi
    
    log_info "正在删除: $file (大小: $size)"
    if command -v trash &>/dev/null; then
        trash put "$file"
    else
        rm -f "$file"
    fi
    
    log_success "已删除: $file (释放: $size)"
    return 0
}

# 清理 node_modules
cleanup_node_modules() {
    local dry_run="${1:-false}"
    local freed=0
    
    log "INFO" "扫描 node_modules 目录..."
    echo "扫描 node_modules 目录..." >&2
    
    while IFS= read -r dir; do
        [[ -z "$dir" ]] && continue
        local dir_size=$(du -sm "$dir" 2>/dev/null | cut -f1 || echo 0)
        if safe_remove_dir "$dir" "$dry_run"; then
            freed=$((freed + dir_size))
        fi
    done < <(find "$WORKSPACE" -type d -name "node_modules" 2>/dev/null | head -20)
    
    echo "$freed"
}

# 清理构建输出
cleanup_build_dirs() {
    local dry_run="${1:-false}"
    local freed=0
    
    log "INFO" "扫描构建输出目录..."
    echo "扫描构建输出目录..." >&2
    
    local build_dirs=(".next" "dist" "build" ".nuxt" ".output")
    
    for build_dir in "${build_dirs[@]}"; do
        while IFS= read -r dir; do
            [[ -z "$dir" ]] && continue
            local dir_size=$(du -sm "$dir" 2>/dev/null | cut -f1 || echo 0)
            if safe_remove_dir "$dir" "$dry_run"; then
                freed=$((freed + dir_size))
            fi
        done < <(find "$WORKSPACE" -type d -name "$build_dir" 2>/dev/null | head -10)
    done
    
    echo "$freed"
}

# 清理缓存目录
cleanup_cache_dirs() {
    local dry_run="${1:-false}"
    local freed=0
    
    log "INFO" "扫描缓存目录..."
    echo "扫描缓存目录..." >&2
    
    local cache_dirs=(".cache" "__pycache__" ".pytest_cache" ".mypy_cache" ".ruff_cache")
    
    for cache_dir in "${cache_dirs[@]}"; do
        while IFS= read -r dir; do
            [[ -z "$dir" ]] && continue
            local dir_size=$(du -sm "$dir" 2>/dev/null | cut -f1 || echo 0)
            if safe_remove_dir "$dir" "$dry_run"; then
                freed=$((freed + dir_size))
            fi
        done < <(find "$WORKSPACE" -type d -name "$cache_dir" 2>/dev/null | head -20)
    done
    
    echo "$freed"
}

# 清理旧日志文件
cleanup_old_logs() {
    local dry_run="${1:-false}"
    local days="${2:-7}"
    local freed=0
    
    log "INFO" "扫描 ${days} 天前的日志文件..."
    echo "扫描 ${days} 天前的日志文件..." >&2
    
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        local file_size=$(du -sm "$file" 2>/dev/null | cut -f1 || echo 0)
        if safe_remove_file "$file" "$dry_run"; then
            freed=$((freed + file_size))
        fi
    done < <(find "$WORKSPACE" -type f -name "*.log" -mtime +$days 2>/dev/null | head -50)
    
    echo "$freed"
}

# 清理临时文件
cleanup_temp_files() {
    local dry_run="${1:-false}"
    local days="${2:-30}"
    local freed=0
    
    log "INFO" "扫描 ${days} 天前的临时文件..."
    echo "扫描 ${days} 天前的临时文件..." >&2
    
    local temp_patterns=("*.tmp" "*.temp" "*.swp" "*.swo" "*~" ".DS_Store" "Thumbs.db")
    
    for pattern in "${temp_patterns[@]}"; do
        while IFS= read -r file; do
            [[ -z "$file" ]] && continue
            local file_size=$(du -sm "$file" 2>/dev/null | cut -f1 || echo 0)
            if safe_remove_file "$file" "$dry_run"; then
                freed=$((freed + file_size))
            fi
        done < <(find "$WORKSPACE" -type f -name "$pattern" -mtime +$days 2>/dev/null | head -30)
    done
    
    echo "$freed"
}

# 执行优先级P0清理
execute_p0_cleanup() {
    local dry_run="${1:-false}"
    local total_freed=0
    
    log "INFO" "========== 执行 P0 级别清理 (立即清理) =========="
    echo "========== 执行 P0 级别清理 (立即清理) ==========" >&2
    
    # 清理 node_modules
    local freed=$(cleanup_node_modules "$dry_run")
    total_freed=$((total_freed + freed))
    
    # 清理构建目录
    freed=$(cleanup_build_dirs "$dry_run")
    total_freed=$((total_freed + freed))
    
    # 清理缓存
    freed=$(cleanup_cache_dirs "$dry_run")
    total_freed=$((total_freed + freed))
    
    # 清理7天前的日志
    freed=$(cleanup_old_logs "$dry_run" 7)
    total_freed=$((total_freed + freed))
    
    log "INFO" "P0 清理完成，释放空间: ${total_freed}MB"
    echo "P0 清理完成，释放空间: ${total_freed}MB" >&2
    echo "$total_freed"
}

# 执行优先级P1清理
execute_p1_cleanup() {
    local dry_run="${1:-false}"
    local total_freed=0
    
    log "INFO" "========== 执行 P1 级别清理 (需要时清理) =========="
    echo "========== 执行 P1 级别清理 (需要时清理) ==========" >&2
    
    # 清理30天前的临时文件
    local freed=$(cleanup_temp_files "$dry_run" 30)
    total_freed=$((total_freed + freed))
    
    # 清理旧的压缩包
    log "INFO" "扫描90天前的压缩包..."
    echo "扫描90天前的压缩包..." >&2
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        local file_size=$(du -sm "$file" 2>/dev/null | cut -f1 || echo 0)
        if safe_remove_file "$file" "$dry_run"; then
            total_freed=$((total_freed + file_size))
        fi
    done < <(find "$WORKSPACE" -type f \( -name "*.tar.gz" -o -name "*.zip" -o -name "*.tar" -o -name "*.gz" \) -mtime +90 2>/dev/null | head -20)
    
    log "INFO" "P1 清理完成，释放空间: ${total_freed}MB"
    echo "P1 清理完成，释放空间: ${total_freed}MB" >&2
    echo "$total_freed"
}

# 主函数
main() {
    local priority="${1:-P0}"
    local dry_run="${2:-false}"
    
    # 旋转日志
    rotate_log
    
    log_info "========== 安全清理执行器启动 =========="
    log_info "优先级: $priority, 模拟运行: $dry_run"
    
    local total_freed=0
    
    case "$priority" in
        P0)
            total_freed=$(execute_p0_cleanup "$dry_run")
            ;;
        P1)
            total_freed=$(execute_p0_cleanup "$dry_run")
            local p1_freed=$(execute_p1_cleanup "$dry_run")
            total_freed=$((total_freed + p1_freed))
            ;;
        P2)
            log_warn "P2级别需要手动确认，请检查日志后手动执行"
            ;;
        *)
            log_error "未知的优先级: $priority"
            exit 1
            ;;
    esac
    
    log_info "========== 清理完成，总释放: ${total_freed}MB =========="
    echo "$total_freed"
}

# 如果直接运行此脚本
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
