/**
 * 周报生成模块 - 每周自动生成趋势简报
 */

const fs = require('fs').promises;
const path = require('path');
const { loadEnv } = require('../utils/config');
loadEnv();

const storage = require('../utils/storage');
const notifications = require('../utils/notifications');
const logger = require('../utils/logger');
const targets = require('../config/targets');
const dayjs = require('dayjs');

/**
 * 运行周报生成
 */
async function run() {
  logger.info('📊 开始生成周报...');
  
  try {
    // 1. 收集数据
    const [trendsData, pricingData, redditData] = await Promise.all([
      collectTrendsData(),
      collectPricingData(),
      collectRedditData()
    ]);
    
    // 2. 生成报告
    const report = generateWeeklyReport({
      trends: trendsData,
      pricing: pricingData,
      reddit: redditData
    });
    
    // 3. 保存报告
    const weekRange = getWeekRange();
    const filename = `weekly-report-${weekRange}.md`;
    const reportPath = path.join(process.env.REPORTS_DIR || './reports', filename);
    
    await fs.writeFile(reportPath, report, 'utf8');
    logger.info(`周报已保存: ${reportPath}`);
    
    // 4. 发送报告
    await sendReport(report, filename);
    
    logger.info('✅ 周报生成完成');
    return { path: reportPath, filename };
    
  } catch (error) {
    logger.error('周报生成失败:', error);
    throw error;
  }
}

/**
 * 收集趋势数据
 */
async function collectTrendsData() {
  const weekData = await storage.loadRecent('trends', 7);
  
  if (weekData.length === 0) {
    return { hasData: false };
  }
  
  const latest = weekData[weekData.length - 1].data;
  
  // 收集各类别的上升查询
  const risingQueries = [];
  for (const [category, data] of Object.entries(latest.categories || {})) {
    if (data.relatedQueries?.default?.rising) {
      risingQueries.push(...data.relatedQueries.default.rising.map(q => ({
        ...q,
        category
      })));
    }
  }
  
  // 按增长排序
  risingQueries.sort((a, b) => (b.value || 0) - (a.value || 0));
  
  return {
    hasData: true,
    topRisingQueries: risingQueries.slice(0, 10),
    dailyTrends: latest.dailyTrends?.slice(0, 5) || [],
    categories: Object.keys(latest.categories || {})
  };
}

/**
 * 收集定价数据
 */
async function collectPricingData() {
  const latest = await storage.loadData('pricing', 'latest.json');
  const changes = await storage.loadRecent('pricing-changes', 7);
  
  const allChanges = changes.flatMap(c => c.data.changes || []);
  
  return {
    hasData: !!latest,
    currentPrices: latest?.prices?.filter(p => !p.error).map(p => ({
      name: p.name,
      price: p.price?.formatted || 'N/A'
    })) || [],
    weeklyChanges: allChanges.slice(0, 10)
  };
}

/**
 * 收集 Reddit 数据
 */
async function collectRedditData() {
  const logs = await storage.loadRecent('reddit-opportunities', 7);
  
  const allOpportunities = [];
  const categoryCounts = {};
  
  for (const log of logs) {
    for (const opp of log.data.opportunities || []) {
      allOpportunities.push(opp);
      categoryCounts[opp.category] = (categoryCounts[opp.category] || 0) + 1;
    }
  }
  
  // 按评分排序
  allOpportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
  
  return {
    hasData: allOpportunities.length > 0,
    totalOpportunities: allOpportunities.length,
    topOpportunities: allOpportunities.slice(0, 15),
    categoryDistribution: categoryCounts
  };
}

/**
 * 生成周报内容
 */
