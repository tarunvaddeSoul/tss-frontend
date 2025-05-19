import api from "./api"
import type { AuthAPIResponse, AuthResponse, LoginCredentials, SignupCredentials, User } from "@/types/auth"

// API endpoints configuration based on your Swagger documentation
const AUTH_ENDPOINTS = {
  LOGIN: "/users/login",
  SIGNUP: "/users/register",
  LOGOUT: "/users/logout",
  CURRENT_USER: "/users/me",
  REFRESH_TOKEN: "/users/refresh-token",
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthAPIResponse> {
    try {
      const response = await api.post<AuthAPIResponse>(AUTH_ENDPOINTS.LOGIN, credentials)
      // Store the tokens in localStorage
      if (response.data.data.tokens.accessToken) {
        localStorage.setItem("accessToken", response.data.data.tokens.accessToken)
      }

      if (response.data.data.tokens.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.tokens.refreshToken)
      }

      return response.data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  async signup(credentials: SignupCredentials): Promise<AuthAPIResponse> {
    try {
      const response = await api.post<AuthAPIResponse>(AUTH_ENDPOINTS.SIGNUP, credentials)

      // Store the tokens in localStorage
      if (response.data.data.tokens.accessToken) {
        localStorage.setItem("accessToken", response.data.data.tokens.accessToken)
      }

      if (response.data.data.tokens.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.tokens.refreshToken)
      }

      return response.data
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  },

  async logout(): Promise<void> {
    try {
      // Call the logout endpoint
      await api.post(AUTH_ENDPOINTS.LOGOUT)
    } catch (error) {
      console.error("Logout error:", error)
      // Continue with logout even if the API call fails
    } finally {
      // Always remove the tokens from localStorage
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    }

    return Promise.resolve()
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>(AUTH_ENDPOINTS.CURRENT_USER)
      return response.data
    } catch (error) {
      console.error("Get current user error:", error)
      throw error
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthAPIResponse> {
    try {
      const response = await api.post<AuthAPIResponse>(`${AUTH_ENDPOINTS.REFRESH_TOKEN}/${refreshToken}`)

      // Store the new tokens in localStorage
      if (response.data.data.tokens.accessToken) {
        localStorage.setItem("accessToken", response.data.data.tokens.accessToken)
      }

      if (response.data.data.tokens.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.tokens.refreshToken)
      }

      return response.data
    } catch (error) {
      console.error("Refresh token error:", error)
      throw error
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken")
  },
}
