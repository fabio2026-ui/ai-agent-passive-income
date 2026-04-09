import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, PenLine, Sparkles, Shield } from 'lucide-react'
import { useAppStore } from '../store/appStore'

interface OnboardingProps {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const { setUserName } = useAppStore()

  const steps = [
    {
      icon: PenLine,
      title: '记录每一天',
      description: '用文字记录生活中的点滴，无论是快乐还是烦恼',
      color: 'from-primary-500 to-primary-600'
    },
    {
      icon: Sparkles,
      title: 'AI 智能分析',
      description: 'AI 自动分析你的情绪状态，发现隐藏在文字中的模式',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Shield,
      title: '隐私安全',
      description: '你的日记完全存储在本地，我们不会上传任何内容',
      color: 'from-green-500 to-green-600'
    }
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      if (name.trim()) {
        setUserName(name.trim())
      }
      onComplete()
    }
  }

  const currentStep = steps[step]

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 进度指示器 */}
      <div className="flex justify-center gap-2 pt-8">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${index === step ? 'w-6 bg-primary-500' : 'bg-gray-200'}
            `}
          />
        ))}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="text-center max-w-sm"
        >
          <div className={`
            w-24 h-24 rounded-3xl bg-gradient-to-r ${currentStep.color}
            flex items-center justify-center mx-auto mb-8 shadow-xl
          `}>
            <currentStep.icon className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {currentStep.title}
          </h1>

          <p className="text-gray-600 mb-8">
            {currentStep.description}
          </p>

          {step === steps.length - 1 && (
            <div className="mb-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="怎么称呼你？（可选）"
                className="input-field text-center"
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* 底部按钮 */}
      <div className="p-8">
        <button
          onClick={handleNext}
          className={`
            w-full py-4 rounded-xl font-semibold text-white
            bg-gradient-to-r from-primary-500 to-primary-600
            hover:shadow-lg hover:shadow-primary-500/30
            transition-all duration-200
            flex items-center justify-center gap-2
          `}
        >
          {step === steps.length - 1 ? '开始使用' : '下一步'}
          <ArrowRight className="w-5 h-5" />
        </button>

        {step < steps.length - 1 && (
          <button
            onClick={onComplete}
            className="w-full mt-4 py-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            跳过
          </button>
        )}
      </div>
    </div>
  )
}
