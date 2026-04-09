/**
 * 定价监控模块 - 监控竞品定价变化
 */

const path = require('path');
const { loadEnv } = require('../utils/config');
loadEnv();

const priceTracker = require('../services/priceTracker');
const storage = require('../utils/storage');
const notifications = require('../utils/notifications');
const logger = require('../utils/logger');
const targets = require('../config/targets');
const dayjs = require('dayjs');

/**
 * 运行价格监控
 */
async function run() {
  logger.info('💰 开始执行价格监控...');
  
  try {
    // 1. 获取当前价格
    const currentPrices = await priceTracker.fetchMultiplePrices(targets.competitors);
    
    // 2. 加载上一次价格数据
    const date = dayjs().format('YYYY-MM-DD');
    const previousData = await storage.loadData('pricing', 'latest.json');
    
    // 3. 对比价格变化
    const priceChanges = previousData 
      ? priceTracker.comparePrices(currentPrices, previousData.prices)
      : [];
    
    // 4. 保存当前价格
    const priceData = {
      timestamp: new Date().toISOString(),
      date,
      prices: currentPrices
    };
    
    await storage.saveData('pricing', `${date}.json`, priceData);
    await storage.saveData('pricing', 'latest.json', priceData);
    
    // 5. 记录价格变化日志
    if (priceChanges.length > 0) {
      await storage.appendLog('pricing-changes', {
        date,
        changes: priceChanges
      });
      
      logger.info(`发现 ${priceChanges.length} 个价格变化`);
      
      // 6. 发送价格变化通知
      await sendPriceChangeNotifications(priceChanges);
    }
    
    // 7. 生成价格监控报告
    const report = {
      timestamp: new Date().toISOString(),
      date,
      totalMonitored: currentPrices.length,
      successful: currentPrices.filter(p => !p.error).length,
      failed: currentPrices.filter(p => p.error).length,
      priceChanges: priceChanges.length,
      changes: priceChanges,
      currentPrices: currentPrices.map(p => ({
        name: p.name,
        price: p.price?.formatted || 'N/A',
        error: p.error || null
      }))
    };
    
    logger.info('✅ 价格监控完成');
    return report;
    
  } catch (error) {
    logger.error('价格监控失败:', error);
    throw error;
  }
}

/**
 * 发送价格变化通知
 */
async function sendPriceChangeNotifications(changes) {
  const lines = changes.map(change => {
    const emoji = change.direction === 'up' ? '📈' : '📉';
    return `${emoji} **${change.name}**: ${change.previousPrice} → ${change.currentPrice} (${change.changePercent}%)`;
  });
  
  const message = lines.join('\n');
  
  await notifications.notifyAll(message, {
    title: '💰 竞品价格变化通知'
  });
}

/**
 * 获取价格历史
 */
async function getPriceHistory(productName, days = 30) {
  const files = await storage.listFiles('pricing');
  const history = [];
  
  const cutoffDate = dayjs().subtract(days, 'day');
  
  for (const file of files) {
    const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) continue;
    
    const fileDate = dayjs(dateMatch[1]);
    if (fileDate.isBefore(cutoffDate)) continue;
    
    const data = await storage.loadData('pricing', file);
    if (!data) continue;
    
    const product = data.prices.find(p => p.name === productName);
    if (product?.price) {
      history.push({
        date: data.date,
        price: product.price.value,
        formatted: product.price.formatted
      });
    }
  }
  
  return history.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 生成价格趋势分析
 */
async function analyzePriceTrends() {
  const latest = await storage.loadData('pricing', 'latest.json');
  if (!latest) return null;
  
  const analysis = {
    timestamp: new Date().toISOString(),
    products: []
  };
  
  for (const product of latest.prices) {
    if (product.error) continue;
    
    const history = await getPriceHistory(product.name, 30);
    
    if (history.length >= 2) {
      const firstPrice = history[0].price;
      const lastPrice = history[history.length - 1].price;
      const change = ((lastPrice - firstPrice) / firstPrice) * 100;
      
      analysis.products.push({
        name: product.name,
        currentPrice: product.price.formatted,
        thirtyDayChange: change.toFixed(2) + '%',
        historyPoints: history.length,
        trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable'
      });
    }
  }
  
  return analysis;
}

// 如果是直接运行此模块
if (require.main === module) {
  run().then(() => {
    console.log('价格监控执行完成');
    process.exit(0);
  }).catch(error => {
    console.error('价格监控执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  run,
  getPriceHistory,
  analyzePriceTrends
};
