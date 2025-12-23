//
// Theme state management Store.
//

import { defineStore } from 'pinia'

interface ThemeState {
  isDark: boolean
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    isDark: false,
  }),

  getters: {
    getIsDark: (state) => state.isDark,
  },

  actions: {
    setIsDark(value: boolean) {
      this.isDark = false
    },
  },
})
