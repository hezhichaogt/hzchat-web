//
// Core TypeScript type definitions for the chat functionality.
//

import type { UserBase, UserProfile } from './user'
import type { Attachment } from './file'

export type MessageStatus = 'sending' | 'sent' | 'failed'
export type SystemStyleType = 'default' | 'error' | 'info' | 'warning'

export type ConnectionStatus =
  | 'INIT'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECT_DELAY'
  | 'FINAL_DISCONNECT'
  | 'FATAL_ERROR'
  | 'AUTH_REQUIRED'
  | 'PASSWORD_REQUIRED'

interface BaseMessage {
  id: string
  timestamp: number
  tempId?: string
}

export interface UserMessage extends BaseMessage {
  messageType: 'user'
  sender: UserBase
  isOwn: boolean
  content: string
  status: MessageStatus
  attachments?: Attachment[]
}

export interface SystemMessage extends BaseMessage {
  messageType: 'system'
  content: string
  style?: SystemStyleType
}

export type ClientMessage = UserMessage | SystemMessage

export interface ChatInfo {
  code: string
  maxClients: number
  currentClients: number
}

export interface TextPayload {
  content: string
}

export interface AttachmentsPayload {
  description?: string
  attachments: Attachment[]
}

export interface RoomExpiringPayload {
  reason: string
}

export interface RoomUpdatePayload {
  name: string
  password?: string
  requireAuth?: boolean
}

export interface UserEventPayload {
  user: UserBase
}

export interface ErrorPayload {
  code: number
  message: string
}

export interface InitDataPayload {
  creatorId: string
  currentUser: UserProfile
  onlineUsers: UserBase[]
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
  | 'ROOM_EXPIRING'
  | 'ROOM_INFO_UPDATED'

export interface ServerMessage {
  id: string
  type: MessageType
  roomCode: string
  sender: UserBase
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
    | RoomExpiringPayload
    | RoomUpdatePayload
}

export type OutboundMessageType = 'TEXT' | 'ATTACHMENTS'

export interface OutboundMessage {
  type: OutboundMessageType
  tempId?: string
  payload: TextPayload | AttachmentsPayload
}

export interface PersistentChat {
  id: string
  code: string
  name: string
  requireAuth: boolean
  hasPassword: boolean
  metadata: any
}
