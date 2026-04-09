import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, subDays, isSameDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface DatePickerProps {
  selectedDate: Date
  onChange: (date: Date) => void
  highlightedDates?: Date[]
}

export default function DatePicker({ selectedDate, onChange, highlightedDates = [] }: DatePickerProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const startOfWeek = new Date(currentWeek)
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay())
    return addDays(startOfWeek, i)
  })

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'next' ? addDays(prev, 7) : subDays(prev, 7))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentWeek(today)
    onChange(today)
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => navigateWeek('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        
        <div className="text-center">
          <span className="font-semibold text-gray-900">
            {format(currentWeek, 'yyyy年M月', { locale: zhCN })}
          </span>
          {!isSameDay(currentWeek, new Date()) && (
            <button 
              onClick={goToToday}
              className="ml-2 text-xs text-primary-600 font-medium hover:underline"
            >
              回到今天
            </button>
          )}
        </div>
        
        <button 
          onClick={() => navigateWeek('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <div key={day} className="text-center text-xs text-gray-400 py-1">
            {day}
          </div>
        ))}
        
        {weekDays.map((date) => {
          const isSelected = isSameDay(date, selectedDate)
          const isToday = isSameDay(date, new Date())
          const hasData = highlightedDates.some(d => isSameDay(d, date))
          
          return (
            <motion.button
              key={date.toISOString()}
              onClick={() => onChange(date)}
              whileTap={{ scale: 0.95 }}
              className={`
                relative py-3 rounded-xl transition-all duration-200
                ${isSelected 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                  : 'hover:bg-gray-100 text-gray-700'
                }
              `}
            >
              <span className={`text-sm font-medium ${isToday && !isSelected ? 'text-primary-600' : ''}`}>
                {format(date, 'd')}
              </span>
              
              {hasData && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-400 rounded-full"></span>
              )}
              
              {isToday && !isSelected && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-100 text-primary-600 text-[9px] font-bold rounded-full flex items-center justify-center">
                  今
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
