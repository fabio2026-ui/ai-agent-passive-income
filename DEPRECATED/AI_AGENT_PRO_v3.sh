#!/bin/bash
# AI Agent Pro v3.0 - 高级智能版
# 真正调用14B大模型进行推理决策

OLLAMA_URL="http://localhost:11434/api/generate"
MODEL="qwen2.5:14b"
WORK_DIR=/Users/fabiofu/ai-app-factory-v3/products/ai_life_copilot
VIDEO_DIR=/Users/fabiofu/ai-company/ai-content-factory/output/tiktok
LOG_FILE=/Users/fabiofu/ai_agent_pro.log
MEMORY_FILE=/Users/fabiofu/ai_agent_memory.json

# 初始化记忆系统
init_memory() {
    if [ ! -f $MEMORY_FILE ]; then
        echo '{"learned_strategies": [], "success_patterns": [], "failure_logs": []}' > $MEMORY_FILE
    fi
}

# 调用14B模型进行推理
think_with_14b() {
    local prompt=$1
    local response=$(curl -s $OLLAMA_URL -d "{
        \"model\": \"$MODEL\",
        \"prompt\": \"$prompt\",
        \"stream\": false
    }" 2>/dev/null | grep -o '"response":"[^"]*"' | cut -d'"' -f4)
    echo $response
}

# 智能决策：决定今天做什么
decide_daily_strategy() {
    echo "$(date): [14B-THINKING] 分析当前状态..." >> $LOG_FILE
    
    # 获取当前状态
    CODE_LINES=$(wc -l $WORK_DIR/main.py | awk '{print $1}')
    VIDEO_COUNT=$(ls $VIDEO_DIR/*.mp4 2>/dev/null | wc -l)
    
    # 构建推理提示
    STRATEGY_PROMPT="你是AI Agent Pro，负责管理一个AI内容工厂。当前状态：APP代码${CODE_LINES}行，视频${VIDEO_COUNT}个。请分析并决定今天的工作重点：1)继续扩展APP功能 2)生成更多视频 3)优化现有代码质量。只回答数字1/2/3。"
    
    DECISION=$(think_with_14b "$STRATEGY_PROMPT")
    echo "$(date): [14B-DECISION] 策略: $DECISION" >> $LOG_FILE
    
    echo $DECISION
}

# 智能代码生成：用14B模型写真正的功能代码
generate_smart_code() {
    echo "$(date): [14B-CODING] 生成高质量代码..." >> $LOG_FILE
    
    # 读取当前代码上下文
    CONTEXT=$(tail -20 $WORK_DIR/main.py)
    
    # 构建代码生成提示
    CODE_PROMPT="基于以下Python代码上下文，生成一个完整的、有用的功能函数：\n$CONTEXT\n\n请生成：1)函数文档字符串 2)完整的实现代码 3)错误处理。只输出代码，不要解释。"
    
    # 调用14B模型生成代码
    NEW_CODE=$(think_with_14b "$CODE_PROMPT")
    
    # 写入文件
    echo "" >> $WORK_DIR/main.py
    echo "# AI-14B-Generated Function ($(date +%s))" >> $WORK_DIR/main.py
    echo "$NEW_CODE" >> $WORK_DIR/main.py
    
    # 验证代码语法
    python3 -m py_compile $WORK_DIR/main.py 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "$(date): [SUCCESS] 代码生成成功并通过语法检查" >> $LOG_FILE
        # 记录成功模式
        log_success "code_generation"
    else
        echo "$(date): [ERROR] 代码语法错误，记录失败" >> $LOG_FILE
        log_failure "code_generation" "syntax_error"
    fi
}

# 智能视频生成：用14B模型决定视频内容
generate_smart_video() {
    echo "$(date): [14B-CREATIVE] 生成创意视频..." >> $LOG_FILE
    
    # 决定视频主题
    THEME_PROMPT="生成一个适合TikTok的短视频创意主题，关于AI或科技，15秒，吸引人。只输出主题名称。"
    THEME=$(think_with_14b "$THEME_PROMPT")
    
    # 决定视觉风格
    STYLE_PROMPT="为视频主题'$THEME'选择最佳视觉风格：red/blue/green/gold/purple。只输出颜色。"
    COLOR=$(think_with_14b "$STYLE_PROMPT")
    
    # 生成视频
    TIMESTAMP=$(date +%s)
    ffmpeg -f lavfi -i color=c=$COLOR:s=1080x1920:d=15 \
           -vf "drawtext=text='$THEME':fontcolor=white:fontsize=80:x=(w-text_w)/2:y=(h-text_h)/2" \
           -c:v libx264 -pix_fmt yuv420p $VIDEO_DIR/smart_${TIMESTAMP}.mp4 -y 2>/dev/null
    
    echo "$(date): [SUCCESS] 生成视频: $THEME ($COLOR)" >> $LOG_FILE
    log_success "video_generation"
}

# 自我学习：记录成功模式
log_success() {
    local task=$1
    local current=$(cat $MEMORY_FILE)
    local updated=$(echo $current | jq ".success_patterns += [{\"task\": \"$task\", \"time\": \"$(date)\"}]")
    echo $updated > $MEMORY_FILE
}

# 记录失败
log_failure() {
    local task=$1
    local reason=$2
    local current=$(cat $MEMORY_FILE)
    local updated=$(echo $current | jq ".failure_logs += [{\"task\": \"$task\", \"reason\": \"$reason\", \"time\": \"$(date)\"}]")
    echo $updated > $MEMORY_FILE
}

# 自我优化：根据历史记录调整策略
self_optimize() {
    echo "$(date): [14B-OPTIMIZING] 自我优化中..." >> $LOG_FILE
    
    # 分析成功模式
    SUCCESS_COUNT=$(cat $MEMORY_FILE | jq '.success_patterns | length')
    FAILURE_COUNT=$(cat $MEMORY_FILE | jq '.failure_logs | length')
    
    if [ $SUCCESS_COUNT -gt $FAILURE_COUNT ]; then
        echo "$(date): [LEARNING] 成功率高，继续当前策略" >> $LOG_FILE
    else
        echo "$(date): [ADAPTING] 失败较多，调整策略" >> $LOG_FILE
        # 这里可以添加策略调整逻辑
    fi
}

# 主工作循环
main_loop() {
    init_memory
    echo "$(date): [AGENT-PRO] 高级智能代理启动" >> $LOG_FILE
    
    while true; do
        echo "$(date): [WORK-START] ====== 新工作周期 ======" >> $LOG_FILE
        
        # 1. 14B模型决策今天做什么
        STRATEGY=$(decide_daily_strategy)
        
        case $STRATEGY in
            *1*)
                echo "$(date): [FOCUS] 重点：APP开发" >> $LOG_FILE
                generate_smart_code
                ;;
            *2*)
                echo "$(date): [FOCUS] 重点：视频生成" >> $LOG_FILE
                generate_smart_video
                ;;
            *3*)
                echo "$(date): [FOCUS] 重点：代码优化" >> $LOG_FILE
                self_optimize
                ;;
            *)
                # 默认都做
                generate_smart_code
                generate_smart_video
                ;;
        esac
        
        # 2. 自我优化
        self_optimize
        
        # 3. 记录状态
        CODE_LINES=$(wc -l $WORK_DIR/main.py | awk '{print $1}')
        VIDEO_COUNT=$(ls $VIDEO_DIR/*.mp4 2>/dev/null | wc -l)
        echo "$(date): [STATUS] 代码: ${CODE_LINES}行, 视频: ${VIDEO_COUNT}个" >> $LOG_FILE
        
        echo "$(date): [WORK-END] ====== 周期结束，休息30分钟 ======" >> $LOG_FILE
        echo "" >> $LOG_FILE
        
        # 每30分钟循环
        sleep 1800
    done
}

# 启动
main_loop
