"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext, useRef } from "react"
import { useRouter } from "next/navigation"
import authService from "@/services/auth"
import type {
  User,
  LoginCredentials,
  SignupCredentials,
  ChangePasswordCredentials,
  ForgotPasswordCredentials,
  ResetPasswordCredentials,
  UpdateUserCredentials,
} from "@/types/auth"
import { toast } from "@/components/ui/use-toast"

const isBrowser = typeof window !== "undefined"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isInitializing: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  changePassword: (credentials: ChangePasswordCredentials) => Promise<void>
  forgotPassword: (credentials: ForgotPasswordCredentials) => Promise<void>
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<void>
  updateUser: (data: UpdateUserCredentials) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const hasInitialized = useRef(false)

  // Fetch current user from API
  const fetchCurrentUser = async () => {
    if (!isBrowser || !authService.isAuthenticated()) {
      setUser(null)
      setIsAuthenticated(false)
      return
    }

    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error: any) {
      // Token is invalid, clear everything and log out
      setUser(null)
      setIsAuthenticated(false)
      if (isBrowser) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
      }
    }
  }

  // Initialize auth state once on mount
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const initAuth = async () => {
      await fetchCurrentUser()
      setIsInitializing(false)
    }

    initAuth()
  }, []) // Only run once on mount

  // Login
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await authService.login(credentials)
      await fetchCurrentUser() // Refresh user state
      router.push("/dashboard")
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "default",
      })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Unable to login. Please try again."
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Signup
  const signup = async (credentials: SignupCredentials) => {
    setIsLoading(true)
    try {
      const response = await authService.signup(credentials)
      await fetchCurrentUser() // Refresh user state
      router.push("/dashboard")
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
        variant: "default",
      })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Unable to sign up. Please try again."
      toast({
        title: "Signup failed",
        description: message,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
      router.push("/login")
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
        variant: "default",
      })
    } catch (error: any) {
      // Even if API call fails, clear local state
      setUser(null)
      setIsAuthenticated(false)
      if (isBrowser) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
      }
      router.push("/login")
      toast({
        title: "Error",
        description: "Failed to logout properly.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    setIsLoading(true)
    try {
      await fetchCurrentUser()
    } finally {
      setIsLoading(false)
    }
  }

  // Change password
  const changePassword = async (credentials: ChangePasswordCredentials) => {
    setIsLoading(true)
    try {
      await authService.changePassword(credentials)
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Change password failed",
        description: error.message || "Unable to change password. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Forgot password
  const forgotPassword = async (credentials: ForgotPasswordCredentials) => {
    setIsLoading(true)
    try {
      await authService.forgotPassword(credentials)
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Forgot password failed",
        description: error.message || "Unable to send reset email. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (credentials: ResetPasswordCredentials) => {
    setIsLoading(true)
    try {
      await authService.resetPassword(credentials)
      toast({
        title: "Password reset",
        description: "Your password has been reset successfully.",
        variant: "default",
      })
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Reset password failed",
        description: error.message || "Unable to reset password. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Update user
  const updateUser = async (data: UpdateUserCredentials) => {
    setIsLoading(true)
    try {
      if (!user) throw new Error("No user logged in")
      const response = await authService.updateUser(user.id, data)
      setUser(response.data)
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Update profile failed",
        description: error.message || "Unable to update profile. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isInitializing,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
    changePassword,
    forgotPassword,
    resetPassword,
    updateUser,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
