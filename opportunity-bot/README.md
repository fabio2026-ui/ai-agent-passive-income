# 自动化商机发现机器人

🤖 一个智能化的商机发现系统，帮助您自动监控市场趋势、竞品动态和用户需求。

## 功能特性

- 📈 **趋势关键词监控** - 每日自动追踪 Google Trends 热门话题
- 💰 **竞品定价监控** - 实时追踪竞争对手价格变化
- 👥 **用户需求监听** - 监听 Reddit 和论坛中的用户需求讨论
- 📊 **智能周报生成** - 每周自动生成趋势分析报告

## 快速开始

### 1. 安装依赖

```bash
cd opportunity-bot
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 API 密钥和配置
```

### 3. 配置监控目标

编辑 `config/targets.js`，设置你要监控的：
- 竞品网站和价格选择器
- Reddit 子版块和关键词
- RSS 订阅源

### 4. 启动机器人

```bash
# 生产模式
npm start

# 开发模式（自动重启）
npm run dev
```

## 项目结构

```
opportunity-bot/
├── src/
│   ├── index.js              # 主入口，启动所有定时任务
│   ├── config/
│   │   └── targets.js        # 监控目标配置
│   ├── modules/
│   │   ├── trends.js         # 趋势监控模块
│   │   ├── pricing.js        # 定价监控模块
│   │   ├── reddit.js         # Reddit监听模块
│   │   └── report.js         # 周报生成模块
│   ├── utils/
│   │   ├── logger.js         # 日志工具
│   │   ├── storage.js        # 数据存储
│   │   └── notifications.js  # 通知服务
│   └── services/
│       ├── googleTrends.js   # Google Trends API封装
│       ├── priceTracker.js   # 价格追踪服务
│       └── rssMonitor.js     # RSS监控服务
├── data/                     # 数据存储目录
├── reports/                  # 生成的报告目录
├── logs/                     # 日志目录
├── .env                      # 环境变量
└── package.json
```

## 配置说明

### 环境变量 (.env)

```env
# Reddit API 配置
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USERNAME=your_username
REDDIT_PASSWORD=your_password
REDDIT_USER_AGENT=OpportunityBot/1.0

# 邮件通知配置
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_TO=recipient@example.com

# 通用配置
LOG_LEVEL=info
DATA_DIR=./data
REPORTS_DIR=./reports
```

### 监控目标配置 (config/targets.js)

```javascript
module.exports = {
  // 要监控的竞品
  competitors: [
    {
      name: '竞品A',
      url: 'https://competitor-a.com/product',
      priceSelector: '.product-price',
      productName: '产品A'
    }
  ],
  
  // Reddit 子版块和关键词
  reddit: {
    subreddits: ['startups', 'SaaS', 'webdev'],
    keywords: ['looking for', 'recommendation', 'alternative to', 'need help']
  },
  
  // RSS 订阅源
  rss: {
    feeds: [
      'https://news.ycombinator.com/rss',
      'https://www.producthunt.com/feed'
    ],
    keywords: ['startup', 'SaaS', 'tool']
  },
  
  // Google Trends 关键词
  trends: {
    keywords: ['SaaS', 'startup tools', 'productivity software'],
    geo: 'US',
    timeRange: 'today 5-y'
  }
};
```

## 定时任务

| 任务 | 频率 | 描述 |
|------|------|------|
| 趋势搜索 | 每天 9:00 | 获取 Google Trends 数据 |
| 价格监控 | 每 4 小时 | 检查竞品价格变化 |
| Reddit 监听 | 每小时 | 扫描 Reddit 新帖 |
| RSS 监控 | 每 2 小时 | 检查 RSS 订阅更新 |
| 周报生成 | 每周一 10:00 | 生成趋势分析报告 |

## 数据存储

- 价格数据: `data/pricing/`
- 趋势数据: `data/trends/`
- Reddit数据: `data/reddit/`
- 报告文件: `reports/`

## API 说明

### 手动运行模块

```bash
# 手动获取趋势数据
npm run trends

# 手动检查价格
npm run pricing

# 手动扫描 Reddit
npm run reddit

# 手动生成报告
npm run report
```

## 扩展开发

### 添加新的监控源

1. 在 `src/services/` 创建新的服务文件
2. 在 `src/modules/` 创建对应的模块
3. 在 `src/index.js` 添加定时任务

### 自定义通知方式

在 `src/utils/notifications.js` 中添加新的通知渠道（钉钉、Slack、企业微信等）

## 注意事项

- Reddit API 有速率限制，请合理设置请求频率
- 部分网站可能需要 Puppeteer 渲染 JavaScript
- 建议使用代理池防止 IP 被封
- 定期检查并更新 CSS 选择器

## 许可证

MIT License
