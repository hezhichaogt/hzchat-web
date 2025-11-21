//
// Chat session API service module.
//

import { get, post, RequestError } from '@/utils/request'
import type { ChatType } from '@/types/chat'

interface CreateChatResponse {
  chatCode: string
}

export async function createChat(type: ChatType): Promise<CreateChatResponse> {
  const data = {
    type: type,
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

interface CheckChatStatusResponse {
  canJoin: boolean
}

export async function checkChatStatus(chatCode: string): Promise<CheckChatStatusResponse> {
  const url = `/chat/${chatCode}/check`

  try {
    const responseData = await get<CheckChatStatusResponse>(url)
    return responseData
  } catch (error) {
    if (error instanceof RequestError) {
      throw error
    }
    throw new RequestError('Failed to connect to the server for chat check.')
  }
}
