//
// Chat session API service module.
//

import { post } from '@/utils/request'
import { useUserStore } from '@/stores/user'

interface CreateChatResponse {
  chatCode: string
}

export async function createChat(): Promise<CreateChatResponse> {
  const url = '/chat/create'
  const userStore = useUserStore()
  const { profile } = userStore

  const data: any = {}

  if (profile.userType === 'guest') {
    data.guestId = profile.id
  }

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
  }

  return await post<JoinChatResponse>(url, data)
}

export async function terminateChat(code: string): Promise<void> {
  const url = '/chat/terminate'
  const data = { code }

  return await post<void>(url, data)
}
