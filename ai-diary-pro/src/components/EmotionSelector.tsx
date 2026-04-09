import { motion } from 'framer-motion'
import { useState } from 'react'
import { EMOTIONS, EmotionType } from '../db/database'

interface EmotionSelectorProps {
  selectedEmotion: EmotionType | null
  onSelect: (emotion: EmotionType) => void
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function EmotionSelector({ 
  selectedEmotion, 
  onSelect,
  size = 'md',
  showLabel = true 
}: EmotionSelectorProps) {
  const [hoveredEmotion, setHoveredEmotion] = useState<EmotionType | null>(null)

  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  }

  return (
    <div className="w-full">
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          今天感觉如何？
        </label>
      )}
      
      <div className="grid grid-cols-4 gap-3">
        {EMOTIONS.map((emotion, index) => (
          <motion.button
            key={emotion.type}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(emotion.type)}
            onMouseEnter={() => setHoveredEmotion(emotion.type)}
            onMouseLeave={() => setHoveredEmotion(null)}
            className={`
              emotion-btn flex flex-col items-center justify-center
              ${sizeClasses[size]}
              ${emotion.color} bg-opacity-10
              ${selectedEmotion === emotion.type 
                ? `${emotion.color} ring-offset-2 ring-2 ring-gray-400` 
                : 'hover:bg-opacity-20'
              }
              rounded-2xl transition-all duration-200
            `}
          >
            <span className="mb-1">{emotion.emoji}</span>
            {size !== 'sm' && showLabel && (
              <span className="text-xs text-gray-600 font-medium">
                {emotion.label}
              </span>
            )}
          </motion.button>
        ))}
      </div>
      
      {showLabel && hoveredEmotion && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center text-sm text-gray-500"
        >
          {EMOTIONS.find(e => e.type === hoveredEmotion)?.description}
        </motion.div>
      )}
    </div>
  )
}
