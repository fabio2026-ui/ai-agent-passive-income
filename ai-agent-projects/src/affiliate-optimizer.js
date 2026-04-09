// Affiliate Link Optimizer
// 自动插入Affiliate链接并追踪转化

class AffiliateOptimizer {
  constructor() {
    this.links = {
      snyk: {
        url: 'https://snyk.io/?ref=codeguard',
        commission: '$50-500 per sale',
        cookie: '60 days'
      },
      password1: {
        url: 'https://1password.com/sign-up/?ref=codeguard',
        commission: '25% recurring',
        cookie: '90 days'
      },
      auth0: {
        url: 'https://auth0.com/signup?ref=codeguard',
        commission: '$100-300 per sale',
        cookie: '60 days'
      },
      cloudflare: {
        url: 'https://www.cloudflare.com/?ref=codeguard',
        commission: '20% recurring',
        cookie: '120 days'
      },
      digitalocean: {
        url: 'https://m.do.co/c/codeguard',
        commission: '$25-200 per signup',
        cookie: '30 days'
      },
      datadog: {
        url: 'https://www.datadoghq.com/?ref=codeguard',
        commission: '15% recurring',
        cookie: '90 days'
      },
      jetbrains: {
        url: 'https://www.jetbrains.com/?ref=codeguard',
        commission: '30% per sale',
        cookie: '90 days'
      }
    };
    
    this.contentMapping = {
      'xss': ['snyk', 'auth0'],
      'sql injection': ['snyk'],
      'authentication': ['password1', 'auth0'],
      'docker': ['snyk', 'datadog'],
      'kubernetes': ['snyk', 'datadog'],
      'cicd': ['snyk'],
      'nodejs': ['snyk', 'jetbrains'],
      'api': ['auth0', 'cloudflare'],
      'security tools': ['snyk', 'password1', 'auth0']
    };
  }

  optimizeContent(content, topic) {
    let optimized = content;
    const links = this.contentMapping[topic] || ['snyk'];
    
    // 自然插入Affiliate链接
    links.forEach(product => {
      const link = this.links[product];
      const anchorTexts = this.getAnchorTexts(product);
      
      anchorTexts.forEach(text => {
        if (optimized.includes(text) && !optimized.includes(link.url)) {
          optimized = optimized.replace(
            text,
            `[${text}](${link.url})`
          );
        }
      });
    });

    // 添加CTA部分
    optimized += this.generateCTA(links);
    
    return optimized;
  }

  getAnchorTexts(product) {
    const texts = {
      snyk: ['Snyk', 'Snyk.io', 'security scanner'],
      password1: ['1Password', 'password manager'],
      auth0: ['Auth0', 'authentication service'],
      cloudflare: ['Cloudflare', 'CDN'],
      datadog: ['Datadog', 'monitoring'],
      jetbrains: ['JetBrains', 'IntelliJ']
    };
    return texts[product] || [product];
  }

  generateCTA(links) {
    const cta = `

---

## 🛡️ 保护你的代码

本文提到的安全工具：`;
    
    const toolList = links.map(product => {
      const link = this.links[product];
      return `[${product}](${link.url})`;
    }).join(' • ');

    return cta + toolList + `

*Affiliate links - 使用这些链接支持我们的免费内容* ✨`;
  }

  async trackClick(product, source) {
    const click = {
      product,
      source,
      timestamp: new Date().toISOString(),
      userAgent: 'tracking'
    };
    
    // 发送到分析系统
    console.log('📊 Affiliate click:', click);
    return click;
  }

  async getStats() {
    // 返回模拟数据 (实际应从数据库获取)
    return {
      snyk: { clicks: 150, conversions: 3, revenue: 450 },
      password1: { clicks: 89, conversions: 2, revenue: 120 },
      auth0: { clicks: 67, conversions: 1, revenue: 200 },
      total: { clicks: 306, conversions: 6, revenue: 770 }
    };
  }

  generateAffiliateCTA(product) {
    const templates = {
      snyk: `**自动化你的安全扫描**：[免费试用Snyk](${this.links.snyk.url}) - 发现漏洞，自动修复`,
      password1: `**保护你的密码**：[获取1Password](${this.links.password1.url}) - 30天免费试用`,
      auth0: `**简化身份认证**：[使用Auth0](${this.links.auth0.url}) - 开发者首选`
    };
    
    return templates[product] || '';
  }
}

module.exports = AffiliateOptimizer;