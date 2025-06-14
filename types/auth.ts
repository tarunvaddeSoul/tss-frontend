export interface User {
  id: string
  name: string
  email: string
  mobileNumber: string
  role: Role
  avatar?: string
  departmentId: string
  createdAt: string
}

export enum Role {
  HR = "HR",
  OPERATIONS = "OPERATIONS",
  ACCOUNTS = "ACCOUNTS",
  FIELD = "FIELD",
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  mobileNumber: string
  email: string
  password: string
  role?: Role
  departmentId: string
}

export interface ChangePasswordCredentials {
  oldPassword: string
  newPassword: string
}

export interface ForgotPasswordCredentials {
  email: string
}

export interface ResetPasswordCredentials {
  resetToken: string
  newPassword: string
}

export interface UpdateUserCredentials {
  name?: string
  mobileNumber?: string
  email?: string
  role?: Role
  departmentId?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export type AuthAPIResponse = ApiResponse<AuthResponse>
export type UserAPIResponse = ApiResponse<User>
