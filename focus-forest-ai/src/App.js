import React, { Suspense, lazy, memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Lazy load components for code splitting
const Navigation = lazy(() => import('./components/Navigation'));
const PremiumBanner = lazy(() => import('./components/PremiumBanner'));

// Loading fallback component
const ComponentLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center justify-center p-4"
  >
    <div className="animate-pulse flex space-x-2">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    </div>
  </motion.div>
);

// Error boundary fallback
const ErrorFallback = ({ error }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <h3 className="text-red-800 font-semibold">Something went wrong:</h3>
    <p className="text-red-600 text-sm">{error.message}</p>
  </div>
);

// Optimized store hook with selector
import { useUserStore } from './store';

// Memoized main content to prevent unnecessary re-renders
const MainContent = memo(({ children, isPremium }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="flex-1 pb-20"
  >
    {!isPremium && (
      <Suspense fallback={<div className="h-16 bg-gradient-to-r from-green-100 to-green-200 animate-pulse" />}>
        <PremiumBanner />
      </Suspense>
    )}
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      {children}
    </main>
  </motion.div>
));

MainContent.displayName = 'MainContent';

function App() {
  const { isPremium } = useUserStore();
  const location = useLocation();

  // Prefetch navigation on idle
  React.useEffect(() => {
    const prefetchNavigation = () => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/static/js/Navigation.chunk.js';
      document.head.appendChild(link);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchNavigation, { timeout: 2000 });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <MainContent isPremium={isPremium}>
        <Suspense fallback={<ComponentLoader />}>
          <Outlet />
        </Suspense>
      </MainContent>
      
      <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse" />}>
        <Navigation />
      </Suspense>
    </div>
  );
}

// Add display name for debugging
App.displayName = 'App';

export default App;
