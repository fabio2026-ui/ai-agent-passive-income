/**
 * ReplyAI Popup Script
 * 处理用户交互、API调用、邮件生成
 */

// 全局状态
let currentEmailData = null;
let generatedReply = null;

// DOM元素
document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
  loadSavedSettings();
});

/**
 * 初始化UI事件监听
 */
function initializeUI() {
  // API Key 显示/隐藏切换
  const toggleApiKeyBtn = document.getElementById('toggleApiKey');
  const apiKeyInput = document.getElementById('apiKey');
  
  toggleApiKeyBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleApiKeyBtn.textContent = '🙈';
    } else {
      apiKeyInput.type = 'password';
      toggleApiKeyBtn.textContent = '👁️';
    }
  });

  // 保存API Key
  const saveApiKeyBtn = document.getElementById('saveApiKey');
  saveApiKeyBtn.addEventListener('click', saveApiKey);

  // 读取邮件
  const readEmailBtn = document.getElementById('readEmail');
  readEmailBtn.addEventListener('click', readCurrentEmail);

  // 生成回复
  const generateReplyBtn = document.getElementById('generateReply');
  generateReplyBtn.addEventListener('click', generateAIReply);

  // 复制回复
  const copyReplyBtn = document.getElementById('copyReply');
  copyReplyBtn.addEventListener('click', copyReplyToClipboard);

  // 插入回复
  const insertReplyBtn = document.getElementById('insertReply');
  insertReplyBtn.addEventListener('click', insertReplyToEmail);

  // 自定义风格切换
  const styleRadios = document.querySelectorAll('input[name="style"]');
  const customStyleTextarea = document.getElementById('customStyle');
  
  styleRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'custom' && radio.checked) {
        customStyleTextarea.classList.add('show');
      } else {
        customStyleTextarea.classList.remove('show');
      }
    });
  });

  // 快捷模板
  const templateTags = document.querySelectorAll('.template-tag');
  templateTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const template = tag.dataset.template;
      applyTemplate(template);
    });
  });
}

/**
 * 加载保存的设置
 */
async function loadSavedSettings() {
  const result = await chrome.storage.local.get(['openai_api_key', 'reply_style', 'custom_style']);
  
  if (result.openai_api_key) {
    document.getElementById('apiKey').value = result.openai_api_key;
    showStatus('apiStatus', '✅ API Key 已加载', 'success');
  }
  
  if (result.reply_style) {
    const radio = document.querySelector(`input[name="style"][value="${result.reply_style}"]`);
    if (radio) radio.checked = true;
  }
  
  if (result.custom_style) {
    document.getElementById('customStyle').value = result.custom_style;
    if (result.reply_style === 'custom') {
      document.getElementById('customStyle').classList.add('show');
    }
  }
}

/**
 * 保存API Key
 */
async function saveApiKey() {
  const apiKey = document.getElementById('apiKey').value.trim();
  
  if (!apiKey) {
    showStatus('apiStatus', '❌ 请输入API Key', 'error');
    return;
  }
  
  if (!apiKey.startsWith('sk-')) {
    showStatus('apiStatus', '❌ API Key格式不正确，应以sk-开头', 'error');
    return;
  }
  
  await chrome.storage.local.set({ openai_api_key: apiKey });
  showStatus('apiStatus', '✅ API Key 已安全保存', 'success');
}

/**
 * 读取当前邮件内容
 */
async function readCurrentEmail() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // 检查是否在支持的邮件页面
  const supportedDomains = [
    'mail.google.com',
    'outlook.live.com',
    'outlook.office.com',
    'outlook.office365.com'
  ];
  
  const isSupported = supportedDomains.some(domain => tab.url.includes(domain));
  
  if (!isSupported) {
    document.getElementById('emailContent').textContent = 
      '⚠️ 请在Gmail或Outlook页面使用此功能\n当前页面: ' + new URL(tab.url).hostname;
    return;
  }
  
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractEmailContent
    });
    
    if (result[0].result) {
      currentEmailData = result[0].result;
      document.getElementById('emailContent').textContent = 
        `发件人: ${currentEmailData.from}\n` +
        `主题: ${currentEmailData.subject}\n` +
        `\n${currentEmailData.body.substring(0, 300)}${currentEmailData.body.length > 300 ? '...' : ''}`;
      
      // 启用生成按钮
      document.getElementById('generateReply').disabled = false;
    } else {
      document.getElementById('emailContent').textContent = 
        '⚠️ 未能读取邮件内容，请确保已打开具体邮件';
    }
  } catch (error) {
    document.getElementById('emailContent').textContent = 
      '❌ 读取失败: ' + error.message;
  }
}

