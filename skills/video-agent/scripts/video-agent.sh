#!/bin/bash
#
# Video Agent CLI
# 
# 命令行接口，用于分析视频内容
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="/tmp/video-agent"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 帮助信息
show_help() {
    cat << EOF
Video Agent CLI - 视频内容分析工具

用法:
    $0 <命令> <URL> [选项]

命令:
    analyze      分析视频元数据
    subtitle     提取字幕
    transcribe   音频转文字 (使用 Whisper)
    frames       提取关键帧
    summary      生成视频摘要
    download     下载视频
    audio        提取音频
    info         显示视频信息

选项:
    --interval N      关键帧间隔秒数 (默认: 10)
    --quality Q       视频质量 (best/720p/480p/audio)
    --language LANG   语言代码 (默认: zh)
    --model MODEL     Whisper 模型 (tiny/base/small/medium/large)
    --output DIR      输出目录
    --keep            保留临时文件
    --help            显示帮助

示例:
    # 分析 YouTube 视频
    $0 analyze "https://www.youtube.com/watch?v=xxxxx"

    # 提取字幕
    $0 subtitle "https://www.youtube.com/watch?v=xxxxx" --language en

    # 音频转文字
    $0 transcribe "https://www.youtube.com/watch?v=xxxxx" --model base

    # 提取关键帧 (每5秒一帧)
    $0 frames "https://www.youtube.com/watch?v=xxxxx" --interval 5

    # 生成视频摘要
    $0 summary "https://www.youtube.com/watch?v=xxxxx"

EOF
}

# 检查依赖
check_deps() {
    local deps=("yt-dlp" "ffmpeg")
    local missing=()

    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done

    if [ ${#missing[@]} -ne 0 ]; then
        echo -e "${RED}错误: 缺少以下依赖:${NC}"
        for dep in "${missing[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "安装指南:"
        echo "  yt-dlp: pip install yt-dlp"
        echo "  ffmpeg: sudo apt-get install ffmpeg 或 brew install ffmpeg"
        exit 1
    fi
}

# 解析参数
parse_args() {
    COMMAND=$1
    shift

    URL=""
    INTERVAL=10
    QUALITY="720p"
    LANGUAGE="zh"
    MODEL="base"
    KEEP_FILES=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --interval)
                INTERVAL="$2"
                shift 2
                ;;
            --quality)
                QUALITY="$2"
                shift 2
                ;;
            --language)
                LANGUAGE="$2"
                shift 2
                ;;
            --model)
                MODEL="$2"
                shift 2
                ;;
            --output)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            --keep)
                KEEP_FILES=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            -*)
                echo -e "${RED}未知选项: $1${NC}"
                show_help
                exit 1
                ;;
            *)
                if [ -z "$URL" ]; then
                    URL="$1"
                fi
                shift
                ;;
        esac
    done

    if [ -z "$URL" ]; then
        echo -e "${RED}错误: 请提供视频 URL${NC}"
        show_help
        exit 1
    fi
}

# 分析视频
analyze_video() {
    echo -e "${BLUE}正在分析视频...${NC}"
    
    node -e "
        import { VideoAgent } from '$PROJECT_DIR/src/video-agent.js';
        
        const agent = new VideoAgent({
            outputDir: '$OUTPUT_DIR',
            keepFiles: $KEEP_FILES
        });
        
        agent.analyze('$URL', { subtitles: true })
            .then(result => {
                console.log(JSON.stringify(result, null, 2));
            })
            .catch(err => {
                console.error('错误:', err.message);
                process.exit(1);
            });
    "
}

# 提取字幕
extract_subtitles() {
    echo -e "${BLUE}正在提取字幕...${NC}"
    
    node -e "
        import { VideoAgent } from '$PROJECT_DIR/src/video-agent.js';
        
        const agent = new VideoAgent({
            outputDir: '$OUTPUT_DIR',
            keepFiles: $KEEP_FILES
        });
        
        agent.extractSubtitles('$URL', { language: '$LANGUAGE' })
            .then(result => {
                if (result.type === 'none') {
                    console.log('未找到字幕');
                } else {
                    console.log('字幕类型:', result.type);
                    console.log('语言:', result.language);
                    console.log('字幕数量:', result.content.length);
                    console.log('文件路径:', result.filePath);
                    console.log('\\n前5条字幕:');
                    result.content.slice(0, 5).forEach(sub => {
                        console.log('[' + sub.start + '] ' + sub.text);
                    });
                }
            })
            .catch(err => {
                console.error('错误:', err.message);
                process.exit(1);
            });
    "
}

