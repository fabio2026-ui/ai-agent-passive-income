#!/usr/bin/env python3
"""
A/B测试框架
支持标题测试、CTA测试、内容变体测试
"""

import json
import csv
import random
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional, List
import hashlib

@dataclass
class ABTestVariant:
    """A/B测试变体"""
    variant_id: str          # 变体标识 (如: 'control', 'variant-a')
    headline: str            # 标题
    subheadline: Optional[str] = None  # 副标题
    cta_text: str = "了解更多"  # CTA按钮文字
    cta_color: str = "#007bff"  # CTA按钮颜色
    content_block: Optional[str] = None  # 内容变体
    traffic_allocation: int = 50  # 流量分配百分比

@dataclass
class ABTest:
    """A/B测试定义"""
    test_id: str
    test_name: str
    test_type: str  # 'headline', 'cta', 'content', 'multi'
    url: str
    variants: List[ABTestVariant]
    start_date: str
    end_date: Optional[str] = None
    min_sample_size: int = 100
    confidence_level: float = 0.95
    status: str = "active"  # active, paused, completed


class ABTestFramework:
    """A/B测试框架"""
    
    def __init__(self, data_dir: str = "../data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        self.tests_file = self.data_dir / "ab_tests.json"
        self.results_file = self.data_dir / "ab_test_results.csv"
        self.init_files()
    
    def init_files(self):
        """初始化数据文件"""
        if not self.tests_file.exists():
            with open(self.tests_file, 'w') as f:
                json.dump({'tests': []}, f, indent=2)
        
        if not self.results_file.exists():
            with open(self.results_file, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'timestamp', 'test_id', 'variant_id', 'visitor_id',
                    'impression', 'click', 'conversion', 'time_on_page'
                ])
    
    def create_test(self, test: ABTest) -> str:
        """创建新测试"""
        # 验证流量分配
        total_allocation = sum(v.traffic_allocation for v in test.variants)
        if total_allocation != 100:
            raise ValueError(f"流量分配总和必须等于100%, 当前: {total_allocation}%")
        
        # 加载现有测试
        with open(self.tests_file, 'r') as f:
            data = json.load(f)
        
        # 检查ID是否已存在
        if any(t['test_id'] == test.test_id for t in data['tests']):
            raise ValueError(f"测试ID已存在: {test.test_id}")
        
        # 添加新测试
        test_dict = {
            'test_id': test.test_id,
            'test_name': test.test_name,
            'test_type': test.test_type,
            'url': test.url,
            'variants': [asdict(v) for v in test.variants],
            'start_date': test.start_date,
            'end_date': test.end_date,
            'min_sample_size': test.min_sample_size,
            'confidence_level': test.confidence_level,
            'status': test.status
        }
        data['tests'].append(test_dict)
        
        with open(self.tests_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        return test.test_id
    
    def get_variant_for_visitor(self, test_id: str, visitor_id: str) -> Optional[ABTestVariant]:
        """为访问者分配变体 (基于哈希的一致性分配)"""
        test = self.get_test(test_id)
        if not test or test['status'] != 'active':
            return None
        
        # 使用哈希确保同一访问者始终看到相同变体
        hash_input = f"{test_id}:{visitor_id}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        
        # 根据流量分配选择变体
        allocation_point = hash_value % 100
        cumulative = 0
        
        for variant_data in test['variants']:
            cumulative += variant_data['traffic_allocation']
            if allocation_point < cumulative:
                return ABTestVariant(**variant_data)
        
        return ABTestVariant(**test['variants'][-1])
    
    def get_test(self, test_id: str) -> Optional[dict]:
        """获取测试详情"""
        with open(self.tests_file, 'r') as f:
            data = json.load(f)
        
        for test in data['tests']:
            if test['test_id'] == test_id:
                return test
        return None
    
    def record_event(self, test_id: str, variant_id: str, visitor_id: str,
                     event_type: str, value: float = 0):
        """记录测试事件"""
        timestamp = datetime.now().isoformat()
        
        impression = 1 if event_type == 'impression' else 0
        click = 1 if event_type == 'click' else 0
        conversion = 1 if event_type == 'conversion' else 0
        time_on_page = value if event_type == 'time_on_page' else 0
        
        with open(self.results_file, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                timestamp, test_id, variant_id, visitor_id,
                impression, click, conversion, time_on_page
            ])
    
    def get_test_results(self, test_id: str) -> dict:
        """获取测试结果"""
        test = self.get_test(test_id)
        if not test:
            return {'error': '测试不存在'}
        
        # 读取结果数据
        with open(self.results_file, 'r') as f:
            reader = csv.DictReader(f)
            results = [r for r in reader if r['test_id'] == test_id]
        
        # 聚合变体数据
        variant_stats = {}
        for variant in test['variants']:
            variant_id = variant['variant_id']
            variant_results = [r for r in results if r['variant_id'] == variant_id]
            
            impressions = sum(int(r['impression']) for r in variant_results)
            clicks = sum(int(r['click']) for r in variant_results)
            conversions = sum(int(r['conversion']) for r in variant_results)
            
            variant_stats[variant_id] = {
                'variant_id': variant_id,
                'headline': variant['headline'],
                'impressions': impressions,
                'clicks': clicks,
                'conversions': conversions,
                'ctr': (clicks / impressions * 100) if impressions > 0 else 0,
                'conversion_rate': (conversions / clicks * 100) if clicks > 0 else 0,
                'traffic_allocation': variant['traffic_allocation']
            }
        
        return {
            'test_id': test_id,
            'test_name': test['test_name'],
            'test_type': test['test_type'],
            'status': test['status'],
            'variants': list(variant_stats.values()),
            'total_impressions': sum(v['impressions'] for v in variant_stats.values()),
            'started_at': test['start_date']
        }
    
    def list_active_tests(self) -> list:
        """列出活跃测试"""
        with open(self.tests_file, 'r') as f:
            data = json.load(f)
        
        return [t for t in data['tests'] if t['status'] == 'active']
    
    def complete_test(self, test_id: str, winning_variant: Optional[str] = None):
        """完成测试"""
        with open(self.tests_file, 'r') as f:
            data = json.load(f)
        
        for test in data['tests']:
            if test['test_id'] == test_id:
                test['status'] = 'completed'
                test['end_date'] = datetime.now().isoformat()
                test['winning_variant'] = winning_variant
                break
        
        with open(self.tests_file, 'w') as f:
            json.dump(data, f, indent=2)


