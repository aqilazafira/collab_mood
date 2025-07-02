// API utility functions for making HTTP requests
const API_BASE_URL = typeof window !== "undefined" && window.location.origin
  ? window.location.origin
  : (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_BASE_URL)
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : "http://localhost:3000"

interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  [key: string]: any
}

class ApiError extends Error {
  status: number
  data?: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.status = status
    this.data = data
    this.name = "ApiError"
    
    // Memastikan prototype dipertahankan untuk instanceof
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`
  console.log(`API Request to: ${url}`, { options })

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    console.log(`API Response status: ${response.status} ${response.statusText}`)

    let data
    try {
      data = await response.json()
      console.log("API Response data:", data)
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError)
      throw new ApiError("Invalid response format from server", response.status)
    }

    if (!response.ok) {
      console.error("API Error response:", { status: response.status, data })
      throw new ApiError(
        data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    console.error("API Request failed:", error)
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError("Network error or server unavailable: " + (error as Error).message, 0)
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role = "Student") =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    }),
}

// Dashboard API
export const dashboardApi = {
  getStats: () => apiRequest("/dashboard/stats"),
}

// Emotions API
export const emotionsApi = {
  detect: (sessionId?: string) =>
    apiRequest("/emotions/detect", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),

  getHistory: () => apiRequest("/emotions/history"),

  getTimeline: () => apiRequest("/emotions/timeline"),
}

// Suggestions API
export const suggestionsApi = {
  getAll: () => apiRequest("/suggestions"),

  create: (suggestion: any) =>
    apiRequest("/suggestions", {
      method: "POST",
      body: JSON.stringify(suggestion),
    }),

  updateStatus: (id: string, status: string) =>
    apiRequest(`/suggestions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
}

// Sessions API
export const sessionsApi = {
  getAll: () => apiRequest("/sessions"),

  getById: (id: string) => apiRequest(`/sessions/${id}`),

  create: (session: any) =>
    apiRequest("/sessions", {
      method: "POST",
      body: JSON.stringify(session),
    }),

  updateStatus: (id: string, status: string) =>
    apiRequest(`/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
}

// Reports API
export const reportsApi = {
  getAll: () => apiRequest("/reports"),
}

// Feedback API
export const feedbackApi = {
  getAll: () => apiRequest("/feedback"),

  submit: (feedback: any) =>
    apiRequest("/feedback", {
      method: "POST",
      body: JSON.stringify(feedback),
    }),
}

// Settings API
export const settingsApi = {
  get: () => apiRequest("/settings"),

  update: (settings: any) =>
    apiRequest("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),
}

// User API
export const userApi = {
  getCurrent: () => apiRequest("/user"),

  deleteAccount: () =>
    apiRequest("/user/delete", {
      method: "DELETE",
    }),
}
