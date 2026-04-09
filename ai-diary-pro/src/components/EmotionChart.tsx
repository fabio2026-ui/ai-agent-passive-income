import { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { db } from '../db/database'

interface EmotionChartProps {}

export default function EmotionChart({}: EmotionChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    loadChartData()
  }, [])

  const loadChartData = async () => {
    try {
      const endDate = new Date()
      const startDate = subDays(endDate, 6)
      const days = eachDayOfInterval({ start: startDate, end: endDate })

      const entries = await db.entries
        .where('date')
        .between(startDate, endDate)
        .toArray()

      const chartData = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd')
        const dayEntries = entries.filter(e => 
          format(new Date(e.date), 'yyyy-MM-dd') === dayStr
        )
        
        return {
          day: format(day, 'EEE', { locale: zhCN }),
          fullDate: format(day, 'M月d日', { locale: zhCN }),
          count: dayEntries.length,
          hasEntry: dayEntries.length > 0
        }
      })

      setData(chartData)
    } catch (error) {
      console.error('Failed to load chart data:', error)
    }
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis 
            hide={true}
            domain={[0, 'dataMax + 1']}
          />
          <Tooltip
            cursor={{ fill: '#f3f4f6' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white p-2 rounded-lg shadow-lg border">
                    <p className="font-medium text-gray-900">{data.fullDate}</p>
                    <p className="text-sm text-gray-600">
                      {data.count > 0 ? `记录了 ${data.count} 篇日记` : '未记录'}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar 
            dataKey="count" 
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.hasEntry ? '#6366f1' : '#e5e7eb'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
