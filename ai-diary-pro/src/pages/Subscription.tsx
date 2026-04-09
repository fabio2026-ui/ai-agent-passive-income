import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Crown, 
  Check, 
  Sparkles,
  Shield,
  Zap,
  Cloud,
  Palette
} from 'lucide-react'
import { useAppStore } from '../store/appStore'

export default function Subscription() {
  const { subscription, subscribe } = useAppStore()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [isProcessing, setIsProcessing] = useState(false)

  const features = [
    { icon: Sparkles, text: '无限 AI 情绪分析' },
    { icon: Zap, text: '智能总结与洞察' },
    { icon: Shield, text: '高级隐私保护' },
    { icon: Cloud, text: '云端备份同步' },
    { icon: Palette, text: '自定义主题' },
    { icon: Crown, text: '优先客服支持' }
  ]

  const handleSubscribe = async () => {
    setIsProcessing(true)
    // 模拟支付处理
    await new Promise(resolve => setTimeout(resolve, 1500))
    subscribe(selectedPlan)
    setIsProcessing(false)
  }

  if (subscription.isActive) {
    return (
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Crown className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pro 会员已激活</h1>
          <p className="text-gray-600 mb-6">
            感谢你的支持！你已解锁所有 AI 功能
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">当前方案</span>
              <span className="font-medium">
                {subscription.plan === 'yearly' ? '年度会员' : '月度会员'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">到期时间</span>
              <span className="font-medium">
                {subscription.expiryDate?.toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {subscription.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-gray-700"
              >
                <Check className="w-5 h-5 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      {/* 头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Crown className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">升级到 Pro</h1>
        <p className="text-gray-600">解锁 AI 的全部能力，更好地了解自己</p>
      </motion.div>

      {/* 方案选择 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 mb-8"
      >
        {/* 年度方案 */}
        <button
          onClick={() => setSelectedPlan('yearly')}
          className={`
            w-full p-5 rounded-2xl border-2 text-left transition-all relative
            ${selectedPlan === 'yearly' 
              ? 'border-amber-500 bg-amber-50/50' 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <div className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full"
          >
            推荐 · 省 50%
          </div>
          
          <div className="flex items-center justify-between"
003e
            <div>
              <p className="font-semibold text-gray-900">年度会员</p>
              <p className="text-sm text-gray-500">$29.99 / 年</p>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">$29.99</p>
              <p className="text-xs text-gray-500">约 $2.5/月</p>
            </div>
          </div>
          
          {selectedPlan === 'yearly' && (
            <div className="absolute top-5 right-5 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>

        {/* 月度方案 */}
        <button
          onClick={() => setSelectedPlan('monthly')}
          className={`
            w-full p-5 rounded-2xl border-2 text-left transition-all relative
            ${selectedPlan === 'monthly' 
              ? 'border-primary-500 bg-primary-50/50' 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">月度会员</p>
              <p className="text-sm text-gray-500">$4.99 / 月</p>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">$4.99</p>
              <p className="text-xs text-gray-500">每月续费</p>
            </div>
          </div>
          
          {selectedPlan === 'monthly' && (
            <div className="absolute top-5 right-5 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      </motion.div>

      {/* 功能列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 mb-8"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Pro 会员包含</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature.text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                <feature.icon className="w-4 h-4 text-primary-600" />
              </div>
              <span className="text-sm text-gray-700">{feature.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 订阅按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={handleSubscribe}
          disabled={isProcessing}
          className={`
            w-full py-4 rounded-xl font-semibold text-white
            bg-gradient-to-r from-amber-500 to-orange-500
            hover:shadow-lg hover:shadow-amber-500/30
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
          `}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              处理中...
            </>
          ) : (
            <>
              <Crown className="w-5 h-5" />
              立即升级 - {selectedPlan === 'yearly' ? '$29.99/年' : '$4.99/月'}
            </>
          )}
        </button>
        
        <p className="text-center text-xs text-gray-400 mt-4">
          安全支付 · 随时取消 · 7天无理由退款
        </p>
      </motion.div>
    </div>
  )
}
