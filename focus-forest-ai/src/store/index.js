import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 用户状态管理
export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      isPremium: false,
      subscriptionEndDate: null,
      trees: [],
      totalFocusTime: 0,
      streakDays: 0,
      lastFocusDate: null,
      achievements: [],
      coins: 100,
      
      // 登录/注册
      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null, isPremium: false }),
      
      // 订阅管理
      upgradeToPremium: (endDate) => set({ 
        isPremium: true, 
        subscriptionEndDate: endDate 
      }),
      cancelSubscription: () => set({ 
        isPremium: false, 
        subscriptionEndDate: null 
      }),
      
      // 森林管理
      addTree: (tree) => set((state) => ({ 
        trees: [...state.trees, tree] 
      })),
      removeTree: (treeId) => set((state) => ({
        trees: state.trees.filter(t => t.id !== treeId)
      })),
      
      // 专注时间统计
      addFocusTime: (minutes) => set((state) => ({
        totalFocusTime: state.totalFocusTime + minutes,
        coins: state.coins + Math.floor(minutes / 10)
      })),
      
      // 连续天数
      updateStreak: () => {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const { lastFocusDate, streakDays } = get();
        
        if (lastFocusDate === yesterday) {
          set({ streakDays: streakDays + 1, lastFocusDate: today });
        } else if (lastFocusDate !== today) {
          set({ streakDays: 1, lastFocusDate: today });
        }
      },
      
      // 成就系统
      unlockAchievement: (achievement) => set((state) => ({
        achievements: state.achievements.includes(achievement) 
          ? state.achievements 
          : [...state.achievements, achievement]
      })),
      
      // 金币
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      spendCoins: (amount) => set((state) => ({ 
        coins: Math.max(0, state.coins - amount) 
      })),
    }),
    {
      name: 'focus-forest-user',
    }
  )
);

// 计时器状态管理
export const useTimerStore = create((set, get) => ({
  timeLeft: 25 * 60,
  isActive: false,
  isPaused: false,
  mode: 'pomodoro', // pomodoro, shortBreak, longBreak
  currentTask: null,
  sessionsCompleted: 0,
  
  // 模式配置
  modes: {
    pomodoro: { time: 25 * 60, label: '专注', color: '#22c55e' },
    shortBreak: { time: 5 * 60, label: '短休息', color: '#3b82f6' },
    longBreak: { time: 15 * 60, label: '长休息', color: '#8b5cf6' },
  },
  
  // 计时器控制
  start: () => set({ isActive: true, isPaused: false }),
  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
  stop: () => {
    const { modes, mode } = get();
    set({ 
      isActive: false, 
      isPaused: false,
      timeLeft: modes[mode].time 
    });
  },
  
  // 倒计时
  tick: () => set((state) => ({ 
    timeLeft: Math.max(0, state.timeLeft - 1) 
  })),
  
  // 切换模式
  setMode: (newMode) => {
    const { modes } = get();
    set({ 
      mode: newMode, 
      timeLeft: modes[newMode].time,
      isActive: false,
      isPaused: false
    });
  },
  
  // 设置当前任务
  setTask: (task) => set({ currentTask: task }),
  
  // 完成一个番茄
  completeSession: () => set((state) => ({ 
    sessionsCompleted: state.sessionsCompleted + 1 
  })),
  
  // 跳过当前计时
  skip: () => {
    const { modes, mode } = get();
    set({ 
      timeLeft: modes[mode].time,
      isActive: false,
      isPaused: false
    });
  }
}));

// 设置管理
export const useSettingsStore = create(
  persist(
    (set) => ({
      // 计时器设置
      pomodoroTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      longBreakInterval: 4,
      
      // 通知设置
      notifications: true,
      soundEnabled: true,
      soundVolume: 50,
      
      // 外观设置
      theme: 'auto', // light, dark, auto
      language: 'zh-CN',
      showSeconds: true,
      compactMode: false,
      
      // 更新设置
      updateSettings: (newSettings) => set((state) => ({
        ...state,
        ...newSettings
      })),
      
      // 重置设置
      resetSettings: () => set({
        pomodoroTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        longBreakInterval: 4,
        notifications: true,
        soundEnabled: true,
        soundVolume: 50,
        theme: 'auto',
        language: 'zh-CN',
        showSeconds: true,
        compactMode: false,
      })
    }),
    {
      name: 'focus-forest-settings',
    }
  )
);

// AI 分析数据管理
export const useAIStore = create(
  persist(
    (set, get) => ({
      focusHistory: [],
      aiInsights: [],
      dailyGoals: [],
      weeklyReport: null,
      
      // 记录专注数据
      recordFocusSession: (session) => set((state) => ({
        focusHistory: [...state.focusHistory, {
          ...session,
          id: Date.now(),
          timestamp: new Date().toISOString()
        }]
      })),
      
      // 生成 AI 洞察
      generateInsights: () => {
        const { focusHistory } = get();
        // 这里会调用 AI API 分析数据
        const insights = analyzeFocusPatterns(focusHistory);
        set({ aiInsights: insights });
        return insights;
      },
      
      // 设置每日目标
      setDailyGoal: (goal) => set((state) => ({
        dailyGoals: [...state.dailyGoals.filter(g => g.date !== goal.date), goal]
      })),
      
      // 更新周报告
      updateWeeklyReport: (report) => set({ weeklyReport: report }),
      
      // 清除历史数据
      clearHistory: () => set({ 
        focusHistory: [], 
        aiInsights: [], 
        weeklyReport: null 
      })
    }),
    {
      name: 'focus-forest-ai',
    }
  )
);

// 简单的 AI 分析函数（实际应用中会调用真实的 AI API）
function analyzeFocusPatterns(history) {
  if (history.length === 0) return [];
  
  const insights = [];
  
  // 分析最佳专注时间段
  const hourlyStats = {};
  history.forEach(session => {
    const hour = new Date(session.timestamp).getHours();
    hourlyStats[hour] = (hourlyStats[hour] || 0) + session.duration;
  });
  
  const bestHour = Object.entries(hourlyStats)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (bestHour) {
    insights.push({
      type: 'peak_time',
      title: '最佳专注时段',
      content: `您在 ${bestHour[0]}:00 时段专注效率最高，建议安排重要任务。`,
      confidence: 85
    });
  }
  
  // 分析连续专注能力
  const avgDuration = history.reduce((sum, s) => sum + s.duration, 0) / history.length;
  insights.push({
    type: 'stamina',
    title: '专注耐力分析',
    content: `平均每次专注 ${Math.round(avgDuration)} 分钟，${avgDuration > 25 ? '表现优秀！' : '建议逐步延长专注时间。'}`,
    confidence: 80
  });
  
  return insights;
}
