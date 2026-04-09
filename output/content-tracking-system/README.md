# 📊 内容升级追踪系统

完整的Telegra.ph内容表现监控与优化系统，支持UTM追踪、A/B测试和自动化报告。

## 🎯 功能特性

- ✅ **文章追踪表格** - 20篇文章的完整元数据管理
- ✅ **UTM参数系统** - 15+渠道 × 10+活动类型的参数生成
- ✅ **监控脚本** - 自动采集订阅数和内容表现数据
- ✅ **A/B测试框架** - 标题测试、CTA测试、多变量测试
- ✅ **周报生成器** - 自动化性能报告与数据可视化

## 📁 目录结构

```
content-tracking-system/
├── data/                          # 数据文件
│   ├── content_tracking.csv       # 文章追踪主表
│   ├── subscribers_history.csv    # 订阅数历史
│   ├── content_performance.csv    # 内容表现数据
│   └── ab_tests.json              # A/B测试配置
│
├── scripts/                       # 脚本工具
│   ├── monitor.py                 # 监控脚本
│   ├── ab_test_framework.py       # A/B测试框架
│   └── weekly_report.py           # 周报生成器
│
├── reports/                       # 报告输出
│   ├── weekly_report_YYYY-MM-DD.md
│   └── chart_YYYY-MM-DD.png
│
├── utm_generator.py               # UTM参数生成器
├── setup_ab_tests.py              # 预设测试配置
└── init.sh                        # 初始化脚本
```

## 🚀 快速开始

### 1. 初始化系统

```bash
cd content-tracking-system
bash init.sh
```

### 2. 运行监控

```bash
# 单次监控
python3 scripts/monitor.py

# 添加到crontab（每小时运行）
0 * * * * cd /path/to/content-tracking-system && python3 scripts/monitor.py
```

### 3. 生成周报

```bash
python3 scripts/weekly_report.py
```

### 4. 生成UTM链接

```bash
python3 utm_generator.py <url> <channel> <campaign> [content]

# 示例
python3 utm_generator.py \
  "https://telegra.ph/article-01-intro" \
  telegram \
  ai_tools_series
```

## 📊 追踪表格字段

| 字段 | 说明 |
|------|------|
| url | 文章URL |
| publish_time | 发布时间 |
| theme | 内容主题 |
| target_audience | 目标受众 |
| utm_source | UTM来源 |
| utm_medium | UTM媒介 |
| utm_campaign | UTM活动 |
| status | 状态(published/draft) |

## 🔗 UTM参数系统

### 渠道列表

| 渠道 | source | medium |
|------|--------|--------|
| telegram | tg | post/story/bio |
| wechat | wechat | post/moments |
| twitter | twitter | tweet/bio |
| email | email | newsletter/drip |
| youtube | youtube | video/description |
| reddit | reddit | post |
| linkedin | linkedin | post |
| organic_search | google | organic |
| paid_search | google | cpc |

### 活动列表

- `ai_tools_series` - AI工具系列
- `ai_case_studies` - 案例研究
- `ai_tools_review` - 工具评测
- `ai_governance` - 治理合规
- `ai_implementation` - 实施部署
- `ai_support` - 支持文档
- `ai_advanced` - 高级技巧
- `ai_strategy` - 战略规划

## 🧪 A/B测试框架

### 创建测试

```python
from scripts.ab_test_framework import ABTestFramework, TestTemplates

framework = ABTestFramework()

# 标题测试
test = TestTemplates.headline_test(
    url="https://telegra.ph/article-01",
    original="AI工具入门指南",
    variant="7天掌握AI工具"
)
framework.create_test(test)

# CTA测试
test = TestTemplates.cta_test(
    url="https://telegra.ph/article-02",
    original_text="了解更多",
    variant_text="立即学习"
)
framework.create_test(test)
```

### 记录事件

```python
framework.record_event(
    test_id="article01_headline",
    variant_id="variant-a",
    visitor_id="user_123",
    event_type="conversion"  # impression/click/conversion
)
```

### 查看结果

```python
results = framework.get_test_results("article01_headline")
print(results)
```

## 📈 API集成

### 统计API

```
GET http://localhost:5000/api/stats

Response:
{
  "last_updated": "2026-04-04T02:16:38",
  "subscribers": 1000
}
```

### 内容统计API

```
GET http://localhost:5000/api/content-stats?url=<article_url>

Response:
{
  "views": 500,
  "unique_visitors": 300,
  "avg_time_on_page": 120,
  "bounce_rate": 0.35,
  "conversions": 50
}
```

## 📅 定时任务配置

### Crontab示例

```bash
# 每小时监控
0 * * * * cd /path/to/content-tracking-system && python3 scripts/monitor.py >> logs/monitor.log 2>&1

# 每周一早8点生成周报
0 8 * * 1 cd /path/to/content-tracking-system && python3 scripts/weekly_report.py >> logs/weekly.log 2>&1

# 每天同步A/B测试数据
0 6 * * * cd /path/to/content-tracking-system && python3 scripts/sync_ab_results.py >> logs/ab.log 2>&1
```

## 📋 20篇文章规划

| # | 文章 | 主题 | 受众 | 状态 |
|---|------|------|------|------|
| 1 | Article-01 | AI工具入门 | 初学者 | ✅ 已发布 |
| 2 | Article-02 | 提示词工程 | 中级用户 | ✅ 已发布 |
| 3 | Article-03 | 工作流优化 | 专业人士 | ✅ 已发布 |
| 4 | Article-04 | 自动化实践 | 高级用户 | 📝 草稿 |
| 5 | Article-05 | 系统集成 | 技术管理者 | 📝 草稿 |
| ... | ... | ... | ... | ... |
| 20 | Article-20 | 未来趋势 | 所有利益相关者 | 📝 草稿 |

完整列表见 `data/content_tracking.csv`

## 🔧 扩展开发

### 添加新渠道

编辑 `utm_generator.py`:

```python
CHANNELS = {
    'new_channel': {'source': 'new', 'medium': 'post'},
}
```

### 添加新测试类型

继承 `ABTestFramework`:

```python
class CustomTest(ABTestFramework):
    def create_custom_test(self, ...):
        # 自定义逻辑
        pass
```

## 📊 报告示例

周报包含:
- 📈 订阅增长趋势
- 📰 内容表现指标
- 🎯 A/B测试结果
- 📊 数据可视化图表
- 📝 下周计划

---

*Content Tracking System v1.0*
