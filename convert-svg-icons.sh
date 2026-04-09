#!/bin/bash
# Chrome扩展SVG图标批量转换脚本
# 用于将SVG图标转换为PNG格式 (Chrome Web Store要求)

set -e

EXTENSIONS_DIR="/root/ai-empire/chrome-extensions"
# 需要转换的扩展列表
EXTENSIONS=("seo-analyzer" "word-counter" "color-picker" "screenshot-tool" "link-checker")

echo "=========================================="
echo "Chrome扩展图标批量转换工具"
echo "=========================================="
echo ""

# 检查ImageMagick是否安装
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick 未安装"
    echo "正在安装..."
    apt-get update && apt-get install -y imagemagick
fi

echo "✅ ImageMagick 已安装"
echo ""

# 转换函数
convert_icons() {
    local ext_name=$1
    local ext_dir="$EXTENSIONS_DIR/$ext_name"
    local icons_dir="$ext_dir/icons"
    
    echo "--- 处理: $ext_name ---"
    
    if [ ! -d "$icons_dir" ]; then
        echo "⚠️  跳过: 没有icons目录"
        return
    fi
    
    # 查找SVG文件
    local svg_file=$(find "$icons_dir" -name "*.svg" | head -1)
    
    if [ -z "$svg_file" ]; then
        echo "⚠️  跳过: 没有找到SVG文件"
        return
    fi
    
    echo "源SVG: $(basename $svg_file)"
    
    # 转换各尺寸PNG
    for size in 16 32 48 128; do
        local output_file="$icons_dir/icon${size}.png"
        
        # 如果已经存在PNG且比SVG新，跳过
        if [ -f "$output_file" ] && [ "$output_file" -nt "$svg_file" ]; then
            echo "  ✓ icon${size}.png 已存在且最新"
            continue
        fi
        
        convert -background none "$svg_file" -resize ${size}x${size} "$output_file"
        echo "  ✓ 生成 icon${size}.png (${size}x${size})"
    done
    
    echo ""
}

# 批量转换
for ext in "${EXTENSIONS[@]}"; do
    convert_icons "$ext"
done

echo "=========================================="
echo "✅ 图标转换完成!"
echo "=========================================="
echo ""
echo "已转换的扩展:"
for ext in "${EXTENSIONS[@]}"; do
    echo "  - $ext"
done
echo ""
echo "接下来:"
echo "  1. 检查转换后的PNG图标"
echo "  2. 重新打包扩展"
echo "  3. 上传到Chrome Web Store"
