#!/usr/bin/env node
// AI Agent Orchestrator - 模拟模式 (无API也能运行)

const AIProvider = require('./src/ai-provider.js');

class AIOrchestrator {
  constructor() {
    this.ai = null;
    this.agents = {};
    this.status = {};
    this.mockMode = false;
    
    this.config = {
      provider: process.env.AI_PROVIDER || 'kimi',
      apiKey: process.env.AI_API_KEY || process.env.KIMI_API_KEY || process.env.DEEPSEEK_API_KEY,
      baseUrl: process.env.AI_BASE_URL || 'https://api.moonshot.cn/v1',
      model: process.env.AI_MODEL || 'moonshot-v1-8k'
    };
  }

  async initialize() {
    console.log('🚀 启动 AI Agent 集群\n');
    console.log(`提供商: ${this.config.provider}`);
    console.log(`模型: ${this.config.model}\n`);

    if (!this.config.apiKey) {
      console.log('⚠️  未配置 API Key - 进入模拟模式\n');
      this.mockMode = true;
    } else {
      try {
        this.ai = new AIProvider(this.config);
        console.log('✅ AI Provider 初始化成功\n');
      } catch (error) {
        console.log('⚠️  API 连接失败 - 进入模拟模式\n');
        this.mockMode = true;
      }
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
        console.log('\n📝 内容工厂运行中...');
        if (this.mockMode) {
          console.log('  [模拟] 生成文章: XSS攻击防护指南');
          console.log('  [模拟] 字数: 1500');
          console.log('  [模拟] 包含代码示例: 是');
          return { status: 'mock', title: 'XSS攻击防护指南' };
        }
        const content = await this.ai.generateContent('生成XSS防护文章');
        return { status: 'success', content };
      }
    };
    this.status.content = 'ready';
    console.log('✅ Content Factory: 就绪');

    // Social Bot
    this.agents.social = {
      name: 'Social Bot',
      run: async () => {
        console.log('\n📱 社媒机器人运行中...');
        if (this.mockMode) {
          console.log('  [模拟] 生成Twitter帖子');
          console.log('  [模拟] 字符数: 240');
          console.log('  [模拟] Hashtags: #CyberSecurity #XSS');
          return { status: 'mock', platform: 'twitter' };
        }
        const post = await this.ai.generateContent('生成Twitter帖子');
        return { status: 'success', post };
      }
    };
    this.status.social = 'ready';
    console.log('✅ Social Bot: 就绪');

    // Affiliate Bot
    this.agents.affiliate = {
      name: 'Affiliate Bot',
      run: async () => {
        console.log('\n💰 Affiliate机器人运行中...');
        if (this.mockMode) {
          console.log('  [模拟] 生成Snyk产品评测');
          console.log('  [模拟] 包含Affiliate链接: 是');
          console.log('  [模拟] 预估转化率: 3.2%');
          return { status: 'mock', product: 'Snyk' };
        }
        const review = await this.ai.generateContent('生成Snyk评测');
        return { status: 'success', review };
      }
    };
    this.status.affiliate = 'ready';
    console.log('✅ Affiliate Bot: 就绪');

    // Scan Service
    this.agents.scan = {
      name: 'Scan Service',
      run: async () => {
        console.log('\n🔍 扫描服务运行中...');
        console.log('  [模拟] 等待GitHub webhook...');
        console.log('  [模拟] 监听端口: 3000');
        return { status: 'listening', port: 3000 };
      }
    };
    this.status.scan = 'ready';
    console.log('✅ Scan Service: 就绪');
  }

  async runAll() {
    console.log('\n🎯 运行所有 AI Agents...\n');
    const results = {};

    for (const [key, agent] of Object.entries(this.agents)) {
      try {
        const result = await agent.run();
        results[key] = result.status;
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
      mode: this.mockMode ? 'mock' : 'live',
      provider: this.config.provider,
      agents: this.status,
      timestamp: new Date().toISOString()
    };
  }
}

if (require.main === module) {
  const orchestrator = new AIOrchestrator();
  
  orchestrator.initialize().then(() => {
    return orchestrator.runAll();
  }).then(() => {
    console.log('\n✅ 所有 AI Agents 完成');
    console.log('\n💡 提示: 配置 API Key 后可启用完整功能');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ 执行失败:', error);
    process.exit(1);
  });
}

module.exports = AIOrchestrator;