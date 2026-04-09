import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Archive, Trash2, Edit3, X, Check } from 'lucide-react'
import { useAppStore } from '../store'
import AddHabitModal from '../components/AddHabitModal'
import type { Habit } from '../types'

export default function Habits() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const { habits, deleteHabit, archiveHabit, updateHabit } = useAppStore()

  const activeHabits = habits.filter(h => !h.archived)
  const archivedHabits = habits.filter(h => h.archived)

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个习惯吗？')) {
      deleteHabit(id)
    }
  }

  const handleArchive = (id: string) => {
    archiveHabit(id)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <header className="flex items-center justify-between"
003e
        <h1 className="text-2xl font-bold text-white">我的习惯</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Active Habits */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">进行中</h2>
        
        {activeHabits.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-400">还没有习惯，点击下方按钮创建</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeHabits.map(habit => (
              <HabitListItem
                key={habit.id}
                habit={habit}
                onEdit={() => setEditingHabit(habit)}
                onArchive={() => handleArchive(habit.id)}
                onDelete={() => handleDelete(habit.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Archived Habits */}
      {archivedHabits.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">已归档</h2>
          <div className="space-y-3">
            {archivedHabits.map(habit => (
              <HabitListItem
                key={habit.id}
                habit={habit}
                onEdit={() => setEditingHabit(habit)}
                onArchive={() => updateHabit(habit.id, { archived: false })}
                onDelete={() => handleDelete(habit.id)}
                isArchived
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddHabitModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingHabit && (
          <EditHabitModal
            habit={editingHabit}
            onClose={() => setEditingHabit(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface HabitListItemProps {
  habit: Habit
  onEdit: () => void
  onArchive: () => void
  onDelete: () => void
  isArchived?: boolean
}

function HabitListItem({ habit, onEdit, onArchive, onDelete, isArchived }: HabitListItemProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      layout
      className={`glass-card p-4 ${isArchived ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${habit.color}20` }}
        >
          {habit.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold truncate ${isArchived ? 'text-gray-400' : 'text-white'}`}>
            {habit.name}
          </h3>
          <p className="text-sm text-gray-500">
            {habit.frequency === 'daily' ? '每天' : 
             habit.frequency === 'weekly' ? '每周' : '自定义'}
            {habit.reminderTime && ` · ${habit.reminderTime}`}
          </p>
        </div>

        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          {showActions ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-2 mt-3 pt-3 border-t border-white/10 overflow-hidden"
          >
            <button
              onClick={onArchive}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              <Archive className="w-4 h-4" />
              {isArchived ? '恢复' : '归档'}
            </button>
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/20 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Edit Habit Modal Component
function EditHabitModal({ habit, onClose }: { habit: Habit; onClose: () => void }) {
  const { updateHabit } = useAppStore()
  const [name, setName] = useState(habit.name)
  const [reminder, setReminder] = useState(habit.reminderTime || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateHabit(habit.id, { 
      name: name.trim(),
      reminderTime: reminder || undefined
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-dark-800 rounded-3xl shadow-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-6">编辑习惯</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">习惯名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">提醒时间</label>
            <input
              type="time"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 rounded-xl text-gray-400 hover:bg-white/10 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              保存
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
