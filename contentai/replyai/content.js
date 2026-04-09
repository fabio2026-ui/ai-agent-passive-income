/**
 * ReplyAI Content Script
 * 注入到邮件页面，负责提取邮件内容和插入回复
 */

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractEmail') {
    const emailData = extractEmailContent();
    sendResponse(emailData);
  } else if (request.action === 'insertReply') {
    const success = insertReplyToEditor(request.replyText);
    sendResponse({ success });
  }
  return true;
});

/**
 * 提取邮件内容 - 主函数
 */
function extractEmailContent() {
  const url = window.location.href;
  
  if (url.includes('mail.google.com')) {
    return extractGmailContent();
  } else if (url.includes('outlook')) {
    return extractOutlookContent();
  }
  
  return null;
}

/**
 * 提取Gmail邮件内容
 */
function extractGmailContent() {
  try {
    console.log('[ReplyAI] 正在解析Gmail邮件...');
    
    // 方法1: 标准选择器
    let subject = '';
    let from = '';
    let body = '';
    
    // 主题
    const subjectSelectors = [
      'h2[data-legacy-thread-id]',
      'h2[data-thread-perm-id]',
      'h2.hP',
      '[data-legacy-thread-id] h2'
    ];
    
    for (const selector of subjectSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        subject = el.textContent.trim();
        break;
      }
    }
    
    // 发件人
    const fromSelectors = [
      '.gD',
      '.go span[email]',
      '[email]',
      '.iw .gD'
    ];
    
    for (const selector of fromSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        from = el.getAttribute('email') || el.textContent.trim();
        break;
      }
    }
    
    // 邮件正文
    const bodySelectors = [
      '.a3s.aiL',
      '.a3s',
      '[data-message-id] .a3s',
      '.gs .ii.gt'
    ];
    
    for (const selector of bodySelectors) {
      const el = document.querySelector(selector);
      if (el) {
        body = el.innerText.trim();
        break;
      }
    }
    
    // 如果标准选择器失败，尝试备用方法
    if (!subject || !body) {
      return extractGmailContentFallback();
    }
    
    console.log('[ReplyAI] Gmail解析成功:', { subject, from, bodyLength: body.length });
    
    return { 
      from, 
      subject, 
      body, 
      platform: 'gmail',
      url: window.location.href
    };
  } catch (e) {
    console.error('[ReplyAI] Gmail解析错误:', e);
    return null;
  }
}

/**
 * Gmail备用解析方法
 */
function extractGmailContentFallback() {
  try {
    // 通过aria标签查找
    const allElements = document.querySelectorAll('*');
    let subject = '';
    let from = '';
    let body = '';
    
    for (const el of allElements) {
      // 查找主题
      if (!subject && (el.getAttribute('aria-label')?.includes('主题') || 
          el.getAttribute('title')?.includes('主题'))) {
        subject = el.textContent.trim();
      }
      
      // 查找发件人
      if (!from && el.getAttribute('email')) {
        from = el.getAttribute('email');
      }
    }
    
    // 查找邮件正文 - 找最大的文本块
    let maxLength = 0;
    const divs = document.querySelectorAll('div');
    
    for (const div of divs) {
      const text = div.innerText?.trim();
      if (text && text.length > maxLength && text.length < 50000) {
        // 排除导航栏等
        if (!div.closest('nav') && !div.closest('header')) {
          maxLength = text.length;
          body = text;
        }
      }
    }
    
    if (subject || body) {
      return { from, subject, body, platform: 'gmail_fallback' };
    }
    
    return null;
  } catch (e) {
    console.error('[ReplyAI] Gmail备用解析错误:', e);
    return null;
  }
}

/**
 * 提取Outlook邮件内容
 */
function extractOutlookContent() {
  try {
    console.log('[ReplyAI] 正在解析Outlook邮件...');
    
    let subject = '';
    let from = '';
    let body = '';
    
    // Outlook有新版本和旧版本，需要尝试多种选择器
    
    // 主题 - 新版本Outlook
    const subjectSelectors = [
      '[role="region"] .GPI3NK1CLLB',
      '[role="region"] span[title]',
      '.WLCXV+.WLCXV',
      '[data-testid="conversationHeader"] span'
    ];
    
    for (const selector of subjectSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        subject = el.textContent.trim();
        break;
      }
    }
    
    // 发件人
    const fromSelectors = [
      '.o365cs-fontWeight-semibold',
      '[role="region"] .ms-Persona-primaryText',
      '.WLCXV'
    ];
    
    for (const selector of fromSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        from = el.textContent.trim();
        break;
      }
    }
    
    // 邮件正文
    const bodySelectors = [
      '.elementToProof',
      '[role="region"] [contenteditable="false"]',
      '.ReadMsgContent',
      '#UniqueMessageBody'
    ];
    
    for (const selector of bodySelectors) {
      const el = document.querySelector(selector);
      if (el) {
        body = el.innerText.trim();
        break;
      }
    }
    
    console.log('[ReplyAI] Outlook解析成功:', { subject, from, bodyLength: body.length });
    
    if (subject || body) {
      return { 
        from, 
        subject, 
        body, 
        platform: 'outlook',
        url: window.location.href
      };
    }
    
    return null;
  } catch (e) {
    console.error('[ReplyAI] Outlook解析错误:', e);
    return null;
  }
}

