/**
 * Content Performance Tracker - 内容表现追踪
 * 用于分析内容（博客、视频、社交媒体帖子）的表现数据
 */

class ContentPerformance {
  constructor(config = {}) {
    this.config = {
      platforms: config.platforms || ['blog', 'youtube', 'twitter', 'newsletter'],
      trackEngagement: config.trackEngagement !== false,
      trackConversions: config.trackConversions !== false,
      ...config
    };
    this.content = new Map(); // 内容库
    this.metrics = new Map(); // 指标数据
    this.benchmarks = {
      blog: { avgReadTime: 180, avgBounceRate: 0.65, avgShareRate: 0.02 },
      youtube: { avgWatchTime: 0.45, avgCTR: 0.06, avgEngagement: 0.05 },
      twitter: { avgEngagement: 0.018, avgClickRate: 0.015, avgImpression: 1000 },
      newsletter: { avgOpenRate: 0.22, avgClickRate: 0.03, avgUnsubscribe: 0.002 }
    };
  }

  // ========== 内容注册与管理 ==========
  
  registerContent(contentData) {
    const content = {
      id: contentData.id || this.generateId(),
      type: contentData.type, // blog, video, podcast, social
      platform: contentData.platform,
      title: contentData.title,
      url: contentData.url,
      publishDate: contentData.publishDate || Date.now(),
      author: contentData.author,
      tags: contentData.tags || [],
      category: contentData.category,
      wordCount: contentData.wordCount,
      readingTime: contentData.readingTime,
      status: 'active',
      metadata: contentData.metadata || {}
    };
    
    this.content.set(content.id, content);
    
    // 初始化指标存储
    if (!this.metrics.has(content.id)) {
      this.metrics.set(content.id, {
        views: [],
        engagements: [],
        conversions: [],
        dailyStats: new Map()
      });
    }
    
    return content;
  }

  updateContent(id, updates) {
    const content = this.content.get(id);
    if (!content) return null;
    
    Object.assign(content, updates);
    this.content.set(id, content);
    return content;
  }

  // ========== 指标追踪 ==========
  
  trackView(contentId, viewData = {}) {
    const view = {
      timestamp: Date.now(),
      source: viewData.source || 'direct',
      referrer: viewData.referrer,
      utm: viewData.utm || {},
      unique: viewData.unique !== false,
      device: viewData.device,
      location: viewData.location
    };
    
    const metrics = this.metrics.get(contentId);
    if (metrics) {
      metrics.views.push(view);
      this.updateDailyStats(contentId, 'views', view.unique ? 1 : 0.5);
    }
    
    return view;
  }

  trackEngagement(contentId, engagementType, data = {}) {
    const engagement = {
      type: engagementType, // like, share, comment, save, click
      timestamp: Date.now(),
      value: data.value || 1,
      userId: data.userId,
      metadata: data.metadata || {}
    };
    
    const metrics = this.metrics.get(contentId);
    if (metrics) {
      metrics.engagements.push(engagement);
      this.updateDailyStats(contentId, engagementType, engagement.value);
    }
    
    return engagement;
  }

  trackConversion(contentId, conversionType, value = 0, data = {}) {
    const conversion = {
      type: conversionType, // signup, purchase, download, subscribe
      timestamp: Date.now(),
      value: value,
      attribution: data.attribution || 'direct',
      userId: data.userId,
      metadata: data.metadata || {}
    };
    
    const metrics = this.metrics.get(contentId);
    if (metrics) {
      metrics.conversions.push(conversion);
      this.updateDailyStats(contentId, 'conversions', 1);
      this.updateDailyStats(contentId, 'conversionValue', value);
    }
    
    return conversion;
  }

  updateDailyStats(contentId, metric, value) {
    const metrics = this.metrics.get(contentId);
    if (!metrics) return;
    
    const today = new Date().toISOString().split('T')[0];
    const daily = metrics.dailyStats.get(today) || {};
    
    daily[metric] = (daily[metric] || 0) + value;
    metrics.dailyStats.set(today, daily);
  }

