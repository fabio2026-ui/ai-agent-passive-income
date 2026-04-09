/**
 * Meta Generator - 自动生成Meta标签
 * 为每篇文章生成优化的title、description、keywords、OG标签等
 */

const fs = require('fs');
const path = require('path');

class MetaGenerator {
  constructor(options = {}) {
    this.contentDir = options.contentDir || './public/content';
    this.outputDir = options.outputDir || './seo-tools/meta-data';
    this.siteConfig = {
      name: options.siteName || 'AI Agent 被动收入指南',
      url: options.siteUrl || 'https://ai-agent-passive-income.com',
      logo: options.logo || '/logo.png',
      twitter: options.twitter || '@ai_agent_income',
      ...options.siteConfig
    };
    this.metaData = [];
  }

  /**
   * 生成所有文章的Meta数据
   */
  async generateAll() {
    const files = this.getMarkdownFiles();
    console.log(`📝 正在为 ${files.length} 篇文章生成Meta标签...\n`);

    for (const file of files) {
      const meta = await this.generateForFile(file);
      this.metaData.push(meta);
    }

    this.saveMetaData();
    return this.metaData;
  }

  /**
   * 获取所有markdown文件
   */
  getMarkdownFiles() {
    const contentPath = path.resolve(this.contentDir);
    if (!fs.existsSync(contentPath)) {
      console.warn(`⚠️ 目录不存在: ${contentPath}`);
      return [];
    }
    return fs.readdirSync(contentPath)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(contentPath, f));
  }

  /**
   * 为单个文件生成Meta
   */
  async generateForFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.md');
    
    // 提取标题
    const title = this.extractTitle(content, fileName);
    
    // 生成描述
    const description = this.generateDescription(content, title);
    
    // 提取关键词
    const keywords = this.extractKeywords(content);
    
    // 提取图片
    const image = this.extractImage(content, fileName);
    
    // 生成URL
    const url = `${this.siteConfig.url}/content/${fileName}.html`;
    const canonicalUrl = url;
    
    // 生成发布/修改日期
    const dates = this.extractDates(content, filePath);
    
    // 生成分类/标签
    const { category, tags } = this.extractCategoryAndTags(content, title);

    const meta = {
      fileName,
      url,
      html: {
        title: this.optimizeTitle(title),
        description,
        keywords: keywords.join(', '),
        author: 'AI Agent 被动收入指南',
        robots: 'index, follow',
        viewport: 'width=device-width, initial-scale=1.0',
        'theme-color': '#4F46E5',
        canonical: canonicalUrl
      },
      og: {
        'og:title': this.optimizeTitle(title),
        'og:description': description,
        'og:type': 'article',
        'og:url': url,
        'og:image': image || `${this.siteConfig.url}/og-image.jpg`,
        'og:site_name': this.siteConfig.name,
        'og:locale': 'zh_CN',
        'article:published_time': dates.published,
        'article:modified_time': dates.modified,
        'article:section': category,
        'article:tag': tags.join(', ')
      },
      twitter: {
        'twitter:card': 'summary_large_image',
        'twitter:title': this.optimizeTitle(title),
        'twitter:description': description,
        'twitter:image': image || `${this.siteConfig.url}/twitter-image.jpg`,
        'twitter:site': this.siteConfig.twitter,
        'twitter:creator': this.siteConfig.twitter
      },
      structured: this.generateStructuredData({
        title,
        description,
        url,
        image,
        dates,
        category,
        tags,
        content
      })
    };

    return meta;
  }

  /**
   * 提取标题
   */
  extractTitle(content, fileName) {
    // 从markdown标题提取
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }
    
    // 从文件名提取
    const nameParts = fileName.split('_');
    const lastPart = nameParts[nameParts.length - 1];
    return lastPart.replace(/\.md$/, '').replace(/-/g, ' ');
  }

  /**
   * 优化标题
   */
  optimizeTitle(title) {
    const siteName = this.siteConfig.name;
    const separator = ' | ';
    
    // 标题长度控制在60字符以内
    const maxLength = 60 - siteName.length - separator.length;
    
    let optimized = title;
    if (title.length > maxLength) {
      optimized = title.substring(0, maxLength - 3) + '...';
    }
    
    return `${optimized}${separator}${siteName}`;
  }

  /**
   * 生成描述
   */
  generateDescription(content, title) {
    // 优先使用简介段落
    const introMatch = content.match(/## 简介\s*\n\s*([^\n#]+(?:\n[^\n#]+)*)/);
    if (introMatch) {
      return this.truncateDescription(introMatch[1].trim());
    }
    
    // 使用第一段非空文本
    const paragraphs = content.split('\n').filter(line => 
      line.trim() && !line.startsWith('#') && !line.startsWith('!') && !line.startsWith('[')
    );
    
    if (paragraphs.length > 0) {
      return this.truncateDescription(paragraphs[0].trim());
    }
    
    // 默认描述
    return `${title} - 专业的AI Agent被动收入指南，帮助你通过AI技术实现财务自由。`;
  }

  /**
   * 截断描述到合适长度
   */
  truncateDescription(text) {
    const maxLength = 160;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3).trim() + '...';
  }

  /**
   * 提取关键词
   */
  extractKeywords(content) {
    const keywords = new Set();
    
    // 从标题提取
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      const title = titleMatch[1];
      // 提取2-4字的专业词汇
      const words = title.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
      words.forEach(w => keywords.add(w));
    }
    
    // 从H2标题提取
    const h2Matches = content.match(/^##\s+(.+)$/gm) || [];
    h2Matches.slice(0, 5).forEach(h2 => {
      const text = h2.replace(/^##\s+/, '');
      const words = text.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
      words.forEach(w => keywords.add(w));
    });
    
    // 提取技术关键词
    const techKeywords = [
      'AI Agent', '被动收入', '自动化', '人工智能', '机器学习',
      'API', '安全', '最佳实践', '教程', '指南',
      'Node.js', 'Python', '云服务', '部署', '监控'
    ];
    
    techKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        keywords.add(keyword);
      }
    });
    
    return Array.from(keywords).slice(0, 10);
  }

  /**
   * 提取图片
   */
  extractImage(content, fileName) {
    const imgMatch = content.match(/!\[.*?\]\((.+?)\)/);
    if (imgMatch) {
      return imgMatch[1].startsWith('http') 
        ? imgMatch[1] 
        : `${this.siteConfig.url}${imgMatch[1]}`;
    }
    
    // 返回默认OG图片
    return null;
  }

  /**
   * 提取日期
   */
  extractDates(content, filePath) {
    const stats = fs.statSync(filePath);
    const modified = stats.mtime.toISOString();
    
    // 尝试从内容中提取发布日期
    const dateMatch = content.match(/(\d{4})[\-/年](\d{1,2})[\-/月](\d{1,2})/);
    let published;
    
    if (dateMatch) {
      published = new Date(`${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`).toISOString();
    } else {
      published = stats.birthtime.toISOString();
    }
    
    return { published, modified };
  }

  /**
   * 提取分类和标签
   */
  extractCategoryAndTags(content, title) {
    const categories = {
      '安全': ['API安全', 'Web安全', '渗透测试', '合规', '认证', '加密', '防火墙'],
      'AI': ['AI Agent', '机器学习', '自动化', '智能', '模型'],
      '开发': ['Node.js', 'Python', 'API', '部署', '监控'],
      '被动收入': ['收入', '赚钱', '副业', '创业', '商业'],
      '运维': ['容器', 'Docker', 'Kubernetes', '云', 'DevOps']
    };
    
    let category = '技术';
    const tags = new Set();
    
    for (const [cat, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (title.includes(keyword) || content.includes(keyword)) {
          category = cat;
          tags.add(keyword);
        }
      }
    }
    
    return { category, tags: Array.from(tags).slice(0, 5) };
  }

  /**
   * 生成结构化数据 (Schema.org)
   */
  generateStructuredData({ title, description, url, image, dates, category, tags, content }) {
    // Article Schema
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: title,
      description: description,
      url: url,
      image: image ? { '@type': 'ImageObject', url: image } : undefined,
      datePublished: dates.published,
      dateModified: dates.modified,
      author: {
        '@type': 'Organization',
        name: this.siteConfig.name,
        url: this.siteConfig.url
      },
      publisher: {
        '@type': 'Organization',
        name: this.siteConfig.name,
        logo: {
          '@type': 'ImageObject',
          url: `${this.siteConfig.url}${this.siteConfig.logo}`
        }
      },
      articleSection: category,
      keywords: tags.join(', '),
      inLanguage: 'zh-CN'
    };

    // Breadcrumb Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '首页',
          item: this.siteConfig.url
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: category,
          item: `${this.siteConfig.url}/category/${encodeURIComponent(category)}`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: title
        }
      ]
    };

    return [articleSchema, breadcrumbSchema];
  }

  /**
   * 生成HTML Meta标签字符串
   */
  generateHTMLMeta(meta) {
    let html = '';
    
    // 基本Meta
    Object.entries(meta.html).forEach(([key, value]) => {
      if (key === 'title') {
        html += `  <title>${value}</title>\n`;
      } else if (key === 'canonical') {
        html += `  <link rel="canonical" href="${value}" />\n`;
      } else {
        html += `  <meta name="${key}" content="${value}" />\n`;
      }
    });
    
    // Open Graph
    Object.entries(meta.og).forEach(([key, value]) => {
      html += `  <meta property="${key}" content="${value}" />\n`;
    });
    
    // Twitter Card
    Object.entries(meta.twitter).forEach(([key, value]) => {
      html += `  <meta name="${key}" content="${value}" />\n`;
    });
    
    // Structured Data
    meta.structured.forEach(schema => {
      html += `  <script type="application/ld+json">\n    ${JSON.stringify(schema, null, 2)}\n  </script>\n`;
    });
    
    return html;
  }

  /**
   * 保存Meta数据
   */
  saveMetaData() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // 保存JSON
    fs.writeFileSync(
      path.join(this.outputDir, 'meta-data.json'),
      JSON.stringify(this.metaData, null, 2)
    );

    // 为每篇文章生成单独的meta文件
    this.metaData.forEach(meta => {
      const html = this.generateHTMLMeta(meta);
      fs.writeFileSync(
        path.join(this.outputDir, `${meta.fileName}.html`),
        html
      );
    });

    console.log(`✅ Meta数据已保存到 ${this.outputDir}`);
    console.log(`   - meta-data.json (完整数据)`);
    console.log(`   - ${this.metaData.length} 个单独HTML文件`);
  }

  /**
   * 获取单个文件的Meta
   */
  getMeta(fileName) {
    return this.metaData.find(m => m.fileName === fileName);
  }
}

// CLI 支持
if (require.main === module) {
  const generator = new MetaGenerator();
  generator.generateAll();
}

module.exports = MetaGenerator;
