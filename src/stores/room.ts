//
// Room-specific access and state management Store.
//

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useRoomStore = defineStore('room', () => {
  const roomToken = ref<string | null>(null)

  const hasAccess = computed((): boolean => {
    return !!roomToken.value
  })

  function setRoomToken(newToken: string | null): void {
    roomToken.value = newToken
  }

  function clearRoomContext(): void {
    roomToken.value = null
  }

  return {
    roomToken,
    hasAccess,
    setRoomToken,
    clearRoomContext,
  }
})