/**
 * 生成AI回复
 */
async function generateAIReply() {
  const apiKey = await chrome.storage.local.get(['openai_api_key']);
  
  if (!apiKey.openai_api_key) {
    showStatus('apiStatus', '❌ 请先设置API Key', 'error');
    return;
  }
  
  if (!currentEmailData) {
    alert('请先读取邮件内容');
    return;
  }
  
  // 获取风格设置
  const styleRadio = document.querySelector('input[name="style"]:checked');
  const style = styleRadio.value;
  const customStyle = document.getElementById('customStyle').value;
  
  // 保存风格偏好
  await chrome.storage.local.set({ 
    reply_style: style,
    custom_style: customStyle 
  });
  
  // 显示加载状态
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('generateReply').disabled = true;
  document.getElementById('replyContent').classList.add('hidden');
  document.getElementById('replyActions').classList.add('hidden');
  
  try {
    const reply = await callOpenAI(apiKey.openai_api_key, currentEmailData, style, customStyle);
    generatedReply = reply;
    
    document.getElementById('replyContent').textContent = reply;
    document.getElementById('replyContent').classList.remove('hidden');
    document.getElementById('replyActions').classList.remove('hidden');
  } catch (error) {
    document.getElementById('replyContent').textContent = '❌ 生成失败: ' + error.message;
    document.getElementById('replyContent').classList.remove('hidden');
  } finally {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('generateReply').disabled = false;
  }
}

/**
 * 调用OpenAI API
 */
