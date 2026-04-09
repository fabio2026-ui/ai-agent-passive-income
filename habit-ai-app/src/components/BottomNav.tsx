import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ListTodo, BarChart3, Gift, User } from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/habits', icon: ListTodo, label: '习惯' },
  { path: '/stats', icon: BarChart3, label: '统计' },
  { path: '/rewards', icon: Gift, label: '奖励' },
  { path: '/profile', icon: User, label: '我的' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-800/80 backdrop-blur-lg border-t border-white/10 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive ? 'text-primary-400' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary-500/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
