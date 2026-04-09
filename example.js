/**
 * 使用示例 - 数据分析仪表板系统
 * 
 * 本文件演示如何使用各个组件
 */

const AnalyticsDashboard = require('./analytics-dashboard.js');
const ContentPerformance = require('./content-performance.js');
const RevenueTracker = require('./revenue-tracker.js');
const GitHubStats = require('./github-stats.js');
const ComprehensiveReport = require('./comprehensive-report.js');

console.log('🚀 数据分析仪表板系统 - 使用示例\n');
console.log('='.repeat(60));

// ========== 示例 1: 网站分析 ==========
console.log('\n📊 示例 1: 网站访问分析\n');

const analytics = new AnalyticsDashboard({
  trackingId: 'demo-site',
  dataRetention: 30
});

// 模拟页面浏览
for (let i = 0; i < 50; i++) {
  analytics.trackPageView({
    url: `https://example.com${['/blog', '/products', '/about', '/contact'][Math.floor(Math.random() * 4)]}`,
    title: 'Demo Page',
    source: ['organic', 'social', 'direct', 'referral'][Math.floor(Math.random() * 4)]
  });
}

// 模拟事件
analytics.trackEvent('signup', { plan: 'pro', source: 'homepage' });
analytics.trackEvent('download', { file: 'guide.pdf' });
analytics.trackEvent('share', { platform: 'twitter' });

// 模拟转化
analytics.trackConversion('purchase', 99, { product: 'premium' });
analytics.trackConversion('purchase', 299, { product: 'enterprise' });

const websiteReport = analytics.generateReport('7d');
console.log('📈 网站统计:');
console.log(`   总浏览量: ${websiteReport.summary.totalPageViews}`);
console.log(`   独立访客: ${websiteReport.summary.uniqueVisitors}`);
console.log(`   平均页面/会话: ${websiteReport.summary.avgPagesPerSession}`);
console.log(`   实时活跃用户: ${websiteReport.realTime.activeUsers}`);
console.log(`   热门页面: ${websiteReport.realTime.topPages.slice(0, 3).map(p => p.path).join(', ')}`);

// ========== 示例 2: 内容表现 ==========
console.log('\n' + '='.repeat(60));
console.log('\n📝 示例 2: 内容表现追踪\n');

const content = new ContentPerformance();

// 注册多个内容
const contents = [
  {
    type: 'blog',
    platform: 'blog',
    title: '如何通过AI实现被动收入',
    url: 'https://example.com/blog/ai-passive-income',
    tags: ['AI', '被动收入', '自动化']
  },
  {
    type: 'blog',
    platform: 'blog',
    title: '2025年最佳副业项目',
    url: 'https://example.com/blog/side-hustles-2025',
    tags: ['副业', '赚钱', '趋势']
  },
  {
    type: 'video',
    platform: 'youtube',
    title: 'AI工具完整教程',
    url: 'https://youtube.com/watch?v=xxx',
    tags: ['教程', 'AI工具']
  }
];

const contentItems = contents.map(c => content.registerContent(c));
const contentIds = contentItems.map(c => c.id);

// 模拟内容互动
contentIds.forEach((id, idx) => {
  const baseViews = [1000, 500, 200][idx];
  
  for (let i = 0; i < baseViews; i++) {
    content.trackView(id, { source: ['organic', 'social', 'email'][Math.floor(Math.random() * 3)], unique: true });
  }
  
  // 模拟参与度
  for (let i = 0; i < baseViews * 0.05; i++) {
    content.trackEngagement(id, ['like', 'share', 'comment'][Math.floor(Math.random() * 3)]);
  }
  
  // 模拟转化
  for (let i = 0; i < baseViews * 0.02; i++) {
    content.trackConversion(id, 'signup', 0);
  }
});

// 分析内容
const contentAnalysis = content.analyzeContent(contentIds[0], '30d');
console.log('📝 内容分析 - 第一篇博客:');
console.log(`   标题: ${contentAnalysis.content.title}`);
console.log(`   得分: ${contentAnalysis.score}/100`);
console.log(`   浏览量: ${contentAnalysis.summary.totalViews}`);
console.log(`   参与率: ${contentAnalysis.engagement.ratePercent}`);
console.log(`   转化率: ${contentAnalysis.conversions.ratePercent}`);
console.log(`   建议: ${contentAnalysis.recommendations[0]?.message || '表现良好!'}`);

// 批量分析
const allContent = content.analyzeAllContent('30d');
console.log(`\n📊 全部内容概览:`);
console.log(`   内容总数: ${allContent.totalContent}`);
console.log(`   平均得分: ${allContent.summary.avgScore}`);
console.log(`   总收入: $${allContent.summary.totalRevenue}`);

// ========== 示例 3: 收入追踪 ==========
console.log('\n' + '='.repeat(60));
console.log('\n💰 示例 3: 收入追踪\n');

const revenue = new RevenueTracker({
  baseCurrency: 'USD'
});

