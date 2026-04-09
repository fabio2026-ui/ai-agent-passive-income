/**
 * Breath AI Reddit 自动回复系统
 * 
 * 功能：
 * 1. 监控指定subreddit的关键词
 * 2. 检测常见问题并自动回复
 * 3. 记录所有互动
 * 4. 防止spam（频率限制）
 */

const Snoowrap = require('snoowrap');
const fs = require('fs').promises;
const path = require('path');
const dayjs = require('dayjs');
require('dotenv').config();

// 配置
const CONFIG = {
  // Reddit API 配置（从环境变量读取）
  reddit: {
    userAgent: process.env.REDDIT_USER_AGENT || 'BreathAI-ReplyBot/1.0',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
  },
  
  // 监控配置
  monitoring: {
    checkInterval: parseInt(process.env.CHECK_INTERVAL) || 300, // 秒
    subreddits: (process.env.SUBREDDITS || 'Meditation,Anxiety,productivity,sleep,breathing,mindfulness,selfimprovement').split(','),
    keywords: (process.env.KEYWORDS || 'breath ai,breathing ai,breathing app,breath app,4-7-8 breathing,box breathing,physiological sigh').split(','),
    minScore: parseInt(process.env.MIN_SCORE) || 1,
    maxRepliesPerHour: parseInt(process.env.MAX_REPLIES_PER_HOUR) || 3,
    maxRepliesPerDay: parseInt(process.env.MAX_REPLIES_PER_DAY) || 10
  },
  
  // 回复规则
  replyRules: {
    minAccountAge: 30, // 天
    minKarma: 10,
    cooldownHours: 24,
    avoidSpam: true,
    dontReplyTo: ['bot', 'spam', 'advertisement', 'promotion']
  },
  
  // 文件路径
  paths: {
    logs: './logs',
    data: './data'
  }
};

// FAQ 回复模板
const FAQ_RESPONSES = {
  what_app: {
    keywords: ['what app', 'what is this', 'which app', 'what app is this', 'what\'s this app'],
    priority: 1,
    response: `This is Breath AI - a smart breathing coach that adapts to your needs in real time.

It includes:
• 4-7-8 breathing for sleep
• Box breathing for focus
• Physiological sigh for stress relief
• AI-powered personalization

Happy to share more details if you're interested!`
  },
  
  science: {
    keywords: ['does this work', 'is there science', 'evidence', 'research', 'proof', 'studies'],
    priority: 2,
    response: `Yes! The breathing techniques in Breath AI are based on research from Stanford's Andrew Huberman and other neuroscientists:

• **Physiological sigh**: Double inhale + long exhale to quickly reduce CO2 and calm the nervous system
• **4-7-8 breathing**: Activates the parasympathetic nervous system ("rest and digest" mode)
• **Box breathing**: Used by Navy SEALs to maintain calm under stress

Studies show 10 minutes of daily breathing practice can reduce cortisol by ~20% after 4 weeks.

The AI component personalizes the rhythm based on your feedback and biometrics (if you connect a wearable).`
  },
  
  pricing: {
    keywords: ['free', 'cost', 'price', 'subscription', 'how much', 'pricing'],
    priority: 3,
    response: `Breath AI has a generous free tier:
• Basic breathing exercises (4-7-8, box, physiological sigh)
• Daily reminders
• Progress tracking

**Premium ($4.99/month or $29.99/year)** adds:
• AI personalization
• Biofeedback integration (Apple Watch, Oura, etc.)
• Advanced analytics
• Custom breathing patterns

There's a 7-day free trial for premium features.`
  },
  
  download: {
    keywords: ['download', 'where can i get', 'link', 'app store', 'play store', 'ios', 'android'],
    priority: 4,
    response: `You can get Breath AI here:
• **iOS**: Search "Breath AI" on the App Store
• **Android**: Search "Breath AI" on Google Play
• **Web**: https://breath-ai.app

Let me know if you have any questions after trying it!`
  },
  
  comparison: {
    keywords: ['vs', 'versus', 'compare', 'difference', 'better than', 'alternative to', 'instead of'],
    priority: 5,
    response: `Main differences from other breathing apps:

1. **AI Personalization** - Most apps use fixed timers. Breath AI adapts the pace based on your actual breathing rhythm and feedback.

2. **Biofeedback Integration** - Works with Apple Watch, Oura Ring, etc. to adjust exercises based on your real-time HRV.

3. **Scientific Focus** - Techniques backed by peer-reviewed research (Huberman Lab, etc.) not just "calming sounds"

4. **Offline First** - Core features work without internet, no account required for basic use

5. **No Meditation Required** - For people who find meditation hard. This is pure physiology, no "clear your mind" stuff

That said, if you love your current app and it works for you, keep using it! Different tools work for different people.`
  },
  
  safety: {
    keywords: ['side effects', 'safe', 'dangerous', 'risk', 'medical', 'doctor'],
    priority: 6,
    response: `Breathing exercises are generally safe for healthy individuals. However:

**Consult a doctor first if you have:**
• Respiratory conditions (asthma, COPD)
• Cardiovascular issues
• History of hyperventilation or panic attacks triggered by breathwork
• Are pregnant (some techniques may cause dizziness)

**General precautions:**
• Stop if you feel dizzy, lightheaded, or uncomfortable
• Don't practice while driving or operating machinery
• Start with shorter sessions (2-3 minutes)

This app is a wellness tool, not medical treatment. For clinical anxiety or sleep disorders, please work with a healthcare provider.`
  },
  
  beginner: {
    keywords: ['how to start', 'beginner', 'new to', 'first time', 'getting started', 'newbie'],
    priority: 7,
    response: `Great question! Here's a beginner-friendly approach:

**Week 1: Try the basics**
• Start with 4-7-8 breathing (2-3 minutes before bed)
• Just focus on the rhythm, don't worry about "doing it right"

**Week 2: Find your use case**
• Morning: Box breathing for focus (5 min)
• Stressed: Physiological sigh (2 cycles)
• Can't sleep: Extended exhale breathing

**Week 3: Build the habit**
• Same time daily (habit stacking works great - do it right after brushing teeth)
• Use reminders
• Track how you feel before/after

The AI will start learning your preferences after about 5 sessions and suggest personalized routines.

Pro tip: Don't try to optimize everything at once. Start with ONE technique that resonates with you.`
  }
};

