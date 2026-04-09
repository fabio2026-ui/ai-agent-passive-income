import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DietAdvice, UserProfile, NutritionInfo, MealEntry, NutritionGoals } from '../types'
import { openaiService } from '../services'

interface AdviceState {
  advices: DietAdvice[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchAdvices: () => Promise<void>
  markAsRead: (adviceId: string) => void
  markAllAsRead: () => void
  generateAdvice: (type: string, options?: GenerateAdviceOptions) => Promise<DietAdvice | null>
  generatePersonalizedAdvice: (params: PersonalizedAdviceParams) => Promise<DietAdvice | null>
  clearError: () => void
  clearCache: () => void
}

interface GenerateAdviceOptions {
  useCache?: boolean
  userData?: PersonalizedAdviceParams
}

interface PersonalizedAdviceParams {
  userProfile?: UserProfile
  todayNutrition?: NutritionInfo
  nutritionGoals?: NutritionGoals
  todayMeals?: MealEntry[]
  recentHistory?: string
}

// 默认建议数据（用于初始化或API失败时）
const defaultAdvices: DietAdvice[] = [
  {
    id: 'adv_welcome',
    userId: 'user_1',
    type: 'nutrition_tip',
    title: '👋 欢迎使用AI Diet Coach',
    content: '我是你的智能营养师，会根据你的饮食记录和目标，为你提供个性化的营养建议。开始记录你的餐食吧！',
    recommendations: [
      '每天记录三餐，获得更精准的建议',
      '设置你的健康目标和饮食偏好',
      '定期查看AI生成的营养建议',
      '保持耐心，健康改变需要时间'
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isRead: false
  }
]

export const useAdviceStore = create<AdviceState>()(
  persist(
    (set, get) => ({
      advices: defaultAdvices,
      unreadCount: 1,
      isLoading: false,
      error: null,

      fetchAdvices: async () => {
        set({ isLoading: true, error: null })
        
        try {
          // 模拟API延迟（实际应用中可能从服务器获取历史建议）
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const { advices } = get()
          const unreadCount = advices.filter(a => !a.isRead).length
          set({ unreadCount, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '获取建议失败',
            isLoading: false 
          })
        }
      },

      markAsRead: (adviceId) => {
        set((state) => {
          const updated = state.advices.map(a =>
            a.id === adviceId ? { ...a, isRead: true } : a
          )
          return {
            advices: updated,
            unreadCount: updated.filter(a => !a.isRead).length
          }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          advices: state.advices.map(a => ({ ...a, isRead: true })),
          unreadCount: 0
        }))
      },

      /**
       * 生成新的建议（基础版本，向后兼容）
       */
      generateAdvice: async (type, options = {}) => {
        const { useCache = true, userData } = options
        
        set({ isLoading: true, error: null })
        
        try {
          // 如果有提供用户数据，使用个性化建议
          if (userData) {
            const advice = await get().generatePersonalizedAdvice(userData)
            return advice
          }

          // 否则使用OpenAI服务生成建议
          const advice = await openaiService.generateNutritionAdvice({
            type,
            userId: 'user_1',
            useCache
          })

          set((state) => ({
            advices: [advice, ...state.advices],
            unreadCount: state.unreadCount + 1,
            isLoading: false
          }))

          return advice
        } catch (error) {
          console.error('生成建议失败:', error)
          set({ 
            error: error instanceof Error ? error.message : '生成建议失败',
            isLoading: false 
          })
          return null
        }
      },

      /**
       * 生成个性化营养建议（新版本，使用完整用户数据）
       */
      generatePersonalizedAdvice: async (params) => {
        set({ isLoading: true, error: null })
        
        try {
          const { 
            userProfile, 
            todayNutrition, 
            nutritionGoals, 
            todayMeals,
            recentHistory 
          } = params

          // 确定建议类型
          let adviceType: string
          if (todayMeals && todayMeals.length === 0) {
            adviceType = 'nutrition_tip'
          } else if (todayNutrition && nutritionGoals) {
            const caloriesProgress = todayNutrition.calories / nutritionGoals.calories
            if (caloriesProgress > 1.2) {
              adviceType = 'warning'
            } else if (caloriesProgress < 0.3 && todayMeals?.length > 0) {
              adviceType = 'meal_suggestion'
            } else {
              adviceType = 'nutrition_tip'
            }
          } else {
            adviceType = 'nutrition_tip'
          }

          // 调用OpenAI服务
          const advice = await openaiService.generateNutritionAdvice({
            type: adviceType,
            userId: userProfile?.id || 'user_1',
            userProfile,
            todayNutrition,
            nutritionGoals,
            todayMeals,
            recentHistory,
            useCache: true
          })

          set((state) => ({
            advices: [advice, ...state.advices],
            unreadCount: state.unreadCount + 1,
            isLoading: false
          }))

          return advice
        } catch (error) {
          console.error('生成个性化建议失败:', error)
          set({ 
            error: error instanceof Error ? error.message : '生成个性化建议失败',
            isLoading: false 
          })
          return null
        }
      },

      clearError: () => {
        set({ error: null })
      },

      clearCache: () => {
        openaiService.clearAdviceCache()
      }
    }),
    {
      name: 'advice-storage',
      partialize: (state) => ({ 
        advices: state.advices,
        unreadCount: state.unreadCount 
      })
    }
  )
)

export default useAdviceStore
