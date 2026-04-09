/**
 * RSS 监控模块 - 监听 RSS 订阅源
 */

const { loadEnv } = require('../utils/config');
loadEnv();

const rssMonitor = require('../services/rssMonitor');
const storage = require('../utils/storage');
const notifications = require('../utils/notifications');
const logger = require('../utils/logger');
const targets = require('../config/targets');
const dayjs = require('dayjs');

/**
 * 运行 RSS 监控
 */
async function run() {
  logger.info('📰 开始执行 RSS 监控...');
  
  try {
    // 1. 监控 RSS 源
    const results = await rssMonitor.monitorMultipleFeeds(
      targets.rss.feeds,
      {
        hours: 24,
        maxItems: targets.rss.maxItems
      }
    );
    
    // 2. 收集匹配的条目
    const allMatches = [];
    for (const feed of results) {
      for (const item of feed.items) {
        allMatches.push({
          ...item,
          source: feed.name
        });
      }
    }
    
    // 3. 去重（基于链接）
    const seen = new Set();
    const uniqueMatches = allMatches.filter(item => {
      if (seen.has(item.link)) return false;
      seen.add(item.link);
      return true;
    });
    
    // 4. 保存数据
    const date = dayjs().format('YYYY-MM-DD');
    const hour = dayjs().format('HH');
    
    const report = {
      timestamp: new Date().toISOString(),
      date,
      hour,
      totalFeeds: results.length,
      totalMatches: uniqueMatches.length,
      matches: uniqueMatches
    };
    
    await storage.saveData('rss', `${date}-${hour}.json`, report);
    
    // 5. 如果有重要匹配，发送通知
    if (uniqueMatches.length > 0) {
      await sendRSSNotifications(uniqueMatches.slice(0, 5));
    }
    
    logger.info(`✅ RSS 监控完成，发现 ${uniqueMatches.length} 条匹配内容`);
    return report;
    
  } catch (error) {
    logger.error('RSS 监控失败:', error);
    throw error;
  }
}

/**
 * 发送 RSS 匹配通知
 */
async function sendRSSNotifications(matches) {
  const lines = matches.map((item, index) => {
    return `${index + 1}. **${item.title}** (${item.source})\n   ${item.link}`;
  });
  
  const message = lines.join('\n\n');
  
  await notifications.notifyAll(message, {
    title: `📰 RSS 发现 ${matches.length} 条相关内容`
  });
}

// 如果是直接运行此模块
if (require.main === module) {
  run().then(() => {
    console.log('RSS 监控执行完成');
    process.exit(0);
  }).catch(error => {
    console.error('RSS 监控执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  run
};
