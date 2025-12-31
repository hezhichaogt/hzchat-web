//
// Auth API service module.
//

import { post } from '@/utils/request'
import type { UserProfile } from '@/types/user'

interface RegisterParams {
  username: string
  password: string
}

interface RegisterResponse {
  token: string
  user: UserProfile
}

export async function register(params: RegisterParams): Promise<RegisterResponse> {
  const url = '/auth/register'

  return await post<RegisterResponse>(url, params)
}

interface LoginParams {
  username: string
  password: string
}

interface LoginResponse {
  token: string
  user: UserProfile
}

export async function login(params: LoginParams): Promise<LoginResponse> {
  const url = '/auth/login'

  return await post<LoginResponse>(url, params)
}

interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

interface ChangePasswordResponse {
  token: string
}

export async function changePassword(
  params: ChangePasswordParams,
): Promise<ChangePasswordResponse> {
  const url = '/auth/change-password'

  return await post<ChangePasswordResponse>(url, params)
}
