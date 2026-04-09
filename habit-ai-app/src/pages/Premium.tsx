import { motion } from 'framer-motion'
import { Crown, Check, Sparkles, Zap, Shield, X } from 'lucide-react'
import { useAppStore } from '../store'
import { useNavigate } from 'react-router-dom'

const FEATURES = [
  { icon: Zap, text: '无限习惯数量' },
  { icon: Sparkles, text: 'AI智能教练' },
  { icon: Shield, text: '高级数据分析' },
  { icon: Crown, text: '专属主题皮肤' },
  { icon: Check, text: '导出数据报告' },
  { icon: Check, text: '优先客户支持' }
]

export default function Premium() {
  const { user, updateUser } = useAppStore()
  const navigate = useNavigate()
  const isPremium = user.subscription === 'premium'

  const handleSubscribe = () => {
    // 模拟订阅流程
    updateUser({
      subscription: 'premium',
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    })
    alert('🎉 恭喜！你已成功升级到 Premium！')
    navigate('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen space-y-6"
    >
      {/* Header */}
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Premium 订阅</h1>
      </header>

      {/* Hero */}
      <div className="text-center py-8">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent-gold to-yellow-600 flex items-center justify-center shadow-2xl shadow-accent-gold/30"
        >
          <Crown className="w-12 h-12 text-white" />
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">升级到 Premium</h2>
        <p className="text-gray-400">解锁全部功能，加速你的习惯养成之旅</p>
      </div>

      {/* Features */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4">Premium 专属功能</h3>
        
        <div className="space-y-4">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center"
003e
                <feature.icon className="w-4 h-4 text-accent-gold" />
              </div>
              <span className="text-gray-300">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="glass-card p-6 text-center">
        <div className="mb-4">
          <span className="text-5xl font-bold text-white">$19.99</span>
          <span className="text-gray-400">/年</span>
        </div>
        
        <p className="text-sm text-gray-400 mb-6">
          相当于每月 $1.67，随时取消
        </p>

        {isPremium ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-accent-green">
              <Check className="w-5 h-5" />
              <span>你已经是 Premium 会员</span>
            </div>
            <p className="text-sm text-gray-400">
              有效期至: {user.subscriptionExpiry && new Date(user.subscriptionExpiry).toLocaleDateString('zh-CN')}
            </p>
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            className="w-full py-4 bg-gradient-to-r from-accent-gold to-yellow-500 text-dark-900 font-bold rounded-xl hover:shadow-lg hover:shadow-accent-gold/30 transition-all active:scale-95"
          >
            立即订阅
          </button>
        )}
      </div>

      {/* Guarantee */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          7天无理由退款保证 · 安全支付 · 随时取消
        </p>
      </div>

      {/* Comparison */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 text-left text-gray-400 font-medium">功能</th>
              <th className="p-4 text-center text-gray-400 font-medium">免费版</th>
              <th className="p-4 text-center text-accent-gold font-medium">Premium</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              { feature: '习惯数量', free: '3个', premium: '无限' },
              { feature: '基础统计', free: '✓', premium: '✓' },
              { feature: 'AI教练', free: '—', premium: '✓' },
              { feature: '高级分析', free: '—', premium: '✓' },
              { feature: '主题皮肤', free: '基础', premium: '全部' },
              { feature: '数据导出', free: '—', premium: '✓' },
              { feature: '广告', free: '有', premium: '无' },
            ].map((row, idx) => (
              <tr key={idx} className="border-b border-white/5">
                <td className="p-4 text-gray-300">{row.feature}</td>
                <td className="p-4 text-center text-gray-500">{row.free}</td>
                <td className="p-4 text-center text-accent-gold">{row.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
