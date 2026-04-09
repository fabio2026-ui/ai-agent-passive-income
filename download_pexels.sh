#!/bin/bash
# 🎬 Pexels素材自动下载脚本
# 使用Pexels API自动下载视频素材

# 设置API密钥 (免费注册获取: www.pexels.com/api/)
API_KEY="YOUR_PEXELS_API_KEY"

# 创建素材目录
mkdir -p ~/ai-empire/launch/assets

echo "========================================"
echo "🎬 Pexels素材自动下载工具"
echo "========================================"
echo ""

# 检查是否提供了API密钥
if [ "$API_KEY" = "YOUR_PEXELS_API_KEY" ]; then
    echo "⚠️  需要Pexels API密钥"
    echo ""
    echo "获取步骤:"
    echo "1. 访问 https://www.pexels.com/api/"
    echo "2. 点击 'Join' 注册账号"
    echo "3. 申请API密钥 (免费)"
    echo "4. 复制API密钥"
    echo "5. 替换脚本中的 YOUR_PEXELS_API_KEY"
    echo ""
    echo "或者使用手动下载方式:"
    echo "  bash /root/.openclaw/workspace/download_manual.sh"
    echo "========================================"
    exit 1
fi

# 搜索关键词
KEYWORDS=("smartphone" "coffee" "morning routine")

# 每个关键词下载数量
PER_KEYWORD=5

echo "开始下载素材..."
echo ""

for keyword in "${KEYWORDS[@]}"; do
    echo "🔍 搜索: $keyword"
    
    # 调用Pexels API
    response=$(curl -s "https://api.pexels.com/videos/search?query=$keyword&per_page=$PER_KEYWORD&orientation=portrait" \
        -H "Authorization: $API_KEY")
    
    # 解析并下载视频
    echo "$response" | jq -r '.videos[].video_files[] | select(.quality=="hd" or .quality=="sd") | .link' | head -$PER_KEYWORD | while read -r url; do
        if [ ! -z "$url" ]; then
            filename="$(echo $keyword | tr ' ' '_')_$(date +%s%N | cut -b1-8).mp4"
            echo "  📥 下载: $filename"
            curl -s -L "$url" -o "~/ai-empire/launch/assets/$filename" --max-time 30
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
echo "下一步: 使用剪映制作3个样片"
echo "脚本参考: ~/ai-empire/launch/scripts.txt"
echo "========================================"
