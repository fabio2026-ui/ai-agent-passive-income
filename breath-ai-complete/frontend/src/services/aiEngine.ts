import type { 
  HeartRateData, 
  BreathingPattern, 
  AIRecommendation, 
  BiometricSession 
} from '@shared/types';

interface PatternRule {
  pattern: BreathingPattern;
  conditions: {
    heartRateRange: [number, number];
    hrvRange: [number, number];
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  description: string;
  priority: number;
}

// AI Rule Engine for breathing pattern recommendations
const patternRules: PatternRule[] = [
  {
    pattern: 'calm',
    conditions: {
      heartRateRange: [60, 75],
      hrvRange: [40, 100]
    },
    description: '您的身体处于平衡状态，建议进行平静呼吸练习',
    priority: 1
  },
  {
    pattern: 'stress-relief',
    conditions: {
      heartRateRange: [80, 200],
      hrvRange: [0, 35]
    },
    description: '检测到压力状态，建议进行减压呼吸练习',
    priority: 10 // High priority for stress
  },
  {
    pattern: 'energy',
    conditions: {
      heartRateRange: [50, 65],
      hrvRange: [50, 120]
    },
    description: '适合进行能量提升呼吸练习',
    priority: 2
  },
  {
    pattern: 'sleep',
    conditions: {
      heartRateRange: [50, 70],
      hrvRange: [30, 80]
    },
    description: '适合睡前放松的呼吸练习',
    priority: 3
  },
  {
    pattern: 'focus',
    conditions: {
      heartRateRange: [65, 85],
      hrvRange: [35, 60]
    },
    description: '提升专注力的呼吸节奏',
    priority: 4
  },
  {
    pattern: 'recovery',
    conditions: {
      heartRateRange: [55, 75],
      hrvRange: [45, 90]
    },
    description: '帮助身体恢复的协调呼吸',
    priority: 5
  }
];

// Pattern configurations
export const breathingConfigs: Record<BreathingPattern, {
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  description: string;
  benefits: string[];
}> = {
  calm: {
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    description: '4-7-8 放松呼吸',
    benefits: ['减轻焦虑', '帮助入睡', '降低血压']
  },
  'stress-relief': {
    inhale: 4,
    holdIn: 4,
    exhale: 6,
    holdOut: 0,
    description: '延长呼气减压法',
    benefits: ['激活副交感神经', '快速减压', '稳定情绪']
  },
  energy: {
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    description: '盒式呼吸法',
    benefits: ['提升专注力', '增加能量', '提高表现']
  },
  sleep: {
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    description: '深度睡眠呼吸',
    benefits: ['促进睡眠', '深度放松', '恢复精力']
  },
  focus: {
    inhale: 6,
    holdIn: 0,
    exhale: 6,
    holdOut: 0,
    description: '6-6 专注呼吸',
    benefits: ['提升专注力', '增强清晰思维', '平衡状态']
  },
  recovery: {
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    description: '5-5 协调呼吸',
    benefits: ['心率协调', '身体恢复', '情绪稳定']
  }
};

export class AIEmotionEngine {
  private recentReadings: HeartRateData[] = [];
  private maxReadings = 60; // Keep last 60 readings for analysis
  private userHistory: BiometricSession[] = [];

  addReading(reading: HeartRateData): void {
    this.recentReadings.push(reading);
    if (this.recentReadings.length > this.maxReadings) {
      this.recentReadings.shift();
    }
  }

  addSession(session: BiometricSession): void {
    this.userHistory.push(session);
    // Keep last 30 sessions
    if (this.userHistory.length > 30) {
      this.userHistory.shift();
    }
  }

