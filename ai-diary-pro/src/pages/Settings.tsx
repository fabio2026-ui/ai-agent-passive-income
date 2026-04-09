import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  User, 
  Bell, 
  Moon, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Mail,
  Clock
} from 'lucide-react'
import { useAppStore } from '../store/appStore'

export default function Settings() {
  const { 
    userName, 
    setUserName, 
    dailyReminder, 
    setDailyReminder,
    reminderTime,
    setReminderTime,
    darkMode,
    toggleDarkMode,
    subscription,
    cancelSubscription
  } = useAppStore()

  const [nameInput, setNameInput] = useState(userName)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    setNameInput(userName)
  }, [userName])

  const handleSaveName = () => {
    setUserName(nameInput.trim())
  }

  const handleExportData = () => {
    // 导出数据功能
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-diary-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      localStorage.clear()
      indexedDB.deleteDatabase('AIDiaryProDB')
      window.location.reload()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">设置</h1>
      </motion.div>

      {/* 个人信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 mb-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center"
          >
            <User className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-900">{userName || '未设置昵称'}</h2>
            <p className="text-sm text-gray-500">
              {subscription.isActive ? 'Pro 会员' : '免费用户'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              昵称
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="输入你的昵称"
                className="input-field flex-1"
              />
              <button
                onClick={handleSaveName}
                className="btn-secondary"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 通知设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 mb-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-400" />
          通知设置
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">每日提醒</p>
              <p className="text-sm text-gray-500">每天提醒你记录日记</p>
            </div>
            
            <button
              onClick={() => setDailyReminder(!dailyReminder)}
              className={`
                w-12 h-6 rounded-full transition-colors relative
                ${dailyReminder ? 'bg-primary-500' : 'bg-gray-200'}
              `}
            >
              <div className={`
                w-5 h-5 bg-white rounded-full shadow absolute top-0.5
                transition-transform
                ${dailyReminder ? 'translate-x-6' : 'translate-x-0.5'}
              `} />
            </button>
          </div>

          {dailyReminder && (
            <div className="flex items-center gap-3 pl-4 border-l-2 border-gray-100">
              <Clock className="w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="input-field w-auto"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* 外观设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6 mb-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-gray-400" />
          外观
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">深色模式</p>
            <p className="text-sm text-gray-500">切换深色主题</p>
          </div>
          
          <button
            onClick={toggleDarkMode}
            className={`
              w-12 h-6 rounded-full transition-colors relative
              ${darkMode ? 'bg-primary-500' : 'bg-gray-200'}
            `}
          >
            <div className={`
              w-5 h-5 bg-white rounded-full shadow absolute top-0.5
              transition-transform
              ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}
            `} />
          </button>
        </div>
      </motion.div>

      {/* 数据管理 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6 mb-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-400" />
          数据管理
        </h3>

        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">导出数据</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={handleClearData}
            className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="text-red-600">清除所有数据</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </motion.div>

      {/* 订阅管理 */}
      {subscription.isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6 mb-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">订阅管理</h3>

          <div className="bg-amber-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-amber-700 font-medium mb-1">
              Pro 会员
            </div>
            <p className="text-sm text-amber-600">
              到期时间: {subscription.expiryDate?.toLocaleDateString('zh-CN')}
            </p>
          </div>

          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-red-600 text-sm hover:underline"
            >
              取消订阅
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">确定要取消订阅吗？你仍可使用 Pro 功能直到到期日。</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  保留订阅
                </button>
                <button
                  onClick={cancelSubscription}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  确认取消
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 关于 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">AI日记Pro</p>            
            <p className="text-sm text-gray-500">版本 1.0.0</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            © 2024 AI日记Pro. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