  // ========== 性能分析 ==========
  
  analyzeContent(contentId, period = '30d') {
    const content = this.content.get(contentId);
    if (!content) return null;
    
    const metrics = this.metrics.get(contentId);
    if (!metrics) return null;
    
    const periodMs = this.parsePeriod(period);
    const cutoff = Date.now() - periodMs;
    
    // 过滤时间范围内的数据
    const views = (metrics.views || []).filter(v => v.timestamp > cutoff);
    const engagements = (metrics.engagements || []).filter(e => e.timestamp > cutoff);
    const conversions = (metrics.conversions || []).filter(c => c.timestamp > cutoff);
    
    // 基础统计
    const totalViews = views.length;
    const uniqueViews = new Set(views.map(v => v.userId).filter(Boolean)).size;
    
    // 参与度分析
    const engagementStats = this.calculateEngagementStats(engagements, totalViews);
    
    // 转化率分析
    const conversionStats = this.calculateConversionStats(conversions, totalViews);
    
    // 流量来源分析
    const sourceAnalysis = this.analyzeSources(views);
    
    // 时间趋势
    const trend = this.calculateTrend(metrics.dailyStats, period);
    
    // 与平台基准对比
    const benchmark = this.benchmarks[content.platform];
    const comparison = benchmark ? this.compareToBenchmark(engagementStats, benchmark) : null;
    
    // 内容年龄
    const contentAge = Math.ceil((Date.now() - content.publishDate) / (24 * 60 * 60 * 1000));
    
    // 性能评分
    const performanceScore = this.calculatePerformanceScore({
      totalViews,
      engagementStats,
      conversionStats,
      comparison,
      contentAge
    }, content.platform);
    
    return {
      content: {
        id: contentId,
        title: content.title,
        platform: content.platform,
        type: content.type,
        age: contentAge,
        publishDate: new Date(content.publishDate).toISOString()
      },
      period,
      summary: {
        totalViews,
        uniqueViews,
        avgDailyViews: (totalViews / Math.max(1, Math.min(contentAge, parseInt(period)))).toFixed(1),
        totalEngagements: engagements.length,
        totalConversions: conversions.length,
        conversionRate: totalViews > 0 ? ((conversions.length / totalViews) * 100).toFixed(2) : 0,
        revenue: conversions.reduce((sum, c) => sum + c.value, 0)
      },
      engagement: engagementStats,
      conversions: conversionStats,
      sources: sourceAnalysis,
      trend,
      benchmarkComparison: comparison,
      score: performanceScore,
      recommendations: this.generateRecommendations({
        engagementStats,
        conversionStats,
        comparison,
        sourceAnalysis,
        content
      })
    };
  }

  calculateEngagementStats(engagements, totalViews) {
    const byType = {};
    engagements.forEach(e => {
      byType[e.type] = (byType[e.type] || 0) + 1;
    });
    
    const total = engagements.length;
    const rate = totalViews > 0 ? total / totalViews : 0;
    
    return {
      total,
      rate: rate.toFixed(4),
      ratePercent: (rate * 100).toFixed(2) + '%',
      byType: Object.entries(byType).map(([type, count]) => ({
        type,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      })),
      breakdown: byType
    };
  }

  calculateConversionStats(conversions, totalViews) {
    const byType = {};
    let totalValue = 0;
    
    conversions.forEach(c => {
      byType[c.type] = (byType[c.type] || 0) + 1;
      totalValue += c.value;
    });
    
    const total = conversions.length;
    const rate = totalViews > 0 ? total / totalViews : 0;
    const avgValue = total > 0 ? totalValue / total : 0;
    
    return {
      total,
      rate: rate.toFixed(4),
      ratePercent: (rate * 100).toFixed(2) + '%',
      totalValue: totalValue.toFixed(2),
      avgValue: avgValue.toFixed(2),
      byType: Object.entries(byType).map(([type, count]) => ({
        type,
        count,
        value: conversions
          .filter(c => c.type === type)
          .reduce((sum, c) => sum + c.value, 0)
          .toFixed(2)
      }))
    };
  }