// 记录收入
const revenueSources = [
  { amount: 99, source: 'product', description: 'Pro Plan' },
  { amount: 299, source: 'product', description: 'Enterprise Plan' },
  { amount: 150, source: 'affiliate', description: 'Tool Affiliate' },
  { amount: 200, source: 'ad', description: 'Ad Revenue' },
  { amount: 500, source: 'service', description: 'Consulting' }
];

revenueSources.forEach(r => {
  revenue.recordRevenue({
    ...r,
    currency: 'USD',
    channel: ['stripe', 'paypal'][Math.floor(Math.random() * 2)]
  });
});

// 记录支出
const expenses = [
  { amount: 50, category: 'hosting', description: 'Server Costs' },
  { amount: 30, category: 'software', description: 'Tools & Services' },
  { amount: 100, category: 'marketing', description: 'Ad Spend' },
  { amount: 200, category: 'salary', description: 'Contractor' }
];

expenses.forEach(e => {
  revenue.recordExpense({
    ...e,
    currency: 'USD'
  });
});

// 创建订阅
const subscription = revenue.createSubscription({
  customerId: 'cust_001',
  plan: 'Pro Monthly',
  amount: 29,
  interval: 'monthly'
});

revenue.recordSubscriptionPayment(subscription.id, {
  amount: 29,
  transactionId: 'txn_123'
});

// 设置目标
revenue.setGoal('30d', { revenue: 2000, profit: 1000 });

// 生成报告
const financialReport = revenue.generateRevenueReport('30d');
console.log('💰 财务报告:');
console.log(`   总收入: $${financialReport.summary.totalRevenue}`);
console.log(`   总支出: $${financialReport.summary.totalExpenses}`);
console.log(`   净利润: $${financialReport.summary.profit}`);
console.log(`   利润率: ${financialReport.summary.margin}`);
console.log(`   MRR: $${financialReport.summary.mrr}`);
console.log(`   同比增长: ${financialReport.comparison.revenue.change}`);

// 预测
const forecast = revenue.forecastRevenue(30);
console.log(`\n📈 收入预测:`);
console.log(`   日均收入: $${forecast.dailyAverage}`);
console.log(`   30天预测: $${forecast.forecast[29].cumulative}`);

// ========== 示例 4: GitHub统计 ==========
console.log('\n' + '='.repeat(60));
console.log('\n💻 示例 4: GitHub统计\n');

const github = new GitHubStats({
  cacheEnabled: true
});

// 注意: 需要GitHub Token才能获取完整数据
// 这里演示API结构
console.log('💻 GitHub统计模块已加载');
console.log('   支持功能:');
console.log('   - 仓库分析 (stars, forks, issues, PRs)');
console.log('   - 提交统计');
console.log('   - 贡献者分析');
console.log('   - 代码语言分析');
console.log('   - 仓库健康评分');
console.log('\n   使用方式:');
console.log('   const analysis = await github.analyzeRepository("owner", "repo");');
console.log('   const profile = await github.analyzeUserProfile("username");');

// ========== 示例 5: 综合报告 ==========
console.log('\n' + '='.repeat(60));
console.log('\n📋 示例 5: 综合报告\n');

async function generateSampleReport() {
  const report = new ComprehensiveReport({
    reportPeriod: '30d',
    includeProjections: true
  });
  
  // 注入示例数据
  report.analytics = analytics;
  report.content = content;
  report.revenue = revenue;
  
  const result = await report.generateReport();
  
  console.log('📋 综合报告概览:');
  console.log(`   整体健康度: ${result.executiveSummary.kpis.overallHealth}/100`);
  console.log(`   总收入: $${result.executiveSummary.kpis.financial.revenue}`);
  console.log(`   利润率: ${result.executiveSummary.kpis.financial.margin}`);
  console.log(`   MRR: $${result.executiveSummary.kpis.financial.mrr}`);
  console.log(`   流量: ${result.executiveSummary.kpis.traffic.totalPageViews} PV`);
  
  console.log(`\n   关键发现:`);
  result.executiveSummary.keyFindings.forEach((f, i) => {
    console.log(`   ${i + 1}. ${f.type === 'positive' ? '✅' : '⚠️'} ${f.message}`);
  });
  
  console.log(`\n   优先建议:`);
  result.executiveSummary.topRecommendations.forEach((r, i) => {
    console.log(`   ${i + 1}. [${r.priority.toUpperCase()}] ${r.action}`);
  });
  
  return result;
}

// 运行综合报告示例
generateSampleReport().then(result => {
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ 所有示例运行完成!\n');
  
  // 导出示例
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  fs.writeFileSync(`sample-report-${timestamp}.json`, JSON.stringify(result, null, 2));
  console.log(`📁 示例报告已保存: sample-report-${timestamp}.json`);
  
  console.log('\n💡 下一步:');
  console.log('   1. 运行 node comprehensive-report.js 生成完整报告');
  console.log('   2. 修改配置连接真实数据源');
  console.log('   3. 集成到您的应用中');
}).catch(console.error);
