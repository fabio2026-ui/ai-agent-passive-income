import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { NutritionInfo } from '../types'

interface MacroChartProps {
  nutrition: NutritionInfo
  goals?: {
    protein: number
    carbs: number
    fat: number
  }
  size?: 'sm' | 'md' | 'lg'
  showLegend?: boolean
}

const COLORS = {
  protein: '#10b981',
  carbs: '#f59e0b',
  fat: '#ef4444'
}

export default function MacroChart({ 
  nutrition, 
  goals,
  size = 'md',
  showLegend = true 
}: MacroChartProps) {
  const data = useMemo(() => [
    { name: '蛋白质', value: Math.round(nutrition.protein), key: 'protein' },
    { name: '碳水', value: Math.round(nutrition.carbs), key: 'carbs' },
    { name: '脂肪', value: Math.round(nutrition.fat), key: 'fat' }
  ], [nutrition])

  const chartSize = {
    sm: { width: 100, height: 100, outerRadius: 35 },
    md: { width: 180, height: 180, outerRadius: 60 },
    lg: { width: 240, height: 240, outerRadius: 80 }
  }[size]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      const goalValue = goals?.[item.payload.key as keyof typeof goals]
      const percentage = goalValue 
        ? Math.round((item.value / goalValue) * 100) 
        : null
      
      return (
        <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-100 text-sm">
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-gray-600">{item.value}g</p>
          {percentage !== null && (
            <p className={`text-xs ${percentage > 100 ? 'text-orange-500' : 'text-green-500'}`}>
              目标: {percentage}%
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={chartSize.width} height={chartSize.height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={chartSize.outerRadius * 0.6}
            outerRadius={chartSize.outerRadius}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.key as keyof typeof COLORS]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value: string, entry: any) => (
                <span className="text-sm text-gray-600">{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-3 gap-4 mt-2 w-full">
        {data.map((item) => {
          const goalValue = goals?.[item.key as keyof typeof goals]
          const percentage = goalValue ? Math.round((item.value / goalValue) * 100) : null
          
          return (
            <div key={item.key} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: COLORS[item.key as keyof typeof COLORS] }}
              />
              <div className="text-lg font-bold text-gray-900">{item.value}g</div>
              <div className="text-xs text-gray-500">{item.name}</div>
              {percentage !== null && (
                <div className={`text-xs font-medium mt-0.5 ${
                  percentage > 100 ? 'text-orange-500' : 'text-green-500'
                }`}>
                  {percentage}%
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
