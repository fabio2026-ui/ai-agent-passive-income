/**
 * OpenAI Service - 营养建议生成服务
 * 封装OpenAI API调用，提供个性化营养建议生成功能
 */
import axios from 'axios';
import type { DietAdvice, UserProfile, NutritionInfo, MealEntry, NutritionGoals } from '../types';

// OpenAI API配置
const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';
const OPENAI_MODEL = 'gpt-4o-mini'; // 使用GPT-4o-mini，性价比高

// 缓存配置
interface CacheEntry {
  data: DietAdvice;
  timestamp: number;
}

const adviceCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 获取API Key
 */
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API Key未配置。请在.env文件中设置VITE_OPENAI_API_KEY');
  }
  return apiKey;
};

/**
 * 生成缓存Key
 */
const generateCacheKey = (type: string, userId: string, contextData: string): string => {
  return `${userId}_${type}_${contextData}`;
};

/**
 * 检查缓存是否有效
 */
const getCachedAdvice = (cacheKey: string): DietAdvice | null => {
  const cached = adviceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  adviceCache.delete(cacheKey);
  return null;
};

/**
 * 保存到缓存
 */
const setCachedAdvice = (cacheKey: string, advice: DietAdvice): void => {
  adviceCache.set(cacheKey, {
    data: advice,
    timestamp: Date.now()
  });
};

/**
 * 生成系统Prompt - 营养师角色设定
 */
const generateSystemPrompt = (): string => {
  return `你是一位专业的营养师和健康顾问，拥有多年临床营养学经验。

你的职责：
1. 根据用户的饮食记录、健康目标和个人资料，提供个性化的营养建议
2. 基于科学证据给出建议，避免伪科学
3. 用友善、鼓励的语气与用户交流
4. 提供具体、可执行的建议，而非泛泛而谈

输出要求：
1. 必须返回有效的JSON格式
2. 建议内容要实用、具体
3. 考虑用户的饮食限制和过敏信息
4. 建议要符合用户的健康目标（减重/维持/增肌等）`;
};

/**
 * 生成用户Prompt
 */
interface PromptData {
  type: string;
  userProfile?: UserProfile;
  todayNutrition?: NutritionInfo;
  nutritionGoals?: NutritionGoals;
  todayMeals?: MealEntry[];
  recentHistory?: string;
  language?: string;
}

const generateUserPrompt = (data: PromptData): string => {
  const { type, userProfile, todayNutrition, nutritionGoals, todayMeals, recentHistory, language = 'zh-CN' } = data;

  let prompt = `请根据以下用户信息生成一条个性化的${getAdviceTypeLabel(type)}：

`;

  // 用户基本信息
  if (userProfile) {
    prompt += `【用户基本信息】
- 年龄：${userProfile.age}岁
- 性别：${userProfile.gender === 'male' ? '男' : userProfile.gender === 'female' ? '女' : '其他'}
- 身高：${userProfile.height}cm
- 体重：${userProfile.weight}kg
- 活动水平：${getActivityLevelLabel(userProfile.activityLevel)}
- 健康目标：${getGoalLabel(userProfile.goal)}
`;
    if (userProfile.targetWeight) {
      prompt += `- 目标体重：${userProfile.targetWeight}kg\n`;
    }
    if (userProfile.dietaryRestrictions?.length > 0) {
      prompt += `- 饮食限制：${userProfile.dietaryRestrictions.join(', ')}\n`;
    }
    if (userProfile.allergies?.length > 0) {
      prompt += `- 过敏食物：${userProfile.allergies.join(', ')}\n`;
    }
    if (userProfile.preferredCuisines?.length > 0) {
      prompt += `- 偏好菜系：${userProfile.preferredCuisines.join(', ')}\n`;
    }
    prompt += '\n';
  }

  // 今日营养摄入
  if (todayNutrition && nutritionGoals) {
    prompt += `【今日营养摄入情况】
- 热量：${Math.round(todayNutrition.calories)} / ${nutritionGoals.calories} kcal (${Math.round((todayNutrition.calories / nutritionGoals.calories) * 100)}%)
- 蛋白质：${Math.round(todayNutrition.protein)} / ${nutritionGoals.protein}g (${Math.round((todayNutrition.protein / nutritionGoals.protein) * 100)}%)
- 碳水化合物：${Math.round(todayNutrition.carbs)} / ${nutritionGoals.carbs}g (${Math.round((todayNutrition.carbs / nutritionGoals.carbs) * 100)}%)
- 脂肪：${Math.round(todayNutrition.fat)} / ${nutritionGoals.fat}g (${Math.round((todayNutrition.fat / nutritionGoals.fat) * 100)}%)
- 纤维：${Math.round(todayNutrition.fiber)} / ${nutritionGoals.fiber}g (${Math.round((todayNutrition.fiber / nutritionGoals.fiber) * 100)}%)
- 钠：${Math.round(todayNutrition.sodium)}mg
- 糖：${Math.round(todayNutrition.sugar)}g
\n`;
  }

  // 今日餐食记录
  if (todayMeals && todayMeals.length > 0) {
    prompt += `【今日餐食记录】\n`;
    todayMeals.forEach((meal, index) => {
      prompt += `${index + 1}. ${getMealTypeLabel(meal.mealType)}：${meal.name} (${Math.round(meal.totalNutrition.calories)} kcal)\n`;
    });
    prompt += '\n';
  }

  // 历史记录摘要
  if (recentHistory) {
    prompt += `【近期饮食概况】\n${recentHistory}\n\n`;
  }

  // 输出格式要求
  prompt += `【输出要求】
请返回以下JSON格式的营养建议：

${getOutputFormatForType(type)}

注意事项：
1. 内容必须实用、具体、可操作
2. 标题要吸引人但专业
3. 根据用户的目标和当前摄入情况给出针对性建议
4. 如果有mealPlan，提供完整的食材和烹饪步骤
5. 使用${language === 'zh-CN' ? '中文' : 'English'}`;

  return prompt;
};

