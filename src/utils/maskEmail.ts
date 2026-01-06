export const maskEmail = (email: string): string => {
  if (!email) return ''

  const atIndex = email.indexOf('@')
  if (atIndex <= 0) return '****'

  const username = email.slice(0, atIndex)
  const domain = email.slice(atIndex)
  const n = username.length

  let maskedUsername: string
  if (n <= 2) {
    maskedUsername = '**'
  } else if (n <= 4) {
    maskedUsername = username[0] + '**' + username[n - 1]
  } else {
    maskedUsername = username.slice(0, 2) + '****' + username.slice(-2)
  }

  return maskedUsername + domain
}
