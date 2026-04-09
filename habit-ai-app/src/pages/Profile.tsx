import { motion } from 'framer-motion'
import { User, Crown, Settings, Bell, HelpCircle, LogOut, ChevronRight, Sparkles } from 'lucide-react'
import { useAppStore } from '../store'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

export default function Profile() {
  const { user, achievements } = useAppStore()
  const navigate = useNavigate()

  const unlockedAchievements = achievements.filter(a => a.unlockedAt)

  const menuItems = [
    { icon: Crown, label: '订阅管理', action: () => navigate('/premium'), badge: user.subscription === 'premium' ? 'Premium' : '免费版' },
    { icon: Bell, label: '通知设置', action: () => {} },
    { icon: Settings, label: '通用设置', action: () => {} },
    { icon: HelpCircle, label: '帮助与支持', action: () => {} },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-3xl">
            {user.avatar || '👤'}
          </div>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-sm text-gray-400">
              加入于 {format(new Date(user.joinedAt), 'yyyy年M月')}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              {user.subscription === 'premium' ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-gold/20 text-accent-gold rounded-full text-xs font-medium">
                  <Crown className="w-3 h-3" />
                  Premium
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-gray-400 rounded-full text-xs">
                  免费版
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user.currentLevel}</p>
            <p className="text-xs text-gray-400">等级</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user.totalPoints}</p>
            <p className="text-xs text-gray-400">积分</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user.streakDays}</p>
            <p className="text-xs text-gray-400">连续天数</p>
          </div>
        </div>
      </div>

      {/* Premium Promo */}
      {user.subscription !== 'premium' && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/premium')}
          className="glass-card p-4 cursor-pointer bg-gradient-to-r from-accent-gold/20 to-yellow-500/20 border-accent-gold/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-accent-gold" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-white">升级到 Premium</h3>
              <p className="text-sm text-gray-400">解锁无限习惯、AI教练和更多功能</p>
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </motion.div>
      )}

      {/* Achievements Preview */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">成就</h3>
          <span className="text-sm text-primary-400">
            {unlockedAchievements.length}/{achievements.length}
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
                achievement.unlockedAt
                  ? 'bg-primary-500/20'
                  : 'bg-white/5 opacity-50'
              }`}
            >
              {achievement.icon}
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="glass-card overflow-hidden">
        {menuItems.map((item, idx) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors ${
              idx !== menuItems.length - 1 ? 'border-b border-white/10' : ''
            }`}
          >
            <item.icon className="w-5 h-5 text-gray-400" />
            <span className="flex-1 text-left text-white">{item.label}</span>
            {item.badge && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.badge === 'Premium' 
                  ? 'bg-accent-gold/20 text-accent-gold' 
                  : 'bg-white/10 text-gray-400'
              }`}>
                {item.badge}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button className="w-full flex items-center justify-center gap-2 p-4 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
        <LogOut className="w-5 h-5" />
        退出登录
      </button>

      {/* Version */}
      <p className="text-center text-xs text-gray-600">HabitAI v1.0.0</p>
    </motion.div>
  )
}
