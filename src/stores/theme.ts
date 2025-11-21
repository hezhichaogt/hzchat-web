//
// Theme state management Store.
//

import { defineStore } from 'pinia'

interface ThemeState {
  isDark: boolean
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  }),

  getters: {
    getIsDark: (state) => state.isDark,
  },

  actions: {
    setIsDark(value: boolean) {
      this.isDark = value
    },
  },
})