async function callOpenAI(apiKey, emailData, style, customStyle) {
  const stylePrompts = {
    professional: '专业正式，用词精准，结构清晰',
    friendly: '友好亲切，语气轻松自然，像老朋友一样',
    concise: '简洁明了，直击要点，不啰嗦',
    custom: customStyle || '专业但有亲和力'
  };
  
  const systemPrompt = `你是一位专业的邮件回复助手。请根据以下风格回复邮件：${stylePrompts[style]}

要求：
1. 首先使用恰当的称呼
2. 针对邮件内容进行回复
3. 保持专业且有礼貌
4. 不要添加签名（用户会自己添加）
5. 直接输出回复内容，不要有任何解释`;

  const userPrompt = `请回复以下邮件：

发件人: ${emailData.from}
主题: ${emailData.subject}

邮件内容:
${emailData.body}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API请求失败');
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * 复制回复到剪贴板
 */
async function copyReplyToClipboard() {
  if (!generatedReply) return;
  
  try {
    await navigator.clipboard.writeText(generatedReply);
    const btn = document.getElementById('copyReply');
    const originalText = btn.textContent;
    btn.textContent = '✅ 已复制';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  } catch (error) {
    alert('复制失败: ' + error.message);
  }
}

/**
 * 插入回复到邮件编辑器
 */
async function insertReplyToEmail() {
  if (!generatedReply) return;
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: insertReplyToEditor,
      args: [generatedReply]
    });
    
    window.close();
  } catch (error) {
    alert('插入失败: ' + error.message + '\n请手动复制粘贴');
  }
}

/**
 * 应用快捷模板
 */
async function applyTemplate(template) {
  const apiKey = await chrome.storage.local.get(['openai_api_key']);
  
  if (!apiKey.openai_api_key) {
    showStatus('apiStatus', '❌ 请先设置API Key', 'error');
    return;
  }
  
  const templatePrompts = {
    '感谢': '写一封真诚的感谢邮件，表达对对方帮助/支持的感激之情',
    '确认': '写一封确认邮件，确认收到对方的信息/请求/安排',
    '道歉': '写一封诚恳的道歉邮件，为延误/错误/不便表示歉意',
    '跟进': '写一封友好的跟进邮件，询问之前事项的进展情况',
    '拒绝': '写一封礼貌但坚定的拒绝邮件，说明无法接受请求的原因'
  };
  
  document.getElementById('loading').classList.remove('hidden');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.openai_api_key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: '你是一位邮件写作专家。根据用户要求生成邮件模板，语言简洁专业。'
          },
          { 
            role: 'user', 
            content: templatePrompts[template] + '\n\n请生成一个通用的邮件模板，用户可以根据实际情况填写具体内容。'
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API请求失败');
    }
    
    const data = await response.json();
    generatedReply = data.choices[0].message.content;
    
    document.getElementById('replyContent').textContent = generatedReply;
    document.getElementById('replyContent').classList.remove('hidden');
    document.getElementById('replyActions').classList.remove('hidden');
  } catch (error) {
    document.getElementById('replyContent').textContent = '❌ 生成失败: ' + error.message;
    document.getElementById('replyContent').classList.remove('hidden');
  } finally {
    document.getElementById('loading').classList.add('hidden');
  }
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

/**
 * 在页面中执行：提取邮件内容
 */
function extractEmailContent() {
  const url = window.location.href;
  let emailData = null;
  
  if (url.includes('mail.google.com')) {
    // Gmail解析
    emailData = extractGmailContent();
  } else if (url.includes('outlook')) {
    // Outlook解析
    emailData = extractOutlookContent();
  }
  
  return emailData;
}

/**
 * 提取Gmail邮件内容
 */
function extractGmailContent() {
  try {
    // 获取邮件主题
    const subjectEl = document.querySelector('h2[data-legacy-thread-id]');
    const subject = subjectEl ? subjectEl.textContent.trim() : '';
    
    // 获取发件人
    const fromEl = document.querySelector('.gD');
    const from = fromEl ? fromEl.textContent.trim() : '';
    
    // 获取邮件正文
    const bodyEl = document.querySelector('.a3s.aiL');
    const body = bodyEl ? bodyEl.innerText.trim() : '';
    
    if (!subject && !body) {
      return null;
    }
    
    return { from, subject, body, platform: 'gmail' };
  } catch (e) {
    return null;
  }
}

/**
 * 提取Outlook邮件内容
 */
function extractOutlookContent() {
  try {
    // Outlook Web版选择器
    const subjectEl = document.querySelector('[role="region"] span[title]');
    const subject = subjectEl ? subjectEl.textContent.trim() : '';
    
    const fromEl = document.querySelector('.o365cs-flexibleSection .o365cs-fontWeight-semibold');
    const from = fromEl ? fromEl.textContent.trim() : '';
    
    const bodyEl = document.querySelector('[role="region"] .elementToProof, [role="region"] div[dir]');
    const body = bodyEl ? bodyEl.innerText.trim() : '';
    
    if (!subject && !body) {
      return null;
    }
    
    return { from, subject, body, platform: 'outlook' };
  } catch (e) {
    return null;
  }
}

/**
 * 在页面中执行：插入回复到编辑器
 */
function insertReplyToEditor(replyText) {
  const url = window.location.href;
  
  if (url.includes('mail.google.com')) {
    insertGmailReply(replyText);
  } else if (url.includes('outlook')) {
    insertOutlookReply(replyText);
  }
}

/**
 * 插入Gmail回复
 */
function insertGmailReply(replyText) {
  // 尝试多种可能的编辑器选择器
  const editors = [
    document.querySelector('[role="textbox"][contenteditable="true"]'),
    document.querySelector('.Am.Al.editable'),
    document.querySelector('[g_editable="true"]')
  ];
  
  for (const editor of editors) {
    if (editor) {
      editor.focus();
      editor.innerHTML = replyText.replace(/\n/g, '<br>');
      
      // 触发输入事件
      const event = new Event('input', { bubbles: true });
      editor.dispatchEvent(event);
      return true;
    }
  }
  
  // 如果没找到编辑器，尝试点击回复按钮
  const replyBtn = document.querySelector('[data-tooltip="回复"], [data-tooltip="Reply"]');
  if (replyBtn) {
    replyBtn.click();
    setTimeout(() => insertGmailReply(replyText), 500);
  }
  
  return false;
}

/**
 * 插入Outlook回复
 */
function insertOutlookReply(replyText) {
  const editors = [
    document.querySelector('[role="textbox"][contenteditable="true"]'),
    document.querySelector('.elementToProof[contenteditable="true"]')
  ];
  
  for (const editor of editors) {
    if (editor) {
      editor.focus();
      editor.innerHTML = replyText.replace(/\n/g, '<br>');
      
      const event = new Event('input', { bubbles: true });
      editor.dispatchEvent(event);
      return true;
    }
  }
  
  return false;
}
