#!/bin/bash
# Chrome Web Store 自动上传脚本
# 使用方法: 配置CLIENT_ID等变量后运行

# ========================================
# 配置（需要你提供）
# ========================================
CLIENT_ID="${CHROME_CLIENT_ID:-YOUR_CLIENT_ID}"
CLIENT_SECRET="${CHROME_CLIENT_SECRET:-YOUR_CLIENT_SECRET}"
REFRESH_TOKEN="${CHROME_REFRESH_TOKEN:-YOUR_REFRESH_TOKEN}"

# 扩展列表（ID需要首次手动上传后获得）
declare -A EXTENSIONS=(
  ["seo-analyzer"]=""
  ["screenshot-tool"]=""
  ["color-picker"]=""
  ["link-checker"]=""
  ["json-formatter"]=""
  ["currency-converter"]=""
)

BASE_DIR="/root/ai-empire/chrome-extensions"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "🚀 Chrome Web Store 自动上传"
echo "========================================"
echo ""

# 检查配置
if [ "$CLIENT_ID" = "YOUR_CLIENT_ID" ]; then
    echo -e "${RED}❌ 错误: 未配置API密钥${NC}"
    echo "请设置环境变量:"
    echo "  export CHROME_CLIENT_ID=你的Client_ID"
    echo "  export CHROME_CLIENT_SECRET=你的Client_Secret"
    echo "  export CHROME_REFRESH_TOKEN=你的Refresh_Token"
    exit 1
fi

# 安装CLI（如果没有）
if ! command -v chrome-webstore-upload &> /dev/null; then
    echo "📦 安装Chrome Web Store CLI..."
    npm install -g chrome-webstore-upload-cli
fi

# 遍历上传
for ext_name in "${!EXTENSIONS[@]}"; do
    ext_id="${EXTENSIONS[$ext_name]}"
    ext_dir="$BASE_DIR/$ext_name"
    
    echo ""
    echo "📦 处理: $ext_name"
    
    if [ ! -d "$ext_dir" ]; then
        echo -e "${YELLOW}⚠️ 目录不存在: $ext_dir${NC}"
        continue
    fi
    
    # 打包
    zip_file="/tmp/${ext_name}.zip"
    echo "  🗜️  打包..."
    (cd "$ext_dir" && zip -r "$zip_file" . -x "*.git*" "node_modules/*" "*.tar.gz" > /dev/null 2>&1)
    
    if [ ! -f "$zip_file" ]; then
        echo -e "${RED}  ❌ 打包失败${NC}"
        continue
    fi
    
    echo "  ✅ 打包完成: $(ls -lh "$zip_file" | awk '{print $5}')"
    
    # 上传
    if [ -z "$ext_id" ]; then
        echo -e "${YELLOW}  ⚠️ 未配置Extension ID，需要首次手动上传${NC}"
        echo "     上传后获取ID，更新此脚本中的EXTENSIONS数组"
    else
        echo "  📤 上传到Chrome Web Store..."
        chrome-webstore-upload upload \
            --source "$zip_file" \
            --extension-id "$ext_id" \
            --client-id "$CLIENT_ID" \
            --client-secret "$CLIENT_SECRET" \
            --refresh-token "$REFRESH_TOKEN" 2>&1 | tee /tmp/upload_${ext_name}.log
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}  ✅ 上传成功${NC}"
        else
            echo -e "${RED}  ❌ 上传失败，查看日志: /tmp/upload_${ext_name}.log${NC}"
        fi
    fi
    
    # 清理
    rm -f "$zip_file"
done

echo ""
echo "========================================"
echo "📊 上传完成"
echo "========================================"
