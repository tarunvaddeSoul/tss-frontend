export interface User {
  id: string
  name?: string
  email: string
  role: "ADMIN" | "MANAGER" | "EMPLOYEE" | "HR"
  avatar?: string
  createdAt?: string
  updatedAt?: string
  // Add any other fields your API returns
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
  confirmPassword?: string
  // Add any other fields your API requires
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthAPIResponse {
  statusCode: number
  message: string
  data: AuthResponse
}

export interface AuthResponse {
  user?: User
  tokens: ITokens
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  errors?: Record<string, string[]>
}
