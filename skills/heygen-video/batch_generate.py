#!/usr/bin/env python3
"""
批量生成HeyGen视频
从CSV或JSON文件读取多个脚本，批量生成视频
"""

import os
import sys
import json
import csv
import time
from heygen_video import create_video, check_video_status, download_video


def batch_generate_from_csv(csv_file: str):
    """从CSV文件批量生成视频"""
    # CSV格式: script,avatar_id,voice_id,output_name
    videos = []
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            videos.append({
                'script': row.get('script', ''),
                'avatar_id': row.get('avatar_id') or None,
                'voice_id': row.get('voice_id') or None,
                'output': row.get('output_name', f"video_{int(time.time())}.mp4")
            })
    
    print(f"📋 读取到 {len(videos)} 个视频任务")
    
    results = []
    for i, video in enumerate(videos, 1):
        print(f"\n{'='*50}")
        print(f"🎬 任务 {i}/{len(videos)}")
        print(f"{'='*50}")
        
        video_id = create_video(
            video['script'],
            video['avatar_id'],
            video['voice_id']
        )
        
        if video_id:
            results.append({
                'video_id': video_id,
                'output': video['output'],
                'script': video['script'][:50]
            })
        
        # 避免API限流
        if i < len(videos):
            print(f"⏳ 等待5秒继续下一个...")
            time.sleep(5)
    
    # 保存任务ID到文件
    batch_file = f"batch_{int(time.time())}.json"
    with open(batch_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ 已提交 {len(results)} 个视频任务")
    print(f"📁 任务列表已保存: {batch_file}")
    print(f"\n使用以下命令下载完成的视频:")
    print(f"  python3 batch_download.py {batch_file}")


def batch_download(batch_file: str):
    """批量下载已完成的视频"""
    with open(batch_file, 'r') as f:
        videos = json.load(f)
    
    print(f"📋 处理 {len(videos)} 个视频任务")
    
    for i, video in enumerate(videos, 1):
        print(f"\n🎬 下载视频 {i}/{len(videos)}: {video['video_id']}")
        download_video(video['video_id'], video['output'])


def generate_scripts_with_ai(topic: str, count: int = 5):
    """使用AI生成多个视频脚本"""
    # 这里可以接入OpenAI或其他AI服务生成脚本
    # 暂时返回示例
    scripts = [
        f"{topic} - 视频 {i+1}: 这是关于{topic}的内容介绍..."
        for i in range(count)
    ]
    return scripts


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("""
批量生成HeyGen视频

用法:
  # 从CSV批量生成
  python3 batch_generate.py videos.csv
  
  # 下载已完成的视频
  python3 batch_generate.py --download batch_1234567890.json

CSV格式示例:
  script,avatar_id,voice_id,output_name
  "大家好今天...","avatar_1","voice_1","video1.mp4"
  "这是第二个视频...","avatar_2","voice_2","video2.mp4"
        """)
        sys.exit(1)
    
    if sys.argv[1] == "--download":
        batch_download(sys.argv[2])
    else:
        batch_generate_from_csv(sys.argv[1])
