/**
 * Analytics Dashboard - 网站访问分析
 * 用于追踪网站流量、用户行为和访问趋势
 */

class AnalyticsDashboard {
  constructor(config = {}) {
    this.config = {
      trackingId: config.trackingId || 'default',
      dataRetention: config.dataRetention || 90, // 天
      refreshInterval: config.refreshInterval || 30000, // 30秒
      ...config
    };
    this.data = {
      pageViews: [],
      sessions: [],
      visitors: new Map(),
      events: [],
      realTime: {
        activeUsers: 0,
        pageViews: 0,
        topPages: []
      }
    };
    this.callbacks = [];
  }

  // ========== 页面浏览追踪 ==========
  
  trackPageView(pageData = {}) {
    const view = {
      id: this.generateId(),
      url: pageData.url || (typeof window !== 'undefined' ? window.location.href : ''),
      path: pageData.path || (typeof window !== 'undefined' ? window.location.pathname : ''),
      title: pageData.title || (typeof document !== 'undefined' ? document.title : ''),
      referrer: pageData.referrer || (typeof document !== 'undefined' ? document.referrer : ''),
      timestamp: Date.now(),
      sessionId: this.getOrCreateSession(),
      visitorId: this.getVisitorId(),
      userAgent: pageData.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      screenResolution: pageData.screenResolution || this.getScreenResolution(),
      language: pageData.language || (typeof navigator !== 'undefined' ? navigator.language : ''),
      country: pageData.country || 'unknown',
      device: this.detectDevice(),
      browser: this.detectBrowser(),
      os: this.detectOS(),
      loadTime: pageData.loadTime || 0,
      timeOnPage: 0
    };
    
    this.data.pageViews.push(view);
    this.updateRealTimeStats();
    this.notifySubscribers('pageView', view);
    
    // 限制数据量
    this.trimOldData();
    
    return view;
  }

  // ========== 事件追踪 ==========
  
  trackEvent(eventName, properties = {}) {
    const event = {
      id: this.generateId(),
      name: eventName,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : '',
        path: typeof window !== 'undefined' ? window.location.pathname : ''
      },
      timestamp: Date.now(),
      sessionId: this.getOrCreateSession(),
      visitorId: this.getVisitorId()
    };
    
    this.data.events.push(event);
    this.notifySubscribers('event', event);
    