// 创建 Reddit 客户端
function createRedditClient() {
  if (!CONFIG.reddit.clientId || !CONFIG.reddit.username) {
    throw new Error('Reddit credentials not configured. Please set environment variables.');
  }
  
  return new Snoowrap({
    userAgent: CONFIG.reddit.userAgent,
    clientId: CONFIG.reddit.clientId,
    clientSecret: CONFIG.reddit.clientSecret,
    username: CONFIG.reddit.username,
    password: CONFIG.reddit.password
  });
}

// 初始化日志目录
async function initDirectories() {
  try {
    await fs.mkdir(CONFIG.paths.logs, { recursive: true });
    await fs.mkdir(CONFIG.paths.data, { recursive: true });
  } catch (error) {
    console.error('Failed to create directories:', error);
  }
}

// 记录互动
async function logInteraction(data) {
  const logEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...data
  };
  
  const logFile = path.join(CONFIG.paths.logs, 'interactions.jsonl');
  await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  
  console.log(`📊 Logged interaction: ${logEntry.id}`);
  return logEntry;
}

// 生成唯一ID
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 检查是否应该回复（频率限制）
async function shouldReply(submissionId, authorName) {
  try {
    const logFile = path.join(CONFIG.paths.logs, 'interactions.jsonl');
    let logs = [];
    
    try {
      const content = await fs.readFile(logFile, 'utf8');
      logs = content.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
    } catch (e) {
      // 文件不存在或为空
      return true;
    }
    
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const cooldownPeriod = now - (CONFIG.replyRules.cooldownHours * 60 * 60 * 1000);
    
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime > oneDayAgo;
    });
    
    // 检查每小时限制
    const repliesLastHour = recentLogs.filter(log => 
      new Date(log.timestamp).getTime() > oneHourAgo && log.replySent
    ).length;
    
    if (repliesLastHour >= CONFIG.monitoring.maxRepliesPerHour) {
      console.log(`⏸️ Hourly limit reached (${repliesLastHour}/${CONFIG.monitoring.maxRepliesPerHour})`);
      return false;
    }
    
    // 检查每日限制
    const repliesLastDay = recentLogs.filter(log => log.replySent).length;
    if (repliesLastDay >= CONFIG.monitoring.maxRepliesPerDay) {
      console.log(`⏸️ Daily limit reached (${repliesLastDay}/${CONFIG.monitoring.maxRepliesPerDay})`);
      return false;
    }
    
    // 检查冷却期（同一帖子）
    const recentReplyToPost = logs.find(log => 
      log.postId === submissionId && new Date(log.timestamp).getTime() > cooldownPeriod
    );
    if (recentReplyToPost) {
      console.log(`⏸️ Post ${submissionId} is in cooldown`);
      return false;
    }
    
    // 检查是否回复过同一作者
    const recentReplyToAuthor = logs.find(log => 
      log.authorName === authorName && new Date(log.timestamp).getTime() > cooldownPeriod
    );
    if (recentReplyToAuthor) {
      console.log(`⏸️ Author ${authorName} is in cooldown`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking shouldReply:', error);
    return false;
  }
}