  getRecommendation(): AIRecommendation {
    const currentStats = this.calculateCurrentStats();
    const timeOfDay = this.getTimeOfDay();
    
    // Score each pattern
    const scoredPatterns = patternRules.map(rule => {
      let score = 0;
      let confidence = 0;

      // Heart rate match
      const hrMatch = this.isInRange(
        currentStats.averageHeartRate,
        rule.conditions.heartRateRange
      );
      if (hrMatch) {
        score += rule.priority * 10;
        confidence += 0.3;
      }

      // HRV match
      if (currentStats.averageHRV > 0) {
        const hrvMatch = this.isInRange(
          currentStats.averageHRV,
          rule.conditions.hrvRange
        );
        if (hrvMatch) {
          score += rule.priority * 10;
          confidence += 0.4;
        }
      }

      // Time of day bonus
      if (rule.conditions.timeOfDay === timeOfDay) {
        score += 5;
        confidence += 0.1;
      }

      return { pattern: rule.pattern, score, confidence, reason: rule.description };
    });

    // Sort by score
    scoredPatterns.sort((a, b) => b.score - a.score);
    
    const best = scoredPatterns[0];
    const second = scoredPatterns[1];
    
    // Adjust confidence based on how close the second best is
    if (second && best.score > 0) {
      const ratio = second.score / best.score;
      if (ratio > 0.8) {
        best.confidence *= 0.8; // Lower confidence if close competitor
      }
    }

    return {
      pattern: best.pattern,
      confidence: Math.min(best.confidence, 0.95),
      reason: best.reason,
      estimatedDuration: this.estimateDuration(best.pattern, currentStats)
    };
  }

  detectStressLevel(): 'low' | 'medium' | 'high' {
    const stats = this.calculateCurrentStats();
    
    if (this.recentReadings.length < 5) {
      return 'low';
    }

    // Check for rising heart rate trend
    const trend = this.calculateTrend();
    
    if (stats.averageHeartRate > 90 && stats.averageHRV < 30) {
      return 'high';
    }
    
    if (stats.averageHeartRate > 80 || stats.averageHRV < 35 || trend === 'rising') {
      return 'medium';
    }
    
    return 'low';
  }

  private calculateCurrentStats(): { averageHeartRate: number; averageHRV: number } {
    if (this.recentReadings.length === 0) {
      return { averageHeartRate: 70, averageHRV: 50 };
    }

    // Use last 10 readings for current stats
    const recent = this.recentReadings.slice(-10);
    const avgHR = recent.reduce((sum, r) => sum + r.heartRate, 0) / recent.length;
    const hrvReadings = recent.filter(r => r.hrv !== undefined).map(r => r.hrv!);
    const avgHRV = hrvReadings.length > 0 
      ? hrvReadings.reduce((a, b) => a + b, 0) / hrvReadings.length 
      : 0;

    return { averageHeartRate: avgHR, averageHRV: avgHRV };
  }

  private calculateTrend(): 'rising' | 'falling' | 'stable' {
    if (this.recentReadings.length < 10) return 'stable';
    
    const firstHalf = this.recentReadings.slice(0, Math.floor(this.recentReadings.length / 2));
    const secondHalf = this.recentReadings.slice(Math.floor(this.recentReadings.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, r) => sum + r.heartRate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.heartRate, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return 'rising';
    if (change < -5) return 'falling';
    return 'stable';
  }

  private isInRange(value: number, range: [number, number]): boolean {
    return value >= range[0] && value <= range[1];
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private estimateDuration(
    pattern: BreathingPattern, 
    stats: { averageHeartRate: number; averageHRV: number }
  ): number {
    const config = breathingConfigs[pattern];
    const cycleTime = config.inhale + config.holdIn + config.exhale + config.holdOut;
    
    // For high stress, recommend shorter sessions initially
    if (stats.averageHeartRate > 90) {
      return Math.min(cycleTime * 3, 180); // Max 3 minutes
    }
    
    // For beginners (low HRV), start with shorter sessions
    if (stats.averageHRV < 30) {
      return cycleTime * 5; // 5 cycles
    }
    
    // Default to 10 cycles for experienced users
    return cycleTime * 10;
  }

  getInsights(): string[] {
    const insights: string[] = [];
    const stats = this.calculateCurrentStats();
    const stressLevel = this.detectStressLevel();
    
    if (stressLevel === 'high') {
      insights.push('⚠️ 检测到较高压力水平，建议进行深呼吸练习');
    }
    
    if (stats.averageHRV < 25) {
      insights.push('您的心率变异性较低，可能处于疲劳状态');
    } else if (stats.averageHRV > 60) {
      insights.push('💚 心率变异性良好，恢复能力优秀');
    }
    
    if (this.userHistory.length > 0) {
      const lastSession = this.userHistory[this.userHistory.length - 1];
      if (lastSession.stressLevel === 'high' && stressLevel !== 'high') {
        insights.push('✨ 压力水平较上次练习有所下降');
      }
    }
    
    return insights;
  }

  reset(): void {
    this.recentReadings = [];
  }
}

// Singleton instance
export const aiEngine = new AIEmotionEngine();
