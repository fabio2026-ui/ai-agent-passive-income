import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Scan, Sparkles } from 'lucide-react'
import { useMealStore } from '../stores/mealStore'
import type { FoodAnalysisResult, MealEntry } from '../types'

interface FoodAnalyzerProps {
  onAnalysisComplete?: (result: FoodAnalysisResult) => void
  onClose?: () => void
}

export default function FoodAnalyzer({ onAnalysisComplete, onClose }: FoodAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null)
  const [mealType, setMealType] = useState<MealEntry['mealType']>('lunch')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addMeal } = useMealStore()

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
        analyzeFood(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const analyzeFood = async (imageData: string) => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // Mock analysis result
    const mockResult: FoodAnalysisResult = {
      foods: [
        {
          id: 'food_' + Date.now(),
          name: '香煎鸡胸肉',
          quantity: 150,
          unit: 'g',
          nutritionPer100g: {
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            fiber: 0,
            sugar: 0,
            sodium: 74
          },
          nutrition: {
            calories: 248,
            protein: 46.5,
            carbs: 0,
            fat: 5.4,
            fiber: 0,
            sugar: 0,
            sodium: 111
          }
        },
        {
          id: 'food_' + (Date.now() + 1),
          name: '糙米饭',
          quantity: 100,
          unit: 'g',
          nutritionPer100g: {
            calories: 111,
            protein: 2.6,
            carbs: 23,
            fat: 0.9,
            fiber: 1.8,
            sugar: 0.4,
            sodium: 5
          },
          nutrition: {
            calories: 111,
            protein: 2.6,
            carbs: 23,
            fat: 0.9,
            fiber: 1.8,
            sugar: 0.4,
            sodium: 5
          }
        },
        {
          id: 'food_' + (Date.now() + 2),
          name: '西兰花',
          quantity: 80,
          unit: 'g',
          nutritionPer100g: {
            calories: 34,
            protein: 2.8,
            carbs: 7,
            fat: 0.4,
            fiber: 2.6,
            sugar: 1.7,
            sodium: 33
          },
          nutrition: {
            calories: 27,
            protein: 2.2,
            carbs: 5.6,
            fat: 0.3,
            fiber: 2.1,
            sugar: 1.4,
            sodium: 26
          }
        }
      ],
      totalNutrition: {
        calories: 386,
        protein: 51.3,
        carbs: 28.6,
        fat: 6.6,
        fiber: 3.9,
        sugar: 1.8,
        sodium: 142
      },
      confidence: 0.92,
      suggestions: [
        '这是一份均衡的健身餐',
        '蛋白质含量高，适合增肌',
        '建议搭配更多蔬菜以增加纤维摄入'
      ]
    }
    
    setAnalysisResult(mockResult)
    setIsAnalyzing(false)
    onAnalysisComplete?.(mockResult)
  }

  const handleSaveMeal = () => {
    if (!analysisResult) return
    
    addMeal({
      userId: 'current_user',
      name: `AI识别餐食 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`,
      imageUrl: previewImage || undefined,
      foods: analysisResult.foods,
      totalNutrition: analysisResult.totalNutrition,
      mealType,
      notes: `AI识别置信度: ${(analysisResult.confidence * 100).toFixed(0)}%`
    })
    
    onClose?.()
  }

  const handleRetake = () => {
    setPreviewImage(null)
    setAnalysisResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-gray-900">AI 食物识别</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="p-4">
        {/* Image Preview / Upload Area */}
        {!previewImage ? (
          <div 
            className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer
                       hover:border-primary-400 hover:bg-primary-50/50 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-10 h-10 text-primary-600" />
            </div>
            <p className="text-gray-600 font-medium mb-1">拍摄或上传食物照片</p>
            <p className="text-gray-400 text-sm">AI 将自动识别食物并分析营养成分</p>
            
            <div className="flex justify-center gap-4 mt-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium">
                <Camera className="w-4 h-4" />
                拍照
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">
                <Upload className="w-4 h-4" />
                上传
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image */}
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src={previewImage} 
                alt="Food preview" 
                className="w-full h-48 object-cover"
              />
              {!isAnalyzing && (
                <button
                  onClick={handleRetake}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg text-sm
                           hover:bg-black/70 transition-colors"
                >
                  重拍
                </button>
              )}
            </div>

            {/* Analyzing State */}
            {isAnalyzing ? (
              <div className="text-center py-8">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary-600" />
                </div>
                <p className="text-gray-600 font-medium">AI 正在分析中... (1/3)</p>
                <p className="text-gray-400 text-sm mt-1">识别食物类型 → 分析营养成分 → 生成建议</p>
              </div>
            ) : analysisResult ? (
              <>
                {/* Analysis Result */}
                <div className="space-y-4">
                  {/* Detected Foods */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-3">识别到的食物</h4>
                    <div className="space-y-2">
                      {analysisResult.foods.map((food) => (
                        <div key={food.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{food.name}</span>
                          <span className="text-gray-500">{food.quantity}{food.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nutrition Summary */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: '热量', value: analysisResult.totalNutrition.calories, unit: 'kcal' },
                      { label: '蛋白质', value: analysisResult.totalNutrition.protein, unit: 'g' },
                      { label: '碳水', value: analysisResult.totalNutrition.carbs, unit: 'g' },
                      { label: '脂肪', value: analysisResult.totalNutrition.fat, unit: 'g' }
                    ].map((item) => (
                      <div key={item.label} className="bg-primary-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-primary-700">{Math.round(item.value)}</div>
                        <div className="text-xs text-primary-600">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* AI Suggestions */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-amber-800">AI 建议</span>
                    </div>
                    <ul className="space-y-1">
                      {analysisResult.suggestions?.map((suggestion, idx) => (
                        <li key={idx} className="text-sm text-amber-700">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Meal Type Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">餐食类型</label>
                    <div className="flex gap-2">
                      {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setMealType(type)}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                            mealType === type
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {type === 'breakfast' && '早餐'}
                          {type === 'lunch' && '午餐'}
                          {type === 'dinner' && '晚餐'}
                          {type === 'snack' && '加餐'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveMeal}
                      className="flex-1 btn-primary py-3.5"
                    >
                      保存到记录
                    </button>
                    <button
                      onClick={handleRetake}
                      className="flex-1 btn-secondary py-3.5"
                    >
                      重新识别
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
