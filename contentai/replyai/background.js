/**
 * ReplyAI Background Service Worker
 * 处理后台任务和消息转发
 */

// 安装时初始化
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[ReplyAI] 扩展已安装');
    
    // 初始化默认设置
    chrome.storage.local.set({
      reply_style: 'professional',
      custom_style: '',
      history_enabled: true,
      max_history: 50
    });
    
    // 打开欢迎页面
    chrome.tabs.create({
      url: 'https://platform.openai.com/api-keys'
    });
  }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openOptions') {
    chrome.runtime.openOptionsPage();
  }
  
  return true;
});

// 监听快捷键
chrome.commands.onCommand.addListener((command) => {
  if (command === 'generate_reply') {
    chrome.action.openPopup();
  }
});

// 监听标签页更新，显示/隐藏扩展图标
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const supportedDomains = [
      'mail.google.com',
      'outlook.live.com',
      'outlook.office.com',
      'outlook.office365.com'
    ];
    
    const isSupported = supportedDomains.some(domain => tab.url.includes(domain));
    
    if (isSupported) {
      chrome.action.setIcon({
        tabId: tabId,
        path: {
          16: 'icons/icon16.png',
          48: 'icons/icon48.png',
          128: 'icons/icon128.png'
        }
      });
      chrome.action.enable(tabId);
    } else {
      chrome.action.disable(tabId);
    }
  }
});
