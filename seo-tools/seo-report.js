/**
 * SEO Report Generator - SEO综合报告生成器
 * 整合所有SEO工具的分析结果，生成综合报告
 */

const fs = require('fs');
const path = require('path');
const SEOAnalyzer = require('./seo-analyzer');
const MetaGenerator = require('./meta-generator');
const KeywordsOptimizer = require('./keywords-optimizer');
const SitemapGenerator = require('./sitemap-generator');

class SEOReportGenerator {
  constructor(options = {}) {
    this.contentDir = options.contentDir || '../public/content';
    this.outputDir = options.outputDir || './reports';
    this.siteConfig = {
      name: options.siteName || 'AI Agent 被动收入指南',
      url: options.siteUrl || 'https://ai-agent-passive-income.com',
      ...options.siteConfig
    };
    
    this.results = {
      analysis: null,
      keywords: null,
      meta: null,
      sitemap: null
    };
  }

  /**
   * 运行完整的SEO分析并生成报告
   */
  async generateFullReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 SEO 综合分析工具');
    console.log('='.repeat(60) + '\n');
    
    const startTime = Date.now();
    
    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // 1. SEO分析
    console.log('📊 步骤 1/4: 分析文章SEO得分...');
    const analyzer = new SEOAnalyzer({ contentDir: this.contentDir });
    this.results.analysis = await analyzer.analyzeAll();
    analyzer.exportJSON(path.join(this.outputDir, 'seo-analysis.json'));
    
    // 2. 关键词优化分析
    console.log('\n🔑 步骤 2/4: 分析关键词优化...');
    const keywordOptimizer = new KeywordsOptimizer({ contentDir: this.contentDir });
    this.results.keywords = await keywordOptimizer.analyzeAll();
    keywordOptimizer.exportReport(path.join(this.outputDir, 'keywords-analysis.json'));
    
    // 3. 生成Meta标签
    console.log('\n📝 步骤 3/4: 生成Meta标签...');
    const metaGenerator = new MetaGenerator({ 
      contentDir: this.contentDir,
      siteName: this.siteConfig.name,
      siteUrl: this.siteConfig.url
    });
    this.results.meta = await metaGenerator.generateAll();
    
    // 4. 生成Sitemap
    console.log('\n🗺️  步骤 4/4: 生成站点地图...');
    const sitemapGenerator = new SitemapGenerator({
      contentDir: this.contentDir,
      outputDir: '../public',
      siteName: this.siteConfig.name,
      siteUrl: this.siteConfig.url
    });
    await sitemapGenerator.generateFullPackage();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // 生成综合报告
    console.log('\n📋 生成综合报告...');
    await this.generateReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SEO分析完成!');
    console.log(`   耗时: ${duration}秒`);
    console.log(`   报告位置: ${path.resolve(this.outputDir)}`);
    console.log('='.repeat(60) + '\n');
    
