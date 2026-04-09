# Multi-Agent Framework 2.0 - 使用指南

## 快速开始

### 方式1: 直接调用 (推荐)
当你有复杂任务时，直接告诉我：

> "使用 Multi-Agent 模式，帮我完成 [任务描述]"

我会自动：
1. 调用 Leader Agent 拆解任务
2. 并行启动 Worker Agents
3. 汇总结果并交付

### 方式2: 手动分步

#### Step 1: Leader 拆解
```bash
sessions_spawn --task="拆解任务: [任务描述]" --label="Leader-Decompose"
```

#### Step 2: 并行执行 Workers
根据 Leader 的输出，并行启动对应 Agent：
```bash
# 研究任务
sessions_spawn --task="[研究任务]" --label="Analyzer-Research"

# 写作任务  
sessions_spawn --task="[写作任务]" --label="Writer-Content"

# 审查任务
sessions_spawn --task="[审查任务]" --label="Reviewer-QC"
```

#### Step 3: 结果汇总
我会自动收集所有子代理结果并生成最终报告。

---

## 任务类型速查表

| 用户请求关键词 | 分配 Agent | 示例 |
|--------------|-----------|------|
| "分析...市场" "研究..." | Analyzer | 竞品分析、市场调研 |
| "写...报告" "生成...文案" | Writer | 行业报告、营销内容 |
| "检查...代码" "审查...质量" | Reviewer | 代码审查、文档检查 |
| "综合..." "完整...方案" | Multi | 复杂项目全流程 |

---

## 工作流程示例

### 示例1: 竞品分析报告
```
用户: "分析AI Agent市场，输出完整报告"

Leader 拆解:
├── T1: 市场规模研究 (Analyzer)
├── T2: 竞品功能分析 (Analyzer)  
├── T3: 定价策略分析 (Analyzer)
├── T4: 撰写报告 (Writer) ← 依赖 T1,T2,T3
└── T5: 质量审查 (Reviewer) ← 依赖 T4

并行执行 T1,T2,T3 → 串行 T4 → T5
```

### 示例2: 产品发布内容包
```
用户: "为新产品生成营销内容包"

Leader 拆解:
├── T1: 产品定位分析 (Analyzer)
├── T2: 竞品文案调研 (Analyzer)
├── T3: 撰写产品介绍 (Writer) ← 依赖 T1
├── T4: 生成社交媒体帖子 (Writer) ← 依赖 T1
├── T5: 写邮件模板 (Writer) ← 依赖 T1
└── T6: 内容质量审查 (Reviewer) ← 依赖 T3,T4,T5

并行执行 T1,T2 → 并行 T3,T4,T5 → T6
```

---

## 输出文件命名规范

| Agent | 输出文件前缀 | 示例 |
|-------|-------------|------|
| Leader | `leader_plan_` | leader_plan_20250401_120000.md |
| Analyzer | `analysis_` | analysis_market_research_20250401.md |
| Writer | `content_` | content_report_20250401.md |
| Reviewer | `review_` | review_qc_report_20250401.md |
| Final | `final_` | final_deliverable_20250401.md |

---

## 质量检查清单

### Analyzer 输出检查
- [ ] 数据来源明确标注
- [ ] 数字有交叉验证
- [ ] 竞品分析不少于3家
- [ ] 包含优劣势评估

### Writer 输出检查  
- [ ] 结构清晰 (标题/目录)
- [ ] 数据与Analyzer一致
- [ ] 格式符合要求 (Markdown/表格)
- [ ] 无错别字

### Reviewer 输出检查
- [ ] 事实准确性评分
- [ ] 逻辑一致性评分
- [ ] 格式规范性评分
- [ ] 改进建议具体

---

## 故障处理

### 场景1: 子代理超时
**现象**: 任务运行超过5分钟无响应
**处理**: 
1. 检查子代理状态
2. 如超时，重新 spawn 同任务
3. 简化任务范围后重试

### 场景2: 质量评分过低
**现象**: Reviewer 评分 < 7
**处理**:
1. 查看 Reviewer 的具体反馈
2. 退回 Writer 重写
3. 或补充 Analyzer 研究

### 场景3: 依赖任务失败
**现象**: Worker 依赖的前置任务失败
**处理**:
1. 重试失败的前置任务
2. 如无法恢复，调整执行计划
3. 通知用户调整任务范围

---

## 性能优化建议

1. **并行最大化**: 无依赖的任务同时启动
2. **超时设置**: 简单任务 2-3min，复杂任务 5-10min
3. **结果缓存**: 24h内相同请求直接返回缓存
4. **增量更新**: 已有报告只修改变更部分

---

## 版本历史

- **v2.0** (2026-04-01): 框架重构，5 Agent 架构，并行执行
- **v1.0** (2026-03-22): 基础批处理，3 Agent 串行

---

## 状态

✅ **已激活** - 当前对话可使用 Multi-Agent 模式

测试命令:
```
使用 Multi-Agent 模式，帮我分析当前工作目录的代码质量
```