# 转录音频
transcribe_audio() {
    echo -e "${BLUE}正在使用 Whisper 转录音频 (模型: $MODEL)...${NC}"
    echo -e "${YELLOW}这可能需要一些时间，取决于视频长度${NC}"
    
    # 检查 whisper
    if ! command -v whisper &> /dev/null; then
        echo -e "${RED}错误: 未找到 whisper${NC}"
        echo "请安装: pip install openai-whisper"
        exit 1
    fi
    
    node -e "
        import { VideoAgent } from '$PROJECT_DIR/src/video-agent.js';
        
        const agent = new VideoAgent({
            outputDir: '$OUTPUT_DIR',
            keepFiles: $KEEP_FILES
        });
        
        agent.transcribe('$URL', { model: '$MODEL', language: '$LANGUAGE' })
            .then(result => {
                console.log('转录完成!');
                console.log('模型:', result.model);
                console.log('语言:', result.language);
                console.log('词数:', result.wordCount);
                console.log('文件路径:', result.filePath);
                console.log('\\n转录内容预览 (前500字符):');
                console.log(result.text.substring(0, 500) + '...');
            })
            .catch(err => {
                console.error('错误:', err.message);
                process.exit(1);
            });
    "
}

# 提取关键帧
extract_frames() {
    echo -e "${BLUE}正在提取关键帧 (间隔: ${INTERVAL}秒)...${NC}"
    
    node -e "
        import { VideoAgent } from '$PROJECT_DIR/src/video-agent.js';
        
        const agent = new VideoAgent({
            outputDir: '$OUTPUT_DIR',
            keepFiles: $KEEP_FILES
        });
        
        agent.extractFrames('$URL', { interval: $INTERVAL })
            .then(result => {
                console.log('关键帧提取完成!');
                console.log('总帧数:', result.total);
                console.log('间隔:', result.interval, '秒');
                console.log('输出目录:', result.directory);
            })
            .catch(err => {
                console.error('错误:', err.message);
                process.exit(1);
            });
    "
}

# 生成摘要
generate_summary() {
    echo -e "${BLUE}正在生成视频摘要...${NC}"
    
    node -e "
        import { VideoAgent } from '$PROJECT_DIR/src/video-agent.js';
        
        const agent = new VideoAgent({
            outputDir: '$OUTPUT_DIR',
            keepFiles: $KEEP_FILES
        });
        
        agent.summarize('$URL', { language: '$LANGUAGE' })
            .then(result => {
                console.log('标题:', result.title);
                console.log('时长:', result.duration, '秒');
                console.log('\\n摘要:');
                console.log(result.summary);
                console.log('\\n关键词:');
                result.keywords.slice(0, 10).forEach(k => {
                    console.log('  - ' + k.word + ' (' + k.count + '次)');
                });
                console.log('\\n统计:');
                console.log('  - 转录长度:', result.transcriptLength, '字符');
                console.log('  - 词数:', result.wordCount);
                console.log('  - 有字幕:', result.hasSubtitles ? '是' : '否');
                console.log('  - 有转录:', result.hasTranscript ? '是' : '否');
            })
            .catch(err => {
                console.error('错误:', err.message);
                process.exit(1);
            });
    "
}

# 下载视频
download_video() {
    echo -e "${BLUE}正在下载视频 (质量: $QUALITY)...${NC}"
    
    local format="best"
    if [ "$QUALITY" = "720p" ]; then
        format="best[height<=720]"
    elif [ "$QUALITY" = "480p" ]; then
        format="best[height<=480]"
    elif [ "$QUALITY" = "audio" ]; then
        format="bestaudio"
    fi
    
    local output="$OUTPUT_DIR/downloads/%(title)s.%(ext)s"
    mkdir -p "$OUTPUT_DIR/downloads"
    
    yt-dlp -f "$format" -o "$output" "$URL"
    
    echo -e "${GREEN}下载完成!${NC}"
}

# 提取音频
extract_audio() {
    echo -e "${BLUE}正在提取音频...${NC}"
    
    local output="$OUTPUT_DIR/audio/%(title)s.%(ext)s"
    mkdir -p "$OUTPUT_DIR/audio"
    
    yt-dlp -f bestaudio --extract-audio --audio-format mp3 \
        --audio-quality 128K -o "$output" "$URL"
    
    echo -e "${GREEN}音频提取完成!${NC}"
}

# 显示视频信息
show_info() {
    echo -e "${BLUE}正在获取视频信息...${NC}"
    
    yt-dlp --dump-json --no-download "$URL" | python3 -m json.tool | head -100
}

# 主函数
main() {
    if [ $# -lt 2 ]; then
        show_help
        exit 1
    fi

    check_deps
    parse_args "$@"
    mkdir -p "$OUTPUT_DIR"

    case $COMMAND in
        analyze)
            analyze_video
            ;;
        subtitle)
            extract_subtitles
            ;;
        transcribe)
            transcribe_audio
            ;;
        frames)
            extract_frames
            ;;
        summary)
            generate_summary
            ;;
        download)
            download_video
            ;;
        audio)
            extract_audio
            ;;
        info)
            show_info
            ;;
        *)
            echo -e "${RED}未知命令: $COMMAND${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
