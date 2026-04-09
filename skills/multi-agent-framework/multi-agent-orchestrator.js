#!/usr/bin/env node
/**
 * Multi-Agent Framework 2.0 - Task Orchestrator
 * 
 * 使用方式:
 * node multi-agent-orchestrator.js '<task-json>'
 * 
 * 任务JSON格式:
 * {
 *   "user_request": "用户原始需求",
 *   "task_type": "analysis|writing|review|mixed",
 *   "context": { 额外上下文 },
 *   "output_format": "markdown|json|table"
 * }
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 工作目录
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/root/.openclaw/workspace';
const OUTPUT_DIR = path.join(WORKSPACE_DIR, 'output');
const MEMORY_DIR = path.join(WORKSPACE_DIR, 'memory');

// 确保目录存在
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });

/**
 * 生成唯一任务ID
 */
function generateTaskId() {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 创建任务记录文件
 */
function createTaskRecord(taskId, taskData) {
  const recordPath = path.join(MEMORY_DIR, `multi_agent_task_${taskId}.json`);
  const record = {
    task_id: taskId,
    created_at: new Date().toISOString(),
    status: 'pending',
    stages: {},
    ...taskData
  };
  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
  return recordPath;
}

/**
 * 更新任务状态
 */
function updateTaskStatus(taskId, stage, status, result = null) {
  const recordPath = path.join(MEMORY_DIR, `multi_agent_task_${taskId}.json`);
  if (!fs.existsSync(recordPath)) return;
  
  const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
  record.stages[stage] = {
    status,
    updated_at: new Date().toISOString(),
    result
  };
  
  if (status === 'completed' || status === 'failed') {
    record.status = status;
  }
  
  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
}

/**
 * 调用 Leader Agent 拆解任务
 */
function leaderDecompose(userRequest, context = {}) {
  const taskId = generateTaskId();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  const leaderPrompt = `你是一名任务拆解专家（Leader Agent）。

**原始任务**: ${userRequest}

**上下文**: ${JSON.stringify(context, null, 2)}

**职责**:
1. 将任务拆解为可执行的子任务
2. 确定每个子任务的类型（analysis|writing|review）
3. 确定子任务的依赖关系
4. 评估每个子任务的复杂度（1-10）

**输出要求** (JSON格式):
{
  "task_overview": "任务概述",
  "subtasks": [
    {
      "id": "T1",
      "name": "子任务名称",
      "type": "analysis|writing|review",
      "description": "详细描述",
      "depends_on": [],
      "complexity": 5,
      "estimated_time": "10min"
    }
  ],
  "execution_plan": "执行顺序说明",
  "risks": ["潜在风险"]
}`;

  const outputFile = path.join(OUTPUT_DIR, `leader_decomposition_${timestamp}.json`);
  
  // 使用环境变量或配置来获取实际的agent调用方式
  // 这里返回结构化数据供Coordinator使用
  return {
    task_id: taskId,
    stage: 'leader',
    prompt: leaderPrompt,
    output_file: outputFile,
    record_path: createTaskRecord(taskId, {
      user_request: userRequest,
      task_type: 'decomposition'
    })
  };
}

/**
 * 分配任务给 Worker Agent
 */
function assignToWorker(taskId, subtask, parentContext = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  const agentMap = {
    'analysis': 'Analyzer',
    'writing': 'Writer',
    'review': 'Reviewer'
  };
  
  const agentName = agentMap[subtask.type] || 'Worker';
  
  const workerPrompt = `你是${agentName} Agent。

**任务ID**: ${taskId}
**子任务ID**: ${subtask.id}
**任务类型**: ${subtask.type}
**任务名称**: ${subtask.name}

**任务描述**: ${subtask.description}

**父任务上下文**: ${JSON.stringify(parentContext, null, 2)}

**依赖任务结果**: ${JSON.stringify(subtask.depends_on_results || {}, null, 2)}

**输出要求**:
1. 严格按照任务类型输出
2. 如果无法完成，明确说明原因
3. 包含数据来源（分析类任务）
4. 质量自检清单

**输出格式** (JSON):
{
  "status": "completed|failed|partial",
  "result": "详细结果内容",
  "quality_score": 8,
  "issues": [],
  "sources": [],
  "confidence": "high|medium|low"
}`;

  const outputFile = path.join(OUTPUT_DIR, `${subtask.type}_${subtask.id}_${timestamp}.md`);
  
  return {
    task_id: taskId,
    subtask_id: subtask.id,
    agent: agentName,
    stage: subtask.type,
    prompt: workerPrompt,
    output_file: outputFile
  };
}

/**
 * 并行执行多个子任务
 */
function executeParallel(tasks, maxConcurrency = 3) {
  const batches = [];
  for (let i = 0; i < tasks.length; i += maxConcurrency) {
    batches.push(tasks.slice(i, i + maxConcurrency));
  }
  
  return {
    execution_mode: 'parallel',
    batches,
    total_tasks: tasks.length,
    max_concurrency: maxConcurrency
  };
}

/**
 * 按依赖顺序执行任务
 */
function executeSequential(tasks, dependencies) {
  // 拓扑排序实现
  const visited = new Set();
  const result = [];
  
  function visit(taskId) {
    if (visited.has(taskId)) return;
    visited.add(taskId);
    
    const deps = dependencies[taskId] || [];
    for (const dep of deps) {
      visit(dep);
    }
    result.push(taskId);
  }
  
  for (const task of tasks) {
    visit(task.id);
  }
  
  return {
    execution_mode: 'sequential',
    order: result,
    total_tasks: tasks.length
  };
}

/**
 * 主控函数 - 执行任务
 */
function orchestrate(userRequest, options = {}) {
  console.log('='.repeat(60));
  console.log('Multi-Agent Framework 2.0 - Task Orchestrator');
  console.log('='.repeat(60));
  console.log(`\n用户请求: ${userRequest}\n`);
  
  // Phase 1: Leader 拆解
  console.log('[Phase 1] Leader Agent - 任务拆解...');
  const leaderTask = leaderDecompose(userRequest, options.context);
  console.log(`  → 任务ID: ${leaderTask.task_id}`);
  console.log(`  → 输出文件: ${leaderTask.output_file}`);
  
  // Phase 2: 并行执行 Workers
  console.log('\n[Phase 2] Worker Agents - 并行执行...');
  
  // 这里返回执行计划，实际调用由外部协调器完成
  const executionPlan = {
    task_id: leaderTask.task_id,
    leader: leaderTask,
    workers: [],
    output: {
      final_report: path.join(OUTPUT_DIR, `final_report_${leaderTask.task_id}.md`)
    }
  };
  
  console.log(`  → 执行计划已生成`);
  console.log(`  → 最终报告: ${executionPlan.output.final_report}`);
  
  // Phase 3: Reviewer 质量检查
  console.log('\n[Phase 3] Reviewer Agent - 质量审查...');
  console.log(`  → 等待 Worker 完成后执行`);
  
  // Phase 4: Coordinator 汇总
  console.log('\n[Phase 4] Coordinator - 结果汇总...');
  console.log(`  → 生成最终交付物`);
  
  console.log('\n' + '='.repeat(60));
  console.log('执行计划已生成，等待执行...');
  console.log('='.repeat(60));
  
  return executionPlan;
}

/**
 * 生成子代理调用命令
 */
function generateSubagentCommands(plan) {
  const commands = [];
  
  // Leader 命令
  commands.push({
    stage: 'leader',
    command: `sessions_spawn`,
    params: {
      task: plan.leader.prompt,
      label: `Leader: ${plan.task_id}`,
      timeoutSeconds: 300
    }
  });
  
  return commands;
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法: node multi-agent-orchestrator.js \'<task-json>\'');
    console.log('');
    console.log('示例:');
    console.log(`  node multi-agent-orchestrator.js '{"user_request":"分析AI Agent市场","task_type":"analysis"}'`);
    process.exit(1);
  }
  
  try {
    const taskData = JSON.parse(args[0]);
    const plan = orchestrate(taskData.user_request, taskData);
    
    // 输出执行计划供 Coordinator 使用
    console.log('\n执行计划 JSON:');
    console.log(JSON.stringify(plan, null, 2));
    
  } catch (err) {
    console.error('错误:', err.message);
    process.exit(1);
  }
}

module.exports = {
  orchestrate,
  leaderDecompose,
  assignToWorker,
  executeParallel,
  executeSequential,
  generateSubagentCommands
};
