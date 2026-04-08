// 邮件营销自动化系统
const fs = require('fs');

// 邮件模板库
const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to CyberSec Hub - Your Security Resource Library',
    body: `
Hi {{name}},

Welcome to CyberSec Hub! 🛡️

You've joined 1,000+ security professionals who get:

✅ 50+ free cybersecurity articles
✅ Weekly security tips
✅ Tool recommendations
✅ Exclusive resources

GET STARTED:
→ Browse all articles: https://fabio2026-ui.github.io/ai-agent-passive-income
→ Check the dashboard: https://fabio2026-ui.github.io/ai-agent-passive-income/dashboard.html

POPULAR TOPICS:
• XSS Protection Guide
• SQL Injection Prevention  
• API Security Best Practices
• DevSecOps Pipeline
• Cloud Security Configuration

Questions? Just reply to this email.

Stay secure,
小七 AI Security Assistant

---
Unsubscribe: {{unsubscribe_link}}
    `
  },
  
  weekly: {
    subject: 'Weekly CyberSec Roundup - {{date}}',
    body: `
Hi {{name}},

Here's your weekly security roundup: 📧

🔥 TRENDING THIS WEEK:
1. New OAuth2 vulnerability discovered
2. Chrome extension security updates
3. Kubernetes security best practices

📚 NEW ARTICLES:
{{new_articles}}

🛠️ TOOL SPOTLIGHT:
{{tool_spotlight}}

💡 QUICK TIP:
{{quick_tip}}

Read more: https://fabio2026-ui.github.io/ai-agent-passive-income

Stay secure,
小七 AI Security Assistant

---
Unsubscribe: {{unsubscribe_link}}
    `
  },
  
  affiliate: {
    subject: 'Tool Recommendation: {{tool_name}}',
    body: `
Hi {{name}},

I wanted to share a tool I've been using:

🔧 {{tool_name}}

{{tool_description}}

Why I recommend it:
{{reasons}}

Get started: {{affiliate_link}}

Disclosure: This email contains affiliate links. I only recommend tools I personally use.

Stay secure,
小七 AI Security Assistant

---
Unsubscribe: {{unsubscribe_link}}
    `
  }
};

// 订阅者管理
class EmailMarketing {
  constructor() {
    this.subscribersFile = 'data/subscribers.json';
    this.campaignsFile = 'data/campaigns.json';
    this.ensureDataDir();
  }
  
  ensureDataDir() {
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data', { recursive: true });
    }
    if (!fs.existsSync(this.subscribersFile)) {
      fs.writeFileSync(this.subscribersFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(this.campaignsFile)) {
      fs.writeFileSync(this.campaignsFile, JSON.stringify([], null, 2));
    }
  }
  
  addSubscriber(email, name = '', tags = []) {
    const subscribers = JSON.parse(fs.readFileSync(this.subscribersFile));
    
    // Check if already exists
    if (subscribers.find(s => s.email === email)) {
      console.log(`Subscriber ${email} already exists`);
      return false;
    }
    
    subscribers.push({
      email,
      name,
      tags,
      subscribedAt: new Date().toISOString(),
      status: 'active'
    });
    
    fs.writeFileSync(this.subscribersFile, JSON.stringify(subscribers, null, 2));
    console.log(`✅ Added subscriber: ${email}`);
    return true;
  }
  
  getSubscribers(tag = null) {
    const subscribers = JSON.parse(fs.readFileSync(this.subscribersFile));
    if (tag) {
      return subscribers.filter(s => s.tags.includes(tag) && s.status === 'active');
    }
    return subscribers.filter(s => s.status === 'active');
  }
  
  generateEmail(templateName, data) {
    const template = EMAIL_TEMPLATES[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    
    let subject = template.subject;
    let body = template.body;
    
    // Replace variables
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, data[key]);
      body = body.replace(regex, data[key]);
    });
    
    return { subject, body };
  }
  
  createCampaign(name, template, segment = null) {
    const campaigns = JSON.parse(fs.readFileSync(this.campaignsFile));
    
    const campaign = {
      id: Date.now().toString(),
      name,
      template,
      segment,
      status: 'draft',
      createdAt: new Date().toISOString(),
      sentAt: null,
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0
      }
    };
    
    campaigns.push(campaign);
    fs.writeFileSync(this.campaignsFile, JSON.stringify(campaigns, null, 2));
    
    console.log(`✅ Campaign created: ${name}`);
    return campaign;
  }
  
  exportForMailchimp() {
    const subscribers = this.getSubscribers();
    const csv = [
      'Email Address,First Name,Tags,Subscribed',
      ...subscribers.map(s => `${s.email},${s.name},"${s.tags.join(',')}",${s.subscribedAt}`)
    ].join('\n');
    
    fs.writeFileSync('data/mailchimp_import.csv', csv);
    console.log('✅ Exported to data/mailchimp_import.csv');
    return csv;
  }
  
  getStats() {
    const subscribers = JSON.parse(fs.readFileSync(this.subscribersFile));
    const campaigns = JSON.parse(fs.readFileSync(this.campaignsFile));
    
    return {
      totalSubscribers: subscribers.length,
      activeSubscribers: subscribers.filter(s => s.status === 'active').length,
      totalCampaigns: campaigns.length,
      sentCampaigns: campaigns.filter(c => c.status === 'sent').length
    };
  }
}

// CLI interface
function main() {
  const marketing = new EmailMarketing();
  
  const command = process.argv[2];
  
  switch(command) {
    case 'add':
      const email = process.argv[3];
      const name = process.argv[4] || '';
      if (email) {
        marketing.addSubscriber(email, name, ['newsletter']);
      } else {
        console.log('Usage: node email-marketing.js add <email> [name]');
      }
      break;
      
    case 'list':
      const subscribers = marketing.getSubscribers();
      console.log(`\n📧 Subscribers (${subscribers.length}):`);
      subscribers.forEach(s => {
        console.log(`  ${s.email} - ${s.name || 'Anonymous'} [${s.tags.join(', ')}]`);
      });
      break;
      
    case 'stats':
      const stats = marketing.getStats();
      console.log('\n📊 Email Marketing Stats:');
      console.log(`  Total Subscribers: ${stats.totalSubscribers}`);
      console.log(`  Active: ${stats.activeSubscribers}`);
      console.log(`  Campaigns: ${stats.totalCampaigns}`);
      break;
      
    case 'export':
      marketing.exportForMailchimp();
      break;
      
    case 'campaign':
      const campaignName = process.argv[3] || 'Weekly Newsletter';
      const template = process.argv[4] || 'weekly';
      marketing.createCampaign(campaignName, template);
      break;
      
    default:
      console.log(`
📧 Email Marketing System

Commands:
  add <email> [name]     - Add subscriber
  list                   - List all subscribers
  stats                  - Show statistics
  export                 - Export for Mailchimp
  campaign [name] [tpl]  - Create campaign

Examples:
  node email-marketing.js add user@example.com "John Doe"
  node email-marketing.js list
  node email-marketing.js export
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = { EmailMarketing, EMAIL_TEMPLATES };
