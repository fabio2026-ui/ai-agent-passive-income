/**
 * 综合数据报告生成器
 * 整合所有数据源生成统一的分析报告
 */

const AnalyticsDashboard = require('./analytics-dashboard.js');
const ContentPerformance = require('./content-performance.js');
const RevenueTracker = require('./revenue-tracker.js');
const GitHubStats = require('./github-stats.js');

class ComprehensiveReport {
  constructor(config = {}) {
    this.config = {
      reportPeriod: config.reportPeriod || '30d',
      outputFormat: config.outputFormat || 'json',
      includeProjections: config.includeProjections !== false,
      includeBenchmarks: config.includeBenchmarks !== false,
      ...config
    };
    
    this.analytics = new AnalyticsDashboard();
    this.content = new ContentPerformance();
    this.revenue = new RevenueTracker();
    this.github = new GitHubStats(config.github);
  }

  // ========== 生成综合报告 ==========
  
  async generateReport(options = {}) {
    const period = options.period || this.config.reportPeriod;
    
    console.log('📊 正在生成综合数据报告...\n');
    
    // 并行收集所有数据源
    const [
      websiteAnalytics,
      contentAnalysis,
      financialReport,
      developmentStats
    ] = await Promise.all([
      this.collectWebsiteAnalytics(period),
      this.collectContentAnalysis(period),
      this.collectFinancialReport(period),
      this.collectDevelopmentStats(options.github)
    ]);
    
    // 计算综合指标
    const kpis = this.calculateKPIs({
      websiteAnalytics,
      contentAnalysis,
      financialReport,
      developmentStats
    });
    
    // 生成洞察和建议
    const insights = this.generateInsights({
      websiteAnalytics,
      contentAnalysis,
      financialReport,
      developmentStats,
      kpis
    });
    
    // 预测和建议
    const projections = this.config.includeProjections 
      ? this.generateProjections({
          websiteAnalytics,
          contentAnalysis,
          financialReport
        })
      : null;
    
    const report = {
      meta: {
        generatedAt: new Date().toISOString(),
        period,
        reportVersion: '1.0.0'
      },
      executiveSummary: {
        kpis,
        keyFindings: insights.keyFindings,
        topRecommendations: insights.topRecommendations
      },
      sections: {
        website: websiteAnalytics,
        content: contentAnalysis,
        revenue: financialReport,
        development: developmentStats
      },
      insights,
      projections,
      actionItems: this.generateActionItems(insights)
    };
    
    return report;
  }

  // ========== 数据收集 ==========
  
  async collectWebsiteAnalytics(period) {
    console.log('  📈 收集网站分析数据...');
    
    // 模拟一些示例数据（实际使用时会从真实数据源获取）
    this.analytics.trackPageView({
      url: 'https://example.com',
      path: '/',
      title: 'Homepage',
      source: 'organic'
    });
    
    this.analytics.trackEvent('signup', { plan: 'pro' });
    this.analytics.trackConversion('purchase', 99, { product: 'premium' });
    
    const report = this.analytics.generateReport(period);
    
    return {
      ...report,
      health: this.calculateWebsiteHealth(report)
    };
  }

  async collectContentAnalysis(period) {
    console.log('  📝 收集内容表现数据...');
    
    // 注册示例内容
    const blogPost = this.content.registerContent({
      type: 'blog',
      platform: 'blog',
      title: 'AI Passive Income Guide 2025',
      url: 'https://example.com/blog/ai-passive-income',
      publishDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
      tags: ['AI', 'passive income', 'automation'],
      wordCount: 3500
    });
    
    // 模拟内容互动数据
    this.content.trackView(blogPost.id, { source: 'organic', unique: true });
    this.content.trackView(blogPost.id, { source: 'social', unique: true });
    this.content.trackEngagement(blogPost.id, 'like');
    this.content.trackEngagement(blogPost.id, 'share');
    this.content.trackConversion(blogPost.id, 'signup', 0, { attribution: 'content' });
    
    const analysis = this.content.analyzeContent(blogPost.id, period);
    const allContent = this.content.analyzeAllContent(period);
    
    return {
      topContent: analysis,
      portfolio: allContent,
      health: this.calculateContentHealth(allContent)
    };
  }

