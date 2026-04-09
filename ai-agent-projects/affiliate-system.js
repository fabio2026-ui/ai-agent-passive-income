#!/usr/bin/env node
/**
 * Affiliate链接自动插入系统
 * 小七AI Agent - 被动收入优化
 */

const fs = require('fs');
const path = require('path');

// Affiliate配置
const AFFILIATE_LINKS = {
  'Cloudflare': {
    url: 'https://www.cloudflare.com/products/zero-trust/',
    commission: '20% recurring',
    cta: '开始免费使用Cloudflare'
  },
  'Snyk': {
    url: 'https://snyk.io/',
    commission: '$50-500/sale',
    cta: '免费扫描你的代码'
  },
  '1Password': {
    url: 'https://1password.com/',
    commission: '25% recurring',
    cta: '保护你的密码安全'
  },
  'Auth0': {
    url: 'https://auth0.com/',
    commission: '$100-300/sale',
    cta: '快速集成身份认证'
  },
  'Datadog': {
    url: 'https://www.datadoghq.com/',
    commission: '15% recurring',
    cta: '监控你的基础设施'
  },
  'DigitalOcean': {
    url: 'https://www.digitalocean.com/',
    commission: '$25-200/signup',
    cta: '部署你的服务器'
  },
  'Burp Suite': {
    url: 'https://portswigger.net/burp',
    commission: '20%/sale',
    cta: '专业渗透测试工具'
  },
  'Kali Linux': {
    url: 'https://www.kali.org/',
    commission: 'N/A (免费)',
    cta: '下载Kali Linux'
  }
};

// 关键词映射
const KEYWORD_MAP = {
  'WAF': ['Cloudflare'],
  '防火墙': ['Cloudflare'],
  'Cloudflare': ['Cloudflare'],
  '漏洞扫描': ['Snyk'],
  'Snyk': ['Snyk'],
  '密码': ['1Password'],
  '1Password': ['1Password'],
  '身份认证': ['Auth0'],
  'Auth0': ['Auth0'],
  '监控': ['Datadog'],
  'Datadog': ['Datadog'],
  '服务器': ['DigitalOcean'],
  'DigitalOcean': ['DigitalOcean'],
  '渗透测试': ['Burp Suite'],
  'Burp Suite': ['Burp Suite'],
  'Kali': ['Kali Linux']
};

// 插入Affiliate链接到文章
function insertAffiliateLinks(content, articleTitle) {
  let modifiedContent = content;
  const insertedLinks = [];
  
  // 检查关键词
  for (const [keyword, products] of Object.entries(KEYWORD_MAP)) {
    if (content.includes(keyword)) {
      for (const product of products) {
        const affiliate = AFFILIATE_LINKS[product];
        if (affiliate && !insertedLinks.includes(product)) {
          // 在文章末尾添加CTA
          const cta = `\n\n> 🔗 **[${affiliate.cta}](${affiliate.url})** *(Affiliate链接)*`;
          if (!modifiedContent.includes(affiliate.url)) {
            modifiedContent += cta;
            insertedLinks.push(product);
          }
        }
      }
    }
  }
  
  return {
    content: modifiedContent,
    links: insertedLinks
  };
}

// 生成Affiliate收入预估报告
function generateRevenueReport() {
  const articles = fs.readdirSync('content').filter(f => f.endsWith('.md'));
  
  const report = {
    timestamp: new Date().toISOString(),
    totalArticles: articles.length,
    affiliatePrograms: Object.keys(AFFILIATE_LINKS).length,
    projections: {
      monthly: {
        traffic: articles.length * 100, // 每篇文章100访问
        ctr: 0.03, // 3% 点击率
        conversion: 0.05, // 5% 转化率
        commission: 50 // 平均佣金$50
      }
    }
  };
  
  // 计算预估收入
  const monthlyClicks = report.projections.monthly.traffic * report.projections.monthly.ctr;
  const monthlySales = monthlyClicks * report.projections.monthly.conversion;
  const monthlyRevenue = monthlySales * report.projections.monthly.commission;
  
  report.projections.monthly.clicks = Math.round(monthlyClicks);
  report.projections.monthly.sales = Math.round(monthlySales);
  report.projections.monthly.revenue = Math.round(monthlyRevenue);
  
  return report;
}

// 主函数
async function main() {
  console.log('🚀 Affiliate系统启动\n');
  
  const contentDir = 'content';
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
  
  console.log(`📊 处理 ${files.length} 篇文章\n`);
  
  let totalLinks = 0;
  
  // 处理每篇文章
  for (const file of files.slice(0, 5)) { // 先处理前5篇
    const filePath = path.join(contentDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const result = insertAffiliateLinks(content, file);
    
    if (result.links.length > 0) {
      console.log(`  ✅ ${file}`);
      console.log(`     插入链接: ${result.links.join(', ')}`);
      totalLinks += result.links.length;
      
      // 保存修改（可选，这里只报告不修改原文件）
      // fs.writeFileSync(filePath, result.content);
    }
  }
  
  console.log(`\n📈 总Affiliate链接: ${totalLinks}`);
  
  // 生成收入报告
  const report = generateRevenueReport();
  console.log('\n💰 收入预估:');
  console.log(`  月访问量: ${report.projections.monthly.traffic}`);
  console.log(`  月点击: ${report.projections.monthly.clicks}`);
  console.log(`  月转化: ${report.projections.monthly.sales}`);
  console.log(`  月收入: $${report.projections.monthly.revenue}`);
  
  // 保存报告
  fs.writeFileSync('output/affiliate-report.json', JSON.stringify(report, null, 2));
  console.log('\n✅ 报告已保存: output/affiliate-report.json');
}

main().catch(console.error);