  analyzeSources(views) {
    const sources = {};
    views.forEach(v => {
      const source = v.source || 'direct';
      sources[source] = (sources[source] || 0) + 1;
    });
    
    return Object.entries(sources)
      .map(([source, count]) => ({
        source,
        count,
        percentage: ((count / views.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  }

  calculateTrend(dailyStats, period) {
    const days = parseInt(period) || 30;
    const trend = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const stats = dailyStats.get(dateStr) || {};
      
      trend.push({
        date: dateStr,
        views: stats.views || 0,
        engagements: stats.like + stats.share + stats.comment || 0,
        conversions: stats.conversions || 0
      });
    }
    
    return trend;
  }

  compareToBenchmark(stats, benchmark) {
    const comparisons = {};
    
    for (const [metric, benchmarkValue] of Object.entries(benchmark)) {
      const actualValue = parseFloat(stats[metric]) || 0;
      const diff = actualValue - benchmarkValue;
      const percentDiff = benchmarkValue > 0 ? (diff / benchmarkValue) * 100 : 0;
      
      comparisons[metric] = {
        actual: actualValue.toFixed(4),
        benchmark: benchmarkValue,
        difference: diff.toFixed(4),
        percentDiff: percentDiff.toFixed(1) + '%',
        status: percentDiff > 10 ? 'above' : percentDiff < -10 ? 'below' : 'on-par'
      };
    }
    
    return comparisons;
  }

  calculatePerformanceScore(data, platform) {
    const { totalViews, engagementStats, conversionStats, comparison, contentAge } = data;
    
    let score = 50; // 基础分
    
    // 浏览量评分（根据内容年龄调整）
    const viewsPerDay = totalViews / Math.max(1, contentAge);
    if (viewsPerDay > 100) score += 15;
    else if (viewsPerDay > 50) score += 10;
    else if (viewsPerDay > 10) score += 5;
    
    // 参与度评分
    const engagementRate = parseFloat(engagementStats.rate) || 0;
    if (engagementRate > 0.05) score += 15;
    else if (engagementRate > 0.03) score += 10;
    else if (engagementRate > 0.01) score += 5;
    
    // 转化率评分
    const conversionRate = parseFloat(conversionStats.rate) || 0;
    if (conversionRate > 0.02) score += 15;
    else if (conversionRate > 0.01) score += 10;
    else if (conversionRate > 0.005) score += 5;
    
    // 基准对比调整
    if (comparison) {
      const aboveCount = Object.values(comparison).filter(c => c.status === 'above').length;
      const belowCount = Object.values(comparison).filter(c => c.status === 'below').length;
      score += (aboveCount - belowCount) * 3;
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  generateRecommendations(analysis) {
    const { engagementStats, conversionStats, comparison, sourceAnalysis, content } = analysis;
    const recommendations = [];
    
    // 参与度建议
    const engagementRate = parseFloat(engagementStats.rate) || 0;
    if (engagementRate < 0.02) {
      recommendations.push({
        priority: 'high',
        area: 'engagement',
        message: '参与度偏低，考虑添加互动元素（投票、问答、CTA）'
      });
    }
    
    // 转化率建议
    const conversionRate = parseFloat(conversionStats.rate) || 0;
    if (conversionRate < 0.01) {
      recommendations.push({
        priority: 'high',
        area: 'conversion',
        message: '转化率偏低，优化CTA位置和文案'
      });
    }
    
    // 流量来源建议
    const organicShare = sourceAnalysis.find(s => s.source === 'organic');
    if (!organicShare || parseFloat(organicShare.percentage) < 30) {
      recommendations.push({
        priority: 'medium',
        area: 'seo',
        message: '自然流量占比偏低，考虑SEO优化'
      });
    }
    
    // 社交媒体建议
    const socialShare = sourceAnalysis.find(s => s.source === 'social');
    if (!socialShare || parseFloat(socialShare.percentage) < 20) {
      recommendations.push({
        priority: 'medium',
        area: 'social',
        message: '社交媒体流量偏低，增加分享按钮和社交推广'
      });
    }
    
    // 基准对比建议
    if (comparison) {
      Object.entries(comparison)
        .filter(([_, c]) => c.status === 'below')
        .forEach(([metric, _]) => {
          recommendations.push({
            priority: 'medium',
            area: 'benchmark',
            message: `${metric} 低于平台平均水平，需要改进`
          });
        });
    }
    
    return recommendations;
  }

  // ========== 批量分析 ==========
  
  analyzeAllContent(period = '30d', options = {}) {
    const results = [];
    
    for (const [id, _] of this.content) {
      const analysis = this.analyzeContent(id, period);
      if (analysis) {
        results.push(analysis);
      }
    }
    
    // 排序
    const sortBy = options.sortBy || 'score';
    results.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'views') return b.summary.totalViews - a.summary.totalViews;
      if (sortBy === 'conversion') return parseFloat(b.conversions.rate) - parseFloat(a.conversions.rate);
      return 0;
    });
    
    return {
      period,
      totalContent: results.length,
      summary: {
        avgScore: (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1),
        totalViews: results.reduce((sum, r) => sum + r.summary.totalViews, 0),
        totalConversions: results.reduce((sum, r) => sum + r.summary.totalConversions, 0),
        totalRevenue: results.reduce((sum, r) => sum + parseFloat(r.summary.revenue), 0).toFixed(2)
      },
      topPerformers: results.slice(0, 10),
      underPerformers: results.filter(r => r.score < 50),
      allContent: options.detailed ? results : undefined
    };
  }

  // ========== 内容对比 ==========
  
  compareContent(contentIds, period = '30d') {
    const analyses = contentIds
      .map(id => this.analyzeContent(id, period))
      .filter(Boolean);
    
    return {
      period,
      comparison: analyses.map(a => ({
        id: a.content.id,
        title: a.content.title,
        platform: a.content.platform,
        score: a.score,
        views: a.summary.totalViews,
        engagementRate: a.engagement.ratePercent,
        conversionRate: a.conversions.ratePercent,
        revenue: a.summary.revenue
      })),
      winner: analyses.reduce((best, current) => 
        current.score > best.score ? current : best, analyses[0] || null
      )
    };
  }

  // ========== 辅助方法 ==========
  
  parsePeriod(period) {
    const units = { d: 86400000, h: 3600000, m: 60000, w: 604800000 };
    const match = period.match(/(\d+)([dhmw])/);
    if (match) {
      return parseInt(match[1]) * units[match[2]];
    }
    return 30 * 86400000;
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  // ========== 数据导出 ==========
  
  exportReport(contentId, format = 'json') {
    const analysis = this.analyzeContent(contentId, 'all');
    
    if (format === 'csv') {
      const trend = analysis.trend.map(t => 
        `${t.date},${t.views},${t.engagements},${t.conversions}`
      ).join('\n');
      return `Date,Views,Engagements,Conversions\n${trend}`;
    }
    
    return JSON.stringify(analysis, null, 2);
  }

  exportAllData() {
    const data = {
      contents: Array.from(this.content.entries()),
      metrics: Array.from(this.metrics.entries()).map(([id, m]) => ({
        id,
        views: m.views,
        engagements: m.engagements,
        conversions: m.conversions,
        dailyStats: Array.from(m.dailyStats.entries())
      })),
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentPerformance;
}

if (typeof window !== 'undefined') {
  window.ContentPerformance = ContentPerformance;
}
