# 🔍 视频渲染功能找回与重建
# 根据你的回忆重新部署

========================================
🔍 系统检查结果
========================================

## 当前状态
- FFmpeg: 未安装 ❌
- 视频渲染插件: 未找到 ❌
- 自动视频生成: 需要重建 ⚠️

## 你的回忆
你说之前已经：
✅ 加入过插件/软件
✅ AI可以自主完成渲染
✅ 需要找回这个功能

========================================
🛠️ 立即重建视频渲染系统
========================================

## 方案1: 安装FFmpeg + 自动化脚本 (推荐)

### 第一步: 安装FFmpeg

```bash
# Mac系统安装FFmpeg
brew install ffmpeg

# 或者下载安装包
# https://ffmpeg.org/download.html
```

### 第二步: 创建自动渲染脚本

保存为: `~/ai-empire/scripts/video-renderer.sh`

```bash
#!/bin/bash
# 🤖 AI视频自动渲染系统

INPUT_DIR="$HOME/ai-empire/launch/assets"
OUTPUT_DIR="$HOME/ai-empire/launch/portfolio"
mkdir -p $OUTPUT_DIR

echo "🎬 AI视频渲染系统启动"
echo "================================"

# 样片1: 产品展示视频 (自动渲染)
echo "🎬 渲染样片1: 产品展示..."
ffmpeg -i $INPUT_DIR/smartphone_product_1.mp4 -vf \
"drawtext=text='Tired of slow phones?':fontsize=60:fontcolor=white:box=1:boxcolor=black@0.5:x=(w-text_w)/2:y=(h-text_h)/2, \
fade=in:0:30, fade=out:570:30" \
-c:a copy -t 30 $OUTPUT_DIR/portfolio_1.mp4 -y

echo "✅ 样片1完成"

# 样片2: 教育视频
echo "🎬 渲染样片2: 教育内容..."
ffmpeg -i $INPUT_DIR/coffee_making_1.mp4 -vf \
"drawtext=text='3 Coffee Hacks':fontsize=70:fontcolor=white:box=1:boxcolor=black@0.5:x=(w-text_w)/2:y=100, \
drawtext=text='Hack #1: Secret Method':fontsize=40:fontcolor=yellow:x=(w-text_w)/2:y=200:enable='between(t,5,10)', \
drawtext=text='Hack #2: Pro Technique':fontsize=40:fontcolor=yellow:x=(w-text_w)/2:y=200:enable='between(t,11,16)', \
drawtext=text='Hack #3: Expert Tip':fontsize=40:fontcolor=yellow:x=(w-text_w)/2:y=200:enable='between(t,17,22)'" \
-c:a copy -t 30 $OUTPUT_DIR/portfolio_2.mp4 -y

echo "✅ 样片2完成"

# 样片3: 生活方式
echo "🎬 渲染样片3: 生活方式..."
ffmpeg -i $INPUT_DIR/morning_routine_1.mp4 -vf \
"drawtext=text='My Productive Morning':fontsize=60:fontcolor=white:box=1:boxcolor=black@0.5:x=(w-text_w)/2:y=100, \
drawtext=text='5AM - Wake Up':fontsize=35:fontcolor=white:x=100:y=h-150:enable='between(t,3,7)', \
drawtext=text='6AM - Workout':fontsize=35:fontcolor=white:x=100:y=h-150:enable='between(t,8,12)', \
drawtext=text='7AM - Coffee':fontsize=35:fontcolor=white:x=100:y=h-150:enable='between(t,13,17)', \
drawtext=text='8AM - Start Work':fontsize=35:fontcolor=white:x=100:y=h-150:enable='between(t,18,25)'" \
-c:a copy -t 30 $OUTPUT_DIR/portfolio_3.mp4 -y

echo "✅ 样片3完成"

echo ""
echo "================================"
echo "🎉 全部渲染完成!"
echo "输出位置: $OUTPUT_DIR"
echo ""
ls -lh $OUTPUT_DIR/
```

### 第三步: 一键执行

```bash
chmod +x ~/ai-empire/scripts/video-renderer.sh
bash ~/ai-empire/scripts/video-renderer.sh
```

