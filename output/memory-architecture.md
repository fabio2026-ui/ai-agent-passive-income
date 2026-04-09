# AI Agent 无限记忆系统架构设计

## 架构概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI Agent Infinite Memory System                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   Session    │    │  Memory      │    │  Context     │                  │
│  │   Manager    │◄──►│  Engine      │◄──►│  Builder     │                  │
│  └──────────────┘    └──────┬───────┘    └──────────────┘                  │
│                             │                                               │
│                    ┌────────┴────────┐                                      │
│                    │   Memory Tiers   │                                      │
│                    └────────┬────────┘                                      │
│                             │                                               │
│     ┌───────────────────────┼───────────────────────┐                      │
│     ▼                       ▼                       ▼                      │
│  ┌────────┐            ┌────────┐            ┌────────┐                   │
│  │Working │            │Medium  │            │ Long   │                   │
│  │Memory  │            │Memory  │            │Memory  │                   │
│  │(STM)   │            │(MTM)   │            │(LTM)   │                   │
│  └────┬───┘            └────┬───┘            └────┬───┘                   │
│       │                     │                     │                        │
│       ▼                     ▼                     ▼                        │
│  ┌────────┐            ┌────────┐            ┌────────┐                   │
│  │Context │            │SQLite  │            │Vector  │                   │
│  │Window  │            │+ FTS   │            │DB      │                   │
│  └────────┘            └────────┘            └────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 核心组件设计

### 1. Memory Tiers (记忆分层)

#### 1.1 Working Memory (STM) - 工作记忆

**职责：** 当前会话的活跃上下文

**存储：** 内存 (Context Window)

**内容：**
- 当前对话历史（最近 N 轮）
- 活跃任务上下文
- 临时变量和状态

**管理策略：**
```typescript
interface WorkingMemory {
  maxTokens: number;        // 最大token数
  ttl: number;              // 生存时间(秒)
  priority: 'high';         // 优先级
  evictionPolicy: 'lru';    // 淘汰策略: 最近最少使用
}
```

#### 1.2 Medium Memory (MTM) - 中期记忆

**职责：** 会话摘要和主题聚合

**存储：** SQLite + FTS (全文搜索)

**内容：**
- 会话摘要
- 主题分类
- 任务执行历史
- 用户反馈记录

**更新机制：**
```typescript
interface MediumMemoryUpdate {
  trigger: 'session_end' | 'token_threshold' | 'time_interval';
  summarizationModel: string;
  retentionDays: number;
}
```

#### 1.3 Long-term Memory (LTM) - 长期记忆

**职责：** 持久化知识、用户偏好、核心事实

**存储：** 向量数据库 (SQLite-VSS / Chroma)

**内容：**
- 用户画像和偏好
- 核心知识实体
- 重要决策记录
- 高频检索模式

**索引策略：**
```typescript
interface LongTermMemory {
  embeddingModel: string;   // 嵌入模型
  dimension: number;        // 向量维度
  similarityThreshold: number;  // 相似度阈值
  indexType: 'hnsw' | 'ivf';    // 索引类型
}
```

---

### 2. Memory Types (记忆类型)

基于人类记忆模型，设计五类记忆：

```
┌─────────────────────────────────────────────────────────────┐
│                      Memory Types                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Episodic   │  │   Semantic   │  │  Procedural  │      │
│  │   (事件)      │  │   (语义)      │  │   (程序)      │      │
│  │              │  │              │  │              │      │
│  │ • 对话历史    │  │ • 用户画像    │  │ • 工作流      │      │
│  │ • 任务执行    │  │ • 领域知识    │  │ • 最佳实践    │      │
│  │ • 错误记录    │  │ • 实体关系    │  │ • 提示模板    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Reflective  │  │   Emotional  │                        │
│  │   (反思)      │  │   (情感)      │                        │
│  │              │  │              │                        │
│  │ • 决策原理    │  │ • 用户情绪    │                        │
│  │ • 经验教训    │  │ • 置信度      │                        │
│  │ • 架构记录    │  │ • 交互偏好    │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Memory Operations (记忆操作)

#### 3.1 存储流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Input   │───►│  Encode  │───►│  Classify│───►│  Route   │
│          │    │          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                     │
                    ┌────────────────────────────────┼────────────────────┐
                    │                                │                    │
                    ▼                                ▼                    ▼
              ┌──────────┐                    ┌──────────┐         ┌──────────┐
              │   STM    │                    │   MTM    │         │   LTM    │
              │  Buffer  │                    │  SQLite  │         │ VectorDB │
              └──────────┘                    └──────────┘         └──────────┘
```

