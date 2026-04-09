/*
 * 价格追踪服务 - 使用 Puppeteer 或 axios
 */

const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

// 浏览器实例缓存
let browser = null;

/**
 * 获取浏览器实例
 */
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

/**
 * 使用静态请求获取价格
 */
async function fetchPriceWithAxios(url, selectors) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    // 尝试多个选择器
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        const text = element.text().trim();
        const price = extractPrice(text);
        if (price) {
          return {
            price,
            rawText: text,
            selector,
            method: 'axios'
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    logger.error(`Axios 请求失败 ${url}:`, error.message);
    return null;
  }
}

/**
 * 使用 Puppeteer 获取价格（用于 JS 渲染的页面）
 */
async function fetchPriceWithPuppeteer(url, selectors) {
  let page = null;
  
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 等待页面加载
    await page.waitForTimeout(2000);
    
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const text = await page.$eval(selector, el => el.textContent.trim());
        const price = extractPrice(text);
        
        if (price) {
          return {
            price,
            rawText: text,
            selector,
            method: 'puppeteer'
          };
        }
      } catch {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    logger.error(`Puppeteer 请求失败 ${url}:`, error.message);
    return null;
  } finally {
    if (page) await page.close();
  }
}

/**
 * 从文本中提取价格
 */
function extractPrice(text) {
  if (!text) return null;
  
  // 匹配各种价格格式
  const patterns = [
    /\$[\d,]+\.?\d*/,        // $99.99
    /€[\d,]+\.?\d*/,         // €99.99
    /£[\d,]+\.?\d*/,         // £99.99
    /¥[\d,]+/,               // ¥999
    /[\d,]+\.?\d*\s*USD/i,   // 99.99 USD
    /[\d,]+\.?\d*\s*\/\s*month/i, // 99.99 / month
    /[\d,]+\.?\d*/           // 纯数字
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numericValue = parseFloat(match[0].replace(/[^\d.]/g, ''));
      if (!isNaN(numericValue) && numericValue > 0) {
        return {
          value: numericValue,
          formatted: match[0],
          currency: detectCurrency(match[0])
        };
      }
    }
  }
  
  return null;
}

/**
 * 检测货币类型
 */
function detectCurrency(text) {
  if (text.includes('$')) return 'USD';
  if (text.includes('€')) return 'EUR';
  if (text.includes('£')) return 'GBP';
  if (text.includes('¥')) return 'CNY';
  return 'USD';
}

/**
 * 获取竞品价格
 */
async function fetchCompetitorPrice(competitor) {
  const selectors = Array.isArray(competitor.priceSelector) 
    ? competitor.priceSelector 
    : [competitor.priceSelector];
  
  logger.info(`正在获取 ${competitor.name} 价格...`);
  
  // 先尝试 axios
  let result = await fetchPriceWithAxios(competitor.url, selectors);
  
  // 如果失败，使用 puppeteer
  if (!result) {
    result = await fetchPriceWithPuppeteer(competitor.url, selectors);
  }
  
  if (result) {
    return {
      ...result,
      name: competitor.name,
      productName: competitor.productName,
      url: competitor.url,
      timestamp: new Date().toISOString()
    };
  }
  
  return {
    name: competitor.name,
    url: competitor.url,
    error: '无法提取价格',
    timestamp: new Date().toISOString()
  };
}

/**
 * 批量获取多个竞品价格
 */
async function fetchMultiplePrices(competitors) {
  const results = [];
  
  for (const competitor of competitors) {
    try {
      const result = await fetchCompetitorPrice(competitor);
      results.push(result);
    } catch (error) {
      logger.error(`获取 ${competitor.name} 价格失败:`, error.message);
      results.push({
        name: competitor.name,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    // 避免请求过快
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // 关闭浏览器
  if (browser) {
    await browser.close();
    browser = null;
  }
  
  return results;
}

/**
 * 比较价格变化
 */
function comparePrices(currentPrices, previousPrices) {
  const changes = [];
  
  for (const current of currentPrices) {
    if (current.error || !current.price) continue;
    
    const previous = previousPrices.find(p => p.name === current.name);
    
    if (previous && previous.price) {
      const change = current.price.value - previous.price.value;
      const changePercent = previous.price.value !== 0 
        ? (change / previous.price.value) * 100 
        : 0;
      
      if (Math.abs(changePercent) > 0.1) { // 变化超过 0.1%
        changes.push({
          name: current.name,
          previousPrice: previous.price.formatted,
          currentPrice: current.price.formatted,
          change: change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
          changePercent: changePercent.toFixed(2),
          direction: change > 0 ? 'up' : 'down',
          url: current.url
        });
      }
    }
  }
  
  return changes;
}

module.exports = {
  fetchCompetitorPrice,
  fetchMultiplePrices,
  comparePrices,
  extractPrice
};
