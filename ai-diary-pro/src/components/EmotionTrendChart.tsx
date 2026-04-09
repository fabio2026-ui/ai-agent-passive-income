import { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { EMOTIONS, EmotionType } from '../db/database'

interface WeeklyData {
  date: Date
  emotion: EmotionType | null
}

interface EmotionTrendChartProps {
  data: WeeklyData[]
}

// 情绪分数映射
const EMOTION_SCORES: Record<EmotionType, number> = {
  joy: 9,
  gratitude: 8,
  calm: 7,
  excited: 8,
  anxious: 3,
  sad: 2,
  angry: 2,
  tired: 4
}

export default function EmotionTrendChart({ data }: EmotionTrendChartProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const processedData = data.map(day => {
      const score = day.emotion ? EMOTION_SCORES[day.emotion] : null
      const emotion = day.emotion ? EMOTIONS.find(e => e.type === day.emotion) : null
      
      return {
        date: format(day.date, 'MM/dd', { locale: zhCN }),
        fullDate: format(day.date, 'M月d日', { locale: zhCN }),
        score,
        emotion: emotion?.label || null,
        emoji: emotion?.emoji || null
      }
    })
    setChartData(processedData)
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        暂无数据
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            domain={[0, 10]} 
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => value > 0 ? value : ''}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border">
                    <p className="font-medium text-gray-900">{data.fullDate}</p>
                    {data.score ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span>{data.emoji}</span>
                        <span className="text-sm text-gray-600">
                          {data.emotion} ({data.score}分)
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">未记录</p>
                    )}
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#6366f1' }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
