# AI商业帝国 - 中央情报共享库 (Central Intelligence Hub)

*所有机器人的信息共享中心，避免重复API调用*

---

## 📋 信息需求清单 (Information Requirements)

### 按类别分类

#### 1. 金融数据类
| 信息项 | 更新频率 | 用途 | 使用机器人 |
|--------|----------|------|------------|
| 黄金价格 XAU/USD | 每日1次 | 投资建议、市场分析 | IntelAnalyst, 黄金价格日报 |
| 原油价格 WTI/Brent | 每日1次 | 能源市场监控 | IntelAnalyst, 石油黄金监控 |
| 美元指数 DXY | 每日1次 | 汇率影响分析 | IntelAnalyst |
| 人民币汇率 | 每日1次 | 出口成本计算 | IntelAnalyst, PricingBot |
| 美股大盘指数 | 每日1次 | 市场情绪参考 | IntelAnalyst |
| 加密货币价格 | 按需 | Web3业务监控 | Web3Bot |

#### 2. 市场情报类
| 信息项 | 更新频率 | 用途 | 使用机器人 |
|--------|----------|------|------------|
| Fiverr平台趋势 | 每周1次 | 定价策略、服务优化 | IntelAnalyst, FiverrBot |
| Upwork热门技能 | 每周1次 | 技能方向调整 | SkillBot |
| TikTok电商趋势 | 每周1次 | 内容策略 | ContentBot |
| 小红书算法变化 | 每周1次 | 运营优化 | XHSBot |
| 竞争对手定价 | 每周1次 | 价格策略 | PricingBot |
| 行业关键词热度 | 每周1次 | SEO/内容优化 | SEObot |
| **Google Trends** | **每周1次** | **搜索趋势、内容选题** | **ContentBot, SEObot** |
| **App Store 趋势** | **每周1次** | **iOS应用市场洞察** | **AppBot, ProductBot** |
| **Google Play 趋势** | **每周1次** | **安卓应用市场洞察** | **AppBot, ProductBot** |
| **软件/工具热度** | **每周1次** | **工具选品、功能开发** | **TechBot, ToolBot** |

#### 3. 供应链数据类
| 信息项 | 更新频率 | 用途 | 使用机器人 |
|--------|----------|------|------------|
| 1688批发价格 | 每周1次 | 成本核算 | SupplyBot |
| 物流运费指数 | 每周1次 | 定价计算 | SupplyBot |
| 原材料价格 | 每周1次 | 成本预测 | SupplyBot |

#### 4. 技术与工具类
| 信息项 | 更新频率 | 用途 | 使用机器人 |
|--------|----------|------|------------|
| AI模型更新 | 每月1次 | 工具升级 | TechBot |
| 设计趋势 | 每月1次 | 视觉优化 | DesignBot |
| 开发框架版本 | 每月1次 | 技术栈更新 | CodeBot |

---

## 🗄️ 知识库结构

```
/shared_knowledge/
├── financial/
│   ├── gold_price.json          # 黄金价格缓存
│   ├── oil_price.json           # 原油价格缓存
│   ├── exchange_rates.json      # 汇率缓存
│   └── market_indices.json      # 大盘指数缓存
│   └── last_updated.txt         # 最后更新时间
│
├── market/
│   ├── fiverr_trends.json       # Fiverr平台趋势
│   ├── upwork_skills.json       # Upwork热门技能
│   ├── social_trends.json       # 社交媒体趋势
│   ├── competitor_intel.json    # 竞争情报
│   ├── google_trends.json       # Google搜索趋势
│   ├── app_store_trends.json    # App Store热门应用
│   ├── play_store_trends.json   # Google Play热门应用
│   └── software_trends.json     # 软件/工具热度
│   └── last_updated.txt         # 最后更新时间
│
├── supply_chain/
│   ├── wholesale_prices.json    # 批发价格
│   ├── shipping_rates.json      # 物流运费
│   └── material_costs.json      # 原材料成本
│   └── last_updated.txt         # 最后更新时间
│
├── creative/
│   ├── design_trends.json       # 设计趋势
│   ├── content_templates.json   # 内容模板库
│   └── copywriting_formulas.json # 文案公式
│
└── shared/
    ├── api_call_log.json        # API调用记录
    ├── rate_limit_status.json   # 限流状态
    └── bot_usage_stats.json     # 机器人使用统计
```

---

## 🔄 信息更新策略

### 高频任务（每日1次，早8点）
- [ ] 获取金融数据（黄金/石油/汇率）
- [ ] 更新市场指数
- [ ] 检查API限流状态

### 中频任务（每周1次，周一早9点）
- [ ] 更新平台趋势（Fiverr/Upwork）
- [ ] 更新社交媒体趋势
- [ ] 更新供应链数据
- [ ] 清理过期缓存

### 低频任务（每月1次，1号）
- [ ] 更新技术/设计趋势
- [ ] 归档旧数据
- [ ] 生成使用报告

---

## 📊 API调用优化策略

### 原则：一次获取，多方共享

**Before（重复调用）：**
```
黄金价格日报 → 调用API → 获取金价
石油黄金监控 → 调用API → 获取金价（重复！）
IntelAnalyst → 调用API → 获取金价（重复！）
```

**After（共享缓存）：**
```
中央情报局 → 调用API → 获取金价 → 存入共享库
黄金价格日报 → 读取共享库
石油黄金监控 → 读取共享库  
IntelAnalyst → 读取共享库
```

### 缓存有效期
| 数据类型 | 缓存时间 | 理由 |
|----------|----------|------|
| 金融数据 | 6小时 | 市场波动，需相对实时 |
| 市场趋势 | 7天 | 趋势变化较慢 |
| Google Trends | 3天 | 搜索趋势变化较快 |
| App/Play Store | 7天 | 应用排名相对稳定 |
| 软件工具趋势 | 14天 | 工具热度变化中等 |
| 供应链数据 | 7天 | 价格相对稳定 |
| 技术趋势 | 30天 | 变化缓慢 |

---

## 🤖 机器人接入指南

### 读取数据
```python
from shared_intel import IntelHub

hub = IntelHub()
gold_price = hub.get("financial", "gold_price")
# 自动检查缓存，过期则提醒更新
```

### 更新数据
```python
# 只有中央调度器调用
hub.update("financial", "gold_price", new_data)
```

### 检查 freshness
```python
if hub.is_fresh("financial", "gold_price", max_age_hours=6):
    use_cache()
else:
    request_update()
```

---

## 📈 预期效果

| 指标 | Before | After | 优化 |
|------|--------|-------|------|
| 每日API调用 | 50+次 | 5-10次 | **80%↓** |
| 重复查询 | 60% | 0% | **100%↓** |
| 响应速度 | 2-5s | 0.1s | **95%↓** |
| 限流风险 | 高 | 低 | **显著降低** |

---

## ✅ 实施计划

### Phase 1: 建库（今天）
- [x] 创建目录结构
- [ ] 实现基础读写接口
- [ ] 设置缓存过期机制

### Phase 2: 迁移（明天）
- [ ] 修改现有机器人，接入共享库
- [ ] 调整cron任务频率
- [ ] 测试数据流

### Phase 3: 优化（本周）
- [ ] 添加智能预取
- [ ] 建立数据依赖图
- [ ] 监控API使用情况

---

*Central Intelligence Hub*
*一次获取，全厂共享*
