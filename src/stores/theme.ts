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
      root.classList.toggle('dark', isDark)
      return
    }

    // 核心：切换前锁死过渡，切换后释放
    root.classList.add('suppress-transition')
    root.classList.toggle('dark', isDark)

    // 使用 requestAnimationFrame 确保在浏览器渲染完类名切换后再移除
    requestAnimationFrame(() => {
      // 稍微延迟一帧，确保颜色已经跳变完成
      requestAnimationFrame(() => {
        root.classList.remove('suppress-transition')
      })
    })
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
