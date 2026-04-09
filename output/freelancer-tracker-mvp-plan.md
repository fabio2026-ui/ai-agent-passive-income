# 自由职业者盈利追踪工具 MVP计划

## 🎯 项目概述

**产品名称**: FreelancerProfit Tracker (暂定)  
**定位**: 自由职业者的项目盈利分析+定价建议工具  
**目标市场**: 全球自由职业者 (Upwork, Fiverr, 独立开发者等)  
**定价**: $19/月起  
**收入潜力**: $1000-5000/月

---

## 💡 核心价值主张

### 解决的问题
1. **不知道项目真实盈利**: 很多人只算收入，不算时间成本
2. **定价靠猜**: 没有数据支撑的定价决策
3. **客户 profitability 不明**: 不知道哪些客户真正赚钱
4. **税率计算混乱**: 自由职业者税务规划复杂

### 核心功能 (MVP)

| 功能模块 | 描述 | 优先级 |
|----------|------|--------|
| **项目追踪** | 记录项目收入、时间、成本 | P0 |
| **盈利分析** | 计算真实时薪、利润率 | P0 |
| **定价建议** | 基于历史数据推荐定价 | P1 |
| **客户评分** | 分析哪些客户最赚钱 | P1 |
| **税务估算** | 预估税费，规划支出 | P2 |
| **仪表板** | 可视化数据展示 | P0 |

---

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **图表**: Recharts

### 后端
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **API**: Next.js API Routes
- **存储**: Supabase Storage (导出报告)

### 部署
- **平台**: Vercel
- **成本**: $0 (免费额度内)

---

## 📊 数据库设计

### 表结构

```sql
-- 用户表 (使用Supabase Auth，扩展字段)
create table profiles (
  id uuid references auth.users primary key,
  username text unique,
  hourly_rate decimal(10,2),
  currency text default 'USD',
  tax_rate decimal(5,2) default 0,
  created_at timestamp default now()
);

-- 客户表
create table clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  name text not null,
  email text,
  hourly_rate decimal(10,2),
  rating int check (rating >= 1 and rating <= 5),
  notes text,
  created_at timestamp default now()
);

-- 项目表
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  client_id uuid references clients(id),
  name text not null,
  description text,
  status text check (status in ('active', 'completed', 'cancelled')),
  fixed_price decimal(10,2),
  estimated_hours decimal(8,2),
  start_date date,
  end_date date,
  created_at timestamp default now()
);

-- 时间记录表
create table time_entries (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id),
  user_id uuid references profiles(id),
  description text,
  hours decimal(5,2) not null,
  date date not null,
  billable boolean default true,
  created_at timestamp default now()
);

-- 支出记录表
create table expenses (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id),
  user_id uuid references profiles(id),
  description text not null,
  amount decimal(10,2) not null,
  category text,
  date date not null,
  created_at timestamp default now()
);
```

---

## 📱 界面设计

### 页面结构

```
/
├── /login          - 登录页
├── /register       - 注册页
├── /dashboard      - 主仪表板 (概览)
├── /projects       - 项目列表
│   ├── /new        - 新建项目
│   └── /[id]       - 项目详情
├── /clients        - 客户列表
│   ├── /new        - 新建客户
│   └── /[id]       - 客户详情
├── /time-entries   - 时间记录
├── /reports        - 报告分析
│   ├── /profitability  - 盈利分析
│   └── /pricing        - 定价建议
└── /settings       - 设置
```

### 关键页面设计

#### 1. 仪表板 (Dashboard)
```
┌─────────────────────────────────────────────────────┐
│  💰 本月收入      ⏱️ 已记录工时      📊 平均时薪    │
│  $3,247          47.5小时          $68.36          │
├─────────────────────────────────────────────────────┤
│  📈 收入趋势 (图表)                                 │
│  [折线图: 过去6个月收入]                            │
├─────────────────────────────────────────────────────┤
│  🏆 最赚钱项目       │  ⚠️ 需要关注的项目          │
│  1. Website Redesign │  1. Mobile App (低时薪)     │
│    $2,400 | $80/hr   │    $800 | $32/hr            │
├─────────────────────────────────────────────────────┤
│  📅 最近活动                                        │
│  • 完成 Website Redesign +$1,200                   │
│  • 记录 4小时 - Mobile App                         │
└─────────────────────────────────────────────────────┘
```

