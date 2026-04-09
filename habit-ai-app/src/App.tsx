import { lazy, Suspense, useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from './store'
import { aiService } from './services/ai'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const Habits = lazy(() => import('./pages/Habits'))
const Stats = lazy(() => import('./pages/Stats'))
const Rewards = lazy(() => import('./pages/Rewards'))
const Profile = lazy(() => import('./pages/Profile'))
const Premium = lazy(() => import('./pages/Premium'))

// Eager load critical components
import BottomNav from './components/BottomNav'
const AIChat = lazy(() => import('./components/AIChat'))

// Optimized loading component
const PageLoader = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 bg-primary-500 rounded-full opacity-20 animate-ping"></div>
        <div className="relative w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="text-primary-400 font-medium animate-pulse">加载中...</div>
    </div>
  </div>
)

function App() {
  const [showAIChat, setShowAIChat] = useState(false)
  const { habits, checkIns, addInsight, insights } = useAppStore()

  // Generate AI insights on app load
  useEffect(() => {
    const generateInsights = () => {
      // Daily encouragement
      const lastEncouragement = insights.find(i => i.type === 'encouragement' && 
        new Date(i.createdAt).toDateString() === new Date().toDateString()
      )
      
      if (!lastEncouragement) {
        const encouragement = aiService.generateDailyEncouragement(habits, checkIns)
        addInsight(encouragement)
      }

      // Tips based on habits
      if (Math.random() > 0.7) {
        const tips = aiService.generateHabitTips(habits)
        tips.forEach(tip => addInsight(tip))
      }
    }

    generateInsights()
  }, [])

  // Prefetch routes on idle
  useEffect(() => {
    const prefetchRoutes = () => {
      const routes = [
        () => import('./pages/Habits'),
        () => import('./pages/Stats'),
      ]
      routes.forEach(route => route())
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchRoutes, { timeout: 2000 })
    } else {
      setTimeout(prefetchRoutes, 2000)
    }
  }, [])

  return (
    <div className="min-h-screen bg-dark-900 text-white pb-20">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent-purple/20 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <main className="relative z-10 max-w-lg mx-auto px-4 py-6">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home onOpenAI={() => setShowAIChat(true)} />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* AI Chat Modal */}
      <AnimatePresence>
        {showAIChat && (
          <Suspense fallback={null}>
            <AIChat onClose={() => setShowAIChat(false)} />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
