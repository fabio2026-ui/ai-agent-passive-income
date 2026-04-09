# 内容升级追踪系统 - 使用示例

## 🚀 快速开始

### 1. 生成UTM链接

```bash
# 基础用法
python3 utm_generator.py <url> <channel> <campaign>

# 示例：为Telegram生成链接
python3 utm_generator.py \
  "https://telegra.ph/article-01-intro" \
  telegram \
  ai_tools_series

# 输出：https://telegra.ph/article-01-intro?utm_source=tg&utm_medium=post&utm_campaign=ai-tools-series

# 带A/B测试内容标识
python3 utm_generator.py \
  "https://telegra.ph/article-01-intro" \
  telegram \
  ai_tools_series \
  "v1-headline-a"
```

### 2. 运行监控

```bash
# 单次监控
python3 scripts/monitor.py

# 查看监控结果
python3 scripts/monitor.py
cat data/subscribers_history.csv
cat data/content_performance.csv
```

### 3. A/B测试

```python
from scripts.ab_test_framework import ABTestFramework, TestTemplates

# 初始化框架
framework = ABTestFramework()

# 创建标题测试
test = TestTemplates.headline_test(
    url="https://telegra.ph/article-01-intro",
    original="AI工具入门指南",
    variant="7天掌握AI工具：从新手到专家"
)
framework.create_test(test)

# 为访问者分配变体
visitor_id = "user_123"
variant = framework.get_variant_for_visitor("article01_headline", visitor_id)
print(f"访问者看到: {variant.headline}")

# 记录事件
framework.record_event(
    test_id="article01_headline",
    variant_id=variant.variant_id,
    visitor_id=visitor_id,
    event_type="conversion"
)

# 查看结果
results = framework.get_test_results("article01_headline")
print(results)
```

### 4. 生成周报

```bash
# 生成周报
cd scripts
python3 weekly_report_simple.py

# 查看周报
cat ../reports/weekly_report_2026-04-04.md
```

## 📊 数据流

```
Telegra.ph文章 ← UTM参数 → 用户访问
                        ↓
              http://localhost:5000/api/stats
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
  subscribers    content_       ab_test_
  _history.csv   performance.csv  results.csv
        ↓               ↓               ↓
        └───────────────┴───────────────┘
                        ↓
              weekly_report_simple.py
                        ↓
            weekly_report_YYYY-MM-DD.md
```

## 🔄 定时任务设置

```bash
# 编辑crontab
crontab -e

# 添加以下行：
# 每小时运行监控
0 * * * * cd /path/to/content-tracking-system && python3 scripts/monitor.py

# 每周一早上8点生成周报
0 8 * * 1 cd /path/to/content-tracking-system && python3 scripts/weekly_report_simple.py
```

## 📁 20篇文章追踪表

查看完整列表：`data/content_tracking.csv`

| 文章 | 主题 | 受众 | 状态 |
|------|------|------|------|
| Article-01 | AI工具入门 | 初学者 | ✅ 已发布 |
| Article-02 | 提示词工程 | 中级用户 | ✅ 已发布 |
| Article-03 | 工作流优化 | 专业人士 | ✅ 已发布 |
| Article-04 | 自动化实践 | 高级用户 | 📝 草稿 |
| ... | ... | ... | ... |

## 🔧 可用渠道

运行以下命令查看所有渠道：

```bash
python3 utm_generator.py
```

主要渠道：
- `telegram` - Telegram帖子
- `telegram_story` - Telegram故事
- `wechat` - 微信公众号
- `twitter` - Twitter推文
- `email` - 邮件营销
- `youtube` - YouTube视频
- `reddit` - Reddit帖子

## 🎯 预设A/B测试

系统已预配置5个测试：

1. **article01_headline** - 标题长度测试
2. **article02_cta** - CTA按钮优化
3. **article03_multi** - 多变量测试
4. **article04_length** - 标题长度对比
5. **article05_audience** - 受众定位测试

查看测试配置：`data/ab_tests.json`

## 💡 最佳实践

1. **UTM参数**：始终使用UTM参数追踪流量来源
2. **A/B测试**：每篇文章至少测试一个元素（标题或CTA）
3. **监控频率**：至少每天运行一次监控脚本
4. **周报回顾**：每周回顾数据，调整内容策略
5. **样本量**：A/B测试至少收集200个样本再下结论

## 🛠️ 故障排除

### 监控脚本返回空数据
- 检查API是否运行：`curl http://localhost:5000/api/stats`
- 确认网络连接正常

### UTM生成器报错
- 检查渠道名称是否正确
- 检查活动名称是否在预定义列表中

### A/B测试无法创建
- 检查测试ID是否已存在
- 确认流量分配总和为100%

## 📞 支持

- 详细文档：README.md
- 系统配置：system.json
- 数据文件：data/
