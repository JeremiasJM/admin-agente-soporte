import { create } from 'zustand'

interface AuthState {
  token: string | null
  setToken: (token: string) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  token: sessionStorage.getItem('admin_token'),
  setToken: (token) => {
    sessionStorage.setItem('admin_token', token)
    set({ token })
  },
  logout: () => {
    sessionStorage.removeItem('admin_token')
    set({ token: null })
  },
}))
