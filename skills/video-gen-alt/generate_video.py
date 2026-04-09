#!/usr/bin/env python3
"""
即梦AI视频生成脚本 - 剪映替代方案
生成速度: ~41秒/5秒视频
"""

import requests
import json
import sys
import os
import time
from datetime import datetime

# 配置
JIMENG_API_URL = "http://localhost:8001/v1/videos/generations"
DEFAULT_MODEL = "jimeng-video-seedance-2.0"


def get_session_id():
    """从环境变量获取session id"""
    session_id = os.environ.get("JIMENG_SESSION_ID")
    if not session_id:
        print("❌ 错误: 未设置 JIMENG_SESSION_ID 环境变量")
        print("请从即梦官网获取sessionid并设置:")
        print("export JIMENG_SESSION_ID='your_session_id'")
        sys.exit(1)
    return session_id


def generate_video(prompt: str, model: str = None, output_dir: str = "./output"):
    """
    生成视频
    
    Args:
        prompt: 视频描述prompt
        model: 模型名称，默认 jimeng-video-seedance-2.0
        output_dir: 输出目录
    """
    session_id = get_session_id()
    model = model or DEFAULT_MODEL
    
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    headers = {
        "Authorization": f"Bearer {session_id}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "prompt": prompt,
        "size": "1080x1920"  # 竖屏9:16
    }
    
    print(f"🎬 开始生成视频...")
    print(f"📝 Prompt: {prompt}")
    print(f"🤖 Model: {model}")
    print(f"⏱️  预计等待: 30-60秒")
    print("-" * 50)
    
    start_time = time.time()
    
    try:
        response = requests.post(
            JIMENG_API_URL,
            headers=headers,
            json=payload,
            timeout=120
        )
        
        elapsed_time = time.time() - start_time
        
        if response.status_code != 200:
            print(f"❌ 请求失败: {response.status_code}")
            print(response.text)
            return None
        
        result = response.json()
        
        # 解析返回结果
        if "data" in result and len(result["data"]) > 0:
            video_data = result["data"][0]
            video_url = video_data.get("url")
            
            if video_url:
                print(f"✅ 视频生成成功!")
                print(f"⏱️  实际耗时: {elapsed_time:.1f}秒")
                print(f"🔗 视频URL: {video_url}")
                
                # 下载视频
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"video_{timestamp}.mp4"
                filepath = os.path.join(output_dir, filename)
                
                print(f"📥 下载视频中...")
                video_response = requests.get(video_url, timeout=60)
                
                with open(filepath, "wb") as f:
                    f.write(video_response.content)
                
                print(f"✅ 视频已保存: {filepath}")
                return filepath
            else:
                print(f"⚠️  未找到视频URL")
                print(json.dumps(result, indent=2, ensure_ascii=False))
                return None
        else:
            print(f"⚠️  响应格式异常")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return None
            
    except requests.exceptions.Timeout:
        print(f"❌ 请求超时，但视频可能仍在生成中")
        return None
    except Exception as e:
        print(f"❌ 错误: {e}")
        return None


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python generate_video.py <prompt> [model]")
        print("\n示例:")
        print('python generate_video.py "富二代骑着电动车穿梭在城市夜景中，霓虹闪烁"')
        print('\n可用模型:')
        print('  - jimeng-video-seedance-2.0 (默认)')
        print('  - jimeng-video-seedance-2.0-fast')
        print('  - jimeng-video-3.5-pro')
        sys.exit(1)
    
    prompt = sys.argv[1]
    model = sys.argv[2] if len(sys.argv) > 2 else None
    
    result = generate_video(prompt, model)
    
    if result:
        print(f"\n🎉 成功! 视频已生成: {result}")
        sys.exit(0)
    else:
        print(f"\n❌ 视频生成失败")
        sys.exit(1)


if __name__ == "__main__":
    main()
