#!/bin/bash
# 🤖 VideoCraftsman - AI视频生产流水线
# 全自动渲染视频素材

INPUT_DIR="$HOME/ai-empire/launch/assets"
OUTPUT_DIR="$HOME/ai-empire/output/videos"
mkdir -p $OUTPUT_DIR

echo "🎬 VideoCraftsman 启动"
echo "======================"

# 生产视频1: 产品展示
echo "🎬 生产视频1: 产品展示..."
ffmpeg -i $INPUT_DIR/smartphone_product_1.mp4 -vf "
drawtext=text='Tired of slow phones?':fontsize=60:fontcolor=white:box=1:boxcolor=black@0.5:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,3)',
drawtext=text='Upgrade Now!':fontsize=70:fontcolor=yellow:box=1:boxcolor=black@0.5:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,3,6)'
" -c:a copy -t 15 $OUTPUT_DIR/product_ad_1.mp4 -y

echo "✅ 视频1完成: $OUTPUT_DIR/product_ad_1.mp4"

# 生产视频2: 教育内容
echo "🎬 生产视频2: 教育内容..."
ffmpeg -i $INPUT_DIR/coffee_making_1.mp4 -vf "
drawtext=text='3 Coffee Hacks':fontsize=70:fontcolor=white:box=1:boxcolor=black@0.5:x=(w-text_w)/2:y=100,
drawtext=text='#1: Ice Cubes':fontsize=40:fontcolor=yellow:x=100:y=h-200:enable='between(t,3,7)',
drawtext=text='#2: Cinnamon':fontsize=40:fontcolor=yellow:x=100:y=h-200:enable='between(t,8,12)',
drawtext=text='#3: Mason Jar':fontsize=40:fontcolor=yellow:x=100:y=h-200:enable='between(t,13,17)'
" -c:a copy -t 20 $OUTPUT_DIR/coffee_tips_1.mp4 -y

echo "✅ 视频2完成: $OUTPUT_DIR/coffee_tips_1.mp4"

# 生产视频3: 生活方式
echo "🎬 生产视频3: 生活方式..."
ffmpeg -i $INPUT_DIR/morning_routine_1.mp4 -vf "
drawtext=text='My Productive Morning':fontsize=60:fontcolor=white:box=1:boxcolor=black@0.5:x=(w-text_w)/2:y=100,
drawtext=text='5AM - Wake Up':fontsize=35:fontcolor=white:x=100:y=h-150:enable='between(t,2,5)',
drawtext=text='6AM - Workout':fontsize=35:fontcolor=white:x=100:y=h-150:enable='between(t,6,9)',
drawtext=text='7AM - Coffee':fontsize=35:fontcolor=white:x=100:y=h-150:enable='between(t,10,13)',
drawtext=text='8AM - Start Work':fontsize=35:fontcolor=white:x=100:y=h-150:enable='between(t,14,17)'
" -c:a copy -t 20 $OUTPUT_DIR/morning_vlog_1.mp4 -y

echo "✅ 视频3完成: $OUTPUT_DIR/morning_vlog_1.mp4"

echo ""
echo "======================"
echo "🎉 批量生产完成!"
echo "输出目录: $OUTPUT_DIR"
echo "视频数量: 3"
echo "======================"

# 生成生产报告
echo "$(date): 生产3个视频" >> $OUTPUT_DIR/production.log
ls -lh $OUTPUT_DIR/*.mp4
