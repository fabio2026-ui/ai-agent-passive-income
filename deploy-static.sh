#!/bin/bash
# 多平台静态部署脚本
# 小七AI Agent自动生成

set -e

PROJECT_DIR="/root/.openclaw/workspace/ai-agent-projects"
PUBLIC_DIR="$PROJECT_DIR/public"

echo "🚀 多平台部署脚本"
echo "=================="
echo ""

# 确保public目录存在
mkdir -p "$PUBLIC_DIR"

# 复制内容到public
echo "📦 准备部署文件..."
cp -r "$PROJECT_DIR/content" "$PUBLIC_DIR/" 2>/dev/null || true
cp -r "$PROJECT_DIR/marketing" "$PUBLIC_DIR/" 2>/dev/null || true

# 创建部署信息
cat > "$PUBLIC_DIR/deploy-info.json" <<EOF
{
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0.0",
  "articles": 8,
  "agents": 4
}
EOF

echo "✅ 部署文件准备完成"
echo ""

# 方法1: Surge.sh (无需账号，临时部署)
deploy_surge() {
    echo "🌊 方法1: Surge.sh部署"
    echo "----------------------"
    
    if ! command -v surge > /dev/null; then
        echo "安装 Surge..."
        npm install -g surge
    fi
    
    echo "正在部署到 Surge.sh (随机子域名)..."
    cd "$PUBLIC_DIR"
    surge --project . --domain "ai-agent-$(date +%s).surge.sh" --token "${SURGE_TOKEN:-}"
    echo "✅ Surge部署完成"
    echo ""
}

# 方法2: Netlify Drop (拖拽上传)
prepare_netlify() {
    echo "🔷 方法2: Netlify Drop准备"
    echo "--------------------------"
    
    ZIP_FILE="/root/.openclaw/workspace/ai-agent-static.zip"
    cd "$PUBLIC_DIR"
    zip -r "$ZIP_FILE" . -x "*.zip"
    
    echo "✅ Netlify部署包已创建: $ZIP_FILE"
    echo ""
    echo "手动部署步骤:"
    echo "1. 访问 https://app.netlify.com/drop"
    echo "2. 拖拽 ai-agent-static.zip 到页面"
    echo "3. 获得免费 .netlify.app 域名"
    echo ""
}

# 方法3: Cloudflare Pages (直接上传)
prepare_cf_pages() {
    echo ☁️ "方法3: Cloudflare Pages准备"
    echo "----------------------------"
    
    echo "目录结构:"
    ls -la "$PUBLIC_DIR"
    echo ""
    echo "手动部署:"
    echo "1. 访问 https://dash.cloudflare.com"
    echo "2. Pages > 创建项目 > 直接上传"
    echo "3. 上传 $PUBLIC_DIR 目录"
    echo ""
}

# 方法4: GitHub Pages (如果之后有GitHub)
prepare_github_pages() {
    echo "🐙 方法4: GitHub Pages准备"
    echo "--------------------------"
    
    echo "当前Git状态:"
    cd "$PROJECT_DIR"
    git log --oneline -3
    echo ""
    echo "GitHub Pages部署步骤:"
    echo "1. 推送到GitHub仓库"
    echo "2. Settings > Pages > Source: master / (root)"
    echo "3. 访问 https://用户名.github.io/仓库名"
    echo ""
}

# 方法5: 静态文件导出
export_static() {
    echo "📦 方法5: 静态导出"
    echo "------------------"
    
    EXPORT_DIR="/root/.openclaw/workspace/ai-agent-export"
    rm -rf "$EXPORT_DIR"
    cp -r "$PUBLIC_DIR" "$EXPORT_DIR"
    
    # 添加README
    cat > "$EXPORT_DIR/README.txt" <<EOF
AI Agent被动收入系统 - 静态导出
================================

部署方式:
1. 上传到任何静态托管服务
2. 或使用以下命令本地预览:
   npx serve .
   python3 -m http.server 8080

文件说明:
- index.html: 主页面
- content/: 8篇SEO文章
- marketing/: 社交媒体内容

generated: $(date)
EOF

    echo "✅ 静态导出完成: $EXPORT_DIR"
    echo ""
}

# 主菜单
case "${1:-all}" in
    surge)
        deploy_surge
        ;;
    netlify)
        prepare_netlify
        ;;
    cf)
        prepare_cf_pages
        ;;
    github)
        prepare_github_pages
        ;;
    export)
        export_static
        ;;
    all)
        echo "执行所有部署准备..."
        echo ""
        prepare_netlify
        prepare_cf_pages
        prepare_github_pages
        export_static
        
        echo ""
        echo "🎉 所有部署包已准备完成！"
        echo ""
        echo "推荐部署顺序:"
        echo "1. Netlify Drop (最简单): https://app.netlify.com/drop"
        echo "2. Cloudflare Pages: https://dash.cloudflare.com"
        echo "3. Surge.sh: 运行 ./deploy-static.sh surge"
        echo ""
        echo "导出目录: /root/.openclaw/workspace/ai-agent-export"
        echo "ZIP包: /root/.openclaw/workspace/ai-agent-static.zip"
        ;;
    *)
        echo "用法: $0 [surge|netlify|cf|github|export|all]"
        echo ""
        echo "选项:"
        echo "  surge   - Surge.sh部署"
        echo "  netlify - 准备Netlify Drop"
        echo "  cf      - 准备Cloudflare Pages"
        echo "  github  - GitHub Pages信息"
        echo "  export  - 导出静态文件"
        echo "  all     - 执行所有 (默认)"
        ;;
esac
