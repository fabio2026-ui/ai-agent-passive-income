#!/bin/bash

# ContentAI Code Review - 自动化部署脚本
# 支持IPFS、GitHub Pages、Cloudflare Pages、Netlify、Surge

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# 检查依赖
check_deps() {
    local deps=("curl")
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            print_error "$dep 未安装，请先安装"
            exit 1
        fi
    done
}

# 显示菜单
show_menu() {
    clear
    echo "======================================"
    echo "  ContentAI Code Review 部署工具"
    echo "======================================"
    echo ""
    echo "  1) 部署到 IPFS (Pinata)"
    echo "  2) 部署到 GitHub Pages"
    echo "  3) 部署到 Cloudflare Pages"
    echo "  4) 部署到 Netlify"
    echo "  5) 部署到 Surge"
    echo "  6) 生成本地预览"
    echo "  0) 退出"
    echo ""
    echo "======================================"
}

# 部署到IPFS (使用Pinata)
deploy_ipfs() {
    print_info "准备部署到IPFS (Pinata)..."
    
    if ! command -v node &> /dev/null; then
        print_error "需要Node.js环境，请先安装"
        return
    fi
    
    # 检查pinata-upload-cli
    if ! command -v pinata-upload-cli &> /dev/null; then
        print_info "安装Pinata CLI..."
        npm install -g pinata-upload-cli
    fi
    
    print_info "请确保已配置Pinata JWT Token:"
    print_info "pinata-cli --jwt YOUR_JWT_TOKEN"
    
    read -p "是否已配置? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        print_info "请先运行: pinata-cli --jwt YOUR_JWT_TOKEN"
        return
    fi
    
    # 创建临时目录
    TMP_DIR=$(mktemp -d)
    cp index.html "$TMP_DIR/"
    
    print_info "上传到IPFS..."
    cd "$TMP_DIR"
    result=$(pinata-upload-cli index.html)
    cd - > /dev/null
    
    # 提取CID
    cid=$(echo "$result" | grep -oE 'Qm[1-9A-HJ-NP-Za-km-z]{44}' | head -1)
    
    if [ -n "$cid" ]; then
        print_success "部署成功!"
        echo ""
        echo "🌐 IPFS CID: $cid"
        echo "🌐 访问链接:"
        echo "   https://gateway.pinata.cloud/ipfs/$cid"
        echo "   https://ipfs.io/ipfs/$cid"
        echo "   https://dweb.link/ipfs/$cid"
        echo ""
    else
        print_error "部署失败，请检查Pinata配置"
    fi
    
    rm -rf "$TMP_DIR"
}

# 部署到GitHub Pages
deploy_github() {
    print_info "准备部署到GitHub Pages..."
    
    if ! command -v git &> /dev/null; then
        print_error "需要Git，请先安装"
        return
    fi
    
    read -p "GitHub用户名: " username
    read -p "仓库名称 (默认: code-review): " repo
    repo=${repo:-code-review}
    
    TMP_DIR=$(mktemp -d)
    cd "$TMP_DIR"
    
    git init
    git checkout -b main
    cp "$OLDPWD/index.html" .
    git add index.html
    git commit -m "Initial commit"
    
    print_info "创建GitHub仓库并推送..."
    git remote add origin "https://github.com/$username/$repo.git"
    
    print_info "请先在GitHub创建仓库: https://github.com/new"
    read -p "仓库已创建? (y/n): " confirm
    
    if [ "$confirm" == "y" ]; then
        git push -u origin main -f
        
        print_info "请手动启用GitHub Pages:"
        echo "1. 访问: https://github.com/$username/$repo/settings/pages"
        echo "2. Source选择 'Deploy from a branch'"
        echo "3. Branch选择 'main'，folder选择 '/ (root)'"
        echo "4. 点击Save"
        echo ""
        print_success "部署链接: https://$username.github.io/$repo/"
    fi
    
    cd - > /dev/null
    rm -rf "$TMP_DIR"
}

# 部署到Cloudflare Pages
deploy_cloudflare() {
    print_info "准备部署到Cloudflare Pages..."
    
    print_info "Cloudflare Pages部署步骤:"
    echo ""
    echo "1. 访问: https://dash.cloudflare.com/"
    echo "2. 登录后选择 Workers & Pages"
    echo "3. 点击 'Create application' → 'Pages' → 'Upload assets'"
    echo "4. 拖拽 index.html 到上传区域"
    echo "5. 项目名称填写: code-review"
    echo "6. 点击 'Deploy site'"
    echo ""
    
    read -p "是否已准备好index.html? (y/n): " confirm
    if [ "$confirm" == "y" ]; then
        print_info "请手动上传到Cloudflare Pages"
        echo "完成后访问: https://code-review.{your-account}.pages.dev"
    fi
}

# 部署到Netlify
deploy_netlify() {
    print_info "准备部署到Netlify..."
    
    print_info "Netlify Drop部署步骤:"
    echo ""
    echo "1. 访问: https://app.netlify.com/drop"
    echo "2. 将 index.html 拖拽到页面"
    echo "3. 立即获得随机域名"
    echo ""
    
    if command -v netlify &> /dev/null; then
        print_info "检测到Netlify CLI，使用CLI部署..."
        netlify deploy --prod --dir=. --open
    else
        print_info "使用Netlify Drop手动部署..."
        echo "打开浏览器: https://app.netlify.com/drop"
    fi
}

# 部署到Surge
deploy_surge() {
    print_info "准备部署到Surge..."
    
    if ! command -v surge &> /dev/null; then
        if command -v npm &> /dev/null; then
            print_info "安装Surge CLI..."
            npm install -g surge
        else
            print_error "需要Node.js，请先安装"
            return
        fi
    fi
    
    TMP_DIR=$(mktemp -d)
    cp index.html "$TMP_DIR/"
    cd "$TMP_DIR"
    
    print_info "部署到Surge..."
    surge
    
    cd - > /dev/null
    rm -rf "$TMP_DIR"
}

# 生成本地预览
local_preview() {
    print_info "启动本地预览..."
    
    if command -v python3 &> /dev/null; then
        print_info "使用Python HTTP Server..."
        echo "访问: http://localhost:8080"
        python3 -m http.server 8080
    elif command -v python &> /dev/null; then
        print_info "使用Python HTTP Server..."
        echo "访问: http://localhost:8080"
        python -m SimpleHTTPServer 8080
    elif command -v npx &> /dev/null; then
        print_info "使用npx serve..."
        npx serve -p 8080
    else
        print_error "未找到可用的HTTP服务器"
        print_info "请手动用浏览器打开 index.html"
    fi
}

# 主循环
main() {
    check_deps
    
    while true; do
        show_menu
        read -p "请选择部署方式 (0-6): " choice
        
        case $choice in
            1) deploy_ipfs ;;
            2) deploy_github ;;
            3) deploy_cloudflare ;;
            4) deploy_netlify ;;
            5) deploy_surge ;;
            6) local_preview ;;
            0) print_info "退出"; exit 0 ;;
            *) print_error "无效选择" ;;
        esac
        
        echo ""
        read -p "按回车键继续..."
    done
}

main "$@"
