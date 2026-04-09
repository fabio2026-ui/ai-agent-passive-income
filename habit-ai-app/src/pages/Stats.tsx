import { motion } from 'framer-motion'
import { TrendingUp, Calendar, Target, Award } from 'lucide-react'
import { useAppStore } from '../store'
import { format, subDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

export default function Stats() {
  const { habits, checkIns, getWeeklyStats, achievements } = useAppStore()
  
  const activeHabits = habits.filter(h => !h.archived)
  const totalCheckIns = checkIns.filter(c => c.completed).length
  const weeklyStats = getWeeklyStats()
  
  // Calculate completion rate by habit
  const habitStats = activeHabits.map(habit => {
    const habitCheckIns = checkIns.filter(c => c.habitId === habit.id && c.completed)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i)
      return habitCheckIns.some(c => c.date === format(date, 'yyyy-MM-dd'))
    }).filter(Boolean).length
    
    return {
      name: habit.name,
      completed: habitCheckIns.length,
      last30Days
    }
  })

  // Monthly calendar data
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthDays = eachDayOfInterval({
    start: monthStart,
    end: today
  })

  const calendarData = monthDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayCheckIns = checkIns.filter(c => c.date === dateStr && c.completed)
    return {
      date: day,
      completed: dayCheckIns.length,
      total: activeHabits.length
    }
  })

  const completionRate = activeHabits.length > 0 ? Math.round((totalCheckIns / (activeHabits.length * 30)) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-white">数据统计</h1>
        <p className="text-gray-400">查看你的习惯养成进度</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">总打卡</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalCheckIns}</p>
          <p className="text-xs text-gray-400">次</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-accent-green mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">完成率</span>
          </div>
          <p className="text-3xl font-bold text-white">{completionRate}%</p>
          <p className="text-xs text-gray-400">近30天</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-accent-purple mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">活跃习惯</span>
          </div>
          <p className="text-3xl font-bold text-white">{activeHabits.length}</p>
          <p className="text-xs text-gray-400">个</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-accent-gold mb-2">
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium">成就</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {achievements.filter(a => a.unlockedAt).length}/{achievements.length}
          </p>
          <p className="text-xs text-gray-400">已解锁</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="glass-card p-4">
        <h3 className="font-semibold text-white mb-4">本周完成度</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStats}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'EEE', { locale: zhCN })}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                hide 
003e
              </YAxis>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                labelFormatter={(date) => format(new Date(date), 'MM月dd日')}
              />
              <Bar dataKey="completed" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habit Breakdown */}
      {habitStats.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="font-semibold text-white mb-4">习惯完成情况</h3>
          <div className="space-y-3">
            {habitStats.map((stat, idx) => (
              <div key={stat.name} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{stat.name}</span>
                    <span className="text-sm text-gray-400">{stat.completed}次</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stat.last30Days / 30) * 100, 100)}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Heatmap */}
      <div className="glass-card p-4">
        <h3 className="font-semibold text-white mb-4">{format(today, 'yyyy年M月', { locale: zhCN })}</h3>
        <div className="grid grid-cols-7 gap-1">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="text-center text-xs text-gray-500 py-1">
              {day}
            </div>
          ))}
          
          {calendarData.map(({ date, completed, total }) => {
            const intensity = total > 0 ? completed / total : 0
            return (
              <motion.div
                key={date.toISOString()}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                  intensity === 0 ? 'bg-white/5' :
                  intensity < 0.3 ? 'bg-primary-500/30' :
                  intensity < 0.7 ? 'bg-primary-500/60' :
                  'bg-primary-500'
                }`}
              >
                {format(date, 'd')}
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
