import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db, DiaryEntry, EmotionType } from '../db/database'

export interface AISummary {
  id: string
  entryId: string
  summary: string
  keywords: string[]
  moodTrend: string
  insights: string[]
  createdAt: Date
}

export interface Subscription {
  isActive: boolean
  plan: 'monthly' | 'yearly' | null
  expiryDate: Date | null
  features: string[]
}

interface AppState {
  // 用户设置
  isFirstVisit: boolean
  userName: string
  dailyReminder: boolean
  reminderTime: string
  darkMode: boolean
  
  // 订阅状态
  subscription: Subscription
  
  // 当前编辑
  currentEmotion: EmotionType | null
  currentContent: string
  
  // Actions
  setFirstVisit: (value: boolean) => void
  setUserName: (name: string) => void
  setDailyReminder: (enabled: boolean) => void
  setReminderTime: (time: string) => void
  toggleDarkMode: () => void
  
  // 订阅操作
  subscribe: (plan: 'monthly' | 'yearly') => void
  cancelSubscription: () => void
  checkSubscriptionStatus: () => boolean
  
  // 日记操作
  setCurrentEmotion: (emotion: EmotionType | null) => void
  setCurrentContent: (content: string) => void
  saveEntry: () => Promise<DiaryEntry | null>
  loadSettings: () => void
  
  // AI 功能
  generateAISummary: (entryId: string) => Promise<AISummary | null>
  generateWeeklyReport: (startDate: Date, endDate: Date) => Promise<any>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isFirstVisit: true,
      userName: '',
      dailyReminder: true,
      reminderTime: '21:00',
      darkMode: false,
      
      subscription: {
        isActive: false,
        plan: null,
        expiryDate: null,
        features: []
      },
      
      currentEmotion: null,
      currentContent: '',

      // Actions
      setFirstVisit: (value) => set({ isFirstVisit: value }),
      
      setUserName: (name) => set({ userName: name }),
      
      setDailyReminder: (enabled) => {
        set({ dailyReminder: enabled })
        if (enabled) {
          requestNotificationPermission()
        }
      },
      
      setReminderTime: (time) => set({ reminderTime: time }),
      
      toggleDarkMode: () => set((state) => ({ 
        darkMode: !state.darkMode 
      })),
      
      // 订阅操作
      subscribe: (plan) => {
        const expiryDate = new Date()
        if (plan === 'yearly') {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1)
        } else {
          expiryDate.setMonth(expiryDate.getMonth() + 1)
        }
        
        set({
          subscription: {
            isActive: true,
            plan,
            expiryDate,
            features: [
              'unlimited_ai_summary',
              'advanced_analytics',
              'mood_prediction',
              'export_pdf',
              'cloud_backup',
              'custom_themes'
            ]
          }
        })
      },
      
      cancelSubscription: () => {
        set({
          subscription: {
            isActive: false,
            plan: null,
            expiryDate: null,
            features: []
          }
        })
      },
      
      checkSubscriptionStatus: () => {
        const { subscription } = get()
        if (!subscription.isActive || !subscription.expiryDate) {
          return false
        }
        return new Date() < subscription.expiryDate
      },
      
      // 日记操作
      setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),
      
      setCurrentContent: (content) => set({ currentContent: content }),
      
      saveEntry: async () => {
        const { currentEmotion, currentContent } = get()
        
        if (!currentEmotion || !currentContent.trim()) {
          return null
        }
        
        const entry: Omit<DiaryEntry, 'id'> = {
          date: new Date(),
          emotion: currentEmotion,
          content: currentContent.trim(),
          tags: [],
          aiSummary: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        try {
          const id = await db.entries.add(entry as DiaryEntry)
          set({ currentEmotion: null, currentContent: '' })
          return { ...entry, id } as DiaryEntry
        } catch (error) {
          console.error('Failed to save entry:', error)
          return null
        }
      },
      
      loadSettings: () => {
        // 从 localStorage 加载设置
        const saved = localStorage.getItem('ai-diary-settings')
        if (saved) {
          try {
            const settings = JSON.parse(saved)
            set({
              userName: settings.userName || '',
              dailyReminder: settings.dailyReminder ?? true,
              reminderTime: settings.reminderTime || '21:00',
              darkMode: settings.darkMode || false
            })
          } catch (e) {
            console.error('Failed to load settings:', e)
          }
        }
      },
      
      // AI 功能 - 需要订阅
      generateAISummary: async (entryId) => {
        const { subscription } = get()
        if (!subscription.isActive) {
          throw new Error('AI 功能需要订阅')
        }
        
        // 模拟 AI 总结生成
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const mockSummary: AISummary = {
          id: crypto.randomUUID(),
          entryId,
          summary: '你今天分享了一段关于工作挑战的经历。虽然感到压力，但你展现出了积极面对困难的态度。',
          keywords: ['工作', '挑战', '压力', '成长'],
          moodTrend: '正向转变',
          insights: [
            '面对挑战时保持积极心态',
            '压力可以成为成长的动力',
            '适当休息有助于恢复精力'
          ],
          createdAt: new Date()
        }
        
        return mockSummary
      },
      
      generateWeeklyReport: async (startDate, endDate) => {
        const { subscription } = get()
        if (!subscription.isActive) {
          throw new Error('AI 功能需要订阅')
        }
        
        // 模拟生成周报
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        return {
          period: { start: startDate, end: endDate },
          totalEntries: 5,
          dominantEmotion: 'joy',
          moodTrend: '上升',
          highlights: [
            '本周整体情绪积极向上',
            '有3天记录了感恩时刻',
            '工作压力管理有所进步'
          ],
          suggestions: [
            '继续保持感恩日记的习惯',
            '周末可以尝试新的放松方式'
          ]
        }
      }
    }),
    {
      name: 'ai-diary-store',
      partialize: (state) => ({
        isFirstVisit: state.isFirstVisit,
        userName: state.userName,
        dailyReminder: state.dailyReminder,
        reminderTime: state.reminderTime,
        darkMode: state.darkMode,
        subscription: state.subscription
      })
    }
  )
)

// 请求通知权限
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}
