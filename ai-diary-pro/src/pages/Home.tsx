import { motion } from 'framer-motion'
import { format, isToday, isYesterday } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  PenLine, 
  Sparkles, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Crown
} from 'lucide-react'
import { db, DiaryEntry, EMOTIONS } from '../db/database'
import { useAppStore } from '../store/appStore'
import EmotionChart from '../components/EmotionChart'

export default function Home() {
  const { userName, subscription } = useAppStore()
  const [todayEntry, setTodayEntry] = useState<DiaryEntry | null>(null)
  const [recentEntries, setRecentEntries] = useState<DiaryEntry[]>([])
  const [stats, setStats] = useState({
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // 获取今日日记
      const today = new Date()
      const entry = await db.entries
        .where('date')
        .between(
          new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
        )
        .first()
      setTodayEntry(entry || null)

      // 获取最近日记
      const recent = await db.entries
        .orderBy('date')
        .reverse()
        .limit(5)
        .toArray()
      setRecentEntries(recent.filter(e => !isToday(new Date(e.date))))

      // 计算统计数据
      const allEntries = await db.entries.toArray()
      setStats({
        totalEntries: allEntries.length,
        currentStreak: calculateStreak(allEntries),
        longestStreak: calculateLongestStreak(allEntries)
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStreak = (entries: DiaryEntry[]): number => {
    if (entries.length === 0) return 0
    
    const dates = [...new Set(entries.map(e => 
      format(new Date(e.date), 'yyyy-MM-dd')
    ))].sort().reverse()
    
    let streak = 0
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
    
    // 检查今天或昨天是否有记录
    if (dates[0] !== today && dates[0] !== yesterday) {
      return 0
    }
    
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        streak++
      } else {
        const prevDate = new Date(dates[i - 1])
        const currDate = new Date(dates[i])
        const diffDays = (prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24)
        
        if (diffDays === 1) {
          streak++
        } else {
          break
        }
      }
    }
    
    return streak
  }

  const calculateLongestStreak = (entries: DiaryEntry[]): number => {
    if (entries.length === 0) return 0
    
    const dates = [...new Set(entries.map(e => 
      format(new Date(e.date), 'yyyy-MM-dd')
    ))].sort()
    
    let maxStreak = 1
    let currentStreak = 1
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1])
      const currDate = new Date(dates[i])
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24)
      
      if (diffDays === 1) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }
    
    return maxStreak
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  const getEmotionInfo = (type: string) => {
    return EMOTIONS.find(e => e.type === type) || EMOTIONS[0]
  }

  const formatEntryDate = (date: Date) => {
    if (isToday(date)) return '今天'
    if (isYesterday(date)) return '昨天'
    return format(date, 'M月d日', { locale: zhCN })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 mb-1">{getGreeting()}{userName ? `，${userName}` : ''}</p>
            <h1 className="text-2xl font-bold text-gray-900">
              {todayEntry ? '今天已经记录心情了' : '记录今天的心情'}
            </h1>
            <p className="text-gray-500 mt-2">
              {todayEntry 
                ? '感谢您的分享，明天见！' 
                : '花几分钟写下今天的感受，让AI帮您分析'
              }
            </p>
          </div>
          
          {!todayEntry && (
            <Link
              to="/write"
              className="btn-primary flex items-center gap-2"
            >
              <PenLine className="w-5 h-5" />
              写日记
            </Link>
          )}
        </div>
      </motion.div>

      {/* 今日日记卡片 */}
      {todayEntry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 bg-gradient-to-br from-primary-50 to-white border-primary-100"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">
                {getEmotionInfo(todayEntry.emotion).emoji}
              </span>
              <div>
                <p className="font-medium text-gray-900">
                  {getEmotionInfo(todayEntry.emotion).label}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(todayEntry.date), 'HH:mm')}
                </p>
              </div>
            </div>
            
            {todayEntry.aiSummary && (
              <div className="flex items-center gap-1 text-primary-600 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI 已分析</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-700 line-clamp-3">{todayEntry.content}</p>
          
          {todayEntry.aiSummary && (
            <div className="mt-4 p-4 bg-white/70 rounded-xl">
              <div className="flex items-center gap-2 text-primary-700 text-sm font-medium mb-2">
                <Sparkles className="w-4 h-4" />
                AI 洞察
              </div>
              <p className="text-gray-600 text-sm">{todayEntry.aiSummary}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* 统计概览 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { icon: Calendar, label: '总日记', value: stats.totalEntries },
          { icon: TrendingUp, label: '连续天数', value: stats.currentStreak },
          { icon: Crown, label: '最长记录', value: stats.longestStreak },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <stat.icon className="w-5 h-5 text-primary-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* 情绪图表 - 需要订阅 */}
      {subscription.isActive ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">本周情绪趋势</h2>
          <EmotionChart />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 bg-gradient-to-r from-amber-50 to-orange-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">解锁高级分析</p>
                <p className="text-sm text-gray-500">查看情绪趋势和 AI 洞察</p>
              </div>
            </div>
            <Link
              to="/subscription"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              了解更多 →
            </Link>
          </div>
        </motion.div>
      )}

      {/* 最近日记 */}
      {recentEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">最近日记</h2>
            <Link
              to="/history"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentEntries.slice(0, 3).map((entry) => (
              <Link
                key={entry.id}
                to={`/write/${format(new Date(entry.date), 'yyyy-MM-dd')}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">
                  {getEmotionInfo(entry.emotion).emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {entry.content.slice(0, 50)}...
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatEntryDate(new Date(entry.date))}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
