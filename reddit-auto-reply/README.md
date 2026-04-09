# Breath AI Reddit 自动回复系统

## 系统概述
自动监控Reddit上与呼吸训练、冥想、焦虑、睡眠相关话题，检测提及或询问Breath AI的情况，并自动回复常见问题。

## 监控目标

### 子版块 (Subreddits)
- r/Meditation - 冥想社区
- r/Anxiety - 焦虑社区  
- r/productivity - 效率社区
- r/sleep - 睡眠社区
- r/breathing - 呼吸训练
- r/mindfulness - 正念社区
- r/selfimprovement - 自我提升
- r/HealthAnxiety - 健康焦虑
- r/CPTSD - 创伤后应激
- r/relaxation - 放松技巧

### 关键词
- breath ai, breathing ai
- breathing app, breath app
- 4-7-8 breathing, box breathing
- physiological sigh
- breathing exercise
- breathwork
- andrew huberman breathing
- stress relief app
- anxiety breathing technique
- sleep breathing

## 回复话术

### FAQ 1: 这是什么App？
**触发条件**: "what app", "what is this", "which app"
**回复**: 
```
This is Breath AI - a smart breathing coach that adapts to your needs in real time. 

It includes:
• 4-7-8 breathing for sleep
• Box breathing for focus  
• Physiological sigh for stress relief
• AI-powered personalization

Happy to share more details if you're interested!
```

### FAQ 2: 科学原理是什么？
**触发条件**: "does this work", "is there science", "evidence", "research"
**回复**:
```
Yes! The breathing techniques in Breath AI are based on research from Stanford's Andrew Huberman and other neuroscientists:

• Physiological sigh: Double inhale + long exhale to quickly reduce CO2 and calm the nervous system
• 4-7-8 breathing: Activates the parasympathetic nervous system ("rest and digest" mode)
• Box breathing: Used by Navy SEALs to maintain calm under stress

Studies show 10 minutes of daily breathing practice can reduce cortisol by ~20% after 4 weeks.

The AI component personalizes the rhythm based on your feedback and biometrics (if you connect a wearable).
```

### FAQ 3: 免费还是付费？
**触发条件**: "free", "cost", "price", "subscription", "how much"
**回复**:
```
Breath AI has a generous free tier:
• Basic breathing exercises (4-7-8, box, physiological sigh)
• Daily reminders
• Progress tracking

Premium ($4.99/month or $29.99/year) adds:
• AI personalization
• Biofeedback integration (Apple Watch, Oura, etc.)
• Advanced analytics
• Custom breathing patterns

There's a 7-day free trial for premium features.
```

### FAQ 4: 如何下载？
**触发条件**: "download", "where can i get", "link", "app store"
**回复**:
```
You can get Breath AI here:
• iOS: https://apps.apple.com/breath-ai (or search "Breath AI" on App Store)
• Android: https://play.google.com/store/breath-ai (or search on Google Play)
• Web: https://breath-ai.app

Let me know if you have any questions after trying it!
```

### FAQ 5: 和其他App的区别？
**触发条件**: "vs", "versus", "compare", "difference", "better than", "alternative"
**回复**:
```
Main differences from other breathing apps:

1. **AI Personalization** - Most apps use fixed timers. Breath AI adapts the pace based on your actual breathing rhythm and feedback.

2. **Biofeedback Integration** - Works with Apple Watch, Oura Ring, etc. to adjust exercises based on your real-time HRV.

3. **Scientific Focus** - Techniques backed by peer-reviewed research (Huberman Lab, etc.) not just "calming sounds"

4. **Offline First** - Core features work without internet, no account required for basic use

5. **No Meditation Required** - For people who find meditation hard. This is pure physiology, no "clear your mind" stuff.

That said, if you love your current app and it works for you, keep using it! Different tools work for different people.
```

### FAQ 6: 有副作用吗？
**触发条件**: "side effects", "safe", "dangerous", "risk", "medical"
**回复**:
```
Breathing exercises are generally safe for healthy individuals. However:

**Consult a doctor first if you have:**
• Respiratory conditions (asthma, COPD)
• Cardiovascular issues
• History of hyperventilation or panic attacks triggered by breathwork
• Are pregnant (some techniques may cause dizziness)

**General precautions:**
• Stop if you feel dizzy, lightheaded, or uncomfortable
• Don't practice while driving or operating machinery
• Start with shorter sessions (2-3 minutes)

This app is a wellness tool, not medical treatment. For clinical anxiety or sleep disorders, please work with a healthcare provider.
```

### FAQ 7: 如何开始？
**触发条件**: "how to start", "beginner", "new to", "first time"
**回复**:
```
Great question! Here's a beginner-friendly approach:

**Week 1: Try the basics**
• Start with 4-7-8 breathing (2-3 minutes before bed)
• Just focus on the rhythm, don't worry about "doing it right"

**Week 2: Find your use case**
• Morning: Box breathing for focus (5 min)
• Stressed: Physiological sigh (2 cycles)
• Can't sleep: Extended exhale breathing

**Week 3: Build the habit**
• Same time daily (habit stacking works great - do it right after brushing teeth)
• Use reminders
• Track how you feel before/after

The AI will start learning your preferences after about 5 sessions and suggest personalized routines.

Pro tip: Don't try to optimize everything at once. Start with ONE technique that resonates with you.
```

## 配置参数

```json
{
  "monitoring": {
    "checkInterval": 300,
    "subreddits": ["Meditation", "Anxiety", "productivity", "sleep", "breathing", "mindfulness", "selfimprovement"],
    "keywords": ["breath ai", "breathing ai", "breathing app", "breath app", "4-7-8 breathing", "box breathing", "physiological sigh"],
    "minScore": 1,
    "maxRepliesPerHour": 3,
    "maxRepliesPerDay": 10
  },
  "replyRules": {
    "avoidSpam": true,
    "minAccountAge": 30,
    "minKarma": 10,
    "cooldownHours": 24,
    "dontReplyTo": ["bot", "spam", "advertisement"]
  }
}
```

## 记录格式

```json
{
  "interactionId": "uuid",
  "timestamp": "2026-03-21T17:14:00Z",
  "postId": "t3_xxxxx",
  "subreddit": "Meditation",
  "postTitle": "...",
  "triggerKeyword": "breathing app",
  "matchedFAQ": "what_app",
  "replySent": true,
  "replyContent": "...",
  "userKarma": 150,
  "postScore": 45
}
```
