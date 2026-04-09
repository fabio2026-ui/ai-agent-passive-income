import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { 
  Save, 
  Sparkles, 
  ArrowLeft,
  Loader2,
  Check
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { db, DiaryEntry } from '../db/database'
import EmotionSelector from '../components/EmotionSelector'
import AISummaryCard from '../components/AISummaryCard'

export default function Write() {
  const navigate = useNavigate()
  const { date } = useParams()
  const { 
    subscription, 
    saveEntry, 
    generateAISummary,
    setCurrentEmotion,
    setCurrentContent
  } = useAppStore()

  const [emotion, setEmotion] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [savedEntry, setSavedEntry] = useState<DiaryEntry | null>(null)
  const [aiSummary, setAiSummary] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  // 加载已有日记
  useEffect(() => {
    if (date) {
      loadEntry(date)
    }
  }, [date])

  const loadEntry = async (dateStr: string) => {
    try {
      const targetDate = new Date(dateStr)
      const entry = await db.entries
        .where('date')
        .between(
          new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
          new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59)
        )
        .first()
      
      if (entry) {
        setEmotion(entry.emotion)
        setContent(entry.content)
        setTags(entry.tags || [])
        setSavedEntry(entry)
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Failed to load entry:', error)
    }
  }

  const handleEmotionSelect = (selectedEmotion: string) => {
    setEmotion(selectedEmotion)
    setCurrentEmotion(selectedEmotion as any)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setCurrentContent(e.target.value)
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!emotion || !content.trim()) return

    setIsSaving(true)
    try {
      let entry: DiaryEntry

      if (isEditing && savedEntry?.id) {
        // 更新已有日记
        await db.entries.update(savedEntry.id, {
          emotion: emotion as any,
          content: content.trim(),
          tags,
          updatedAt: new Date()
        })
        entry = { ...savedEntry, emotion: emotion as any, content: content.trim(), tags }
      } else {
        // 创建新日记
        const newEntry: Omit<DiaryEntry, 'id'> = {
          date: new Date(),
          emotion: emotion as any,
          content: content.trim(),
          tags,
          aiSummary: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        const id = await db.entries.add(newEntry as DiaryEntry)
        entry = { ...newEntry, id }
      }

      setSavedEntry(entry)

      // 如果订阅了 Pro，生成 AI 总结
      if (subscription.isActive) {
        setIsGeneratingAI(true)
        try {
          const summary = await generateAISummary(String(entry.id!))
          if (summary) {
            setAiSummary(summary)
            // 保存 AI 总结到数据库
            await db.entries.update(entry.id!, { aiSummary: summary.summary })
          }
        } catch (error) {
          console.error('Failed to generate AI summary:', error)
        } finally {
          setIsGeneratingAI(false)
        }
      }

      // 重置状态
      setCurrentEmotion(null)
      setCurrentContent('')
    } catch (error) {
      console.error('Failed to save entry:', error)
      alert('保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const currentDate = date 
    ? new Date(date) 
    : new Date()

  const isValid = emotion && content.trim().length >= 10

  return (
    <div className="max-w-2xl mx-auto">
      {/* 头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">返回</span>
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            {format(currentDate, 'yyyy年M月d日', { locale: zhCN })}
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {format(currentDate, 'EEEE', { locale: zhCN })}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!isValid || isSaving}
          className="btn-primary flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              保存中
            </>
          ) : savedEntry ? (
            <>
              <Check className="w-4 h-4" />
              已保存
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              保存
            </>
          )}
        </button>
      </motion.div>

      {/* 情绪选择 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 mb-6"
      >
        <EmotionSelector
          selectedEmotion={emotion as any}
          onSelect={handleEmotionSelect}
        />
      </motion.div>

      {/* 日记内容 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 mb-6"
      >
        <label className="block text-sm font-medium text-gray-700 mb-3">
          写下今天的感受
        </label>
        
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="今天发生了什么？你的心情如何？可以自由表达..."
          className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                     resize-none text-gray-700 leading-relaxed"
        />
        
        <p className="text-xs text-gray-400 mt-2 text-right">
          {content.length} 字
        </p>
      </motion.div>

      {/* 标签 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6 mb-6"
      >
        <label className="block text-sm font-medium text-gray-700 mb-3">
          添加标签
        </label>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 
                         text-primary-700 rounded-full text-sm"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-primary-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="输入标签，按回车添加"
          className="input-field"
        />
        
        <p className="text-xs text-gray-400 mt-2">
          建议标签：工作、家庭、健康、学习、旅行...
        </p>
      </motion.div>

      {/* AI 生成按钮 - 仅 Pro 用户 */}
      {subscription.isActive && savedEntry && !aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-6"
        >
          <button
            onClick={async () => {
              setIsGeneratingAI(true)
              try {
                const summary = await generateAISummary(String(savedEntry.id!))
                if (summary) {
                  setAiSummary(summary)
                  await db.entries.update(savedEntry.id!, { aiSummary: summary.summary })
                }
              } catch (error) {
                console.error('Failed to generate AI summary:', error)
              } finally {
                setIsGeneratingAI(false)
              }
            }}
            disabled={isGeneratingAI}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 
                       text-white rounded-xl font-medium flex items-center justify-center gap-2
                       hover:shadow-lg hover:shadow-primary-500/30 transition-all"
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI 分析中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                生成 AI 总结与洞察
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* AI 总结结果 */}
      {aiSummary && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-20"
        >
          <AISummaryCard summary={aiSummary} />
        </motion.div>
      )}

      {/* 未订阅提示 */}
      {!subscription.isActive && savedEntry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-20 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">解锁 AI 洞察</h3>
              <p className="text-sm text-gray-600 mt-1">
                升级 Pro 版，获取智能情绪分析、关键词提取和个性化建议
              </p>
            </div>
            <button
              onClick={() => navigate('/subscription')}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium
                         hover:bg-amber-600 transition-colors"
            >
              升级
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