/**
 * 获取建议类型标签
 */
const getAdviceTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    meal_suggestion: '餐食建议',
    nutrition_tip: '营养知识小贴士',
    goal_progress: '目标进展分析',
    warning: '健康提醒'
  };
  return labels[type] || '营养建议';
};

/**
 * 获取活动水平标签
 */
const getActivityLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    sedentary: '久坐不动',
    light: '轻度活动',
    moderate: '中度活动',
    active: '活跃',
    very_active: '非常活跃'
  };
  return labels[level] || level;
};

/**
 * 获取目标标签
 */
const getGoalLabel = (goal: string): string => {
  const labels: Record<string, string> = {
    lose_weight: '减重',
    maintain: '维持体重',
    gain_weight: '增重',
    build_muscle: '增肌'
  };
  return labels[goal] || goal;
};

/**
 * 获取餐食类型标签
 */
const getMealTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐'
  };
  return labels[type] || type;
};

/**
 * 根据类型获取输出格式
 */
const getOutputFormatForType = (type: string): string => {
  const baseFormat = `{
  "title": "建议标题（带emoji）",
  "content": "详细的建议内容，2-3段落",
  "recommendations": ["具体可执行的建议1", "建议2", "建议3"]
}`;

  const mealFormat = `{
  "title": "餐食建议标题（带emoji）",
  "content": "为什么推荐这个餐食计划",
  "mealPlan": {
    "meals": [{
      "type": "meal_type",
      "name": "菜品名称",
      "calories": 数值,
      "protein": 数值,
      "carbs": 数值,
      "fat": 数值,
      "ingredients": ["食材1", "食材2"],
      "instructions": ["步骤1", "步骤2"]
    }],
    "totalCalories": 数值,
    "totalProtein": 数值,
    "totalCarbs": 数值,
    "totalFat": 数值
  }
}`;

  const formats: Record<string, string> = {
    meal_suggestion: mealFormat,
    nutrition_tip: baseFormat,
    goal_progress: baseFormat,
    warning: baseFormat
  };

  return formats[type] || baseFormat;
};

/**
 * 解析OpenAI响应
 */