// 匹配FAQ
function matchFAQ(text) {
  const lowerText = text.toLowerCase();
  
  for (const [faqKey, faq] of Object.entries(FAQ_RESPONSES)) {
    for (const keyword of faq.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return { faqKey, response: faq.response, priority: faq.priority };
      }
    }
  }
  
  return null;
}

// 检查是否应该跳过（垃圾内容检测）
function shouldSkip(text, authorName) {
  const lowerText = text.toLowerCase();
  
  // 检查禁止关键词
  for (const keyword of CONFIG.replyRules.dontReplyTo) {
    if (lowerText.includes(keyword)) {
      return { skip: true, reason: `Contains forbidden keyword: ${keyword}` };
    }
  }
  
  // 检查是否是明显的广告
  if (lowerText.includes('buy now') || lowerText.includes('click here') || lowerText.includes('limited time')) {
    return { skip: true, reason: 'Potential spam' };
  }
  
  return { skip: false };
}

// 搜索子版块
async function searchSubreddit(client, subreddit, keyword) {
  try {
    const posts = await client
      .getSubreddit(subreddit)
      .search({
        query: keyword,
        time: 'day',
        sort: 'new',
        limit: 25
      });
    
    return posts.map(post => ({
      id: post.id,
      name: post.name,
      title: post.title,
      selftext: post.selftext || '',
      author: post.author?.name || 'deleted',
      subreddit: post.subreddit.display_name,
      score: post.score,
      numComments: post.num_comments,
      url: `https://reddit.com${post.permalink}`,
      created: new Date(post.created_utc * 1000).toISOString(),
      isSelf: post.is_self,
      authorKarma: post.author?.link_karma || 0
    }));
  } catch (error) {
    console.error(`Error searching r/${subreddit}:`, error.message);
    return [];
  }
}

// 发送回复
async function sendReply(client, submission, response) {
  try {
    // 添加免责声明
    const fullResponse = `${response}

---
*I'm a helper sharing info about Breath AI. Not affiliated with the company - just a fan of the app. Hope this helps!*`;
    
    const reply = await submission.reply(fullResponse);
    console.log(`✅ Reply sent: ${reply.id}`);
    return reply;
  } catch (error) {
    console.error('Error sending reply:', error.message);
    throw error;
  }
}

