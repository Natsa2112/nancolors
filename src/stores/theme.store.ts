import { atom } from 'nanostores'

export type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  const stored = localStorage.getItem('nan-theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

export const $theme = atom<Theme>('light')

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('nan-theme', theme)
}

export function initTheme() {
  const t = getInitialTheme()
  $theme.set(t)
  applyTheme(t)
}

export function toggleTheme() {
  const next = $theme.get() === 'light' ? 'dark' : 'light'
  $theme.set(next)
  applyTheme(next)
}
