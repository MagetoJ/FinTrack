"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Crown } from "lucide-react"
import Link from "next/link"

interface SubscriptionGuardProps {
  children: React.ReactNode
  requiredPlan: "basic" | "standard" | "premium" | "trial"
  feature: string
}

const planHierarchy = {
  trial: 2, // Same level as standard
  basic: 1,
  standard: 2,
  premium: 3,
}

export default function SubscriptionGuard({ children, requiredPlan, feature }: SubscriptionGuardProps) {
  const { user } = useAuth()

  if (!user?.subscription) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <CardTitle>Subscription Required</CardTitle>
          <CardDescription>You need an active subscription to access {feature}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/auth/packages">
            <Button>View Plans</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const userPlanLevel = planHierarchy[user.subscription] || 0
  const requiredPlanLevel = planHierarchy[requiredPlan] || 0

  if (userPlanLevel < requiredPlanLevel) {
    return (
      <Card className="border-dashed border-orange-200">
        <CardHeader className="text-center">
          <Crown className="h-8 w-8 mx-auto text-orange-500 mb-2" />
          <CardTitle>Upgrade Required</CardTitle>
          <CardDescription>
            {feature} requires a <Badge variant="outline">{requiredPlan}</Badge> plan or higher
          </CardDescription>
          <div className="mt-2">
            <Badge variant="secondary">Current: {user.subscription}</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/auth/packages">
            <Button>Upgrade Plan</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