#### 2. 项目详情页
```
┌─────────────────────────────────────────────────────┐
│  Website Redesign                        [编辑]     │
│  客户: ABC Company | 状态: 进行中                   │
├─────────────────────────────────────────────────────┤
│  💵 固定价格: $3,000                                │
│  ⏱️ 已投入: 32小时                                  │
│  💰 实际时薪: $93.75 (目标: $75)  ✅ 高于目标       │
│  📅 期限: 2025-05-15 (还剩 30天)                    │
├─────────────────────────────────────────────────────┤
│  📊 时间记录                                        │
│  [时间记录列表]                                     │
│  [+ 添加时间记录]                                   │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 开发计划 (2周MVP)

### Week 1: 基础架构 + 核心功能

#### Day 1-2: 项目初始化
- [ ] 初始化Next.js项目
- [ ] 配置Tailwind CSS
- [ ] 配置Supabase
- [ ] 设置认证系统
- [ ] 部署到Vercel

#### Day 3-4: 数据模型 + API
- [ ] 创建数据库表
- [ ] 实现Projects API (CRUD)
- [ ] 实现Clients API (CRUD)
- [ ] 实现Time Entries API

#### Day 5-7: 前端界面
- [ ] 登录/注册页面
- [ ] 仪表板页面
- [ ] 项目列表页面
- [ ] 项目详情页面
- [ ] 客户管理页面

### Week 2: 核心功能 + 优化

#### Day 8-10: 核心功能
- [ ] 时间记录功能
- [ ] 盈利计算逻辑
- [ ] 基础报告页面
- [ ] 数据可视化图表

#### Day 11-12: 优化 + Polish
- [ ] UI/UX优化
- [ ] 移动端适配
- [ ] 加载状态
- [ ] 错误处理

#### Day 13-14: 测试 + 发布
- [ ] 功能测试
- [ ] 性能优化
- [ ] 准备发布
- [ ] 创建落地页

---

## 💰 商业模式

### 定价策略

| 方案 | 价格 | 功能 |
|------|------|------|
| **Free** | $0 | 3个项目, 基础追踪, 导出CSV |
| **Pro** | $19/月 | 无限项目, 高级报告, 定价建议, API访问 |
| **Team** | $49/月 | 多用户, 团队协作, 优先支持 |

### 收入预测

| 用户数 | 转化率 | 付费用户 | MRR |
|--------|--------|----------|-----|
| 500 | 5% | 25 | $475 |
| 1,000 | 6% | 60 | $1,140 |
| 2,500 | 7% | 175 | $3,325 |
| 5,000 | 8% | 400 | $7,600 |

---

## 🎯 营销策略

### 启动策略 (冷启动)
1. **Product Hunt发布**
   - 准备Launch材料
   - 争取#1 of the Day
   - 目标: 500+ upvotes

2. **Reddit推广**
   - r/freelance
   - r/webdev
   - r/entrepreneur
   - r/SideProject

3. **内容营销**
   - "如何计算自由职业者真实时薪"
   - "自由职业者定价指南2025"
   - "从$20/hr到$100/hr的定价策略"

4. **合作推广**
   - 与自由职业者社区合作
   - Upwork/Fiverr论坛分享
   - 邀请KOL试用

---

## 📈 成功指标

### 北极星指标
- **付费转化率**: 目标 >5%
- **月活跃用户留存**: 目标 >60%

### 监控指标
- 注册数
- 项目创建数
- 时间记录数
- 付费用户数
- 月收入 (MRR)
- 客户获取成本 (CAC)
- 生命周期价值 (LTV)

---

## ⚠️ 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 市场需求不足 | 中 | 高 | 先发布MVP验证 |
| 竞争加剧 | 高 | 中 | 差异化定位，专注盈利分析 |
| 用户获取成本高 | 中 | 高 | 内容营销， organic growth |
| 技术债务 | 低 | 中 | 代码审查，测试覆盖 |

---

## ✅ 下一步行动

1. **立即**: 初始化项目仓库
2. **Day 1**: 完成项目设置和认证
3. **Day 3**: 完成数据库和API
4. **Day 5**: 完成基础前端
5. **Day 10**: MVP功能完成
6. **Day 14**: 发布上线

---

**预计投入**: 40-50小时开发时间  
**预计收入**: $1000-5000/月 (6个月后)  
**ROI**: 极高 (一次性投入，持续性收入)

---

*创建时间: 2026-04-04*  
*状态: 计划完成，等待开发启动*
