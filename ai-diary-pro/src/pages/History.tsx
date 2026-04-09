import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Trash2,
  Sparkles
} from 'lucide-react'
import { db, DiaryEntry, EMOTIONS, EmotionType } from '../db/database'

export default function History() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEntries()
  }, [currentMonth])

  const loadEntries = async () => {
    setIsLoading(true)
    try {
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)
      
      const monthEntries = await db.entries
        .where('date')
        .between(start, end)
        .toArray()
      
      setEntries(monthEntries)
    } catch (error) {
      console.error('Failed to load entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这篇日记吗？')) {
      try {
        await db.entries.delete(id)
        setEntries(entries.filter(e => e.id !== id))
        setSelectedEntry(null)
      } catch (error) {
        console.error('Failed to delete entry:', error)
      }
    }
  }

  const getEmotionInfo = (type: EmotionType) => {
    return EMOTIONS.find(e => e.type === type) || EMOTIONS[0]
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }

  const getEntryForDay = (day: Date) => {
    return entries.find(entry => isSameDay(new Date(entry.date), day))
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">日记历史</h1>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-lg font-medium min-w-[120px] text-center">
            {format(currentMonth, 'yyyy年M月', { locale: zhCN })}
          </span>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* 日历视图 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 mb-6"
      >
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
          
          {getDaysInMonth().map((day, index) => {
            const entry = getEntryForDay(day)
            const emotionInfo = entry ? getEmotionInfo(entry.emotion) : null
            
            return (
              <motion.button
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => entry && setSelectedEntry(entry)}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center
                  transition-all duration-200 relative
                  ${isToday(day) ? 'ring-2 ring-primary-500' : ''}
                  ${entry 
                    ? 'hover:scale-105 cursor-pointer' 
                    : 'opacity-40'
                  }
                `}
              >
                <span className={`
                  text-sm font-medium
                  ${isToday(day) ? 'text-primary-600' : 'text-gray-700'}
                `}>
                  {format(day, 'd')}
                </span>
                
                {emotionInfo && (
                  <span className="text-xl mt-1">{emotionInfo.emoji}</span>
                )}
                
                {entry?.aiSummary && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* 本月统计 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {[
          { label: '本月日记', value: entries.length },
          { label: '积极情绪', value: entries.filter(e => ['joy', 'gratitude', 'calm', 'excited'].includes(e.emotion)).length },
          { label: 'AI 分析', value: entries.filter(e => e.aiSummary).length },
          { label: '连续天数', value: '-' }
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* 日记列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">日记列表</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : entries.length === 0 ? (
          <div className="card p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">这个月还没有写日记</p>
            <Link
              to="/write"
              className="text-primary-600 hover:text-primary-700 mt-2 inline-block"
            >
              去写一篇 →
            </Link>
          </div>
        ) : (
          entries
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((entry) => {
              const emotionInfo = getEmotionInfo(entry.emotion)
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                      ${emotionInfo.color} bg-opacity-20
                    `}>
                      {emotionInfo.emoji}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {emotionInfo.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(entry.date), 'M月d日 HH:mm', { locale: zhCN })}
                        </span>
                        {entry.aiSummary && (
                          <span className="flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            AI
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 line-clamp-2">
                        {entry.content}
                      </p>
                      
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })
        )}
      </motion.div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedEntry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg 
                         bg-white rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-auto"
            >
              {(() => {
                const emotionInfo = getEmotionInfo(selectedEntry.emotion)
                return (
                  <>
                    <div className={`
                      p-6 border-b
                      ${emotionInfo.color} bg-opacity-10
                    `}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{emotionInfo.emoji}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {emotionInfo.label}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {format(new Date(selectedEntry.date), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/write/${format(new Date(selectedEntry.date), 'yyyy-MM-dd')}`}
                            className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-600"
                          >
                            编辑
                          </Link>
                          <button
                            onClick={() => selectedEntry.id && handleDelete(selectedEntry.id)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedEntry.content}
                      </p>

                      {selectedEntry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6">
                          {selectedEntry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-sm text-primary-700 bg-primary-50 px-3 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {selectedEntry.aiSummary && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl">
                          <div className="flex items-center gap-2 text-primary-700 font-medium mb-2">
                            <Sparkles className="w-4 h-4" />
                            AI 洞察
                          </div>
                          <p className="text-gray-600 text-sm">{selectedEntry.aiSummary}</p>
                        </div>
                      )}
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
