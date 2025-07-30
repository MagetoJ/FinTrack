"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { LayoutDashboard, BarChart, FileText, LogOut, User, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close mobile menu when changing tabs
  useEffect(() => {
    setIsMenuOpen(false)
  }, [activeTab])

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/auth/login")
  }

  const navItems = [
    {
      name: "Dashboard",
      value: "dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      value: "analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      name: "Reports",
      value: "reports",
      icon: <FileText className="h-5 w-5" />,
    },
  ]

  return (
    <>
      {/* Top Navigation for Desktop */}
      <header className="hidden md:block border-b bg-background sticky top-0 z-30">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="bg-primary text-primary-foreground p-1 rounded text-sm">Fin</span>
              <span>Track</span>
            </Link>
            <nav className="flex items-center gap-4">
              {navItems.map((item) => (
                <Button
                  key={item.value}
                  variant={activeTab === item.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(item.value)}
                  className="flex items-center gap-1"
                >
                  {item.icon}
                  {item.name}
                </Button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/packages">
                <CreditCard className="h-4 w-4 mr-2" />
                {user?.subscription ? "Manage Plan" : "Choose Plan"}
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t">
        <div className="grid grid-cols-3 gap-1 p-1">
          {navItems.map((item) => (
            <Button
              key={item.value}
              variant={activeTab === item.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(item.value)}
              className="flex flex-col items-center py-3 h-auto"
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 right-0 z-30 p-4">
        <Button variant="outline" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
          <User className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b shadow-lg p-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="bg-primary text-primary-foreground p-1 rounded text-sm">Fin</span>
                <span>Track</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                &times;
              </Button>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-2">Account</p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/auth/packages">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {user?.subscription ? "Manage Plan" : "Choose Plan"}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
