"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

type PackageType = "trial" | "basic" | "standard" | "premium"

interface Package {
  id: PackageType
  name: string
  price: number
  description: string
  icon: React.ReactNode
  features: string[]
  limitations: string[]
  popular?: boolean
}

const packages: Package[] = [
  {
    id: "trial",
    name: "Free Trial",
    price: 0,
    description: "Try all Standard features free for 30 days - no credit card required",
    icon: <Star className="h-6 w-6" />,
    features: [
      "30-day free trial",
      "Track up to 500 transactions/month",
      "Advanced expense categories",
      "Weekly, Monthly & Quarterly reports",
      "Data export (CSV)",
      "Basic analytics dashboard",
      "Receipt photo storage",
      "Email support",
      "No credit card required",
    ],
    limitations: ["Trial expires after 30 days", "Limited to 500 transactions per month", "No yearly reports"],
    popular: true,
  },
  {
    id: "basic",
    name: "Basic",
    price: 5.5,
    description: "Perfect for small businesses just getting started",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "Track up to 100 transactions/month",
      "Basic expense categories",
      "Monthly reports",
      "Mobile app access",
      "Email support",
    ],
    limitations: [
      "Limited to 100 transactions per month",
      "Basic reporting only",
      "No data export",
      "No advanced analytics",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 10.0,
    description: "Ideal for growing businesses with more complex needs",
    icon: <Star className="h-6 w-6" />,
    features: [
      "Track up to 500 transactions/month",
      "Advanced expense categories",
      "Weekly, Monthly & Quarterly reports",
      "Data export (CSV)",
      "Basic analytics dashboard",
      "Receipt photo storage",
      "Priority email support",
    ],
    limitations: ["Limited to 500 transactions per month", "No yearly reports", "No advanced forecasting"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 17.0,
    description: "Complete solution for established businesses",
    icon: <Crown className="h-6 w-6" />,
    features: [
      "Unlimited transactions",
      "All expense categories + custom categories",
      "All report types (Daily, Weekly, Monthly, Quarterly, Yearly)",
      "Advanced analytics & forecasting",
      "Data export (CSV, PDF, Excel)",
      "Receipt OCR scanning",
      "Multi-user access (up to 5 users)",
      "API access",
      "Priority phone & email support",
      "Custom branding on reports",
    ],
    limitations: [],
  },
]

export default function PackagesPage() {
  const [selectedPackage, setSelectedPackage] = useState<PackageType>("trial")
  const [isLoading, setIsLoading] = useState(false)
  const { updateSubscription } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSelectPackage = async () => {
    setIsLoading(true)

    try {
      const selectedPkg = packages.find((p) => p.id === selectedPackage)

      if (selectedPackage === "trial") {
        // For trial, no payment processing needed
        await updateSubscription(selectedPackage)

        toast({
          title: "Free Trial Started!",
          description: "Welcome to your 30-day free trial with Standard features. No credit card required!",
        })
      } else {
        // Simulate payment processing for paid plans
        await new Promise((resolve) => setTimeout(resolve, 2000))
        await updateSubscription(selectedPackage)

        toast({
          title: "Subscription Activated!",
          description: `Welcome to ${selectedPkg?.name} plan. You can now access all features.`,
        })
      }

      router.push("/")
    } catch (error) {
      toast({
        title: selectedPackage === "trial" ? "Trial Setup Failed" : "Payment Failed",
        description:
          selectedPackage === "trial"
            ? "There was an issue setting up your trial. Please try again."
            : "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickSelect = async (packageId: PackageType) => {
    setSelectedPackage(packageId)

    // Auto-proceed for trial package
    if (packageId === "trial") {
      setIsLoading(true)
      try {
        await updateSubscription(packageId)
        toast({
          title: "Free Trial Started!",
          description: "Welcome to your 30-day free trial with Standard features. No credit card required!",
        })
        router.push("/")
      } catch (error) {
        toast({
          title: "Trial Setup Failed",
          description: "There was an issue setting up your trial. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">Select the perfect package for your business needs</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative cursor-pointer transition-all duration-200 ${
                selectedPackage === pkg.id ? "ring-2 ring-primary shadow-lg scale-105" : "hover:shadow-md"
              } ${pkg.popular ? "border-primary" : ""}`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">Most Popular</Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">{pkg.icon}</div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${pkg.price}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700 dark:text-green-400">✓ Included Features</h4>
                  <ul className="space-y-1">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {pkg.limitations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-orange-700 dark:text-orange-400">⚠ Limitations</h4>
                    <ul className="space-y-1">
                      {pkg.limitations.map((limitation, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  variant={selectedPackage === pkg.id ? "default" : "outline"}
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (pkg.id === "trial") {
                      handleQuickSelect(pkg.id)
                    } else {
                      setSelectedPackage(pkg.id)
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading && selectedPackage === pkg.id && pkg.id === "trial"
                    ? "Starting Trial..."
                    : selectedPackage === pkg.id
                      ? "Selected"
                      : pkg.id === "trial"
                        ? "Start Free Trial"
                        : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button size="lg" onClick={handleSelectPackage} disabled={isLoading} className="px-8">
            {isLoading
              ? selectedPackage === "trial"
                ? "Setting up trial..."
                : "Processing Payment..."
              : selectedPackage === "trial"
                ? "Start Free Trial"
                : `Subscribe to ${packages.find((p) => p.id === selectedPackage)?.name} - $${packages.find((p) => p.id === selectedPackage)?.price}/month`}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">30-day money-back guarantee • Cancel anytime</p>
        </div>
      </div>
    </div>
  )
}
