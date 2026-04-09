import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MealEntry, DailySummary, NutritionGoals } from '../types'

interface MealState {
  meals: MealEntry[]
  dailySummaries: Record<string, DailySummary>
  currentDate: string
  goals: NutritionGoals
  waterIntake: number
  
  // Actions
  addMeal: (meal: Omit<MealEntry, 'id' | 'timestamp'>) => void
  removeMeal: (mealId: string) => void
  updateMeal: (mealId: string, updates: Partial<MealEntry>) => void
  setGoals: (goals: Partial<NutritionGoals>) => void
  addWater: (amount: number) => void
  getDailySummary: (date?: string) => DailySummary | null
  getMealsByDate: (date: string) => MealEntry[]
}

const defaultGoals: NutritionGoals = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 65,
  fiber: 30,
  water: 2500
}

// Generate some mock data for demo
const generateMockMeals = (): MealEntry[] => {
  const today = new Date().toISOString().split('T')[0]
  return [
    {
      id: 'meal_1',
      userId: 'user_1',
      name: '燕麦早餐碗',
      timestamp: `${today}T08:00:00Z`,
      mealType: 'breakfast',
      foods: [
        {
          id: 'food_1',
          name: '燕麦片',
          quantity: 50,
          unit: 'g',
          nutritionPer100g: {
            calories: 389,
            protein: 16.9,
            carbs: 66.3,
            fat: 6.9,
            fiber: 10.6,
            sugar: 0.9,
            sodium: 2
          },
          nutrition: {
            calories: 195,
            protein: 8.5,
            carbs: 33,
            fat: 3.5,
            fiber: 5.3,
            sugar: 0.5,
            sodium: 1
          }
        },
        {
          id: 'food_2',
          name: '蓝莓',
          quantity: 100,
          unit: 'g',
          nutritionPer100g: {
            calories: 57,
            protein: 0.7,
            carbs: 14.5,
            fat: 0.3,
            fiber: 2.4,
            sugar: 10,
            sodium: 1
          },
          nutrition: {
            calories: 57,
            protein: 0.7,
            carbs: 14.5,
            fat: 0.3,
            fiber: 2.4,
            sugar: 10,
            sodium: 1
          }
        }
      ],
      totalNutrition: {
        calories: 252,
        protein: 9.2,
        carbs: 47.5,
        fat: 3.8,
        fiber: 7.7,
        sugar: 10.5,
        sodium: 2
      }
    },
    {
      id: 'meal_2',
      userId: 'user_1',
      name: '鸡胸肉沙拉',
      timestamp: `${today}T12:30:00Z`,
      mealType: 'lunch',
      foods: [
        {
          id: 'food_3',
          name: '鸡胸肉',
          quantity: 150,
          unit: 'g',
          nutritionPer100g: {
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            fiber: 0,
            sugar: 0,
            sodium: 74
          },
          nutrition: {
            calories: 248,
            protein: 46.5,
            carbs: 0,
            fat: 5.4,
            fiber: 0,
            sugar: 0,
            sodium: 111
          }
        },
        {
          id: 'food_4',
          name: '生菜',
          quantity: 100,
          unit: 'g',
          nutritionPer100g: {
            calories: 15,
            protein: 1.4,
            carbs: 2.9,
            fat: 0.2,
            fiber: 1.3,
            sugar: 1.8,
            sodium: 28
          },
          nutrition: {
            calories: 15,
            protein: 1.4,
            carbs: 2.9,
            fat: 0.2,
            fiber: 1.3,
            sugar: 1.8,
            sodium: 28
          }
        }
      ],
      totalNutrition: {
        calories: 263,
        protein: 47.9,
        carbs: 2.9,
        fat: 5.6,
        fiber: 1.3,
        sugar: 1.8,
        sodium: 139
      }
    }
  ]
}

export const useMealStore = create<MealState>()(
  persist(
    (set, get) => ({
      meals: generateMockMeals(),
      dailySummaries: {},
      currentDate: new Date().toISOString().split('T')[0],
      goals: defaultGoals,
      waterIntake: 1200,

      addMeal: (meal) => {
        const newMeal: MealEntry = {
          ...meal,
          id: 'meal_' + Date.now(),
          timestamp: new Date().toISOString()
        }
        set((state) => ({
          meals: [...state.meals, newMeal]
        }))
      },

      removeMeal: (mealId) => {
        set((state) => ({
          meals: state.meals.filter(m => m.id !== mealId)
        }))
      },

      updateMeal: (mealId, updates) => {
        set((state) => ({
          meals: state.meals.map(m =>
            m.id === mealId ? { ...m, ...updates } : m
          )
        }))
      },

      setGoals: (goals) => {
        set((state) => ({
          goals: { ...state.goals, ...goals }
        }))
      },

      addWater: (amount) => {
        set((state) => ({
          waterIntake: state.waterIntake + amount
        }))
      },

      getDailySummary: (date = new Date().toISOString().split('T')[0]) => {
        const { meals, goals, waterIntake } = get()
        const dayMeals = meals.filter(m => 
          m.timestamp.startsWith(date)
        )

        if (dayMeals.length === 0) return null

        const totalNutrition = dayMeals.reduce(
          (acc, meal) => ({
            calories: acc.calories + meal.totalNutrition.calories,
            protein: acc.protein + meal.totalNutrition.protein,
            carbs: acc.carbs + meal.totalNutrition.carbs,
            fat: acc.fat + meal.totalNutrition.fat,
            fiber: acc.fiber + meal.totalNutrition.fiber,
            sugar: acc.sugar + meal.totalNutrition.sugar,
            sodium: acc.sodium + meal.totalNutrition.sodium
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
        )

        return {
          date,
          totalNutrition,
          meals: dayMeals,
          goals,
          progress: {
            calories: Math.min(100, Math.round((totalNutrition.calories / goals.calories) * 100)),
            protein: Math.min(100, Math.round((totalNutrition.protein / goals.protein) * 100)),
            carbs: Math.min(100, Math.round((totalNutrition.carbs / goals.carbs) * 100)),
            fat: Math.min(100, Math.round((totalNutrition.fat / goals.fat) * 100)),
            fiber: Math.min(100, Math.round((totalNutrition.fiber / goals.fiber) * 100)),
            water: Math.min(100, Math.round((waterIntake / goals.water) * 100))
          }
        }
      },

      getMealsByDate: (date) => {
        const { meals } = get()
        return meals.filter(m => m.timestamp.startsWith(date))
      }
    }),
    {
      name: 'meal-storage',
      partialize: (state) => ({ 
        meals: state.meals, 
        goals: state.goals,
        waterIntake: state.waterIntake 
      })
    }
  )
)
