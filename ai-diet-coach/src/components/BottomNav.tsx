import { NavLink, useLocation } from 'react-router-dom'
import { Home, PieChart, Camera, MessageCircle, User } from 'lucide-react'
import { useAdviceStore } from '../stores/adviceStore'

const navItems = [
  { path: '/dashboard', icon: Home, label: '首页' },
  { path: '/nutrition', icon: PieChart, label: '营养' },
  { path: '/meals', icon: Camera, label: '记录' },
  { path: '/advice', icon: MessageCircle, label: '建议' },
  { path: '/profile', icon: User, label: '我的' }
]

export default function BottomNav() {
  const location = useLocation()
  const { unreadCount } = useAdviceStore()
  
  // Don't show nav on certain pages
  if (location.pathname === '/' || location.pathname === '/login') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="glass mx-4 mb-4 rounded-2xl shadow-lg border border-white/50">
        <ul className="flex justify-around items-center h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            const showBadge = path === '/advice' && unreadCount > 0
            
            return (
              <li key={path}>
                <NavLink
                  to={path}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-0.5 font-medium">{label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
