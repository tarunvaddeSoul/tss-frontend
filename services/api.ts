import axios from "axios"
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import authService from "./auth"
import { toast } from "@/components/ui/use-toast"


// Get the API URL from environment variables
const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://5a0a-2401-4900-4160-352c-78b9-36e-2494-85cd.ngrok-free.app"

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
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError
    if (axiosError.response) {
      const data = axiosError.response.data as any
      if (data?.message) {
        return Array.isArray(data.message) ? data.message[0] : data.message
      }
      if (data?.error) {
        return data.error
      }
      return `Request failed with status ${axiosError.response.status}`
    }
    if (axiosError.request && !axiosError.response) {
      return "Network error. Please check your internet connection."
    }
    return axiosError.message || "An unexpected error occurred."
  }
  if (error instanceof Error) {
    return error.message
  }
  return "An unexpected error occurred."
}

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config: import("axios").InternalAxiosRequestConfig): import("axios").InternalAxiosRequestConfig => {
    // Only add the token if we're in a browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken")

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    if (typeof window === "undefined") {
      return Promise.reject(error)
    }
    // Prevent infinite loop: don't refresh if already tried, or if the request is to the refresh endpoint
    const isRefreshRequest = originalRequest.url?.includes("/refresh-token") // adjust path as needed
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          const response = await authService.refreshToken(refreshToken)
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.tokens.accessToken}`
          }
          localStorage.setItem("accessToken", response.data.tokens.accessToken)
          localStorage.setItem("refreshToken", response.data.tokens.refreshToken)
          return axios(originalRequest)
        }
      } catch (refreshError) {
        // Always clear tokens and redirect on unrecoverable error
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        toast({
          title: "Authentication Failed",
          description: getErrorMessage(refreshError),
          variant: "destructive",
        })
        setTimeout(() => {
          window.location.href = "/login"
        }, 1500)
        return Promise.reject(refreshError)
      }
    }
    // If the refresh request itself fails, just clear tokens and redirect
    if (isRefreshRequest && error.response?.status === 401) {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
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
