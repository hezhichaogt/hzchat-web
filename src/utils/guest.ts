//
// Guest identity management utility module.
//

const GUEST_ID_KEY = 'HZCHAT_GUEST'
const GUEST_ID_PREFIX = 'guest_'
const GUEST_ID_LENGTH = 6
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const GUEST_NICKNAME_KEY = 'HZCHAT_NICKNAME'

function generateSecureBase62(length: number): string {
  let result = ''
  const charsLength = BASE62_CHARS.length

  const randomValues: Uint8Array = new Uint8Array(length)

  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomValues)
  } else {
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256)
    }
  }

  for (let i = 0; i < length; i++) {
    const randomIndex: number = randomValues[i]! % charsLength
    result += BASE62_CHARS.charAt(randomIndex)
  }
  return result
}

export function getOrCreateGuestID(): string {
  let guestID = localStorage.getItem(GUEST_ID_KEY)

  if (!guestID) {
    const rawID = generateSecureBase62(GUEST_ID_LENGTH)
    guestID = GUEST_ID_PREFIX + rawID

    try {
      localStorage.setItem(GUEST_ID_KEY, guestID)
    } catch (e) {
      console.error('localStorage write failed:', e)
    }
  }

  return guestID
}

export function loadNickname(): string | null {
  try {
    const nickname = localStorage.getItem(GUEST_NICKNAME_KEY)
    return nickname?.trim() || null
  } catch (e) {
    console.error('LocalStorage read failed:', e)
    return null
  }
}

export function saveNickname(nickname: string): void {
  const trimmedNickname = nickname.trim()
  try {
    if (trimmedNickname) {
      localStorage.setItem(GUEST_NICKNAME_KEY, trimmedNickname)
    } else {
      localStorage.removeItem(GUEST_NICKNAME_KEY)
    }
  } catch (e) {
    console.error('LocalStorage write failed:', e)
  }
}
