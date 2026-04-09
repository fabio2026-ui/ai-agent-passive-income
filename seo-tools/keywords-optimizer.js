/**
 * Keywords Optimizer - 关键词优化建议
 * 分析关键词密度、竞争度、长尾关键词建议
 */

const fs = require('fs');
const path = require('path');

class KeywordsOptimizer {
  constructor(options = {}) {
    this.contentDir = options.contentDir || './public/content';
    this.results = [];
    
    // SEO相关的高价值关键词库
    this.keywordDatabase = {
      // 核心行业词
      core: [
        'AI Agent', '人工智能代理', '智能体', '自动化', '被动收入',
        '副业赚钱', '在线收入', '财务自由', '数字游民', '创业'
      ],
      // 长尾关键词
      longTail: [
        'AI Agent被动收入教程', '如何创建AI Agent赚钱',
        'AI Agent最佳实践', '被动收入项目推荐',
        'AI自动化赚钱方法', '零成本副业项目',
        'AI Agent部署指南', '自动化收入系统搭建'
      ],
      // 技术关键词
      technical: [
        'API集成', 'Webhook', 'Node.js', 'Python',
        '云服务', 'Docker', 'Kubernetes', 'Serverless',
        'OpenAI', 'Claude', 'GPT', 'LLM'
      ],
      // 商业关键词
      business: [
        '商业模式', '变现策略', '用户增长', '转化率优化',
        '订阅模式', '联盟营销', '内容变现', 'SaaS'
      ],
      // 安全相关（基于现有内容）
      security: [
        'API安全', 'Web安全', '渗透测试', '安全加固',
        '身份认证', '数据加密', '安全合规', 'SOC2'
      ]
    };
    
    // 停用词
    this.stopWords = new Set([
      '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
      '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
      '自己', '这', '那', '之', '与', '及', '等', '或', '但', '而', '因为', '所以'
    ]);
  }

  /**
   * 分析所有文章的关键词
   */
  async analyzeAll() {
    const files = this.getMarkdownFiles();
    console.log(`🔑 正在分析 ${files.length} 篇文章的关键词...\n`);

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
    const title = this.extractTitle(content);
    
    // 提取当前关键词
    const currentKeywords = this.extractCurrentKeywords(content);
    
    // 计算关键词密度
    const density = this.calculateAllDensity(content, currentKeywords);
    
    // 发现缺失的高价值关键词
    const missingKeywords = this.findMissingKeywords(content, title);
    
    // 生成长尾关键词建议
    const longTailSuggestions = this.generateLongTailSuggestions(title, currentKeywords);
    
    // 分析语义相关性
    const semanticKeywords = this.analyzeSemanticKeywords(content, currentKeywords);
    
    // 检查LSI关键词
    const lsiKeywords = this.findLSIKeywords(content);

    return {
      fileName,
      title,
      currentKeywords,
      density,
      missingKeywords,
      longTailSuggestions,
      semanticKeywords,
      lsiKeywords,
      optimizationScore: this.calculateOptimizationScore(density, missingKeywords),
      recommendations: []
    };
  }

