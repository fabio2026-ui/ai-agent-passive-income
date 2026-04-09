#!/bin/bash
# 批量生成网文视频脚本

OUTPUT_DIR="/root/.openclaw/workspace/auto-video/novel-videos"
mkdir -p $OUTPUT_DIR

cd ~/.openclaw/workspace/skills/jianying-video
source venv/bin/activate

# 视频任务列表
declare -a PROMPTS=(
    "富二代骑着电动车穿梭在城市夜景中，背景是霓虹闪烁的摩天大楼，赛博朋克风格"
    "少年站在悬崖边，身后是破碎的宗门，天空中雷电交加，金色光芒冲天而起，仙侠风格"
    "高中生站在教室窗前，阳光洒在脸上，眼神坚定看向窗外繁华都市，青春励志风格"
    "阴暗街道上，主角身后浮现无数鬼影，路灯闪烁雾气弥漫，诡异恐怖风格"
    "主角站在竞技场中央，身后是龙国国旗虚影，四周各国神话人物环绕，热血燃向"
)

declare -a NAMES=(
    "都市神豪-万亿家产"
    "修仙逆袭-觉醒体质" 
    "重生复仇-回到高三"
    "诡异复苏-鬼影浮现"
    "国运直播-龙国挑战"
)

echo "开始批量生成5个网文视频..."
echo "输出目录: $OUTPUT_DIR"
echo ""

for i in {0..4}; do
    echo "========================================"
    echo "生成视频 $((i+1))/5: ${NAMES[$i]}"
    echo "========================================"
    
    python3 jianying-video-gen/scripts/jianying_worker.py \
        --prompt "${PROMPTS[$i]}" \
        --duration 5s \
        --output-dir $OUTPUT_DIR \
        2>&1 | tail -20
    
    echo ""
    echo "视频 $((i+1)) 完成，等待5秒继续..."
    sleep 5
done

echo ""
echo "========================================"
echo "所有视频生成完成！"
echo "输出目录: $OUTPUT_DIR"
ls -lh $OUTPUT_DIR/*.mp4 2>/dev/null || echo "无视频文件"
echo "========================================"
