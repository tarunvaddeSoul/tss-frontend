import axios from "axios"
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import { authService } from "./auth"

// Get the API URL from environment variables
const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://5a0a-2401-4900-4160-352c-78b9-36e-2494-85cd.ngrok-free.app"

// Create the axios instance
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
})

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
          window.location.href = "/login"
          return Promise.reject(error)
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response?.status === 403) {
      console.error("Permission denied:", error.response.data)
      // You might want to redirect to an access denied page
    }

    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      console.error("Resource not found:", error.response.data)
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data)
    }

    return Promise.reject(error)
  },
)

export default api
