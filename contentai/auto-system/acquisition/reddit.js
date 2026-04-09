/**
 * ContentAI 自动化系统 - Reddit 获客模块
 * 自动在 Reddit 发布推广内容
 */

import { CONFIG } from '../shared/config.js';
import { log, retry } from '../shared/utils.js';

// Reddit API 基础 URL
const REDDIT_API_BASE = 'https://oauth.reddit.com';

/**
 * 获取 Reddit OAuth Token
 */
async function getAccessToken() {
  const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD } = CONFIG;
  
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
    throw new Error('Reddit API credentials not configured');
  }
  
  const auth = btoa(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`);
  
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ContentAI/1.0'
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username: REDDIT_USERNAME,
      password: REDDIT_PASSWORD
    })
  });
  
  if (!response.ok) {
    throw new Error(`Reddit auth failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

/**
 * Reddit API 请求封装
 */
async function redditRequest(endpoint, options = {}, token = null) {
  const accessToken = token || await getAccessToken();
  
  const response = await fetch(`${REDDIT_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'ContentAI/1.0',
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Reddit API error: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

/**
 * 搜索相关 Subreddit
 */
export async function searchSubreddits(query, limit = 10) {
  try {
    const data = await redditRequest(`/subreddits/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    return data.data.children.map(child => ({
      name: child.data.display_name,
      title: child.data.title,
      subscribers: child.data.subscribers,
      description: child.data.public_description,
      url: `https://reddit.com/r/${child.data.display_name}`
    }));
  } catch (error) {
    log('error', 'Failed to search subreddits', { error: error.message });
    return [];
  }
}

/**
 * 发布帖子
 */
export async function submitPost(subreddit, title, text, options = {}) {
  const { flairId, nsfw = false, spoiler = false } = options;
  
  try {
    const body = new URLSearchParams({
      sr: subreddit,
      title,
      text,
      kind: 'self',
      nsfw: nsfw.toString(),
      spoiler: spoiler.toString()
    });
    
    if (flairId) {
      body.append('flair_id', flairId);
    }
    
    const data = await redditRequest('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });
    
    if (data.json.errors.length > 0) {
      throw new Error(data.json.errors.map(e => e.join(': ')).join(', '));
    }
    
    const post = data.json.data;
    
    log('info', 'Reddit post submitted', {
      subreddit,
      postId: post.id,
      url: post.url
    });
    
    return {
      success: true,
      postId: post.id,
      url: post.url,
      name: post.name
    };
    
  } catch (error) {
    log('error', 'Failed to submit Reddit post', {
      subreddit,
      error: error.message
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 发布链接帖子
 */
export async function submitLink(subreddit, title, url, options = {}) {
  try {
    const body = new URLSearchParams({
      sr: subreddit,
      title,
      url,
      kind: 'link',
      nsfw: (options.nsfw || false).toString()
    });
    
    const data = await redditRequest('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });
    
    if (data.json.errors.length > 0) {
      throw new Error(data.json.errors.map(e => e.join(': ')).join(', '));
    }
    
    return {
      success: true,
      postId: data.json.data.id,
      url: data.json.data.url
    };
    
  } catch (error) {
    log('error', 'Failed to submit Reddit link', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * 预定义的营销帖子模板
 */
export const POST_TEMPLATES = {
  content_creation: [
    {
      title: 'I built an AI that writes blog posts in 2 minutes - what do you think?',
      text: `Hey everyone,

I've been working on a side project that uses AI to generate high-quality blog posts, product descriptions, and social media content.

The idea came from my own struggle with content creation - I needed consistent blog posts for my startup but couldn't afford a full-time writer.

It's now at a point where I'm getting positive feedback from beta users. The content quality is surprisingly good, and it saves hours of work.

Would love to get your thoughts on this. Is this something you'd use? What features would you want to see?

[Link to try it out]`
    },
    {
      title: 'From 0 to 50 blog posts/month: How AI changed my content strategy',
      text: `I used to spend 4-6 hours writing a single blog post. Now I generate 50+ posts per month while focusing on strategy and editing.

Here's what changed:
- AI handles the first draft
- I focus on adding unique insights
- Editing time dropped from 2 hours to 30 minutes

The quality? Actually better because I can spend more time on research and less on writing.

If you're struggling with content volume, might be worth exploring AI tools. Happy to share my workflow.

What tools are you using for content creation?`
    }
  ],
  
  marketing: [
    {
      title: 'Marketers of Reddit: How do you handle content at scale?',
      text: `Running marketing for a small team and content creation is our biggest bottleneck.

We need:
- 8 blog posts/month
- Daily social media posts
- Email newsletters
- Product descriptions

Currently doing it all manually. Looking at AI tools but skeptical about quality.

For those using AI for content:
1. What's your workflow?
2. How much editing is needed?
3. Which tools do you recommend?

Found one that seems promising but would love real feedback before committing.

Thanks!`
    }
  ],
  
  startups: [
    {
      title: 'Show HN: AI-powered content generation for bootstrapped founders',
      text: `Launched my side project today: an AI tool that generates blog posts, product descriptions, and marketing copy.

Why I built it:
- As a solo founder, content was taking 40% of my time
- Couldn't justify $3k/month for a content writer
- Existing AI tools were too generic

What makes it different:
- Templates for different content types
- Optimized for conversions, not just word count
- One-click generation to your inbox

Tech stack: GPT-4, Node.js, Stripe

Currently at $500 MRR with 30 paying customers.

Would love your feedback and happy to answer any questions!`
    }
  ]
};

/**
 * 自动发布营销帖子
 */
export async function postMarketingContent(db, options = {}) {
  const {
    subreddit,
    template = 'content_creation',
    templateIndex = 0,
    customTitle,
    customText
  } = options;
  
  if (!subreddit) {
    throw new Error('Subreddit is required');
  }
  
  // 获取模板内容
  let title, text;
  
  if (customTitle && customText) {
    title = customTitle;
    text = customText;
  } else {
    const templates = POST_TEMPLATES[template] || POST_TEMPLATES.content_creation;
    const selected = templates[templateIndex % templates.length];
    title = selected.title;
    text = selected.text;
  }
  
  // 替换链接
  text = text.replace('[Link to try it out]', `${CONFIG.APP_URL}?utm_source=reddit&utm_medium=social`);
  
  // 发布帖子
  const result = await retry(() => submitPost(subreddit, title, text), 3, 5000);
  
  if (result.success) {
    // 记录到数据库
    await db.createSocialPost({
      id: `REDDIT-${Date.now()}`,
      platform: 'reddit',
      post_type: 'promotion',
      content: `${title}\n\n${text}`,
      external_id: result.postId,
      url: result.url,
      status: 'posted',
      posted_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
  }
  
  return result;
}

/**
 * 获取帖子的互动数据
 */
export async function getPostEngagement(postId) {
  try {
    const data = await redditRequest(`/comments/${postId}`);
    const post = data[0].data.children[0].data;
    
    return {
      upvotes: post.ups,
      downvotes: post.downs,
      score: post.score,
      numComments: post.num_comments,
      upvoteRatio: post.upvote_ratio
    };
  } catch (error) {
    log('error', 'Failed to get post engagement', { error: error.message });
    return null;
  }
}

/**
 * 回复评论
 */
export async function replyToComment(parentId, text) {
  try {
    const body = new URLSearchParams({
      thing_id: parentId,
      text
    });
    
    const data = await redditRequest('/api/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });
    
    if (data.json.errors.length > 0) {
      throw new Error(data.json.errors.map(e => e.join(': ')).join(', '));
    }
    
    return {
      success: true,
      commentId: data.json.data.id
    };
    
  } catch (error) {
    log('error', 'Failed to reply to comment', { error: error.message });
    return { success: false, error: error.message };
  }
}

export default {
  searchSubreddits,
  submitPost,
  submitLink,
  postMarketingContent,
  getPostEngagement,
  replyToComment,
  POST_TEMPLATES
};
