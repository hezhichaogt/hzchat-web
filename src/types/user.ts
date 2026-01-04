//
// Type definitions for the core user data structure.
//

export type UserRole = 'guest' | 'registered' | 'subscriber' | 'admin'

export interface UserBase {
  id: string
  nickname: string
  avatar: string
  userType: UserRole
}

export interface UserProfile extends UserBase {
  planType: string
  lastLoginAt: string | null
  email: string
}
