//
// Guest state management Store.
//

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getOrCreateGuestID, loadNickname, saveNickname } from '@/utils/guest'

export const useGuestStore = defineStore('guest', () => {
  const guestID: string = getOrCreateGuestID()
  const nickname = ref<string | null>(loadNickname())

  const getDisplayName = computed((): string => {
    return nickname.value?.trim() || guestID
  })

  function getCurrentNickname(): string | null {
    return nickname.value
  }

  function setNickname(newNickname: string): void {
    const trimmed = newNickname.trim()

    if (trimmed) {
      nickname.value = trimmed
    } else {
      nickname.value = null
    }

    saveNickname(trimmed)
  }

  return {
    guestID,
    nickname,
    getDisplayName,
    getCurrentNickname,
    setNickname,
  }
})
