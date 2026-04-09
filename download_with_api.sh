#!/bin/bash
# 🎬 Pexels素材自动下载脚本 - 使用环境变量中的API密钥

# 从环境变量获取API密钥，如果没有则提示用户设置
API_KEY="${PEXELS_API_KEY:-}"

if [ -z "$API_KEY" ]; then
    echo "❌ 错误: 请设置 PEXELS_API_KEY 环境变量"
    echo "   export PEXELS_API_KEY='your_api_key_here'"
    exit 1
fi

mkdir -p ~/ai-empire/launch/assets

echo "========================================"
echo "🎬 Pexels素材自动下载工具"
echo "========================================"
echo ""

# 搜索关键词
KEYWORDS=("smartphone product" "coffee making" "morning routine")
PER_KEYWORD=5

echo "开始下载素材..."
echo ""

cd ~/ai-empire/launch/assets

for keyword in "${KEYWORDS[@]}"; do
    echo "🔍 搜索: $keyword"
    
    # 调用Pexels API
    encoded_keyword=$(echo "$keyword" | sed 's/ /%20/g')
    response=$(curl -s "https://api.pexels.com/videos/search?query=$encoded_keyword&per_page=$PER_KEYWORD&orientation=landscape" \
        -H "Authorization: $API_KEY")
    
    # 检查API响应
    if [ -z "$response" ]; then
        echo "  ❌ API调用失败，检查网络或API密钥"
        continue
    fi
    
    # 解析并下载视频
    counter=1
    echo "$response" | grep -o '"link":"[^"]*"' | grep -v 'video_pictures' | head -$PER_KEYWORD | while read -r line; do
        url=$(echo $line | sed 's/"link":"//g' | sed 's/"$//g')
        if [ ! -z "$url" ] && [ "$url" != "link:" ]; then
            # 清理URL
            clean_url=$(echo $url | sed 's/\\//g')
            filename="$(echo $keyword | tr ' ' '_')_${counter}.mp4"
            echo "  📥 下载: $filename"
            curl -s -L "$clean_url" -o "$filename" --max-time 60
            ((counter++))
        fi
    done
    
    echo "  ✅ $keyword 完成"
    echo ""
done

echo "========================================"
echo "✅ 素材下载完成!"
echo "========================================"
echo ""
echo "下载位置: ~/ai-empire/launch/assets/"
echo ""
ls -lh ~/ai-empire/launch/assets/
echo ""
echo "下载数量:"
ls ~/ai-empire/launch/assets/*.mp4 2>/dev/null | wc -l
echo ""
echo "下一步: 使用剪映制作3个样片"
echo "脚本参考: ~/ai-empire/launch/scripts.txt"
echo "========================================"
