"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import SubscriptionGuard from "@/components/subscription-guard"

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  type: "expense" | "income"
}

interface ReportsSectionProps {
  expenses: Expense[]
}

type ReportPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly"

export default function ReportsSection({ expenses }: ReportsSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("monthly")
  const { toast } = useToast()
  const { user } = useAuth()

  const getAvailablePeriods = () => {
    switch (user?.subscription) {
      case "trial":
        return ["weekly", "monthly", "quarterly"] // Same as standard
      case "basic":
        return ["monthly"]
      case "standard":
        return ["weekly", "monthly", "quarterly"]
      case "premium":
        return ["daily", "weekly", "monthly", "quarterly", "yearly"]
      default:
        return []
    }
  }

  const availablePeriods = getAvailablePeriods()

  const reportData = useMemo(() => {
    const now = new Date()
    let filteredExpenses: Expense[] = []
    let periodLabel = ""

    switch (selectedPeriod) {
      case "daily":
        const today = now.toISOString().split("T")[0]
        filteredExpenses = expenses.filter((e) => e.date === today)
        periodLabel = `Daily Report - ${today}`
        break

      case "weekly":
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        filteredExpenses = expenses.filter((e) => {
          const expenseDate = new Date(e.date)
          return expenseDate >= weekStart && expenseDate <= weekEnd
        })
        periodLabel = `Weekly Report - ${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}`
        break

      case "monthly":
        filteredExpenses = expenses.filter((e) => {
          const expenseDate = new Date(e.date)
          return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
        })
        periodLabel = `Monthly Report - ${now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
        break

      case "quarterly":
        const quarter = Math.floor(now.getMonth() / 3)
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1)
        const quarterEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
        filteredExpenses = expenses.filter((e) => {
          const expenseDate = new Date(e.date)
          return expenseDate >= quarterStart && expenseDate <= quarterEnd
        })
        periodLabel = `Quarterly Report - Q${quarter + 1} ${now.getFullYear()}`
        break

      case "yearly":
        filteredExpenses = expenses.filter((e) => {
          const expenseDate = new Date(e.date)
          return expenseDate.getFullYear() === now.getFullYear()
        })
        periodLabel = `Yearly Report - ${now.getFullYear()}`
        break
    }

    const totalIncome = filteredExpenses.filter((e) => e.type === "income").reduce((sum, e) => sum + e.amount, 0)

    const totalExpenses = filteredExpenses.filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0)

    const categoryBreakdown = filteredExpenses.reduce(
      (acc, expense) => {
        const key = `${expense.type}-${expense.category}`
        if (!acc[key]) {
          acc[key] = {
            category: expense.category,
            type: expense.type,
            amount: 0,
            count: 0,
          }
        }
        acc[key].amount += expense.amount
        acc[key].count += 1
        return acc
      },
      {} as Record<string, { category: string; type: string; amount: number; count: number }>,
    )

    return {
      periodLabel,
      filteredExpenses,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      categoryBreakdown: Object.values(categoryBreakdown),
    }
  }, [expenses, selectedPeriod, user])

  const generateCSVReport = () => {
    const headers = ["Date", "Type", "Category", "Description", "Amount"]
    const csvContent = [
      headers.join(","),
      ...reportData.filteredExpenses.map((expense) =>
        [
          expense.date,
          expense.type,
          expense.category,
          `"${expense.description.replace(/"/g, '""')}"`,
          expense.amount.toFixed(2),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedPeriod}-report-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Report Downloaded",
      description: `${selectedPeriod} report has been downloaded as CSV.`,
    })
  }

  const generatePDFReport = () => {
    // In a real application, you would use a library like jsPDF
    // For now, we'll create a formatted text report
    const reportContent = `
BUSINESS FINANCIAL REPORT
${reportData.periodLabel}
Generated on: ${new Date().toLocaleDateString()}

SUMMARY
=======
Total Income: $${reportData.totalIncome.toFixed(2)}
Total Expenses: $${reportData.totalExpenses.toFixed(2)}
Net Profit: $${reportData.netProfit.toFixed(2)}

CATEGORY BREAKDOWN
==================
${reportData.categoryBreakdown
  .map((item) => `${item.category} (${item.type}): $${item.amount.toFixed(2)} (${item.count} transactions)`)
  .join("\n")}

DETAILED TRANSACTIONS
====================
${reportData.filteredExpenses
  .map(
    (expense) =>
      `${expense.date} | ${expense.type.toUpperCase()} | ${expense.category} | $${expense.amount.toFixed(2)} | ${expense.description}`,
  )
  .join("\n")}
    `

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedPeriod}-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Report Downloaded",
      description: `${selectedPeriod} report has been downloaded as text file.`,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Financial Reports
          </CardTitle>
          <CardDescription>Generate and download comprehensive business reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Period</label>
              <Select value={selectedPeriod} onValueChange={(value: ReportPeriod) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.includes("daily") && <SelectItem value="daily">Daily</SelectItem>}
                  {availablePeriods.includes("weekly") && <SelectItem value="weekly">Weekly</SelectItem>}
                  {availablePeriods.includes("monthly") && <SelectItem value="monthly">Monthly</SelectItem>}
                  {availablePeriods.includes("quarterly") && <SelectItem value="quarterly">Quarterly</SelectItem>}
                  {availablePeriods.includes("yearly") && <SelectItem value="yearly">Yearly</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 mt-6 sm:mt-0">
              <SubscriptionGuard requiredPlan="standard" feature="CSV Export">
                <Button onClick={generateCSVReport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </SubscriptionGuard>

              <SubscriptionGuard requiredPlan="premium" feature="Advanced Reports">
                <Button onClick={generatePDFReport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Text Report
                </Button>
              </SubscriptionGuard>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{reportData.periodLabel}</CardTitle>
          <CardDescription>Financial summary for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-sm font-medium text-green-800 dark:text-green-200">Total Income</div>
              <div className="text-2xl font-bold text-green-600">${reportData.totalIncome.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-sm font-medium text-red-800 dark:text-red-200">Total Expenses</div>
              <div className="text-2xl font-bold text-red-600">${reportData.totalExpenses.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Net Profit</div>
              <div className={`text-2xl font-bold ${reportData.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${reportData.netProfit.toFixed(2)}
              </div>
            </div>
          </div>

          {reportData.categoryBreakdown.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Category Breakdown</h3>
              <div className="grid gap-2">
                {reportData.categoryBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.type === "expense" ? "destructive" : "default"}>{item.type}</Badge>
                      <span className="font-medium">{item.category}</span>
                      <span className="text-sm text-muted-foreground">({item.count} transactions)</span>
                    </div>
                    <span className={`font-bold ${item.type === "expense" ? "text-red-600" : "text-green-600"}`}>
                      ${item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {reportData.filteredExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Transactions</CardTitle>
            <CardDescription>All transactions for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.date}</TableCell>
                      <TableCell>
                        <Badge variant={expense.type === "expense" ? "destructive" : "default"}>{expense.type}</Badge>
                      </TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${expense.type === "expense" ? "text-red-600" : "text-green-600"}`}
                      >
                        {expense.type === "expense" ? "-" : "+"}${expense.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportData.filteredExpenses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground">No transactions found for the selected {selectedPeriod} period.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