#### 3.2 检索流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Query   │───►│  Embed   │───►│  Search  │───►│  Rank    │
│          │    │          │    │  Tiers   │    │ & Filter │
└──────────┘    └──────────┘    └────┬─────┘    └────┬─────┘
                                     │               │
                    ┌────────────────┼───────────────┘
                    │                │
                    ▼                ▼
              ┌──────────┐     ┌──────────┐
              │  Merge   │────►│  Build   │
              │  Results │     │  Context │
              └──────────┘     └──────────┘
```

#### 3.3 压缩与整合

```typescript
interface MemoryConsolidation {
  // 触发条件
  triggers: {
    scheduled: '0 2 * * *';     // 每天凌晨2点
    threshold: 1000;             // 记忆条数阈值
    manual: boolean;             // 手动触发
  };
  
  // 整合策略
  strategies: {
    summarization: boolean;      // 摘要生成
    clustering: boolean;         // 语义聚类
    deduplication: boolean;      // 去重
    pruning: boolean;            // 剪枝
  };
}
```

---

### 4. 数据模型设计

#### 4.1 核心实体

```typescript
// 记忆单元
interface MemoryUnit {
  id: string;
  type: MemoryType;
  tier: MemoryTier;
  content: string;
  embedding?: number[];
  metadata: {
    timestamp: Date;
    source: string;
    sessionId: string;
    importance: number;      // 0-1
    accessCount: number;
    lastAccessed: Date;
    tags: string[];
  };
  relations: {
    parentId?: string;
    childIds: string[];
    relatedIds: string[];
  };
}

// 会话记录
interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  messages: Message[];
  summary?: string;
  extractedMemories: string[];
  context: {
    task?: string;
    project?: string;
    userIntent?: string;
  };
}

// 用户画像
interface UserProfile {
  preferences: {
    communicationStyle: string;
    responseLength: 'concise' | 'detailed';
    expertise: string[];
    interests: string[];
  };
  patterns: {
    commonTasks: string[];
    frequentQueries: string[];
    preferredTools: string[];
  };
  facts: {
    key: string;
    value: string;
    confidence: number;
    source: string;
  }[];
}
```

#### 4.2 数据库 Schema

```sql
-- 中期记忆表
CREATE TABLE medium_memories (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    session_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    importance REAL DEFAULT 0.5,
    access_count INTEGER DEFAULT 0,
    tags TEXT,  -- JSON array
    metadata TEXT  -- JSON object
);

-- 全文搜索索引
CREATE VIRTUAL TABLE medium_memories_fts USING fts5(
    content,
    summary,
    content='medium_memories',
    content_rowid='id'
);

-- 长期记忆表 (向量存储)
CREATE TABLE long_term_memories (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding BLOB,  -- 序列化向量
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME,
    importance REAL DEFAULT 0.5,
    access_count INTEGER DEFAULT 0,
    decay_factor REAL DEFAULT 1.0,
    tags TEXT
);

-- 会话表
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    summary TEXT,
    extracted_memories TEXT,  -- JSON array
    context TEXT  -- JSON object
);

-- 消息表
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

---

### 5. 与现有系统集成

#### 5.1 与 orchestrator.js 集成

```typescript
// orchestrator.js 集成点
class MemoryEnabledOrchestrator {
  constructor(config) {
    this.memory = new InfiniteMemorySystem({
      workingMemorySize: 4000,
      mediumMemoryPath: './memory/medium.db',
      longTermMemoryPath: './memory/long_term.db',
      embeddingModel: 'local',  // 或 'openai'
      autoConsolidation: true,
    });
  }

  async processTask(task) {
    // 1. 检索相关记忆
    const relevantMemories = await this.memory.retrieve({
      query: task.description,
      context: task.context,
      maxTokens: 2000,
    });

    // 2. 构建增强上下文
    const enhancedContext = this.memory.buildContext({
      task,
      memories: relevantMemories,
      workingMemory: this.memory.getWorkingMemory(),
    });

    // 3. 执行任务
    const result = await this.executeWithContext(task, enhancedContext);

    // 4. 存储新记忆
    await this.memory.store({
      type: 'episodic',
      content: {
        task: task.description,
        result: result.summary,
        lessons: result.learnings,
      },
      metadata: {
        sessionId: this.sessionId,
        importance: result.importance,
      },
    });

    return result;
  }
}
```

#### 5.2 与 Obsidian 集成

