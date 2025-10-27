import api from "./api"
import type {
  AuthAPIResponse,
  LoginCredentials,
  SignupCredentials,
  User,
  ChangePasswordCredentials,
  ForgotPasswordCredentials,
  ResetPasswordCredentials,
  UpdateUserCredentials,
  UserAPIResponse,
  ApiResponse,
} from "@/types/auth"
import { getErrorMessage } from "./api"

// API endpoints configuration
const AUTH_ENDPOINTS = {
  LOGIN: "/users/login",
  SIGNUP: "/users/register",
  LOGOUT: "/users/logout",
  CURRENT_USER: "/users/me",
  REFRESH_TOKEN: "/users/refresh-token",
  CHANGE_PASSWORD: "/users/change-password",
  FORGOT_PASSWORD: "/users/forgot-password",
  RESET_PASSWORD: "/users/reset-password",
  UPDATE_USER: "/users/update",
}

const authService = {
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
      throw new Error(getErrorMessage(error))
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
      throw new Error(getErrorMessage(error))
    }
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem("refreshToken")

    try {
      // Call the logout endpoint with the refresh token
      if (refreshToken) {
        await api.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken })
      }
    } catch (error) {
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
      const response = await api.get<UserAPIResponse>(AUTH_ENDPOINTS.CURRENT_USER)
      return response.data.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthAPIResponse> {
    try {
      const response = await api.post<AuthAPIResponse>(`${AUTH_ENDPOINTS.REFRESH_TOKEN}/${refreshToken}`)
      // Do not set tokens here; handled in api.ts after refresh
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async changePassword(credentials: ChangePasswordCredentials): Promise<ApiResponse<null>> {
    try {
      const response = await api.put<ApiResponse<null>>(AUTH_ENDPOINTS.CHANGE_PASSWORD, credentials)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async forgotPassword(credentials: ForgotPasswordCredentials): Promise<ApiResponse<null>> {
    try {
      const response = await api.post<ApiResponse<null>>(AUTH_ENDPOINTS.FORGOT_PASSWORD, credentials)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async resetPassword(credentials: ResetPasswordCredentials): Promise<ApiResponse<null>> {
    try {
      const response = await api.put<ApiResponse<null>>(AUTH_ENDPOINTS.RESET_PASSWORD, credentials)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async updateUser(userId: string, data: UpdateUserCredentials): Promise<UserAPIResponse> {
    try {
      const response = await api.put<UserAPIResponse>(`${AUTH_ENDPOINTS.UPDATE_USER}/${userId}`, data)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken")
  },
}

export default authService
