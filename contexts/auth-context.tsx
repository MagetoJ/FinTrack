"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  businessName: string
  subscription: "trial" | "basic" | "standard" | "premium" | null
  subscriptionExpiry: string | null
  trialStarted: string | null
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (userData: {
    name: string
    email: string
    password: string
    businessName: string
  }) => Promise<void>
  logout: () => void
  updateSubscription: (plan: "trial" | "basic" | "standard" | "premium") => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    try {
      const savedUser = localStorage.getItem("finance-app-user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user exists in localStorage (demo purposes)
      const users = JSON.parse(localStorage.getItem("finance-app-users") || "[]")
      const existingUser = users.find((u: any) => u.email === email && u.password === password)

      if (!existingUser) {
        throw new Error("Invalid credentials")
      }

      const userData: User = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        businessName: existingUser.businessName,
        subscription: existingUser.subscription,
        subscriptionExpiry: existingUser.subscriptionExpiry,
        trialStarted: existingUser.trialStarted,
      }

      setUser(userData)
      localStorage.setItem("finance-app-user", JSON.stringify(userData))
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const signup = async (userData: {
    name: string
    email: string
    password: string
    businessName: string
  }) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user already exists
      const users = JSON.parse(localStorage.getItem("finance-app-users") || "[]")
      const existingUser = users.find((u: any) => u.email === userData.email)

      if (existingUser) {
        throw new Error("User already exists")
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        subscription: null,
        subscriptionExpiry: null,
        trialStarted: null,
      }

      users.push(newUser)
      localStorage.setItem("finance-app-users", JSON.stringify(users))

      const userForState: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        businessName: newUser.businessName,
        subscription: null,
        subscriptionExpiry: null,
        trialStarted: null,
      }

      setUser(userForState)
      localStorage.setItem("finance-app-user", JSON.stringify(userForState))
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  const updateSubscription = async (plan: "trial" | "basic" | "standard" | "premium") => {
    if (!user) return

    try {
      // Simulate payment processing for paid plans
      if (plan !== "trial") {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      const now = new Date()
      let expiryDate: Date
      let trialStarted: string | null = user.trialStarted

      if (plan === "trial") {
        // 30-day trial
        expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 30)
        trialStarted = now.toISOString()
      } else {
        // Monthly subscription
        expiryDate = new Date()
        expiryDate.setMonth(expiryDate.getMonth() + 1)
      }

      const updatedUser: User = {
        ...user,
        subscription: plan,
        subscriptionExpiry: expiryDate.toISOString(),
        trialStarted,
      }

      setUser(updatedUser)
      localStorage.setItem("finance-app-user", JSON.stringify(updatedUser))

      // Update in users array
      const users = JSON.parse(localStorage.getItem("finance-app-users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          subscription: plan,
          subscriptionExpiry: expiryDate.toISOString(),
          trialStarted,
        }
        localStorage.setItem("finance-app-users", JSON.stringify(users))
      }
    } catch (error) {
      console.error("Subscription update error:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("finance-app-user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateSubscription,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
