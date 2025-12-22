//
// Chat session API service module.
//

import { post } from '@/utils/request'
import { useUserStore } from '@/stores/user'
import type { ChatType } from '@/types/chat'

interface CreateChatResponse {
  chatCode: string
}

export async function createChat(type: ChatType): Promise<CreateChatResponse> {
  const url = '/chat/create'
  const data = { type }

  return await post<CreateChatResponse>(url, data)
}

interface JoinChatResponse {
  token: string
}

export async function joinChat(code: string): Promise<JoinChatResponse> {
  const url = '/chat/join'
  const userStore = useUserStore()
  const { profile } = userStore

  const data: any = { code }

  if (profile.userType === 'guest') {
    data.guestId = profile.id
    data.nickname = profile.nickname
  }

  return await post<JoinChatResponse>(url, data)
}