const parseOpenAIResponse = (response: string, type: string, userId: string): DietAdvice => {
  try {
    // 尝试提取JSON（处理可能的markdown代码块）
    let jsonStr = response.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    const advice: DietAdvice = {
      id: 'adv_' + Date.now(),
      userId,
      type: type as any,
      title: parsed.title || '营养建议',
      content: parsed.content || '',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    if (parsed.recommendations) {
      advice.recommendations = parsed.recommendations;
    }

    if (parsed.mealPlan) {
      advice.mealPlan = parsed.mealPlan;
    }

    return advice;
  } catch (error) {
    console.error('解析OpenAI响应失败:', error);
    // 返回一个默认的建议
    return {
      id: 'adv_' + Date.now(),
      userId,
      type: type as any,
      title: '💡 营养建议',
      content: response.slice(0, 500),
      createdAt: new Date().toISOString(),
      isRead: false
    };
  }
};

/**
 * 生成营养建议 - 主函数
 */
export interface GenerateAdviceParams {
  type: string;
  userId: string;
  userProfile?: UserProfile;
  todayNutrition?: NutritionInfo;
  nutritionGoals?: NutritionGoals;
  todayMeals?: MealEntry[];
  recentHistory?: string;
  useCache?: boolean;
}

export const generateNutritionAdvice = async (params: GenerateAdviceParams): Promise<DietAdvice> => {
  const { type, userId, userProfile, todayNutrition, nutritionGoals, todayMeals, recentHistory, useCache = true } = params;

  // 检查缓存
  const contextData = JSON.stringify({ type, todayNutrition, todayMeals: todayMeals?.map(m => m.id) });
  const cacheKey = generateCacheKey(type, userId, contextData);
  
  if (useCache) {
    const cached = getCachedAdvice(cacheKey);
    if (cached) {
      console.log('[OpenAI Service] 返回缓存的建议');
      return cached;
    }
  }

  try {
    const apiKey = getApiKey();

    const promptData: PromptData = {
      type,
      userProfile,
      todayNutrition,
      nutritionGoals,
      todayMeals,
      recentHistory
    };

    const response = await axios.post(
      `${OPENAI_API_BASE_URL}/chat/completions`,
      {
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: generateSystemPrompt()
          },
          {
            role: 'user',
            content: generateUserPrompt(promptData)
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content || '';
    
    if (!aiResponse) {
      throw new Error('OpenAI返回空响应');
    }

    const advice = parseOpenAIResponse(aiResponse, type, userId);

    // 保存到缓存
    if (useCache) {
      setCachedAdvice(cacheKey, advice);
    }

    return advice;

  } catch (error: any) {
    console.error('[OpenAI Service] 生成建议失败:', error);
    
    // 返回备用建议
    return generateFallbackAdvice(type, userId);
  }
};

/**
 * 生成备用建议（当API调用失败时使用）
 */
const generateFallbackAdvice = (type: string, userId: string): DietAdvice => {
  const fallbacks: Record<string, Partial<DietAdvice>> = {
    meal_suggestion: {
      title: '🍽️ 健康餐食建议',
      content: '建议您选择均衡的饮食搭配，包括优质蛋白质、复合碳水化合物和健康脂肪。尝试用糙米或全麦面包替代精制谷物，多吃蔬菜和水果。',
      recommendations: [
        '每餐包含一份蛋白质（鸡胸肉、鱼、豆腐等）',
        '选择全谷物食品',
        '多吃各种颜色的蔬菜',
        '适量摄入健康脂肪如坚果、橄榄油'
      ]
    },
    nutrition_tip: {
      title: '💡 营养知识小贴士',
      content: '保持水分充足对于新陈代谢和整体健康至关重要。建议每天饮水2000-2500毫升，运动时需要额外补充。',
      recommendations: [
        '起床后先喝一杯温水',
        '餐前30分钟饮水有助消化',
        '运动时每15-20分钟补充150-200ml水',
        '避免一次性大量饮水'
      ]
    },
    goal_progress: {
      title: '📊 目标进展分析',
      content: '持续记录您的饮食是改善健康的第一步。保持规律的饮食习惯，逐步调整，不要追求过快的结果。',
      recommendations: [
        '每天记录三餐有助于了解自己的饮食模式',
        '设定小目标，每周进步一点点',
        '庆祝每一个小成就',
        '保持健康的生活方式比追求完美更重要'
      ]
    },
    warning: {
      title: '⚠️ 健康提醒',
      content: '请注意观察自己的饮食习惯，避免过度摄入加工食品和高糖饮料。均衡饮食是长期健康的基础。',
      recommendations: [
        '减少加工食品的摄入',
        '注意食品标签上的营养成分',
        '控制添加糖的摄入',
        '如有健康疑虑请咨询专业医生'
      ]
    }
  };

  const fallback = fallbacks[type] || fallbacks.nutrition_tip;

  return {
    id: 'adv_' + Date.now(),
    userId,
    type: type as any,
    title: fallback.title || '营养建议',
    content: fallback.content || '',
    recommendations: fallback.recommendations,
    createdAt: new Date().toISOString(),
    isRead: false
  };
};

/**
 * 批量生成多条建议
 */
export const generateMultipleAdvices = async (
  types: string[],
  params: Omit<GenerateAdviceParams, 'type'>
): Promise<DietAdvice[]> => {
  const promises = types.map(type => 
    generateNutritionAdvice({ ...params, type })
  );
  
  const results = await Promise.allSettled(promises);
  
  return results
    .filter((result): result is PromiseFulfilledResult<DietAdvice> => 
      result.status === 'fulfilled'
    )
    .map(result => result.value);
};

/**
 * 清除缓存
 */
export const clearAdviceCache = (): void => {
  adviceCache.clear();
  console.log('[OpenAI Service] 缓存已清除');
};

export default {
  generateNutritionAdvice,
  generateMultipleAdvices,
  clearAdviceCache
};
