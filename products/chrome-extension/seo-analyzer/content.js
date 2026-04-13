# Chrome Extension: SEO Analyzer
# 小七团队开发
# 网页SEO分析工具

// manifest.json
const manifest = {
  "manifest_version": 3,
  "name": "SEO Analyzer",
  "version": "1.0.0",
  "description": "一键分析网页SEO优化情况",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
};

// content.js - 内容脚本
function analyzeSEO() {
  const results = {
    score: 0,
    checks: [],
    meta: {},
    headings: {},
    images: [],
    links: {},
    performance: {}
  };
  
  // 1. 标题检查
  const title = document.title;
  const titleLength = title.length;
  results.meta.title = title;
  results.meta.titleLength = titleLength;
  
  if (titleLength >= 30 && titleLength <= 60) {
    results.checks.push({ name: 'Title Length', status: 'pass', message: `Perfect (${titleLength} chars)` });
    results.score += 10;
  } else if (titleLength < 30) {
    results.checks.push({ name: 'Title Length', status: 'warning', message: `Too short (${titleLength} chars)` });
    results.score += 5;
  } else {
    results.checks.push({ name: 'Title Length', status: 'warning', message: `Too long (${titleLength} chars)` });
    results.score += 5;
  }
  
  // 2. Meta Description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    const desc = metaDesc.getAttribute('content') || '';
    results.meta.description = desc;
    results.meta.descriptionLength = desc.length;
    
    if (desc.length >= 120 && desc.length <= 160) {
      results.checks.push({ name: 'Meta Description', status: 'pass', message: `Perfect (${desc.length} chars)` });
      results.score += 10;
    } else {
      results.checks.push({ name: 'Meta Description', status: 'warning', message: `Length: ${desc.length} chars (ideal: 120-160)` });
      results.score += 5;
    }
  } else {
    results.checks.push({ name: 'Meta Description', status: 'fail', message: 'Missing!' });
  }
  
  // 3. H1检查
  const h1s = document.querySelectorAll('h1');
  results.headings.h1Count = h1s.length;
  results.headings.h1Text = Array.from(h1s).map(h => h.textContent.trim()).slice(0, 3);
  
  if (h1s.length === 1) {
    results.checks.push({ name: 'H1 Tag', status: 'pass', message: 'Perfect (1 H1)' });
    results.score += 10;
  } else if (h1s.length === 0) {
    results.checks.push({ name: 'H1 Tag', status: 'fail', message: 'Missing H1!' });
  } else {
    results.checks.push({ name: 'H1 Tag', status: 'warning', message: `Multiple H1s (${h1s.length})` });
    results.score += 5;
  }
  
  // 4. 图片Alt检查
  const images = document.querySelectorAll('img');
  let imagesWithAlt = 0;
  images.forEach(img => {
    if (img.alt && img.alt.trim()) {
      imagesWithAlt++;
    }
    results.images.push({
      src: img.src.slice(0, 50),
      alt: img.alt || 'MISSING',
      hasAlt: !!img.alt
    });
  });
  
  const altPercentage = images.length > 0 ? (imagesWithAlt / images.length * 100).toFixed(0) : 0;
  if (altPercentage >= 90) {
    results.checks.push({ name: 'Image Alt Text', status: 'pass', message: `${imagesWithAlt}/${images.length} images have alt text` });
    results.score += 10;
  } else {
    results.checks.push({ name: 'Image Alt Text', status: 'warning', message: `Only ${altPercentage}% have alt text` });
    results.score += 5;
  }
  
  // 5. 链接检查
  const links = document.querySelectorAll('a');
  let internalLinks = 0;
  let externalLinks = 0;
  let nofollowLinks = 0;
  
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('http')) {
      if (href.includes(window.location.hostname)) {
        internalLinks++;
      } else {
        externalLinks++;
      }
    } else {
      internalLinks++;
    }
    
    if (link.rel && link.rel.includes('nofollow')) {
      nofollowLinks++;
    }
  });
  
  results.links.total = links.length;
  results.links.internal = internalLinks;
  results.links.external = externalLinks;
  results.links.nofollow = nofollowLinks;
  
  results.checks.push({ name: 'Internal Links', status: 'info', message: `${internalLinks} internal` });
  results.checks.push({ name: 'External Links', status: 'info', message: `${externalLinks} external` });
  
  results.score += 10; // 基础分
  
  // 最终评分
  results.score = Math.min(100, results.score);
  
  return results;
}

// 在页面加载完成后分析
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.seoAnalysisResults = analyzeSEO();
  });
} else {
  window.seoAnalysisResults = analyzeSEO();
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSEOAnalysis') {
    sendResponse(window.seoAnalysisResults || analyzeSEO());
  }
});

// 定价
const PRICING = {
  free: {
    features: ['Basic SEO check', 'Meta analysis', 'Heading check'],
    price: 0
  },
  pro: {
    features: ['Advanced analysis', 'Competitor comparison', 'Export PDF report', 'Bulk check', 'History tracking'],
    price: 9.99,
    period: 'month'
  }
};

// 收入预测
function calculateRevenue() {
  const users = 10000;
  const conversionRate = 0.02; // 2%
  const monthlyRevenue = users * conversionRate * PRICING.pro.price;
  
  return {
    monthly: monthlyRevenue.toFixed(2),
    yearly: (monthlyRevenue * 12).toFixed(2)
  };
}

console.log('SEO Analyzer loaded');
console.log('Revenue projection:', calculateRevenue());
