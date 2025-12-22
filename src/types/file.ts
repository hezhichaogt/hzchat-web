//
// Defines all core type definitions related to file handling, upload process,
// and file attachments used in chat messages (client-side and WebSocket payloads).
//
export interface Attachment {
  fileKey: string
  fileName: string
  mimeType: string
  fileSize: number
  meta?: Record<string, any>
}

export interface UploadAttachment extends Attachment {
  id: string
  previewUrl: string
  status: 'pending' | 'uploading' | 'success' | 'failed'
  originFile: File
}
