import type { AIInsight, Habit, CheckIn } from '../types'

// 模拟AI服务 - 可以替换为真实的AI API
export class AIService {
  private static instance: AIService
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  // 生成习惯建议
  generateHabitTips(habits: Habit[]): AIInsight[] {
    const tips: AIInsight[] = []
    
    const habitTips: Record<string, string[]> = {
      '喝水': [
        '💧 在办公桌前放一杯水，提醒自己定时喝水',
        '💧 尝试在水中加入柠檬或薄荷，让喝水更有趣',
        '💧 设置每小时喝水的提醒，养成规律习惯'
      ],
      '运动': [
        '🏃 从每天5分钟开始，循序渐进增加运动时间',
        '🏃 选择你喜欢的运动方式，这样更容易坚持',
        '🏃 找个运动伙伴，互相监督更有动力'
      ],
      '阅读': [
        '📚 每天固定时间阅读，比如睡前30分钟',
        '📚 随身携带一本书，利用碎片时间阅读',
        '📚 加入读书俱乐部，分享阅读心得'
      ],
      '冥想': [
        '🧘 早晨起床后冥想，开启平静的一天',
        '🧘 使用冥想App引导，更容易入门',
        '🧘 从3分钟开始，慢慢延长冥想时间'
      ],
      '早起': [
        '🌅 每天提前5分钟起床，逐步调整到目标时间',
        '🌅 前一晚准备好第二天的衣服和物品',
        '🌅 早起后立即拉开窗帘，让阳光唤醒你'
      ]
    }

    habits.forEach(habit => {
      Object.entries(habitTips).forEach(([keyword, tipList]) => {
        if (habit.name.includes(keyword) && Math.random() > 0.7) {
          tips.push({
            type: 'tip',
            content: tipList[Math.floor(Math.random() * tipList.length)],
            relatedHabitId: habit.id,
            read: false
          })
        }
      })
    })

    return tips.slice(0, 2)
  }

  // 分析习惯数据
  analyzeHabits(habits: Habit[], checkIns: CheckIn[]): AIInsight[] {
    const insights: AIInsight[] = []
    
    // 分析完成率
    const completedCount = checkIns.filter(c => c.completed).length
    const totalCount = checkIns.length
    const completionRate = totalCount > 0 ? completedCount / totalCount : 0

    if (completionRate >= 0.9) {
      insights.push({
        type: 'encouragement',
        content: '🎉 太棒了！你的习惯完成率超过了90%，继续保持！',
        read: false
      })
    } else if (completionRate >= 0.7) {
      insights.push({
        type: 'encouragement',
        content: '👏 做得不错！完成率稳步提升，再加把劲！',
        read: false
      })
    } else if (completionRate < 0.5 && totalCount > 7) {
      insights.push({
        type: 'suggestion',
        content: '🤔 看起来最近有些困难。试试减少习惯数量，专注于最重要的1-2个？',
        read: false
      })
    }

    // 分析连续打卡
    const streakHabits = habits.filter(h => {
      const habitCheckIns = checkIns
        .filter(c => c.habitId === h.id && c.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      return habitCheckIns.length >= 7
    })

    if (streakHabits.length > 0) {
      insights.push({
        type: 'encouragement',
        content: `🔥 你有${streakHabits.length}个习惯已经坚持超过一周，太厉害了！`,
        read: false
      })
    }

    return insights.slice(0, 2)
  }

  // 生成每日鼓励
  generateDailyEncouragement(habits: Habit[], checkIns: CheckIn[]): AIInsight {
    const encouragements = [
      '🌟 新的一天，新的机会！相信自己可以做到！',
      '💪 每一个小步骤都在让你变得更强',
      '✨ 习惯的力量在于坚持，你已经走在正确的道路上',
      '🎯 专注于今天，完成比完美更重要',
      '🌈 每一个完成的打卡都是对自己的承诺',
      '⭐ 你比你想象的更有能力',
      '🔥 坚持下去，你会感谢现在的自己',
      '💫 小习惯，大改变，继续加油！'
    ]

    const uncompletedHabits = habits.filter(h => {
      const today = new Date().toISOString().split('T')[0]
      return !checkIns.find(c => c.habitId === h.id && c.date === today && c.completed)
    })

    if (uncompletedHabits.length === 0) {
      return {
        type: 'encouragement',
        content: '🎉 今天的所有习惯都已完成！你真是太棒了！',
        read: false
      }
    }

    return {
      type: 'encouragement',
      content: encouragements[Math.floor(Math.random() * encouragements.length)],
      read: false
    }
  }

  // 生成习惯建议
  suggestNewHabit(userGoals: string[]): AIInsight {
    const suggestions: Record<string, string[]> = {
      '健康': ['每日饮水8杯', '步行10000步', '冥想10分钟', '早睡早起'],
      '学习': ['阅读30分钟', '学习新单词', '写日记', '听播客'],
      '效率': ['制定每日计划', '番茄工作法', '整理桌面', '复盘一天'],
      '社交': ['主动联系朋友', '赞美他人', '参加社交活动', '记录感恩'],
      '财务': ['记账', '存小额钱', '阅读理财文章', '检查账单']
    }

    const goal = userGoals[Math.floor(Math.random() * userGoals.length)] || '健康'
    const options = suggestions[goal] || suggestions['健康']
    const suggestion = options[Math.floor(Math.random() * options.length)]

    return {
      type: 'suggestion',
      content: `💡 基于你的目标，建议尝试新习惯：${suggestion}`,
      read: false
    }
  }
}

export const aiService = AIService.getInstance()
