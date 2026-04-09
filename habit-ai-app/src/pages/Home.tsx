import { motion } from 'framer-motion'
import { Sparkles, Trophy, Flame, TrendingUp } from 'lucide-react'
import { useAppStore } from '../store'
import HabitCard from '../components/HabitCard'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

interface HomeProps {
  onOpenAI: () => void
}

export default function Home({ onOpenAI }: HomeProps) {
  const { habits, user, getTodayCheckIns, getWeeklyStats } = useAppStore()
  const navigate = useNavigate()
  
  const activeHabits = habits.filter(h => !h.archived)
  const todayCheckIns = getTodayCheckIns()
  const completedCount = todayCheckIns.filter(c => c.completed).length
  const completionRate = activeHabits.length > 0 
    ? Math.round((completedCount / activeHabits.length) * 100) 
    : 0

  const weeklyStats = getWeeklyStats()
  const today = new Date()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{format(today, 'EEEE, M月d日', { locale: zhCN })}</p>
          <h1 className="text-2xl font-bold text-white">你好, {user.name}!</h1>
        </div>
        <button
          onClick={onOpenAI}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-accent-gold mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-lg font-bold">{user.streakDays}</span>
          </div>
          <p className="text-xs text-gray-400">连续天数</p>
        </div>

        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-primary-400 mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-lg font-bold">{user.totalPoints}</span>
          </div>
          <p className="text-xs text-gray-400">积分</p>
        </div>

        <div className="glass-card p-4 text-center"
          onClick={() => navigate('/stats')}>
          <div className="flex items-center justify-center gap-1 text-accent-green mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-lg font-bold">{completionRate}%</span>
          </div>
          <p className="text-xs text-gray-400">完成率</p>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">本周进度</h3>
          <span className="text-sm text-gray-400">{completedCount}/{activeHabits.length}</span>
        </div>
        <div className="flex items-end justify-between h-20 gap-2">
          {weeklyStats.map((stat, idx) => {
            const isToday = idx === 6
            const height = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0
            return (
              <div key={stat.date} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 10)}%` }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  className={`w-full rounded-t-lg ${
                    isToday ? 'bg-primary-500' : 'bg-white/20'
                  }`}
                />
                <span className={`text-xs ${isToday ? 'text-primary-400' : 'text-gray-500'}`}>
                  {['一', '二', '三', '四', '五', '六', '日'][idx]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's Habits */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">今日习惯</h2>
          <span className="text-sm text-gray-400">
            {completedCount}/{activeHabits.length} 完成
          </span>
        </div>

        {activeHabits.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-400 mb-4">还没有习惯，开始创建你的第一个习惯吧！</p>
            <button
              onClick={() => navigate('/habits')}
              className="btn-primary"
            >
              创建习惯
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeHabits.map(habit => (
              <HabitCard key={habit.id} habitId={habit.id} />
            ))}
          </div>
        )}
      </div>

      {/* AI Suggestion Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={onOpenAI}
        className="glass-card p-4 cursor-pointer bg-gradient-to-r from-primary-500/10 to-accent-purple/10 border-primary-500/30"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">AI习惯教练</h3>
            <p className="text-sm text-gray-400">
              点击与我对话，获取个性化的习惯养成建议和数据分析
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
