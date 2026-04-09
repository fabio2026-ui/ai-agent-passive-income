import { motion } from 'framer-motion'
import { Gift, Lock, Sparkles, Crown, Zap, Star, Check } from 'lucide-react'
import { useAppStore } from '../store'
import { useNavigate } from 'react-router-dom'

const REWARDS = [
  {
    id: 'rest-day',
    name: '休息日',
    description: '跳过一天不打破连续记录',
    icon: '☕',
    pointsCost: 100,
    color: '#f59e0b',
    premium: false
  },
  {
    id: 'theme-skin',
    name: '主题皮肤',
    description: '解锁5款限定主题颜色',
    icon: '🎨',
    pointsCost: 200,
    color: '#8b5cf6',
    premium: false
  },
  {
    id: 'advanced-stats',
    name: '高级统计',
    description: '查看详细数据分析和趋势预测',
    icon: '📊',
    pointsCost: 300,
    color: '#0ea5e9',
    premium: false
  },
  {
    id: 'ai-coach-7d',
    name: 'AI教练7天',
    description: '获得7天AI个性化指导',
    icon: '🤖',
    pointsCost: 500,
    color: '#10b981',
    premium: false
  },
  {
    id: 'habit-templates',
    name: '习惯模板包',
    description: '解锁50+精选习惯模板',
    icon: '📚',
    pointsCost: 0,
    color: '#ec4899',
    premium: true
  },
  {
    id: 'unlimited-habits',
    name: '无限习惯',
    description: '创建无限数量的习惯',
    icon: '♾️',
    pointsCost: 0,
    color: '#ef4444',
    premium: true
  }
]

export default function Rewards() {
  const { user, rewards, claimReward } = useAppStore()
  const navigate = useNavigate()

  const handleClaim = (rewardId: string, isPremium: boolean) => {
    if (isPremium && user.subscription !== 'premium') {
      navigate('/premium')
      return
    }

    const success = claimReward(rewardId)
    if (success) {
      // Show success animation
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-white">奖励商店</h1>
        <p className="text-gray-400">用积分兑换奖励，解锁高级功能</p>
      </header>

      {/* Points Display */}
      <div className="glass-card p-6 text-center bg-gradient-to-r from-primary-500/20 to-accent-purple/20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-accent-gold" />
          <span className="text-4xl font-bold text-white">{user.totalPoints}</span>
        </div>
        <p className="text-gray-400">可用积分</p>
        
        {user.subscription !== 'premium' && (
          <button
            onClick={() => navigate('/premium')}
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300"
          >
            <Crown className="w-4 h-4" />
            升级到Premium获取更多积分
          </button>
        )}
      </div>

      {/* Rewards Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">可用奖励</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {REWARDS.map((reward) => {
            const isClaimed = rewards.find(r => r.id === reward.id)?.claimed
            const canAfford = user.totalPoints >= reward.pointsCost
            const isLocked = reward.premium && user.subscription !== 'premium'

            return (
              <motion.div
                key={reward.id}
                whileHover={!isLocked ? { scale: 1.02 } : {}}
                className={`glass-card p-4 relative ${
                  isLocked ? 'opacity-70' : ''
                }`}
              >
                {isLocked && (
                  <div className="absolute inset-0 bg-dark-900/50 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <span className="text-xs text-gray-400">Premium专属</span>
                    </div>
                  </div>
                )}

                <div className="text-3xl mb-3">{reward.icon}</div>
                
                <h3 className="font-semibold text-white mb-1">{reward.name}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{reward.description}</p>

                {isClaimed ? (
                  <div className="flex items-center justify-center gap-1 text-accent-green text-sm">
                    <Check className="w-4 h-4" />
                    已兑换
                  </div>
                ) : (
                  <button
                    onClick={() => handleClaim(reward.id, reward.premium)}
                    disabled={!canAfford && !reward.premium}
                    className={`w-full py-2 rounded-xl text-sm font-medium transition-all ${
                      reward.premium
                        ? 'bg-gradient-to-r from-accent-gold to-yellow-500 text-dark-900'
                        : canAfford
                          ? 'bg-primary-500 text-white hover:bg-primary-600'
                          : 'bg-white/10 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {reward.premium ? (
                      <span className="flex items-center justify-center gap-1">
                        <Crown className="w-4 h-4" />
                        Premium
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <Zap className="w-4 h-4" />
                        {reward.pointsCost} 积分
                      </span>
                    )}
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* How to Earn */}
      <div className="glass-card p-4">
        <h3 className="font-semibold text-white mb-4">如何获得积分</h3>
        
        <div className="space-y-3">
          {[
            { action: '完成一次打卡', points: 10 },
            { action: '连续打卡7天', points: 50 },
            { action: '连续打卡30天', points: 200 },
            { action: '解锁成就', points: 30 },
            { action: 'Premium订阅奖励', points: 100 }
          ].map((item) => (
            <div key={item.action} className="flex items-center justify-between">
              <span className="text-gray-400">{item.action}</span>
              <span className="flex items-center gap-1 text-accent-gold font-medium">
                <Star className="w-4 h-4" />
                +{item.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
