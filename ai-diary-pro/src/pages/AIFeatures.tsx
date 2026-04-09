import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Sparkles, 
  Brain, 
  FileText, 
  TrendingUp,
  Zap,
  Shield,
  Check,
  Loader2
} from 'lucide-react'
import { useAppStore } from '../store/appStore'

export default function AIFeatures() {
  const { subscription, generateWeeklyReport } = useAppStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<any>(null)

  const features = [
    {
      icon: Brain,
      title: '智能情绪分析',
      description: 'AI 自动分析你的日记内容，识别情绪模式和关键词',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: FileText,
      title: '自动总结生成',
      description: '为每篇日记生成简洁的摘要，快速回顾重要时刻',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: TrendingUp,
      title: '情绪趋势预测',
      description: '基于历史数据分析情绪走向，提前预警负面情绪',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Zap,
      title: '个性化建议',
      description: '根据你的情绪状态，提供针对性的改善建议',
      color: 'bg-amber-100 text-amber-600'
    },
    {
      icon: Shield,
      title: '隐私保护',
      description: '本地 AI 处理，你的日记数据完全保密',
      color: 'bg-red-100 text-red-600'
    }
  ]

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      const report = await generateWeeklyReport(startDate, endDate)
      setGeneratedReport(report)
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!subscription.isActive) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI 智能助手</h1>
          
          <p className="text-gray-600 max-w-lg mx-auto mb-8">
            解锁 AI 的强大能力，让智能分析帮助你更好地了解自己，
            发现情绪背后的模式和成长机会
          </p>
          
          <a
            href="/subscription"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-500 
                       text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all"
          >
            解锁 AI 功能
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="card p-6 opacity-60"
            >
              <div className={`
                w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4
              `}>
                <feature.icon className="w-6 h-6" />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI 智能助手</h1>
        </div>
        
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
        >
          Pro 已激活
        </span>
      </motion.div>

      {/* 功能列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="card p-6"
          >
            <div className={`
              w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4
            `}>
              <feature.icon className="w-6 h-6" />
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* 生成周报 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">情绪周报</h2>
            <p className="text-sm text-gray-500">生成本周的情绪分析报告</p>
          </div>
          
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="btn-primary flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                生成报告
              </>
            )}
          </button>
        </div>

        {generatedReport && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-900">报告已生成</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">
                    {generatedReport.totalEntries}
                  </p>
                  <p className="text-sm text-gray-600">本周日记</p>
                </div>
                
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600 capitalize">
                    {generatedReport.dominantEmotion === 'joy' && '😊'}
                    {generatedReport.dominantEmotion === 'calm' && '😌'}
                    {generatedReport.dominantEmotion === 'gratitude' && '🙏'}
                  </p>
                  <p className="text-sm text-gray-600">主导情绪</p>
                </div>
                
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {generatedReport.moodTrend}
                  </p>
                  <p className="text-sm text-gray-600">情绪趋势</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">本周亮点</h4>
                <ul className="space-y-1">
                  {generatedReport.highlights.map((highlight: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary-500">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">AI 建议</h4>
                <ul className="space-y-1">
                  {generatedReport.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-amber-500">💡</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
