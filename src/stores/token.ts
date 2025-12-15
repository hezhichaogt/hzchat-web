//
// Token state management Store.
//

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTokenStore = defineStore('token', () => {
  const token = ref<string | null>(null)

  const isAuthenticated = computed((): boolean => {
    return !!token.value
  })

  const getToken = computed((): string | null => {
    return token.value
  })

  function setToken(newToken: string | null): void {
    token.value = newToken
  }

  function clearToken(): void {
    setToken(null)
  }

  return {
    token,

    isAuthenticated,
    getToken,

    setToken,
    clearToken,
  }
})
