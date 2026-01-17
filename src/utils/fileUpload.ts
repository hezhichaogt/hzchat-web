import { RequestError } from './request'

export async function putFile(
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          onProgress(percentComplete)
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        const status = xhr.status
        let userMessage: string

        if (status === 403) {
          userMessage =
            'Upload forbidden. The authorization may have expired or file constraints did not match.'
        } else if (status >= 400 && status < 500) {
          userMessage = `Upload failed due to incorrect request (Status: ${status}).`
        } else {
          userMessage = `Internal upload error occurred (Status: ${status}).`
        }

        console.error('R2/S3 Upload Failed:', status, xhr.responseText)
        reject(new RequestError(userMessage, { status }))
      }
    }

    xhr.onerror = () => {
      console.error('File Upload Network Error')
      reject(
        new RequestError('A network error occurred during file upload (e.g., connection lost).'),
      )
    }

    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })
}
