import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('jammify_token') || null,
  isAuthenticated: !!localStorage.getItem('jammify_token'),
  isLoading: false,
  
  setUser: (user) => set({ user, isAuthenticated: true }),
  setToken: (token) => {
    localStorage.setItem('jammify_token', token)
    set({ token, isAuthenticated: true })
  },
  setLoading: (isLoading) => set({ isLoading }),
  
  login: (user, token) => {
    localStorage.setItem('jammify_token', token)
    set({ user, token, isAuthenticated: true, isLoading: false })
  },
  
  logout: () => {
    localStorage.removeItem('jammify_token')
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },
}))
