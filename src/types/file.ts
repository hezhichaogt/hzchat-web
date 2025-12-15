//
// Defines all core type definitions related to file handling, upload process,
// and file attachments used in chat messages (client-side and WebSocket payloads).
//

export interface UploadAttachment {
  id: string
  previewUrl: string
  status: 'pending' | 'uploading' | 'success' | 'failed'
  originFile: File
  fileKey: string
  fileName: string
  mimeType: string
  fileSize: number
}

export interface Attachment {
  fileKey: string
  fileName: string
  mimeType: string
  fileSize: number
  meta?: Record<string, any>
}
