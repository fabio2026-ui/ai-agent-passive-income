// Shared types for Breath AI

export interface HeartRateData {
  timestamp: number;
  heartRate: number;
  hrv?: number; // Heart Rate Variability (RMSSD)
}

export interface BiometricSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  heartRateReadings: HeartRateData[];
  averageHeartRate: number;
  averageHRV: number;
  stressLevel: 'low' | 'medium' | 'high';
}

export type BreathingPattern = 
  | 'calm'      // 4-7-8: Inhale 4s, Hold 7s, Exhale 8s
  | 'energy'    // 4-4-4-4: Box breathing
  | 'sleep'     // 4-7-8 with longer holds
  | 'focus'     // 6-0-6: Rhythmic breathing
  | 'recovery'  // 5-5-5: Coherence breathing
  | 'stress-relief'; // 4-4-6: Extended exhale

export interface BreathingSession {
  id: string;
  userId: string;
  pattern: BreathingPattern;
  startTime: number;
  duration: number; // seconds
  cycles: number;
  biometricSessionId?: string;
  partnerSessionId?: string; // For duo mode
}

export interface AIRecommendation {
  pattern: BreathingPattern;
  confidence: number; // 0-1
  reason: string;
  estimatedDuration: number; // seconds
}

export interface UserProfile {
  id: string;
  email: string;
  subscriptionStatus: 'free' | 'premium' | 'premium-plus';
  subscriptionExpiry?: number;
  preferences: {
    defaultDuration: number;
    soundEnabled: boolean;
    hapticEnabled: boolean;
    autoStartBiometrics: boolean;
  };
  biometricHistory: BiometricSession[];
  lastStressLevel?: 'low' | 'medium' | 'high';
}

// WebRTC Duo Mode Types
export interface DuoSession {
  id: string;
  hostId: string;
  guestId?: string;
  status: 'waiting' | 'connected' | 'breathing' | 'ended';
  pattern: BreathingPattern;
  createdAt: number;
}

export interface PeerSignal {
  type: 'offer' | 'answer' | 'candidate';
  sdp?: string;
  candidate?: RTCIceCandidateInit;
  sessionId: string;
}

// Stripe Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export interface Subscription {
  id: string;
  userId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  planId: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

// Bluetooth Heart Rate Service
export const HEART_RATE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
export const HEART_RATE_MEASUREMENT_UUID = '00002a37-0000-1000-8000-00805f9b34fb';
export const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
