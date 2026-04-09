import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useAppStore } from '../store'
import { Check, RotateCcw } from 'lucide-react'

interface HabitCardProps {
  habitId: string
  showNote?: boolean
}

export default function HabitCard({ habitId, showNote = false }: HabitCardProps) {
  const { habits, checkIns, checkIn, uncheckIn } = useAppStore()
  const habit = habits.find(h => h.id === habitId)
  
  if (!habit || habit.archived) return null

  const today = new Date().toISOString().split('T')[0]
  const todayCheckIn = checkIns.find(c => c.habitId === habitId && c.date === today)
  const isCompleted = todayCheckIn?.completed || false

  const handleCheckIn = () => {
    if (isCompleted) {
      uncheckIn(habitId, today)
    } else {
      checkIn(habitId)
      // Trigger confetti
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b']
      })
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${habit.color}20` }}
        >
          {habit.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{habit.name}</h3>
          <p className="text-sm text-gray-400">
            {habit.frequency === 'daily' ? '每天' : 
             habit.frequency === 'weekly' ? '每周' : '自定义'}
          </p>
        </div>

        {/* Check-in Button */}
        <button
          onClick={handleCheckIn}
          className={`check-in-btn ${isCompleted ? 'checked' : 'unchecked'}`}
        >
          {isCompleted ? (
            <Check className="w-6 h-6" />
          ) : (
            <RotateCcw className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Note */}
      {showNote && todayCheckIn?.note && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-white/10"
        >
          <p className="text-sm text-gray-400">{todayCheckIn.note}</p>
        </motion.div>
      )}
    </motion.div>
  )
}
