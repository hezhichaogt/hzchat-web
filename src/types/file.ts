export interface Attachment {
  fileKey: string
  fileName: string
  mimeType: string
  fileSize: number
  meta?: Record<string, any>
  status?:
    | 'downloading'
    | 'downloaded'
    | 'download_failed'
    | 'pending'
    | 'uploading'
    | 'uploaded'
    | 'upload_failed'
}

export interface UploadAttachment extends Attachment {
  id: string
  previewUrl: string
  originFile: File
  status: 'pending' | 'uploading' | 'uploaded' | 'upload_failed'
}
