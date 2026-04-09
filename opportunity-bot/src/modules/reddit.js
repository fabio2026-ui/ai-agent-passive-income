/**
 * Reddit 监听模块 - 监控用户需求和商机
 */

const path = require('path');
const { loadEnv } = require('../utils/config');
loadEnv();

const redditService = require('../services/redditService');
const storage = require('../utils/storage');
const notifications = require('../utils/notifications');
const logger = require('../utils/logger');
const targets = require('../config/targets');
const dayjs = require('dayjs');

/**
 * 运行 Reddit 监听
 */
async function run() {
  logger.info('👥 开始执行 Reddit 监听...');
  
  // 检查 Reddit 配置
  if (!process.env.REDDIT_CLIENT_ID) {
    logger.warn('Reddit API 未配置，跳过 Reddit 监听');
    return { skipped: true, reason: 'API not configured' };
  }
  
  try {
    const client = redditService.createClient();
    const allOpportunities = [];
    
    // 1. 使用关键词搜索
    logger.info('正在搜索 Reddit 商机关键词...');
    const searchResults = await redditService.searchMultipleSubreddits(
      client,
      targets.reddit.subreddits,
      targets.reddit.keywords,
      { time: targets.reddit.timeRange, limit: 25 }
    );
    
    // 2. 过滤商机帖子
    const filteredPosts = redditService.filterOpportunityPosts(
      searchResults,
      targets.reddit.minScore,
      targets.reddit.excludeKeywords
    );
    
    // 3. 按相关性排序
    const sortedPosts = redditService.sortByRelevance(filteredPosts);
    
    // 4. 分析帖子内容
    const analyzedPosts = sortedPosts.map(post => ({
      ...post,
      opportunityScore: calculateOpportunityScore(post),
      category: categorizePost(post),
      summary: generateSummary(post)
    }));
    
    // 5. 筛选高价值商机
    const highValueOpportunities = analyzedPosts.filter(
      post => post.opportunityScore >= 70
    );
    
    // 6. 保存数据
    const date = dayjs().format('YYYY-MM-DD');
    const hour = dayjs().format('HH');
    
    const report = {
      timestamp: new Date().toISOString(),
      date,
      hour,
      totalScanned: searchResults.length,
      filtered: filteredPosts.length,
      highValueOpportunities: highValueOpportunities.length,
      opportunities: analyzedPosts.slice(0, 50) // 保存前50条
    };
    
    await storage.saveData('reddit', `${date}-${hour}.json`, report);
    await storage.appendLog('reddit-opportunities', {
      date,
      hour,
      opportunities: highValueOpportunities
    });
    
    // 7. 发送高价值商机通知
    if (highValueOpportunities.length > 0) {
      await sendOpportunityNotifications(highValueOpportunities.slice(0, 5));
    }
    
    logger.info(`✅ Reddit 监听完成，发现 ${highValueOpportunities.length} 个高价值商机`);
    return report;
    
  } catch (error) {
    logger.error('Reddit 监听失败:', error);
    throw error;
  }
}

/**
 * 计算商机评分
 */
function calculateOpportunityScore(post) {
  let score = 0;
  
  // 参与度评分（最高40分）
  score += Math.min(post.score / 10, 20);
  score += Math.min(post.numComments / 5, 20);
  
  // 关键词匹配度（最高30分）
  const highIntentKeywords = ['looking for', 'alternative to', 'need', 'recommendation'];
  const text = `${post.title} ${post.selftext}`.toLowerCase();
  
  for (const keyword of highIntentKeywords) {
    if (text.includes(keyword)) {
      score += 10;
    }
  }
  
  // 帖子类型加分
  if (post.isSelf) score += 10; // 自帖通常内容更详细
  
  // 近期加分
  const postDate = new Date(post.created);
  const hoursAgo = (Date.now() - postDate.getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 6) score += 20; // 6小时内的新帖
  else if (hoursAgo < 24) score += 10; // 24小时内的帖
  
  return Math.min(Math.round(score), 100);
}

/**
 * 分类帖子
 */
function categorizePost(post) {
  const text = `${post.title} ${post.selftext}`.toLowerCase();
  
  const categories = {
    '寻找工具': ['looking for', 'need a tool', 'recommendation'],
    '替代方案': ['alternative to', 'switching from', 'instead of'],
    '痛点求助': ['struggling with', 'frustrated', 'pain point', 'problem'],
    '功能需求': ['wish there was', 'feature request', 'would be nice'],
    '定价敏感': ['too expensive', 'pricing', 'cheaper alternative', 'free alternative']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => text.includes(k))) {
      return category;
    }
  }
  
  return '其他';
}

/**
 * 生成帖子摘要
 */
function generateSummary(post) {
  const text = post.selftext || post.title;
  if (text.length <= 200) return text;
  return text.substring(0, 200) + '...';
}

/**
 * 发送商机通知
 */
async function sendOpportunityNotifications(opportunities) {
  const lines = opportunities.map((opp, index) => {
    return `${index + 1}. **${opp.title}** (${opp.category})\n   评分: ${opp.opportunityScore} | 👍 ${opp.score} | 💬 ${opp.numComments}\n   🔗 ${opp.url}`;
  });
  
  const message = lines.join('\n\n');
  
  await notifications.notifyAll(message, {
    title: `🔥 发现 ${opportunities.length} 个高价值商机`
  });
}

/**
 * 获取热门商机趋势
 */
async function getOpportunityTrends(days = 7) {
  const recentLogs = await storage.loadRecent('reddit-opportunities', days);
  
  const categoryCounts = {};
  const keywordCounts = {};
  
  for (const log of recentLogs) {
    for (const opp of log.data.opportunities || []) {
      // 统计类别
      categoryCounts[opp.category] = (categoryCounts[opp.category] || 0) + 1;
      
      // 统计关键词
      const text = `${opp.title} ${opp.selftext}`.toLowerCase();
      for (const keyword of targets.reddit.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        }
      }
    }
  }
  
  return {
    categoryCounts,
    keywordCounts,
    totalOpportunities: recentLogs.reduce((sum, log) => 
      sum + (log.data.opportunities?.length || 0), 0
    )
  };
}

// 如果是直接运行此模块
if (require.main === module) {
  run().then(() => {
    console.log('Reddit 监听执行完成');
    process.exit(0);
  }).catch(error => {
    console.error('Reddit 监听执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  run,
  getOpportunityTrends,
  calculateOpportunityScore
};
