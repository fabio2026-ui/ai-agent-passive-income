import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Habit, CheckIn, User, Reward, Achievement, AIInsight } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { format, startOfDay, isSameDay, subDays } from 'date-fns'

interface AppState {
  // User
  user: User
  updateUser: (updates: Partial<User>) => void
  
  // Habits
  habits: Habit[]
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  archiveHabit: (id: string) => void
  
  // Check-ins
  checkIns: CheckIn[]
  checkIn: (habitId: string, note?: string, mood?: 'great' | 'good' | 'neutral' | 'bad') => void
  uncheckIn: (habitId: string, date: string) => void
  getTodayCheckIns: () => CheckIn[]
  getCheckInsForDate: (date: string) => CheckIn[]
  getHabitStreak: (habitId: string) => number
  
  // Rewards
  rewards: Reward[]
  claimReward: (rewardId: string) => boolean
  
  // Achievements
  achievements: Achievement[]
  updateAchievementProgress: (id: string, progress: number) => void
  
  // AI Insights
  insights: AIInsight[]
  addInsight: (insight: Omit<AIInsight, 'id' | 'createdAt'>) => void
  markInsightAsRead: (id: string) => void
  
  // Stats
  getWeeklyStats: () => { date: string; completed: number; total: number }[]
  getCompletionRate: () => number
}

const defaultUser: User = {
  id: uuidv4(),
  name: '习惯达人',
  subscription: 'free',
  streakDays: 0,
  totalPoints: 0,
  currentLevel: 1,
  joinedAt: new Date().toISOString(),
}

const defaultRewards: Reward[] = [
  { id: uuidv4(), name: '休息日', description: '跳过一天不打破连续记录', icon: '☕', pointsCost: 100, claimed: false },
  { id: uuidv4(), name: '主题皮肤', description: '解锁一款限定主题', icon: '🎨', pointsCost: 200, claimed: false },
  { id: uuidv4(), name: '高级统计', description: '查看详细数据分析', icon: '📊', pointsCost: 300, claimed: false },
  { id: uuidv4(), name: 'AI教练', description: '获得7天AI个性化指导', icon: '🤖', pointsCost: 500, claimed: false },
]

