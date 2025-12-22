import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/user'
import { getOrCreateGuestID, loadNickname, saveNickname } from '@/utils/guest'

const IDENTITY_TOKEN_KEY = 'HZCHAT_IDENTITY_TOKEN'
const USER_PROFILE_KEY = 'HZCHAT_USER_PROFILE'

export const useUserStore = defineStore('user', () => {
  const guestID = ref<string>(getOrCreateGuestID())
  const guestNickname = ref<string | null>(loadNickname())

  const identityToken = ref<string | null>(localStorage.getItem(IDENTITY_TOKEN_KEY))
  const userProfile = ref<User | null>(null)

  try {
    const savedProfile = localStorage.getItem(USER_PROFILE_KEY)
    if (savedProfile) {
      userProfile.value = JSON.parse(savedProfile)
    }
  } catch (e) {
    console.error('Failed to parse saved user profile:', e)
  }

  const isLoggedIn = computed(() => !!identityToken.value && !!userProfile.value)

  const profile = computed((): User => {
    if (isLoggedIn.value && userProfile.value) {
      return userProfile.value
    }

    const defaultNickname = `Guest_${guestID.value.slice(-6)}`

    return {
      id: guestID.value,
      nickname: guestNickname.value || defaultNickname,
      avatar: '',
      userType: 'guest',
    }
  })

  const getDisplayName = computed((): string => {
    return profile.value.nickname || profile.value.id
  })

  function setGuestNickname(name: string) {
    const trimmed = name.trim()
    guestNickname.value = trimmed || null
    saveNickname(trimmed)
  }

  function handleLoginSuccess(token: string, userInfo: User) {
    identityToken.value = token
    userProfile.value = { ...userInfo }

    try {
      localStorage.setItem(IDENTITY_TOKEN_KEY, token)
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userInfo))
    } catch (e) {
      console.warn('Failed to persist auth data:', e)
    }
  }

  function logout() {
    identityToken.value = null
    userProfile.value = null

    try {
      localStorage.removeItem(IDENTITY_TOKEN_KEY)
      localStorage.removeItem(USER_PROFILE_KEY)
    } catch (e) {
      console.warn('Failed to clear auth data:', e)
    }
  }

  return {
    isLoggedIn,
    profile,
    identityToken,
    getDisplayName,
    setGuestNickname,
    handleLoginSuccess,
    logout,
  }
})
