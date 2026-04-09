import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Droplets, Trophy, TrendingUp, ChevronRight } from 'lucide-react'
import { useMealStore } from '../stores/mealStore'
import MacroChart from './MacroChart'
import WeeklyChart from './WeeklyChart'
import type { NutritionInfo } from '../types'

interface NutritionCardProps {
  title: string
  value: number
  goal: number
  unit: string
  icon: React.ReactNode
  color: string
  onClick?: () => void
}

function NutritionCard({ title, value, goal, unit, icon, color, onClick }: NutritionCardProps) {
  const percentage = Math.min(100, Math.round((value / goal) * 100))
  const isOver = value > goal
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          isOver ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
        }`}>
          {percentage}%
        </span>
      </div>
      
      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">{Math.round(value)}</span>
        <span className="text-sm text-gray-500 ml-1">{unit}</span>
      </div>
      
      <div className="text-sm text-gray-500 mb-3">{title}</div>
      
      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            backgroundColor: isOver ? '#f97316' : color,
            width: `${Math.min(100, percentage)}%`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">目标: {goal}{unit}</span>
        <span className="text-xs text-gray-400">{isOver ? '+' : ''}{Math.round(value - goal)}{unit}</span>
      </div>
    </motion.button>
  )
}

interface DailyNutritionSummaryProps {
  date?: string
  nutrition: NutritionInfo
  showDetails?: boolean
}

export default function DailyNutritionSummary({ 
  date, 
  nutrition, 
  showDetails = true 
}: DailyNutritionSummaryProps) {
  const { goals, meals } = useMealStore()
  const [showWeekly, setShowWeekly] = useState(false)

  const stats = [
    { 
      title: '热量', 
      value: nutrition.calories, 
      goal: goals.calories, 
      unit: 'kcal', 
      icon: <Flame className="w-5 h-5" />, 
      color: '#f97316' 
    },
    { 
      title: '蛋白质', 
      value: nutrition.protein, 
      goal: goals.protein, 
      unit: 'g', 
      icon: <Trophy className="w-5 h-5" />, 
      color: '#10b981' 
    },
    { 
      title: '碳水', 
      value: nutrition.carbs, 
      goal: goals.carbs, 
      unit: 'g', 
      icon: <TrendingUp className="w-5 h-5" />, 
      color: '#f59e0b' 
    },
    { 
      title: '脂肪', 
      value: nutrition.fat, 
      goal: goals.fat, 
      unit: 'g', 
      icon: <Droplets className="w-5 h-5" />, 
      color: '#ef4444' 
    }
  ]

  return (
    <div className="space-y-4">
      {/* Macro Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">营养素分布</h3>
          <button 
            onClick={() => setShowWeekly(!showWeekly)}
            className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline"
          >
            {showWeekly ? '查看今日' : '查看本周'}
            <ChevronRight className={`w-4 h-4 transition-transform ${showWeekly ? 'rotate-90' : ''}`} />
          </button>
        </div>
        
        {showWeekly ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              {(['calories', 'protein', 'carbs', 'fat'] as const).map((metric) => (
                <button
                  key={metric}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-100 text-primary-700"
                >
                  {metric === 'calories' && '热量'}
                  {metric === 'protein' && '蛋白质'}
                  {metric === 'carbs' && '碳水'}
                  {metric === 'fat' && '脂肪'}
                </button>
              ))}
            </div>
            <WeeklyChart 
              meals={meals} 
              goals={goals} 
              metric="calories"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <MacroChart 
              nutrition={nutrition} 
              goals={{ protein: goals.protein, carbs: goals.carbs, fat: goals.fat }}
              size="md"
            />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <NutritionCard key={stat.title} {...stat} />
          ))}
        </div>
      )}
    </div>
  )
}
