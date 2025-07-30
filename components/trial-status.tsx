"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function TrialStatus() {
  const { user } = useAuth()

  if (!user || user.subscription !== "trial" || !user.subscriptionExpiry) {
    return null
  }

  const expiryDate = new Date(user.subscriptionExpiry)
  const now = new Date()
  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpiringSoon = daysLeft <= 7
  const isExpired = daysLeft <= 0

  return (
    <Card
      className={`mb-6 ${
        isExpired
          ? "border-red-200 bg-red-50 dark:bg-red-950"
          : isExpiringSoon
            ? "border-orange-200 bg-orange-50 dark:bg-orange-950"
            : "border-blue-200 bg-blue-50 dark:bg-blue-950"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpired ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : isExpiringSoon ? (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            ) : (
              <Clock className="h-5 w-5 text-blue-500" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  Free Trial
                </Badge>
                <span className="font-medium">
                  {isExpired ? "Trial expired" : daysLeft > 0 ? `${daysLeft} days left` : "Trial expired"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isExpired
                  ? "Your trial has expired. Upgrade to continue using all features."
                  : `Your trial expires on ${expiryDate.toLocaleDateString()}`}
              </p>
            </div>
          </div>
          <Link href="/auth/packages">
            <Button size="sm" variant={isExpiringSoon || isExpired ? "default" : "outline"}>
              {isExpired ? "Upgrade Now" : isExpiringSoon ? "Upgrade Now" : "View Plans"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
