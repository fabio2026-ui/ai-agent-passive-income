// AI Agent Orchestrator - Kimi Ready
// 默认使用Kimi API，支持多提供商

const AIProvider = require('./src/ai-provider.js');

class AIOrchestrator {
  constructor() {
    this.ai = null;
    this.agents = {};
    this.status = {};
    
    // 自动检测API配置 (支持Kimi和DeepSeek)
    this.config = {
      provider: process.env.AI_PROVIDER || 'kimi',
      apiKey: process.env.AI_API_KEY || process.env.KIMI_API_KEY || process.env.DEEPSEEK_API_KEY,
      baseUrl: process.env.AI_BASE_URL || 'https://api.moonshot.cn/v1',
      model: process.env.AI_MODEL || 'moonshot-v1-8k'
    };
    
    // 如果是DeepSeek，自动调整配置
    if (process.env.AI_PROVIDER === 'deepseek' || process.env.DEEPSEEK_API_KEY) {
      this.config.provider = 'deepseek';
      this.config.baseUrl = process.env.AI_BASE_URL || 'https://api.deepseek.com';
      this.config.model = process.env.AI_MODEL || 'deepseek-chat';
    }
  }

  async initialize() {
    console.log('🚀 启动AI Agent集群 (Kimi Ready)\n');
    console.log(`提供商: ${this.config.provider}`);
    console.log(`模型: ${this.config.model}\n`);

    if (!this.config.apiKey) {
      console.log('⚠️  未配置API Key');
      console.log('');
      console.log('配置方法:');
      console.log('  export AI_API_KEY=your_kimi_key');
      console.log('');
      console.log('或使用其他API:');
      console.log('  export AI_PROVIDER=gemini');
      console.log('  export AI_API_KEY=your_gemini_key');
      return false;
    }

    try {
      this.ai = new AIProvider(this.config);
      console.log('✅ AI Provider 初始化成功\n');
    } catch (error) {
      console.error('❌ 初始化失败:', error.message);
      return false;
    }

    await this.initializeAgents();
    console.log('\n📊 系统状态:', this.status);
    return true;
  }

  async initializeAgents() {
    // Content Factory
    this.agents.content = {
      name: 'Content Factory',
      run: async () => {
        console.log('📝 运行内容工厂...');
        const prompt = `生成一篇网络安全技术文章主题：XSS攻击防护
要求：
1. 适合中文开发者
2. 包含原理、危害、防御方法
3. 1500字左右
4. 语言专业但易懂`;
        
        const content = await this.ai.generateContent(prompt);
        console.log('✅ 内容生成成功');
        return content;
      }
    };
    this.status.content = 'ready';
    console.log('✅ Content Factory: 就绪');

    // Social Bot
    this.agents.social = {
      name: 'Social Bot',
      run: async () => {
        console.log('\n📱 运行社媒机器人...');
        const prompt = `生成一条Twitter/微博帖子，关于XSS安全漏洞
要求：
1. 280字符以内
2. 引起程序员关注
3. 包含相关hashtag
4. 中文或英文`;
        
        const post = await this.ai.generateContent(prompt);
        console.log('🐦 帖子:', post.substring(0, 100));
        return post;
      }
    };
    this.status.social = 'ready';
    console.log('✅ Social Bot: 就绪');

    // Affiliate Bot
    this.agents.affiliate = {
      name: 'Affiliate Bot',
      run: async () => {
        console.log('\n💰 运行Affiliate机器人...');
        const prompt = `生成Snyk安全扫描工具的产品评测
要求：
1. 介绍产品功能
2. 列出优缺点
3. 适合什么用户
4. 自然的推荐语气
5. 800字左右`;
        
        const review = await this.ai.generateContent(prompt);
        console.log('✅ 评测生成成功');
        return review;
      }
    };
    this.status.affiliate = 'ready';
    console.log('✅ Affiliate Bot: 就绪');

    // Scan Service
    this.agents.scan = {
      name: 'Scan Service',
      run: async () => {
        console.log('\n🔍 扫描服务: 等待GitHub webhook...');
        return { status: 'listening' };
      }
    };
    this.status.scan = 'ready';
    console.log('✅ Scan Service: 就绪');
  }

  async runAll() {
    if (!this.ai) {
      console.log('❌ AI未初始化');
      return;
    }

    console.log('\n🎯 运行所有AI Agents...\n');
    const results = {};

    for (const [key, agent] of Object.entries(this.agents)) {
      try {
        await agent.run();
        results[key] = 'success';
      } catch (error) {
        console.error(`❌ ${agent.name} 失败:`, error.message);
        results[key] = 'failed';
      }
    }

    console.log('\n📊 运行结果:', results);
    return results;
  }

  getStatus() {
    return {
      provider: this.config.provider,
      model: this.config.model,
      agents: this.status,
      timestamp: new Date().toISOString()
    };
  }
}

if (require.main === module) {
  const orchestrator = new AIOrchestrator();
  
  orchestrator.initialize().then(success => {
    if (!success) {
      console.log('\n请配置API Key后重试');
      process.exit(1);
    }
    return orchestrator.runAll();
  }).then(() => {
    console.log('\n✅ 所有AI Agents完成');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ 执行失败:', error);
    process.exit(1);
  });
}

module.exports = AIOrchestrator;