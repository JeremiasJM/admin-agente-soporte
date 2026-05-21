import axios from 'axios'
import { useAuth } from './auth'

const API_URL = import.meta.env.VITE_API_URL as string

const api = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuth.getState().logout()
    }
    return Promise.reject(err)
  },
)

// ── Types ──────────────────────────────────────────────────────
export interface FaqEntry {
  id: string
  keywords: string[]
  question: string
  answer: string
  category?: string
}

export interface AgentSettings {
  llmModel: string
}

export interface AgentConfig {
  systemPrompt: string
  settings: AgentSettings
  faqs: FaqEntry[]
}

// ── Auth ──────────────────────────────────────────────────────
export const login = async (password: string): Promise<string> => {
  const res = await api.post<{ token: string }>('/login', { password })
  return res.data.token
}

// ── Prompt ─────────────────────────────────────────────────────
export const getPrompt = async (): Promise<{ prompt: string }> => {
  const res = await api.get<{ prompt: string }>('/prompt')
  return res.data
}

export const updatePrompt = async (prompt: string): Promise<void> => {
  await api.put('/prompt', { prompt })
}

// ── Settings ───────────────────────────────────────────────────
export const getSettings = async (): Promise<AgentSettings> => {
  const res = await api.get<AgentSettings>('/settings')
  return res.data
}

export const updateSettings = async (settings: AgentSettings): Promise<void> => {
  await api.put('/settings', settings)
}

// ── FAQs ───────────────────────────────────────────────────────
export const getFaqs = async (): Promise<FaqEntry[]> => {
  const res = await api.get<FaqEntry[]>('/faqs')
  return res.data
}

export const createFaq = async (
  faq: Omit<FaqEntry, 'id'>,
): Promise<FaqEntry> => {
  const res = await api.post<FaqEntry>('/faqs', faq)
  return res.data
}

export const updateFaq = async (
  id: string,
  faq: Partial<Omit<FaqEntry, 'id'>>,
): Promise<FaqEntry> => {
  const res = await api.put<FaqEntry>(`/faqs/${id}`, faq)
  return res.data
}

export const deleteFaq = async (id: string): Promise<void> => {
  await api.delete(`/faqs/${id}`)
}
