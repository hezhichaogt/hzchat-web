//
// Chat session API service module.
//

import { post, get } from '@/utils/request'
import { useUserStore } from '@/stores/user'
import type { PersistentChat } from '@/types/chat'

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
  chat: PersistentChat
}

export async function joinChat(code: string, password?: string): Promise<JoinChatResponse> {
  const url = '/chat/join'
  const userStore = useUserStore()
  const { profile } = userStore

  const data: any = { code }

  if (profile.userType === 'guest') {
    data.guestId = profile.id
  }

  if (password) {
    data.password = password
  }

  return await post<JoinChatResponse>(url, data)
}

export async function terminateChat(code: string): Promise<void> {
  const url = '/chat/terminate'
  const data = { code }

  return await post<void>(url, data)
}

export interface CreatePersistentChatInput {
  code: string
  name: string
  password?: string
  requireAuth: boolean
}

interface CreatePersistentChatResponse {
  id: string
  code: string
  name: string
  requireAuth: boolean
  hasPassword: boolean
  metadata: any
}

export async function createPersistentChat(
  data: CreatePersistentChatInput,
): Promise<CreatePersistentChatResponse> {
  const url = '/chat/create-persistent'

  return await post<CreatePersistentChatResponse>(url, data)
}

interface GetPersistentChatsResponse {
  chats: CreatePersistentChatResponse[]
}

export async function getPersistentChats(): Promise<GetPersistentChatsResponse> {
  const url = '/chat/persistent-chats'

  return await get<GetPersistentChatsResponse>(url)
}

export interface UpdatePersistentChatInput {
  id: string
  name: string
  password?: string
  requireAuth: boolean
}

export async function updatePersistentChat(
  data: UpdatePersistentChatInput,
): Promise<CreatePersistentChatResponse> {
  const url = '/chat/persistent/update'
  const payload: any = { ...data }

  if (payload.password === undefined) {
    delete payload.password
  }

  return await post<CreatePersistentChatResponse>(url, payload)
}

export async function deletePersistentChat(id: string): Promise<void> {
  const url = '/chat/persistent/delete'
  const data = { id }

  return await post<void>(url, data)
}
