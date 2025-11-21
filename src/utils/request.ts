//
// Core network request utility module.
//

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined. Please check your .env files.')
}

export class RequestError extends Error {
  public status?: number
  public code?: number

  constructor(message: string, options: { status?: number; code?: number } = {}) {
    super(message)
    this.name = 'RequestError'
    this.status = options.status
    this.code = options.code
  }
}

interface RequestOptions extends RequestInit {
  data?: any
}

async function request(url: string, options: RequestOptions = {}) {
  const fullUrl = `${API_BASE_URL}${url}`

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const finalOptions: RequestInit = {
    method: 'GET',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  if (finalOptions.method === 'POST' || finalOptions.method === 'PUT') {
    if (options.data instanceof FormData) {
      delete (finalOptions.headers as any)['Content-Type']
      finalOptions.body = options.data
    } else if (options.data) {
      finalOptions.body = JSON.stringify(options.data)
    }
  }

  if (finalOptions.method === 'GET' || finalOptions.method === 'HEAD') {
    delete finalOptions.body
    delete (finalOptions.headers as any)['Content-Type']
  }

  try {
    const response = await fetch(fullUrl, finalOptions)

    let backendResp: { code: number; message: string; data: any } = {
      code: -1,
      message: 'Unknown Error',
      data: null,
    }

    try {
      const contentType = response.headers.get('content-type')

      if (response.status !== 204 && contentType && contentType.includes('application/json')) {
        backendResp = await response.json()
      } else {
        if (!response.ok) {
          const responseText = await response.text()
          throw new RequestError(`HTTP ${response.status}: Server returned non-JSON data.`, {
            status: response.status,
          })
        }
      }
    } catch (e) {
      if (e instanceof RequestError) throw e
      throw new RequestError(`HTTP ${response.status}: Failed to parse server response.`, {
        status: response.status,
      })
    }

    if (!response.ok) {
      const errorMessage = backendResp.message || `Server responded with HTTP ${response.status}.`
      throw new RequestError(errorMessage, { status: response.status, code: backendResp.code })
    }

    if (backendResp.code !== 0) {
      const errorMessage = backendResp.message || 'API failed with non-zero code.'
      throw new RequestError(errorMessage, { status: response.status, code: backendResp.code })
    }

    return backendResp.data
  } catch (error) {
    if (
      error instanceof TypeError &&
      (error.message.includes('Failed to fetch') || error.message.includes('network error'))
    ) {
      throw new RequestError('Network connection failed. Please check your connection.', {
        status: -1,
      })
    } else if (error instanceof RequestError) {
      throw error
    } else if (error instanceof Error) {
      throw new RequestError(`An unknown error occurred: ${error.message}`)
    }

    throw new RequestError('An unknown error occurred. Please contact the administrator.')
  }
}

export function get<T>(
  url: string,
  params?: Record<string, any>,
  options?: RequestInit,
): Promise<T> {
  const fullUrl = params ? `${url}?${new URLSearchParams(params).toString()}` : url
  return request(fullUrl, { method: 'GET', ...options })
}

export function post<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
  return request(url, { method: 'POST', data, ...options })
}

export function postForm<T>(url: string, formData: FormData, options?: RequestInit): Promise<T> {
  return request(url, { method: 'POST', data: formData, ...options })
}

export default request
