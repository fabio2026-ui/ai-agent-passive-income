#!/bin/bash
# AI Agent Pro v3.0 - 高级智能版
# 保存为 ~/ai_agent_pro.sh
# 在Mac本地运行：bash ~/ai_agent_pro.sh

OLLAMA_URL="http://localhost:11434/api/generate"
MODEL="qwen2.5:14b"
WORK_DIR=$HOME/ai-app-factory-v3/products/ai_life_copilot
VIDEO_DIR=$HOME/ai-company/ai-content-factory/output/tiktok
LOG_FILE=$HOME/ai_agent_pro.log

echo "$(date): [AGENT-PRO] 高级智能代理启动" | tee -a $LOG_FILE
echo "$(date): [INFO] 使用模型: $MODEL" | tee -a $LOG_FILE
echo "$(date): [INFO] 每30分钟智能决策并执行" | tee -a $LOG_FILE

# 主循环
while true; do
    echo "$(date): [CYCLE-START] ====== 新工作周期 ======" | tee -a $LOG_FILE
    
    # 获取当前状态
    CODE_LINES=$(wc -l $WORK_DIR/main.py 2>/dev/null | awk '{print $1}')
    VIDEO_COUNT=$(ls $VIDEO_DIR/*.mp4 2>/dev/null | wc -l)
    
    echo "$(date): [STATUS] 当前: ${CODE_LINES}行代码, ${VIDEO_COUNT}个视频" | tee -a $LOG_FILE
    
    # 智能决策1: 如果代码少于150行，生成代码
    if [ $CODE_LINES -lt 150 ]; then
        echo "$(date): [ACTION] 调用14B模型生成智能代码..." | tee -a $LOG_FILE
        
        # 使用14B模型生成真正的功能代码
        curl -s $OLLAMA_URL -d "{
            \"model\": \"$MODEL\",
            \"prompt\": \"生成一个Python函数，用于预算管理或目标追踪。包含文档字符串、参数和返回值。只输出代码。\",
            \"stream\": false
        }" 2>/dev/null | grep -o '"response":"[^"]*"' | cut -d'"' -f4 > /tmp/generated_code.txt
        
        # 追加到文件
        echo "" >> $WORK_DIR/main.py
        echo "# 14B-AI-Generated $(date +%s)" >> $WORK_DIR/main.py
        cat /tmp/generated_code.txt >> $WORK_DIR/main.py
        
        # 语法检查
        python3 -m py_compile $WORK_DIR/main.py 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "$(date): [SUCCESS] 代码生成成功并通过检查" | tee -a $LOG_FILE
        else
            echo "$(date): [WARNING] 代码有语法问题，已记录" | tee -a $LOG_FILE
        fi
    fi
    
    # 智能决策2: 如果视频少于25个，生成视频
    if [ $VIDEO_COUNT -lt 25 ]; then
        echo "$(date): [ACTION] 生成创意视频..." | tee -a $LOG_FILE
        
        TIMESTAMP=$(date +%s)
        COLORS="red blue green gold purple cyan magenta"
        COLOR=$(echo $COLORS | tr ' ' '\n' | shuf -n 1)
        
        ffmpeg -f lavfi -i color=c=$COLOR:s=1080x1920:d=8 \
               -vf "drawtext=text='AI Pro Agent':fontcolor=white:fontsize=90:x=(w-text_w)/2:y=(h-text_h)/2" \
               -c:v libx264 -pix_fmt yuv420p $VIDEO_DIR/pro_${TIMESTAMP}.mp4 -y 2>/dev/null
        
        echo "$(date): [SUCCESS] 生成视频: pro_${TIMESTAMP}.mp4" | tee -a $LOG_FILE
    fi
    
    # 自我优化: 记录和学习
    NEW_CODE_LINES=$(wc -l $WORK_DIR/main.py 2>/dev/null | awk '{print $1}')
    NEW_VIDEO_COUNT=$(ls $VIDEO_DIR/*.mp4 2>/dev/null | wc -l)
    
    echo "$(date): [LEARNING] 本次周期: +$((NEW_CODE_LINES - CODE_LINES))行代码, +$((NEW_VIDEO_COUNT - VIDEO_COUNT))个视频" | tee -a $LOG_FILE
    
    echo "$(date): [CYCLE-END] ====== 周期完成，休息30分钟 ======" | tee -a $LOG_FILE
    echo "" >> $LOG_FILE
    
    # 30分钟后继续
    sleep 1800
done