```typescript
// Obsidian 知识库同步
class ObsidianIntegration {
  constructor(vaultPath) {
    this.vaultPath = vaultPath;
    this.memory = new InfiniteMemorySystem();
  }

  async syncFromObsidian() {
    // 读取 Obsidian 笔记
    const notes = await this.readMarkdownFiles();
    
    for (const note of notes) {
      const memory = this.parseNoteToMemory(note);
      await this.memory.store({
        type: 'semantic',
        content: memory.content,
        metadata: {
          source: `obsidian:${note.path}`,
          tags: note.tags,
          links: note.links,
        },
      });
    }
  }

  async syncToObsidian(memories) {
    // 将记忆导出为 Obsidian 笔记
    for (const memory of memories) {
      const note = this.formatMemoryAsNote(memory);
      await this.writeMarkdownFile(note);
    }
  }
}
```

---

### 6. 性能优化策略

#### 6.1 检索优化

| 策略 | 实现 | 效果 |
|------|------|------|
| **分层缓存** | L1: 内存, L2: SQLite, L3: 向量DB | 减少 80% 检索延迟 |
| **索引预热** | 启动时加载高频记忆 | 首查 < 50ms |
| **异步嵌入** | 后台计算向量 | 不阻塞主流程 |
| **近似搜索** | HNSW 索引 | 召回率 > 95% |

#### 6.2 存储优化

```typescript
interface StorageOptimization {
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'lz4';
    threshold: number;  // 字节
  };
  pruning: {
    enabled: boolean;
    maxAge: number;     // 天
    minImportance: number;
  };
  archiving: {
    enabled: boolean;
    afterDays: number;
    toColdStorage: boolean;
  };
}
```

---

### 7. 配置示例

```yaml
# memory-config.yaml
memory:
  # 工作记忆配置
  working:
    maxTokens: 4000
    maxMessages: 20
    ttl: 3600  # 1小时

  # 中期记忆配置
  medium:
    dbPath: './memory/medium.db'
    summarization:
      enabled: true
      model: 'local'  # 或 'openai/gpt-4o-mini'
      trigger: 'session_end'
    retention:
      days: 90
      maxEntries: 10000

  # 长期记忆配置
  longTerm:
    dbPath: './memory/long_term.db'
    embedding:
      model: 'local'  # 或 'openai/text-embedding-3-small'
      dimension: 384  # 本地模型维度
    retrieval:
      topK: 10
      similarityThreshold: 0.7
    consolidation:
      schedule: '0 2 * * *'  # 每天凌晨2点
      strategies: ['summarize', 'cluster', 'dedup']

  # 记忆类型权重
  weights:
    episodic: 1.0
    semantic: 1.2
    procedural: 0.8
    reflective: 1.1
    emotional: 0.6

  # 自动提取配置
  extraction:
    enabled: true
    extractUserFacts: true
    extractPreferences: true
    extractPatterns: true

  # 集成配置
  integrations:
    obsidian:
      enabled: true
      vaultPath: '~/Obsidian'
      syncInterval: 300  # 5分钟
    claudeCode:
      enabled: true
      memoryPath: '~/.claude/projects'
```

---

### 8. 部署架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Deployment Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    AI Agent Core                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Agent 1   │  │   Agent 2   │  │   Agent N   │     │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │   │
│  │         └─────────────────┼─────────────────┘           │   │
│  │                           │                             │   │
│  │                   ┌───────┴───────┐                     │   │
│  │                   │ Memory Client │                     │   │
│  │                   │    (SDK)      │                     │   │
│  │                   └───────┬───────┘                     │   │
│  └───────────────────────────┼─────────────────────────────┘   │
│                              │                                  │
│  ┌───────────────────────────┼─────────────────────────────┐   │
│  │              Memory Service (Optional)                   │   │
│  │  ┌───────────────────────┼───────────────────────┐     │   │
│  │  │                       ▼                       │     │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │     │   │
│  │  │  │ STM Cache│  │ MTM DB   │  │ LTM DB   │    │     │   │
│  │  │  │ (Redis)  │  │(SQLite)  │  │(Chroma)  │    │     │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘    │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Storage:                                                       │
│  • Local: SQLite + File System (默认)                          │
│  • Cloud: PostgreSQL + Pinecone (可选)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 总结

本架构设计实现了以下核心能力：

1. **三层记忆架构**：STM (工作记忆) → MTM (中期记忆) → LTM (长期记忆)
2. **五类记忆类型**：情景、语义、程序、反思、情感
3. **自动记忆管理**：存储、检索、压缩、整合全流程自动化
4. **与现有系统集成**：支持 orchestrator.js 和 Obsidian 无缝集成
5. **高性能检索**：分层缓存 + 向量索引 + 语义搜索
6. **可扩展存储**：本地 SQLite 到云端向量数据库灵活切换

