#!/usr/bin/env python3
"""
小七全自动视频生成系统
Auto Video Generator - 一句话出视频

Usage:
    python3 auto_video.py "你的视频主题"
"""

import os
import sys
import json
import asyncio
import subprocess
import tempfile
import requests
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse

# 视频生成配置
CONFIG = {
    "output_dir": "/root/.openclaw/workspace/auto-video/output",
    "temp_dir": "/root/.openclaw/workspace/auto-video/temp",
    "assets_dir": "/root/.openclaw/workspace/auto-video/assets",
    "video_width": 1080,
    "video_height": 1920,  # 9:16 竖屏
    "fps": 30,
    "default_duration": 30,  # 默认30秒
    "bgm_volume": 0.3,
    "voice_volume": 1.0,
}

# 语音配置 (Edge TTS - 免费)
VOICE_CONFIG = {
    "zh-CN-XiaoxiaoNeural": "zh-CN",      # 中文女声
    "zh-CN-YunxiNeural": "zh-CN",         # 中文男声  
    "en-US-JennyNeural": "en-US",         # 英文女声
    "en-US-GuyNeural": "en-US",           # 英文男声
}

class AutoVideoGenerator:
    def __init__(self):
        self.output_dir = Path(CONFIG["output_dir"])
        self.temp_dir = Path(CONFIG["temp_dir"])
        self.assets_dir = Path(CONFIG["assets_dir"])
        
        # 创建目录
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        
        self.script = ""
        self.audio_path = None
        self.video_path = None
        
    async def generate_audio(self, text: str, voice: str = "zh-CN-XiaoxiaoNeural") -> str:
        """使用 Edge TTS 生成语音"""
        import edge_tts
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = self.temp_dir / f"audio_{timestamp}.mp3"
        
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(output_file))
        
        print(f"✅ 语音生成完成: {output_file}")
        return str(output_file)
    
    def fetch_background_video(self, keyword: str) -> str:
        """获取背景视频素材 (使用 Pexels API)"""
        # 暂时使用纯色背景 + 动态效果
        # 后续可以接入 Pexels API
        return None
    
    def fetch_background_image(self, keyword: str) -> str:
        """获取背景图片 (使用 Unsplash)"""
        try:
            url = f"https://source.unsplash.com/1080x1920/?{keyword.replace(' ', ',')}"
            response = requests.get(url, timeout=10, allow_redirects=True)
            if response.status_code == 200:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                img_path = self.temp_dir / f"bg_{timestamp}.jpg"
                with open(img_path, "wb") as f:
                    f.write(response.content)
                print(f"✅ 背景图片获取完成: {img_path}")
                return str(img_path)
        except Exception as e:
            print(f"⚠️ 获取图片失败: {e}")
        return None
    
    def generate_subtitles(self, text: str, audio_duration: float) -> list:
        """生成字幕时间轴"""
        # 简单估算：每秒4个中文字符
        chars_per_second = 4
        words = text.replace('，', ' ').replace('。', ' ').replace('！', ' ').split()
        
        subtitles = []
        current_time = 0
        for word in words:
            if not word.strip():
                continue
            duration = len(word) / chars_per_second
            subtitles.append({
                "text": word,
                "start": current_time,
                "end": current_time + duration
            })
            current_time += duration
        
        return subtitles
    
    def create_video(self, audio_path: str, background_path: str = None, 
                     subtitles: list = None, title: str = "") -> str:
        """使用 MoviePy 合成视频"""
        try:
            from moviepy import (
                AudioFileClip, ImageClip, TextClip, 
                CompositeVideoClip, ColorClip
            )
        except ImportError:
            # 兼容 v1.x
            from moviepy.editor import (
                AudioFileClip, ImageClip, TextClip,
                CompositeVideoClip, ColorClip
            )
        
        # 加载音频
        audio = AudioFileClip(audio_path)
        duration = audio.duration
        
        # 创建背景
        if background_path and os.path.exists(background_path):
            bg = ImageClip(background_path).with_duration(duration)
            # 调整尺寸
            bg = bg.resized(height=CONFIG["video_height"])
            if bg.w < CONFIG["video_width"]:
                bg = bg.resized(width=CONFIG["video_width"])
        else:
            # 使用渐变色背景
            bg = ColorClip(
                size=(CONFIG["video_width"], CONFIG["video_height"]),
                color=(20, 30, 48)  # 深蓝灰
            ).with_duration(duration)
        
        clips = [bg]
        
        # 添加标题
        if title:
            try:
                title_clip = TextClip(
                    text=title[:30],
                    font="/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
                    font_size=60,
                    color="white",
                    stroke_color="black",
                    stroke_width=2
                ).with_duration(min(3, duration)).with_position("center")
                clips.append(title_clip)
            except Exception as e:
                print(f"⚠️ 标题渲染失败，跳过: {e}")
        
        # 添加字幕
        if subtitles:
            for sub in subtitles[:20]:  # 最多20个字幕片段
                if sub["end"] > duration:
                    break
                txt_clip = TextClip(
                    text=sub["text"],
                    font="/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
                    font_size=50,
                    color="white",
                    stroke_color="black", 
                    stroke_width=1,
                    bg_color=(0, 0, 0, 128)
                ).with_start(sub["start"]).with_duration(
                    sub["end"] - sub["start"]
                ).with_position(("center", 0.8), relative=True)
                clips.append(txt_clip)
        
        # 合成视频
        video = CompositeVideoClip(clips)
        video = video.with_audio(audio)
        
        # 输出
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = self.output_dir / f"video_{timestamp}.mp4"
        
        video.write_videofile(
            str(output_path),
            fps=CONFIG["fps"],
            codec="libx264",
            audio_codec="aac",
            threads=4
        )
        
        # 清理
        audio.close()
        video.close()
        
        print(f"✅ 视频生成完成: {output_path}")
        return str(output_path)
    
    async def generate(self, topic: str, script: str = None, 
                       voice: str = "zh-CN-XiaoxiaoNeural") -> str:
        """
        主生成流程
        
        Args:
            topic: 视频主题
            script: 可选的完整脚本，不提供则自动生成
            voice: 语音模型
        """
        print(f"🎬 开始生成视频: {topic}")
        print("=" * 50)
        
        # 1. 生成/使用脚本
        if not script:
            script = await self.generate_script(topic)
        self.script = script
        print(f"\n📝 脚本内容:\n{script[:200]}...")
        
        # 2. 生成语音
        print("\n🔊 正在生成语音...")
        self.audio_path = await self.generate_audio(script, voice)
        
        # 3. 获取背景素材
        print("\n🖼️ 正在获取背景素材...")
        bg_path = self.fetch_background_image(topic)
        
        # 4. 生成字幕
        print("\n📜 正在生成字幕...")
        subtitles = self.generate_subtitles(script, 30)
        
        # 5. 合成视频
        print("\n🎥 正在合成视频...")
        self.video_path = self.create_video(
            self.audio_path, 
            bg_path, 
            subtitles,
            topic
        )
        
        print("\n" + "=" * 50)
        print(f"🎉 视频生成成功!")
        print(f"📁 输出路径: {self.video_path}")
        
        return self.video_path
    
    async def generate_script(self, topic: str) -> str:
        """
        自动生成视频脚本
        实际使用时会调用AI生成，这里返回模板
        """
        # 这里预留AI生成接口
        template = f"""
大家好，今天我们来聊{topic}。

{topic}是当前最热门的话题之一。
很多人对此感兴趣，但不知道如何入手。

今天我就用一分钟时间，
给大家讲清楚{topic}的核心要点。

首先，{topic}的本质是什么？
它是技术与需求的完美结合。

其次，如何抓住{topic}的机会？
关键在于快速行动，持续迭代。

最后，记住一点：
行动永远比完美计划更重要。

喜欢就点赞关注，我们下期再见！
"""
        return template.strip()


# 对外接口函数
generator = AutoVideoGenerator()

async def create_video(topic: str, script: str = None) -> str:
    """
    一键生成视频
    
    Usage:
        video_path = await create_video("AI赚钱")
    """
    return await generator.generate(topic, script)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 auto_video.py '视频主题'")
        print("Example: python3 auto_video.py '如何用AI赚钱'")
        sys.exit(1)
    
    topic = sys.argv[1]
    asyncio.run(create_video(topic))
