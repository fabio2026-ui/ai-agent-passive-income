/**
 * ReplyAI Options Page Script
 */

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  initializeEventListeners();
});

/**
 * 加载已保存的设置
 */
async function loadSettings() {
  const result = await chrome.storage.local.get([
    'openai_api_key',
    'openai_model',
    'reply_style',
    'custom_style',
    'default_signature',
    'history_enabled'
  ]);
  
  // API设置
  if (result.openai_api_key) {
    document.getElementById('apiKey').value = result.openai_api_key;
  }
  
  if (result.openai_model) {
    document.getElementById('model').value = result.openai_model;
  }
  
  // 默认设置
  if (result.reply_style) {
    document.getElementById('defaultStyle').value = result.reply_style;
    toggleCustomStyle(result.reply_style === 'custom');
  }
  
  if (result.custom_style) {
    document.getElementById('customStyle').value = result.custom_style;
  }
  
  if (result.default_signature) {
    document.getElementById('signature').value = result.default_signature;
  }
  
  // 数据管理
  if (result.history_enabled !== undefined) {
    document.getElementById('historyEnabled').checked = result.history_enabled;
  }
}

/**
 * 初始化事件监听
 */
function initializeEventListeners() {
  // API Key显示切换
  document.getElementById('toggleApiKey').addEventListener('click', () => {
    const input = document.getElementById('apiKey');
    const btn = document.getElementById('toggleApiKey');
    
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '隐藏';
    } else {
      input.type = 'password';
      btn.textContent = '显示';
    }
  });
  
  // 保存API设置
  document.getElementById('saveSettings').addEventListener('click', saveApiSettings);
  
  // 保存默认设置
  document.getElementById('saveDefaults').addEventListener('click', saveDefaultSettings);
  
  // 自定义风格切换
  document.getElementById('defaultStyle').addEventListener('change', (e) => {
    toggleCustomStyle(e.target.value === 'custom');
  });
  
  // 清除数据
  document.getElementById('clearData').addEventListener('click', clearAllData);
  
  // 历史记录开关
  document.getElementById('historyEnabled').addEventListener('change', (e) => {
    chrome.storage.local.set({ history_enabled: e.target.checked });
  });
}

/**
 * 保存API设置
 */
async function saveApiSettings() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const model = document.getElementById('model').value;
  
  if (!apiKey) {
    showStatus('status', '❌ 请输入API Key', 'error');
    return;
  }
  
  if (!apiKey.startsWith('sk-')) {
    showStatus('status', '❌ API Key格式不正确', 'error');
    return;
  }
  
  await chrome.storage.local.set({
    openai_api_key: apiKey,
    openai_model: model
  });
  
  showStatus('status', '✅ 设置已保存', 'success');
}

/**
 * 保存默认设置
 */
async function saveDefaultSettings() {
  const style = document.getElementById('defaultStyle').value;
  const customStyle = document.getElementById('customStyle').value.trim();
  const signature = document.getElementById('signature').value.trim();
  
  await chrome.storage.local.set({
    reply_style: style,
    custom_style: customStyle,
    default_signature: signature
  });
  
  showStatus('defaultsStatus', '✅ 默认设置已保存', 'success');
}

/**
 * 切换自定义风格输入框
 */
function toggleCustomStyle(show) {
  const group = document.getElementById('customStyleGroup');
  if (show) {
    group.style.display = 'block';
  } else {
    group.style.display = 'none';
  }
}

/**
 * 清除所有数据
 */
async function clearAllData() {
  if (!confirm('确定要清除所有本地数据吗？包括API Key、设置和历史记录。')) {
    return;
  }
  
  await chrome.storage.local.clear();
  
  // 重新加载页面
  location.reload();
  
  showStatus('clearStatus', '✅ 所有数据已清除', 'success');
}

/**
 * 显示状态消息
 */
function showStatus(elementId, message, type) {
  const statusEl = document.getElementById(elementId);
  statusEl.textContent = message;
  statusEl.className = 'status ' + type;
  
  setTimeout(() => {
    statusEl.className = 'status';
  }, 3000);
}
