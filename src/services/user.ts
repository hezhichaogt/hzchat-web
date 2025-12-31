//
// User API service module.
//

import { post, get } from '@/utils/request'
import type { UserProfile } from '@/types/user'

interface ProfileResponse {
  user: UserProfile
}

export async function getUserProfile(): Promise<ProfileResponse> {
  const url = '/user/profile'

  return await get<ProfileResponse>(url)
}

interface UpdateProfileParams {
  nickname: string
  avatarUrl: string
}

interface UpdateProfileResponse {
  token?: string
  user: UserProfile
}

export async function updateUserProfile(
  params: UpdateProfileParams,
): Promise<UpdateProfileResponse> {
  const url = '/user/profile'

  return await post<UpdateProfileResponse>(url, params)
}

interface PresignAvatarParams {
  mimeType: string
  fileSize: number
}

interface PresignAvatarResponse {
  presignedUrl: string
  fileKey: string
}

export async function presignAvatar(params: PresignAvatarParams): Promise<PresignAvatarResponse> {
  const url = '/user/avatar/presign'

  return await post<PresignAvatarResponse>(url, params)
}