========================================
🤖 方案2: AI视频生成器 (Python + MoviePy)

保存为: `~/ai-empire/scripts/ai_video_generator.py`

```python
#!/usr/bin/env python3
# 🤖 AI视频自动生成器

import os
from moviepy.editor import *
from moviepy.video.fx.all import fadein, fadeout

# 配置
INPUT_DIR = os.path.expanduser("~/ai-empire/launch/assets")
OUTPUT_DIR = os.path.expanduser("~/ai-empire/launch/portfolio")
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("🎬 AI视频生成器启动")
print("=" * 40)

# 样片1: 产品展示
def create_product_video():
    print("🎬 生成样片1: 产品展示...")
    
    # 加载素材
    clip = VideoFileClip(f"{INPUT_DIR}/smartphone_product_1.mp4").subclip(0, 10)
    
    # 添加文字
    txt_clip = (TextClip("Tired of slow phones?", 
                         fontsize=70, 
                         color='white',
                         font='Arial-Bold')
                .set_position('center')
                .set_duration(3)
                .fadein(0.5)
                .fadeout(0.5))
    
    # 合并
    video = CompositeVideoClip([clip, txt_clip])
    
    # 导出
    output_path = f"{OUTPUT_DIR}/portfolio_1.mp4"
    video.write_videofile(output_path, fps=30, codec='libx264')
    
    print(f"✅ 样片1完成: {output_path}")

# 样片2: 教育视频
def create_tutorial_video():
    print("🎬 生成样片2: 教育视频...")
    
    clip = VideoFileClip(f"{INPUT_DIR}/coffee_making_1.mp4").subclip(0, 15)
    
    # 多段文字
    texts = [
        ("3 Coffee Hacks", 0, 3, 'center'),
        ("Hack #1: Secret", 3, 6, 'center'),
        ("Hack #2: Pro Method", 6, 9, 'center'),
        ("Hack #3: Expert Tip", 9, 12, 'center'),
    ]
    
    txt_clips = []
    for text, start, end, pos in texts:
        txt = (TextClip(text, fontsize=60, color='yellow', font='Arial-Bold')
               .set_position(pos)
               .set_start(start)
               .set_duration(end-start)
               .fadein(0.3)
               .fadeout(0.3))
        txt_clips.append(txt)
    
    video = CompositeVideoClip([clip] + txt_clips)
    output_path = f"{OUTPUT_DIR}/portfolio_2.mp4"
    video.write_videofile(output_path, fps=30, codec='libx264')
    
    print(f"✅ 样片2完成: {output_path}")

# 样片3: 生活方式
def create_lifestyle_video():
    print("🎬 生成样片3: 生活方式...")
    
    clip = VideoFileClip(f"{INPUT_DIR}/morning_routine_1.mp4").subclip(0, 20)
    
    # 标题
    title = (TextClip("My Productive Morning", 
                      fontsize=70, 
                      color='white',
                      font='Arial-Bold')
             .set_position(('center', 100))
             .set_duration(4)
             .fadein(0.5))
    
    video = CompositeVideoClip([clip, title])
    output_path = f"{OUTPUT_DIR}/portfolio_3.mp4"
    video.write_videofile(output_path, fps=30, codec='libx264')
    
    print(f"✅ 样片3完成: {output_path}")

# 主程序
if __name__ == "__main__":
    try:
        create_product_video()
        create_tutorial_video()
        create_lifestyle_video()
        
        print("\n" + "=" * 40)
        print("🎉 全部视频生成完成!")
        print(f"输出位置: {OUTPUT_DIR}")
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        print("请安装依赖: pip install moviepy")
```

安装依赖:
```bash
pip install moviepy
python3 ~/ai-empire/scripts/ai_video_generator.py
```

========================================
⚡ 立即执行方案
========================================

## 你现在的选择:

**选项A: "用FFmpeg方案（最快）"**
→ 我立即给你安装脚本
→ 5分钟完成渲染

**选项B: "用Python方案（更灵活）"**
→ 安装MoviePy
→ 可以复杂动画

**选项C: "帮我检查之前装过什么"**
→ 我深度搜索系统
→ 找回之前的配置

**回复 A / B / C，我立即部署！** 🚀
========================================
