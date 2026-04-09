#!/usr/bin/env python3
"""
HeyGen 自动视频生成器
输入文案，自动生成高质量AI数字人视频
"""

import os
import sys
import json
import time
import requests
from typing import Optional

# 配置
API_TOKEN = os.getenv("HEYGEN_API_TOKEN")
BASE_URL = "https://api.heygen.com/v2"

if not API_TOKEN:
    print("❌ 错误: 未设置 HEYGEN_API_TOKEN 环境变量")
    print("请先获取Token: https://app.heygen.com/settings/api")
    sys.exit(1)

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}


def list_avatars():
    """获取可用头像列表"""
    resp = requests.get(f"{BASE_URL}/avatars", headers=HEADERS)
    if resp.status_code == 200:
        avatars = resp.json()["data"]["avatars"]
        print("\n🎭 可用头像:")
        for avatar in avatars[:10]:  # 只显示前10个
            print(f"  - {avatar['avatar_id']}: {avatar.get('avatar_name', 'Unnamed')}")
        return avatars
    else:
        print(f"❌ 获取头像失败: {resp.text}")
        return []


def list_voices():
    """获取可用声音列表"""
    resp = requests.get(f"{BASE_URL}/voices", headers=HEADERS)
    if resp.status_code == 200:
        voices = resp.json()["data"]["voices"]
        print("\n🎙️  可用声音:")
        for voice in voices[:10]:  # 只显示前10个
            print(f"  - {voice['voice_id']}: {voice.get('display_name', 'Unnamed')} ({voice.get('language', 'unknown')})")
        return voices
    else:
        print(f"❌ 获取声音失败: {resp.text}")
        return []


def create_video(script: str, avatar_id: Optional[str] = None, voice_id: Optional[str] = None):
    """创建视频生成任务"""
    
    # 如果没有指定，使用默认的头像和声音
    if not avatar_id:
        avatar_id = "Daisy-inskirt-20220818"  # 默认女性头像
    if not voice_id:
        voice_id = "1bd001e7e50f421d8919866d8e3f8b58"  # 默认英文声音
    
    payload = {
        "video_inputs": [{
            "character": {
                "type": "avatar",
                "avatar_id": avatar_id,
                "avatar_style": "normal"
            },
            "voice": {
                "type": "text",
                "input_text": script,
                "voice_id": voice_id,
                "speed": 1.0
            },
            "background": {
                "type": "color",
                "value": "#f5f5f5"
            }
        }],
        "dimension": {
            "width": 1080,
            "height": 1920  # 9:16 竖屏，适合抖音
        },
        "title": f"Auto-generated video {int(time.time())}"
    }
    
    print(f"\n🎬 正在提交视频生成任务...")
    print(f"   文案: {script[:50]}...")
    
    resp = requests.post(
        f"{BASE_URL}/video/generate",
        headers=HEADERS,
        json=payload
    )
    
    if resp.status_code == 200:
        video_id = resp.json()["data"]["video_id"]
        print(f"✅ 任务创建成功，Video ID: {video_id}")
        return video_id
    else:
        print(f"❌ 创建失败: {resp.status_code}")
        print(f"   响应: {resp.text}")
        return None


def check_video_status(video_id: str):
    """查询视频状态"""
    resp = requests.get(
        f"{BASE_URL}/video/status?video_id={video_id}",
        headers=HEADERS
    )
    
    if resp.status_code == 200:
        data = resp.json()["data"]
        status = data.get("status")
        return status, data
    else:
        return "error", resp.text


def download_video(video_id: str, output_path: str):
    """下载生成的视频"""
    # 轮询等待视频生成完成
    print(f"\n⏳ 等待视频生成完成...")
    max_retries = 60  # 最多等待10分钟
    
    for i in range(max_retries):
        status, data = check_video_status(video_id)
        
        if status == "completed":
            video_url = data.get("video_url")
            if video_url:
                print(f"✅ 视频生成完成!")
                print(f"🔗 下载链接: {video_url}")
                
                # 下载视频
                print(f"⬇️  正在下载视频...")
                video_resp = requests.get(video_url)
                
                if video_resp.status_code == 200:
                    with open(output_path, 'wb') as f:
                        f.write(video_resp.content)
                    print(f"✅ 视频已保存: {output_path}")
                    return True
                else:
                    print(f"❌ 下载失败: {video_resp.status_code}")
                    return False
        
        elif status == "failed":
            print(f"❌ 视频生成失败: {data}")
            return False
        
        elif status == "processing" or status == "pending":
            print(f"   处理中... ({i+1}/{max_retries})")
            time.sleep(10)  # 每10秒检查一次
        
        else:
            print(f"   未知状态: {status}")
            time.sleep(10)
    
    print(f"❌ 等待超时")
    return False


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("""
用法:
  python3 heygen_video.py "你的视频文案" [--avatar AVATAR_ID] [--voice VOICE_ID] [--output FILE.mp4]

示例:
  python3 heygen_video.py "大家好，今天我们来聊AI工具..."
  python3 heygen_video.py "文案内容" --output myvideo.mp4

选项:
  --list-avatars    显示可用头像列表
  --list-voices     显示可用声音列表
        """)
        sys.exit(1)
    
    # 解析参数
    if sys.argv[1] == "--list-avatars":
        list_avatars()
        return
    
    if sys.argv[1] == "--list-voices":
        list_voices()
        return
    
    script = sys.argv[1]
    avatar_id = None
    voice_id = None
    output_path = f"heygen_video_{int(time.time())}.mp4"
    
    # 解析其他参数
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--avatar" and i + 1 < len(sys.argv):
            avatar_id = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--voice" and i + 1 < len(sys.argv):
            voice_id = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--output" and i + 1 < len(sys.argv):
            output_path = sys.argv[i + 1]
            i += 2
        else:
            i += 1
    
    # 创建视频
    video_id = create_video(script, avatar_id, voice_id)
    
    if video_id:
        # 下载视频
        download_video(video_id, output_path)
    else:
        print("❌ 视频创建失败")
        sys.exit(1)


if __name__ == "__main__":
    main()
