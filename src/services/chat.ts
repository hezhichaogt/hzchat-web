//
// Chat session API service module.
//

import { post, RequestError } from '@/utils/request'
import type { ChatType } from '@/types/chat'

interface CreateChatResponse {
  chatCode: string
}

export async function createChat(type: ChatType): Promise<CreateChatResponse> {
  const data = {
    type,
  }

  const url = '/chat/create'

  try {
    const responseData = await post<CreateChatResponse>(url, data)
    if (!responseData || !responseData.chatCode) {
      throw new RequestError('API response missing chat code.', { code: -2 })
    }

    return responseData
  } catch (error) {
    if (error instanceof RequestError) {
      throw error
    }
    throw new RequestError('Failed to initiate chat creation.')
  }
}

interface JoinChatResponse {
  token: string
}

export async function joinChat(code: string, guestID: string): Promise<JoinChatResponse> {
  const url = `/chat/join`

  const data = {
    code,
    guestID,
  }

  try {
    const responseData = await post<JoinChatResponse>(url, data)
    return responseData
  } catch (error) {
    if (error instanceof RequestError) {
      throw error
    }
    throw new RequestError('Failed to join chat session.')
  }
}
