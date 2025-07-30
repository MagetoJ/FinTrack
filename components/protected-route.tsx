"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireSubscription?: boolean
}

export default function ProtectedRoute({ children, requireSubscription = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in the useEffect
  }

  if (requireSubscription && !user.subscription) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">Subscription Required</h1>
              <p className="text-muted-foreground">
                You need to select a subscription plan to access the financial dashboard.
              </p>
              <Link href="/auth/packages">
                <Button className="mt-4 w-full">Choose a Plan</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if subscription has expired
  if (user.subscription && user.subscriptionExpiry) {
    const expiryDate = new Date(user.subscriptionExpiry)
    const now = new Date()

    if (expiryDate < now && user.subscription !== "premium") {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Subscription Expired</h1>
                <p className="text-muted-foreground">
                  Your {user.subscription} subscription has expired. Please renew or choose a new plan to continue.
                </p>
                <Link href="/auth/packages">
                  <Button className="mt-4 w-full">Renew Subscription</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return <>{children}</>
}
