import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserProfile } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

// Mock authentication - replace with real API
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock successful login
        const mockUser: User = {
          id: 'user_' + Date.now(),
          email,
          name: email.split('@')[0],
          createdAt: new Date().toISOString(),
          profile: {
            age: 28,
            gender: 'male',
            height: 175,
            weight: 70,
            activityLevel: 'moderate',
            goal: 'maintain',
            dietaryRestrictions: [],
            allergies: [],
            preferredCuisines: ['chinese', 'western']
          }
        }
        
        set({
          user: mockUser,
          isAuthenticated: true,
          token: 'mock_token_' + Date.now(),
          isLoading: false
        })
      },

      signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true })
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockUser: User = {
          id: 'user_' + Date.now(),
          email,
          name,
          createdAt: new Date().toISOString(),
        }
        
        set({
          user: mockUser,
          isAuthenticated: true,
          token: 'mock_token_' + Date.now(),
          isLoading: false
        })
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null
        })
      },

      checkAuth: () => {
        const { token, user } = get()
        if (token && user) {
          set({ isAuthenticated: true })
        }
      },

      updateProfile: async (profile: Partial<UserProfile>) => {
        const { user } = get()
        if (!user) return
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        set({
          user: {
            ...user,
            profile: { ...user.profile, ...profile } as UserProfile
          }
        })
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (!user) return
        set({ user: { ...user, ...userData } })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        token: state.token 
      })
    }
  )
)
