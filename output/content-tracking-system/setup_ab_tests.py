#!/usr/bin/env python3
"""
A/B测试预设配置
为20篇Telegra.ph文章预配置A/B测试
"""

from datetime import datetime
import sys
sys.path.append('.')

from scripts.ab_test_framework import ABTestFramework, TestTemplates, ABTest, ABTestVariant

def setup_ab_tests():
    """设置预设A/B测试"""
    framework = ABTestFramework()
    
    # Article-01: 标题测试
    test1 = TestTemplates.headline_test(
        url="https://telegra.ph/article-01-intro",
        original="AI工具入门指南",
        variant="7天掌握AI工具：从新手到专家"
    )
    test1.test_id = "article01_headline"
    framework.create_test(test1)
    print(f"✓ 创建测试: {test1.test_id}")
    
    # Article-02: CTA测试
    test2 = TestTemplates.cta_test(
        url="https://telegra.ph/article-02-prompts",
        original_text="了解更多",
        variant_text="立即学习",
        original_color="#007bff",
        variant_color="#28a745"
    )
    test2.test_id = "article02_cta"
    framework.create_test(test2)
    print(f"✓ 创建测试: {test2.test_id}")
    
    # Article-03: 多变量测试
    test3 = ABTest(
        test_id="article03_multi",
        test_name="多变量优化测试",
        test_type="multi",
        url="https://telegra.ph/article-03-workflow",
        variants=[
            ABTestVariant(
                variant_id="control",
                headline="工作流优化指南",
                cta_text="查看详情",
                traffic_allocation=33
            ),
            ABTestVariant(
                variant_id="variant-a",
                headline="效率翻倍：工作流优化实战",
                cta_text="立即优化",
                traffic_allocation=33
            ),
            ABTestVariant(
                variant_id="variant-b",
                headline="专业人士必看：工作流设计",
                cta_text="免费学习",
                traffic_allocation=34
            )
        ],
        start_date=datetime.now().isoformat(),
        min_sample_size=300
    )
    framework.create_test(test3)
    print(f"✓ 创建测试: {test3.test_id}")
    
    # Article-04: 标题长度测试
    test4 = ABTest(
        test_id="article04_length",
        test_name="标题长度测试",
        test_type="headline",
        url="https://telegra.ph/article-04-automation",
        variants=[
            ABTestVariant(
                variant_id="short",
                headline="自动化实践",
                traffic_allocation=50
            ),
            ABTestVariant(
                variant_id="long",
                headline="自动化实践：从零开始构建你的第一个自动化工作流",
                traffic_allocation=50
            )
        ],
        start_date=datetime.now().isoformat(),
        min_sample_size=250
    )
    framework.create_test(test4)
    print(f"✓ 创建测试: {test4.test_id}")
    
    # Article-05: 受众定位测试
    test5 = ABTest(
        test_id="article05_audience",
        test_name="受众定位测试",
        test_type="content",
        url="https://telegra.ph/article-05-integration",
        variants=[
            ABTestVariant(
                variant_id="tech",
                headline="系统集成：技术实现指南",
                traffic_allocation=50
            ),
            ABTestVariant(
                variant_id="business",
                headline="系统集成：商业价值与ROI分析",
                traffic_allocation=50
            )
        ],
        start_date=datetime.now().isoformat(),
        min_sample_size=200
    )
    framework.create_test(test5)
    print(f"✓ 创建测试: {test5.test_id}")
    
    print("\n✅ 已创建 5 个预设A/B测试")
    print("   查看: data/ab_tests.json")

if __name__ == "__main__":
    setup_ab_tests()
