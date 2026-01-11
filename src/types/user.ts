//
// Type definitions for the core user data structure.
//

export type UserRole = 'guest' | 'member' | 'pro' | 'admin'

export interface UserBase {
  id: string
  nickname: string
  avatar: string
  userType: UserRole
}

export interface UserProfile extends UserBase {
  planType: string
  planExpiresAt: string | null
  email: string
  lastLoginAt: string | null
}
