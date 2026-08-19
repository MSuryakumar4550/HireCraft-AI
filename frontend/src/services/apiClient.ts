const BASE_URL = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:8080'

export interface ApiError {
  message: string
  status: number
}

export interface ApiResponse<T> {
  data: T
  status: number
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    let message = response.statusText || 'Request failed'
    try {
      const errJson = await response.json()
      if (errJson?.message) {
        message = errJson.message
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

export const apiClient = {
  baseUrl: BASE_URL,

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })
      return await handleResponse<T>(response)
    } catch (err: any) {
      if (err?.status) throw err
      throw { message: "Backend offline. Please start Spring Boot backend (mvn spring-boot:run on port 8080).", status: 503 }
    }
  },

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      return await handleResponse<T>(response)
    } catch (err: any) {
      if (err?.status) throw err
      throw { message: "Backend offline. Please start Spring Boot backend (mvn spring-boot:run on port 8080).", status: 503 }
    }
  },

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      return await handleResponse<T>(response)
    } catch (err: any) {
      if (err?.status) throw err
      throw { message: "Backend offline. Please start Spring Boot backend (mvn spring-boot:run on port 8080).", status: 503 }
    }
  },

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })
      return await handleResponse<T>(response)
    } catch (err: any) {
      if (err?.status) throw err
      throw { message: "Backend offline. Please start Spring Boot backend (mvn spring-boot:run on port 8080).", status: 503 }
    }
  },
}
