import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('subnet-fit-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const html = document.documentElement
  if (theme === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
  localStorage.setItem('subnet-fit-theme', theme)
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
