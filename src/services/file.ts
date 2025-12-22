//
// File API service module.
//

import { post } from '@/utils/request'

interface FilePresignUploadResponse {
  presignedUrl: string
  fileKey: string
  fileName: string
}

export async function presignUpload(
  fileName: string,
  mimeType: string,
  fileSize: number,
): Promise<FilePresignUploadResponse> {
  const url = '/file/presign-upload'

  const data = {
    fileName,
    mimeType,
    fileSize,
  }

  return await post<FilePresignUploadResponse>(url, data)
}
