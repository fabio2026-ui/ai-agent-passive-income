---
tags: [dashboard, analytics, daily]
date: {{date:YYYY-MM-DD}}
auto-refresh: true
---

# 📊 实时数据仪表板

*最后更新: {{date:YYYY-MM-DD HH:mm:ss}}*

## 🎯 关键指标 (KPIs)

```dataviewjs
// 自动计算今日产出
dv.table(
    ["指标", "今日", "本周", "目标", "完成率"],
    [
        ["代码行数", "{{code_today}}", "{{code_week}}", "2000", "{{code_rate}}%"],
        ["视频数量", "{{video_today}}", "{{video_week}}", "100", "{{video_rate}}%"],
        ["文章数量", "{{article_today}}", "{{article_week}}", "50", "{{article_rate}}%"],
        ["收入 ($)", "${{revenue_today}}", "${{revenue_week}}", "$10000", "{{revenue_rate}}%"]
    ]
)
```

## 📈 趋势图表

### 代码产出趋势
```chart
type: line
title: 代码行数增长
labels: [{{chart_dates}}]
datasets:
  - label: 累计代码
    data: [{{code_history}}]
```

### 内容产出分布
```chart
type: pie
title: 今日内容类型分布
labels: [视频, 文章, 代码, 文案]
data: [{{video_today}}, {{article_today}}, {{code_today}}, {{copy_today}}]
```

## 🚨 异常监控

{{#if low_performance}}
⚠️ **注意**: {{issue_description}}
- 影响: {{impact}}
- 建议: {{suggestion}}
{{/if}}

## 🎯 智能建议

基于数据分析，AI建议:

1. **优化方向**: {{optimization_tip1}}
2. **资源分配**: {{optimization_tip2}}
3. **时间管理**: {{optimization_tip3}}

## 📅 日程安排

```calendar
{{calendar_events}}
```

## 🔗 快速链接
- [[项目看板]]
- [[内容日历]]
- [[收入报告]]
- [[系统日志]]

---

#DAILY-REPORT
#ANALYZE

*此仪表板自动生成，每30分钟刷新一次*
