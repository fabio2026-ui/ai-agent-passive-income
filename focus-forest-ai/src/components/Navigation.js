import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Timer, 
  TreePine, 
  BarChart3, 
  Settings,
  User,
  Crown
} from 'lucide-react';
import { useUserStore } from '../store';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/timer', icon: Timer, label: '计时器' },
  { path: '/forest', icon: TreePine, label: '森林' },
  { path: '/stats', icon: BarChart3, label: '统计' },
  { path: '/profile', icon: User, label: '我的' },
];

function Navigation() {
  const location = useLocation();
  const { isPremium, user } = useUserStore();
  const [showUpgradeBadge, setShowUpgradeBadge] = useState(false);

  useEffect(() => {
    // 显示升级徽章动画
    if (!isPremium) {
      const timer = setTimeout(() => {
        setShowUpgradeBadge(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isPremium]);

  return (
    <>
      {/* 桌面端侧边栏 */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-white/90 backdrop-blur-lg border-r border-forest-200 flex-col items-center py-8 z-50">
        <Link to="/" className="mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-forest-400 to-forest-600 rounded-xl flex items-center justify-center shadow-lg">
            <TreePine className="w-7 h-7 text-white" />
          </div>
        </Link>
        
        <div className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative p-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-forest-100 text-forest-700' 
                    : 'text-gray-500 hover:bg-forest-50 hover:text-forest-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                
                {/* 提示文字 */}
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-forest-100 rounded-xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
        
        {/* 设置按钮 */}
        <Link 
          to="/settings"
          className={`p-3 rounded-xl transition-all duration-300 ${
            location.pathname === '/settings'
              ? 'bg-forest-100 text-forest-700'
              : 'text-gray-500 hover:bg-forest-50 hover:text-forest-600'
          }`}
        >
          <Settings className="w-6 h-6" />
        </Link>
      </nav>
      
      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-forest-200 px-4 py-2 z-50 safe-area-pb"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[60px] ${
                  isActive 
                    ? 'text-forest-600' 
                    : 'text-gray-400'
                }`}
              >
                <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-forest-100' : ''
                }`}>
                  <Icon className="w-5 h-5" />
                  
                  {/* 升级徽章 */}
                  {item.path === '/forest' && !isPremium && showUpgradeBadge && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        {/* 升级按钮 */}
        <AnimatePresence>
          {!isPremium && showUpgradeBadge && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute -top-14 left-1/2 -translate-x-1/2"
            >
              <Link 
                to="/premium"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-lg shadow-amber-400/30 text-sm font-semibold"
              >
                <Crown className="w-4 h-4" />
                升级会员
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

export default Navigation;
