#!/usr/bin/env python3
"""
批量视频生成工具 - 网文视频生产流水线
基于即梦AI API
"""

import requests
import json
import os
import time
import concurrent.futures
from datetime import datetime
from typing import List, Dict

# 配置
API_BASE_URL = os.environ.get("JIMENG_API_URL", "http://localhost:8001")
DEFAULT_MODEL = "jimeng-video-seedance-2.0"
MAX_WORKERS = 3  # 并发数


def load_prompts_from_file(filepath: str) -> List[str]:
    """从文件加载prompt列表"""
    with open(filepath, 'r', encoding='utf-8') as f:
        prompts = [line.strip() for line in f if line.strip()]
    return prompts


def generate_single_video(
    prompt: str,
    session_id: str,
    model: str = DEFAULT_MODEL,
    index: int = 0
) -> Dict:
    """生成单个视频"""
    
    url = f"{API_BASE_URL}/v1/videos/generations"
    headers = {
        "Authorization": f"Bearer {session_id}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "prompt": prompt,
        "size": "1080x1920"
    }
    
    start_time = time.time()
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=120)
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            if "data" in result and len(result["data"]) > 0:
                video_url = result["data"][0].get("url")
                return {
                    "index": index,
                    "prompt": prompt,
                    "status": "success",
                    "video_url": video_url,
                    "time": elapsed,
                    "error": None
                }
        
        return {
            "index": index,
            "prompt": prompt,
            "status": "failed",
            "video_url": None,
            "time": elapsed,
            "error": f"HTTP {response.status_code}: {response.text[:200]}"
        }
        
    except Exception as e:
        return {
            "index": index,
            "prompt": prompt,
            "status": "error",
            "video_url": None,
            "time": time.time() - start_time,
            "error": str(e)
        }


def batch_generate(
    prompts: List[str],
    session_id: str,
    model: str = DEFAULT_MODEL,
    max_workers: int = MAX_WORKERS,
    output_file: str = None
) -> List[Dict]:
    """
    批量生成视频
    
    Args:
        prompts: prompt列表
        session_id: 即梦session id
        model: 模型名称
        max_workers: 最大并发数
        output_file: 结果保存文件
    
    Returns:
        生成结果列表
    """
    results = []
    total = len(prompts)
    
    print(f"🎬 批量视频生成开始")
    print(f"📊 总数: {total} 个")
    print(f"⚡ 并发: {max_workers}")
    print(f"🤖 模型: {model}")
    print("-" * 60)
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(
                generate_single_video, 
                prompt, 
                session_id, 
                model, 
                i
            ): i 
            for i, prompt in enumerate(prompts)
        }
        
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            results.append(result)
            
            status_icon = "✅" if result["status"] == "success" else "❌"
            print(f"{status_icon} [{result['index']+1}/{total}] "
                  f"耗时:{result['time']:.1f}s - {result['prompt'][:40]}...")
    
    # 统计
    success_count = sum(1 for r in results if r["status"] == "success")
    failed_count = total - success_count
    avg_time = sum(r["time"] for r in results) / total
    
    print("-" * 60)
    print(f"📈 生成完成!")
    print(f"   成功: {success_count}/{total}")
    print(f"   失败: {failed_count}/{total}")
    print(f"   平均耗时: {avg_time:.1f}秒")
    
    # 保存结果
    if output_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{output_file}_{timestamp}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"📁 结果已保存: {filename}")
    
    return results


def main():
    """主函数 - 批量生成示例"""
    import sys
    
    # 测试prompts - 网文视频场景
    test_prompts = [
        "富二代骑着电动车穿梭在城市夜景中，霓虹闪烁的摩天大楼，赛博朋克风格",
        "霸道总裁站在落地窗前，俯瞰城市夜景，背影孤独",
        "修仙者在云端打坐，身后是万丈霞光，仙鹤飞翔",
        "古代王妃在花园中独坐，樱花飘落，眼神忧伤",
        "电竞选手在赛场上获得冠军，捧起奖杯，全场欢呼",
    ]
    
    session_id = os.environ.get("JIMENG_SESSION_ID")
    if not session_id:
        print("❌ 请设置 JIMENG_SESSION_ID 环境变量")
        sys.exit(1)
    
    # 执行批量生成
    results = batch_generate(
        prompts=test_prompts,
        session_id=session_id,
        model=DEFAULT_MODEL,
        max_workers=2,
        output_file="batch_results"
    )
    
    # 输出成功视频URL
    print("\n🎥 成功生成的视频:")
    for r in results:
        if r["status"] == "success" and r["video_url"]:
            print(f"  - {r['prompt'][:30]}... -> {r['video_url']}")


if __name__ == "__main__":
    main()
