#!/bin/bash
# Chrome扩展打包脚本 - 用于上传到Chrome Web Store
# 注意: 此脚本需要在图标转换为PNG后运行

set -e

EXTENSIONS_DIR="/root/ai-empire/chrome-extensions"
OUTPUT_DIR="/root/ai-empire/chrome-extensions-ready"

# 确保输出目录存在
mkdir -p "$OUTPUT_DIR"

# 立即可上架的扩展 (PNG图标已齐全)
READY_EXTENSIONS=(
    "currency-converter"
    "price-tracker" 
    "json-formatter"
)

# 需要转换图标的扩展
NEED_ICON_CONVERSION=(
    "seo-analyzer"
    "word-counter"
    "color-picker"
    "screenshot-tool"
    "link-checker"
)

echo "=========================================="
echo "Chrome扩展打包工具"
echo "=========================================="
echo ""

# 打包就绪的扩展
echo "🟢 打包立即可上架的扩展..."
echo ""

for ext in "${READY_EXTENSIONS[@]}"; do
    echo "--- 打包: $ext ---"
    
    ext_path="$EXTENSIONS_DIR/$ext"
    output_zip="$OUTPUT_DIR/${ext}-upload.zip"
    
    if [ ! -d "$ext_path" ]; then
        echo "⚠️  跳过: 目录不存在 $ext_path"
        continue
    fi
    
    # 打包扩展,排除不需要的文件
    cd "$ext_path"
    zip -r "$output_zip" . \
        -x "*.tar.gz" \
        -x "venv/*" \
        -x "node_modules/*" \
        -x ".git/*" \
        -x "*.md" \
        -x "generate-icons.js" \
        -x "build-icons.sh" \
        -x "create-icons.js" \
        -q
    
    # 显示文件大小
    size=$(du -h "$output_zip" | cut -f1)
    echo "  ✅ 已打包: ${ext}-upload.zip ($size)"
    echo ""
done

echo "=========================================="
echo "📦 打包完成!"
echo "=========================================="
echo ""
echo "输出位置: $OUTPUT_DIR"
echo ""
echo "已打包扩展:"
for ext in "${READY_EXTENSIONS[@]}"; do
    zip_file="$OUTPUT_DIR/${ext}-upload.zip"
    if [ -f "$zip_file" ]; then
        size=$(du -h "$zip_file" | cut -f1)
        echo "  ✅ $ext ($size)"
    fi
done
echo ""
echo "⚠️  需要图标转换的扩展:"
for ext in "${NEED_ICON_CONVERSION[@]}"; do
    echo "  ⚠️  $ext (需要SVG→PNG转换)"
done
echo ""
echo "下一步:"
echo "  1. 转换剩余扩展的SVG图标 → PNG"
echo "  2. 访问 https://chrome.google.com/webstore/devconsole"
echo "  3. 上传ZIP文件并提交审核"
