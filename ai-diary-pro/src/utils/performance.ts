/**
 * Performance Monitoring Utilities
 * 性能监控工具集
 */

// Core Web Vitals monitoring
export const observeWebVitals = () => {
  if (!('PerformanceObserver' in window)) return;

  // LCP - Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('[Performance] LCP:', Math.round(lastEntry.startTime), 'ms');
      
      // Send to analytics if needed
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: 'LCP',
          value: Math.round(lastEntry.startTime),
        });
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    console.warn('LCP observation failed:', e);
  }

  // FID - First Input Delay
  try {
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const delay = entry.processingStart - entry.startTime;
        console.log('[Performance] FID:', Math.round(delay), 'ms');
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    console.warn('FID observation failed:', e);
  }

  // CLS - Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      console.log('[Performance] CLS:', clsValue.toFixed(4));
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    console.warn('CLS observation failed:', e);
  }

  // FCP - First Contentful Paint
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('[Performance] FCP:', Math.round(entry.startTime), 'ms');
        }
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });
  } catch (e) {
    console.warn('FCP observation failed:', e);
  }
};

// Measure TTFB - Time to First Byte
export const measureTTFB = () => {
  if (!window.performance || !window.performance.timing) return null;
  
  const timing = window.performance.timing;
  const ttfb = timing.responseStart - timing.navigationStart;
  console.log('[Performance] TTFB:', ttfb, 'ms');
  return ttfb;
};

// Resource loading performance
export const measureResourcePerformance = () => {
  if (!('performance' in window) || !('getEntriesByType' in performance)) return;

  const resources = performance.getEntriesByType('resource');
  const jsResources = resources.filter(r => r.name.endsWith('.js'));
  const cssResources = resources.filter(r => r.name.endsWith('.css'));

  console.log('[Performance] JS Resources:', jsResources.length, 
    'Total Size:', (jsResources.reduce((acc, r) => acc + (r.encodedBodySize || 0), 0) / 1024).toFixed(2), 'KB');
  
  console.log('[Performance] CSS Resources:', cssResources.length,
    'Total Size:', (cssResources.reduce((acc, r) => acc + (r.encodedBodySize || 0), 0) / 1024).toFixed(2), 'KB');
};

// Lazy loading images with Intersection Observer
export const setupLazyLoading = () => {
  if (!('IntersectionObserver' in window)) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
};

// Prefetch routes on idle
export const prefetchOnIdle = (routes) => {
  if (!routes || !Array.isArray(routes)) return;

  const prefetch = () => {
    routes.forEach(route => {
      if (typeof route === 'function') {
        route();
      }
    });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(prefetch, { timeout: 2000 });
  } else {
    setTimeout(prefetch, 2000);
  }
};

// Cache API wrapper for better control
export const cacheAPI = {
  async open(cacheName) {
    if (!('caches' in window)) return null;
    return await caches.open(cacheName);
  },

  async put(cacheName, request, response) {
    const cache = await this.open(cacheName);
    if (cache) {
      await cache.put(request, response);
    }
  },

  async match(cacheName, request) {
    const cache = await this.open(cacheName);
    if (cache) {
      return await cache.match(request);
    }
    return null;
  },

  async delete(cacheName, request) {
    const cache = await this.open(cacheName);
    if (cache) {
      await cache.delete(request);
    }
  }
};

// Report performance metrics
export const reportPerformanceMetrics = () => {
  // Wait for page to be fully loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const metrics = {
          dnsLookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
          tcpConnection: Math.round(navigation.connectEnd - navigation.connectStart),
          serverResponse: Math.round(navigation.responseEnd - navigation.responseStart),
          domProcessing: Math.round(navigation.domComplete - navigation.domLoading),
          totalLoadTime: Math.round(navigation.loadEventEnd - navigation.startTime),
        };
        
        console.log('[Performance] Navigation Metrics:', metrics);
        
        // Store for analysis
        if (window.localStorage) {
          const history = JSON.parse(localStorage.getItem('perf_history') || '[]');
          history.push({
            timestamp: new Date().toISOString(),
            metrics
          });
          // Keep last 10 entries
          if (history.length > 10) history.shift();
          localStorage.setItem('perf_history', JSON.stringify(history));
        }
      }
    }, 0);
  });
};

export default {
  observeWebVitals,
  measureTTFB,
  measureResourcePerformance,
  setupLazyLoading,
  prefetchOnIdle,
  cacheAPI,
  reportPerformanceMetrics
};
