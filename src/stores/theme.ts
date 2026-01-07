//
// Theme state management Store.
//

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>((localStorage.getItem('hzchat-theme') as Theme) || 'system')
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const applyTheme = (isInitial = false) => {
    const root = document.documentElement
    const isDark = theme.value === 'dark' || (theme.value === 'system' && mediaQuery.matches)

    if (isInitial) {
      root.classList.add('suppress-transition')
      root.classList.toggle('dark', isDark)
      void root.offsetHeight
      root.classList.remove('suppress-transition')
    } else {
      root.classList.toggle('dark', isDark)
    }
  }

  const handleSystemChange = () => {
    if (theme.value === 'system') applyTheme()
  }

  const initSystemListener = () => {
    mediaQuery.addEventListener('change', handleSystemChange)
  }

  watch(theme, (newTheme) => {
    localStorage.setItem('hzchat-theme', newTheme)
    applyTheme()
  })

  return {
    theme,
    applyTheme,
    initSystemListener,
    setTheme: (t: Theme) => (theme.value = t),
  }
})