    return event;
  }

  // ========== 转化率追踪 ==========
  
  trackConversion(conversionType, value = 0, metadata = {}) {
    const conversion = {
      id: this.generateId(),
      type: conversionType,
      value: value,
      metadata: metadata,
      timestamp: Date.now(),
      sessionId: this.getOrCreateSession(),
      visitorId: this.getVisitorId(),
      attribution: this.calculateAttribution()
    };
    
    this.notifySubscribers('conversion', conversion);
    return conversion;
  }

  // ========== 实时统计 ==========
  
  updateRealTimeStats() {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    // 活跃用户数（最近5分钟）
    const activeSessions = new Set(
      this.data.pageViews
        .filter(v => v.timestamp > fiveMinutesAgo)
        .map(v => v.sessionId)
    );
    
    // 最近页面浏览
    const recentViews = this.data.pageViews.filter(v => v.timestamp > fiveMinutesAgo);
    
    // 热门页面
    const pageCounts = {};
    recentViews.forEach(v => {
      pageCounts[v.path] = (pageCounts[v.path] || 0) + 1;
    });
    
    this.data.realTime = {
      activeUsers: activeSessions.size,
      pageViews: recentViews.length,
      topPages: Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, count]) => ({ path, count }))
    };
  }

  // ========== 报告生成 ==========
  
  generateReport(period = '7d') {
    const periodMs = this.parsePeriod(period);
    const cutoff = Date.now() - periodMs;
    
    const views = this.data.pageViews.filter(v => v.timestamp > cutoff);
    const events = this.data.events.filter(e => e.timestamp > cutoff);
    
    const uniqueVisitors = new Set(views.map(v => v.visitorId)).size;
    const uniqueSessions = new Set(views.map(v => v.sessionId)).size;
    
    // 设备分布
    const deviceStats = this.aggregateBy(views, 'device');
    
    // 浏览器分布
    const browserStats = this.aggregateBy(views, 'browser');
    
    // 地理位置
    const countryStats = this.aggregateBy(views, 'country');
    
    // 页面表现
    const pageStats = {};
    views.forEach(v => {
      if (!pageStats[v.path]) {
        pageStats[v.path] = { views: 0, uniqueVisitors: new Set(), avgTime: 0 };
      }
      pageStats[v.path].views++;
      pageStats[v.path].uniqueVisitors.add(v.visitorId);
    });
    
    // 流量来源
    const sourceStats = this.analyzeTrafficSources(views);
    
    // 事件统计
    const eventStats = {};
    events.forEach(e => {
      eventStats[e.name] = (eventStats[e.name] || 0) + 1;
    });
    
    return {
      period: period,
      summary: {
        totalPageViews: views.length,
        uniqueVisitors: uniqueVisitors,
        uniqueSessions: uniqueSessions,
        avgPagesPerSession: uniqueSessions > 0 ? (views.length / uniqueSessions).toFixed(2) : 0,
        avgSessionDuration: this.calculateAvgSessionDuration(views)
      },
      realTime: this.data.realTime,
      deviceDistribution: deviceStats,
      browserDistribution: browserStats,
      countryDistribution: countryStats,
      topPages: Object.entries(pageStats)
        .map(([path, stats]) => ({
          path,
          views: stats.views,
          uniqueVisitors: stats.uniqueVisitors.size
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 20),
      trafficSources: sourceStats,
      eventStats: eventStats,
      hourlyDistribution: this.getHourlyDistribution(views),
      dailyTrend: this.getDailyTrend(views, period)
    };
  }

  // ========== 辅助方法 ==========
  
  aggregateBy(data, field) {
    const stats = {};
    data.forEach(item => {
      const key = item[field] || 'unknown';
      stats[key] = (stats[key] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([key, count]) => ({ name: key, count, percentage: 0 }))
      .map(item => ({
        ...item,
        percentage: ((item.count / data.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  }

  analyzeTrafficSources(views) {
    const sources = { direct: 0, search: 0, social: 0, referral: 0, other: 0 };
    
    views.forEach(v => {
      const referrer = v.referrer || '';
      if (!referrer) {
        sources.direct++;
      } else if (referrer.match(/google|bing|yahoo|baidu/i)) {
        sources.search++;
      } else if (referrer.match(/facebook|twitter|linkedin|weibo|wechat/i)) {
        sources.social++;
      } else if (referrer.includes(window?.location?.hostname || '')) {
        sources.direct++;
      } else {
        sources.referral++;
      }
    });
    
    return Object.entries(sources).map(([source, count]) => ({
      source,
      count,
      percentage: views.length > 0 ? ((count / views.length) * 100).toFixed(1) : 0
    }));
  }

  getHourlyDistribution(views) {
    const hours = Array(24).fill(0);
    views.forEach(v => {
      const hour = new Date(v.timestamp).getHours();
      hours[hour]++;
    });
    return hours.map((count, hour) => ({ hour, count }));
  }

  getDailyTrend(views, period) {
    const days = Math.ceil(this.parsePeriod(period) / (24 * 60 * 60 * 1000));
    const trend = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(dateStr).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      
      const dayViews = views.filter(v => v.timestamp >= dayStart && v.timestamp < dayEnd);
      const uniqueVisitors = new Set(dayViews.map(v => v.visitorId)).size;
      
      trend.push({
        date: dateStr,
        pageViews: dayViews.length,
        uniqueVisitors
      });
    }
    
    return trend;
  }

  calculateAvgSessionDuration(views) {
    const sessionGroups = {};
    views.forEach(v => {
      if (!sessionGroups[v.sessionId]) {
        sessionGroups[v.sessionId] = [];
      }
      sessionGroups[v.sessionId].push(v);
    });
    
    let totalDuration = 0;
    let sessionCount = 0;
    
    Object.values(sessionGroups).forEach(sessionViews => {
      if (sessionViews.length > 1) {
        const timestamps = sessionViews.map(v => v.timestamp).sort((a, b) => a - b);
        const duration = timestamps[timestamps.length - 1] - timestamps[0];
        totalDuration += duration;
        sessionCount++;
      }
    });
    
    return sessionCount > 0 ? Math.round(totalDuration / sessionCount / 1000) : 0;
  }

  detectDevice() {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
      return /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  detectBrowser() {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  detectOS() {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || /iPhone|iPad|iPod/.test(ua)) return 'iOS';
    return 'Other';
  }

  getScreenResolution() {
    if (typeof window === 'undefined') return 'unknown';
    return `${window.screen.width}x${window.screen.height}`;
  }

  getOrCreateSession() {
    if (typeof sessionStorage === 'undefined') return this.generateId();
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  getVisitorId() {
    if (typeof localStorage === 'undefined') return this.generateId();
    let visitorId = localStorage.getItem('analytics_visitor_id');
    if (!visitorId) {
      visitorId = this.generateId();
      localStorage.setItem('analytics_visitor_id', visitorId);
    }
    return visitorId;
  }

  calculateAttribution() {
    if (typeof sessionStorage === 'undefined') return {};
    return {
      source: sessionStorage.getItem('utm_source') || 'direct',
      medium: sessionStorage.getItem('utm_medium') || 'none',
      campaign: sessionStorage.getItem('utm_campaign') || 'none'
    };
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  parsePeriod(period) {
    const units = { d: 86400000, h: 3600000, m: 60000, w: 604800000 };
    const match = period.match(/(\d+)([dhmw])/);
    if (match) {
      return parseInt(match[1]) * units[match[2]];
    }
    return 7 * 86400000; // 默认7天
  }

  trimOldData() {
    const cutoff = Date.now() - this.config.dataRetention * 86400000;
    this.data.pageViews = this.data.pageViews.filter(v => v.timestamp > cutoff);
    this.data.events = this.data.events.filter(e => e.timestamp > cutoff);
  }

  // ========== 订阅/通知 ==========
  
  subscribe(callback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  notifySubscribers(type, data) {
    this.callbacks.forEach(cb => {
      try {
        cb(type, data);
      } catch (e) {
        console.error('Analytics callback error:', e);
      }
    });
  }

  // ========== 数据导出 ==========
  
  exportData(format = 'json') {
    const data = {
      pageViews: this.data.pageViews,
      events: this.data.events,
      exportedAt: new Date().toISOString()
    };
    
    if (format === 'csv') {
      return this.convertToCSV(data.pageViews);
    }
    
    return JSON.stringify(data, null, 2);
  }

  convertToCSV(views) {
    if (views.length === 0) return '';
    
    const headers = Object.keys(views[0]).join(',');
    const rows = views.map(v => 
      Object.values(v).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
}

// Node.js 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsDashboard;
}

// 浏览器全局变量
if (typeof window !== 'undefined') {
  window.AnalyticsDashboard = AnalyticsDashboard;
}
