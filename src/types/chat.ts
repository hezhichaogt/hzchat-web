//
// Core TypeScript type definitions for the chat functionality.
//

import type { User } from './user'
import type { Attachment } from './file'

export type ChatType = 'private' | 'group'

export type ConnectionStatus =
  | 'INIT'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECT_DELAY'
  | 'FINAL_DISCONNECT'
  | 'FATAL_ERROR'

export interface ChatInfo {
  code: string
  maxClients: number
  currentClients: number
}

interface BaseMessage {
  id: string
  timestamp: number
  tempId?: string
}

export interface UserMessage extends BaseMessage {
  messageType: 'user'
  sender: User
  isOwn: boolean
  content: string
  status: MessageStatus
  attachments?: Attachment[]
}

export type SystemStyleType = 'default' | 'error'

export interface SystemMessage extends BaseMessage {
  messageType: 'system'
  content: string
  style?: SystemStyleType
}

export type ClientMessage = UserMessage | SystemMessage

export interface TextPayload {
  content: string
}

export interface UserEventPayload {
  user: User
}

export interface ErrorPayload {
  code: number
  message: string
}

export interface InitDataPayload {
  currentUser: User
  onlineUsers: User[]
  maxUsers: number
}

export interface MessageConfirmPayload {
  tempId: string
  id: string
  timestamp: number
}

export interface TokenUpdatePayload {
  token: string
}

export interface AttachmentsPayload {
  description?: string
  attachments: Attachment[]
}

export type UserEventType = 'USER_JOINED' | 'USER_LEFT'

export type MessageType =
  | 'TEXT'
  | 'MSG_CONFIRM'
  | 'INIT_DATA'
  | 'USER_JOINED'
  | 'USER_LEFT'
  | 'ERROR'
  | 'TOKEN_UPDATE'
  | 'ATTACHMENTS'

export interface ServerMessage {
  id: string
  type: MessageType
  roomCode: string
  sender: User
  timestamp: number
  tempId?: string
  payload:
    | TextPayload
    | UserEventPayload
    | ErrorPayload
    | InitDataPayload
    | MessageConfirmPayload
    | TokenUpdatePayload
    | AttachmentsPayload
}

export type OutboundMessageType = 'TEXT' | 'ATTACHMENTS'

export interface OutboundMessage {
  type: OutboundMessageType
  tempId?: string
  payload: TextPayload | AttachmentsPayload
}

export type MessageStatus = 'sending' | 'sent' | 'failed'
