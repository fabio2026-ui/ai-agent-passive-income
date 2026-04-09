export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  frequency: 'daily' | 'weekly' | 'custom'
  targetDays: number[] // 0-6 for weekly (周日到周六)
  reminderTime?: string
  createdAt: string
  archived: boolean
}

export interface CheckIn {
  id: string
  habitId: string
  date: string // YYYY-MM-DD
  completed: boolean
  note?: string
  mood?: 'great' | 'good' | 'neutral' | 'bad'
  createdAt: string
}

export interface User {
  id: string
  name: string
  avatar?: string
  email?: string
  subscription: 'free' | 'premium'
  subscriptionExpiry?: string
  streakDays: number
  totalPoints: number
  currentLevel: number
  joinedAt: string
}

export interface Reward {
  id: string
  name: string
  description: string
  icon: string
  pointsCost: number
  claimed: boolean
  claimedAt?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
  progress: number
  target: number
}

export interface AIInsight {
  id: string
  type: 'tip' | 'encouragement' | 'analysis' | 'suggestion'
  content: string
  relatedHabitId?: string
  createdAt: string
  read: boolean
}

export type Mood = 'great' | 'good' | 'neutral' | 'bad'

export interface DailyStats {
  date: string
  totalHabits: number
  completedHabits: number
  completionRate: number
}
