# 📊 数据分析仪表板系统

一个用于被动收入项目的综合数据分析系统，包含网站分析、内容表现追踪、收入追踪和GitHub统计。

## 🗂️ 文件结构

```
ai-agent-passive-income/
├── analytics-dashboard.js    # 网站访问分析
├── content-performance.js    # 内容表现追踪
├── revenue-tracker.js        # 收入追踪
├── github-stats.js           # GitHub统计
├── comprehensive-report.js   # 综合数据报告生成器
├── README.md                 # 本文件
└── example.js                # 使用示例
```

## 📦 组件说明

### 1. AnalyticsDashboard - 网站访问分析

追踪网站流量、用户行为和访问趋势。

**功能:**
- 页面浏览追踪
- 事件追踪（点击、滚动等）
- 转化率追踪
- 实时统计（活跃用户、热门页面）
- 设备/浏览器/地理位置分析
- 流量来源分析
- 自定义报告生成

**使用示例:**
```javascript
const AnalyticsDashboard = require('./analytics-dashboard.js');

const analytics = new AnalyticsDashboard({
  trackingId: 'my-site',
  dataRetention: 90
});

// 追踪页面浏览
analytics.trackPageView({
  url: 'https://mysite.com/blog/post-1',
  title: 'My Blog Post'
});

// 追踪事件
analytics.trackEvent('signup', { plan: 'pro' });

// 追踪转化
analytics.trackConversion('purchase', 99, { product: 'premium' });

// 生成报告
const report = analytics.generateReport('30d');
console.log(report.summary);
```

---

### 2. ContentPerformance - 内容表现追踪

分析博客、视频、社交媒体等内容的表现数据。

**功能:**
- 多平台内容注册（博客、YouTube、Twitter等）
- 浏览量和参与度追踪
- 转化率分析
- 与平台基准对比
- 内容健康评分
- 自动推荐优化建议

**使用示例:**
```javascript
const ContentPerformance = require('./content-performance.js');

const content = new ContentPerformance();

// 注册内容
const blogPost = content.registerContent({
  type: 'blog',
  platform: 'blog',
  title: 'AI Passive Income Guide',
  url: 'https://mysite.com/blog/guide',
  tags: ['AI', 'passive income']
});

// 追踪互动
content.trackView(blogPost.id, { source: 'organic' });
content.trackEngagement(blogPost.id, 'like');
content.trackConversion(blogPost.id, 'signup', 0);

// 分析内容表现
const analysis = content.analyzeContent(blogPost.id, '30d');
console.log(`Score: ${analysis.score}/100`);
console.log(`Recommendations:`, analysis.recommendations);
```

---

### 3. RevenueTracker - 收入追踪

追踪多渠道收入、成本和利润分析。

**功能:**
- 多币种收入记录
- 支出/成本追踪
- 订阅管理（MRR/ARR计算）
- 利润率分析
- 收入预测
- 目标设置与追踪
- 财务报表生成

**使用示例:**
```javascript
const RevenueTracker = require('./revenue-tracker.js');

const revenue = new RevenueTracker({
  baseCurrency: 'USD'
});

// 记录收入
revenue.recordRevenue({
  amount: 299,
  currency: 'USD',
  source: 'product',
  channel: 'stripe',
  description: 'Premium Plan'
});

// 记录支出
revenue.recordExpense({
  amount: 50,
  currency: 'USD',
  category: 'hosting',
  description: 'Server costs'
});

// 设置收入目标
revenue.setGoal('30d', { revenue: 10000, profit: 5000 });

// 生成报告
const report = revenue.generateRevenueReport('30d');
console.log(`Revenue: $${report.summary.totalRevenue}`);
console.log(`Profit: $${report.summary.profit} (${report.summary.margin})`);
console.log(`MRR: $${report.summary.mrr}`);
```

---

### 4. GitHubStats - GitHub统计

追踪GitHub仓库数据、贡献分析和开发者指标。

