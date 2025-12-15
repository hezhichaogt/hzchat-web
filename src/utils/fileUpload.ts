//
// Executes a PUT request to a specific URL (like a presigned URL) with the given file data.
//
import { RequestError } from './request'

export async function putFile(url: string, file: File): Promise<void> {
  const headers = {
    'Content-Type': file.type,
  }

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: file,
    })

    if (!response.ok) {
      const status = response.status
      let userMessage: string

      if (status === 403) {
        userMessage =
          'Upload forbidden. The authorization may have expired or file constraints did not match.'
      } else if (status >= 400 && status < 500) {
        userMessage = `Upload failed due to incorrect request (Status: ${status}).`
      } else {
        userMessage = `Internal upload error occurred (Status: ${status}).`
      }

      const errorText = await response.text()
      console.error('R2/S3 Upload Failed:', status, errorText)

      throw new RequestError(userMessage, { status: status })
    }

    return
  } catch (error) {
    if (error instanceof RequestError) {
      throw error
    }

    console.error('File Upload Network Error:', error)
    throw new RequestError('A network error occurred during file upload (e.g., connection lost).')
  }
}
