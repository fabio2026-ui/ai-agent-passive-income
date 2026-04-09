# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## Multi-Agent Framework 2.0

**位置**: `/root/.openclaw/workspace/skills/multi-agent-framework/`
**状态**: ✅ 已激活

### 5-Agent 架构
| Agent | 职责 | 触发关键词 |
|-------|------|-----------|
| **Leader** | 任务拆解、执行计划 | "拆解..." "分析任务结构" |
| **Analyzer** | 研究分析、数据收集 | "分析..." "调研..." "研究..." |
| **Writer** | 内容创作、报告撰写 | "写..." "生成..." "撰写..." |
| **Reviewer** | 质量审查、事实核查 | "检查..." "审查..." "质量..." |
| **Coordinator** | 任务调度、结果汇总 | 我 (主控) |

### 快速使用
```
用户: "使用 Multi-Agent 模式，[任务描述]"

自动流程:
1. Leader 拆解任务
2. 并行启动 Workers
3. Reviewer 质量检查
4. 汇总交付
```

### 输出目录
- 计划: `output/leader_plan_*.md`
- 分析: `output/analysis_*.md`
- 内容: `output/content_*.md`
- 审查: `output/review_*.md`
- 最终: `output/final_*.md`

---

## Page Agent Skill

**位置**: `/root/.openclaw/workspace/skills/page-agent/`
**状态**: ✅ 已添加 (2026-04-02)

### 功能
- 浏览器页面自动化
- 网页数据采集
- 竞品监控
- 自动化测试

### 使用方式
```typescript
import { PageAgent, scrapeXiaohongshu } from './skills/page-agent/agent';

// 基础使用
const agent = new PageAgent();
await agent.init();
await agent.navigate('https://example.com');
const data = await agent.extract('.title');
await agent.close();

// 小红书采集
const titles = await scrapeXiaohongshu('关键词');
```

### 集成场景
- ContentAI竞品分析
- 小红书爆款数据采集
- 价格监控系统
- 自动化运营

---

Add whatever helps you do your job. This is your cheat sheet.
