#!/usr/bin/env python3
"""
内容表现监控脚本
定期访问统计API，记录订阅增长和文章表现
"""

import requests
import json
import csv
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
import time
import logging

# 配置
API_BASE = "http://localhost:5000/api"
DATA_DIR = Path(__file__).parent / "data"
REPORTS_DIR = Path(__file__).parent / "reports"

# 日志配置
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ContentMonitor:
    """内容监控器"""
    
    def __init__(self):
        self.data_dir = DATA_DIR
        self.reports_dir = REPORTS_DIR
        self.data_dir.mkdir(exist_ok=True)
        self.reports_dir.mkdir(exist_ok=True)
        
        # 数据文件路径
        self.subscribers_file = self.data_dir / "subscribers_history.csv"
        self.performance_file = self.data_dir / "content_performance.csv"
        self.init_data_files()
    
    def init_data_files(self):
        """初始化数据文件"""
        # 订阅数历史
        if not self.subscribers_file.exists():
            with open(self.subscribers_file, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['timestamp', 'subscribers', 'growth', 'growth_rate'])
        
        # 内容表现数据
        if not self.performance_file.exists():
            with open(self.performance_file, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'timestamp', 'url', 'views', 'unique_visitors',
                    'avg_time_on_page', 'bounce_rate', 'conversions'
                ])
    
    def fetch_stats(self) -> dict:
        """获取当前统计数据"""
        try:
            response = requests.get(f"{API_BASE}/stats", timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"获取统计数据失败: {e}")
            return {}
    
    def fetch_content_stats(self, url: str) -> dict:
        """获取特定内容的表现数据"""
        try:
            response = requests.get(
                f"{API_BASE}/content-stats",
                params={'url': url},
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"获取内容数据失败 ({url}): {e}")
            return {}
    
    def record_subscribers(self):
        """记录订阅数"""
        stats = self.fetch_stats()
        if not stats:
            return
        
        current_subscribers = stats.get('subscribers', 0)
        timestamp = datetime.now().isoformat()
        
        # 计算增长
        growth = 0
        growth_rate = 0.0
        
        try:
            with open(self.subscribers_file, 'r') as f:
                reader = list(csv.DictReader(f))
                if reader:
                    last_record = reader[-1]
                    prev_subscribers = int(last_record['subscribers'])
                    growth = current_subscribers - prev_subscribers
                    if prev_subscribers > 0:
                        growth_rate = (growth / prev_subscribers) * 100
        except Exception:
            pass
        
        # 写入新记录
        with open(self.subscribers_file, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([timestamp, current_subscribers, growth, f"{growth_rate:.2f}"])
        
        logger.info(f"订阅数记录: {current_subscribers} (+{growth}, +{growth_rate:.2f}%)")
    
    def record_content_performance(self, content_list: list[dict]):
        """记录内容表现"""
        timestamp = datetime.now().isoformat()
        
        rows = []
        for content in content_list:
            url = content.get('url')
            stats = self.fetch_content_stats(url)
            
            rows.append([
                timestamp,
                url,
                stats.get('views', 0),
                stats.get('unique_visitors', 0),
                stats.get('avg_time_on_page', 0),
                stats.get('bounce_rate', 0),
                stats.get('conversions', 0)
            ])
        
        with open(self.performance_file, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerows(rows)
        
        logger.info(f"记录了 {len(rows)} 篇内容的表现数据")
    
    def get_growth_summary(self, days: int = 7) -> dict:
        """获取增长摘要"""
        try:
            with open(self.subscribers_file, 'r') as f:
                reader = list(csv.DictReader(f))
                if len(reader) < 2:
                    return {'error': '数据不足'}
                
                cutoff = datetime.now() - timedelta(days=days)
                recent = [
                    r for r in reader
                    if datetime.fromisoformat(r['timestamp']) > cutoff
                ]
                
                if not recent:
                    return {'error': '该时间段无数据'}
                
                start = int(recent[0]['subscribers'])
                end = int(recent[-1]['subscribers'])
                total_growth = end - start
                
                return {
                    'period_days': days,
                    'start_subscribers': start,
                    'end_subscribers': end,
                    'total_growth': total_growth,
                    'growth_rate': (total_growth / start * 100) if start > 0 else 0,
                    'daily_average': total_growth / days if days > 0 else 0
                }
        except Exception as e:
            return {'error': str(e)}
    
    def get_top_performing_content(self, limit: int = 5) -> list[dict]:
        """获取表现最佳的内容"""
        try:
            with open(self.performance_file, 'r') as f:
                reader = list(csv.DictReader(f))
                
            # 按URL聚合，获取最新数据
            content_stats = {}
            for row in reader:
                url = row['url']
                content_stats[url] = {
                    'url': url,
                    'views': int(row['views']),
                    'unique_visitors': int(row['unique_visitors']),
                    'conversions': int(row['conversions'])
                }
            
            # 按浏览量排序
            sorted_content = sorted(
                content_stats.values(),
                key=lambda x: x['views'],
                reverse=True
            )
            
            return sorted_content[:limit]
        except Exception as e:
            logger.error(f"获取表现数据失败: {e}")
            return []
    
    def run_monitoring_cycle(self):
        """运行一个监控周期"""
        logger.info("开始监控周期")
        
        # 记录订阅数
        self.record_subscribers()
        
        # 读取内容列表
        content_file = self.data_dir / "content_tracking.csv"
        if content_file.exists():
            with open(content_file, 'r') as f:
                reader = csv.DictReader(f)
                content_list = list(reader)
                self.record_content_performance(content_list)
        
        logger.info("监控周期完成")


def main():
    """主函数 - 可配置为定时任务"""
    monitor = ContentMonitor()
    
    # 单次运行模式
    monitor.run_monitoring_cycle()
    
    # 输出当前摘要
    summary = monitor.get_growth_summary(days=7)
    print("\n=== 7天增长摘要 ===")
    for key, value in summary.items():
        print(f"  {key}: {value}")
    
    print("\n=== 表现最佳内容 (Top 5) ===")
    top_content = monitor.get_top_performing_content(5)
    for i, content in enumerate(top_content, 1):
        print(f"  {i}. {content['url']}")
        print(f"     浏览: {content['views']} | 独立访客: {content['unique_visitors']} | 转化: {content['conversions']}")


if __name__ == "__main__":
    main()
