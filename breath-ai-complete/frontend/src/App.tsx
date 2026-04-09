import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Wind, Heart, Users, Crown, Settings, 
  Play, Pause, RotateCcw, Bluetooth,
  TrendingDown, TrendingUp, Activity,
  ChevronRight, Star, Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { HeartRateData, AIRecommendation, BreathingPattern } from '@shared/types';
import { heartRateMonitor } from './services/bluetooth';
import { aiEngine, breathingConfigs } from './services/aiEngine';
import { duoSyncManager } from './services/duoSync';
import { stripeService, subscriptionPlans } from './services/stripe';
import type { Subscription } from '@shared/types';

// ==================== Type Definitions ====================

interface BreathPhase {
  phase: 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
  progress: number;
}

// ==================== Main App Component ====================

function App() {
  const [currentView, setCurrentView] = useState<'breathe' | 'heart' | 'duo' | 'premium' | 'settings'>('breathe');
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    // Check subscription on load
    stripeService.getSubscription().then(setSubscription);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'breathe':
        return <BreathingView subscription={subscription} />;
      case 'heart':
        return <HeartRateView subscription={subscription} />;
      case 'duo':
        return <DuoModeView subscription={subscription} />;
      case 'premium':
        return <PremiumView subscription={subscription} onUpdate={setSubscription} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <BreathingView subscription={subscription} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wind className="w-6 h-6 text-cyan-400" />
            <span className="font-bold text-lg">Breath AI</span>
          </div>
          {subscription?.status === 'active' && (
            <Crown className="w-5 h-5 text-amber-400" />
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>

        {/* Navigation */}
        <nav className="p-4 bg-slate-900/50 backdrop-blur-lg border-t border-white/10">
          <div className="flex justify-around">
            <NavButton 
              icon={<Wind />} 
              label="呼吸" 
              active={currentView === 'breathe'}
              onClick={() => setCurrentView('breathe')}
            />
            <NavButton 
              icon={<Heart />} 
              label="心率" 
              active={currentView === 'heart'}
              onClick={() => setCurrentView('heart')}
            />
            <NavButton 
              icon={<Users />} 
              label="双人" 
              active={currentView === 'duo'}
              onClick={() => setCurrentView('duo')}
              badge={subscription?.planId === 'premium-plus'}
            />
            <NavButton 
              icon={<Crown />} 
              label="会员" 
              active={currentView === 'premium'}
              onClick={() => setCurrentView('premium')}
            />
            <NavButton 
              icon={<Settings />} 
              label="设置" 
              active={currentView === 'settings'}
              onClick={() => setCurrentView('settings')}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}

// ==================== Navigation Button ====================

function NavButton({ 
  icon, 
  label, 
  active, 
  onClick,
  badge 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  badge?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
        active ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <div className="relative">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
        {badge && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
        )}
      </div>
      <span className="text-xs">{label}</span>
    </button>
  );
}

// ==================== Breathing View ====================

function BreathingView({ subscription }: { subscription: Subscription | null }) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>({ phase: 'inhale', progress: 0 });
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>('calm');
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [showAIRecommendation, setShowAIRecommendation] = useState(true);
  const timerRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  // AI recommendation when not active
  useEffect(() => {
    if (!isActive) {
      const rec = aiEngine.getRecommendation();
      setRecommendation(rec);
    }
  }, [isActive]);

  // Breathing cycle
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    const config = breathingConfigs[selectedPattern];
    const cycleDuration = (config.inhale + config.holdIn + config.exhale + config.holdOut) * 1000;
    const updateInterval = 50; // 50ms updates

    timerRef.current = window.setInterval(() => {
      phaseRef.current += updateInterval;
      const cycleProgress = phaseRef.current % cycleDuration;
      
      let currentPhase: BreathPhase['phase'];
      let phaseProgress: number;

      if (cycleProgress < config.inhale * 1000) {
        currentPhase = 'inhale';
        phaseProgress = cycleProgress / (config.inhale * 1000);
      } else if (cycleProgress < (config.inhale + config.holdIn) * 1000) {
        currentPhase = 'hold-in';
        phaseProgress = (cycleProgress - config.inhale * 1000) / (config.holdIn * 1000 || 1);
      } else if (cycleProgress < (config.inhale + config.holdIn + config.exhale) * 1000) {
        currentPhase = 'exhale';
        phaseProgress = (cycleProgress - (config.inhale + config.holdIn) * 1000) / (config.exhale * 1000);
      } else {
        currentPhase = 'hold-out';
        phaseProgress = (cycleProgress - (config.inhale + config.holdIn + config.exhale) * 1000) / (config.holdOut * 1000 || 1);
      }

      setPhase({ phase: currentPhase, progress: phaseProgress });
    }, updateInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, selectedPattern]);

  const getCircleScale = () => {
    const baseScale = 0.6;
    switch (phase.phase) {
      case 'inhale':
        return baseScale + (0.4 * phase.progress);
      case 'hold-in':
        return 1;
      case 'exhale':
        return 1 - (0.4 * phase.progress);
      case 'hold-out':
        return baseScale;
    }
  };

  const getPhaseText = () => {
    switch (phase.phase) {
      case 'inhale': return '吸气';
      case 'hold-in': return '屏息';
      case 'exhale': return '呼气';
      case 'hold-out': return '屏息';
    }
  };

  const handleApplyRecommendation = () => {
    if (recommendation) {
      setSelectedPattern(recommendation.pattern);
      setShowAIRecommendation(false);
    }
  };

  const isPremiumFeature = (pattern: BreathingPattern) => {
    const premiumPatterns: BreathingPattern[] = ['focus', 'recovery', 'stress-relief'];
    return premiumPatterns.includes(pattern) && subscription?.status !== 'active';
  };

  return (
    <div className="p-4 space-y-6">
      {/* AI Recommendation */}
      {showAIRecommendation && recommendation && !isActive && (
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-4 animate-in slide-in-from-top">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-cyan-200">AI 推荐</p>
              <p className="text-sm text-slate-300 mt-1">{recommendation.reason}</p>
              <button
                onClick={handleApplyRecommendation}
                className="mt-2 text-xs bg-cyan-500 hover:bg-cyan-600 px-3 py-1.5 rounded-full transition-colors"
              >
                应用 {breathingConfigs[recommendation.pattern].description}
              </button>
            </div>
            <button 
              onClick={() => setShowAIRecommendation(false)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Breathing Circle */}
      <div className="flex flex-col items-center justify-center py-8">
        <div 
          className="relative w-64 h-64 flex items-center justify-center transition-transform duration-100"
          style={{ transform: `scale(${getCircleScale()})` }}
        >
          {/* Outer rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-cyan-400/30 to-purple-400/30" />
          
          {/* Main circle */}
          <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-2xl">
            <div className="text-center">
              <p className="text-3xl font-bold">{getPhaseText()}</p>
              <p className="text-sm opacity-70 mt-1">
                {breathingConfigs[selectedPattern].description}
              </p>
            </div>
          </div>
          
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - phase.progress)}`}
              className="transition-all duration-100"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={() => setIsActive(!isActive)}
            className="w-16 h-16 rounded-full bg-white text-indigo-900 flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          
          <button
            onClick={() => {
              setIsActive(false);
              phaseRef.current = 0;
              setPhase({ phase: 'inhale', progress: 0 });
            }}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pattern Selection */}
      <div className="space-y-3">
        <p className="text-sm text-slate-400">选择呼吸模式</p>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(breathingConfigs) as BreathingPattern[]).map((pattern) => {
            const config = breathingConfigs[pattern];
            const isPremium = isPremiumFeature(pattern);
            const isLocked = isPremium && subscription?.status !== 'active';
            
            return (
              <button
                key={pattern}
                onClick={() => !isLocked && setSelectedPattern(pattern)}
                disabled={isLocked}
                className={`p-3 rounded-xl text-left transition-all relative overflow-hidden ${
                  selectedPattern === pattern
                    ? 'bg-cyan-500/30 border border-cyan-500/50'
                    : isLocked
                    ? 'bg-slate-800/50 opacity-60'
                    : 'bg-slate-800/50 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{config.description}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {config.inhale}-{config.holdIn || 0}-{config.exhale}-{config.holdOut || 0}
                    </p>
                  </div>
                  {isLocked && (
                    <Crown className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                
                {isLocked && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                    <span className="text-xs">🔒 专业版</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-slate-800/30 rounded-xl p-4">
        <p className="text-sm text-slate-300 mb-2">💡 益处</p>
        <div className="flex flex-wrap gap-2">
          {breathingConfigs[selectedPattern].benefits.map((benefit) => (
            <span 
              key={benefit}
              className="text-xs bg-white/10 px-2 py-1 rounded-full"
            >
              {benefit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== Heart Rate View ====================

function HeartRateView({ subscription }: { subscription: Subscription | null }) {
  const [isConnected, setIsConnected] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [hrv, setHrv] = useState(0);
  const [history, setHistory] = useState<HeartRateData[]>([]);
  const [stressLevel, setStressLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [insights, setInsights] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Check if Bluetooth is supported
  const isBluetoothSupported = 'bluetooth' in navigator;

  // Check if premium feature
  const isPremiumUser = subscription?.status === 'active';

  useEffect(() => {
    heartRateMonitor.onData((data) => {
      setHeartRate(data.heartRate);
      if (data.hrv) {
        setHrv(Math.round(data.hrv));
      }
      aiEngine.addReading(data);
      setHistory(prev => [...prev.slice(-50), data]);
      setStressLevel(aiEngine.detectStressLevel());
      setInsights(aiEngine.getInsights());
    });
  }, []);

  const connectDevice = async () => {
    if (!isBluetoothSupported) {
      alert('您的浏览器不支持蓝牙功能。请使用 Chrome 或 Edge 浏览器。');
      return;
    }

    setIsScanning(true);
    try {
      await heartRateMonitor.requestDevice();
      await heartRateMonitor.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const disconnectDevice = async () => {
    await heartRateMonitor.disconnect();
    setIsConnected(false);
    setHeartRate(0);
    setHrv(0);
  };

  const getStressColor = () => {
    switch (stressLevel) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
    }
  };

  const getStressText = () => {
    switch (stressLevel) {
      case 'low': return '放松';
      case 'medium': return '正常';
      case 'high': return '压力';
    }
  };

  if (!isPremiumUser) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">心率监测</h2>
        <p className="text-slate-400 text-center mb-6">
          连接 Apple Watch 或智能手表，实时监测心率和心率变异性(HRV)
        </p>
        
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 w-full">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-400" />
            <div className="flex-1">
              <p className="font-medium">专业版功能</p>
              <p className="text-sm text-slate-400">升级到专业版解锁心率监测</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Connection Status */}
      <div className="bg-slate-800/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isConnected ? 'bg-green-500/20' : 'bg-slate-700'
            }`}>
              <Bluetooth className={`w-6 h-6 ${isConnected ? 'text-green-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="font-medium">{isConnected ? '已连接' : '未连接'}</p>
              <p className="text-sm text-slate-400">
                {isConnected ? heartRateMonitor.getDeviceName() : '点击连接设备'}
              </p>
            </div>
          </div>
          
          <button
            onClick={isConnected ? disconnectDevice : connectDevice}
            disabled={isScanning}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isConnected
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-cyan-500 text-white hover:bg-cyan-600'
            }`}
          >
            {isScanning ? '搜索中...' : isConnected ? '断开' : '连接'}
          </button>
        </div>
      </div>

      {/* Heart Rate Display */}
      {isConnected && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className={`w-5 h-5 ${heartRate > 100 ? 'text-red-400 animate-pulse' : 'text-red-400'}`} />
                <span className="text-slate-400 text-sm">心率</span>
              </div>
              <p className="text-4xl font-bold">{heartRate || '--'}</p>
              <p className="text-xs text-slate-400">BPM</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-400 text-sm">HRV</span>
              </div>
              <p className="text-4xl font-bold">{hrv || '--'}</p>
              <p className="text-xs text-slate-400">ms</p>
            </div>
          </div>

          {/* Stress Level */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">压力状态</span>
              <span className={`font-medium ${getStressColor()}`}>{getStressText()}</span>
            </div>
            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  stressLevel === 'low' ? 'w-1/3 bg-green-400' :
                  stressLevel === 'medium' ? 'w-2/3 bg-yellow-400' :
                  'w-full bg-red-400'
                }`}
              />
            </div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-4">
              <p className="text-sm font-medium mb-2">🤖 AI 洞察</p>
              <ul className="space-y-1">
                {insights.map((insight, i) => (
                  <li key={i} className="text-sm text-slate-300">{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Chart */}
          {history.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-3">心率趋势</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history.slice(-20)}>
                    <defs>
                      <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="timestamp" hide />
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: 'none', 
                        borderRadius: '8px' 
                      }}
                      labelFormatter={() => ''}
                      formatter={(value: number) => [`${value} BPM`, '心率']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#hrGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ==================== Duo Mode View ====================

function DuoModeView({ subscription }: { subscription: Subscription | null }) {
  const [mode, setMode] = useState<'host' | 'join' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [partnerHeartRate, setPartnerHeartRate] = useState(0);
  const [messages, setMessages] = useState<Array<{ text: string; isMe: boolean }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionCode, setSessionCode] = useState('');

  const isPremiumPlus = subscription?.planId === 'premium-plus';

  const startHosting = async () => {
    try {
      const result = await duoSyncManager.createSession('user-id', {
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
        onData: (data) => {
          if (data.type === 'heartbeat') {
            setPartnerHeartRate((data.payload as any).heartRate);
          } else if (data.type === 'chat') {
            setMessages(prev => [...prev, { text: (data.payload as any).message, isMe: false }]);
          }
        },
        onError: (err) => console.error('Duo error:', err)
      });
      setSessionCode(result.inviteCode);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const joinSession = async () => {
    try {
      await duoSyncManager.joinSession(inviteCode, 'user-id', {
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
        onData: (data) => {
          if (data.type === 'heartbeat') {
            setPartnerHeartRate((data.payload as any).heartRate);
          } else if (data.type === 'chat') {
            setMessages(prev => [...prev, { text: (data.payload as any).message, isMe: false }]);
          }
        },
        onError: (err) => console.error('Duo error:', err)
      });
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    duoSyncManager.sendChatMessage(newMessage);
    setMessages(prev => [...prev, { text: newMessage, isMe: true }]);
    setNewMessage('');
  };

  if (!isPremiumPlus) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Users className="w-10 h-10 text-slate-600" />
        </div>
        
        <h2 className="text-xl font-bold mb-2">双人同步</h2>
        <p className="text-slate-400 text-center mb-6">
          与伴侣或家人一起练习，实时同步呼吸节奏和心率
        </p>
        
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 w-full">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-400" />
            <div className="flex-1">
              <p className="font-medium">家庭版功能</p>
              <p className="text-sm text-slate-400">升级到家庭版解锁双人同步</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold">双人同步</h2>
          <p className="text-slate-400 mt-2">与伴侣或家人一起呼吸</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { setMode('host'); startHosting(); }}
            className="w-full p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium">创建房间</p>
              <p className="text-sm opacity-70">邀请他人加入您的练习</p>
            </div>
          </button>

          <button
            onClick={() => setMode('join')}
            className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium">加入房间</p>
              <p className="text-sm text-slate-400">输入邀请码加入</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'host' && !isConnected) {
    return (
      <div className="p-4">
        <button
          onClick={() => setMode(null)}
          className="mb-4 text-slate-400 hover:text-white"
        >
          ← 返回
        </button>

        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">分享邀请码给对方</p>
          
          <div className="bg-slate-800 rounded-xl p-6 inline-block">
            <p className="text-4xl font-mono font-bold tracking-wider">{sessionCode}</p>
          </div>

          <p className="text-slate-400 mt-6">等待对方加入...⏳</p>
        </div>
      </div>
    );
  }

  if (mode === 'join' && !isConnected) {
    return (
      <div className="p-4">
        <button
          onClick={() => setMode(null)}
          className="mb-4 text-slate-400 hover:text-white"
        >
          ← 返回
        </button>

        <div className="space-y-4">
          <p className="text-slate-400">输入邀请码</p>
          
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="ABCDEF"
            maxLength={6}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-wider uppercase focus:outline-none focus:border-cyan-500"
          />

          <button
            onClick={joinSession}
            disabled={inviteCode.length !== 6}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 rounded-xl font-medium transition-colors"
          >
            加入
          </button>
        </div>
      </div>
    );
  }

  // Connected view
  return (
    <div className="p-4 space-y-4">
      <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-sm">已连接</span>
      </div>

      {/* Partner Stats */}
      {partnerHeartRate > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">对方心率</p>
              <p className="text-xl font-bold">{partnerHeartRate} BPM</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="bg-slate-800/50 rounded-xl p-4 h-48 overflow-y-auto">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`mb-2 ${msg.isMe ? 'text-right' : 'text-left'}`}
          >
            <span className={`inline-block px-3 py-1.5 rounded-xl text-sm ${
              msg.isMe ? 'bg-cyan-500' : 'bg-slate-700'
            }`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="发送消息..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
        >
          发送
        </button>
      </div>
    </div>
  );
}

// ==================== Premium View ====================

function PremiumView({ 
  subscription, 
  onUpdate 
}: { 
  subscription: Subscription | null; 
  onUpdate: (s: Subscription | null) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (plan?.stripePriceId) {
        await stripeService.redirectToCheckout(plan.stripePriceId);
      }
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    setLoading('cancel');
    try {
      const result = await stripeService.cancelSubscription();
      if (result.success) {
        const updated = await stripeService.getSubscription();
        onUpdate(updated);
        setShowCancelConfirm(false);
      }
    } catch (error) {
      console.error('Cancel failed:', error);
    } finally {
      setLoading(null);
    }
  };

  // If already subscribed
  if (subscription?.status === 'active') {
    const plan = subscriptionPlans.find(p => p.id === subscription.planId);
    
    return (
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Crown className="w-10 h-10 text-amber-400" />
            <div>
              <p className="font-bold">{plan?.name || '会员'}</p>
              <p className="text-sm text-slate-400">有效期至 {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-400">会员权益</p>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <ul className="space-y-2">
              {plan?.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {!subscription.cancelAtPeriodEnd ? (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full py-3 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            取消订阅
          </button>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-sm text-yellow-200">
              您的订阅将在 {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()} 到期
            </p>
            <button
              onClick={async () => {
                const result = await stripeService.reactivateSubscription();
                if (result.success) {
                  const updated = await stripeService.getSubscription();
                  onUpdate(updated);
                }
              }}
              className="mt-2 text-sm text-cyan-400 hover:underline"
            >
              恢复订阅
            </button>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-2">确认取消？</h3>
              <p className="text-slate-400 text-sm mb-4">
                取消后，您仍可使用会员功能直到当前计费周期结束。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2 bg-slate-800 rounded-lg"
                >
                  保留订阅
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading === 'cancel'}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  {loading === 'cancel' ? '处理中...' : '确认取消'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Subscription options
  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-4">
        <h2 className="text-xl font-bold">选择您的计划</h2>
        <p className="text-slate-400 mt-1">升级解锁全部功能</p>
      </div>

      <div className="space-y-3">
        {subscriptionPlans.filter(p => p.id !== 'free').map((plan) => (
          <div 
            key={plan.id}
            className={`bg-slate-800/50 rounded-xl p-4 border transition-all ${
              plan.id === 'premium-plus' 
                ? 'border-amber-500/50' 
                : 'border-slate-700'
            }`}
          >
            {plan.id === 'premium-plus' && (
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                推荐
              </span>
            )}
            
            <div className="flex justify-between items-start mt-2">
              <div>
                <p className="font-bold">{plan.name}</p>
                <p className="text-2xl font-bold mt-1">
                  ¥{plan.price}
                  <span className="text-sm font-normal text-slate-400">/月</span>
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 text-xs">✓</span>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id}
              className={`w-full mt-4 py-3 rounded-xl font-medium transition-colors ${
                plan.id === 'premium-plus'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                  : 'bg-cyan-500 hover:bg-cyan-600'
              }`}
            >
              {loading === plan.id ? '加载中...' : '订阅'}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-500">
        订阅可随时取消，无隐藏费用
      </p>
    </div>
  );
}

// ==================== Settings View ====================

function SettingsView() {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    hapticEnabled: true,
    autoStartBiometrics: false
  });

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">设置</h2>

      <div className="bg-slate-800/50 rounded-xl overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span>声音</span>
          </div>
          <button
            onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span>震动反馈</span>
          </div>
          <button
            onClick={() => setSettings(s => ({ ...s, hapticEnabled: !s.hapticEnabled }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.hapticEnabled ? 'bg-cyan-500' : 'bg-slate-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.hapticEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>自动开始生物监测</span>
          </div>
          <button
            onClick={() => setSettings(s => ({ ...s, autoStartBiometrics: !s.autoStartBiometrics }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.autoStartBiometrics ? 'bg-cyan-500' : 'bg-slate-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.autoStartBiometrics ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        <p>Breath AI v1.0.0</p>
        <p className="mt-1">© 2024 Breath AI. All rights reserved.</p>
      </div>
    </div>
  );
}

export default App;
