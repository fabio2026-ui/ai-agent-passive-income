#!/usr/bin/env python3
"""
小七全自动视频工厂 - 主入口
一句话生成视频：python3 video_factory.py "主题"
"""

import os
import sys
import asyncio
import argparse
from pathlib import Path

# 添加模块路径
sys.path.insert(0, str(Path(__file__).parent))

from auto_video import AutoVideoGenerator, create_video
from script_generator import generate_script

class VideoFactory:
    """视频工厂 - 整合AI脚本 + 自动生成"""
    
    def __init__(self):
        self.generator = AutoVideoGenerator()
        
    async def create(self, topic: str, style: str = "knowledge", 
                     duration: int = 60, voice: str = None) -> str:
        """
        全流程生成视频
        
        Args:
            topic: 视频主题/一句话描述
            style: 视频风格 (knowledge/story/product/hotspot)
            duration: 目标时长(秒)
            voice: 语音模型
        """
        print("=" * 60)
        print("🎬 小七全自动视频工厂")
        print("=" * 60)
        print(f"📌 主题: {topic}")
        print(f"🎨 风格: {style}")
        print(f"⏱️  时长: {duration}秒")
        print("-" * 60)
        
        # 1. 生成脚本
        print("\n📝 Step 1: 生成脚本...")
        script_data = generate_script(topic, style, duration)
        script = script_data["script"]
        print(f"✅ 脚本生成完成")
        print(f"   标题: {script_data['title']}")
        print(f"   字数: {len(script)}字")
        
        # 2. 选择语音
        if not voice:
            voice = "zh-CN-XiaoxiaoNeural"  # 默认中文女声
        print(f"\n🔊 Step 2: 使用语音: {voice}")
        
        # 3. 生成视频
        print("\n🎥 Step 3: 生成视频...")
        video_path = await self.generator.generate(
            topic=topic,
            script=script,
            voice=voice
        )
        
        # 4. 输出结果
        print("\n" + "=" * 60)
        print("✅ 视频生成完成!")
        print("=" * 60)
        print(f"\n📁 文件路径: {video_path}")
        print(f"📊 视频信息:")
        print(f"   • 分辨率: 1080x1920 (9:16竖屏)")
        print(f"   • 帧率: 30fps")
        print(f"   • 编码: H.264 + AAC")
        print(f"\n📝 标题建议:")
        print(f"   1. {script_data['title']}")
        for i, t in enumerate(script_data.get('alt_titles', [])[:2], 2):
            print(f"   {i}. {t}")
        print(f"\n🏷️  推荐标签: {', '.join(script_data['keywords'])}")
        print(f"🎵 BGM建议: {script_data['bgm_suggestion']}")
        
        return video_path
    
    async def create_with_script(self, topic: str, custom_script: str,
                                  voice: str = None) -> str:
        """使用自定义脚本生成视频"""
        print("=" * 60)
        print("🎬 小七全自动视频工厂 - 自定义脚本模式")
        print("=" * 60)
        
        if not voice:
            voice = "zh-CN-XiaoxiaoNeural"
            
        video_path = await self.generator.generate(
            topic=topic,
            script=custom_script,
            voice=voice
        )
        
        print(f"\n✅ 完成! 输出: {video_path}")
        return video_path


# CLI接口
def main():
    parser = argparse.ArgumentParser(
        description="小七全自动视频工厂 - 一句话生成视频"
    )
    parser.add_argument(
        "topic", 
        help="视频主题，例如: 'AI赚钱技巧'"
    )
    parser.add_argument(
        "--style", "-s",
        choices=["knowledge", "story", "product", "hotspot"],
        default="knowledge",
        help="视频风格 (默认: knowledge)"
    )
    parser.add_argument(
        "--duration", "-d",
        type=int,
        default=60,
        help="目标时长(秒) (默认: 60)"
    )
    parser.add_argument(
        "--voice", "-v",
        choices=[
            "zh-CN-XiaoxiaoNeural",  # 中文女声
            "zh-CN-YunxiNeural",      # 中文男声
            "en-US-JennyNeural",      # 英文女声
            "en-US-GuyNeural",        # 英文男声
        ],
        default="zh-CN-XiaoxiaoNeural",
        help="语音选择"
    )
    parser.add_argument(
        "--script", "-f",
        help="从文件读取自定义脚本"
    )
    
    args = parser.parse_args()
    
    factory = VideoFactory()
    
    try:
        if args.script:
            # 自定义脚本模式
            with open(args.script, 'r', encoding='utf-8') as f:
                custom_script = f.read()
            asyncio.run(factory.create_with_script(
                args.topic, custom_script, args.voice
            ))
        else:
            # 自动生成模式
            asyncio.run(factory.create(
                args.topic, args.style, args.duration, args.voice
            ))
    except KeyboardInterrupt:
        print("\n\n⚠️ 用户取消")
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        raise


if __name__ == "__main__":
    main()
