#!/usr/bin/env node
/**
 * 全自动内容生成系统
 * 小七AI Agent - 无需人工干预
 */

const https = require('https');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-c3736597ad1d4135af3e4e4b5a19bfd5';

// 内容主题池
const TOPICS = [
  { keyword: 'XSS攻击防护', category: 'security', angle: '实战指南' },
  { keyword: 'SQL注入检测', category: 'security', angle: '自动化工具' },
  { keyword: 'API安全最佳实践', category: 'security', angle: '2025指南' },
  { keyword: '供应链攻击防范', category: 'security', angle: '企业级方案' },
  { keyword: '零信任架构', category: 'architecture', angle: '实施手册' },
  { keyword: 'Docker安全扫描', category: 'devops', angle: 'CI/CD集成' },
  { keyword: 'React安全开发', category: 'frontend', angle: '常见漏洞' },
  { keyword: 'Node.js安全加固', category: 'backend', angle: '生产环境' }
];

// 调用DeepSeek API生成内容
async function generateContent(topic) {
  const prompt = `写一篇关于"${topic.keyword}"的技术博客文章。
角度：${topic.angle}
类别：${topic.category}

要求：
1. 1500-2000字
2. 包含代码示例
3. 实用性强，读者能立即应用
4. SEO优化，包含关键词"${topic.keyword}","cybersecurity","2025"
5. 语气专业但易懂

格式：
- 标题 (H1)
- 简介
- 3-4个主要章节 (H2)
- 代码示例 (使用代码块)
- 总结
- 行动号召 (CTA)`;

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一位资深网络安全专家和技术作家。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const options = {
      hostname: 'api.deepseek.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.choices && result.choices[0]) {
            resolve(result.choices[0].message.content);
          } else {
            reject(new Error('Invalid API response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 生成Twitter/X帖子
async function generateTweet(topic) {
  const prompt = `为"${topic.keyword}"生成5条Twitter/X帖子。

要求：
1. 每条280字符以内
2. 包含相关hashtag
3. 有吸引力，能引发互动
4. 适合技术/安全领域受众

输出格式：
帖子1: [内容]
帖子2: [内容]
...`;

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是社交媒体营销专家，专注于技术领域。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    const options = {
      hostname: 'api.deepseek.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.choices && result.choices[0]) {
            resolve(result.choices[0].message.content);
          } else {
            reject(new Error('Invalid API response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 主执行函数
async function main() {
  console.log('🚀 启动全自动内容生成系统\n');
  console.log(`📊 计划生成: ${TOPICS.length} 篇文章 + ${TOPICS.length * 5} 条推文\n`);

  const results = {
    articles: [],
    tweets: [],
    errors: []
  };

  // 生成文章
  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    console.log(`\n[${i + 1}/${TOPICS.length}] 生成文章: ${topic.keyword}`);
    
    try {
      const content = await generateContent(topic);
      results.articles.push({
        topic: topic.keyword,
        category: topic.category,
        content: content,
        timestamp: new Date().toISOString()
      });
      console.log(`  ✅ 文章生成成功 (${content.length} 字符)`);
      
      // 保存到文件
      const fs = require('fs');
      const filename = `content/article_${Date.now()}_${topic.keyword.replace(/\s+/g, '_')}.md`;
      if (!fs.existsSync('content')) fs.mkdirSync('content');
      fs.writeFileSync(filename, content);
      console.log(`  💾 已保存: ${filename}`);
    } catch (error) {
      console.error(`  ❌ 失败: ${error.message}`);
      results.errors.push({ type: 'article', topic: topic.keyword, error: error.message });
    }

    // 延迟避免限流
    await new Promise(r => setTimeout(r, 2000));
  }

  // 生成推文
  console.log('\n\n📱 生成社交媒体内容...');
  for (let i = 0; i < 3; i++) {  // 先生成3个主题的推文
    const topic = TOPICS[i];
    console.log(`\n[${i + 1}/3] 生成推文: ${topic.keyword}`);
    
    try {
      const tweets = await generateTweet(topic);
      results.tweets.push({
        topic: topic.keyword,
        content: tweets,
        timestamp: new Date().toISOString()
      });
      console.log(`  ✅ 推文生成成功`);
    } catch (error) {
      console.error(`  ❌ 失败: ${error.message}`);
      results.errors.push({ type: 'tweet', topic: topic.keyword, error: error.message });
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  // 输出总结
  console.log('\n\n' + '='.repeat(50));
  console.log('📊 执行完成总结');
  console.log('='.repeat(50));
  console.log(`✅ 文章: ${results.articles.length}/${TOPICS.length}`);
  console.log(`✅ 推文: ${results.tweets.length}/3`);
  console.log(`❌ 错误: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ 错误详情:');
    results.errors.forEach(e => console.log(`  - ${e.type}: ${e.topic}`));
  }

  // 保存结果汇总
  const fs = require('fs');
  const summary = {
    timestamp: new Date().toISOString(),
    totalTopics: TOPICS.length,
    articlesGenerated: results.articles.length,
    tweetsGenerated: results.tweets.length,
    errors: results.errors.length,
    topics: TOPICS.map(t => t.keyword)
  };
  if (!fs.existsSync('output')) fs.mkdirSync('output');
  fs.writeFileSync(`output/content_gen_${Date.now()}.json`, JSON.stringify(summary, null, 2));

  console.log('\n🎯 下一步:');
  console.log('  1. 审核生成的内容');
  console.log('  2. 发布到博客/社交媒体');
  console.log('  3. 追踪表现数据');
}

main().catch(console.error);