// 主监控循环
async function monitorCycle(client) {
  console.log(`\n🔍 Starting monitoring cycle at ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
  
  const allMatches = [];
  
  for (const subreddit of CONFIG.monitoring.subreddits) {
    console.log(`\n📌 Scanning r/${subreddit}...`);
    
    for (const keyword of CONFIG.monitoring.keywords) {
      try {
        const posts = await searchSubreddit(client, subreddit, keyword);
        
        for (const post of posts) {
          // 检查最低分数
          if (post.score < CONFIG.monitoring.minScore) continue;
          
          // 检查是否应该跳过
          const fullText = `${post.title} ${post.selftext}`;
          const skipCheck = shouldSkip(fullText, post.author);
          if (skipCheck.skip) {
            console.log(`  ⏭️ Skipping post ${post.id}: ${skipCheck.reason}`);
            continue;
          }
          
          // 匹配FAQ
          const faqMatch = matchFAQ(fullText);
          if (faqMatch) {
            allMatches.push({
              ...post,
              matchedKeyword: keyword,
              matchedFAQ: faqMatch.faqKey,
              response: faqMatch.response,
              priority: faqMatch.priority
            });
          }
        }
        
        // 避免速率限制
        await sleep(1000);
        
      } catch (error) {
        console.error(`  Error with keyword "${keyword}":`, error.message);
      }
    }
  }
  
  console.log(`\n📊 Found ${allMatches.length} matching posts`);
  
  // 按优先级排序并去重
  const uniqueMatches = [];
  const seen = new Set();
  
  allMatches
    .sort((a, b) => a.priority - b.priority)
    .forEach(match => {
      if (!seen.has(match.id)) {
        seen.add(match.id);
        uniqueMatches.push(match);
      }
    });
  
  console.log(`📊 ${uniqueMatches.length} unique posts after deduplication`);
  
  // 处理匹配
  let repliesSent = 0;
  
  for (const match of uniqueMatches.slice(0, CONFIG.monitoring.maxRepliesPerHour)) {
    console.log(`\n📝 Processing: "${match.title.substring(0, 60)}..."`);
    console.log(`   Subreddit: r/${match.subreddit}`);
    console.log(`   FAQ Match: ${match.matchedFAQ}`);
    
    // 检查频率限制
    const canReply = await shouldReply(match.name, match.author);
    if (!canReply) {
      console.log(`   ⏸️ Skipped due to rate limiting`);
      await logInteraction({
        postId: match.name,
        subreddit: match.subreddit,
        postTitle: match.title,
        triggerKeyword: match.matchedKeyword,
        matchedFAQ: match.matchedFAQ,
        replySent: false,
        skipReason: 'rate_limit',
        authorName: match.author,
        authorKarma: match.authorKarma
      });
      continue;
    }
    
    try {
      // 获取帖子对象
      const submission = await client.getSubmission(match.id);
      
      // 发送回复
      const reply = await sendReply(client, submission, match.response);
      
      // 记录成功
      await logInteraction({
        postId: match.name,
        subreddit: match.subreddit,
        postTitle: match.title,
        triggerKeyword: match.matchedKeyword,
        matchedFAQ: match.matchedFAQ,
        replySent: true,
        replyId: reply.id,
        replyContent: match.response,
        authorName: match.author,
        authorKarma: match.authorKarma,
        postScore: match.score
      });
      
      repliesSent++;
      console.log(`   ✅ Reply sent!`);
      
      // 回复之间等待
      await sleep(5000);
      
    } catch (error) {
      console.error(`   ❌ Failed to reply:`, error.message);
      await logInteraction({
        postId: match.name,
        subreddit: match.subreddit,
        postTitle: match.title,
        triggerKeyword: match.matchedKeyword,
        matchedFAQ: match.matchedFAQ,
        replySent: false,
        skipReason: `error: ${error.message}`,
        authorName: match.author
      });
    }
  }
  
  console.log(`\n✅ Cycle complete. Replies sent: ${repliesSent}/${uniqueMatches.length}`);
  return { processed: uniqueMatches.length, replied: repliesSent };
}

// 睡眠函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 主函数
async function main() {
  console.log('🚀 Breath AI Reddit Auto-Reply System');
  console.log('=====================================\n');
  
  // 初始化目录
  await initDirectories();
  
  // 检查环境变量
  if (!process.env.REDDIT_CLIENT_ID) {
    console.error('❌ ERROR: Reddit credentials not configured!');
    console.log('\nPlease set the following environment variables:');
    console.log('  - REDDIT_CLIENT_ID');
    console.log('  - REDDIT_CLIENT_SECRET');
    console.log('  - REDDIT_USERNAME');
    console.log('  - REDDIT_PASSWORD');
    console.log('\nOr create a .env file with these variables.');
    process.exit(1);
  }
  
  // 创建客户端
  let client;
  try {
    client = createRedditClient();
    console.log('✅ Reddit client initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Reddit client:', error.message);
    process.exit(1);
  }
  
  // 配置信息
  console.log('\n📋 Configuration:');
  console.log(`  Subreddits: ${CONFIG.monitoring.subreddits.join(', ')}`);
  console.log(`  Keywords: ${CONFIG.monitoring.keywords.join(', ')}`);
  console.log(`  Check interval: ${CONFIG.monitoring.checkInterval}s`);
  console.log(`  Max replies/hour: ${CONFIG.monitoring.maxRepliesPerHour}`);
  console.log(`  Max replies/day: ${CONFIG.monitoring.maxRepliesPerDay}`);
  console.log('');
  
  // 运行一次测试
  console.log('🧪 Running initial test cycle...\n');
  await monitorCycle(client);
  
  // 持续监控
  console.log(`\n🔄 Starting continuous monitoring (interval: ${CONFIG.monitoring.checkInterval}s)...`);
  console.log('Press Ctrl+C to stop\n');
  
  // 使用setInterval进行定期检查
  setInterval(async () => {
    try {
      await monitorCycle(client);
    } catch (error) {
      console.error('Error in monitoring cycle:', error);
    }
  }, CONFIG.monitoring.checkInterval * 1000);
  
  // 保持进程运行
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down...');
    process.exit(0);
  });
}

// 如果直接运行
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  createRedditClient,
  monitorCycle,
  matchFAQ,
  FAQ_RESPONSES,
  CONFIG
};
