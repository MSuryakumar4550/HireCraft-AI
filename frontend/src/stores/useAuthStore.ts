import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/services/apiClient'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setCredentials: (token: string, user: User) => void
  logout: () => void
  login: (credentials: any) => Promise<void>
  register: (userData: any) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setCredentials: (token, user) => {
        set({ token, user, isAuthenticated: true })
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },

      login: async (credentials) => {
        const response = await apiClient.post<any>('/api/auth/login', credentials)
        if (response.data.accessToken) {
          set({
            token: response.data.accessToken,
            user: {
              id: response.data.userId,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              email: response.data.email,
              role: response.data.role
            },
            isAuthenticated: true,
          })
        }
      },

      register: async (userData) => {
        const response = await apiClient.post<any>('/api/auth/register', userData)
        if (response.data.accessToken) {
          set({
            token: response.data.accessToken,
            user: {
              id: response.data.userId,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              email: response.data.email,
              role: response.data.role
            },
            isAuthenticated: true,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
