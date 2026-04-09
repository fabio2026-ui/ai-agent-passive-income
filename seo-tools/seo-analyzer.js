/**
 * SEO Analyzer - 分析文章SEO得分
 * 分析指标：标题、描述、关键词密度、可读性、内链、图片alt等
 */

const fs = require('fs');
const path = require('path');

class SEOAnalyzer {
  constructor(options = {}) {
    this.contentDir = options.contentDir || './public/content';
    this.results = [];
    this.commonWords = new Set(['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '这些', '那些']);
  }

  /**
   * 分析所有文章
   */
  async analyzeAll() {
    const files = this.getMarkdownFiles();
    console.log(`🔍 发现 ${files.length} 篇文章，开始分析...\n`);

    for (const file of files) {
      const result = await this.analyzeFile(file);
      this.results.push(result);
    }

    return this.generateReport();
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
   * 分析单个文件
   */
  async analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.md');
    
    // 提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // 提取描述（第一段）
    const descMatch = content.match(/## 简介\s*\n\s*([^\n]+)/);
    const description = descMatch ? descMatch[1].trim() : '';

    // 分析各项指标
    const analysis = {
      fileName,
      title,
      url: `/content/${fileName}.md`,
      scores: {
        title: this.scoreTitle(title),
        description: this.scoreDescription(description, content),
        headings: this.scoreHeadings(content),
        keywords: this.scoreKeywords(content, title),
        readability: this.scoreReadability(content),
        links: this.scoreLinks(content),
        images: this.scoreImages(content),
        contentLength: this.scoreContentLength(content)
      }
    };

    // 计算总分
    analysis.totalScore = Math.round(
      Object.values(analysis.scores).reduce((a, b) => a + b, 0) / Object.keys(analysis.scores).length
    );

    // 添加建议
    analysis.suggestions = this.generateSuggestions(analysis);

    return analysis;
  }

  /**
   * 标题评分 (0-100)
   */
  scoreTitle(title) {
    let score = 100;
    
    if (!title) return 0;
    if (title.length < 20) score -= 20;
    if (title.length > 60) score -= 20;
    if (!/[\u4e00-\u9fa5]/.test(title)) score -= 10; // 非中文内容
    if (!/\d/.test(title) && !/(指南|教程|最佳实践|完整|详解)/.test(title)) score -= 10;
    if (title.includes('未命名') || title.includes('Untitled')) score = 0;
    
    return Math.max(0, score);
  }

  /**
   * 描述评分 (0-100)
   */
  scoreDescription(description, content) {
    let score = 100;
    
    const firstParagraph = content.split('\n').find(line => line.trim() && !line.startsWith('#')) || '';
    const desc = description || firstParagraph;
    
    if (!desc) return 0;
    if (desc.length < 50) score -= 30;
    if (desc.length > 160) score -= 20;
    if (!/[\u4e00-\u9fa5]/.test(desc)) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * 标题结构评分 (0-100)
   */
  scoreHeadings(content) {
    let score = 100;
    
    const h1Count = (content.match(/^#\s+/gm) || []).length;
    const h2Count = (content.match(/^##\s+/gm) || []).length;
    const h3Count = (content.match(/^###\s+/gm) || []).length;
    
    if (h1Count !== 1) score -= 30;
    if (h2Count < 2) score -= 20;
    if (h2Count > 10) score -= 10;
    if (h3Count === 0 && h2Count > 3) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * 关键词评分 (0-100)
   */
  scoreKeywords(content, title) {
    let score = 100;
    
    const text = content.toLowerCase();
    const words = this.extractKeywords(content);
    
    if (words.length < 3) score -= 30;
    if (words.length > 10) score -= 10;
    
    // 检查关键词密度
    const wordDensity = this.calculateKeywordDensity(content, words);
    if (wordDensity > 5) score -= 20; // 关键词堆砌
    if (wordDensity < 0.5) score -= 20; // 关键词太少
    
    return Math.max(0, score);
  }

  /**
   * 可读性评分 (0-100)
   */
  scoreReadability(content) {
    let score = 100;
    
    const lines = content.split('\n');
    const avgLineLength = content.length / lines.length;
    
    if (avgLineLength > 200) score -= 20;
    if (content.includes('。') && content.includes('.') && content.split('。').length < content.split('.').length) {
      score -= 10; // 中英文混合，可能可读性差
    }
    
    // 检查列表使用
    const listItems = (content.match(/^[-*]\s+/gm) || []).length;
    if (listItems < 3 && content.length > 1000) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * 链接评分 (0-100)
   */
  scoreLinks(content) {
    let score = 100;
    
    const internalLinks = (content.match(/\[.+?\]\(.+?\)/g) || []).length;
    const externalLinks = (content.match(/https?:\/\//g) || []).length;
    
    if (internalLinks === 0) score -= 20;
    if (externalLinks === 0) score -= 10;
    if (content.length > 2000 && internalLinks < 2) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * 图片评分 (0-100)
   */
  scoreImages(content) {
    let score = 100;
    
    const images = (content.match(/!\[.*?\]\(.*?\)/g) || []);
    const imagesWithAlt = images.filter(img => !img.includes('![]'));
    
    if (images.length === 0) {
      score -= 30; // 建议添加图片
    } else if (imagesWithAlt.length < images.length) {
      score -= 20; // 部分图片缺少alt文本
    }
    
    return Math.max(0, score);
  }

  /**
   * 内容长度评分 (0-100)
   */
  scoreContentLength(content) {
    let score = 100;
    const charCount = content.replace(/\s/g, '').length;
    
    if (charCount < 500) score -= 40;
    else if (charCount < 1000) score -= 20;
    else if (charCount > 5000) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * 提取关键词
   */
  extractKeywords(content) {
    const words = content.match(/[\u4e00-\u9fa5]{2,8}/g) || [];
    const wordCount = {};
    
    words.forEach(word => {
      if (!this.commonWords.has(word) && word.length >= 2) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * 计算关键词密度
   */
  calculateKeywordDensity(content, keywords) {
    if (!keywords.length) return 0;
    const totalChars = content.length;
    const keywordChars = keywords.join('').length * 2;
    return (keywordChars / totalChars) * 100;
  }

  /**
   * 生成优化建议
   */
  generateSuggestions(analysis) {
    const suggestions = [];
    const { scores, title } = analysis;

    if (scores.title < 80) {
      if (title.length < 20) suggestions.push('标题过短，建议20-60字符');
      if (title.length > 60) suggestions.push('标题过长，建议控制在60字符内');
      suggestions.push('标题建议包含数字或强力词(指南/教程/最佳实践)');
    }

    if (scores.description < 80) {
      suggestions.push('优化简介段落，50-160字符最佳');
    }

    if (scores.headings < 80) {
      suggestions.push('使用H1(1个)+H2/H3层级结构');
    }

    if (scores.keywords < 80) {
      suggestions.push('在文中自然分布2-5个核心关键词');
    }

    if (scores.links < 80) {
      suggestions.push('添加内链到其他相关文章');
    }

    if (scores.images < 80) {
      suggestions.push('添加带alt文本的相关图片');
    }

    if (scores.contentLength < 80) {
      suggestions.push('内容偏短，建议扩展到1500字以上');
    }

    return suggestions;
  }

  /**
   * 生成完整报告
   */
  generateReport() {
    const report = {
      totalArticles: this.results.length,
      averageScore: Math.round(this.results.reduce((a, r) => a + r.totalScore, 0) / this.results.length),
      articles: this.results.sort((a, b) => b.totalScore - a.totalScore),
      summary: this.generateSummary()
    };

    return report;
  }

  /**
   * 生成汇总统计
   */
  generateSummary() {
    const scoreRanges = {
      excellent: this.results.filter(r => r.totalScore >= 80).length,
      good: this.results.filter(r => r.totalScore >= 60 && r.totalScore < 80).length,
      average: this.results.filter(r => r.totalScore >= 40 && r.totalScore < 60).length,
      poor: this.results.filter(r => r.totalScore < 40).length
    };

    const avgScores = {
      title: Math.round(this.results.reduce((a, r) => a + r.scores.title, 0) / this.results.length),
      description: Math.round(this.results.reduce((a, r) => a + r.scores.description, 0) / this.results.length),
      headings: Math.round(this.results.reduce((a, r) => a + r.scores.headings, 0) / this.results.length),
      keywords: Math.round(this.results.reduce((a, r) => a + r.scores.keywords, 0) / this.results.length),
      readability: Math.round(this.results.reduce((a, r) => a + r.scores.readability, 0) / this.results.length),
      links: Math.round(this.results.reduce((a, r) => a + r.scores.links, 0) / this.results.length),
      images: Math.round(this.results.reduce((a, r) => a + r.scores.images, 0) / this.results.length),
      contentLength: Math.round(this.results.reduce((a, r) => a + r.scores.contentLength, 0) / this.results.length)
    };

    return { scoreRanges, avgScores };
  }

  /**
   * 导出JSON报告
   */
  exportJSON(outputPath = './seo-tools/seo-report.json') {
    const report = this.generateReport();
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📊 JSON报告已保存: ${outputPath}`);
    return report;
  }

  /**
   * 打印控制台报告
   */
  printConsoleReport() {
    const report = this.generateReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEO 分析报告');
    console.log('='.repeat(60));
    console.log(`总文章数: ${report.totalArticles}`);
    console.log(`平均得分: ${report.averageScore}/100`);
    console.log('\n分数分布:');
    console.log(`  🟢 优秀 (80+): ${report.summary.scoreRanges.excellent} 篇`);
    console.log(`  🟡 良好 (60-79): ${report.summary.scoreRanges.good} 篇`);
    console.log(`  🟠 一般 (40-59): ${report.summary.scoreRanges.average} 篇`);
    console.log(`  🔴 较差 (<40): ${report.summary.scoreRanges.poor} 篇`);
    
    console.log('\n各维度平均分:');
    Object.entries(report.summary.avgScores).forEach(([key, score]) => {
      const emoji = score >= 80 ? '🟢' : score >= 60 ? '🟡' : score >= 40 ? '🟠' : '🔴';
      console.log(`  ${emoji} ${key}: ${score}`);
    });

    console.log('\n' + '-'.repeat(60));
    console.log('文章详情 (前10名):');
    console.log('-'.repeat(60));
    
    report.articles.slice(0, 10).forEach((article, i) => {
      const emoji = article.totalScore >= 80 ? '🟢' : article.totalScore >= 60 ? '🟡' : '🔴';
      console.log(`\n${i + 1}. ${emoji} ${article.title || article.fileName}`);
      console.log(`   得分: ${article.totalScore}/100`);
      if (article.suggestions.length > 0) {
        console.log(`   建议: ${article.suggestions[0]}`);
      }
    });

    console.log('\n' + '='.repeat(60));
  }
}

// CLI 支持
if (require.main === module) {
  const analyzer = new SEOAnalyzer();
  analyzer.analyzeAll().then(() => {
    analyzer.printConsoleReport();
    analyzer.exportJSON();
  });
}

module.exports = SEOAnalyzer;
