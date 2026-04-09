import { useEffect, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { EMOTIONS, EmotionType } from '../db/database'

interface EmotionStats {
  type: EmotionType
  count: number
  percentage: number
}

interface EmotionDistributionChartProps {
  stats: EmotionStats[]
}

const EMOTION_COLORS: Record<EmotionType, string> = {
  joy: '#fbbf24',
  gratitude: '#a78bfa',
  calm: '#60a5fa',
  excited: '#f472b6',
  anxious: '#fb923c',
  sad: '#94a3b8',
  angry: '#f87171',
  tired: '#6b7280'
}

export default function EmotionDistributionChart({ stats }: EmotionDistributionChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const chartData = stats
      .filter(stat => stat.count > 0)
      .map(stat => {
        const emotion = EMOTIONS.find(e => e.type === stat.type)
        return {
          name: emotion?.label || stat.type,
          value: stat.count,
          color: EMOTION_COLORS[stat.type],
          emoji: emotion?.emoji
        }
      })
    setData(chartData)
  }, [stats])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        暂无数据
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white p-2 rounded-lg shadow-lg border">
                    <div className="flex items-center gap-2">
                      <span>{data.emoji}</span>
                      <span className="font-medium">{data.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{data.value} 篇日记</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend 
            verticalAlign="middle" 
            align="right"
            layout="vertical"
            formatter={(value, entry: any) => (
              <span className="text-sm text-gray-600">
                {entry.payload.emoji} {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