const defaultAchievements: Achievement[] = [
  { id: uuidv4(), name: '初次打卡', description: '完成第一次习惯打卡', icon: '🎯', progress: 0, target: 1 },
  { id: uuidv4(), name: '连续3天', description: '连续打卡3天', icon: '🔥', progress: 0, target: 3 },
  { id: uuidv4(), name: '连续7天', description: '连续打卡一周', icon: '⭐', progress: 0, target: 7 },
  { id: uuidv4(), name: '连续30天', description: '连续打卡一个月', icon: '👑', progress: 0, target: 30 },
  { id: uuidv4(), name: '习惯大师', description: '累计完成100次打卡', icon: '🏆', progress: 0, target: 100 },
  { id: uuidv4(), name: '早起鸟', description: '在早上8点前完成打卡', icon: '🌅', progress: 0, target: 10 },
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: defaultUser,
      habits: [],
      checkIns: [],
      rewards: defaultRewards,
      achievements: defaultAchievements,
      insights: [],

      // User actions
      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),

      // Habit actions
      addHabit: (habit) => set((state) => ({
        habits: [...state.habits, {
          ...habit,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        }]
      })),

      updateHabit: (id, updates) => set((state) => ({
        habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h)
      })),

      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter(h => h.id !== id),
        checkIns: state.checkIns.filter(c => c.habitId !== id)
      })),

      archiveHabit: (id) => set((state) => ({
        habits: state.habits.map(h => h.id === id ? { ...h, archived: true } : h)
      })),

      // Check-in actions
      checkIn: (habitId, note, mood) => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const existingCheckIn = get().checkIns.find(
          c => c.habitId === habitId && c.date === today
        )

        if (existingCheckIn) {
          set((state) => ({
            checkIns: state.checkIns.map(c =>
              c.id === existingCheckIn.id
                ? { ...c, completed: true, note, mood }
                : c
            )
          }))
        } else {
          set((state) => ({
            checkIns: [...state.checkIns, {
              id: uuidv4(),
              habitId,
              date: today,
              completed: true,
              note,
              mood,
              createdAt: new Date().toISOString(),
            }],
            user: {
              ...state.user,
              totalPoints: state.user.totalPoints + 10
            }
          }))
        }

        // Check achievements
        const totalCheckIns = get().checkIns.filter(c => c.completed).length + 1
        const streak = get().getHabitStreak(habitId)
        
        set((state) => ({
          achievements: state.achievements.map(a => {
            if (a.name === '初次打卡' && totalCheckIns >= 1) {
              return { ...a, progress: 1, unlockedAt: a.unlockedAt || new Date().toISOString() }
            }
            if (a.name === '连续3天' && streak >= 3) {
              return { ...a, progress: streak, unlockedAt: a.unlockedAt || new Date().toISOString() }
            }
            if (a.name === '连续7天' && streak >= 7) {
              return { ...a, progress: streak, unlockedAt: a.unlockedAt || new Date().toISOString() }
            }
            if (a.name === '连续30天' && streak >= 30) {
              return { ...a, progress: streak, unlockedAt: a.unlockedAt || new Date().toISOString() }
            }
            if (a.name === '习惯大师') {
              return { ...a, progress: totalCheckIns }
            }
            return a
          })
        }))
      },

      uncheckIn: (habitId, date) => set((state) => ({
        checkIns: state.checkIns.filter(
          c => !(c.habitId === habitId && c.date === date)
        )
      })),

      getTodayCheckIns: () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        return get().checkIns.filter(c => c.date === today)
      },

      getCheckInsForDate: (date) => {
        return get().checkIns.filter(c => c.date === date)
      },

      getHabitStreak: (habitId) => {
        const checkIns = get().checkIns
          .filter(c => c.habitId === habitId && c.completed)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        if (checkIns.length === 0) return 0
        
        let streak = 0
        let currentDate = new Date()
        
        // Check if checked in today
        const todayCheckIn = checkIns.find(c => c.date === format(currentDate, 'yyyy-MM-dd'))
        if (!todayCheckIn) {
          // Check if checked in yesterday
          const yesterdayCheckIn = checkIns.find(
            c => c.date === format(subDays(currentDate, 1), 'yyyy-MM-dd')
          )
          if (!yesterdayCheckIn) return 0
          currentDate = subDays(currentDate, 1)
        }
        
        for (const checkIn of checkIns) {
          if (checkIn.date === format(currentDate, 'yyyy-MM-dd')) {
            streak++
            currentDate = subDays(currentDate, 1)
          } else {
            break
          }
        }
        
        return streak
      },

      // Reward actions
      claimReward: (rewardId) => {
        const reward = get().rewards.find(r => r.id === rewardId)
        if (!reward || reward.claimed || get().user.totalPoints < reward.pointsCost) {
          return false
        }
        
        set((state) => ({
          rewards: state.rewards.map(r =>
            r.id === rewardId ? { ...r, claimed: true, claimedAt: new Date().toISOString() } : r
          ),
          user: {
            ...state.user,
            totalPoints: state.user.totalPoints - reward.pointsCost
          }
        }))
        return true
      },

      // Achievement actions
      updateAchievementProgress: (id, progress) => set((state) => ({
        achievements: state.achievements.map(a =>
          a.id === id ? { ...a, progress: Math.min(progress, a.target) } : a
        )
      })),

      // AI Insight actions
      addInsight: (insight) => set((state) => ({
        insights: [{
          ...insight,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        }, ...state.insights].slice(0, 50)
      })),

      markInsightAsRead: (id) => set((state) => ({
        insights: state.insights.map(i =>
          i.id === id ? { ...i, read: true } : i
        )
      })),

      // Stats
      getWeeklyStats: () => {
        const stats = []
        for (let i = 6; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
          const dayCheckIns = get().checkIns.filter(c => c.date === date && c.completed)
          const totalHabits = get().habits.filter(h => !h.archived).length
          stats.push({
            date,
            completed: dayCheckIns.length,
            total: totalHabits
          })
        }
        return stats
      },

      getCompletionRate: () => {
        const totalCheckIns = get().checkIns.filter(c => c.completed).length
        const totalDays = Math.max(1, get().habits.length * 7)
        return Math.round((totalCheckIns / totalDays) * 100)
      },
    }),
    {
      name: 'habit-ai-storage',
    }
  )
)
