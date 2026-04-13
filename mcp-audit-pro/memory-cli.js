#!/usr/bin/env node
/**
 * MCP Audit Pro - 记忆系统 CLI
 * 使用 infinite-memory 管理项目上下文
 */

const InfiniteMemory = require('/root/.openclaw/workspace/skills/infinite-memory/infinite-memory');
const memory = new InfiniteMemory({
  baseDir: '/root/.openclaw/workspace/memory-system',
  sessionId: 'mcp-audit-pro-' + new Date().toISOString().split('T')[0]
});

const command = process.argv[2];
const args = process.argv.slice(3).join(' ');

switch (command) {
  case 'search':
  case 's':
    const results = memory.search(args, { layers: ['core', 'longterm', 'working'] });
    console.log(`🔍 找到 ${results.length} 条记忆:\n`);
    results.forEach(r => {
      console.log(`[${r.type.toUpperCase()}] ${r.content}`);
      console.log(`   标签: ${r.tags.join(', ')}`);
      console.log();
    });
    break;

  case 'remember':
  case 'r':
    const [content, ...tags] = args.split('|').map(s => s.trim());
    memory.store(content, {
      layer: 'working',
      type: 'note',
      tags: tags.length ? tags : ['auto']
    });
    console.log('✅ 已存储到工作记忆');
    break;

  case 'promote':
  case 'p':
    // memory.promote 用法
    console.log('用法: promote <memoryId> <fromLayer> <toLayer>');
    break;

  case 'status':
  case 'st':
    const ctx = memory.getContext('mcp-audit-pro current status');
    console.log('📊 MCP Audit Pro 状态:\n');
    console.log('当前会话:', ctx.sessionId);
    console.log('相关记忆数:', ctx.memories.length);
    if (ctx.summary) {
      console.log('最近摘要:', ctx.summary.stats);
    }
    console.log('\n🔴 关键信息:');
    ctx.memories.slice(0, 5).forEach(m => {
      console.log(`  - ${m.content.substring(0, 60)}...`);
    });
    break;

  case 'context':
  case 'c':
    const context = memory.getContext(args || 'current task');
    console.log('会话:', context.sessionId);
    console.log('\n相关记忆:');
    context.memories.forEach(m => {
      console.log(`  [${m.tags.join(',')}] ${m.content}`);
    });
    break;

  default:
    console.log(`
🧠 MCP Audit Pro 记忆系统

用法: node memory-cli.js <命令> [参数]

命令:
  search, s <关键词>      搜索记忆
  remember, r <内容>|<标签>  存储工作记忆
  status, st              查看项目状态
  context, c [查询]       获取上下文

示例:
  node memory-cli.js search stripe
  node memory-cli.js remember "完成Reddit帖子发布" | done | reddit
  node memory-cli.js status
`);
}
