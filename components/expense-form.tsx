"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from "lucide-react"

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  type: "expense" | "income"
}

interface ExpenseFormProps {
  onAddExpense: (expense: {
    amount: number
    category: string
    description: string
    date: string
    type: "expense" | "income"
  }) => void
  expenses?: Expense[]
}

export default function ExpenseForm({ onAddExpense, expenses = [] }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    type: "expense" as "expense" | "income",
  })

  const { user } = useAuth()

  const categories = [
    "Office Supplies",
    "Marketing",
    "Travel",
    "Meals",
    "Software",
    "Equipment",
    "Rent",
    "Utilities",
    "Insurance",
    "Professional Services",
    "Sales",
    "Consulting",
    "Products",
    "Services",
    "Other",
  ]

  const getTransactionLimit = () => {
    switch (user?.subscription) {
      case "trial":
        return 500 // Same as standard
      case "basic":
        return 100
      case "standard":
        return 500
      case "premium":
        return Number.POSITIVE_INFINITY
      default:
        return 0
    }
  }

  const transactionLimit = getTransactionLimit()
  const currentMonthTransactions = expenses.filter((e) => {
    const expenseDate = new Date(e.date)
    const now = new Date()
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
  }).length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.category) return

    onAddExpense({
      amount: Number.parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      type: formData.type,
    })

    setFormData({
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      type: "expense",
    })
  }

  const isLimitReached = transactionLimit !== Number.POSITIVE_INFINITY && currentMonthTransactions >= transactionLimit

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Add Transaction
        </CardTitle>
        <CardDescription>Record a new business income or expense</CardDescription>
      </CardHeader>
      <CardContent>
        {transactionLimit !== Number.POSITIVE_INFINITY && (
          <Alert className="mb-4">
            <AlertDescription>
              {currentMonthTransactions}/{transactionLimit} transactions used this month
              {currentMonthTransactions >= transactionLimit && " - Limit reached!"}
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "expense" | "income") => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLimitReached || !user?.subscription}>
            {isLimitReached ? "Monthly Limit Reached" : "Add Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
