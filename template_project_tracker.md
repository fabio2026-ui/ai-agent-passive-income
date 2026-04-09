---
tags: [template, project, AI]
date: {{date:YYYY-MM-DD}}
status: active
priority: medium
---

# {{title}}

## 🎯 项目目标
{{goal}}

## 📋 任务清单
- [ ] 需求分析 #TODO
- [ ] AI生成内容 #TODO
- [ ] 质量检查 #TODO
- [ ] 发布部署 #TODO

## 🤖 AI执行记录

### 执行1: {{date:YYYY-MM-DD HH:mm}}
**指令**: {{ai_instruction}}

**产出**:
- 代码: {{code_lines}} 行
- 内容: {{content_count}} 份
- 质量评分: {{quality_score}}/100

**链接**: [[{{output_note}}]]

## 📊 进度追踪
```dataview
TABLE date, status, priority
FROM #project
WHERE contains(file.name, "{{title}}")
SORT date DESC
```

## 🔗 关联资源
- [[项目概览]]
- [[资源库]]
- [[日报 {{date:YYYY-MM-DD}}]]

## 📝 备注
{{notes}}

---
*模板: AI项目追踪 | 自动生成*
