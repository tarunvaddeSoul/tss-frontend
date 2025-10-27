"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext, useCallback } from "react"
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

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

interface AuthContextType {
  user: User | null
  isLoading: boolean
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

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Function to fetch the current user
  const fetchCurrentUser = useCallback(async () => {
    if (!isBrowser) return
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser()
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error: any) {
      // If getting the current user fails, log the user out and show a toast
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
      toast({
        title: "Session Expired",
        description: error.message || "Your session has expired. Please log in again.",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [router])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      await fetchCurrentUser()
      setIsLoading(false)
    }

    initAuth()
  }, [fetchCurrentUser])

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await authService.login(credentials)
      setUser(response.data.user)
      setIsAuthenticated(true)
      router.push("/dashboard")
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Unable to login. Please try again.",
        variant: "destructive",
      })
      setUser(null)
      setIsAuthenticated(false)
      throw error // Re-throw to allow the login page to handle it
    } finally {
      setIsLoading(false)
    }
  }

  // Signup function
  const signup = async (credentials: SignupCredentials) => {
    setIsLoading(true)
    try {
      const response = await authService.signup(credentials)
      setUser(response.data.user)
      setIsAuthenticated(true)
      router.push("/dashboard")
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Unable to sign up. Please try again.",
        variant: "destructive",
      })
      setUser(null)
      setIsAuthenticated(false)
      throw error // Re-throw to allow the signup page to handle it
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
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
      toast({
        title: "Logout failed",
        description: error.message || "Unable to logout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to refresh user data
  const refreshUser = async () => {
    setIsLoading(true)
    await fetchCurrentUser()
    setIsLoading(false)
  }

  // Change password function
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

  // Forgot password function
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

  // Reset password function
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

  // Update user function
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

  // Create the context value object
  const contextValue: AuthContextType = {
    user,
    isLoading,
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
