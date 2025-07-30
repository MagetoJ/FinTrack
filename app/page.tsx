"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ExpenseForm from "@/components/expense-form"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import ReportsSection from "@/components/reports-section"
import Navigation from "@/components/navigation"
import ProtectedRoute from "@/components/protected-route"
import SubscriptionGuard from "@/components/subscription-guard"
import { useAuth } from "@/contexts/auth-context"
import TrialStatus from "@/components/trial-status"

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  type: "expense" | "income"
}

export default function FinanceApp() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const { toast } = useToast()
  const { user } = useAuth()

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem("business-expenses")
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses))
      }
    } catch (error) {
      console.error("Error loading expenses:", error)
      toast({
        title: "Error Loading Data",
        description: "There was a problem loading your expense data.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Save to localStorage whenever expenses change
  useEffect(() => {
    try {
      localStorage.setItem("business-expenses", JSON.stringify(expenses))
    } catch (error) {
      console.error("Error saving expenses:", error)
    }
  }, [expenses])

  const addExpense = (expense: Omit<Expense, "id">) => {
    try {
      const newExpense: Expense = {
        ...expense,
        id: Date.now().toString(),
      }
      setExpenses((prev) => [newExpense, ...prev])
      toast({
        title: "Transaction Added",
        description: `${expense.type === "expense" ? "Expense" : "Income"} of $${expense.amount} has been recorded.`,
      })
    } catch (error) {
      console.error("Error adding expense:", error)
      toast({
        title: "Error Adding Transaction",
        description: "There was a problem adding your transaction.",
        variant: "destructive",
      })
    }
  }

  const deleteExpense = (id: string) => {
    try {
      setExpenses((prev) => prev.filter((expense) => expense.id !== id))
      toast({
        title: "Transaction Deleted",
        description: "The transaction has been removed.",
      })
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error Deleting Transaction",
        description: "There was a problem deleting your transaction.",
        variant: "destructive",
      })
    }
  }

  const totalExpenses = expenses.filter((e) => e.type === "expense").reduce((sum, expense) => sum + expense.amount, 0)

  const totalIncome = expenses.filter((e) => e.type === "income").reduce((sum, expense) => sum + expense.amount, 0)

  const netProfit = totalIncome - totalExpenses

  return (
    <ProtectedRoute requireSubscription={true}>
      <div className="min-h-screen bg-background">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="container mx-auto px-4 py-6 pb-20">
          {/* Add user info header */}
          <div className="mb-6 p-4 bg-card rounded-lg border">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{user?.businessName || "Your Business"}</h2>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name || "User"}</p>
              </div>
              <Badge variant="outline" className="capitalize">
                {user?.subscription === "trial" ? "Free Trial" : `${user?.subscription || "No"} Plan`}
              </Badge>
            </div>
          </div>

          {/* Add TrialStatus component */}
          <TrialStatus />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${netProfit.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <ExpenseForm onAddExpense={addExpense} expenses={expenses} />

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest business transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {expenses.slice(0, 10).map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={expense.type === "expense" ? "destructive" : "default"}>
                                {expense.type}
                              </Badge>
                              <span className="font-medium">{expense.category}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{expense.description}</p>
                            <p className="text-xs text-muted-foreground">{expense.date}</p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-bold ${expense.type === "expense" ? "text-red-600" : "text-green-600"}`}
                            >
                              {expense.type === "expense" ? "-" : "+"}${expense.amount.toFixed(2)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteExpense(expense.id)}
                              className="text-xs"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                      {expenses.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          No transactions yet. Add your first transaction above.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <SubscriptionGuard requiredPlan="standard" feature="Advanced Analytics">
                <AnalyticsDashboard expenses={expenses} />
              </SubscriptionGuard>
            </TabsContent>

            <TabsContent value="reports">
              <SubscriptionGuard requiredPlan="basic" feature="Reports">
                <ReportsSection expenses={expenses} />
              </SubscriptionGuard>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
