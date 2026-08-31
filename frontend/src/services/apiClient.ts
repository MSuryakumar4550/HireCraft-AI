const BASE_URL = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:8080'

export interface ApiError {
  message: string
  status: number
}

export interface ApiResponse<T> {
  data: T
  status: number
}

const getToken = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed.state?.token
    }
  } catch (e) {
    return null
  }
  return null
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    let message = response.statusText || 'Request failed'
    try {
      const errJson = await response.json()
      if (errJson?.message) {
        message = errJson.message
      } else if (errJson?.error) {
        message = errJson.error
      }
    } catch {}
    const error: ApiError = {
      message,
      status: response.status,
    }
    throw error
  }

  const data = (await response.json()) as T
  return { data, status: response.status }
}

const getDefaultHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export const apiClient = {
  baseUrl: BASE_URL,

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'GET',
        headers: {
          ...getDefaultHeaders(),
          ...options?.headers,
        },
      })
      return await handleResponse<T>(response)
    } catch (err: any) {
      if (err?.status) throw err
      throw { message: "Backend offline. Please start Spring Boot backend.", status: 503 }
    }
  },

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'POST',
        headers: {
          ...getDefaultHeaders(),
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      return await handleResponse<T>(response)
    } catch (err: any) {
      if (err?.status) throw err
      throw { message: "Backend offline. Please start Spring Boot backend.", status: 503 }
    }
  },

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'PUT',
        headers: {
          ...getDefaultHeaders(),
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      return await handleResponse<T>(response)
    } catch (err: any) {
      if (err?.status) throw err
      throw { message: "Backend offline. Please start Spring Boot backend.", status: 503 }
    }
  },

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'DELETE',
        headers: {
          ...getDefaultHeaders(),
          ...options?.headers,
        },
      })
      return await handleResponse<T>(response)
    } catch (err: any) {
      if (err?.status) throw err
      throw { message: "Backend offline. Please start Spring Boot backend.", status: 503 }
    }
  },

  async uploadFile<T>(endpoint: string, file: File, fieldName: string = 'file', additionalData?: Record<string, string>, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData()
      formData.append(fieldName, file)
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value)
        })
      }

      const token = getToken()
      const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'POST',
        headers,
        body: formData,
      })
      return await handleResponse<T>(response)
    } catch (err: any) {
      if (err?.status) throw err
      throw { message: "Backend offline. Please start Spring Boot backend.", status: 503 }
    }
  },
}
