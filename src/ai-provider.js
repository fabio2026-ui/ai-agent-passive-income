// AI Provider with Kimi/Moonshot API Support
// 使用Kimi API驱动所有AI Agent项目

class AIProvider {
  constructor(config) {
    this.provider = config.provider || 'kimi';
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.moonshot.cn/v1';
    this.model = config.model || 'moonshot-v1-8k';
  }

  async generateContent(prompt, options = {}) {
    switch (this.provider) {
      case 'kimi':
      case 'moonshot':
        return this.callKimi(prompt, options);
      case 'deepseek':
        return this.callDeepSeek(prompt, options);
      case 'claude':
        return this.callClaude(prompt, options);
      case 'openai':
        return this.callOpenAI(prompt, options);
      case 'gemini':
        return this.callGemini(prompt, options);
      default:
        throw new Error(`Unknown provider: ${this.provider}`);
    }
  }

  // Kimi/Moonshot API - 月之暗面
  async callKimi(prompt, options) {
    const axios = require('axios');
    
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: options.model || this.model || 'moonshot-v1-8k',
        messages: [
          { role: 'system', content: '你是专业的网络安全专家和技术写作助手。' },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  }

  // DeepSeek API - 深度求索
  async callDeepSeek(prompt, options) {
    const axios = require('axios');
    
    const response = await axios.post(
      `${this.baseUrl || 'https://api.deepseek.com'}/chat/completions`,
      {
        model: options.model || this.model || 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是专业的网络安全专家和技术写作助手。' },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  }

  // 其他API保持兼容
  async callClaude(prompt, options) {
    const axios = require('axios');
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: options.model || 'claude-3-7-sonnet-20250219',
        max_tokens: options.maxTokens || 4000,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.content[0].text;
  }

  async callOpenAI(prompt, options) {
    const axios = require('axios');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: options.model || 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  }

  async callGemini(prompt, options) {
    const axios = require('axios');
    const model = options.model || 'gemini-2.0-flash-exp';
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  }
}

module.exports = AIProvider;