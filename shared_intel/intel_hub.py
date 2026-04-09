#!/usr/bin/env python3
"""
中央情报共享库 (Central Intelligence Hub)
所有机器人的信息共享中心
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Optional
import time

class IntelHub:
    """中央情报中心 - 信息共享与缓存管理"""
    
    BASE_PATH = Path("/root/.openclaw/workspace/shared_intel")
    
    # 缓存有效期配置（小时）
    CACHE_TTL = {
        "financial": 6,      # 金融数据：6小时
        "market": 168,       # 市场趋势：7天
        "supply_chain": 168, # 供应链：7天
        "creative": 720,     # 创意趋势：30天
    }
    
    def __init__(self):
        self._ensure_directories()
        self.api_call_count = 0
        self.api_call_log = []
    
    def _ensure_directories(self):
        """确保目录结构存在"""
        dirs = ["financial", "market", "supply_chain", "creative", "shared"]
        for d in dirs:
            (self.BASE_PATH / d).mkdir(parents=True, exist_ok=True)
    
    def get(self, category: str, key: str) -> Optional[Dict]:
        """
        获取数据
        如果缓存有效，返回缓存数据
        如果缓存过期，返回None（调用方需请求更新）
        """
        filepath = self.BASE_PATH / category / f"{key}.json"
        
        if not filepath.exists():
            return None
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # 检查是否过期
            if self._is_expired(data, category):
                return {"_expired": True, "_data": data.get("value"), "_cached_at": data.get("cached_at")}
            
            return data.get("value")
            
        except Exception as e:
            print(f"[IntelHub] Error reading {filepath}: {e}")
            return None
    
    def set(self, category: str, key: str, value: Any, metadata: Dict = None):
        """写入数据到共享库"""
        filepath = self.BASE_PATH / category / f"{key}.json"
        
        data = {
            "value": value,
            "cached_at": datetime.now().isoformat(),
            "expires_at": (datetime.now() + timedelta(hours=self.CACHE_TTL.get(category, 24))).isoformat(),
            "metadata": metadata or {},
            "access_count": 0,
            "last_accessed": datetime.now().isoformat()
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"[IntelHub] Saved: {category}/{key}")
    
    def _is_expired(self, data: Dict, category: str) -> bool:
        """检查数据是否过期"""
        expires_at = data.get("expires_at")
        if not expires_at:
            return True
        
        try:
            expiry = datetime.fromisoformat(expires_at)
            return datetime.now() > expiry
        except:
            return True
    
    def is_fresh(self, category: str, key: str) -> bool:
        """检查数据是否新鲜（未过期）"""
        filepath = self.BASE_PATH / category / f"{key}.json"
        
        if not filepath.exists():
            return False
        
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            return not self._is_expired(data, category)
        except:
            return False
    
    def touch(self, category: str, key: str):
        """更新访问记录"""
        filepath = self.BASE_PATH / category / f"{key}.json"
        
        if filepath.exists():
            try:
                with open(filepath, 'r') as f:
                    data = json.load(f)
                
                data["access_count"] = data.get("access_count", 0) + 1
                data["last_accessed"] = datetime.now().isoformat()
                
                with open(filepath, 'w') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
            except:
                pass
    
    def log_api_call(self, api_name: str, params: Dict = None, success: bool = True):
        """记录API调用"""
        self.api_call_count += 1
        
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "api": api_name,
            "params": params,
            "success": success,
            "count": self.api_call_count
        }
        
        self.api_call_log.append(log_entry)
        
        # 保存到文件
        log_file = self.BASE_PATH / "shared" / "api_call_log.json"
        try:
            existing = []
            if log_file.exists():
                with open(log_file, 'r') as f:
                    existing = json.load(f)
            existing.append(log_entry)
            # 只保留最近100条
            existing = existing[-100:]
            with open(log_file, 'w') as f:
                json.dump(existing, f, ensure_ascii=False, indent=2)
        except:
            pass
    
    def get_stats(self) -> Dict:
        """获取使用统计"""
        stats = {
            "total_api_calls": self.api_call_count,
            "cache_hits": 0,
            "cache_misses": 0,
            "categories": {}
        }
        
        for category in self.CACHE_TTL.keys():
            cat_path = self.BASE_PATH / category
            if cat_path.exists():
                files = list(cat_path.glob("*.json"))
                stats["categories"][category] = len(files)
        
        return stats
    
    def list_all(self, category: str = None) -> Dict[str, list]:
        """列出所有缓存的数据"""
        result = {}
        
        categories = [category] if category else self.CACHE_TTL.keys()
        
        for cat in categories:
            cat_path = self.BASE_PATH / cat
            if cat_path.exists():
                result[cat] = [f.stem for f in cat_path.glob("*.json")]
        
        return result
    
    def clear_expired(self):
        """清理过期缓存"""
        cleared = 0
        
        for category in self.CACHE_TTL.keys():
            cat_path = self.BASE_PATH / category
            if not cat_path.exists():
                continue
            
            for filepath in cat_path.glob("*.json"):
                try:
                    with open(filepath, 'r') as f:
                        data = json.load(f)
                    
                    if self._is_expired(data, category):
                        filepath.unlink()
                        cleared += 1
                except:
                    pass
        
        print(f"[IntelHub] Cleared {cleared} expired cache files")
        return cleared


# 便捷函数，供机器人直接使用
def get_intel(category: str, key: str) -> Optional[Any]:
    """获取情报（机器人直接调用）"""
    hub = IntelHub()
    result = hub.get(category, key)
    
    # 标记已访问
    hub.touch(category, key)
    
    # 如果过期，打印提醒
    if isinstance(result, dict) and result.get("_expired"):
        print(f"[IntelHub] ⚠️ {category}/{key} 已过期，建议更新")
        return result.get("_data")
    
    return result

def set_intel(category: str, key: str, value: Any, metadata: Dict = None):
    """设置情报（中央调度器调用）"""
    hub = IntelHub()
    hub.set(category, key, value, metadata)

def is_fresh(category: str, key: str) -> bool:
    """检查是否新鲜"""
    return IntelHub().is_fresh(category, key)


if __name__ == "__main__":
    import sys
    
    hub = IntelHub()
    
    if len(sys.argv) < 2:
        print("🔬 Central Intelligence Hub - 中央情报共享库")
        print("=" * 50)
        print("\nUsage:")
        print("  python intel_hub.py status      # 查看状态")
        print("  python intel_hub.py list        # 列出所有缓存")
        print("  python intel_hub.py clear       # 清理过期缓存")
        print("  python intel_hub.py test        # 测试写入/读取")
        sys.exit(0)
    
    cmd = sys.argv[1]
    
    if cmd == "status":
        stats = hub.get_stats()
        print("📊 IntelHub 状态")
        print(f"  API调用次数: {stats['total_api_calls']}")
        print(f"  缓存分类:")
        for cat, count in stats['categories'].items():
            print(f"    {cat}: {count} 项")
    
    elif cmd == "list":
        all_data = hub.list_all()
        print("📁 缓存内容")
        for cat, items in all_data.items():
            print(f"\n  {cat}:")
            for item in items:
                print(f"    - {item}")
    
    elif cmd == "clear":
        cleared = hub.clear_expired()
        print(f"✅ 清理完成，删除 {cleared} 个过期文件")
    
    elif cmd == "test":
        # 测试写入
        hub.set("financial", "test_gold", {"price": 1950.50, "currency": "USD"})
        print("✅ 写入测试数据")
        
        # 测试读取
        data = hub.get("financial", "test_gold")
        print(f"✅ 读取测试数据: {data}")
        
        # 检查新鲜度
        fresh = hub.is_fresh("financial", "test_gold")
        print(f"✅ 新鲜度检查: {fresh}")
