import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Subscription } from '../types'

interface SubscriptionState {
  subscription: Subscription | null
  isSubscribed: boolean
  isTrial: boolean
  daysRemaining: number
  
  // Actions
  checkSubscription: () => void
  subscribe: (plan: 'monthly' | 'yearly') => Promise<void>
  cancelSubscription: () => Promise<void>
  startTrial: () => void
}

const YEARLY_PRICE = 49.99
const MONTHLY_PRICE = 4.99

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,
      isSubscribed: false,
      isTrial: false,
      daysRemaining: 0,

      checkSubscription: () => {
        const { subscription } = get()
        if (!subscription) {
          set({ isSubscribed: false, isTrial: false, daysRemaining: 0 })
          return
        }

        const now = new Date()
        const endDate = new Date(subscription.endDate)
        const diffTime = endDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        const isActive = subscription.status === 'active' || 
                        (subscription.status === 'trial' && diffDays > 0)

        set({
          isSubscribed: isActive,
          isTrial: subscription.status === 'trial',
          daysRemaining: Math.max(0, diffDays)
        })
      },

      subscribe: async (plan: 'monthly' | 'yearly') => {
        // Simulate Stripe payment
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const now = new Date()
        const endDate = new Date(now)
        if (plan === 'yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1)
        } else {
          endDate.setMonth(endDate.getMonth() + 1)
        }

        const newSubscription: Subscription = {
          id: 'sub_' + Date.now(),
          userId: 'current_user',
          status: 'active',
          plan,
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          price: plan === 'yearly' ? YEARLY_PRICE : MONTHLY_PRICE,
          currency: 'USD',
          stripeSubscriptionId: 'stripe_sub_' + Date.now()
        }

        set({
          subscription: newSubscription,
          isSubscribed: true,
          isTrial: false,
          daysRemaining: plan === 'yearly' ? 365 : 30
        })
      },

      cancelSubscription: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { subscription } = get()
        if (subscription) {
          set({
            subscription: { ...subscription, status: 'cancelled' }
          })
        }
      },

      startTrial: () => {
        const now = new Date()
        const endDate = new Date(now)
        endDate.setDate(endDate.getDate() + 7) // 7-day trial

        const trialSubscription: Subscription = {
          id: 'sub_' + Date.now(),
          userId: 'current_user',
          status: 'trial',
          plan: 'yearly',
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          price: 0,
          currency: 'USD'
        }

        set({
          subscription: trialSubscription,
          isSubscribed: true,
          isTrial: true,
          daysRemaining: 7
        })
      }
    }),
    {
      name: 'subscription-storage',
      partialize: (state) => ({ subscription: state.subscription })
    }
  )
)

export { YEARLY_PRICE, MONTHLY_PRICE }
