/**
 * ContentAI 自动化系统 - 全局配置
 * 所有配置项通过环境变量注入
 */

export const CONFIG = {
  // 基础配置
  APP_NAME: 'ContentAI',
  APP_URL: process.env.APP_URL || 'https://contentai.yourdomain.com',
  
  // Cloudflare D1 数据库
  D1_DATABASE_ID: process.env.D1_DATABASE_ID,
  
  // Moonshot AI API (Kimi)
  MOONSHOT_API_KEY: process.env.MOONSHOT_API_KEY,
  MOONSHOT_API_URL: 'https://api.moonshot.cn/v1/chat/completions',
  
  // 支付配置 - Coinbase Commerce
  COINBASE_API_KEY: process.env.COINBASE_API_KEY,
  COINBASE_WEBHOOK_SECRET: process.env.COINBASE_WEBHOOK_SECRET,
  
  // 支付配置 - NowPayments (备选)
  NOWPAYMENTS_API_KEY: process.env.NOWPAYMENTS_API_KEY,
  NOWPAYMENTS_WEBHOOK_SECRET: process.env.NOWPAYMENTS_WEBHOOK_SECRET,
  
  // 邮件服务 - Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@contentai.com',
  
  // 社交媒体 API
  REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
  REDDIT_USERNAME: process.env.REDDIT_USERNAME,
  REDDIT_PASSWORD: process.env.REDDIT_PASSWORD,
  
  TWITTER_API_KEY: process.env.TWITTER_API_KEY,
  TWITTER_API_SECRET: process.env.TWITTER_API_SECRET,
  TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_SECRET: process.env.TWITTER_ACCESS_SECRET,
  TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
  
  // 定价配置 (USD)
  PRICING: {
    BASIC: { price: 5, words: 500, description: '基础版 - 500词' },
    PRO: { price: 15, words: 1500, description: '专业版 - 1500词' },
    ENTERPRISE: { price: 49, words: 5000, description: '企业版 - 5000词' }
  },
  
  // 内容类型
  CONTENT_TYPES: [
    'blog_post',      // 博客文章
    'product_desc',   // 产品描述
    'social_post',    // 社交媒体帖子
    'email_copy',     // 邮件文案
    'ad_copy',        // 广告文案
    'seo_article',    // SEO文章
    'video_script',   // 视频脚本
    'whitepaper'      // 白皮书
  ]
};

// 内容类型配置
export const CONTENT_CONFIG = {
  blog_post: {
    name: '博客文章',
    prompt: '撰写一篇专业、有深度的博客文章',
    defaultTone: 'professional'
  },
  product_desc: {
    name: '产品描述',
    prompt: '撰写 compelling 的产品描述，突出卖点和优势',
    defaultTone: 'persuasive'
  },
  social_post: {
    name: '社交媒体帖子',
    prompt: '撰写吸引眼球的社交媒体帖子，包含相关标签',
    defaultTone: 'casual'
  },
  email_copy: {
    name: '邮件文案',
    prompt: '撰写高转化率的邮件营销文案',
    defaultTone: 'friendly'
  },
  ad_copy: {
    name: '广告文案',
    prompt: '撰写简短有力的广告文案',
    defaultTone: 'persuasive'
  },
  seo_article: {
    name: 'SEO文章',
    prompt: '撰写SEO优化的文章，自然融入关键词',
    defaultTone: 'informative'
  },
  video_script: {
    name: '视频脚本',
    prompt: '撰写适合视频制作的脚本，包含场景描述',
    defaultTone: 'engaging'
  },
  whitepaper: {
    name: '白皮书',
    prompt: '撰写专业的行业白皮书',
    defaultTone: 'academic'
  }
};

export default CONFIG;
