import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format, subDays, isSameDay, parseISO } from 'date-fns'
import type { MealEntry, NutritionGoals } from '../types'

interface WeeklyChartProps {
  meals: MealEntry[]
  goals: NutritionGoals
  metric: 'calories' | 'protein' | 'carbs' | 'fat'
}

export default function WeeklyChart({ meals, goals, metric }: WeeklyChartProps) {
  const data = useMemo(() => {
    const today = new Date()
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i)
      const dayMeals = meals.filter(m => 
        isSameDay(parseISO(m.timestamp), date)
      )
      
      const total = dayMeals.reduce((sum, meal) => {
        return sum + (meal.totalNutrition[metric] || 0)
      }, 0)
      
      return {
        date: format(date, 'MM/dd'),
        fullDate: date,
        value: Math.round(total),
        isToday: isSameDay(date, today)
      }
    })
    
    return days
  }, [meals, metric])

  const goalValue = goals[metric]
  const maxValue = Math.max(...data.map(d => d.value), goalValue)
  const yAxisMax = Math.ceil(maxValue * 1.1 / 100) * 100

  const getBarColor = (value: number) => {
    if (metric === 'calories') {
      const ratio = value / goalValue
      if (ratio > 1.2) return '#ef4444'
      if (ratio > 1) return '#f59e0b'
      if (ratio < 0.8) return '#3b82f6'
      return '#10b981'
    }
    return '#10b981'
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      const percentage = Math.round((value / goalValue) * 100)
      
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-2xl font-bold text-primary-600">
            {value}<span className="text-sm text-gray-500 ml-1">{metric === 'calories' ? 'kcal' : 'g'}</span>
          </p>
          <p className="text-sm text-gray-500">目标完成度: {percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            domain={[0, yAxisMax]}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine 
            y={goalValue} 
            stroke="#10b981" 
            strokeDasharray="5 5"
            label={{
              value: `目标: ${goalValue}`,
              position: 'right',
              fill: '#10b981',
              fontSize: 11
            }}
          />
          
          <Bar 
            dataKey="value" 
            radius={[6, 6, 0, 0]}
            fill="#10b981"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isToday ? '#059669' : getBarColor(entry.value)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
