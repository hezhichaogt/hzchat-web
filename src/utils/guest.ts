//
// Guest identity management utility module.
//

const GUEST_ID_KEY = 'hzchat-guest-id'
const GUEST_ID_PREFIX = 'guest_'
const GUEST_ID_RAW_LENGTH = 6
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

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
  let guestId = localStorage.getItem(GUEST_ID_KEY)

  if (
    !guestId ||
    !guestId.startsWith(GUEST_ID_PREFIX) ||
    guestId.length !== GUEST_ID_PREFIX.length + GUEST_ID_RAW_LENGTH
  ) {
    const rawID = generateSecureBase62(GUEST_ID_RAW_LENGTH)
    guestId = GUEST_ID_PREFIX + rawID

    try {
      localStorage.setItem(GUEST_ID_KEY, guestId)
    } catch (e) {
      console.warn('Failed to save guestID to localStorage:', e)
    }
  }

  return guestId
}

export function resetGuestID(): string {
  const rawID = generateSecureBase62(GUEST_ID_RAW_LENGTH)
  const newGuestId = GUEST_ID_PREFIX + rawID

  try {
    localStorage.setItem(GUEST_ID_KEY, newGuestId)
  } catch (e) {
    console.warn('Failed to reset guestID in localStorage:', e)
  }

  return newGuestId
}