  /**
   * 提取标题
   */
  extractTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : '';
  }

  /**
   * 提取当前关键词
   */
  extractCurrentKeywords(content) {
    const keywords = new Map();
    const cleanContent = content.toLowerCase();
    
    // 提取2-6字的中文词组
    const wordRegex = /[\u4e00-\u9fa5]{2,6}/g;
    const words = cleanContent.match(wordRegex) || [];
    
    words.forEach(word => {
      if (!this.stopWords.has(word) && word.length >= 2) {
        keywords.set(word, (keywords.get(word) || 0) + 1);
      }
    });
    
    // 提取英文/混合词
    const engWords = cleanContent.match(/[a-z0-9\s]{3,20}/gi) || [];
    engWords.forEach(word => {
      const clean = word.trim().toLowerCase();
      if (clean.length >= 3 && !this.stopWords.has(clean)) {
        keywords.set(clean, (keywords.get(clean) || 0) + 1);
      }
    });
    
    // 按频率排序，取前20
    return Array.from(keywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));
  }

  /**
   * 计算关键词密度
   */
  calculateAllDensity(content, keywords) {
    const totalChars = content.replace(/\s/g, '').length;
    const densities = [];
    
    keywords.forEach(({ word, count }) => {
      const wordChars = word.length * count;
      const density = (wordChars / totalChars * 100).toFixed(2);
      const status = density > 3 ? '过高' : density < 0.5 ? '过低' : '正常';
      
      densities.push({
        word,
        count,
        density: parseFloat(density),
        status,
        recommendation: this.getDensityRecommendation(parseFloat(density))
      });
    });
    
    return densities;
  }

  /**
   * 获取密度建议
   */
  getDensityRecommendation(density) {
    if (density > 5) return '⚠️ 关键词堆砌风险，建议减少使用频率';
    if (density > 3) return '⚡ 密度偏高，适当分散使用';
    if (density < 0.3) return '💡 可增加该关键词出现频率';
    if (density >= 1 && density <= 2) return '✅ 理想密度范围';
    return '📝 保持当前使用频率';
  }

  /**
   * 查找缺失的高价值关键词
   */
  findMissingKeywords(content, title) {
    const missing = [];
    const contentLower = content.toLowerCase();
    const titleLower = title.toLowerCase();
    
    // 检查所有关键词库
    Object.values(this.keywordDatabase).flat().forEach(keyword => {
      if (!contentLower.includes(keyword.toLowerCase()) && 
          !titleLower.includes(keyword.toLowerCase())) {
        // 计算相关度分数
        const relevance = this.calculateRelevance(title, keyword);
        if (relevance > 0.3) {
          missing.push({ keyword, relevance: relevance.toFixed(2) });
        }
      }
    });
    
    return missing.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }

  /**
   * 计算关键词与标题的相关度
   */
  calculateRelevance(title, keyword) {
    let score = 0;
    const titleWords = title.toLowerCase().split(/\s+/);
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    
    keywordWords.forEach(kw => {
      if (title.includes(kw)) score += 0.5;
      titleWords.forEach(tw => {
        if (tw.includes(kw) || kw.includes(tw)) score += 0.2;
      });
    });
    
    // 根据关键词类别加分
    if (this.keywordDatabase.core.includes(keyword)) score += 0.3;
    if (this.keywordDatabase.longTail.includes(keyword)) score += 0.2;
    
    return Math.min(1, score);
  }

  /**
   * 生成长尾关键词建议
   */
  generateLongTailSuggestions(title, currentKeywords) {
    const suggestions = [];
    const titleWords = currentKeywords.slice(0, 5).map(k => k.word);
    
    // 基于标题生成变体
    const patterns = [
      `如何${title}`,
      `${title}完整指南`,
      `${title}最佳实践`,
      `2025年${title}`,
      `新手${title}入门`,
      `${title}常见问题`,
      `${title}vs传统方法`,
      `${title}案例分析`,
      `零基础学${title}`,
      `${title}快速上手`
    ];
    
    patterns.forEach(pattern => {
      suggestions.push({
        keyword: pattern,
        searchVolume: this.estimateSearchVolume(pattern),
        competition: this.estimateCompetition(pattern),
        value: this.calculateKeywordValue(pattern)
      });
    });
    
    // 添加数据库中的长尾词
    this.keywordDatabase.longTail.forEach(keyword => {
      if (titleWords.some(w => keyword.includes(w) || w.includes(keyword))) {
        suggestions.push({
          keyword,
          searchVolume: this.estimateSearchVolume(keyword),
          competition: this.estimateCompetition(keyword),
          value: this.calculateKeywordValue(keyword)
        });
      }
    });
    
    return suggestions
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }

  /**
   * 估算搜索量 (模拟)
   */
  estimateSearchVolume(keyword) {
    // 基于关键词特征估算
    let baseVolume = 1000;
    
    if (keyword.includes('AI') || keyword.includes('人工智能')) baseVolume *= 5;
    if (keyword.includes('被动收入') || keyword.includes('赚钱')) baseVolume *= 3;
    if (keyword.includes('教程') || keyword.includes('指南')) baseVolume *= 2;
    if (keyword.length > 15) baseVolume *= 0.5; // 长尾词搜索量较低
    
    return Math.round(baseVolume + Math.random() * 500);
  }

  /**
   * 估算竞争度 (模拟)
   */
  estimateCompetition(keyword) {
    let competition = 0.5;
    
    if (keyword.includes('AI')) competition += 0.2;
    if (keyword.includes('赚钱')) competition += 0.3;
    if (keyword.length > 15) competition -= 0.2;
    if (keyword.includes('2025')) competition -= 0.1;
    
    return Math.min(1, Math.max(0.1, competition)).toFixed(2);
  }

  /**
   * 计算关键词价值
   */
  calculateKeywordValue(keyword) {
    const volume = this.estimateSearchVolume(keyword);
    const competition = parseFloat(this.estimateCompetition(keyword));
    // 价值 = 搜索量 / (竞争度 + 0.1) * 转化意图系数
    const intent = keyword.includes('教程') || keyword.includes('指南') ? 1.5 : 1;
    return Math.round((volume / (competition * 10 + 1)) * intent);
  }

  /**
   * 分析语义关键词
   */
  analyzeSemanticKeywords(content, currentKeywords) {
    const semantic = [];
    const contentWords = new Set(currentKeywords.map(k => k.word));
    
    // 基于词共现找语义相关词
    const sections = content.split(/#{2,3}\s+/);
    
    sections.forEach(section => {
      const words = this.extractCurrentKeywords(section).map(k => k.word);
      
      words.forEach(word => {
        if (!contentWords.has(word) && word.length >= 2) {
          semantic.push({
            word,
            context: section.substring(0, 100) + '...'
          });
        }
      });
    });
    
    return semantic.slice(0, 15);
  }

  /**
   * 查找LSI (潜在语义索引) 关键词
   */
  findLSIKeywords(content) {
    const lsiKeywords = [];
    const lsiDatabase = {
      'AI': ['机器学习', '深度学习', '神经网络', '算法', '模型训练'],
      '被动收入': ['财务自由', '睡后收入', '资产配置', '投资组合', '复利'],
      'API': ['接口', 'REST', 'JSON', '认证', '限流'],
      '安全': ['加密', '防火墙', '漏洞', '攻击', '防护'],
      '部署': ['服务器', 'Docker', 'Kubernetes', 'CI/CD', '自动化']
    };
    
    Object.entries(lsiDatabase).forEach(([mainKeyword, related]) => {
      if (content.includes(mainKeyword)) {
        related.forEach(word => {
          if (!content.includes(word)) {
            lsiKeywords.push({
              mainKeyword,
              relatedWord: word,
              importance: '高'
            });
          }
        });
      }
    });
    
    return lsiKeywords.slice(0, 20);
  }

  /**
   * 计算优化分数
   */
  calculateOptimizationScore(density, missingKeywords) {
    let score = 100;
    
    // 关键词密度扣分
    const highDensity = density.filter(d => d.density > 3).length;
    const lowDensity = density.filter(d => d.density < 0.5).length;
    score -= highDensity * 10;
    score -= lowDensity * 5;
    
    // 缺失关键词扣分
    score -= Math.min(30, missingKeywords.length * 3);
    
    return Math.max(0, Math.round(score));
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestions(analysis) {
    const suggestions = [];
    
    // 密度相关建议
    const highDensity = analysis.density.filter(d => d.density > 3);
    if (highDensity.length > 0) {
      suggestions.push({
        type: 'density',
        priority: 'high',
        message: `以下关键词密度过高: ${highDensity.map(d => d.word).join(', ')}`,
        action: '减少这些词的使用频率，用同义词替换'
      });
    }
    
    // 缺失关键词建议
    if (analysis.missingKeywords.length > 0) {
      const topMissing = analysis.missingKeywords.slice(0, 5);
      suggestions.push({
        type: 'missing',
        priority: 'medium',
        message: `建议添加相关关键词: ${topMissing.map(k => k.keyword).join(', ')}`,
        action: '在文章中自然融入这些高价值关键词'
      });
    }
    
    // 长尾关键词建议
    if (analysis.longTailSuggestions.length > 0) {
      suggestions.push({
        type: 'longtail',
        priority: 'low',
        message: `可考虑的长尾关键词: ${analysis.longTailSuggestions.slice(0, 3).map(k => k.keyword).join(', ')}`,
        action: '使用这些长尾词作为副标题或段落主题'
      });
    }
    
    // LSI关键词建议
    if (analysis.lsiKeywords.length > 0) {
      suggestions.push({
        type: 'lsi',
        priority: 'medium',
        message: `建议添加LSI关键词提升语义相关性`,
        action: `添加: ${analysis.lsiKeywords.slice(0, 5).map(k => k.relatedWord).join(', ')}`
      });
    }
    
    return suggestions;
  }

  /**
   * 生成完整报告
   */
  generateReport() {
    // 为每个结果生成建议
    this.results.forEach(result => {
      result.recommendations = this.generateOptimizationSuggestions(result);
    });
    
    const report = {
      totalArticles: this.results.length,
      articles: this.results,
      summary: {
        avgOptimizationScore: Math.round(
          this.results.reduce((a, r) => a + r.optimizationScore, 0) / this.results.length
        ),
        totalKeywords: this.results.reduce((a, r) => a + r.currentKeywords.length, 0),
        totalSuggestions: this.results.reduce((a, r) => a + r.recommendations.length, 0)
      },
      topKeywords: this.aggregateTopKeywords(),
      topOpportunities: this.findTopOpportunities()
    };
    
    return report;
  }

  /**
   * 聚合顶级关键词
   */
  aggregateTopKeywords() {
    const allKeywords = new Map();
    
    this.results.forEach(result => {
      result.currentKeywords.forEach(({ word, count }) => {
        allKeywords.set(word, (allKeywords.get(word) || 0) + count);
      });
    });
    
    return Array.from(allKeywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));
  }

  /**
   * 发现最佳优化机会
   */
  findTopOpportunities() {
    return this.results
      .filter(r => r.optimizationScore < 80)
      .sort((a, b) => a.optimizationScore - b.optimizationScore)
      .slice(0, 5)
      .map(r => ({
        fileName: r.fileName,
        title: r.title,
        score: r.optimizationScore,
        priorityFixes: r.recommendations.filter(rec => rec.priority === 'high').length
      }));
  }

  /**
   * 导出报告
   */
  exportReport(outputPath = './seo-tools/keywords-report.json') {
    const report = this.generateReport();
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📊 关键词报告已保存: ${outputPath}`);
    return report;
  }

  /**
   * 打印控制台报告
   */
  printConsoleReport() {
    const report = this.generateReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('🔑 关键词优化报告');
    console.log('='.repeat(60));
    console.log(`总文章数: ${report.totalArticles}`);
    console.log(`平均优化分数: ${report.summary.avgOptimizationScore}/100`);
    console.log(`总关键词数: ${report.summary.totalKeywords}`);
    console.log(`总建议数: ${report.summary.totalSuggestions}`);
    
    console.log('\n' + '-'.repeat(60));
    console.log('📈 热门关键词 TOP 10:');
    console.log('-'.repeat(60));
    report.topKeywords.slice(0, 10).forEach((kw, i) => {
      console.log(`  ${i + 1}. ${kw.word} (${kw.count}次)`);
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log('🔧 优先优化文章:');
    console.log('-'.repeat(60));
    report.topOpportunities.forEach((opp, i) => {
      console.log(`\n  ${i + 1}. ${opp.title || opp.fileName}`);
      console.log(`     分数: ${opp.score}/100 | 高优先级修复: ${opp.priorityFixes}项`);
    });
    
    console.log('\n' + '='.repeat(60));
  }
}

// CLI 支持
if (require.main === module) {
  const optimizer = new KeywordsOptimizer();
  optimizer.analyzeAll().then(() => {
    optimizer.printConsoleReport();
    optimizer.exportReport();
  });
}

module.exports = KeywordsOptimizer;
