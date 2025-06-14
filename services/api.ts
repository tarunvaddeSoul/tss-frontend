import axios from "axios"
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import { toast } from "@/components/ui/use-toast"
import authService from "./auth"

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

    // Check if the error has a response
    if (axiosError.response) {
      const data = axiosError.response.data as any

      // Check for structured error message
      if (data.message) {
        return Array.isArray(data.message) ? data.message[0] : data.message
      }

      // Check for error property
      if (data.error) {
        return data.error
      }

      // Handle different status codes
      switch (axiosError.response.status) {
        case 400:
          return "Bad request. Please check your input."
        case 401:
          return "Authentication failed. Please log in again."
        case 403:
          return "You don't have permission to access this resource."
        case 404:
          return "The requested resource was not found."
        case 422:
          return "Validation failed. Please check your input."
        case 429:
          return "Too many requests. Please try again later."
        case 500:
          return "Server error. Please try again later."
        default:
          return `Request failed with status ${axiosError.response.status}`
      }
    }

    // Network error
    if (axiosError.request && !axiosError.response) {
      return "Network error. Please check your internet connection."
    }

    // Other axios errors
    return axiosError.message || "An unexpected error occurred."
  }

  // Non-axios errors
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

    // If we're not in a browser environment, just reject the promise
    if (typeof window === "undefined") {
      return Promise.reject(error)
    }

    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refreshToken")

        if (refreshToken) {
          // Get a new token using the refresh token
          const response = await authService.refreshToken(refreshToken)

          // Update the Authorization header with the new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.tokens.accessToken}`
          }

          // Retry the original request with the new token
          return axios(originalRequest)
        } else {
          // No refresh token available, redirect to login
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")

          // Show toast notification
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })

          // Small delay to ensure toast is visible before redirect
          setTimeout(() => {
            window.location.href = "/login"
          }, 1500)

          return Promise.reject(error)
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")

        // Show toast notification
        toast({
          title: "Authentication Failed",
          description: "Your session could not be renewed. Please log in again.",
          variant: "destructive",
        })

        // Small delay to ensure toast is visible before redirect
        setTimeout(() => {
          window.location.href = "/login"
        }, 1500)

        return Promise.reject(refreshError)
      }
    }

    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response?.status === 403) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to perform this action.",
        variant: "destructive",
      })
    }

    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      toast({
        title: "Not Found",
        description: "The requested resource could not be found.",
        variant: "destructive",
      })
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      toast({
        title: "Server Error",
        description: "Something went wrong on our servers. Please try again later.",
        variant: "destructive",
      })
    }

    // Handle network errors
    if (error.message === "Network Error") {
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your internet connection.",
        variant: "destructive",
      })
    }

    return Promise.reject(error)
  },
)

export default api
