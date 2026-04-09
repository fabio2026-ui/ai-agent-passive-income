// Page Agent - 浏览器自动化核心
import { chromium, Browser, Page } from 'playwright';

export class PageAgent {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async init(headless = true) {
    this.browser = await chromium.launch({ headless });
    this.page = await this.browser.newPage();
    
    // 设置反检测
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    });
    
    return this;
  }

  async navigate(url: string) {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async click(selector: string) {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.click(selector);
  }

  async type(selector: string, text: string) {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.fill(selector, text);
  }

  async extract(selector: string): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');
    const element = await this.page.$(selector);
    if (!element) return '';
    return element.textContent() || '';
  }

  async extractAll(selector: string): Promise<string[]> {
    if (!this.page) throw new Error('Page not initialized');
    const elements = await this.page.$$(selector);
    const results: string[] = [];
    for (const el of elements) {
      const text = await el.textContent();
      if (text) results.push(text);
    }
    return results;
  }

  async screenshot(path?: string) {
    if (!this.page) throw new Error('Page not initialized');
    return this.page.screenshot({ path, fullPage: true });
  }

  async waitFor(selector: string, timeout = 5000) {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.waitForSelector(selector, { timeout });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// 小红书数据采集示例
export async function scrapeXiaohongshu(keyword: string) {
  const agent = new PageAgent();
  await agent.init();
  
  try {
    // 搜索关键词
    await agent.navigate(`https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword)}`);
    
    // 等待内容加载
    await agent.waitFor('.note-item', 10000);
    
    // 提取笔记标题
    const titles = await agent.extractAll('.note-item .title');
    
    return titles;
  } finally {
    await agent.close();
  }
}
