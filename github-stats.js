/**
 * GitHub Stats Tracker - GitHub统计追踪
 * 用于追踪GitHub仓库数据、贡献分析和开发者指标
 */

class GitHubStats {
  constructor(config = {}) {
    this.config = {
      token: config.token || null,
      baseUrl: config.baseUrl || 'https://api.github.com',
      cacheEnabled: config.cacheEnabled !== false,
      cacheExpiry: config.cacheExpiry || 300000, // 5分钟
      ...config
    };
    
    this.cache = new Map();
    this.repositories = new Map();
    this.contributors = new Map();
    this.issues = [];
    this.pullRequests = [];
    this.commits = [];
  }

  // ========== API 请求 ==========
  
  async fetchAPI(endpoint, options = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      ...options.headers
    };
    
    if (this.config.token) {
      headers['Authorization'] = `token ${this.config.token}`;
    }
    
    try {
      // Node.js 环境
      if (typeof fetch === 'undefined') {
        const https = require('https');
        return new Promise((resolve, reject) => {
          const req = https.get(url, { headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                resolve(data);
              }
            });
          });
          req.on('error', reject);
        });
      }
      
      // 浏览器环境
      const response = await fetch(url, { headers });
      return await response.json();
    } catch (error) {
      console.error('GitHub API Error:', error);
      return null;
    }
  }

  // ========== 仓库数据 ==========
  
  async fetchRepository(owner, repo) {
    const cacheKey = `repo:${owner}/${repo}`;
    
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheExpiry) {
        return cached.data;
      }
    }
    
    const data = await this.fetchAPI(`/repos/${owner}/${repo}`);
    
    if (data) {
      this.repositories.set(`${owner}/${repo}`, data);
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }
    
    return data;
  }

  async fetchUserRepos(username, type = 'owner') {
    const repos = await this.fetchAPI(`/users/${username}/repos?type=${type}&per_page=100`);
    return repos || [];
  }

  // ========== 提交数据 ==========
  
  async fetchCommits(owner, repo, options = {}) {
    const params = new URLSearchParams();
    if (options.since) params.append('since', options.since);
    if (options.until) params.append('until', options.until);
    if (options.author) params.append('author', options.author);
    if (options.per_page) params.append('per_page', options.per_page);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const commits = await this.fetchAPI(`/repos/${owner}/${repo}/commits${query}`);
    
    if (commits) {
      this.commits = [...this.commits, ...commits];
    }
    
    return commits || [];
  }

  async fetchCommitStats(owner, repo) {
    const stats = await this.fetchAPI(`/repos/${owner}/${repo}/stats/contributors`);
    return stats || [];
  }

  // ========== Issues 数据 ==========
  
  async fetchIssues(owner, repo, state = 'all') {
    const issues = await this.fetchAPI(`/repos/${owner}/${repo}/issues?state=${state}&per_page=100`);
    
    if (issues) {
      this.issues = [...this.issues, ...issues];
    }
    
    return issues || [];
  }

  // ========== Pull Requests ==========
  
  async fetchPullRequests(owner, repo, state = 'all') {
    const prs = await this.fetchAPI(`/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`);
    
    if (prs) {
      this.pullRequests = [...this.pullRequests, ...prs];
    }
    
    return prs || [];
  }

  // ========== 用户数据 ==========
  
  async fetchUser(username) {
    return await this.fetchAPI(`/users/${username}`);
  }

  async fetchUserEvents(username) {
    return await this.fetchAPI(`/users/${username}/events/public`);
  }

  // ========== 数据分析 ==========
  
  async analyzeRepository(owner, repo, options = {}) {
    const [repository, commits, issues, pullRequests, contributors] = await Promise.all([
      this.fetchRepository(owner, repo),
      this.fetchCommits(owner, repo, { per_page: 100, ...options }),
      this.fetchIssues(owner, repo),
      this.fetchPullRequests(owner, repo),
      this.fetchCommitStats(owner, repo)
    ]);
    
    if (!repository) {
      return { error: 'Repository not found' };
    }
    
    // 基础统计
    const stats = {
      stars: repository.stargazers_count,
      forks: repository.forks_count,
      watchers: repository.watchers_count,
      openIssues: repository.open_issues_count,
      size: repository.size,
      createdAt: repository.created_at,
      updatedAt: repository.updated_at,
      pushedAt: repository.pushed_at,
      language: repository.language,
      topics: repository.topics || [],
      license: repository.license?.name || 'No License'
    };
    
    // 提交分析
    const commitAnalysis = this.analyzeCommits(commits);
    
    // Issues 分析
    const issueAnalysis = this.analyzeIssues(issues);
    
    // PR 分析
    const prAnalysis = this.analyzePullRequests(pullRequests);
    
    // 贡献者分析
    const contributorAnalysis = this.analyzeContributors(contributors);
    
    // 语言分析
    const languages = await this.fetchAPI(`/repos/${owner}/${repo}/languages`);
    
    // 流量数据（仅对仓库所有者可访问）
    const traffic = await this.fetchTrafficData(owner, repo);
    
    return {
      repository: {
        name: repository.full_name,
        description: repository.description,
        url: repository.html_url,
        ...stats
      },
      commits: commitAnalysis,
      issues: issueAnalysis,
      pullRequests: prAnalysis,
      contributors: contributorAnalysis,
      languages: languages ? this.analyzeLanguages(languages) : null,
      traffic,
      healthScore: this.calculateHealthScore({
        stats,
        commitAnalysis,
        issueAnalysis,
        prAnalysis
      }),
      recommendations: this.generateRecommendations({
        stats,
        commitAnalysis,
        issueAnalysis,
        prAnalysis
      })
    };
  }

  analyzeCommits(commits) {
    if (!commits || commits.length === 0) {
      return { total: 0, byAuthor: {}, byDate: {}, messageTypes: {} };
    }
    
    const byAuthor = {};
    const byDate = {};
    const messageTypes = {};
    
    commits.forEach(commit => {
      // 作者统计
      const author = commit.author?.login || commit.commit?.author?.name || 'unknown';
      byAuthor[author] = (byAuthor[author] || 0) + 1;
      
      // 日期统计
      const date = commit.commit?.author?.date?.split('T')[0];
      if (date) {
        byDate[date] = (byDate[date] || 0) + 1;
      }
      
      // 提交类型（基于提交信息）
      const message = commit.commit?.message || '';
      let type = 'other';
      if (message.startsWith('feat:') || message.startsWith('feature:')) type = 'feature';
      else if (message.startsWith('fix:')) type = 'fix';
      else if (message.startsWith('docs:')) type = 'docs';
      else if (message.startsWith('test:')) type = 'test';
      else if (message.startsWith('refactor:')) type = 'refactor';
      else if (message.startsWith('chore:')) type = 'chore';
      
      messageTypes[type] = (messageTypes[type] || 0) + 1;
    });
    
    // 计算活跃度趋势
    const dates = Object.keys(byDate).sort();
    const recentCommits = dates.slice(-7).reduce((sum, d) => sum + byDate[d], 0);
    
    return {
      total: commits.length,
      uniqueAuthors: Object.keys(byAuthor).length,
      byAuthor: Object.entries(byAuthor)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      byDate: Object.entries(byDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      messageTypes: Object.entries(messageTypes)
        .map(([type, count]) => ({ type, count, percentage: ((count / commits.length) * 100).toFixed(1) })),
      recentActivity: recentCommits,
      avgCommitsPerDay: (commits.length / Math.max(1, dates.length)).toFixed(2)
    };
  }

  analyzeIssues(issues) {
    if (!issues || issues.length === 0) {
      return { total: 0, open: 0, closed: 0, avgResolutionTime: 0 };
    }
    
    const open = issues.filter(i => i.state === 'open').length;
    const closed = issues.filter(i => i.state === 'closed').length;
    
    // 标签统计
    const byLabel = {};
    issues.forEach(issue => {
      issue.labels?.forEach(label => {
        byLabel[label.name] = (byLabel[label.name] || 0) + 1;
      });
    });
    
    // 平均解决时间
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    
    issues.filter(i => i.state === 'closed' && i.created_at && i.closed_at).forEach(issue => {
      const created = new Date(issue.created_at).getTime();
      const closed = new Date(issue.closed_at).getTime();
      const duration = (closed - created) / (1000 * 60 * 60); // 小时
      totalResolutionTime += duration;
      resolvedCount++;
    });
    
    const avgResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;
    
    // 按月份统计
    const byMonth = {};
    issues.forEach(issue => {
      const month = issue.created_at?.substring(0, 7);
      if (month) {
        if (!byMonth[month]) {
          byMonth[month] = { created: 0, closed: 0 };
        }
        byMonth[month].created++;
        if (issue.state === 'closed') {
          byMonth[month].closed++;
        }
      }
    });
    
    return {
      total: issues.length,
      open,
      closed,
      openRate: ((open / issues.length) * 100).toFixed(1) + '%',
      byLabel: Object.entries(byLabel)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      avgResolutionTime: avgResolutionTime > 24 
        ? (avgResolutionTime / 24).toFixed(1) + ' days'
        : avgResolutionTime.toFixed(1) + ' hours',
      byMonth: Object.entries(byMonth)
        .map(([month, stats]) => ({ month, ...stats }))
        .sort((a, b) => a.month.localeCompare(b.month))
    };
  }

  analyzePullRequests(prs) {
    if (!prs || prs.length === 0) {
      return { total: 0, open: 0, merged: 0, closed: 0 };
    }
    
    const open = prs.filter(p => p.state === 'open').length;
    const merged = prs.filter(p => p.merged_at).length;
    const closed = prs.filter(p => p.state === 'closed' && !p.merged_at).length;
    
    // 平均合并时间
    let totalMergeTime = 0;
    let mergedCount = 0;
    
    prs.filter(p => p.merged_at).forEach(pr => {
      const created = new Date(pr.created_at).getTime();
      const merged = new Date(pr.merged_at).getTime();
      totalMergeTime += (merged - created) / (1000 * 60 * 60);
      mergedCount++;
    });
    
    return {
      total: prs.length,
      open,
      merged,
      closed,
      mergeRate: ((merged / prs.length) * 100).toFixed(1) + '%',
      avgMergeTime: mergedCount > 0 
        ? (totalMergeTime / mergedCount / 24).toFixed(1) + ' days'
        : 'N/A',
      byAuthor: this.aggregatePRsByAuthor(prs)
    };
  }

  aggregatePRsByAuthor(prs) {
    const byAuthor = {};
    prs.forEach(pr => {
      const author = pr.user?.login || 'unknown';
      if (!byAuthor[author]) {
        byAuthor[author] = { total: 0, merged: 0 };
      }
      byAuthor[author].total++;
      if (pr.merged_at) {
        byAuthor[author].merged++;
      }
    });
    
    return Object.entries(byAuthor)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.total - a.total);
  }

  analyzeContributors(contributors) {
    if (!contributors || contributors.length === 0) {
      return [];
    }
    
    return contributors.map(c => ({
      name: c.author?.login || 'unknown',
      commits: c.total,
      additions: c.weeks?.reduce((sum, w) => sum + (w.a || 0), 0) || 0,
      deletions: c.weeks?.reduce((sum, w) => sum + (w.d || 0), 0) || 0,
      activeWeeks: c.weeks?.filter(w => w.c > 0).length || 0
    })).sort((a, b) => b.commits - a.commits);
  }

  analyzeLanguages(languages) {
    const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    
    return Object.entries(languages)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: ((bytes / total) * 100).toFixed(1) + '%'
      }))
      .sort((a, b) => b.bytes - a.bytes);
  }

  async fetchTrafficData(owner, repo) {
    // 需要仓库访问权限
    const [views, clones] = await Promise.all([
      this.fetchAPI(`/repos/${owner}/${repo}/traffic/views`).catch(() => null),
      this.fetchAPI(`/repos/${owner}/${repo}/traffic/clones`).catch(() => null)
    ]);
    
    return {
      views: views ? {
        count: views.count,
        uniques: views.uniques,
        daily: views.views || []
      } : null,
      clones: clones ? {
        count: clones.count,
        uniques: clones.uniques,
        daily: clones.clones || []
      } : null
    };
  }

  calculateHealthScore(data) {
    const { stats, commitAnalysis, issueAnalysis, prAnalysis } = data;
    let score = 50;
    
    // 活跃度加分
    if (commitAnalysis.recentActivity > 10) score += 15;
    else if (commitAnalysis.recentActivity > 5) score += 10;
    else if (commitAnalysis.recentActivity > 0) score += 5;
    
    // Issue 解决率
    const issueResolutionRate = parseFloat(issueAnalysis.openRate) || 0;
    if (issueResolutionRate < 30) score += 10;
    else if (issueResolutionRate < 50) score += 5;
    
    // PR 合并率
    const mergeRate = parseFloat(prAnalysis.mergeRate) || 0;
    if (mergeRate > 80) score += 10;
    else if (mergeRate > 60) score += 5;
    
    // Stars 加分
    if (stats.stars > 1000) score += 10;
    else if (stats.stars > 100) score += 5;
    
    // 文档存在性
    if (stats.topics?.includes('documentation')) score += 5;
    
    return Math.min(100, Math.max(0, score));
  }

  generateRecommendations(data) {
    const { stats, commitAnalysis, issueAnalysis, prAnalysis } = data;
    const recommendations = [];
    
    if (commitAnalysis.recentActivity === 0) {
      recommendations.push({
        priority: 'high',
        message: '仓库近期无提交活动，考虑制定定期更新计划'
      });
    }
    
    if (parseFloat(issueAnalysis.openRate) > 50) {
      recommendations.push({
        priority: 'medium',
        message: '未解决的Issue占比较高，建议优先处理旧Issue'
      });
    }
    
    if (prAnalysis.avgMergeTime.includes('7')) {
      recommendations.push({
        priority: 'medium',
        message: 'PR合并周期较长，建议优化Code Review流程'
      });
    }
    
    if (!stats.topics || stats.topics.length === 0) {
      recommendations.push({
        priority: 'low',
        message: '为仓库添加topics标签以提高可发现性'
      });
    }
    
    return recommendations;
  }

  // ========== 批量分析 ==========
  
  async analyzeUserProfile(username) {
    const [user, repos, events] = await Promise.all([
      this.fetchUser(username),
      this.fetchUserRepos(username),
      this.fetchUserEvents(username)
    ]);
    
    if (!user) {
      return { error: 'User not found' };
    }
    
    // 语言统计
    const languageStats = {};
    repos.forEach(repo => {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      }
    });
    
    // 活动分析
    const eventTypes = {};
    (events || []).forEach(event => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    });
    
    // 计算贡献活跃度
    const recentEvents = (events || []).filter(e => {
      const eventDate = new Date(e.created_at);
      return (Date.now() - eventDate.getTime()) < 30 * 24 * 60 * 60 * 1000;
    });
    
    return {
      profile: {
        username: user.login,
        name: user.name,
        bio: user.bio,
        company: user.company,
        location: user.location,
        blog: user.blog,
        followers: user.followers,
        following: user.following,
        publicRepos: user.public_repos,
        createdAt: user.created_at
      },
      repositories: {
        total: repos.length,
        stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
        forks: repos.reduce((sum, r) => sum + r.forks_count, 0),
        topRepos: repos
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 5)
          .map(r => ({
            name: r.name,
            stars: r.stargazers_count,
            forks: r.forks_count,
            language: r.language
          }))
      },
      languages: Object.entries(languageStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      activity: {
        recentEvents: recentEvents.length,
        eventTypes: Object.entries(eventTypes)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      },
      contributionScore: this.calculateContributionScore({
        repos,
        recentEvents,
        followers: user.followers
      })
    };
  }

  calculateContributionScore(data) {
    const { repos, recentEvents, followers } = data;
    let score = 0;
    
    // 仓库数量
    score += Math.min(repos.length * 2, 20);
    
    // 最近活动
    score += Math.min(recentEvents.length, 30);
    
    // 关注者
    score += Math.min(followers / 10, 20);
    
    // 总stars
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    score += Math.min(totalStars / 5, 30);
    
    return Math.min(100, Math.round(score));
  }

  // ========== 报告生成 ==========
  
  generateReport(owner, repo) {
    const analysis = this.analyzeRepository(owner, repo);
    return analysis;
  }

  // ========== 辅助方法 ==========
  
  clearCache() {
    this.cache.clear();
  }

  exportData() {
    return JSON.stringify({
      repositories: Array.from(this.repositories.entries()),
      commits: this.commits,
      issues: this.issues,
      pullRequests: this.pullRequests,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubStats;
}

if (typeof window !== 'undefined') {
  window.GitHubStats = GitHubStats;
}
