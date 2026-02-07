import { create } from 'zustand'
import { config } from '@/lib/config'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

function resolveTheme(preference: 'light' | 'dark' | 'system'): Theme {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return preference
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return resolveTheme(config.defaultTheme === 'system' ? 'dark' : config.defaultTheme)
  const stored = localStorage.getItem(config.themeStorageKey)
  if (stored === 'light' || stored === 'dark') return stored
  return resolveTheme(config.defaultTheme)
}

function applyTheme(theme: Theme) {
  const html = document.documentElement
  if (theme === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
  localStorage.setItem(config.themeStorageKey, theme)
}

// Apply initial theme immediately
const initialTheme = getInitialTheme()
if (typeof window !== 'undefined') {
  applyTheme(initialTheme)
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return { theme: next }
    }),

  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))
