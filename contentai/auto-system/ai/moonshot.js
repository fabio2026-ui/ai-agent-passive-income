/**
 * ContentAI 自动化系统 - Moonshot AI 内容生成模块
 * 集成 Kimi/Moonshot API 实现 AI 内容生成
 */

import { CONFIG, CONTENT_CONFIG } from '../shared/config.js';
import { log, retry } from '../shared/utils.js';

/**
 * 构建内容生成提示词
 */
export function buildPrompt(contentType, topic, requirements = '', wordCount = 500, tone = '') {
  const config = CONTENT_CONFIG[contentType] || CONTENT_CONFIG.blog_post;
  const selectedTone = tone || config.defaultTone;
  
  // 针对不同内容类型的特殊要求
  const typeSpecificInstructions = {
    blog_post: `要求：
- 使用吸引人的标题
- 文章结构清晰，包含引言、主体、结论
- 使用小标题组织内容
- 包含实用的见解或观点
- 字数：约 ${wordCount} 词`,

    product_desc: `要求：
- 突出产品核心卖点和独特价值
- 描述产品如何解决用户痛点
- 使用有说服力的语言
- 包含产品规格和功能亮点
- 字数：约 ${wordCount} 词`,

    social_post: `要求：
- 开头要有吸引力，抓住注意力
- 使用相关的 hashtag（3-5个）
- 适合社交媒体分享
- 可以包含表情符号增加互动性
- 字数：约 ${wordCount} 词`,

    email_copy: `要求：
- 主题行吸引人且相关
- 正文有清晰的行动召唤 (CTA)
- 语言友好且有说服力
- 适合邮件阅读习惯
- 字数：约 ${wordCount} 词`,

    ad_copy: `要求：
- 简短有力，直击要点
- 突出价值主张
- 包含明确的行动召唤
- 适合广告投放
- 字数：约 ${wordCount} 词`,

    seo_article: `要求：
- 自然融入关键词
- 文章结构对SEO友好（标题标签、段落等）
- 提供有价值的信息
- 适合搜索引擎优化
- 字数：约 ${wordCount} 词`,

    video_script: `要求：
- 包含场景描述和旁白
- 标注视觉元素和转场
- 时长与字数匹配
- 适合视频制作
- 字数：约 ${wordCount} 词`,

    whitepaper: `要求：
- 结构严谨，逻辑清晰
- 包含数据支撑和引用
- 专业学术写作风格
- 适合B2B和专业读者
- 字数：约 ${wordCount} 词`
  };

  const prompt = `你是一位专业的内容创作者。请${config.prompt}。

主题：${topic}
${requirements ? `额外要求：${requirements}` : ''}

语气风格：${selectedTone}

${typeSpecificInstructions[contentType] || typeSpecificInstructions.blog_post}

请直接输出内容，不要包含"以下是..."等开场白。`;

  return prompt;
}

/**
 * 调用 Moonshot API 生成内容
 */
export async function generateContent(prompt, options = {}) {
  const {
    model = 'moonshot-v1-8k',
    temperature = 0.7,
    maxTokens = 4000,
    apiKey = CONFIG.MOONSHOT_API_KEY
  } = options;
  
  if (!apiKey) {
    throw new Error('Moonshot API key not configured');
  }
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(CONFIG.MOONSHOT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional content writer who creates high-quality, engaging content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Moonshot API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    const generationTime = Date.now() - startTime;
    
    const generatedText = data.choices?.[0]?.message?.content;
    const tokensUsed = data.usage?.total_tokens || 0;
    
    if (!generatedText) {
      throw new Error('No content generated');
    }
    
    log('info', 'Content generated successfully', {
      model,
      tokensUsed,
      generationTime,
      contentLength: generatedText.length
    });
    
    return {
      success: true,
      content: generatedText,
      tokensUsed,
      generationTime,
      model,
      finishReason: data.choices?.[0]?.finish_reason
    };
    
  } catch (error) {
    log('error', 'Content generation failed', { error: error.message });
    
    return {
      success: false,
      error: error.message,
      generationTime: Date.now() - startTime
    };
  }
}

/**
 * 生成内容并记录到数据库
 */
export async function generateAndSave(order, db) {
  const { 
    id: orderId, 
    content_type, 
    topic, 
    requirements, 
    word_count,
    email 
  } = order;
  
  // 更新订单状态为生成中
  await db.updateOrderStatus(orderId, 'generating');
  
  // 构建提示词
  const prompt = buildPrompt(content_type, topic, requirements, word_count);
  
  // 创建生成记录
  const generationId = `GEN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  await db.createGeneration({
    id: generationId,
    order_id: orderId,
    prompt,
    created_at: new Date().toISOString()
  });
  
  try {
    // 调用 AI 生成
    const result = await retry(
      () => generateContent(prompt, { maxTokens: word_count * 2 }),
      3,
      2000
    );
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    // 更新生成记录
    await db.updateGeneration(generationId, {
      generated_text: result.content,
      tokens_used: result.tokensUsed,
      generation_time_ms: result.generationTime,
      model: result.model,
      status: 'completed',
      completed_at: new Date().toISOString()
    });
    
    // 更新订单
    await db.updateOrderStatus(orderId, 'completed', {
      generated_content: result.content,
      content_id: generationId,
      completed_at: new Date().toISOString()
    });
    
    log('info', 'Content generated and saved', {
      orderId,
      generationId,
      contentLength: result.content.length
    });
    
    return {
      success: true,
      orderId,
      content: result.content,
      generationId
    };
    
  } catch (error) {
    // 更新生成记录为失败
    await db.updateGeneration(generationId, {
      status: 'failed',
      error_message: error.message,
      completed_at: new Date().toISOString()
    });
    
    // 更新订单状态为失败，增加重试计数
    const retryCount = (order.retry_count || 0) + 1;
    await db.updateOrderStatus(orderId, retryCount >= 3 ? 'failed' : 'paid', {
      retry_count: retryCount
    });
    
    log('error', 'Content generation failed', {
      orderId,
      error: error.message,
      retryCount
    });
    
    return {
      success: false,
      orderId,
      error: error.message
    };
  }
}

/**
 * 批量生成内容（用于后台处理）
 */
export async function processPendingGenerations(db, limit = 5) {
  const pendingOrders = await db.getPaidOrders(limit);
  
  const results = [];
  
  for (const order of pendingOrders) {
    const result = await generateAndSave(order, db);
    results.push(result);
    
    // 避免触发 API 限流
    if (pendingOrders.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * 估算生成时间
 */
export function estimateGenerationTime(wordCount) {
  // 基于历史数据的简单估算
  // 假设：每 100 词需要约 2 秒
  const baseTime = 2000; // 2秒基础时间
  const timePerWord = 20; // 每词约 20ms
  
  return Math.min(baseTime + wordCount * timePerWord, 30000); // 最多 30 秒
}

export default {
  buildPrompt,
  generateContent,
  generateAndSave,
  processPendingGenerations,
  estimateGenerationTime
};
