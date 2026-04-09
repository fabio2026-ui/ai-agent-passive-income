#!/usr/bin/env node
/**
 * 社交媒体内容自动发布系统
 * 小七AI Agent
 */

const fs = require('fs');

// Twitter帖子模板库
const TWITTER_TEMPLATES = [
  {
    topic: 'XSS防护',
    content: `🛡️ XSS防护小贴士:

1️⃣ 始终净化用户输入
2️⃣ 使用CSP策略  
3️⃣ 现代框架自动转义

🔗 完整指南: https://fabio2026-ui.github.io/ai-agent-passive-income

#CyberSecurity #WebDev #XSS`,
    hashtags: ['CyberSecurity', 'WebDev', 'XSS']
  },
  {
    topic: 'SQL注入',
    content: `⚠️ SQL注入仍是2025年Top 3漏洞

防御很简单:
✅ 参数化查询
❌ 永不拼接SQL

新手必读指南 👇
https://fabio2026-ui.github.io/ai-agent-passive-income

#DatabaseSecurity #DevSecOps`,
    hashtags: ['DatabaseSecurity', 'DevSecOps']
  },
  {
    topic: 'API安全',
    content: `🔐 API安全清单:

☑️ HTTPS强制
☑️ 速率限制  
☑️ 输入验证
☑️ 认证授权
☑️ 安全日志

完整指南 (免费) ⬇️
https://fabio2026-ui.github.io/ai-agent-passive-income

#APISecurity #BestPractices`,
    hashtags: ['APISecurity', 'BestPractices']
  },
  {
    topic: '被动收入',
    content: `🚀 刚上线: AI Agent被动收入系统

✅ 16篇网络安全文章
✅ 全自动内容生成
✅ 预计月收€2,900

全部开源免费 👇
https://fabio2026-ui.github.io/ai-agent-passive-income

#PassiveIncome #SideProject #CyberSecurity`,
    hashtags: ['PassiveIncome', 'SideProject', 'CyberSecurity']
  },
  {
    topic: 'WAF',
    content: `☁️ WAF选型对比 (2025):

🥇 Cloudflare - 免费起步
🥈 AWS WAF - 按量计费
🥉 ModSecurity - 开源免费

完整对比 ⬇️
https://fabio2026-ui.github.io/ai-agent-passive-income

#WebSecurity #WAF #Cloudflare`,
    hashtags: ['WebSecurity', 'WAF', 'Cloudflare']
  }
];

// Reddit帖子模板
const REDDIT_TEMPLATES = {
  webdev: {
    title: 'I built a free AI-powered security content hub with 16 articles',
    content: `Hey r/webdev,

I've been working on a side project - an AI-powered security content platform.

**What it contains:**
- 16 cybersecurity articles (XSS, SQL injection, API security, etc.)
- All generated and deployed automatically
- Free for everyone
- Open source

**Topics covered:**
- XSS Protection
- SQL Injection Prevention  
- API Security Best Practices
- DevSecOps
- Cloud Security
- And more...

**Live site:** https://fabio2026-ui.github.io/ai-agent-passive-income
**GitHub:** https://github.com/fabio2026-ui/ai-agent-passive-income

Would love your feedback! 

Edit: This is part of my passive income experiment. Goal is €2,900/month through credits, digital products, and affiliate links. Sharing the journey openly.`
  },
  sideproject: {
    title: 'AI Agent passive income: €2,900/month projection with automated content',
    content: `Hi r/SideProject,

Wanted to share my latest experiment: Using AI agents to create passive income through cybersecurity content.

**The Setup:**
- 16 AI-generated security articles
- Automated deployment to GitHub Pages
- Monetization through credits, products & affiliates
- 95% automated

**Content Topics:**
- XSS, SQL Injection, API Security
- DevSecOps, Cloud Security
- WAF, Penetration Testing
- Incident Response

**Current Status:**
- ✅ 16 articles published
- ✅ Website live
- ✅ GitHub repo open
- ⏳ Affiliate accounts pending

**Live:** https://fabio2026-ui.github.io/ai-agent-passive-income
**Code:** https://github.com/fabio2026-ui/ai-agent-passive-income

**Month 1-12 projection:**
- M1: €100
- M6: €1,200  
- M12: €2,900

Happy to answer questions about the setup!`
  }
};

// 生成发布计划
function generatePostingSchedule() {
  const schedule = [];
  const now = new Date();
  
  // Twitter: 每天1-2条
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    schedule.push({
      platform: 'Twitter',
      date: date.toISOString().split('T')[0],
      time: '10:00 AM EST',
      content: TWITTER_TEMPLATES[i % TWITTER_TEMPLATES.length].content
    });
  }
  
  // Reddit: 每周2-3次
  schedule.push({
    platform: 'Reddit r/webdev',
    date: new Date(now.setDate(now.getDate() + 1)).toISOString().split('T')[0],
    subreddit: 'webdev',
    ...REDDIT_TEMPLATES.webdev
  });
  
  schedule.push({
    platform: 'Reddit r/SideProject',
    date: new Date(now.setDate(now.getDate() + 3)).toISOString().split('T')[0],
    subreddit: 'SideProject',
    ...REDDIT_TEMPLATES.sideproject
  });
  
  return schedule;
}

// 主函数
async function main() {
  console.log('📱 社媒内容生成系统\n');
  
  // 确保目录存在
  if (!fs.existsSync('marketing')) fs.mkdirSync('marketing');
  
  // 生成Twitter内容
  console.log('🐦 Twitter帖子:');
  console.log('-------------');
  TWITTER_TEMPLATES.forEach((post, i) => {
    console.log(`\n[${i + 1}] ${post.topic}`);
    console.log(`${post.content.substring(0, 100)}...`);
  });
  
  // 保存Twitter内容
  const twitterOutput = TWITTER_TEMPLATES.map((t, i) => 
    `--- Post ${i + 1}: ${t.topic} ---\n${t.content}\n\n`
  ).join('');
  fs.writeFileSync('marketing/twitter-ready-to-post.txt', twitterOutput);
  console.log('\n✅ Twitter内容已保存: marketing/twitter-ready-to-post.txt');
  
  // 生成Reddit内容
  console.log('\n📱 Reddit帖子:');
  console.log('------------');
  Object.entries(REDDIT_TEMPLATES).forEach(([sub, post]) => {
    console.log(`\n[${sub}]`);
    console.log(`标题: ${post.title}`);
    console.log(`内容: ${post.content.substring(0, 150)}...`);
  });
  
  // 保存Reddit内容
  const redditOutput = Object.entries(REDDIT_TEMPLATES).map(([sub, post]) => 
    `=== r/${sub} ===\n标题: ${post.title}\n\n${post.content}\n\n`
  ).join('');
  fs.writeFileSync('marketing/reddit-ready-to-post.txt', redditOutput);
  console.log('✅ Reddit内容已保存: marketing/reddit-ready-to-post.txt');
  
  // 生成发布计划
  const schedule = generatePostingSchedule();
  fs.writeFileSync('output/posting-schedule.json', JSON.stringify(schedule, null, 2));
  
  console.log('\n📅 本周发布计划:');
  console.log('----------------');
  schedule.forEach(item => {
    console.log(`${item.date} - ${item.platform}`);
  });
  
  console.log('\n✅ 全部内容准备完成！');
  console.log('\n发布建议:');
  console.log('1. Twitter: 每天1-2条，最佳时间 10AM/3PM EST');
  console.log('2. Reddit: 周二/周四上午，先参与社区再发帖');
  console.log('3. 包含项目链接但不要过度推广');
}

main().catch(console.error);
