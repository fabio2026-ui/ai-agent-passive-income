import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './stores/authStore'
import { useSubscriptionStore } from './stores/subscriptionStore'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const NutritionAnalysisPage = lazy(() => import('./pages/NutritionAnalysisPage'))
const MealLogPage = lazy(() => import('./pages/MealLogPage'))
const AdvicePage = lazy(() => import('./pages/AdvicePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))

// Eager load critical components
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import OfflineNotice from './components/OfflineNotice'

// Optimized loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="animate-pulse flex flex-col items-center space-y-4">
      <div className="w-12 h-12 bg-emerald-500 rounded-full animate-bounce"></div>
      <div className="text-emerald-600 font-medium">加载中...</div>
    </div>
  </div>
)

function App() {
  const location = useLocation()
  const { checkAuth, isAuthenticated } = useAuthStore()
  const { checkSubscription } = useSubscriptionStore()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      checkSubscription()
    }
  }, [isAuthenticated])

  // Pages that should show bottom nav
  const showNav = isAuthenticated && !location.pathname.includes('/login') && !location.pathname.includes('/onboarding')

  // Prefetch routes on idle
  useEffect(() => {
    const prefetchRoutes = () => {
      const routes = [
        () => import('./pages/DashboardPage'),
        () => import('./pages/NutritionAnalysisPage'),
        () => import('./pages/MealLogPage'),
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
    <div className="app">
      <OfflineNotice />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <Suspense fallback={<PageLoader />}>
              <HomePage />
            </Suspense>
          } />
          <Route path="/login" element={
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          } />
          <Route path="/onboarding" element={
            <Suspense fallback={<PageLoader />}>
              <OnboardingPage />
            </Suspense>
          } />
          <Route path="/dashboard" element={
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          } />
          <Route path="/nutrition" element={
            <Suspense fallback={<PageLoader />}>
              <NutritionAnalysisPage />
            </Suspense>
          } />
          <Route path="/meals" element={
            <Suspense fallback={<PageLoader />}>
              <MealLogPage />
            </Suspense>
          } />
          <Route path="/advice" element={
            <Suspense fallback={<PageLoader />}>
              <AdvicePage />
            </Suspense>
          } />
          <Route path="/profile" element={
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          } />
          <Route path="/subscription" element={
            <Suspense fallback={<PageLoader />}>
              <SubscriptionPage />
            </Suspense>
          } />
        </Routes>
      </AnimatePresence>
      
      {showNav && <BottomNav />}
      <InstallPrompt />
    </div>
  )
}

export default App
