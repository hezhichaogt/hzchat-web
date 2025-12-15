//
// File API service module.
//

import { post, RequestError } from '@/utils/request'

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
    file_name: fileName,
    mime_type: mimeType,
    file_size: fileSize,
  }

  try {
    const responseData = await post<FilePresignUploadResponse>(url, data)
    if (!responseData || !responseData.presignedUrl || !responseData.fileKey) {
      throw new RequestError('API response missing presigned URL or file key.', { code: -2 })
    }

    return responseData
  } catch (error) {
    if (error instanceof RequestError) {
      throw error
    }
    throw new RequestError('Failed to get presigned upload URL.')
  }
}
