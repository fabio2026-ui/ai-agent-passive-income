const fs = require('fs');
const path = require('path');

/**
 * Infinite Memory System - AI Agent 无限记忆系统
 * 
 * 架构设计：
 * 1. 分层记忆：Ephemeral (会话) → Working (工作) → Long-term (长期) → Core (核心)
 * 2. 自动摘要：定期压缩和整理
 * 3. 语义检索：基于关键词和标签快速搜索
 * 4. 持久化：文件系统存储，支持版本控制
 */
class InfiniteMemory {
  constructor(options = {}) {
    this.baseDir = options.baseDir || './memory';
    this.sessionId = options.sessionId || this.generateSessionId();
    
    // 四层记忆结构
    this.layers = {
      ephemeral: path.join(this.baseDir, 'ephemeral'),    // 会话级 (当前对话)
      working: path.join(this.baseDir, 'working'),        // 工作级 (本次任务)
      longterm: path.join(this.baseDir, 'longterm'),      // 长期 (跨会话)
      core: path.join(this.baseDir, 'core')               // 核心 (永久)
    };
    
    this.initStorage();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initStorage() {
    // 创建记忆目录
    Object.values(this.layers).forEach(dir => {
      fs.mkdirSync(dir, { recursive: true });
    });
    
    // 创建当前会话目录
    this.sessionDir = path.join(this.layers.ephemeral, this.sessionId);
    fs.mkdirSync(this.sessionDir, { recursive: true });
  }

  /**
   * 存储记忆
   */
  store(content, options = {}) {
    const {
      layer = 'ephemeral',  // ephemeral | working | longterm | core
      tags = [],
      type = 'note',        // note | task | decision | fact
      summary = null
    } = options;
    
    const memory = {
      id: this.generateId(),
      timestamp: Date.now(),
      content,
      type,
      tags,
      summary,
      sessionId: this.sessionId
    };
    
    const filePath = this.getMemoryPath(layer, memory.id);
    fs.writeFileSync(filePath, JSON.stringify(memory, null, 2));
    
    console.log(`🧠 记忆已存储 [${layer}]: ${memory.id}`);
    return memory.id;
  }

  generateId() {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  getMemoryPath(layer, id) {
    return path.join(this.layers[layer], `${id}.json`);
  }

  /**
   * 检索记忆
   */
  search(query, options = {}) {
    const { layers = ['longterm', 'core'], limit = 10 } = options;
    const results = [];
    
    for (const layer of layers) {
      const dir = this.layers[layer];
      if (!fs.existsSync(dir)) continue;
      
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      
      for (const file of files) {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        const memory = JSON.parse(content);
        
        const score = this.calculateRelevance(memory, query);
        if (score > 0) {
          results.push({ ...memory, score });
        }
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  calculateRelevance(memory, query) {
    const text = `${memory.content} ${memory.tags.join(' ')} ${memory.summary || ''}`.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // 简单相关性计算
    if (text.includes(queryLower)) return 1.0;
    
    const keywords = queryLower.split(/\s+/);
    let matches = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) matches++;
    }
    
    return matches / keywords.length;
  }

  /**
   * 升级到更高层记忆
   */
  promote(memoryId, fromLayer, toLayer) {
    const fromPath = this.getMemoryPath(fromLayer, memoryId);
    const toPath = this.getMemoryPath(toLayer, memoryId);
    
    if (fs.existsSync(fromPath)) {
      fs.copyFileSync(fromPath, toPath);
      console.log(`⬆️  记忆升级: ${fromLayer} → ${toLayer}`);
      return true;
    }
    return false;
  }

  /**
   * 会话结束：整理记忆
   */
  async consolidate() {
    console.log('🔄 整理会话记忆...');
    
    // 1. 获取本次会话的所有记忆
    const sessionMemories = this.getSessionMemories();
    
    // 2. 生成摘要
    const summary = this.generateSessionSummary(sessionMemories);
    
    // 3. 将重要记忆升级到长期记忆
    const importantMemories = sessionMemories.filter(m => 
      m.type === 'decision' || m.type === 'fact' || m.tags.includes('important')
    );
    
    for (const mem of importantMemories) {
      this.promote(mem.id, 'ephemeral', 'longterm');
    }
    
    // 4. 存储会话摘要
    this.store(summary, {
      layer: 'working',
      type: 'session_summary',
      tags: ['consolidated', this.sessionId]
    });
    
    console.log(`✅ 整理完成: ${importantMemories.length} 条记忆已升级`);
    return summary;
  }

  getSessionMemories() {
    const memories = [];
    if (fs.existsSync(this.sessionDir)) {
      const files = fs.readdirSync(this.sessionDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(this.sessionDir, file), 'utf-8');
        memories.push(JSON.parse(content));
      }
    }
    return memories;
  }

  generateSessionSummary(memories) {
    const decisions = memories.filter(m => m.type === 'decision');
    const facts = memories.filter(m => m.type === 'fact');
    const tasks = memories.filter(m => m.type === 'task');
    
    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      stats: {
        total: memories.length,
        decisions: decisions.length,
        facts: facts.length,
        tasks: tasks.length
      },
      keyDecisions: decisions.map(m => m.content).slice(0, 5),
      keyFacts: facts.map(m => m.content).slice(0, 5)
    };
  }

  /**
   * 获取上下文 (用于AI对话)
   */
  getContext(query, options = {}) {
    const relevant = this.search(query, options);
    
    return {
      memories: relevant,
      summary: this.getWorkingSummary(),
      sessionId: this.sessionId
    };
  }

  getWorkingSummary() {
    // 获取最近的工作记忆摘要
    const workingDir = this.layers.working;
    if (!fs.existsSync(workingDir)) return null;
    
    const files = fs.readdirSync(workingDir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(workingDir, f)).mtime
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length === 0) return null;
    
    const latest = fs.readFileSync(path.join(workingDir, files[0].name), 'utf-8');
    return JSON.parse(latest);
  }
}

// 导出
module.exports = InfiniteMemory;

// CLI 测试
if (require.main === module) {
  const memory = new InfiniteMemory({ baseDir: './test-memory' });
  
  // 存储一些测试记忆
  memory.store('用户喜欢简洁的输出风格', { 
    layer: 'core', 
    type: 'fact',
    tags: ['preference', 'style'] 
  });
  
  memory.store('决定使用 Kimi API 作为主要AI提供商', { 
    layer: 'longterm', 
    type: 'decision',
    tags: ['decision', 'api'] 
  });
  
  // 搜索
  console.log('\n🔍 搜索 "API":');
  const results = memory.search('API', { layers: ['core', 'longterm'] });
  results.forEach(r => console.log(`  - ${r.content}`));
  
  // 整理
  memory.consolidate();
}