**功能:**
- 仓库基础统计（stars, forks, issues）
- 提交分析（作者、类型、趋势）
- Issues分析（解决率、标签分布）
- Pull Request分析（合并率、周期）
- 贡献者统计
- 代码语言分析
- 仓库健康评分
- 用户profile分析

**使用示例:**
```javascript
const GitHubStats = require('./github-stats.js');

const github = new GitHubStats({
  token: 'your-github-token' // 可选，用于更高配额
});

// 分析仓库
const analysis = await github.analyzeRepository('owner', 'repo');
console.log(`Health Score: ${analysis.healthScore}/100`);
console.log(`Stars: ${analysis.repository.stars}`);
console.log(`Commits: ${analysis.commits.total}`);

// 分析用户
const profile = await github.analyzeUserProfile('username');
console.log(`Contribution Score: ${profile.contributionScore}/100`);
```

---

### 5. ComprehensiveReport - 综合报告

整合所有数据源生成统一的分析报告。

**功能:**
- 自动收集所有数据源
- 计算综合KPI
- 生成洞察和建议
- 收入预测
- 多格式导出（JSON, Markdown, HTML）
- 行动清单生成

**使用示例:**
```javascript
const ComprehensiveReport = require('./comprehensive-report.js');

const report = new ComprehensiveReport({
  reportPeriod: '30d',
  includeProjections: true
});

// 生成报告
const result = await report.generateReport({
  github: { owner: 'username', repo: 'repo' } // 可选
});

// 导出为Markdown
const markdown = report.formatReport(result, 'markdown');
console.log(markdown);
```

---

## 🚀 快速开始

### 安装依赖

无需额外依赖，纯JavaScript实现。

### 运行示例

```bash
# 进入项目目录
cd ai-agent-passive-income

# 运行综合报告生成器
node comprehensive-report.js

# 运行使用示例
node example.js
```

---

## 📊 报告输出示例

综合报告包含以下部分:

### 1. 执行摘要
- 整体健康度评分
- 核心KPI概览
- 关键发现
- 优先建议

### 2. 网站分析
- 流量统计
- 用户行为分析
- 转化率分析
- 设备/来源分布

### 3. 内容表现
- 内容质量评分
- 参与度分析
- 收入贡献
- 优化建议

### 4. 财务概况
- 收入/支出/利润
- 利润率分析
- MRR/ARR趋势
- 客户指标

### 5. 开发统计
- 仓库健康度
- 代码活动
- Issue/PR统计
- 贡献者分析

---

## 🔧 配置选项

### AnalyticsDashboard
```javascript
{
  trackingId: 'string',      // 追踪ID
  dataRetention: 90,         // 数据保留天数
  refreshInterval: 30000     // 刷新间隔（毫秒）
}
```

### ContentPerformance
```javascript
{
  platforms: ['blog', 'youtube', 'twitter'],  // 追踪的平台
  trackEngagement: true,                      // 追踪参与度
  trackConversions: true                      // 追踪转化
}
```

### RevenueTracker
```javascript
{
  baseCurrency: 'USD',       // 基础货币
  trackExpenses: true,       // 追踪支出
  autoCalculateProfit: true  // 自动计算利润
}
```

### GitHubStats
```javascript
{
  token: 'string',           // GitHub Personal Access Token
  baseUrl: 'https://api.github.com',
  cacheEnabled: true,
  cacheExpiry: 300000        // 缓存过期时间（毫秒）
}
```

---

## 📈 数据导出

所有组件都支持数据导出:

```javascript
// 导出为JSON
const jsonData = tracker.exportData('json');

// 导出为CSV
const csvData = tracker.exportData('csv');
```

---

## 🔄 更新计划

- [ ] 添加数据持久化（本地存储/数据库）
- [ ] 集成真实API（Google Analytics, Stripe等）
- [ ] 添加可视化图表
- [ ] 支持自定义指标
- [ ] 添加定时报告功能

---

## 📝 License

MIT
