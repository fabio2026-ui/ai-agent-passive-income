/**
 * ContentAI 自动化系统 - 工具函数库
 */

// 生成唯一ID
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

// 生成订单ID
export function generateOrderId() {
  return generateId('ORD-');
}

// 生成内容ID
export function generateContentId() {
  return generateId('CNT-');
}

// 时间格式化
export function formatDate(date = new Date()) {
  return date.toISOString();
}

// 延迟函数
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 重试机制
export async function retry(fn, maxAttempts = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await delay(delayMs * attempt);
    }
  }
}

// 清理文本（防止 XSS）
export function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// 验证邮箱格式
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证加密货币地址 (简单验证)
export function isValidCryptoAddress(address, type = 'BTC') {
  if (!address) return false;
  
  const patterns = {
    BTC: /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/,
    ETH: /^0x[a-fA-F0-9]{40}$/,
    USDT_ERC20: /^0x[a-fA-F0-9]{40}$/,
    USDT_TRC20: /^T[a-zA-Z0-9]{33}$/
  };
  
  return patterns[type]?.test(address) || false;
}

// 截取文本
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// 计算字数
export function countWords(text) {
  if (!text) return 0;
  // 中文按字符数，英文按单词数
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  return chineseChars + englishWords;
}

// 创建 CORS 响应头
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
}

// JSON 响应包装器
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders()
  });
}

// 错误响应
export function errorResponse(message, status = 400, code = 'ERROR') {
  return jsonResponse({
    success: false,
    error: { code, message },
    timestamp: new Date().toISOString()
  }, status);
}

// 成功响应
export function successResponse(data, message = 'Success') {
  return jsonResponse({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

// 日志记录
export function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...data
  };
  
  console.log(JSON.stringify(logEntry));
  return logEntry;
}

// 签名验证 (HMAC)
export async function verifySignature(payload, signature, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  
  const signatureBuffer = encoder.encode(signature);
  const dataBuffer = encoder.encode(payload);
  
  return await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBuffer,
    dataBuffer
  );
}

// 创建 HMAC 签名
export async function createSignature(payload, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// 解析 URL 参数
export function parseQueryString(url) {
  const queryString = url.split('?')[1] || '';
  const params = new URLSearchParams(queryString);
  const result = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
}

// 限流检查 (简单实现)
export function checkRateLimit(ip, requests = new Map(), limit = 100, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // 清理过期请求
  for (const [key, data] of requests) {
    if (data.timestamp < windowStart) {
      requests.delete(key);
    }
  }
  
  const userRequests = requests.get(ip) || { count: 0, timestamp: now };
  
  if (userRequests.timestamp < windowStart) {
    userRequests.count = 0;
    userRequests.timestamp = now;
  }
  
  userRequests.count++;
  requests.set(ip, userRequests);
  
  return userRequests.count <= limit;
}
