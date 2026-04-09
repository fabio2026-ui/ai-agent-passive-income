/**
 * Sitemap Generator - 自动生成sitemap.xml
 * 支持XML sitemap、HTML sitemap、RSS feed
 */

const fs = require('fs');
const path = require('path');

class SitemapGenerator {
  constructor(options = {}) {
    this.contentDir = options.contentDir || './public/content';
    this.outputDir = options.outputDir || './public';
    this.siteConfig = {
      name: options.siteName || 'AI Agent 被动收入指南',
      url: options.siteUrl || 'https://ai-agent-passive-income.com',
      description: options.description || '专业的AI Agent被动收入指南，帮助你通过AI技术实现财务自由',
      ...options.siteConfig
    };
    this.pages = [];
  }

  /**
   * 生成所有站点地图
   */
  async generateAll() {
    console.log('🗺️  开始生成站点地图...\n');
    
    // 收集所有页面
    await this.collectPages();
    
    // 生成XML Sitemap
    await this.generateXMLSitemap();
    
    // 生成HTML Sitemap
    await this.generateHTMLSitemap();
    
    // 生成RSS Feed
    await this.generateRSSFeed();
    
    // 生成Image Sitemap
    await this.generateImageSitemap();
    
    // 生成News Sitemap (如果有新闻内容)
    await this.generateNewsSitemap();
    
    console.log('\n✅ 所有站点地图生成完成!');
    console.log(`   共 ${this.pages.length} 个页面`);
    
    return this.pages;
  }

  /**
   * 收集所有页面
   */
  async collectPages() {
    this.pages = [];
    
    // 1. 收集文章页面
    const articlePages = await this.collectArticlePages();
    this.pages.push(...articlePages);
    
    // 2. 收集分类页面
    const categoryPages = this.collectCategoryPages();
    this.pages.push(...categoryPages);
    
    // 3. 添加静态页面
    const staticPages = this.getStaticPages();
    this.pages.push(...staticPages);
    
    // 按优先级排序
    this.pages.sort((a, b) => (b.priority || 0.5) - (a.priority || 0.5));
    
    console.log(`   📄 收集到 ${this.pages.length} 个页面`);
    console.log(`      - 文章页面: ${articlePages.length}`);
    console.log(`      - 分类页面: ${categoryPages.length}`);
    console.log(`      - 静态页面: ${staticPages.length}`);
  }

