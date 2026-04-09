# OpenAI API 集成说明

## 已完成的更改

### 1. 创建的文件
- `src/services/openaiService.ts` - OpenAI服务模块，封装API调用
- `src/services/index.ts` - 服务模块导出文件
- `.env.example` - 环境变量配置模板

### 2. 修改的文件
- `src/stores/adviceStore.ts` - 替换Mock实现，接入OpenAI服务

## 快速启动

### 步骤1：配置API Key

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件，填入你的OpenAI API Key
VITE_OPENAI_API_KEY=sk-your-actual-api-key
```

### 步骤2：安装依赖（如需）

项目已使用axios进行HTTP请求，无需额外安装OpenAI SDK。

### 步骤3：运行项目

```bash
npm run dev
```

## 功能特性

### ✅ 已实现
- ✅ GPT-4o-mini模型集成（性价比高）
- ✅ 智能缓存机制（5分钟缓存避免重复调用）
- ✅ API错误处理和备用建议
- ✅ 结构化JSON输出
- ✅ 营养师角色Prompt
- ✅ 支持4种建议类型：
  - `meal_suggestion` - 餐食建议
  - `nutrition_tip` - 营养小贴士
  - `goal_progress` - 目标进展
  - `warning` - 健康提醒

### 📋 建议生成参数
```typescript
{
  type: string;              // 建议类型
  userId: string;            // 用户ID
  userProfile?: UserProfile; // 用户资料
  todayNutrition?: NutritionInfo;   // 今日营养摄入
  nutritionGoals?: NutritionGoals;  // 营养目标
  todayMeals?: MealEntry[];  // 今日餐食记录
  recentHistory?: string;    // 近期饮食历史
  useCache?: boolean;        // 是否使用缓存
}
```

## 使用示例

### 基础使用
```typescript
import { useAdviceStore } from './stores/adviceStore'

const { generateAdvice, isLoading } = useAdviceStore()

// 生成一条餐食建议
const advice = await generateAdvice('meal_suggestion')
```

### 个性化建议（推荐）
```typescript
const advice = await generatePersonalizedAdvice({
  userProfile: {
    age: 30,
    gender: 'male',
    height: 175,
    weight: 70,
    activityLevel: 'moderate',
    goal: 'maintain',
    dietaryRestrictions: ['vegetarian'],
    allergies: ['nuts']
  },
  todayNutrition: {
    calories: 1200,
    protein: 60,
    carbs: 150,
    fat: 40,
    // ...其他营养数据
  },
  nutritionGoals: {
    calories: 2200,
    protein: 120,
    carbs: 250,
    fat: 70,
    fiber: 30,
    water: 2500
  },
  todayMeals: mealEntries
})
```

## API配额与成本

### 模型选择
- **GPT-4o-mini** (默认): 性价比高，约 $0.15 / 1M tokens
- **GPT-4o**: 质量更好，约 $5 / 1M tokens
- **GPT-3.5-turbo**: 经济实惠，约 $0.5 / 1M tokens

### 成本优化
1. ✅ 已启用5分钟缓存
2. ✅ 限制max_tokens为1500
3. ✅ 使用JSON mode减少token消耗

## 错误处理

如果OpenAI API调用失败，系统会自动：
1. 打印错误日志
2. 返回基于类型的预设建议（fallback）
3. 不影响用户体验

## 自定义配置

### 修改模型
编辑 `src/services/openaiService.ts`:
```typescript
const OPENAI_MODEL = 'gpt-4o'; // 或其他模型
```

### 调整缓存时间
```typescript
const CACHE_DURATION = 10 * 60 * 1000; // 改为10分钟
```

### 自定义Prompt
在 `generateSystemPrompt()` 和 `generateUserPrompt()` 函数中修改。

## 安全性注意事项

⚠️ **重要**: 
- `.env` 文件已添加到 `.gitignore`（如未添加请确保添加）
- 不要在前端暴露API Key到生产环境
- 生产环境建议使用后端代理API调用

## 下一步建议

1. 测试不同场景下的建议生成
2. 根据用户反馈优化Prompt
3. 考虑添加用户反馈收集机制
4. 生产环境建议添加后端代理层保护API Key
