#!/usr/bin/env python3
"""
快速趋势检查 - 针对特定项目的实时分析
供机器人在做决策时快速调用
"""

import sys
sys.path.insert(0, '/root/.openclaw/workspace/shared_intel')

from intel_hub import get_intel, is_fresh

def quick_check(project_keywords: list) -> dict:
    """快速检查关键词趋势"""
    trends = get_intel("market", "google_trends")
    
    if not trends:
        return {"error": "无趋势数据", "action": "请先运行中央情报局更新"}
    
    rising = trends.get("rising", [])
    matches = []
    
    for keyword in project_keywords:
        for trend in rising:
            term = trend.get("term", "").lower()
            if keyword.lower() in term or term in keyword.lower():
                matches.append({
                    "keyword": keyword,
                    "matched_trend": trend.get("term"),
                    "growth": trend.get("growth")
                })
    
    return {
        "status": "hot" if len(matches) >= 2 else "warm" if len(matches) >= 1 else "cold",
        "matches": matches,
        "recommendation": "立即启动" if len(matches) >= 2 else "准备中" if len(matches) >= 1 else "观察"
    }

# 便捷查询函数
def check_yoga_socks():
    return quick_check(["yoga", "socks", "pilates", "grip"])

def check_pet_products():
    return quick_check(["pet", "dog", "cat", "grooming"])

def check_sleep_products():
    return quick_check(["sleep", "mask", "white noise"])

def check_kitchen_gadgets():
    return quick_check(["kitchen", "gadgets", "cooking", "food"])

def check_beauty_tools():
    return quick_check(["beauty", "skincare", "face roller", "gua sha"])

if __name__ == "__main__":
    print("🔍 快速趋势检查")
    print("=" * 50)
    
    projects = [
        ("瑜伽袜", check_yoga_socks),
        ("宠物用品", check_pet_products),
        ("睡眠产品", check_sleep_products),
        ("美容工具", check_beauty_tools),
    ]
    
    for name, check_fn in projects:
        result = check_fn()
        status_emoji = "🔥" if result["status"] == "hot" else "⚡" if result["status"] == "warm" else "⚪"
        print(f"\n{status_emoji} {name}: {result['recommendation']}")
        for m in result.get("matches", [])[:2]:
            print(f"   ↗ {m['matched_trend']}: {m['growth']}")
