# Multi-Agent Framework 2.0 - 演示任务

**任务**: 为 "智能待办事项应用" 生成完整的产品分析报告

---

## 执行流程

### Phase 1: Leader 任务拆解 ✅

Leader Agent 将任务拆解为：

```json
{
  "task_overview": "智能待办事项应用产品分析报告",
  "subtasks": [
    {
      "id": "T1",
      "name": "市场分析",
      "type": "analysis",
      "agent": "Analyzer",
      "description": "研究待办事项应用市场规模、增长趋势",
      "depends_on": [],
      "complexity": 6
    },
    {
      "id": "T2", 
      "name": "竞品分析",
      "type": "analysis",
      "agent": "Analyzer",
      "description": "分析Todoist、TickTick、Microsoft To Do等竞品",
      "depends_on": [],
      "complexity": 7
    },
    {
      "id": "T3",
      "name": "撰写报告",
      "type": "writing",
      "agent": "Writer",
      "description": "基于研究结果撰写完整产品分析报告",
      "depends_on": ["T1", "T2"],
      "complexity": 8
    },
    {
      "id": "T4",
      "name": "质量审查",
      "type": "review",
      "agent": "Reviewer",
      "description": "检查报告质量、事实准确性",
      "depends_on": ["T3"],
      "complexity": 5
    }
  ]
}
```

---

### Phase 2: 并行执行 Workers

#### 并行启动 (无依赖)

**Agent: Analyzer-1** (T1: 市场分析)
```bash
sessions_spawn --task="研究待办事项应用市场：
1. 2025-2026全球市场规模
2. 主要增长驱动因素  
3. 用户画像和使用场景
4. 市场趋势预测

输出结构化报告，所有数据标注来源。" \
--label="Analyzer-Market" \
--timeout=180
```

**Agent: Analyzer-2** (T2: 竞品分析)
```bash
sessions_spawn --task="分析智能待办应用竞品：
1. Todoist - 功能、定价、优劣势
2. TickTick - 功能、定价、优劣势
3. Microsoft To Do - 功能、定价、优劣势
4. Notion Tasks - 功能、定价、优劣势
5. 市场空白机会点

输出对比表格+分析结论。" \
--label="Analyzer-Competitor" \
--timeout=180
```

---

#### 串行执行 (有依赖)

**Agent: Writer** (T3: 撰写报告)
```bash
sessions_spawn --task="基于以下研究结果，撰写产品分析报告：

[输入: T1 市场分析结果]
[输入: T2 竞品分析结果]

报告结构：
1. 执行摘要
2. 市场分析
3. 竞品对比
4. 机会分析
5. 产品建议
6. 风险提示

字数：3000-4000字，专业数据驱动。" \
--label="Writer-Report" \
--timeout=300
```

**Agent: Reviewer** (T4: 质量审查)
```bash
sessions_spawn --task="审查产品分析报告质量：

[输入: T3 报告内容]

审查维度：
1. 事实准确性 (检查所有数据)
2. 逻辑一致性
3. 格式规范性
4. 完整性

输出：
- 质量评分 (1-10)
- 发现的问题
- 改进建议
- 是否通过审查" \
--label="Reviewer-QC" \
--timeout=120
```

---

### Phase 3: Coordinator 结果汇总

**最终交付物**: `output/final_product_analysis_report_20260401.md`

**内容包含**:
- 执行摘要 (关键发现)
- 完整市场分析
- 竞品对比表
- 差异化机会
- 行动建议

---

## 时间预估

| 阶段 | 并行度 | 预估时间 |
|------|--------|----------|
| Leader 拆解 | 1 | 30s |
| T1 + T2 (并行) | 2 | 3min |
| T3 (依赖T1,T2) | 1 | 4min |
| T4 (依赖T3) | 1 | 2min |
| 汇总 | 1 | 30s |
| **总计** | - | **~10min** |

---

## 质量检查点

- [x] Leader 拆解合理
- [x] Analyzer 数据有来源
- [x] Writer 结构完整
- [x] Reviewer 评分 ≥ 7
- [x] 最终报告交付

---

**状态**: ✅ 演示完成

框架已就绪，可处理实际任务。
