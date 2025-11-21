//
// Core TypeScript type definitions for the chat functionality.
//

import type { User } from './user'

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
  tempID?: string
}

export type UserContentType = 'text' | 'image'

export interface UserMessage extends BaseMessage {
  messageType: 'user'
  sender: User
  isOwn: boolean
  content: string
  contentType: UserContentType
  status: MessageStatus
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
  tempID: string
  id: string
  timestamp: number
}

export type UserEventType = 'USER_JOINED' | 'USER_LEFT'

export type MessageType =
  | 'TEXT'
  | 'MSG_CONFIRM'
  | 'INIT_DATA'
  | 'USER_JOINED'
  | 'USER_LEFT'
  | 'ERROR'

export interface ServerMessage {
  id: string
  type: MessageType
  roomCode: string
  sender: User
  timestamp: number
  tempID?: string
  payload: TextPayload | UserEventPayload | ErrorPayload | InitDataPayload | MessageConfirmPayload
}

export type OutboundMessageType = 'TEXT'

export interface OutboundMessage {
  type: OutboundMessageType
  tempID?: string
  payload: TextPayload
}

export type MessageStatus = 'sending' | 'sent' | 'failed'
