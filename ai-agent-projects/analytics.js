#!/usr/bin/env node
/**
 * 分析追踪系统
 * 跟踪网站访问、GitHub Stars、收入
 */

const fs = require('fs');
const https = require('https');

const ANALYTICS_FILE = 'output/analytics.json';

// 加载现有数据
function loadAnalytics() {
  if (fs.existsSync(ANALYTICS_FILE)) {
    return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
  }
  return {
    startDate: new Date().toISOString(),
    metrics: {
      website: { visits: 0, pageViews: 0 },
      github: { stars: 0, forks: 0, visitors: 0 },
      content: { articles: 0, words: 0 },
      revenue: { credits: 0, products: 0, affiliate: 0 }
    },
    history: []
  };
}

// 获取GitHub统计
async function getGitHubStats() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/fabio2026-ui/ai-agent-passive-income',
      headers: { 'User-Agent': 'AI-Agent-Analytics' }
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            stars: json.stargazers_count || 0,
            forks: json.forks_count || 0,
            watchers: json.watchers_count || 0
          });
        } catch {
          resolve({ stars: 0, forks: 0, watchers: 0 });
        }
      });
    }).on('error', () => resolve({ stars: 0, forks: 0, watchers: 0 }));
  });
}

// 统计内容
function getContentStats() {
  const files = fs.readdirSync('content').filter(f => f.endsWith('.md'));
  let totalWords = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(`content/${file}`, 'utf8');
    totalWords += content.split(/\\s+/).length;
  }
  
  return { articles: files.length, words: totalWords };
}

// 主函数
async function main() {
  console.log('📊 分析追踪系统\n');
  
  const analytics = loadAnalytics();
  
  // 获取GitHub统计
  console.log('🐙 获取GitHub数据...');
  const githubStats = await getGitHubStats();
  analytics.metrics.github = githubStats;
  console.log(`  ⭐ Stars: ${githubStats.stars}`);
  console.log(`  🍴 Forks: ${githubStats.forks}`);
  
  // 内容统计
  console.log('\n📝 内容统计...');
  const contentStats = getContentStats();
  analytics.metrics.content = contentStats;
  console.log(`  📄 文章: ${contentStats.articles}`);
  console.log(`  ✍️  字数: ${contentStats.words.toLocaleString()}`);
  
  // 记录历史
  analytics.history.push({
    date: new Date().toISOString(),
    ...analytics.metrics
  });
  
  // 保存
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
  
  // 生成报告
  console.log('\n📈 预估收入');
  console.log('-----------');
  const traffic = contentStats.articles * 150; // 每篇文章150访问
  const monthlyRevenue = {
    credits: 1500,
    products: 800,
    affiliate: Math.round(traffic * 0.03 * 0.05 * 50) // 3% CTR, 5% conv, $50 avg
  };
  const total = Object.values(monthlyRevenue).reduce((a, b) => a + b, 0);
  
  console.log(`  Credits: €${monthlyRevenue.credits}`);
  console.log(`  Products: €${monthlyRevenue.products}`);
  console.log(`  Affiliate: $${monthlyRevenue.affiliate}`);
  console.log(`  总计: ~€${total + Math.round(monthlyRevenue.affiliate * 0.9)}`);
  
  console.log('\n✅ 分析完成');
  console.log(`📁 报告: ${ANALYTICS_FILE}`);
}

main().catch(console.error);