  /**
   * 收集文章页面
   */
  async collectArticlePages() {
    const contentPath = path.resolve(this.contentDir);
    if (!fs.existsSync(contentPath)) {
      return [];
    }
    
    const files = fs.readdirSync(contentPath).filter(f => f.endsWith('.md'));
    const pages = [];
    
    for (const file of files) {
      const filePath = path.join(contentPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const stats = fs.statSync(filePath);
      
      const slug = file.replace('.md', '');
      const title = this.extractTitle(content, file);
      const description = this.extractDescription(content);
      const category = this.detectCategory(content, title);
      const tags = this.extractTags(content);
      const images = this.extractImages(content);
      
      pages.push({
        type: 'article',
        url: `${this.siteConfig.url}/content/${slug}.html`,
        slug,
        title,
        description,
        category,
        tags,
        images,
        lastmod: stats.mtime.toISOString(),
        changefreq: 'weekly',
        priority: this.calculatePriority(stats.mtime),
        content: content.substring(0, 500) // RSS用
      });
    }
    
    return pages;
  }

  /**
   * 提取标题
   */
  extractTitle(content, fileName) {
    const match = content.match(/^#\s+(.+)$/m);
    if (match) return match[1].trim();
    return fileName.replace('.md', '').replace(/-/g, ' ');
  }

  /**
   * 提取描述
   */
  extractDescription(content) {
    const introMatch = content.match(/## 简介\s*\n\s*([^\n]+)/);
    if (introMatch) return introMatch[1].trim().substring(0, 200);
    
    const firstPara = content.split('\n').find(line => 
      line.trim() && !line.startsWith('#') && !line.startsWith('!')
    );
    return firstPara ? firstPara.trim().substring(0, 200) : '';
  }

  /**
   * 检测分类
   */
  detectCategory(content, title) {
    const categories = {
      '安全': ['API安全', 'Web安全', '渗透测试', '合规', '认证', '加密', '防火墙', '安全'],
      'AI': ['AI Agent', '机器学习', '自动化', '智能', '模型', 'LLM'],
      '开发': ['Node.js', 'Python', 'API', '部署', '监控', '开发'],
      '被动收入': ['收入', '赚钱', '副业', '创业', '商业', '变现'],
      '运维': ['容器', 'Docker', 'Kubernetes', '云', 'DevOps']
    };
    
    for (const [cat, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (title.includes(keyword) || content.includes(keyword)) {
          return cat;
        }
      }
    }
    
    return '其他';
  }

  /**
   * 提取标签
   */
  extractTags(content) {
    const tags = [];
    const tagPatterns = [
      /#\s*(.+)/,  // 从H1提取
      /##\s*(.+)/g  // 从H2提取
    ];
    
    const h2Matches = content.match(/^##\s+(.+)$/gm) || [];
    h2Matches.slice(0, 3).forEach(match => {
      const tag = match.replace(/^##\s+/, '').trim();
      if (tag.length < 20) tags.push(tag);
    });
    
    return [...new Set(tags)].slice(0, 5);
  }

  /**
   * 提取图片
   */
  extractImages(content) {
    const images = [];
    const imgMatches = content.matchAll(/!\[(.*?)\]\((.+?)\)/g);
    
    for (const match of imgMatches) {
      const [_, alt, src] = match;
      const fullUrl = src.startsWith('http') ? src : `${this.siteConfig.url}${src}`;
      images.push({
        url: fullUrl,
        title: alt || '',
        caption: alt || ''
      });
    }
    
    return images;
  }

  /**
   * 计算页面优先级
   */
  calculatePriority(lastmod) {
    const now = new Date();
    const daysSinceUpdate = (now - lastmod) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < 7) return 0.9;
    if (daysSinceUpdate < 30) return 0.8;
    if (daysSinceUpdate < 90) return 0.7;
    return 0.6;
  }

  /**
   * 收集分类页面
   */
  collectCategoryPages() {
    const categories = [...new Set(this.pages.map(p => p.category))];
    
    return categories.map(category => ({
      type: 'category',
      url: `${this.siteConfig.url}/category/${encodeURIComponent(category)}`,
      title: `${category} - ${this.siteConfig.name}`,
      description: `浏览所有${category}相关的文章和教程`,
      category,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.7
    }));
  }

  /**
   * 获取静态页面
   */
  getStaticPages() {
    return [
      {
        type: 'home',
        url: this.siteConfig.url,
        title: this.siteConfig.name,
        description: this.siteConfig.description,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0
      },
      {
        type: 'articles',
        url: `${this.siteConfig.url}/articles`,
        title: `全部文章 - ${this.siteConfig.name}`,
        description: '浏览所有关于AI Agent被动收入的教程和指南',
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9
      },
      {
        type: 'about',
        url: `${this.siteConfig.url}/about`,
        title: `关于我们 - ${this.siteConfig.name}`,
        description: '了解AI Agent被动收入指南的使命和团队',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        type: 'contact',
        url: `${this.siteConfig.url}/contact`,
        title: `联系我们 - ${this.siteConfig.name}`,
        description: '有问题？联系我们获取帮助',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.4
      }
    ];
  }

  /**
   * 生成XML Sitemap
   */
  async generateXMLSitemap() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
    xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
    xml += '                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"\n';
    xml += '>\n';
    
    this.pages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${this.escapeXml(page.url)}</loc>\n`;
      xml += `    <lastmod>${page.lastmod.split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority.toFixed(1)}</priority>\n`;
      
      // 添加图片信息
      if (page.images && page.images.length > 0) {
        page.images.forEach(img => {
          xml += '    <image:image>\n';
          xml += `      <image:loc>${this.escapeXml(img.url)}</image:loc>\n`;
          if (img.title) {
            xml += `      <image:title>${this.escapeXml(img.title)}</image:title>\n`;
          }
          if (img.caption) {
            xml += `      <image:caption>${this.escapeXml(img.caption)}</image:caption>\n`;
          }
          xml += '    </image:image>\n';
        });
      }
      
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
    fs.writeFileSync(path.join(this.outputDir, 'sitemap.xml'), xml);
    console.log('   ✅ sitemap.xml 已生成');
  }

  /**
   * 生成Image Sitemap (专门用于图片SEO)
   */
  async generateImageSitemap() {
    const pagesWithImages = this.pages.filter(p => p.images && p.images.length > 0);
    
    if (pagesWithImages.length === 0) {
      console.log('   ℹ️  没有图片，跳过 image-sitemap.xml');
      return;
    }
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    
    pagesWithImages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${this.escapeXml(page.url)}</loc>\n`;
      
      page.images.forEach(img => {
        xml += '    <image:image>\n';
        xml += `      <image:loc>${this.escapeXml(img.url)}</image:loc>\n`;
        if (img.title) {
          xml += `      <image:title>${this.escapeXml(img.title)}</image:title>\n`;
        }
        xml += '    </image:image>\n';
      });
      
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
    fs.writeFileSync(path.join(this.outputDir, 'image-sitemap.xml'), xml);
    console.log('   ✅ image-sitemap.xml 已生成');
  }

  /**
   * 生成News Sitemap (针对最近30天的新闻内容)
   */
  async generateNewsSitemap() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    
    const recentPages = this.pages.filter(p => 
      p.type === 'article' && new Date(p.lastmod) > thirtyDaysAgo
    );
    
    if (recentPages.length === 0) {
      console.log('   ℹ️  没有近期文章，跳过 news-sitemap.xml');
      return;
    }
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';
    
    recentPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${this.escapeXml(page.url)}</loc>\n`;
      xml += '    <news:news>\n';
      xml += '      <news:publication>\n';
      xml += `        <news:name>${this.escapeXml(this.siteConfig.name)}</news:name>\n`;
      xml += '        <news:language>zh</news:language>\n';
      xml += '      </news:publication>\n';
      xml += `      <news:publication_date>${page.lastmod.split('T')[0]}</news:publication_date>\n`;
      xml += `      <news:title>${this.escapeXml(page.title)}</news:title>\n`;
      xml += '    </news:news>\n';
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
    fs.writeFileSync(path.join(this.outputDir, 'news-sitemap.xml'), xml);
    console.log('   ✅ news-sitemap.xml 已生成');
  }

  /**
   * 生成HTML Sitemap (用户友好的站点地图)
   */
  async generateHTMLSitemap() {
    const articles = this.pages.filter(p => p.type === 'article');
    const categories = [...new Set(articles.map(p => p.category))];
    
    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>站点地图 - ${this.siteConfig.name}</title>
  <meta name="description" content="浏览${this.siteConfig.name}的所有文章和页面">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    h1 { 
      font-size: 2.5rem; 
      margin-bottom: 10px;
      color: #1a1a1a;
    }
    .subtitle { 
      color: #666; 
      margin-bottom: 40px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #4F46E5;
    }
    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }
    .category {
      margin-bottom: 30px;
    }
    .category-title {
      font-size: 1.5rem;
      color: #4F46E5;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #4F46E5;
    }
    .article-list {
      display: grid;
      gap: 12px;
    }
    .article-item {
      background: white;
      padding: 15px 20px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .article-item:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .article-link {
      color: #333;
      text-decoration: none;
      font-weight: 500;
    }
    .article-link:hover {
      color: #4F46E5;
    }
    .article-date {
      color: #999;
      font-size: 0.85rem;
    }
    .tags {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    .tag {
      background: #EEF2FF;
      color: #4F46E5;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
    }
    .sitemap-links {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-top: 20px;
    }
    .sitemap-links a {
      color: #4F46E5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <h1>🗺️ 站点地图</h1>
  <p class="subtitle">${this.siteConfig.description}</p>
  
  <div class="stats">
    <div class="stat-card">
      <div class="stat-number">${articles.length}</div>
      <div class="stat-label">文章总数</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${categories.length}</div>
      <div class="stat-label">分类数</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${articles.filter(p => new Date(p.lastmod) > new Date(Date.now() - 7*24*60*60*1000)).length}</div>
      <div class="stat-label">本周更新</div>
    </div>
  </div>
`;

    // 按分类组织文章
    categories.forEach(category => {
      const catArticles = articles.filter(p => p.category === category);
      
      html += `
  <div class="category">
    <h2 class="category-title">${category} (${catArticles.length})</h2>
    <div class="article-list">
`;
      
      catArticles.forEach(article => {
        const date = new Date(article.lastmod).toLocaleDateString('zh-CN');
        html += `
      <div class="article-item">
        <div>
          <a href="${article.url}" class="article-link">${article.title}</a>
          ${article.tags.length > 0 ? `
          <div class="tags">
            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          ` : ''}
        </div>
        <span class="article-date">${date}</span>
      </div>
`;
      });
      
      html += '    </div>\n  </div>\n';
    });
    
    html += `
  <footer>
    <p>最后更新: ${new Date().toLocaleString('zh-CN')}</p>
    <div class="sitemap-links">
      <a href="/sitemap.xml">XML Sitemap</a>
      <a href="/rss.xml">RSS Feed</a>
    </div>
  </footer>
</body>
</html>
`;
    
    fs.writeFileSync(path.join(this.outputDir, 'sitemap.html'), html);
    console.log('   ✅ sitemap.html 已生成');
  }

  /**
   * 生成RSS Feed
   */
  async generateRSSFeed() {
    const articles = this.pages
      .filter(p => p.type === 'article')
      .sort((a, b) => new Date(b.lastmod) - new Date(a.lastmod))
      .slice(0, 20); // 最新20篇
    
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${this.escapeXml(this.siteConfig.name)}</title>
    <link>${this.siteConfig.url}</link>
    <description>${this.escapeXml(this.siteConfig.description)}</description>
    <language>zh-cn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>SitemapGenerator</generator>
    <image>
      <url>${this.siteConfig.url}/logo.png</url>
      <title>${this.escapeXml(this.siteConfig.name)}</title>
      <link>${this.siteConfig.url}</link>
    </image>
`;

    articles.forEach(article => {
      const pubDate = new Date(article.lastmod).toUTCString();
      
      rss += `
    <item>
      <title>${this.escapeXml(article.title)}</title>
      <link>${article.url}</link>
      <guid isPermaLink="true">${article.url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${article.description}]]></description>
      <category>${article.category}</category>
      ${article.tags.map(tag => `<category>${this.escapeXml(tag)}</category>`).join('\n      ')}
`;
      
      // 添加图片
      if (article.images && article.images.length > 0) {
        article.images.forEach(img => {
          rss += `      <media:content url="${img.url}" medium="image" />\n`;
        });
      }
      
      rss += '    </item>\n';
    });
    
    rss += '  </channel>\n</rss>';
    
    fs.writeFileSync(path.join(this.outputDir, 'rss.xml'), rss);
    console.log('   ✅ rss.xml 已生成');
  }

  /**
   * XML转义
   */
  escapeXml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 生成robots.txt
   */
  generateRobotsTxt() {
    const robots = `# robots.txt for ${this.siteConfig.url}
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.siteConfig.url}/sitemap.xml
Sitemap: ${this.siteConfig.url}/image-sitemap.xml
Sitemap: ${this.siteConfig.url}/news-sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /private/
Disallow: /api/

# Crawl rate
Crawl-delay: 1
`;
    
    fs.writeFileSync(path.join(this.outputDir, 'robots.txt'), robots);
    console.log('   ✅ robots.txt 已生成');
  }

  /**
   * 生成完整的SEO包
   */
  async generateFullPackage() {
    await this.generateAll();
    this.generateRobotsTxt();
    
    // 生成索引文件
    this.generateSitemapIndex();
    
    console.log('\n📦 完整SEO包已生成!');
    console.log(`   位置: ${path.resolve(this.outputDir)}`);
    console.log('\n文件清单:');
    console.log('   📄 sitemap.xml (主站点地图)');
    console.log('   📄 image-sitemap.xml (图片站点地图)');
    console.log('   📄 news-sitemap.xml (新闻站点地图)');
    console.log('   📄 sitemap.html (用户友好站点地图)');
    console.log('   📄 rss.xml (RSS订阅)');
    console.log('   📄 robots.txt (搜索引擎抓取规则)');
    console.log('   📄 sitemap-index.xml (站点地图索引)');
  }

  /**
   * 生成站点地图索引
   */
  generateSitemapIndex() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    const sitemaps = [
      { file: 'sitemap.xml', priority: '1.0' },
      { file: 'image-sitemap.xml', priority: '0.8' },
      { file: 'news-sitemap.xml', priority: '0.9' }
    ];
    
    sitemaps.forEach(sitemap => {
      xml += '  <sitemap>\n';
      xml += `    <loc>${this.siteConfig.url}/${sitemap.file}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '  </sitemap>\n';
    });
    
    xml += '</sitemapindex>';
    
    fs.writeFileSync(path.join(this.outputDir, 'sitemap-index.xml'), xml);
    console.log('   ✅ sitemap-index.xml 已生成');
  }
}

// CLI 支持
if (require.main === module) {
  const generator = new SitemapGenerator();
  generator.generateFullPackage();
}

module.exports = SitemapGenerator;
