import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  BarChart3,
  PieChart,
  Lock
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { db, EMOTIONS, EmotionType } from '../db/database'
import EmotionDistributionChart from '../components/EmotionDistributionChart'
import EmotionTrendChart from '../components/EmotionTrendChart'

interface EmotionStats {
  type: EmotionType
  count: number
  percentage: number
}

interface WeeklyData {
  date: Date
  emotion: EmotionType | null
}

export default function Stats() {
  const { subscription } = useAppStore()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [emotionStats, setEmotionStats] = useState<EmotionStats[]>([])
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [totalEntries, setTotalEntries] = useState(0)
  const [averageMood, setAverageMood] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [timeRange])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      let startDate: Date
      const endDate = new Date()

      switch (timeRange) {
        case 'week':
          startDate = startOfWeek(endDate, { weekStartsOn: 1 })
          break
        case 'month':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
          break
        case 'year':
          startDate = new Date(endDate.getFullYear(), 0, 1)
          break
      }

      const entries = await db.entries
        .where('date')
        .between(startDate, endDate)
        .toArray()

      setTotalEntries(entries.length)

      // 计算情绪分布
      const emotionCounts: Record<EmotionType, number> = {
        joy: 0, gratitude: 0, calm: 0, excited: 0,
        anxious: 0, sad: 0, angry: 0, tired: 0
      }

      entries.forEach(entry => {
        emotionCounts[entry.emotion]++
      })

      const stats: EmotionStats[] = Object.entries(emotionCounts)
        .map(([type, count]) => ({
          type: type as EmotionType,
          count,
          percentage: entries.length > 0 ? Math.round((count / entries.length) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)

      setEmotionStats(stats)

      // 计算平均情绪指数 (1-10)
      const emotionScores: Record<EmotionType, number> = {
        joy: 9, gratitude: 8, calm: 7, excited: 8,
        anxious: 3, sad: 2, angry: 2, tired: 4
      }

      if (entries.length > 0) {
        const totalScore = entries.reduce((sum, entry) => 
          sum + emotionScores[entry.emotion], 0
        )
        setAverageMood(Math.round((totalScore / entries.length) * 10) / 10)
      } else {
        setAverageMood(0)
      }

      // 生成周数据
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

      const weekData: WeeklyData[] = days.map(day => {
        const entry = entries.find(e => 
          format(new Date(e.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        )
        return {
          date: day,
          emotion: entry?.emotion || null
        }
      })

      setWeeklyData(weekData)

    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEmotionInfo = (type: EmotionType) => {
    return EMOTIONS.find(e => e.type === type)!
  }

  const getMoodIcon = () => {
    if (averageMood >= 7) return <TrendingUp className="w-5 h-5 text-green-500" />
    if (averageMood >= 4) return <Minus className="w-5 h-5 text-yellow-500" />
    return <TrendingDown className="w-5 h-5 text-red-500" />
  }

  if (!subscription.isActive) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-amber-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">解锁高级统计</h1>
          
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            升级 Pro 版，查看详细的情绪趋势分析、情绪分布图表和个性化洞察报告
          </p>
          
          <a
            href="/subscription"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 
                       text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            升级到 Pro
          </a>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
            {[
              { icon: BarChart3, title: '情绪趋势', desc: '追踪情绪变化趋势' },
              { icon: PieChart, title: '情绪分布', desc: '了解情绪占比' },
              { icon: Calendar, title: '周期报告', desc: '周/月/年度报告' }
            ].map((feature) => (
              <div key={feature.title} className="card p-6 opacity-50">
                <feature.icon className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">情绪统计</h1>
        
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${timeRange === range 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {range === 'week' && '本周'}
              {range === 'month' && '本月'}
              {range === 'year' && '本年'}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        </div>
      ) : (
        <>
          {/* 概览卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            {[
              { label: '日记总数', value: totalEntries },
              { label: '情绪指数', value: averageMood, icon: getMoodIcon() },
              { 
                label: '主导情绪', 
                value: emotionStats[0]?.count > 0 
                  ? getEmotionInfo(emotionStats[0].type).label 
                  : '-'
              },
              { 
                label: '记录天数', 
                value: new Set(weeklyData.filter(d => d.emotion).map(d => 
                  format(d.date, 'yyyy-MM-dd')
                )).size 
              }
            ].map((stat, index) => (
              <div key={stat.label} className="card p-4">
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.icon}
                </div>
              </div>
            ))}
          </motion.div>

          {/* 情绪分布图表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">情绪分布</h2>
            <EmotionDistributionChart stats={emotionStats} />
          </motion.div>

          {/* 本周情绪趋势 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">本周情绪趋势</h2>
            <EmotionTrendChart data={weeklyData} />
          </motion.div>

          {/* 情绪排行榜 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">情绪记录排行</h2>
            
            <div className="space-y-3">
              {emotionStats
                .filter(stat => stat.count > 0)
                .map((stat, index) => {
                  const emotion = getEmotionInfo(stat.type)
                  return (
                    <div
                      key={stat.type}
                      className="flex items-center gap-4"
                    >
                      <span className="text-lg font-bold text-gray-400 w-6">
                        {index + 1}
                      </span>
                      
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center text-xl
                        ${emotion.color} bg-opacity-20
                      `}>
                        {emotion.emoji}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{emotion.label}</p>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                          <div
                            className={`${emotion.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{stat.count}</p>
                        <p className="text-sm text-gray-500">{stat.percentage}%</p>
                      </div>
                    </div>
                  )
                })}
              
              
              {emotionStats.filter(s => s.count > 0).length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  暂无数据，开始记录你的第一篇日记吧
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
