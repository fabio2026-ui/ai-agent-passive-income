import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Send } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../store'
import type { AIInsight } from '../types'

interface AIChatProps {
  onClose: () => void
}

export default function AIChat({ onClose }: AIChatProps) {
  const { insights, markInsightAsRead } = useAppStore()
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: '你好！我是你的AI习惯教练 🤖 有什么可以帮助你的吗？', isUser: false }
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const unreadInsights = insights.filter(i => !i.read).slice(0, 5)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    
    setMessages(prev => [...prev, { text: input, isUser: true }])
    
    // 模拟AI回复
    setTimeout(() => {
      const responses = [
        '这是一个很好的问题！保持习惯的关键在于从小处着手。',
        '根据你的数据，我发现你在早晨的习惯表现最好！',
        '建议你可以尝试将这个习惯与已有的习惯绑定在一起。',
        '记住，偶尔的断档是正常的，重要的是尽快重新开始。',
        '你可以尝试设置一个具体的提醒来帮助记住这个习惯。'
      ]
      setMessages(prev => [...prev, { 
        text: responses[Math.floor(Math.random() * responses.length)], 
        isUser: false 
      }])
    }, 1000)
    
    setInput('')
  }

  const handleInsightClick = (insight: AIInsight) => {
    markInsightAsRead(insight.id)
    setMessages(prev => [...prev, { text: insight.content, isUser: false }])
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-dark-800 rounded-t-3xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI习惯教练</h3>
              <p className="text-xs text-gray-400">在线</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Insights */}
        {unreadInsights.length > 0 && (
          <div className="px-4 py-3 bg-primary-500/10 border-b border-white/10">
            <p className="text-xs text-primary-400 font-medium mb-2">为你推荐</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {unreadInsights.map(insight => (
                <button
                  key={insight.id}
                  onClick={() => handleInsightClick(insight)}
                  className="flex-shrink-0 px-3 py-2 bg-white/5 rounded-xl text-sm text-left hover:bg-white/10 transition-colors max-w-[200px]"
                >
                  <p className="text-xs text-gray-400 line-clamp-2">{insight.content}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.isUser
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/10 text-gray-200'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入消息..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
            <button
              onClick={handleSend}
              className="p-3 bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
