export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  profile?: UserProfile
}

export interface UserProfile {
  age: number
  gender: 'male' | 'female' | 'other'
  height: number // cm
  weight: number // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'build_muscle'
  targetWeight?: number
  dietaryRestrictions: string[]
  allergies: string[]
  preferredCuisines: string[]
}

export interface NutritionGoals {
  calories: number
  protein: number // g
  carbs: number // g
  fat: number // g
  fiber: number // g
  water: number // ml
}

export interface MealEntry {
  id: string
  userId: string
  name: string
  imageUrl?: string
  timestamp: string
  foods: FoodItem[]
  totalNutrition: NutritionInfo
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  notes?: string
}

export interface FoodItem {
  id: string
  name: string
  quantity: number
  unit: string
  nutritionPer100g: NutritionInfo
  nutrition: NutritionInfo
}

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  saturatedFat: number
  cholesterol: number
  calcium?: number
  iron?: number
  vitaminC?: number
  vitaminA?: number
}

export interface DailySummary {
  date: string
  totalNutrition: NutritionInfo
  meals: MealEntry[]
  goals: NutritionGoals
  progress: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    water: number
  }
}

export interface DietAdvice {
  id: string
  userId: string
  type: 'meal_suggestion' | 'nutrition_tip' | 'goal_progress' | 'warning'
  title: string
  content: string
  recommendations?: string[]
  mealPlan?: MealPlanSuggestion
  createdAt: string
  isRead: boolean
}

export interface MealPlanSuggestion {
  meals: {
    type: string
    name: string
    calories: number
    protein: number
    carbs: number
    fat: number
    ingredients: string[]
    instructions: string[]
  }[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export interface Subscription {
  id: string
  userId: string
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  plan: 'monthly' | 'yearly'
  startDate: string
  endDate: string
  price: number
  currency: string
  stripeSubscriptionId?: string
  stripeCustomerId?: string
}

export interface FoodAnalysisResult {
  foods: FoodItem[]
  totalNutrition: NutritionInfo
  confidence: number
  suggestions?: string[]
}
