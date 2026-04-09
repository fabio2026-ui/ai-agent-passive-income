/**
 * 趋势监控模块 - 每日自动搜索 Google Trends
 */

const path = require('path');
const { loadEnv } = require('../utils/config');
loadEnv();

const googleTrends = require('../services/googleTrends');
const storage = require('../utils/storage');
const notifications = require('../utils/notifications');
const logger = require('../utils/logger');
const targets = require('../config/targets');
const dayjs = require('dayjs');

/**
 * 运行趋势监控
 */
async function run() {
  logger.info('📈 开始执行趋势监控...');
  
  try {
    // 1. 获取配置的类别趋势
    const trendResults = await googleTrends.getMultipleTrends(
      targets.trends.categories,
      {
        geo: targets.trends.geo,
        timeRange: targets.trends.timeRange
      }
    );
    
    // 2. 获取每日热门趋势
    const dailyTrends = await googleTrends.getDailyTrends({
      geo: targets.trends.geo || 'US'
    });
    
    // 3. 整理数据
    const report = {
      timestamp: new Date().toISOString(),
      date: dayjs().format('YYYY-MM-DD'),
      categories: trendResults,
      dailyTrends: dailyTrends.slice(0, 10),
      summary: generateSummary(trendResults, dailyTrends)
    };
    
    // 4. 保存数据
    const filename = `${report.date}.json`;
    await storage.saveData('trends', filename, report);
    logger.info(`趋势数据已保存: ${filename}`);
    
    // 5. 检查异常趋势（上升超过50%）
    const alerts = await checkForAlerts(trendResults);
    if (alerts.length > 0) {
      await sendAlertNotifications(alerts);
    }
    
    logger.info('✅ 趋势监控完成');
    return report;
    
  } catch (error) {
    logger.error('趋势监控失败:', error);
    throw error;
  }
}

/**
 * 生成趋势摘要
 */
function generateSummary(categories, dailyTrends) {
  const summary = {
    topTrendingCategories: [],
    risingQueries: [],
    insights: []
  };
  
  // 分析各类别的趋势
  for (const [category, data] of Object.entries(categories)) {
    if (data.error) continue;
    
    const relatedQueries = data.relatedQueries?.default?.rising || [];
    if (relatedQueries.length > 0) {
      summary.risingQueries.push({
        category,
        queries: relatedQueries.slice(0, 5)
      });
    }
  }
  
  // 添加热门趋势
  summary.topDailyTrends = dailyTrends.slice(0, 5).map(t => ({
    title: t.title,
    traffic: t.traffic
  }));
  
  return summary;
}

/**
 * 检查异常趋势
 */
async function checkForAlerts(trendResults) {
  const alerts = [];
  
  for (const [category, data] of Object.entries(trendResults)) {
    if (data.error) continue;
    
    const risingQueries = data.relatedQueries?.default?.rising || [];
    
    for (const query of risingQueries) {
      if (query.value > 200) { // 增长超过200%
        alerts.push({
          category,
          query: query.query,
          growth: query.value
        });
      }
    }
  }
  
  return alerts;
}

/**
 * 发送趋势告警
 */
async function sendAlertNotifications(alerts) {
  const message = alerts.map(a => 
    `🔥 **${a.category}**: "${a.query}" 搜索量增长 ${a.value}%`
  ).join('\n');
  
  await notifications.sendAlert('趋势异常告警', message);
}

/**
 * 获取历史趋势数据对比
 */
async function getTrendComparison(days = 7) {
  const recentData = await storage.loadRecent('trends', days);
  
  if (recentData.length < 2) {
    return null;
  }
  
  const comparisons = [];
  
  for (let i = 1; i < recentData.length; i++) {
    const current = recentData[i].data;
    const previous = recentData[i - 1].data;
    
    comparisons.push({
      date: current.date,
      changes: compareTrendData(current.categories, previous.categories)
    });
  }
  
  return comparisons;
}

/**
 * 对比趋势数据
 */
function compareTrendData(current, previous) {
  const changes = {};
  
  for (const category of Object.keys(current)) {
    if (!current[category]?.interestOverTime || !previous[category]?.interestOverTime) {
      continue;
    }
    
    const currentData = current[category].interestOverTime;
    const previousData = previous[category].interestOverTime;
    
    // 简化对比逻辑
    changes[category] = {
      hasData: true
    };
  }
  
  return changes;
}

// 如果是直接运行此模块
if (require.main === module) {
  run().then(() => {
    console.log('趋势监控执行完成');
    process.exit(0);
  }).catch(error => {
    console.error('趋势监控执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  run,
  getTrendComparison
};
