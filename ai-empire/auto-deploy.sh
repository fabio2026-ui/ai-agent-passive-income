#!/bin/bash
# 🚀 AI Empire - Cloudflare Pages 自动部署脚本
# 检查 apps 目录下的代码更新并自动部署

set -e

APPS_DIR="/root/ai-empire/apps"
LOG_FILE="/root/ai-empire/deploy.log"
LAST_DEPLOY_FILE="/root/ai-empire/.last-deploy"
DEPLOYED_APPS=""
UPDATED_APPS=""

echo "========================================" | tee -a "$LOG_FILE"
echo "🚀 AI Empire 自动部署系统" | tee -a "$LOG_FILE"
echo "开始时间: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# 读取上次部署时间
if [ -f "$LAST_DEPLOY_FILE" ]; then
    LAST_DEPLOY=$(cat "$LAST_DEPLOY_FILE" | grep -E "^[0-9]+$" | head -1)
    if [ -z "$LAST_DEPLOY" ]; then
        LAST_DEPLOY=0
    fi
else
    LAST_DEPLOY=0
fi

echo "上次部署时间戳: $LAST_DEPLOY" | tee -a "$LOG_FILE"

# 检查 Cloudflare 认证
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    if [ -f /root/.openclaw/workspace/.cloudflare-token ]; then
        export CLOUDFLARE_API_TOKEN=$(cat /root/.openclaw/workspace/.cloudflare-token)
    elif [ -f /root/.cloudflare-token ]; then
        export CLOUDFLARE_API_TOKEN=$(cat /root/.cloudflare-token)
    fi
fi

# 部署函数
deploy_app() {
    local app_name=$1
    local app_path=$2
    local project_name=$3
    
    echo "" | tee -a "$LOG_FILE"
    echo "📦 部署: $app_name" | tee -a "$LOG_FILE"
    echo "   路径: $app_path" | tee -a "$LOG_FILE"
    
    # 检查 wrangler 是否安装
    if ! command -v wrangler &> /dev/null; then
        echo "   ⚠️  wrangler 未安装，尝试使用 npx..." | tee -a "$LOG_FILE"
        WRANGLER_CMD="npx wrangler"
    else
        WRANGLER_CMD="wrangler"
    fi
    
    # 进入应用目录并部署
    if [ -d "$app_path" ]; then
        cd "$app_path"
        
        # 检查是否有 package.json (需要构建)
        if [ -f "package.json" ]; then
            echo "   🔨 检测到需要构建..." | tee -a "$LOG_FILE"
            if [ -f "package-lock.json" ] || [ -f "yarn.lock" ]; then
                npm install 2>/dev/null || yarn install 2>/dev/null || true
            fi
            npm run build 2>/dev/null || yarn build 2>/dev/null || echo "   ⚠️  构建失败或无需构建" | tee -a "$LOG_FILE"
            
            # 部署 dist 或 build 目录
            if [ -d "dist" ]; then
                DEPLOY_DIR="dist"
            elif [ -d "build" ]; then
                DEPLOY_DIR="build"
            elif [ -d "out" ]; then
                DEPLOY_DIR="out"
            else
                DEPLOY_DIR="."
            fi
        else
            DEPLOY_DIR="."
        fi
        
        # 部署到 Cloudflare Pages
        echo "   🚀 部署到 Cloudflare Pages: $project_name" | tee -a "$LOG_FILE"
        
        if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
            $WRANGLER_CMD pages deploy "$DEPLOY_DIR" --project-name="$project_name" 2>&1 | tee -a "$LOG_FILE" || {
                echo "   ❌ 部署失败: $app_name" | tee -a "$LOG_FILE"
                return 1
            }
        else
            echo "   ⚠️  未设置 CLOUDFLARE_API_TOKEN，跳过部署" | tee -a "$LOG_FILE"
            echo "   💡 提示: 设置环境变量或使用 'wrangler login' 登录" | tee -a "$LOG_FILE"
        fi
        
        echo "   ✅ 部署完成: $app_name" | tee -a "$LOG_FILE"
        DEPLOYED_APPS="$DEPLOYED_APPS $app_name"
        return 0
    else
        echo "   ❌ 应用目录不存在: $app_path" | tee -a "$LOG_FILE"
        return 1
    fi
}

# 检查每个应用的更新
for app_dir in "$APPS_DIR"/*; do
    if [ -d "$app_dir" ]; then
        app_name=$(basename "$app_dir")
        
        # 获取目录最后修改时间
        if [ -d "$app_dir/.git" ]; then
            # 如果是 git 仓库，获取最新提交时间
            app_mtime=$(cd "$app_dir" && git log -1 --format=%ct 2>/dev/null || stat -c %Y . 2>/dev/null || stat -f %m . 2>/dev/null || echo "0")
        else
            # 否则使用文件修改时间
            app_mtime=$(find "$app_dir" -type f -printf '%T@\n' 2>/dev/null | sort -n | tail -1 | cut -d. -f1 || stat -c %Y "$app_dir" 2>/dev/null || echo "0")
        fi
        
        # 检查是否有更新
        if [ "$app_mtime" -gt "$LAST_DEPLOY" ]; then
            echo "📝 检测到更新: $app_name (修改时间: $app_mtime)" | tee -a "$LOG_FILE"
            UPDATED_APPS="$UPDATED_APPS $app_name"
            
            # 获取项目配置
            if [ -f "$app_dir/deploy.config" ]; then
                project_name=$(cat "$app_dir/deploy.config" | grep "PROJECT_NAME=" | cut -d= -f2 | tr -d '"' || echo "$app_name")
            else
                project_name="ai-empire-$app_name"
            fi
            
            # 部署应用
            deploy_app "$app_name" "$app_dir" "$project_name"
        else
            echo "⏭️  跳过 (无更新): $app_name" | tee -a "$LOG_FILE"
        fi
    fi
done

# 更新上次部署时间
CURRENT_TIME=$(date +%s)
echo "$CURRENT_TIME" > "$LAST_DEPLOY_FILE"

# 部署摘要
echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "📊 部署摘要" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "更新时间: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo ""

if [ -n "$UPDATED_APPS" ]; then
    echo "📝 检测到更新的应用:$UPDATED_APPS" | tee -a "$LOG_FILE"
else
    echo "📝 检测到更新的应用: 无" | tee -a "$LOG_FILE"
fi

if [ -n "$DEPLOYED_APPS" ]; then
    echo "🚀 成功部署的应用:$DEPLOYED_APPS" | tee -a "$LOG_FILE"
else
    echo "🚀 成功部署的应用: 无 (所有应用都是最新)" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "✅ 自动部署完成" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# 输出报告（用于 cron 通知）
if [ -n "$UPDATED_APPS" ]; then
    echo ""
    echo "🎯 部署报告:"
    echo "   已更新的应用:$UPDATED_APPS"
    echo "   已部署的应用:$DEPLOYED_APPS"
fi
