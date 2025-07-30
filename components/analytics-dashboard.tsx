"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  type: "expense" | "income"
}

interface AnalyticsDashboardProps {
  expenses: Expense[]
}

export default function AnalyticsDashboard({ expenses = [] }: AnalyticsDashboardProps) {
  const { user } = useAuth()

  const analytics = useMemo(() => {
    // Get current month and year
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Filter expenses for current and previous month
    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })

    const previousMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === previousMonth && expenseDate.getFullYear() === previousMonthYear
    })

    // Calculate totals
    const currentMonthIncome = currentMonthExpenses
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0)

    const currentMonthExpense = currentMonthExpenses
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0)

    const previousMonthIncome = previousMonthExpenses
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0)

    const previousMonthExpense = previousMonthExpenses
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0)

    // Calculate profit margins
    const currentMonthProfit = currentMonthIncome - currentMonthExpense
    const previousMonthProfit = previousMonthIncome - previousMonthExpense

    const currentProfitMargin = currentMonthIncome > 0 ? (currentMonthProfit / currentMonthIncome) * 100 : 0

    const previousProfitMargin = previousMonthIncome > 0 ? (previousMonthProfit / previousMonthIncome) * 100 : 0

    // Calculate month-over-month changes
    const incomeChange =
      previousMonthIncome > 0 ? ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100 : 100

    const expenseChange =
      previousMonthExpense > 0 ? ((currentMonthExpense - previousMonthExpense) / previousMonthExpense) * 100 : 100

    const profitChange =
      previousMonthProfit > 0
        ? ((currentMonthProfit - previousMonthProfit) / Math.abs(previousMonthProfit)) * 100
        : currentMonthProfit > 0
          ? 100
          : 0

    // Get top expense categories
    const categoryTotals = currentMonthExpenses
      .filter((e) => e.type === "expense")
      .reduce(
        (acc, expense) => {
          if (!acc[expense.category]) {
            acc[expense.category] = 0
          }
          acc[expense.category] += expense.amount
          return acc
        },
        {} as Record<string, number>,
      )

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }))

    // Calculate average transaction amounts
    const avgIncomeAmount =
      currentMonthExpenses.filter((e) => e.type === "income").length > 0
        ? currentMonthIncome / currentMonthExpenses.filter((e) => e.type === "income").length
        : 0

    const avgExpenseAmount =
      currentMonthExpenses.filter((e) => e.type === "expense").length > 0
        ? currentMonthExpense / currentMonthExpenses.filter((e) => e.type === "expense").length
        : 0

    return {
      currentMonth: {
        name: now.toLocaleDateString("en-US", { month: "long" }),
        income: currentMonthIncome,
        expense: currentMonthExpense,
        profit: currentMonthProfit,
        profitMargin: currentProfitMargin,
        transactionCount: currentMonthExpenses.length,
      },
      previousMonth: {
        name: new Date(previousMonthYear, previousMonth, 1).toLocaleDateString("en-US", { month: "long" }),
        income: previousMonthIncome,
        expense: previousMonthExpense,
        profit: previousMonthProfit,
        profitMargin: previousProfitMargin,
        transactionCount: previousMonthExpenses.length,
      },
      changes: {
        income: incomeChange,
        expense: expenseChange,
        profit: profitChange,
      },
      topCategories,
      averages: {
        income: avgIncomeAmount,
        expense: avgExpenseAmount,
      },
      healthScore: calculateHealthScore(currentProfitMargin, incomeChange, expenseChange),
    }
  }, [expenses])

  // Calculate a financial health score (0-100)
  function calculateHealthScore(profitMargin: number, incomeChange: number, expenseChange: number): number {
    // This is a simplified calculation
    let score = 50 // Base score

    // Profit margin contributes up to 40 points
    score += Math.min(profitMargin * 0.4, 40)

    // Income growth contributes up to 20 points
    score += Math.min(incomeChange * 0.2, 20)

    // Expense control (negative is better) contributes up to 20 points
    score -= Math.min(Math.max(expenseChange, 0) * 0.2, 20)

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(Math.round(score), 100))
  }

  // Determine health status based on score
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-600" }
    if (score >= 60) return { label: "Good", color: "text-blue-600" }
    if (score >= 40) return { label: "Fair", color: "text-yellow-600" }
    return { label: "Needs Attention", color: "text-red-600" }
  }

  const healthStatus = getHealthStatus(analytics.healthScore)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Analytics Dashboard</CardTitle>
          <CardDescription>Insights and analysis for your business finances</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="comparison">Monthly Comparison</TabsTrigger>
              <TabsTrigger value="categories">Top Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Current Month Income</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${analytics.currentMonth.income.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className={analytics.changes.income >= 0 ? "text-green-600" : "text-red-600"}>
                        {analytics.changes.income >= 0 ? "+" : ""}
                        {analytics.changes.income.toFixed(1)}%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Current Month Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${analytics.currentMonth.expense.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className={analytics.changes.expense <= 0 ? "text-green-600" : "text-red-600"}>
                        {analytics.changes.expense >= 0 ? "+" : ""}
                        {analytics.changes.expense.toFixed(1)}%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.currentMonth.profitMargin.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analytics.previousMonth.profitMargin.toFixed(1)}% last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${healthStatus.color}`}>{healthStatus.label}</div>
                    <p className="text-xs text-muted-foreground mt-1">Score: {analytics.healthScore}/100</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Transaction Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Average Transaction Amounts</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Income Transactions</span>
                          <span className="font-medium">${analytics.averages.income.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Expense Transactions</span>
                          <span className="font-medium">${analytics.averages.expense.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Transaction Volume</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Current Month</span>
                          <span className="font-medium">{analytics.currentMonth.transactionCount} transactions</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Previous Month</span>
                          <span className="font-medium">{analytics.previousMonth.transactionCount} transactions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {analytics.currentMonth.name} {new Date().getFullYear()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Income</span>
                        <span className="font-medium text-green-600">${analytics.currentMonth.income.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Expenses</span>
                        <span className="font-medium text-red-600">${analytics.currentMonth.expense.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span>Net Profit</span>
                        <span
                          className={`font-medium ${analytics.currentMonth.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          ${analytics.currentMonth.profit.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Profit Margin</span>
                        <span className="font-medium">{analytics.currentMonth.profitMargin.toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {analytics.previousMonth.name}{" "}
                      {analytics.previousMonth.name === "December"
                        ? new Date().getFullYear() - 1
                        : new Date().getFullYear()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Income</span>
                        <span className="font-medium text-green-600">${analytics.previousMonth.income.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Expenses</span>
                        <span className="font-medium text-red-600">${analytics.previousMonth.expense.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span>Net Profit</span>
                        <span
                          className={`font-medium ${analytics.previousMonth.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          ${analytics.previousMonth.profit.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Profit Margin</span>
                        <span className="font-medium">{analytics.previousMonth.profitMargin.toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Month-over-Month Changes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Income Change</span>
                      <span
                        className={`font-medium ${analytics.changes.income >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {analytics.changes.income >= 0 ? "+" : ""}
                        {analytics.changes.income.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Expense Change</span>
                      <span
                        className={`font-medium ${analytics.changes.expense <= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {analytics.changes.expense >= 0 ? "+" : ""}
                        {analytics.changes.expense.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Profit Change</span>
                      <span
                        className={`font-medium ${analytics.changes.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {analytics.changes.profit >= 0 ? "+" : ""}
                        {analytics.changes.profit.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Top Expense Categories ({analytics.currentMonth.name})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.topCategories.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.topCategories.map((category, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span>{category.category}</span>
                          </div>
                          <span className="font-medium">${category.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No expense data available for this month</p>
                  )}
                </CardContent>
              </Card>

              {user?.subscription === "premium" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Expense Optimization Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topCategories.length > 0 ? (
                        analytics.topCategories.slice(0, 2).map((category, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <h4 className="font-medium mb-1">{category.category}</h4>
                            <p className="text-sm text-muted-foreground">
                              This category represents{" "}
                              {((category.amount / analytics.currentMonth.expense) * 100).toFixed(1)}% of your monthly
                              expenses.
                              {category.amount > analytics.currentMonth.expense * 0.25 &&
                                " Consider reviewing these expenses for potential savings."}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          Add more transactions to receive optimization suggestions
                        </p>
                      )}

                      {analytics.changes.expense > 10 && (
                        <div className="p-3 border rounded-lg border-orange-200 bg-orange-50 dark:bg-orange-950">
                          <h4 className="font-medium mb-1">Expense Growth Alert</h4>
                          <p className="text-sm text-muted-foreground">
                            Your expenses increased by {analytics.changes.expense.toFixed(1)}% compared to last month.
                            This may impact your profit margin if income doesn't grow proportionally.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
