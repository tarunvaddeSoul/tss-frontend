"use client"

import React from "react"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth"
import type { User, LoginCredentials, SignupCredentials } from "@/types/auth"

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
    } catch (error) {
      console.error("Failed to fetch current user:", error)
      // If getting the current user fails, log the user out
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

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
      // If your API doesn't return user info with the tokens, fetch it separately
      if (!response.data.user) {
        await fetchCurrentUser()
      } else {
        setUser(response.data.user)
        setIsAuthenticated(true)
      }
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
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
      // If your API doesn't return user info with the tokens, fetch it separately
      if (!response.data.user) {
        await fetchCurrentUser()
      } else {
        setUser(response.data.user)
        setIsAuthenticated(true)
      }
      router.push("/dashboard")
    } catch (error) {
      console.error("Signup error:", error)
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
    } catch (error) {
      console.error("Logout error:", error)
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

  // Create the context value object
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
  }

  // Use the JSX element directly
  return React.createElement(AuthContext.Provider, { value: contextValue }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
