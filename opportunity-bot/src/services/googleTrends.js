/**
 * Google Trends API 封装
 */

const googleTrends = require('google-trends-api');
const logger = require('../utils/logger');

/**
 * 获取关键词趋势数据
 */
async function getInterestOverTime(keywords, options = {}) {
  const { geo = '', timeRange = 'today 7-d' } = options;
  
  try {
    const results = await googleTrends.interestOverTime({
      keyword: keywords,
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      geo,
      category: 0
    });
    
    return JSON.parse(results);
  } catch (error) {
    logger.error('获取 Google Trends 数据失败:', error.message);
    throw error;
  }
}

/**
 * 获取相关查询（ rising 和 top ）
 */
async function getRelatedQueries(keyword, options = {}) {
  const { geo = '', timeRange = 'today 7-d' } = options;
  
  try {
    const results = await googleTrends.relatedQueries({
      keyword,
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      geo
    });
    
    return JSON.parse(results);
  } catch (error) {
    logger.error(`获取 "${keyword}" 相关查询失败:`, error.message);
    return null;
  }
}

/**
 * 获取每日趋势
 */
async function getDailyTrends(options = {}) {
  const { geo = 'US' } = options;
  
  try {
    const results = await googleTrends.dailyTrends({
      geo,
      trendDate: new Date()
    });
    
    const data = JSON.parse(results);
    const trends = [];
    
    if (data.default && data.default.trendingSearchesDays) {
      data.default.trendingSearchesDays.forEach(day => {
        if (day.trendingSearches) {
          day.trendingSearches.forEach(search => {
            trends.push({
              title: search.title.query,
              traffic: search.formattedTraffic,
              articles: search.articles.map(a => ({
                title: a.title,
                url: a.url,
                source: a.source
              }))
            });
          });
        }
      });
    }
    
    return trends;
  } catch (error) {
    logger.error('获取每日趋势失败:', error.message);
    return [];
  }
}

/**
 * 获取实时趋势
 */
async function getRealtimeTrends(options = {}) {
  const { geo = 'US', category = 'all' } = options;
  
  try {
    const results = await googleTrends.realTimeTrends({
      geo,
      category
    });
    
    return JSON.parse(results);
  } catch (error) {
    logger.error('获取实时趋势失败:', error.message);
    return null;
  }
}

/**
 * 批量获取多个关键词的趋势
 */
async function getMultipleTrends(keywordGroups, options = {}) {
  const results = {};
  
  for (const [category, keywords] of Object.entries(keywordGroups)) {
    logger.info(`正在获取 "${category}" 类别趋势...`);
    
    try {
      const [interestData, relatedQueries] = await Promise.all([
        getInterestOverTime(keywords, options),
        getRelatedQueries(keywords[0], options)
      ]);
      
      results[category] = {
        keywords,
        interestOverTime: interestData,
        relatedQueries
      };
    } catch (error) {
      logger.error(`获取 "${category}" 趋势失败:`, error.message);
      results[category] = { error: error.message };
    }
    
    // 避免触发速率限制
    await sleep(1000);
  }
  
  return results;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  getInterestOverTime,
  getRelatedQueries,
  getDailyTrends,
  getRealtimeTrends,
  getMultipleTrends
};
