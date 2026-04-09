/**
 * Service Worker Registration
 * Service Worker 注册与性能优化
 */

import { observeWebVitals, measureTTFB, measureResourcePerformance, reportPerformanceMetrics } from './utils/performance';

// Register service worker
export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registered:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[SW] New version available');
                  // Show update notification
                  if (window.confirm('新版本可用，是否立即更新？')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('[SW] Registration failed:', error);
        });
    });
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  // Only in production
  if (import.meta.env.DEV) {
    console.log('[Performance] Monitoring disabled in development');
    return;
  }

  observeWebVitals();
  measureTTFB();
  reportPerformanceMetrics();
  
  // Measure resources after load
  window.addEventListener('load', () => {
    setTimeout(measureResourcePerformance, 1000);
  });
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    // Add critical fonts, images here
    // '/fonts/main-font.woff2',
  ];

  criticalResources.forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = href.endsWith('.woff2') ? 'font' : 'fetch';
    if (link.as === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

// Connection-aware loading
export const getConnectionType = () => {
  const nav = navigator as any;
  if ('connection' in nav) {
    const conn = nav.connection;
    return {
      effectiveType: conn.effectiveType, // '4g', '3g', '2g', 'slow-2g'
      saveData: conn.saveData, // true if data saver is on
      downlink: conn.downlink,
      rtt: conn.rtt
    };
  }
  return { effectiveType: 'unknown', saveData: false };
};

// Adaptive loading based on connection
export const shouldLoadHeavyContent = () => {
  const conn = getConnectionType();
  if (conn.saveData) return false;
  if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') return false;
  return true;
};

// Initialize all optimizations
export const initOptimizations = () => {
  registerSW();
  initPerformanceMonitoring();
  preloadCriticalResources();
  
  console.log('[Performance] Optimizations initialized');
  console.log('[Network] Connection type:', getConnectionType().effectiveType);
};

export default {
  registerSW,
  initPerformanceMonitoring,
  preloadCriticalResources,
  getConnectionType,
  shouldLoadHeavyContent,
  initOptimizations
};
