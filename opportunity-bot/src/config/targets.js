/**
 * 监控目标配置
 * 配置竞品、关键词、RSS源等监控目标
 */

module.exports = {
  /**
   * 竞品价格监控配置
   */
  competitors: [
    {
      name: 'Notion',
      url: 'https://www.notion.so/pricing',
      priceSelector: '[data-testid="pricing-plan-price"]',
      productName: 'Notion Pricing',
      note: '知识管理工具'
    },
    {
      name: 'Linear',
      url: 'https://linear.app/pricing',
      priceSelector: '.price',
      productName: 'Linear',
      note: '项目管理工具'
    },
    // 添加更多竞品...
  ],

  /**
   * Reddit 监控配置
   */
  reddit: {
    // 要监控的子版块
    subreddits: [
      'startups',
      'SaaS',
      'webdev',
      'sideproject',
      'ProductManagement',
      'Entrepreneur',
      'smallbusiness',
      'marketing',
      'nopcode',
      'indiehackers'
    ],
    
    // 商机相关关键词
    keywords: [
      'looking for',
      'recommendation',
      'alternative to',
      'need help with',
      'struggling with',
      'pain point',
      'frustrated by',
      'wish there was',
      'building a tool',
      'anyone know',
      'suggestions for',
      'best tool for',
      'tired of',
      'problem with'
    ],
    
    // 排除的关键词
    excludeKeywords: [
      'hiring',
      'job',
      'promotion',
      'spam'
    ],
    
    // 最小点赞数（过滤低质量帖子）
    minScore: 5,
    
    // 时间范围（hour, day, week, month, year, all）
    timeRange: 'day'
  },

  /**
   * RSS 订阅配置
   */
  rss: {
    feeds: [
      {
        url: 'https://news.ycombinator.com/rss',
        name: 'Hacker News',
        keywords: ['Show HN', 'startup', 'SaaS', 'launch']
      },
      {
        url: 'https://www.producthunt.com/feed',
        name: 'Product Hunt',
        keywords: ['SaaS', 'tool', 'productivity']
      },
      {
        url: 'https://feeds.feedburner.com/techcrunch/startups',
        name: 'TechCrunch Startups',
        keywords: ['funding', 'series', 'launched']
      }
    ],
    
    // 检查条数限制
    maxItems: 50
  },

  /**
   * Google Trends 监控配置
   */
  trends: {
    // 要追踪的关键词类别
    categories: {
      'SaaS': ['SaaS', 'software as a service', 'cloud software'],
      'Productivity': ['productivity tools', 'task management', 'project management'],
      'AI Tools': ['AI tools', 'chatgpt', 'AI automation', 'AI productivity'],
      'NoCode': ['no code', 'low code', 'bubble.io', 'webflow'],
      'Developer Tools': ['developer tools', 'dev tools', 'coding tools'],
      'Marketing': ['marketing automation', 'email marketing', 'SEO tools']
    },
    
    // 地理区域（US, CN, 或空字符串表示全球）
    geo: '',
    
    // 时间范围
    // today 1-d, today 7-d, today 1-m, today 3-m, today 12-m, today 5-y
    timeRange: 'today 7-d'
  },

  /**
   * 报告配置
   */
  report: {
    // 报告包含的项目数
    maxTrendsItems: 20,
    maxPricingChanges: 10,
    maxOpportunities: 15,
    
    // 报告标题模板
    titleTemplate: '商机周报 - {date}',
    
    // 报告接收者（覆盖环境变量）
    recipients: []
  }
};