  async collectFinancialReport(period) {
    console.log('  💰 收集财务数据...');
    
    // 记录示例收入和成本
    this.revenue.recordRevenue({
      amount: 299,
      currency: 'USD',
      source: 'product',
      channel: 'stripe',
      description: 'Premium Subscription'
    });
    
    this.revenue.recordRevenue({
      amount: 150,
      currency: 'USD',
      source: 'affiliate',
      channel: 'paypal',
      description: 'Affiliate Commission'
    });
    
    this.revenue.recordExpense({
      amount: 50,
      currency: 'USD',
      category: 'hosting',
      description: 'Server costs'
    });
    
    this.revenue.recordExpense({
      amount: 100,
      currency: 'USD',
      category: 'marketing',
      description: 'Ad spend'
    });
    
    const report = this.revenue.generateRevenueReport(period);
    
    return {
      ...report,
      health: this.calculateFinancialHealth(report)
    };
  }

  async collectDevelopmentStats(githubConfig) {
    console.log('  💻 收集开发统计数据...\n');
    
    if (!githubConfig) {
      return {
        status: 'skipped',
        message: '未提供GitHub配置，跳过开发统计'
      };
    }
    
    try {
      const analysis = await this.github.analyzeRepository(
        githubConfig.owner,
        githubConfig.repo
      );
      
      return {
        ...analysis,
        health: analysis.healthScore || 0
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  // ========== 健康度计算 ==========
  
  calculateWebsiteHealth(report) {
    let score = 50;
    
    if (report.summary.totalPageViews > 10000) score += 20;
    else if (report.summary.totalPageViews > 1000) score += 10;
    
    const bounceRate = parseFloat(report.summary.avgBounceRate) || 0;
    if (bounceRate < 0.4) score += 15;
    else if (bounceRate < 0.6) score += 10;
    
    return Math.min(100, score);
  }

  calculateContentHealth(allContent) {
    const avgScore = parseFloat(allContent.summary.avgScore) || 0;
    return Math.min(100, avgScore);
  }

  calculateFinancialHealth(report) {
    let score = 50;
    const margin = parseFloat(report.summary.margin) || 0;
    
    if (margin > 50) score += 25;
    else if (margin > 30) score += 15;
    else if (margin > 0) score += 5;
    
    const mrr = parseFloat(report.summary.mrr) || 0;
    if (mrr > 5000) score += 15;
    else if (mrr > 1000) score += 10;
    
    return Math.min(100, score);
  }

  // ========== KPI 计算 ==========
  
  calculateKPIs(data) {
    const { websiteAnalytics, contentAnalysis, financialReport, developmentStats } = data;
    
    return {
      overallHealth: Math.round(
        (websiteAnalytics.health + contentAnalysis.health + financialReport.health) / 3
      ),
      traffic: {
        totalPageViews: websiteAnalytics.summary.totalPageViews,
        uniqueVisitors: websiteAnalytics.summary.uniqueVisitors,
        avgPagesPerSession: websiteAnalytics.summary.avgPagesPerSession,
        bounceRate: websiteAnalytics.summary.avgBounceRate
      },
      content: {
        totalPieces: contentAnalysis.portfolio.totalContent,
        avgScore: contentAnalysis.portfolio.summary.avgScore,
        topPerformer: contentAnalysis.portfolio.topPerformers[0]?.content.title || 'N/A'
      },
      financial: {
        revenue: financialReport.summary.totalRevenue,
        profit: financialReport.summary.profit,
        margin: financialReport.summary.margin,
        mrr: financialReport.summary.mrr,
        growth: financialReport.comparison.revenue.change
      },
      development: developmentStats.status === 'ok' ? {
        healthScore: developmentStats.healthScore,
        stars: developmentStats.repository.stars,
        openIssues: developmentStats.issues.open,
        mergeRate: developmentStats.pullRequests.mergeRate
      } : null
    };
  }

  // ========== 洞察生成 ==========
  
  generateInsights(data) {
    const { websiteAnalytics, contentAnalysis, financialReport, kpis } = data;
    
    const keyFindings = [];
    const topRecommendations = [];
    
    // 流量分析
    if (kpis.traffic.totalPageViews > 10000) {
      keyFindings.push({
        type: 'positive',
        area: 'traffic',
        message: `流量表现良好，${kpis.traffic.totalPageViews} 页面浏览量`
      });
    } else {
      topRecommendations.push({
        priority: 'high',
        area: 'traffic',
        action: '增加内容产出频率以提升有机流量',
        impact: 'medium'
      });
    }
    
    // 财务分析
    const margin = parseFloat(kpis.financial.margin) || 0;
    if (margin > 30) {
      keyFindings.push({
        type: 'positive',
        area: 'finance',
        message: `利润率健康，达到 ${margin}%`
      });
    } else {
      topRecommendations.push({
        priority: 'high',
        area: 'finance',
        action: '优化成本结构，削减低效支出',
        impact: 'high'
      });
    }
    
    // 内容分析
    const avgScore = parseFloat(kpis.content.avgScore) || 0;
    if (avgScore > 70) {
      keyFindings.push({
        type: 'positive',
        area: 'content',
        message: `内容质量良好，平均得分 ${avgScore}`
      });
    }
    
    // 增长分析
    const growth = parseFloat(kpis.financial.growth) || 0;
    if (growth > 0) {
      keyFindings.push({
        type: 'positive',
        area: 'growth',
        message: `收入同比增长 ${growth}%`
      });
    } else if (growth < 0) {
      topRecommendations.push({
        priority: 'critical',
        area: 'growth',
        action: '收入增长放缓，需要新的收入来源',
        impact: 'high'
      });
    }
    
    return {
      keyFindings,
      topRecommendations: topRecommendations.slice(0, 5),
      detailed: {
        traffic: this.analyzeTrafficInsights(websiteAnalytics),
        content: this.analyzeContentInsights(contentAnalysis),
        financial: this.analyzeFinancialInsights(financialReport)
      }
    };
  }

  analyzeTrafficInsights(websiteAnalytics) {
    const insights = [];
    const sources = websiteAnalytics.trafficSources;
    
    const organic = sources.find(s => s.source === 'search');
    if (organic && parseFloat(organic.percentage) < 30) {
      insights.push({
        type: 'opportunity',
        message: 'SEO流量占比偏低，有优化空间',
        action: '优化关键页面SEO，增加长尾关键词内容'
      });
    }
    
    return insights;
  }

  analyzeContentInsights(contentAnalysis) {
    const insights = [];
    const portfolio = contentAnalysis.portfolio;
    
    if (portfolio.underPerformers.length > 0) {
      insights.push({
        type: 'improvement',
        message: `${portfolio.underPerformers.length} 个内容表现不佳`,
        action: '更新或重新推广这些内容'
      });
    }
    
    return insights;
  }

  analyzeFinancialInsights(financialReport) {
    const insights = [];
    
    const recurringPct = parseFloat(financialReport.summary.recurringPercentage) || 0;
    if (recurringPct < 30) {
      insights.push({
        type: 'opportunity',
        message: '重复收入占比偏低',
        action: '增加订阅服务或会员产品'
      });
    }
    
    return insights;
  }

  // ========== 预测生成 ==========
  
  generateProjections(data) {
    const { websiteAnalytics, contentAnalysis, financialReport } = data;
    
    // 简单线性预测
    const dailyAvg = parseFloat(financialReport.summary.totalRevenue) / 30;
    const growth = parseFloat(financialReport.comparison.revenue.change) / 100;
    
    const projections = [];
    for (let i = 1; i <= 90; i++) {
      const projected = dailyAvg * Math.pow(1 + growth, i / 30);
      projections.push({
        day: i,
        projectedRevenue: projected.toFixed(2),
        cumulative: (dailyAvg * i * (1 + growth)).toFixed(2)
      });
    }
    
    return {
      revenueForecast: {
        next30Days: (dailyAvg * 30 * (1 + growth)).toFixed(2),
        next90Days: (dailyAvg * 90 * Math.pow(1 + growth, 3)).toFixed(2),
        dailyProjections: projections
      },
      trafficForecast: {
        message: '基于当前增长趋势预测'
      }
    };
  }

  // ========== 行动项生成 ==========
  
  generateActionItems(insights) {
    return insights.topRecommendations.map(rec => ({
      ...rec,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: null,
      assignedTo: null
    }));
  }

  // ========== 报告导出 ==========
  
  formatReport(report, format = 'json') {
    if (format === 'markdown') {
      return this.formatAsMarkdown(report);
    }
    
    if (format === 'html') {
      return this.formatAsHTML(report);
    }
    
    return JSON.stringify(report, null, 2);
  }

  formatAsMarkdown(report) {
    const { meta, executiveSummary, sections, insights, actionItems } = report;
    
    return `# 📊 综合数据报告

生成时间: ${meta.generatedAt}  
报告周期: ${meta.period}

---

## 📈 执行摘要

### 核心KPI

| 指标 | 数值 | 状态 |
|------|------|------|
| 整体健康度 | ${executiveSummary.kpis.overallHealth}/100 | ${executiveSummary.kpis.overallHealth > 70 ? '✅' : '⚠️'} |
| 总收入 | $${executiveSummary.kpis.financial.revenue} | - |
| 利润率 | ${executiveSummary.kpis.financial.margin} | - |
| 月经常性收入 | $${executiveSummary.kpis.financial.mrr} | - |

### 关键发现

${executiveSummary.keyFindings.map(f => `- ${f.type === 'positive' ? '✅' : '⚠️'} **${f.area}**: ${f.message}`).join('\n')}

### 优先建议

${executiveSummary.topRecommendations.map((r, i) => `${i + 1}. **[${r.priority.toUpperCase()}]** ${r.area}: ${r.action}`).join('\n')}

---

## 🌐 网站分析

- 页面浏览量: ${sections.website.summary.totalPageViews}
- 独立访客: ${sections.website.summary.uniqueVisitors}
- 平均停留时间: ${sections.website.summary.avgSessionDuration}s

## 📝 内容表现

- 内容总数: ${sections.content.portfolio.totalContent}
- 平均得分: ${sections.content.portfolio.summary.avgScore}
- 总收入贡献: $${sections.content.portfolio.summary.totalRevenue}

## 💰 财务概况

- 总收入: $${sections.revenue.summary.totalRevenue}
- 总支出: $${sections.revenue.summary.totalExpenses}
- 净利润: $${sections.revenue.summary.profit}
- 利润率: ${sections.revenue.summary.margin}

---

## ✅ 行动清单

${actionItems.map((item, i) => `- [ ] ${item.action} (${item.priority})`).join('\n')}

---

*报告由数据分析仪表板系统自动生成*
`;
  }

  formatAsHTML(report) {
    // 简化的HTML输出
    return `<!DOCTYPE html>
<html>
<head>
  <title>综合数据报告</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .metric { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .positive { border-left: 4px solid #4caf50; }
    .warning { border-left: 4px solid #ff9800; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>📊 综合数据报告</h1>
  <p>生成时间: ${report.meta.generatedAt}</p>
  <p>报告周期: ${report.meta.period}</p>
  
  <h2>核心指标</h2>
  <div class="metric ${report.executiveSummary.kpis.overallHealth > 70 ? 'positive' : 'warning'}">
    <strong>整体健康度:</strong> ${report.executiveSummary.kpis.overallHealth}/100
  </div>
  
  <h2>财务概况</h2>
  <table>
    <tr><th>指标</th><th>数值</th></tr>
    <tr><td>总收入</td><td>$${report.executiveSummary.kpis.financial.revenue}</td></tr>
    <tr><td>净利润</td><td>$${report.executiveSummary.kpis.financial.profit}</td></tr>
    <tr><td>利润率</td><td>${report.executiveSummary.kpis.financial.margin}</td></tr>
  </table>
</body>
</html>`;
  }
}

// ========== CLI 运行 ==========

async function main() {
  const report = new ComprehensiveReport({
    reportPeriod: '30d',
    outputFormat: 'json'
  });
  
  const result = await report.generateReport({
    // github: { owner: 'yourusername', repo: 'yourrepo' } // 可选
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 综合数据报告生成完成');
  console.log('='.repeat(60));
  
  // 输出JSON
  console.log('\n📄 JSON 格式:');
  console.log(JSON.stringify(result, null, 2));
  
  // 输出Markdown
  console.log('\n📝 Markdown 格式预览:');
  console.log('-'.repeat(60));
  console.log(report.formatReport(result, 'markdown'));
  
  // 保存到文件
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  fs.writeFileSync(`report-${timestamp}.json`, JSON.stringify(result, null, 2));
  fs.writeFileSync(`report-${timestamp}.md`, report.formatReport(result, 'markdown'));
  
  console.log('\n✅ 报告已保存:');
  console.log(`   - report-${timestamp}.json`);
  console.log(`   - report-${timestamp}.md`);
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

// 导出
module.exports = ComprehensiveReport;
