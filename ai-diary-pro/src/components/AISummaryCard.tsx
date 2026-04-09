import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Lightbulb, Tag } from 'lucide-react'
import { AISummary } from '../store/appStore'

interface AISummaryCardProps {
  summary: AISummary
}

export default function AISummaryCard({ summary }: AISummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="bg-gradient-to-r from-primary-500 to-purple-500 p-4">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI 智能分析</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 总结 */}
        <div>
          <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            情绪摘要
          </div>
          <p className="text-gray-600 leading-relaxed">{summary.summary}</p>
        </div>

        {/* 关键词 */}
        {summary.keywords.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <Tag className="w-4 h-4 text-primary-500" />
              关键词
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 情绪趋势 */}
        <div>
          <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            情绪趋势
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
            <span>↗</span>
            {summary.moodTrend}
          </div>
        </div>

        {/* 建议 */}
        {summary.insights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              AI 建议
            </div>
            <ul className="space-y-2">
              {summary.insights.map((insight, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-gray-600 text-sm"
                >
                  <span className="text-primary-500">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  )
}
