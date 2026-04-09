// Quick Affiliate Link Inserter
// 在现有文章中批量插入优化后的Affiliate链接

const AffiliateOptimizer = require('./affiliate-optimizer.js');
const fs = require('fs');
const path = require('path');

async function optimizeAllArticles() {
  const optimizer = new AffiliateOptimizer();
  
  // 文章主题映射
  const articles = [
    { file: 'xss-prevention.md', topic: 'xss' },
    { file: 'docker-security.md', topic: 'docker' },
    { file: 'nodejs-security-checklist.md', topic: 'nodejs' },
    { file: 'api-security.md', topic: 'api' },
    { file: 'cicd-security.md', topic: 'cicd' },
    { file: 'kubernetes-security.md', topic: 'kubernetes' }
  ];

  console.log('🔄 Optimizing affiliate links in articles...\n');

  for (const article of articles) {
    const filePath = path.join(__dirname, '../../content/blog', article.file);
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 检查是否已优化
      if (!content.includes('Affiliate links')) {
        content = optimizer.optimizeContent(content, article.topic);
        // 注意：实际部署时不要覆盖原文件，这里演示逻辑
        console.log(`✅ ${article.file} - links optimized`);
      } else {
        console.log(`⏭️  ${article.file} - already optimized`);
      }
    }
  }

  console.log('\n✨ Affiliate optimization complete!');
}

// 如果直接运行
if (require.main === module) {
  optimizeAllArticles();
}

module.exports = optimizeAllArticles;