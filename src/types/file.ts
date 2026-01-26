export interface Attachment {
  fileKey: string
  fileName: string
  mimeType: string
  fileSize: number
  meta?: Record<string, any>
  url?: string | null
}

export interface UploadAttachment extends Attachment {
  id: string
  previewUrl: string
  originFile: File
  status: 'pending' | 'uploading' | 'uploaded' | 'upload_failed'
  cover?: string
  progress?: number
}