function generateWeeklyReport(data) {
  const weekRange = getWeekRange();
  const generatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
  
  let report = `# 📊 商机周报 ${weekRange}

> 生成时间: ${generatedAt}

## 📈 执行摘要

本周监控概览：
- **趋势监控**: ${data.trends.hasData ? '✅ 正常' : '❌ 无数据'}
- **竞品监控**: ${data.pricing.hasData ? '✅ 正常' : '❌ 无数据'}
- **Reddit监听**: ${data.reddit.hasData ? '✅ 正常' : '❌ 无数据'}

---

`;

  // 趋势部分
  report += `## 🔥 热门趋势

`;
  if (data.trends.hasData) {
    if (data.trends.topRisingQueries.length > 0) {
      report += `### 上升最快的搜索词\n\n`;
      report += `| 排名 | 关键词 | 类别 | 增长 |\n`;
      report += `|------|--------|------|------|\n`;
      
      data.trends.topRisingQueries.slice(0, 10).forEach((q, i) => {
        report += `| ${i + 1} | ${q.query} | ${q.category} | +${q.value}% |\n`;
      });
      
      report += `\n`;
    }
    
    if (data.trends.dailyTrends.length > 0) {
      report += `### 本周热门话题\n\n`;
      data.trends.dailyTrends.forEach(t => {
        report += `- **${t.title}** - ${t.traffic || 'N/A'} 搜索量\n`;
      });
      report += `\n`;
    }
  } else {
    report += `*暂无趋势数据*\n\n`;
  }

  // 定价部分
  report += `---

## 💰 竞品定价动态

`;
  if (data.pricing.hasData) {
    if (data.pricing.currentPrices.length > 0) {
      report += `### 当前价格一览\n\n`;
      report += `| 竞品 | 当前价格 |\n`;
      report += `|------|----------|\n`;
      
      data.pricing.currentPrices.forEach(p => {
        report += `| ${p.name} | ${p.price} |\n`;
      });
      
      report += `\n`;
    }
    
    if (data.pricing.weeklyChanges.length > 0) {
      report += `### 本周价格变动\n\n`;
      report += `| 竞品 | 变动 | 幅度 |\n`;
      report += `|------|------|------|\n`;
      
      data.pricing.weeklyChanges.forEach(c => {
        const direction = c.direction === 'up' ? '📈' : '📉';
        report += `| ${c.name} | ${direction} ${c.change} | ${c.changePercent}% |\n`;
      });
      
      report += `\n`;
    } else {
      report += `*本周无价格变动*\n\n`;
    }
  } else {
    report += `*暂无定价数据*\n\n`;
  }

  // Reddit 部分
  report += `---

## 👥 用户需求洞察

`;
  if (data.reddit.hasData) {
    report += `本周共发现 **${data.reddit.totalOpportunities}** 个潜在商机。\n\n`;
    
    if (Object.keys(data.reddit.categoryDistribution).length > 0) {
      report += `### 需求类别分布\n\n`;
      
      Object.entries(data.reddit.categoryDistribution)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
          report += `- **${category}**: ${count} 个\n`;
        });
      
      report += `\n`;
    }
    
    if (data.reddit.topOpportunities.length > 0) {
      report += `### 本周高价值商机\n\n`;
      
      data.reddit.topOpportunities.forEach((opp, i) => {
        report += `#### ${i + 1}. ${opp.title}\n\n`;
        report += `- **类别**: ${opp.category}\n`;
        report += `- **评分**: ${opp.opportunityScore}/100\n`;
        report += `- **互动**: 👍 ${opp.score} | 💬 ${opp.numComments}\n`;
        report += `- **来源**: r/${opp.subreddit}\n`;
        report += `- **链接**: ${opp.url}\n\n`;
        
        if (opp.summary && opp.summary.length > 10) {
          report += `> ${opp.summary}\n\n`;
        }
      });
    }
  } else {
    report += `*暂无 Reddit 数据*\n\n`;
  }

  // 结论和建议
  report += `---

## 💡 洞察与建议

基于本周数据，我们提出以下建议：

`;
  
  const recommendations = generateRecommendations(data);
  recommendations.forEach((rec, i) => {
    report += `${i + 1}. ${rec}\n`;
  });

  report += `

---

*本报告由 商机发现机器人 自动生成*
`;

  return report;
}

/**
 * 生成建议
 */
function generateRecommendations(data) {
  const recommendations = [];
  
  if (data.trends.hasData && data.trends.topRisingQueries.length > 0) {
    const topQuery = data.trends.topRisingQueries[0];
    recommendations.push(`关注 "${topQuery.query}" 的上升趋势，考虑相关产品开发或内容营销`);
  }
  
  if (data.pricing.weeklyChanges.length > 0) {
    const priceUp = data.pricing.weeklyChanges.filter(c => c.direction === 'up');
    if (priceUp.length > 0) {
      recommendations.push(`竞品 ${priceUp.map(c => c.name).join(', ')} 涨价，可能带来价格敏感用户的转移机会`);
    }
  }
  
  if (data.reddit.hasData) {
    const topCategory = Object.entries(data.reddit.categoryDistribution)
      .sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      recommendations.push(`Reddit 上 "${topCategory[0]}" 类讨论最多，建议针对性优化产品定位`);
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('继续监控市场动态，积累更多数据以生成洞察');
  }
  
  return recommendations;
}

/**
 * 获取周范围字符串
 */
function getWeekRange() {
  const end = dayjs();
  const start = end.subtract(6, 'day');
  return `${start.format('MM/DD')}-${end.format('MM/DD')}`;
}

/**
 * 发送报告
 */
async function sendReport(reportContent, filename) {
  const subject = `📊 商机周报 ${getWeekRange()}`;
  
  await notifications.notifyAll(reportContent, {
    title: subject,
    html: `<pre>${reportContent}</pre>`
  });
}

// 如果是直接运行此模块
if (require.main === module) {
  run().then((result) => {
    console.log(`周报生成完成: ${result.path}`);
    process.exit(0);
  }).catch(error => {
    console.error('周报生成失败:', error);
    process.exit(1);
  });
}

module.exports = {
  run,
  generateWeeklyReport,
  getWeekRange
};
