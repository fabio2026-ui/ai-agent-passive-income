#!/bin/bash
# 🎬 Pixabay素材自动下载脚本 - 使用环境变量中的API密钥

# 从环境变量获取API密钥，如果没有则提示用户设置
API_KEY="${PIXABAY_API_KEY:-}"

if [ -z "$API_KEY" ]; then
    echo "❌ 错误: 请设置 PIXABAY_API_KEY 环境变量"
    echo "   export PIXABAY_API_KEY='your_api_key_here'"
    exit 1
fi

mkdir -p ~/ai-empire/launch/assets/pixabay

echo "========================================"
echo "🎬 Pixabay素材自动下载工具"
echo "========================================"
echo ""

# 搜索关键词
KEYWORDS=("smartphone" "coffee" "morning" "workspace" "lifestyle")
PER_KEYWORD=3

echo "开始下载Pixabay素材..."
echo ""

cd ~/ai-empire/launch/assets/pixabay

for keyword in "${KEYWORDS[@]}"; do
    echo "🔍 搜索: $keyword"
    
    # 调用Pixabay API (视频搜索)
    response=$(curl -s "https://pixabay.com/api/videos/?key=$API_KEY&q=$keyword&per_page=$PER_KEYWORD&orientation=horizontal" \
        -H "Accept: application/json")
    
    # 检查API响应
    if [ -z "$response" ]; then
        echo "  ❌ API调用失败"
        continue
    fi
    
    # 解析并下载视频
    counter=1
    # Pixabay返回JSON，提取视频URL
    echo "$response" | grep -o '"videos":{[^}]*"large":{[^}]*"url":"[^"]*"' | grep -o '"url":"[^"]*"' | sed 's/"url":"//g' | sed 's/"$//g' | head -$PER_KEYWORD | while read -r url; do
        if [ ! -z "$url" ]; then
            filename="pixabay_$(echo $keyword)_${counter}.mp4"
            echo "  📥 下载: $filename"
            curl -s -L "$url" -o "$filename" --max-time 60
            ((counter++))
        fi
    done
    
    # 如果没有找到视频URL，尝试下载图片作为备用
    if [ $counter -eq 1 ]; then
        echo "  ⚠️  视频下载失败，尝试下载图片..."
        
        # 调用Pixabay API (图片搜索)
        img_response=$(curl -s "https://pixabay.com/api/?key=$API_KEY&q=$keyword&per_page=$PER_KEYWORD&orientation=horizontal" \
            -H "Accept: application/json")
        
        img_counter=1
        echo "$img_response" | grep -o '"largeImageURL":"[^"]*"' | sed 's/"largeImageURL":"//g' | sed 's/"$//g' | head -$PER_KEYWORD | while read -r img_url; do
            if [ ! -z "$img_url" ]; then
                img_filename="pixabay_$(echo $keyword)_img_${img_counter}.jpg"
                echo "  📥 下载图片: $img_filename"
                curl -s -L "$img_url" -o "$img_filename" --max-time 30
                ((img_counter++))
            fi
        done
    fi
    
    echo "  ✅ $keyword 完成"
    echo ""
done

echo "========================================"
echo "✅ Pixabay素材下载完成!"
echo "========================================"
echo ""
echo "下载位置: ~/ai-empire/launch/assets/pixabay/"
echo ""
ls -lh ~/ai-empire/launch/assets/pixabay/
echo ""
echo "总下载数量:"
ls ~/ai-empire/launch/assets/pixabay/ 2>/dev/null | wc -l
echo ""
echo "💡 现在你有两个素材库:"
echo "  1. Pexels素材: ~/ai-empire/launch/assets/ (15个视频)"
echo "  2. Pixabay素材: ~/ai-empire/launch/assets/pixabay/ (更多选择)"
echo ""
echo "下一步: 使用剪映制作3个样片"
echo "========================================"
