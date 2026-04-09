/**
 * RSS 监控服务
 */

const Parser = require('rss-parser');
const logger = require('../utils/logger');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'OpportunityBot/1.0'
  }
});

/**
 * 获取 RSS 订阅内容
 */
async function fetchRSSFeed(url) {
  try {
    const feed = await parser.parseURL(url);
    return {
      title: feed.title,
      description: feed.description,
      link: feed.link,
      items: feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.content || item['content:encoded'] || '',
        contentSnippet: item.contentSnippet || '',
        categories: item.categories || [],
        author: item.author || item.creator
      }))
    };
  } catch (error) {
    logger.error(`获取 RSS 失败 ${url}:`, error.message);
    return null;
  }
}

/**
 * 根据关键词过滤内容
 */
function filterByKeywords(items, keywords) {
  if (!keywords || keywords.length === 0) {
    return items;
  }
  
  return items.filter(item => {
    const searchText = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
    return keywords.some(keyword => 
      searchText.includes(keyword.toLowerCase())
    );
  });
}

/**
 * 过滤最近的内容
 */
function filterRecent(items, hours = 24) {
  const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
  
  return items.filter(item => {
    if (!item.pubDate) return false;
    const itemTime = new Date(item.pubDate).getTime();
    return itemTime >= cutoffTime;
  });
}

/**
 * 监控多个 RSS 源
 */
async function monitorMultipleFeeds(feedConfigs, options = {}) {
  const { maxItems = 50, hours = 24, keywords = [] } = options;
  const results = [];
  
  for (const config of feedConfigs) {
    logger.info(`正在获取 RSS: ${config.name || config.url}`);
    
    const feed = await fetchRSSFeed(config.url);
    if (!feed) continue;
    
    let items = feed.items.slice(0, maxItems);
    
    // 按时间过滤
    if (hours > 0) {
      items = filterRecent(items, hours);
    }
    
    // 按关键词过滤
    const searchKeywords = config.keywords || keywords;
    if (searchKeywords.length > 0) {
      items = filterByKeywords(items, searchKeywords);
    }
    
    results.push({
      name: config.name || feed.title,
      url: config.url,
      totalItems: feed.items.length,
      matchedItems: items.length,
      items: items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        snippet: item.contentSnippet?.substring(0, 200) + '...'
      }))
    });
  }
  
  return results;
}

module.exports = {
  fetchRSSFeed,
  filterByKeywords,
  filterRecent,
  monitorMultipleFeeds
};