/**
 * 插入回复到编辑器
 */
function insertReplyToEditor(replyText) {
  const url = window.location.href;
  
  if (url.includes('mail.google.com')) {
    return insertGmailReply(replyText);
  } else if (url.includes('outlook')) {
    return insertOutlookReply(replyText);
  }
  
  return false;
}

/**
 * 插入Gmail回复
 */
function insertGmailReply(replyText) {
  console.log('[ReplyAI] 正在插入Gmail回复...');
  
  // 首先尝试找到已存在的回复框
  const editorSelectors = [
    '[role="textbox"][contenteditable="true"]',
    '.Am.Al.editable',
    '[g_editable="true"]',
    '.editable[contenteditable="true"]'
  ];
  
  for (const selector of editorSelectors) {
    const editor = document.querySelector(selector);
    if (editor) {
      return fillEditor(editor, replyText);
    }
  }
  
  // 如果没有找到编辑器，尝试点击回复按钮
  const replySelectors = [
    '[data-tooltip="回复"]',
    '[data-tooltip="Reply"]',
    '[aria-label="回复"]',
    '[aria-label="Reply"]',
    '.ams.bkH'
  ];
  
  for (const selector of replySelectors) {
    const replyBtn = document.querySelector(selector);
    if (replyBtn) {
      replyBtn.click();
      
      // 等待编辑器出现
      return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 20;
        
        const checkEditor = setInterval(() => {
          attempts++;
          
          for (const selector of editorSelectors) {
            const editor = document.querySelector(selector);
            if (editor) {
              clearInterval(checkEditor);
              resolve(fillEditor(editor, replyText));
              return;
            }
          }
          
          if (attempts >= maxAttempts) {
            clearInterval(checkEditor);
            resolve(false);
          }
        }, 200);
      });
    }
  }
  
  return false;
}

/**
 * 插入Outlook回复
 */
function insertOutlookReply(replyText) {
  console.log('[ReplyAI] 正在插入Outlook回复...');
  
  const editorSelectors = [
    '[role="textbox"][contenteditable="true"]',
    '.elementToProof[contenteditable="true"]',
    '[contenteditable="true"]'
  ];
  
  for (const selector of editorSelectors) {
    const editor = document.querySelector(selector);
    if (editor && isVisible(editor)) {
      return fillEditor(editor, replyText);
    }
  }
  
  // 尝试点击回复按钮
  const replySelectors = [
    '[aria-label="回复"]',
    '[aria-label="Reply"]',
    '[title="回复"]',
    '[title="Reply"]'
  ];
  
  for (const selector of replySelectors) {
    const replyBtn = document.querySelector(selector);
    if (replyBtn) {
      replyBtn.click();
      
      return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 20;
        
        const checkEditor = setInterval(() => {
          attempts++;
          
          for (const selector of editorSelectors) {
            const editor = document.querySelector(selector);
            if (editor && isVisible(editor)) {
              clearInterval(checkEditor);
              resolve(fillEditor(editor, replyText));
              return;
            }
          }
          
          if (attempts >= maxAttempts) {
            clearInterval(checkEditor);
            resolve(false);
          }
        }, 200);
      });
    }
  }
  
  return false;
}

/**
 * 填充编辑器内容
 */
function fillEditor(editor, text) {
  try {
    editor.focus();
    
    // 清空现有内容
    editor.innerHTML = '';
    
    // 插入内容
    const htmlContent = text
      .replace(/\n/g, '<br>')
      .replace(/  /g, '&nbsp; ');
    
    editor.innerHTML = htmlContent;
    
    // 触发必要的事件
    const events = ['input', 'change', 'keyup', 'mouseup'];
    events.forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      editor.dispatchEvent(event);
    });
    
    console.log('[ReplyAI] 回复已插入编辑器');
    return true;
  } catch (e) {
    console.error('[ReplyAI] 插入失败:', e);
    return false;
  }
}

/**
 * 检查元素是否可见
 */
function isVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

// 在页面加载完成后输出调试信息
console.log('[ReplyAI] Content script 已加载');
console.log('[ReplyAI] 当前页面:', window.location.href);
