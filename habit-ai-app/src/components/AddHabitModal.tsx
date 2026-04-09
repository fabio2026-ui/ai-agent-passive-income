import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Clock, Calendar } from 'lucide-react'
import { useAppStore } from '../store'

interface AddHabitModalProps {
  onClose: () => void
}

const ICONS = ['💧', '🏃', '📚', '🧘', '🌅', '💊', '🥗', '💪', '✍️', '🎸', '🎯', '🔥']
const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

export default function AddHabitModal({ onClose }: AddHabitModalProps) {
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0])
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily')
  const [reminder, setReminder] = useState('')
  
  const { addHabit } = useAppStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    addHabit({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      frequency,
      targetDays: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5],
      reminderTime: reminder || undefined,
      archived: false
    })

    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-dark-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">新建习惯</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">习惯名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：每天喝水8杯"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              autoFocus
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">选择图标</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedIcon === icon
                      ? 'bg-primary-500 scale-110'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">主题颜色</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-xl transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-white scale-110'
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">频率</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'daily', label: '每天', icon: Calendar },
                { value: 'weekly', label: '工作日', icon: Calendar },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFrequency(value as any)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    frequency === value
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">提醒时间（可选）</label>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <input
                type="time"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            创建习惯
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}
