import axios from "axios"
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import authService from "./auth"
import { toast } from "@/components/ui/use-toast"
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./token"


// Get the API URL from environment variables
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"

// Create the axios instance
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // 20 seconds timeout
})

// Helper function to extract error message from API response
export function getErrorMessage(error: unknown): string {
  // Handle Axios errors with response data
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message
    }
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message
  }
  
  // Handle objects with message property
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message)
  }
  
  // Default fallback
  return "An unexpected error occurred"
}

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config: import("axios").InternalAxiosRequestConfig): import("axios").InternalAxiosRequestConfig => {
    // Only add the token if we're in a browser environment
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// Response interceptor for handling token expiration
let isRefreshing = false
let refreshQueue: Array<{
  resolve: (value: any) => void
  reject: (reason?: any) => void
}> = []

function enqueueRefresh<T = any>() {
  return new Promise<T>((resolve, reject) => {
    refreshQueue.push({ resolve, reject })
  })
}

function flushQueue(error: any, token: string | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  refreshQueue = []
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    if (typeof window === "undefined") {
      return Promise.reject(error)
    }
    // Prevent infinite loop: don't refresh if already tried, or if the request is to the refresh endpoint or login/signup
    const isRefreshRequest = originalRequest.url?.includes("/refresh-token")
    const isAuthRequest = originalRequest.url?.includes("/login") || originalRequest.url?.includes("/register") || originalRequest.url?.includes("/forgot-password") || originalRequest.url?.includes("/reset-password")
    
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest && !isAuthRequest) {
      originalRequest._retry = true
      try {
        if (isRefreshing) {
          await enqueueRefresh()
          const token = getAccessToken()
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return axios(originalRequest)
        }

        isRefreshing = true
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          const response = await authService.refreshToken(refreshToken)
          setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken)
          flushQueue(null, response.data.tokens.accessToken)
          isRefreshing = false
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.tokens.accessToken}`
          }
          return axios(originalRequest)
        }
      } catch (refreshError) {
        isRefreshing = false
        flushQueue(refreshError, null)
        clearTokens()
        toast({
          title: "Authentication Failed",
          description: getErrorMessage(refreshError),
          variant: "destructive",
        })
        setTimeout(() => {
          window.location.href = "/login"
        }, 1000)
        return Promise.reject(refreshError)
      }
    }
    // If the refresh request itself fails, just clear tokens and redirect
    if (isRefreshRequest && error.response?.status === 401) {
      clearTokens()
      toast({
        title: "Authentication Failed",
        description: getErrorMessage(error),
        variant: "destructive",
      })
      setTimeout(() => {
        window.location.href = "/login"
      }, 1500)
      return Promise.reject(error)
    }
    
    // For auth-related errors (login/signup), don't show toast or redirect - let the component handle it
    if (isAuthRequest) {
      return Promise.reject(error)
    }
    
    // Handle 401 errors (only if not an auth request)
    if (error.response?.status === 401 && !isAuthRequest && !isRefreshRequest) {
      // Don't show toast or redirect for auth errors, just reject
      return Promise.reject(error)
    }
    
    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response?.status === 403) {
      toast({
        title: "Access Denied",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      toast({
        title: "Not Found",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      toast({
        title: "Server Error",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
    // Handle network errors
    if (error.message === "Network Error") {
      toast({
        title: "Network Error",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
    return Promise.reject(error)
  },
)

export default api
