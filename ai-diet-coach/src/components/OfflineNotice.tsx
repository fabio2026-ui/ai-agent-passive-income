import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [showNotice, setShowNotice] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      setShowNotice(true)
      setTimeout(() => setShowNotice(false), 3000)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setShowNotice(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    if (!navigator.onLine) {
      setShowNotice(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showNotice) return null

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOffline ? 'bg-gray-800' : 'bg-primary-500'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-center gap-2 py-2 px-4">
        {isOffline ? (
          <>
            <WifiOff className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">离线模式 - 数据将在恢复连接后同步</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">已连接到网络</span>
          </>
        )}
      </div>
    </div>
  )
}
