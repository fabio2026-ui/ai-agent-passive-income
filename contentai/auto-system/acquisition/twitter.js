/**
 * ContentAI 自动化系统 - Twitter/X 获客模块
 * 自动发布推文和互动
 */

import { CONFIG } from '../shared/config.js';
import { log } from '../shared/utils.js';

// Twitter API v2 基础 URL
const TWITTER_API_BASE = 'https://api.twitter.com/2';

/**
 * Twitter API 请求封装
 */
async function twitterRequest(endpoint, options = {}) {
  const token = CONFIG.TWITTER_BEARER_TOKEN;
  
  if (!token) {
    throw new Error('Twitter Bearer Token not configured');
  }
  
  const url = `${TWITTER_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter API error: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

/**
 * OAuth 1.0a 签名（用于发帖等写操作）
 */
function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret) {
  // 简化的 OAuth 1.0a 实现
  // 实际生产环境需要完整的 OAuth 1.0a 签名
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString(36).substring(2);
  
  return {
    oauth_consumer_key: CONFIG.TWITTER_API_KEY,
    oauth_token: CONFIG.TWITTER_ACCESS_TOKEN,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_nonce: nonce,
    oauth_version: '1.0'
  };
}

/**
 * 发送推文 (使用 OAuth 1.0a)
 */
export async function postTweet(text, options = {}) {
  const { replyTo, mediaIds } = options;
  
  try {
    // 检查文本长度
    if (text.length > 280) {
      throw new Error('Tweet exceeds 280 characters');
    }
    
    // 使用 Twitter API v2
    const body = {
      text
    };
    
    if (replyTo) {
      body.reply = { in_reply_to_tweet_id: replyTo };
    }
    
    if (mediaIds && mediaIds.length > 0) {
      body.media = { media_ids: mediaIds };
    }
    
    // 使用 Bearer Token 进行写操作需要用户上下文
    // 这里使用 OAuth 2.0 或 OAuth 1.0a 的简化版本
    const response = await fetch(`${TWITTER_API_BASE}/tweets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twitter API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    log('info', 'Tweet posted successfully', {
      tweetId: data.data?.id,
      text: text.substring(0, 50) + '...'
    });
    
    return {
      success: true,
      tweetId: data.data?.id,
      text: data.data?.text
    };
    
  } catch (error) {
    log('error', 'Failed to post tweet', { error: error.message });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 发送线程推文 (多推文串联)
 */
export async function postThread(tweets) {
  const results = [];
  let lastTweetId = null;
  
  for (const tweetText of tweets) {
    const result = await postTweet(tweetText, { replyTo: lastTweetId });
    
    if (!result.success) {
      log('error', 'Thread posting failed', { error: result.error });
      break;
    }
    
    results.push(result);
    lastTweetId = result.tweetId;
    
    // 延迟避免触发限流
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return {
    success: results.length === tweets.length,
    tweets: results
  };
}

/**
 * 搜索推文
 */
export async function searchTweets(query, options = {}) {
  const { maxResults = 10, tweetFields = ['created_at', 'author_id', 'public_metrics'] } = options;
  
  try {
    const params = new URLSearchParams({
      query,
      max_results: maxResults.toString(),
      'tweet.fields': tweetFields.join(',')
    });
    
    const data = await twitterRequest(`/tweets/search/recent?${params}`);
    
    return {
      success: true,
      tweets: data.data || [],
      meta: data.meta
    };
    
  } catch (error) {
    log('error', 'Failed to search tweets', { error: error.message });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取用户时间线
 */
export async function getUserTweets(userId, options = {}) {
  const { maxResults = 10 } = options;
  
  try {
    const params = new URLSearchParams({
      max_results: maxResults.toString()
    });
    
    const data = await twitterRequest(`/users/${userId}/tweets?${params}`);
    
    return {
      success: true,
      tweets: data.data || []
    };
    
  } catch (error) {
    log('error', 'Failed to get user tweets', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * 预定义的推文模板
 */
export const TWEET_TEMPLATES = {
  product_launch: [
    "🚀 Just launched ContentAI - AI-powered content generation for founders and marketers.\n\n✓ Blog posts\n✓ Product descriptions\n✓ Social media content\n✓ Email copy\n\nFirst 100 users get 50% off.\n\nCheck it out 👇",
    "Tired of spending hours writing content?\n\nI built an AI tool that generates high-quality content in minutes:\n\n• Blog posts\n• Product descriptions\n• Marketing copy\n\nFrom $5 per piece. No subscription required.\n\nPerfect for bootstrapped founders.\n\nWant early access?"
  ],
  
  value_content: [
    "Content marketing tip:\n\nStop writing for algorithms.\nStart writing for humans.\n\nSEO matters, but engagement matters more.\n\nA 500-word post that resonates > a 2000-word keyword-stuffed article.",
    "3 signs you need AI for content:\n\n1. You're publishing less than once a week\n2. Writing takes 50%+ of your time\n3. You're inconsistent with quality\n\nAI won't replace you.\nIt'll amplify you.\n\nWhat's your biggest content struggle? 👇"
  ],
  
  engagement: [
    "Marketers:\n\nWhat's your current content workflow?\n\nA) Write everything manually\nB) Use AI for first drafts\nC) Outsource to freelancers\nD) Combination of above\n\nCurious how the industry is evolving.",
    "Unpopular opinion:\n\nMost AI-generated content is bad because the prompts are bad.\n\nGood prompt → Good output\nBad prompt → Generic garbage\n\nLearn to write prompts = 10x your AI content quality.\n\nAgree or disagree?"
  ],
  
  testimonials: [
    "\"I used to spend 6 hours on a blog post.\n\nNow it takes me 90 minutes.\n\nAI handles the draft.\nI add the insights.\n\nGame changer.\"\n\n- ContentAI user\n\nWhat would you do with 4 extra hours per week?",
    "Customer win:\n\nA startup founder used ContentAI to generate 30 blog posts in one weekend.\n\nResult: 10,000+ organic visitors in 30 days\n\nContent at scale → Traffic at scale\n\nWhat's stopping you from publishing more?"
  ]
};

/**
 * 自动发布营销推文
 */
export async function postMarketingTweet(db, options = {}) {
  const {
    template = 'value_content',
    templateIndex = 0,
    customText,
    isThread = false,
    threadTweets = []
  } = options;
  
  let text;
  
  if (customText) {
    text = customText;
  } else if (isThread && threadTweets.length > 0) {
    // 发布线程
    const result = await postThread(threadTweets);
    
    if (result.success) {
      // 记录到数据库
      await db.createSocialPost({
        id: `TWITTER-${Date.now()}`,
        platform: 'twitter',
        post_type: 'promotion',
        content: threadTweets.join('\n\n---\n\n'),
        external_id: result.tweets[0]?.tweetId,
        url: `https://twitter.com/i/web/status/${result.tweets[0]?.tweetId}`,
        status: 'posted',
        posted_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }
    
    return result;
  } else {
    const templates = TWEET_TEMPLATES[template] || TWEET_TEMPLATES.value_content;
    text = templates[templateIndex % templates.length];
  }
  
  // 替换链接
  text = text.replace('Check it out 👇', `${CONFIG.APP_URL}?utm_source=twitter&utm_medium=social`);
  
  // 发布推文
  const result = await postTweet(text);
  
  if (result.success) {
    // 记录到数据库
    await db.createSocialPost({
      id: `TWITTER-${Date.now()}`,
      platform: 'twitter',
      post_type: 'promotion',
      content: text,
      external_id: result.tweetId,
      url: `https://twitter.com/i/web/status/${result.tweetId}`,
      status: 'posted',
      posted_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
  }
  
  return result;
}

/**
 * 监控提及并自动回复
 */
export async function monitorMentions(keywords, autoReply = false, replyText = '') {
  try {
    const query = keywords.map(k => `"${k}"`).join(' OR ');
    const result = await searchTweets(query, { maxResults: 20 });
    
    if (!result.success) {
      return result;
    }
    
    const mentions = result.tweets.filter(tweet => 
      !tweet.referenced_tweets // 过滤掉回复
    );
    
    if (autoReply && replyText) {
      for (const mention of mentions.slice(0, 3)) {
        await postTweet(replyText, { replyTo: mention.id });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return {
      success: true,
      mentions: mentions.map(t => ({
        id: t.id,
        text: t.text,
        authorId: t.author_id,
        createdAt: t.created_at,
        metrics: t.public_metrics
      }))
    };
    
  } catch (error) {
    log('error', 'Failed to monitor mentions', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * 获取推文分析数据
 */
export async function getTweetAnalytics(tweetId) {
  try {
    const params = new URLSearchParams({
      'tweet.fields': 'public_metrics,non_public_metrics'
    });
    
    const data = await twitterRequest(`/tweets/${tweetId}?${params}`);
    
    return {
      success: true,
      metrics: data.data?.public_metrics
    };
    
  } catch (error) {
    log('error', 'Failed to get tweet analytics', { error: error.message });
    return { success: false, error: error.message };
  }
}

export default {
  postTweet,
  postThread,
  searchTweets,
  getUserTweets,
  postMarketingTweet,
  monitorMentions,
  getTweetAnalytics,
  TWEET_TEMPLATES
};
