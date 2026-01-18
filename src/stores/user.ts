import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UserProfile } from '@/types/user'
import { getOrCreateGuestID, resetGuestID } from '@/utils/guest'

const IDENTITY_TOKEN_KEY = 'hzchat-identity-token'
const USER_PROFILE_KEY = 'hzchat-user-profile'

export const useUserStore = defineStore('user', () => {
  const guestID = ref<string>(getOrCreateGuestID())
  const identityToken = ref<string | null>(localStorage.getItem(IDENTITY_TOKEN_KEY))
  const userProfile = ref<UserProfile | null>(null)

  try {
    const savedProfile = localStorage.getItem(USER_PROFILE_KEY)
    if (savedProfile) {
      userProfile.value = JSON.parse(savedProfile)
    }
  } catch (e) {
    console.error('Failed to parse saved user profile:', e)
  }

  const isLoggedIn = computed(() => !!identityToken.value && !!userProfile.value)

  const profile = computed((): UserProfile => {
    if (isLoggedIn.value && userProfile.value) {
      return userProfile.value
    }

    const defaultNickname = `Guest #$${guestID.value.slice(-6)}`

    return {
      id: guestID.value,
      nickname: defaultNickname,
      avatar: '',
      userType: 'guest',
      planType: 'FREE',
      planExpiresAt: null,
      lastLoginAt: null,
      email: '',
    }
  })

  const userType = computed(() => profile.value.userType)

  const isPro = computed(() => userType.value === 'pro')
  const isMember = computed(() => userType.value === 'member')
  const isGuest = computed(() => userType.value === 'guest')

  function handleLoginSuccess(token: string, userInfo: UserProfile) {
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

  function updateProfile(userInfo: UserProfile, token?: string) {
    userProfile.value = { ...userInfo }

    if (token) {
      identityToken.value = token
    }

    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userInfo))
      if (token) {
        localStorage.setItem(IDENTITY_TOKEN_KEY, token)
      }
    } catch (e) {
      console.warn('Failed to persist updated profile:', e)
    }
  }

  function refreshIdentity() {
    const newID = resetGuestID()
    guestID.value = newID
  }

  return {
    isLoggedIn,
    profile,
    userType,
    isPro,
    isMember,
    isGuest,
    identityToken,
    handleLoginSuccess,
    logout,
    updateProfile,
    refreshIdentity,
  }
})
