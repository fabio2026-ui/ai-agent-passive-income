import { NavLink, useLocation } from 'react-router-dom'
import { 
  Home, 
  PenLine, 
  History, 
  BarChart3, 
  Sparkles,
  Settings,
  Crown
} from 'lucide-react'
import { useAppStore } from '../store/appStore'

export default function Navigation() {
  const location = useLocation()
  const { subscription } = useAppStore()
  
  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/history', icon: History, label: '历史' },
    { path: '/write', icon: PenLine, label: '写日记', isMain: true },
    { path: '/stats', icon: BarChart3, label: '统计' },
    { path: '/ai-features', icon: Sparkles, label: 'AI' },
  ]

  const isActive = (path: string) => {
    if (path === '/write') {
      return location.pathname.startsWith('/write')
    }
    return location.pathname === path
  }

  return (
    <>
      {/* 底部导航栏 - 移动端 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-inset-bottom z-50 md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: active }) => `
                flex flex-col items-center justify-center py-2 px-3 rounded-xl
                transition-all duration-200
                ${active 
                  ? 'text-primary-600' 
                  : 'text-gray-400 hover:text-gray-600'
                }
                ${item.isMain 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' 
                  : ''
                }
              `}
            >
              <item.icon className={`w-5 h-5 ${item.isMain ? 'w-6 h-6' : ''}`} />
              {!item.isMain && (
                <span className="text-xs mt-1">{item.label}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* 侧边栏 - 桌面端 */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex-col z-50">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <PenLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">AI日记Pro</h1>
              {subscription.isActive && (
                <div className="flex items-center gap-1 text-xs text-amber-500">
                  <Crown className="w-3 h-3" />
                  <span>Pro会员</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={() => `
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive(item.path)
                  ? 'bg-primary-50 text-primary-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <NavLink
            to="/settings"
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl
              transition-all duration-200
              ${isActive 
                ? 'bg-primary-50 text-primary-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            <Settings className="w-5 h-5" />
            <span>设置</span>
          </NavLink>
          
          {!subscription.isActive && (
            <NavLink
              to="/subscription"
              className="mt-2 flex items-center gap-3 px-4 py-3 rounded-xl
                         bg-gradient-to-r from-amber-100 to-orange-100 
                         text-amber-700 font-medium hover:shadow-md transition-all"
            >
              <Crown className="w-5 h-5" />
              <span>升级 Pro</span>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  )
}
