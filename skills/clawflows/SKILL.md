# Clawflows Skill
# 多步骤工作流编排技能

## 用途
将多个Skill串联成自动化流水线，实现复杂任务的端到端自动化。

## 功能

### 1. 工作流定义
- 步骤编排
- 条件分支
- 循环处理
- 错误处理

### 2. 数据传递
- 步骤间数据流
- 变量管理
- 结果缓存
- 状态跟踪

### 3. 触发机制
- 定时触发
- 事件触发
- 手动触发
- Webhook触发

### 4. 监控和日志
- 执行日志
- 性能监控
- 错误告警
- 状态面板

## 使用示例

```yaml
# 每日研究工作流
workflow: daily-research
steps:
  - skill: tavily
    action: search
    query: "AI industry news today"
    
  - skill: summarize
    action: digest
    input: previous_step
    
  - skill: mission-control
    action: add_brief
    content: previous_step
    
  - skill: notion
    action: save_page
    title: "Daily Research"
    content: previous_step
```

## 工作流模板

### 内容创作流程
```
搜索资料 → 生成大纲 → 撰写内容 → 校对修改 → 发布到多平台
```

### 数据分析流程
```
抓取数据 → 清洗处理 → 分析计算 → 生成图表 → 发送报告
```

### 客户服务流程
```
接收消息 → 分类意图 → 自动回复/转人工 → 记录反馈
```

---
*来源: OpenClaw十大技能榜单*
