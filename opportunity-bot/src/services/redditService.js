/**
 * Reddit API 服务封装
 */

const Snoowrap = require('snoowrap');
const logger = require('../utils/logger');

/**
 * 创建 Reddit 客户端
 */
function createClient() {
  const client = new Snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
  });
  
  // 配置请求限制
  client.config({
    requestDelay: 1000,
    continueAfterRatelimitError: true,
    maxRetryAttempts: 3
  });
  
  return client;
}

/**
 * 搜索子版块中的帖子
 */
async function searchSubreddit(client, subreddit, options = {}) {
  const {
    query,
    time = 'day',
    sort = 'relevance',
    limit = 25
  } = options;
  
  try {
    const posts = await client
      .getSubreddit(subreddit)
      .search({
        query,
        time,
        sort,
        limit
      });
    
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      selftext: post.selftext?.substring(0, 500) || '',
      author: post.author?.name || 'deleted',
      subreddit: post.subreddit.display_name,
      score: post.score,
      numComments: post.num_comments,
      url: `https://reddit.com${post.permalink}`,
      created: new Date(post.created_utc * 1000).toISOString(),
      isSelf: post.is_self
    }));
  } catch (error) {
    logger.error(`搜索 r/${subreddit} 失败:`, error.message);
    return [];
  }
}

/**
 * 获取子版块的热门帖子
 */
async function getHotPosts(client, subreddit, limit = 25) {
  try {
    const posts = await client
      .getSubreddit(subreddit)
      .getHot({ limit });
    
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      selftext: post.selftext?.substring(0, 500) || '',
      author: post.author?.name || 'deleted',
      subreddit: post.subreddit.display_name,
      score: post.score,
      numComments: post.num_comments,
      url: `https://reddit.com${post.permalink}`,
      created: new Date(post.created_utc * 1000).toISOString(),
      isSelf: post.is_self
    }));
  } catch (error) {
    logger.error(`获取 r/${subreddit} 热门帖子失败:`, error.message);
    return [];
  }
}

/**
 * 获取子版块的新帖子
 */
async function getNewPosts(client, subreddit, limit = 25) {
  try {
    const posts = await client
      .getSubreddit(subreddit)
      .getNew({ limit });
    
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      selftext: post.selftext?.substring(0, 500) || '',
      author: post.author?.name || 'deleted',
      subreddit: post.subreddit.display_name,
      score: post.score,
      numComments: post.num_comments,
      url: `https://reddit.com${post.permalink}`,
      created: new Date(post.created_utc * 1000).toISOString(),
      isSelf: post.is_self
    }));
  } catch (error) {
    logger.error(`获取 r/${subreddit} 新帖子失败:`, error.message);
    return [];
  }
}

/**
 * 多子版块搜索
 */
async function searchMultipleSubreddits(client, subreddits, keywords, options = {}) {
  const results = [];
  
  for (const subreddit of subreddits) {
    for (const keyword of keywords) {
      logger.debug(`搜索 r/${subreddit} 关键词: ${keyword}`);
      
      try {
        const posts = await searchSubreddit(client, subreddit, {
          query: keyword,
          ...options
        });
        
        if (posts.length > 0) {
          results.push(...posts.map(post => ({
            ...post,
            matchedKeyword: keyword
          })));
        }
      } catch (error) {
        logger.error(`搜索失败 r/${subreddit} - ${keyword}:`, error.message);
      }
      
      // 避免速率限制
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  // 去重
  const seen = new Set();
  return results.filter(post => {
    if (seen.has(post.id)) return false;
    seen.add(post.id);
    return true;
  });
}

/**
 * 过滤商机相关帖子
 */
function filterOpportunityPosts(posts, minScore = 5, excludeKeywords = []) {
  return posts.filter(post => {
    // 最低点赞数
    if (post.score < minScore) return false;
    
    // 排除关键词
    const text = `${post.title} ${post.selftext}`.toLowerCase();
    for (const keyword of excludeKeywords) {
      if (text.includes(keyword.toLowerCase())) return false;
    }
    
    return true;
  });
}

/**
 * 按相关性排序
 */
function sortByRelevance(posts) {
  return posts.sort((a, b) => {
    // 综合得分：点赞数 + 评论数 * 2
    const scoreA = a.score + a.numComments * 2;
    const scoreB = b.score + b.numComments * 2;
    return scoreB - scoreA;
  });
}

module.exports = {
  createClient,
  searchSubreddit,
  getHotPosts,
  getNewPosts,
  searchMultipleSubreddits,
  filterOpportunityPosts,
  sortByRelevance
};
