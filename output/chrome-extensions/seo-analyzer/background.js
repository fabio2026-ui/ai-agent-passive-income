// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('SEO Analyzer installed');
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 可以在这里添加自动分析逻辑
  }
});