    return this.results;
  }

  /**
   * 生成综合报告
   */
  async generateReport() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // 生成JSON报告
    this.generateJSONReport();
    
    // 生成Markdown报告
    this.generateMarkdownReport();
    
    // 生成HTML报告
    this.generateHTMLReport();
    
    // 生成行动计划
    this.generateActionPlan();
  }

  /**
   * 生成JSON报告
   */
  generateJSONReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      site: this.siteConfig,
      summary: this.generateSummary(),
      seoScores: this.results.analysis,
      keywords: this.results.keywords,
      recommendations: this.generateAllRecommendations()
    };
    
    fs.writeFileSync(
      path.join(this.outputDir, 'complete-seo-report.json'),
      JSON.stringify(report, null, 2)
    );
    console.log('   ✅ complete-seo-report.json');
  }

  /**
   * 生成汇总统计
   */
  generateSummary() {
    const analysis = this.results.analysis;
    const keywords = this.results.keywords;
    
    return {
      totalArticles: analysis.totalArticles,
      averageSeoScore: analysis.averageScore,
      scoreDistribution: analysis.summary.scoreRanges,
      avgScoresByDimension: analysis.summary.avgScores,
      totalKeywords: keywords.summary.totalKeywords,
      avgKeywordOptimization: keywords.summary.avgOptimizationScore,
      priorityFixes: this.countPriorityFixes(),
      topOpportunities: keywords.topOpportunities
    };
  }

  /**
   * 统计优先级修复数量
   */
  countPriorityFixes() {
    let high = 0, medium = 0, low = 0;
    
    this.results.keywords.articles.forEach(article => {
      article.recommendations.forEach(rec => {
        if (rec.priority === 'high') high++;
        else if (rec.priority === 'medium') medium++;
        else low++;
      });
    });
    
    return { high, medium, low, total: high + medium + low };
  }

  /**
   * 生成所有建议
   */
  generateAllRecommendations() {
    const recommendations = [];
    
    // SEO得分相关建议
    const lowScoreArticles = this.results.analysis.articles.filter(a => a.totalScore < 60);
    if (lowScoreArticles.length > 0) {
      recommendations.push({
        category: 'SEO基础优化',
        priority: 'high',
        issue: `${lowScoreArticles.length}篇文章SEO得分低于60分`,
        action: '优先优化这些文章的标题、描述和结构',
        affectedPages: lowScoreArticles.slice(0, 5).map(a => a.fileName)
      });
    }
    
    // 关键词相关建议
    const lowKeywordScore = this.results.keywords.articles.filter(a => a.optimizationScore < 50);
    if (lowKeywordScore.length > 0) {
      recommendations.push({
        category: '关键词优化',
        priority: 'high',
        issue: `${lowKeywordScore.length}篇文章关键词优化不足`,
        action: '添加高价值关键词，优化关键词密度',
        affectedPages: lowKeywordScore.slice(0, 5).map(a => a.fileName)
      });
    }
    
    // 内容长度建议
    const shortContent = this.results.analysis.articles.filter(a => a.scores.contentLength < 50);
    if (shortContent.length > 0) {
      recommendations.push({
        category: '内容深度',
        priority: 'medium',
        issue: `${shortContent.length}篇文章内容偏短`,
        action: '扩展内容到1500字以上，增加深度和价值',
        affectedPages: shortContent.slice(0, 5).map(a => a.fileName)
      });
    }
    
    // 内链建议
    const poorLinks = this.results.analysis.articles.filter(a => a.scores.links < 60);
    if (poorLinks.length > 0) {
      recommendations.push({
        category: '内部链接',
        priority: 'medium',
        issue: `${poorLinks.length}篇文章缺乏内部链接`,
        action: '添加相关文章的内链，提升页面权重',
        affectedPages: poorLinks.slice(0, 5).map(a => a.fileName)
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdownReport() {
    const summary = this.generateSummary();
    const recommendations = this.generateAllRecommendations();
    
    let md = `# SEO 综合分析报告\n\n`;
    md += `**生成时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
    md += `**网站**: ${this.siteConfig.name}\n`;
    md += `**URL**: ${this.siteConfig.url}\n\n`;
    
    md += `---\n\n`;
    md += `## 📊 执行摘要\n\n`;
    md += `| 指标 | 数值 |\n`;
    md += `|------|------|\n`;
    md += `| 总文章数 | ${summary.totalArticles} |\n`;
    md += `| 平均SEO得分 | ${summary.averageSeoScore}/100 |\n`;
    md += `| 关键词优化平均分 | ${summary.avgKeywordOptimization}/100 |\n`;
    md += `| 高优先级修复 | ${summary.priorityFixes.high} 项 |\n`;
    md += `| 中优先级修复 | ${summary.priorityFixes.medium} 项 |\n`;
    md += `| 低优先级修复 | ${summary.priorityFixes.low} 项 |\n\n`;
    
    md += `### 分数分布\n\n`;
    md += `- 🟢 优秀 (80+): ${summary.scoreDistribution.excellent} 篇\n`;
    md += `- 🟡 良好 (60-79): ${summary.scoreDistribution.good} 篇\n`;
    md += `- 🟠 一般 (40-59): ${summary.scoreDistribution.average} 篇\n`;
    md += `- 🔴 较差 (<40): ${summary.scoreDistribution.poor} 篇\n\n`;
    
    md += `---\n\n`;
    md += `## 🔧 优化建议\n\n`;
    
    recommendations.forEach((rec, i) => {
      const priorityEmoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      md += `### ${i + 1}. ${priorityEmoji} ${rec.category}\n\n`;
      md += `- **问题**: ${rec.issue}\n`;
      md += `- **行动**: ${rec.action}\n`;
      md += `- **优先级**: ${rec.priority}\n\n`;
    });
    
    md += `---\n\n`;
    md += `## 📝 详细分析\n\n`;
    
    // SEO得分详情
    md += `### SEO得分详情 (TOP 10)\n\n`;
    md += `| 排名 | 文章 | 得分 | 主要问题 |\n`;
    md += `|------|------|------|----------|\n`;
    
    this.results.analysis.articles.slice(0, 10).forEach((article, i) => {
      const mainIssue = article.suggestions[0] || '无';
      md += `| ${i + 1} | ${article.title || article.fileName} | ${article.totalScore} | ${mainIssue} |\n`;
    });
    
    md += `\n### 各维度平均分\n\n`;
    md += `| 维度 | 得分 | 状态 |\n`;
    md += `|------|------|------|\n`;
    
    Object.entries(summary.avgScoresByDimension).forEach(([dim, score]) => {
      const status = score >= 80 ? '✅ 优秀' : score >= 60 ? '🟡 良好' : '🔴 需改进';
      md += `| ${dim} | ${score} | ${status} |\n`;
    });
    
    md += `\n---\n\n`;
    md += `## 🎯 下一步行动\n\n`;
    md += `1. **立即处理**: 修复高优先级问题\n`;
    md += `2. **本周完成**: 优化得分低于60的文章\n`;
    md += `3. **本月完成**: 提升关键词覆盖率和密度\n`;
    md += `4. **持续监控**: 每周运行SEO分析工具跟踪进展\n\n`;
    
    md += `---\n\n`;
    md += `*本报告由SEO工具套件自动生成*\n`;
    
    fs.writeFileSync(path.join(this.outputDir, 'SEO_REPORT.md'), md);
    console.log('   ✅ SEO_REPORT.md');
  }

  /**
   * 生成HTML报告
   */
  generateHTMLReport() {
    const summary = this.generateSummary();
    const recommendations = this.generateAllRecommendations();
    
    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO分析报告 - ${this.siteConfig.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: white;
      padding: 40px;
      border-radius: 20px;
      margin-bottom: 30px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header h1 {
      font-size: 2.5rem;
      color: #1a1a1a;
      margin-bottom: 10px;
    }
    .header .meta {
      color: #666;
    }
    .score-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .score-card {
      background: white;
      padding: 30px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      transition: transform 0.3s;
    }
    .score-card:hover {
      transform: translateY(-5px);
    }
    .score-number {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .score-good { color: #10B981; }
    .score-medium { color: #F59E0B; }
    .score-bad { color: #EF4444; }
    .score-label {
      color: #666;
      font-size: 0.9rem;
    }
    .section {
      background: white;
      padding: 30px;
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .section h2 {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: #1a1a1a;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
    }
    .recommendation {
      border-left: 4px solid;
      padding: 15px 20px;
      margin-bottom: 15px;
      background: #f9fafb;
      border-radius: 0 8px 8px 0;
    }
    .rec-high { border-color: #EF4444; }
    .rec-medium { border-color: #F59E0B; }
    .rec-low { border-color: #10B981; }
    .rec-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .rec-high .rec-title { color: #EF4444; }
    .rec-medium .rec-title { color: #F59E0B; }
    .rec-low .rec-title { color: #10B981; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
    }
    tr:hover {
      background: #f9fafb;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .badge-high { background: #FEE2E2; color: #991B1B; }
    .badge-medium { background: #FEF3C7; color: #92400E; }
    .badge-low { background: #D1FAE5; color: #065F46; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 SEO 综合分析报告</h1>
      <p class="meta">${this.siteConfig.name} | 生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    </div>
    
    <div class="score-grid">
      <div class="score-card">
        <div class="score-number ${summary.averageSeoScore >= 80 ? 'score-good' : summary.averageSeoScore >= 60 ? 'score-medium' : 'score-bad'}">${summary.averageSeoScore}</div>
        <div class="score-label">平均SEO得分</div>
      </div>
      <div class="score-card">
        <div class="score-number">${summary.totalArticles}</div>
        <div class="score-label">总文章数</div>
      </div>
      <div class="score-card">
        <div class="score-number ${summary.avgKeywordOptimization >= 80 ? 'score-good' : summary.avgKeywordOptimization >= 60 ? 'score-medium' : 'score-bad'}">${summary.avgKeywordOptimization}</div>
        <div class="score-label">关键词优化</div>
      </div>
      <div class="score-card">
        <div class="score-number score-bad">${summary.priorityFixes.high}</div>
        <div class="score-label">高优先级修复</div>
      </div>
    </div>
    
    <div class="section">
      <h2>🔧 优化建议</h2>
`;

    recommendations.forEach((rec, i) => {
      const priorityClass = rec.priority === 'high' ? 'rec-high' : rec.priority === 'medium' ? 'rec-medium' : 'rec-low';
      html += `
      <div class="recommendation ${priorityClass}">
        <div class="rec-title">${i + 1}. ${rec.category}</div>
        <p><strong>问题:</strong> ${rec.issue}</p>
        <p><strong>建议:</strong> ${rec.action}</p>
      </div>
`;
    });

    html += `
    </div>
    
    <div class="section">
      <h2>📈 TOP 10 文章</h2>
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>文章</th>
            <th>得分</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
`;

    this.results.analysis.articles.slice(0, 10).forEach((article, i) => {
      const status = article.totalScore >= 80 ? '<span class="badge badge-low">优秀</span>' : 
                    article.totalScore >= 60 ? '<span class="badge badge-medium">良好</span>' : 
                    '<span class="badge badge-high">需改进</span>';
      html += `
          <tr>
            <td>${i + 1}</td>
            <td>${article.title || article.fileName}</td>
            <td>${article.totalScore}</td>
            <td>${status}</td>
          </tr>
`;
    });

    html += `
        </tbody>
      </table>
    </div>
    
    <div class="section">
      <h2>📋 各维度分析</h2>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>平均分</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
`;

    Object.entries(summary.avgScoresByDimension).forEach(([dim, score]) => {
      const status = score >= 80 ? '<span class="badge badge-low">优秀</span>' : 
                    score >= 60 ? '<span class="badge badge-medium">良好</span>' : 
                    '<span class="badge badge-high">需改进</span>';
      html += `
          <tr>
            <td>${dim}</td>
            <td>${score}</td>
            <td>${status}</td>
          </tr>
`;
    });

    html += `
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
`;

    fs.writeFileSync(path.join(this.outputDir, 'SEO_REPORT.html'), html);
    console.log('   ✅ SEO_REPORT.html');
  }

  /**
   * 生成行动计划
   */
  generateActionPlan() {
    const recommendations = this.generateAllRecommendations();
    
    const actionPlan = {
      immediate: recommendations.filter(r => r.priority === 'high'),
      thisWeek: recommendations.filter(r => r.priority === 'medium'),
      thisMonth: recommendations.filter(r => r.priority === 'low'),
      schedule: {
        daily: ['检查新文章SEO得分', '监控关键词排名'],
        weekly: ['运行完整SEO分析', '更新sitemap'],
        monthly: ['审查整体SEO策略', '分析竞争对手']
      }
    };
    
    fs.writeFileSync(
      path.join(this.outputDir, 'ACTION_PLAN.json'),
      JSON.stringify(actionPlan, null, 2)
    );
    console.log('   ✅ ACTION_PLAN.json');
  }
}

// CLI 支持
if (require.main === module) {
  const generator = new SEOReportGenerator();
  generator.generateFullReport().catch(console.error);
}

module.exports = SEOReportGenerator;
