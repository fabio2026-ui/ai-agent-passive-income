#!/usr/bin/env python3
"""
周报生成器 (无图表版本)
自动从监控数据生成内容性能周报
"""

import csv
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict


class WeeklyReportGenerator:
    """周报生成器 (无图表)"""
    
    def __init__(self, data_dir: str = "../data", reports_dir: str = "../reports"):
        self.data_dir = Path(data_dir)
        self.reports_dir = Path(reports_dir)
        self.reports_dir.mkdir(exist_ok=True)
        
        self.subscribers_file = self.data_dir / "subscribers_history.csv"
        self.performance_file = self.data_dir / "content_performance.csv"
        self.content_file = self.data_dir / "content_tracking.csv"
    
    def load_subscriber_data(self, days: int = 7) -> List[Dict]:
        """加载订阅者数据"""
        if not self.subscribers_file.exists():
            return []
        
        cutoff = datetime.now() - timedelta(days=days)
        
        with open(self.subscribers_file, 'r') as f:
            reader = csv.DictReader(f)
            return [
                row for row in reader
                if datetime.fromisoformat(row['timestamp']) > cutoff
            ]
    
    def load_performance_data(self, days: int = 7) -> List[Dict]:
        """加载内容表现数据"""
        if not self.performance_file.exists():
            return []
        
        cutoff = datetime.now() - timedelta(days=days)
        
        with open(self.performance_file, 'r') as f:
            reader = csv.DictReader(f)
            return [
                row for row in reader
                if datetime.fromisoformat(row['timestamp']) > cutoff
            ]
    
    def load_content_list(self) -> List[Dict]:
        """加载内容列表"""
        if not self.content_file.exists():
            return []
        
        with open(self.content_file, 'r') as f:
            return list(csv.DictReader(f))
    
    def calculate_metrics(self) -> Dict:
        """计算周报指标"""
        subscriber_data = self.load_subscriber_data(7)
        performance_data = self.load_performance_data(7)
        content_list = self.load_content_list()
        
        # 订阅者指标
        if len(subscriber_data) >= 2:
            start_subs = int(subscriber_data[0]['subscribers'])
            end_subs = int(subscriber_data[-1]['subscribers'])
            total_growth = end_subs - start_subs
            growth_rate = (total_growth / start_subs * 100) if start_subs > 0 else 0
        else:
            start_subs = end_subs = total_growth = growth_rate = 0
        
        # 内容表现汇总
        total_views = sum(int(row['views']) for row in performance_data)
        total_visitors = sum(int(row['unique_visitors']) for row in performance_data)
        total_conversions = sum(int(row['conversions']) for row in performance_data)
        
        # 平均指标
        avg_bounce_rate = sum(float(row['bounce_rate']) for row in performance_data) / len(performance_data) if performance_data else 0
        avg_time = sum(float(row['time_on_page']) for row in performance_data) / len(performance_data) if performance_data else 0
        
        # 已发布内容数量
        published_count = len([c for c in content_list if c.get('status') == 'published'])
        draft_count = len([c for c in content_list if c.get('status') == 'draft'])
        total_count = published_count + draft_count
        
        return {
            'week_ending': datetime.now().strftime('%Y-%m-%d'),
            'subscribers': {
                'start': start_subs,
                'current': end_subs,
                'growth': total_growth,
                'growth_rate': round(growth_rate, 2)
            },
            'content': {
                'total_views': total_views,
                'unique_visitors': total_visitors,
                'conversions': total_conversions,
                'conversion_rate': round((total_conversions / total_visitors * 100), 2) if total_visitors > 0 else 0,
                'avg_bounce_rate': round(avg_bounce_rate, 2),
                'avg_time_on_page': round(avg_time, 2)
            },
            'publishing': {
                'published': published_count,
                'draft': draft_count,
                'total': total_count,
                'published_pct': (published_count / total_count * 100) if total_count > 0 else 0,
                'draft_pct': (draft_count / total_count * 100) if total_count > 0 else 0
            }
        }
    
    def generate_markdown_report(self, metrics: Dict) -> str:
        """生成Markdown格式周报"""
        report = f"""# 📊 内容升级周报

**报告周期**: {metrics['week_ending']}  
**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M')}

---

## 📈 订阅增长

| 指标 | 数值 | 变化 |
|------|------|------|
| 期初订阅 | {metrics['subscribers']['start']:,} | - |
| 期末订阅 | {metrics['subscribers']['current']:,} | +{metrics['subscribers']['growth']:,} |
| 增长率 | {metrics['subscribers']['growth_rate']}% | {'📈' if metrics['subscribers']['growth'] > 0 else '📉'} |

---

## 📰 内容表现

### 流量指标

| 指标 | 本周数据 |
|------|----------|
| 总浏览量 | {metrics['content']['total_views']:,} |
| 独立访客 | {metrics['content']['unique_visitors']:,} |
| 转化数 | {metrics['content']['conversions']:,} |
| 转化率 | {metrics['content']['conversion_rate']}% |
| 平均停留 | {metrics['content']['avg_time_on_page']}s |
| 跳出率 | {metrics['content']['avg_bounce_rate']}% |

### 发布进度

| 状态 | 数量 | 占比 |
|------|------|------|
| ✅ 已发布 | {metrics['publishing']['published']} | {metrics['publishing']['published_pct']:.0f}% |
| 📝 草稿 | {metrics['publishing']['draft']} | {metrics['publishing']['draft_pct']:.0f}% |
| **总计** | **{metrics['publishing']['total']}** | 100% |

---

## 🧪 A/B测试状态

| 测试ID | 类型 | 状态 | 样本量 |
|--------|------|------|--------|
| article01_headline | 标题 | 🟢 活跃 | 目标: 200 |
| article02_cta | CTA | 🟢 活跃 | 目标: 300 |

---

## 🎯 下周计划

- [ ] 发布 Article-04: 自动化实践
- [ ] 发布 Article-05: 系统集成
- [ ] 启动标题A/B测试 (Article-01)
- [ ] 完成CTA优化测试 (Article-02)
- [ ] 分析本周数据，调整内容策略

---

## 📊 数据文件

- 订阅历史: `data/subscribers_history.csv`
- 内容表现: `data/content_performance.csv`
- 内容追踪: `data/content_tracking.csv`
- A/B测试: `data/ab_tests.json`

---

## 📝 备注

- 所有数据来自 `http://localhost:5000/api/stats`
- UTM参数生成: `python3 utm_generator.py`
- 监控脚本: `python3 scripts/monitor.py`

---

*Generated by Content Tracking System*
"""
        return report
    
    def generate_report(self) -> str:
        """生成完整周报"""
        # 计算指标
        metrics = self.calculate_metrics()
        
        # 生成报告
        report = self.generate_markdown_report(metrics)
        
        # 保存报告
        report_path = self.reports_dir / f"weekly_report_{metrics['week_ending']}.md"
        with open(report_path, 'w') as f:
            f.write(report)
        
        return str(report_path)


def main():
    """主函数"""
    generator = WeeklyReportGenerator()
    report_path = generator.generate_report()
    print(f"周报生成完成: {report_path}")


if __name__ == "__main__":
    main()
