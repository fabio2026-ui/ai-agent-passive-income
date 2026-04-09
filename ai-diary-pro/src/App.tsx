import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/appStore'
import Layout from './components/Layout'

// Lazy load pages for code splitting - 实现代码分割
const Home = lazy(() => import('./pages/Home'))
const Write = lazy(() => import('./pages/Write'))
const History = lazy(() => import('./pages/History'))
const Stats = lazy(() => import('./pages/Stats'))
const Settings = lazy(() => import('./pages/Settings'))
const Subscription = lazy(() => import('./pages/Subscription'))
const AIFeatures = lazy(() => import('./pages/AIFeatures'))
const Onboarding = lazy(() => import('./pages/Onboarding'))

// 优化的加载组件
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
      </div>
      <div className="text-indigo-600 font-medium animate-pulse">加载中...</div>
    </div>
  </div>
)

function App() {
  const { isFirstVisit, setFirstVisit, loadSettings } = useAppStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // 预加载常用路由
  useEffect(() => {
    const prefetchRoutes = () => {
      // 预加载可能会访问的页面
      const routes = [
        () => import('./pages/Write'),
        () => import('./pages/History'),
      ]
      routes.forEach(route => route())
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchRoutes, { timeout: 3000 })
    } else {
      setTimeout(prefetchRoutes, 3000)
    }
  }, [])

  // 首次访问显示引导页
  if (isFirstVisit) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Onboarding onComplete={() => setFirstVisit(false)} />
      </Suspense>
    )
  }

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/write" element={<Write />} />
          <Route path="/write/:date" element={<Write />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/ai-features" element={<AIFeatures />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
