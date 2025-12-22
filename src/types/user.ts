//
// Type definitions for the core user data structure.
//

export type UserRole = 'guest' | 'registered' | 'subscriber' | 'admin'

export interface User {
  id: string
  nickname: string
  avatar: string
  userType: UserRole
}
