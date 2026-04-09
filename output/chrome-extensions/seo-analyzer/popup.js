/**
 * SEO Analyzer Extension - Popup Script
 * 核心功能实现
 */

// SEO分析主类
class SEOAnalyzer {
  constructor() {
    this.results = {};
  }

  async analyzePage(tab) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: this.extractSEOData
      });
      
      return results[0].result;
    } catch (error) {
      console.error('Analysis failed:', error);
      return null;
    }
  }

  extractSEOData() {
    const data = {
      url: window.location.href,
      title: {
        content: document.title,
        length: document.title.length,
        isOptimized: document.title.length >= 30 && document.title.length <= 60
      },
      meta: {
        description: document.querySelector('meta[name="description"]')?.content || '',
        keywords: document.querySelector('meta[name="keywords"]')?.content || '',
        robots: document.querySelector('meta[name="robots"]')?.content || '',
        viewport: document.querySelector('meta[name="viewport"]')?.content || ''
      },
      headings: {
        h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
        h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
        h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim())
      },
      images: {
        total: document.querySelectorAll('img').length,
        withoutAlt: Array.from(document.querySelectorAll('img')).filter(img => !img.alt).length
      },
      links: {
        internal: Array.from(document.querySelectorAll('a')).filter(a => 
          a.hostname === window.location.hostname).length,
        external: Array.from(document.querySelectorAll('a')).filter(a => 
          a.hostname !== window.location.hostname && a.hostname !== '').length
      },
      performance: {
        loadTime: performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0
      }
    };

    // 生成建议
    data.recommendations = [];
    
    if (!data.title.isOptimized) {
      data.recommendations.push({
        priority: 'high',
        issue: 'Title tag length is not optimal',
        current: `${data.title.length} characters`,
        recommendation: 'Keep title between 30-60 characters'
      });
    }

    if (!data.meta.description) {
      data.recommendations.push({
        priority: 'high',
        issue: 'Missing meta description',
        recommendation: 'Add a compelling meta description (150-160 characters)'
      });
    }

    if (data.headings.h1.length !== 1) {
      data.recommendations.push({
        priority: 'medium',
        issue: `Found ${data.headings.h1.length} H1 tags`,
        recommendation: 'Use exactly one H1 tag per page'
      });
    }

    if (data.images.withoutAlt > 0) {
      data.recommendations.push({
        priority: 'medium',
        issue: `${data.images.withoutAlt} images missing alt text`,
        recommendation: 'Add descriptive alt text to all images'
      });
    }

    // 计算得分
    const score = Math.max(0, 100 - data.recommendations.length * 15);
    data.score = score;
    data.grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

    return data;
  }
}

// UI控制器
class UIManager {
  constructor() {
    this.analyzer = new SEOAnalyzer();
    this.init();
  }

  async init() {
    document.getElementById('analyzeBtn').addEventListener('click', () => this.runAnalysis());
    document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
    
    // 自动分析当前页面
    await this.runAnalysis();
  }

  async runAnalysis() {
    const loadingEl = document.getElementById('loading');
    const resultsEl = document.getElementById('results');
    
    loadingEl.classList.remove('hidden');
    resultsEl.classList.add('hidden');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const data = await this.analyzer.analyzePage(tab);
      
      if (data) {
        this.displayResults(data);
        this.currentData = data;
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      loadingEl.classList.add('hidden');
      resultsEl.classList.remove('hidden');
    }
  }

  displayResults(data) {
    // 显示得分
    document.getElementById('scoreValue').textContent = data.score;
    document.getElementById('scoreGrade').textContent = data.grade;
    document.getElementById('scoreGrade').className = `grade grade-${data.grade.toLowerCase()}`;

    // 显示基本信息
    document.getElementById('pageTitle').textContent = data.title.content;
    document.getElementById('titleLength').textContent = `${data.title.length} chars`;
    document.getElementById('metaDesc').textContent = data.meta.description || 'Not set';
    document.getElementById('h1Count').textContent = data.headings.h1.length;
    document.getElementById('imageCount').textContent = `${data.images.total} (${data.images.withoutAlt} without alt)`;
    document.getElementById('linkCount').textContent = `${data.links.internal} internal, ${data.links.external} external`;

    // 显示建议
    const recsContainer = document.getElementById('recommendations');
    recsContainer.innerHTML = '';
    
    data.recommendations.forEach(rec => {
      const recEl = document.createElement('div');
      recEl.className = `recommendation priority-${rec.priority}`;
      recEl.innerHTML = `
        <span class="priority-badge priority-${rec.priority}">${rec.priority.toUpperCase()}</span>
        <div class="rec-content">
          <strong>${rec.issue}</strong>
          ${rec.current ? `<br><small>Current: ${rec.current}</small>` : ''}
          <br><small>💡 ${rec.recommendation}</small>
        </div>
      `;
      recsContainer.appendChild(recEl);
    });
  }

  exportResults() {
    if (!this.currentData) return;
    
    const blob = new Blob([JSON.stringify(this.currentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-analysis-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new UIManager();
});