# 预设测试模板
class TestTemplates:
    """A/B测试模板"""
    
    @staticmethod
    def headline_test(url: str, original: str, variant: str) -> ABTest:
        """标题测试模板"""
        return ABTest(
            test_id=f"headline_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            test_name="标题优化测试",
            test_type="headline",
            url=url,
            variants=[
                ABTestVariant(
                    variant_id="control",
                    headline=original,
                    traffic_allocation=50
                ),
                ABTestVariant(
                    variant_id="variant-a",
                    headline=variant,
                    traffic_allocation=50
                )
            ],
            start_date=datetime.now().isoformat(),
            min_sample_size=200
        )
    
    @staticmethod
    def cta_test(url: str, original_text: str, variant_text: str,
                 original_color: str = "#007bff", variant_color: str = "#28a745") -> ABTest:
        """CTA测试模板"""
        return ABTest(
            test_id=f"cta_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            test_name="CTA按钮优化测试",
            test_type="cta",
            url=url,
            variants=[
                ABTestVariant(
                    variant_id="control",
                    headline="默认标题",
                    cta_text=original_text,
                    cta_color=original_color,
                    traffic_allocation=50
                ),
                ABTestVariant(
                    variant_id="variant-a",
                    headline="默认标题",
                    cta_text=variant_text,
                    cta_color=variant_color,
                    traffic_allocation=50
                )
            ],
            start_date=datetime.now().isoformat(),
            min_sample_size=300
        )


def main():
    """CLI示例"""
    framework = ABTestFramework()
    
    # 创建示例测试
    test = TestTemplates.headline_test(
        url="https://telegra.ph/article-01-intro",
        original="AI工具入门指南",
        variant="7天掌握AI工具：从新手到专家"
    )
    
    test_id = framework.create_test(test)
    print(f"创建测试: {test_id}")
    
    # 模拟访问者分配
    visitor_id = "visitor_123"
    variant = framework.get_variant_for_visitor(test_id, visitor_id)
    print(f"访问者 {visitor_id} 看到变体: {variant.variant_id}")
    print(f"标题: {variant.headline}")


if __name__ == "__main__":
    main()
