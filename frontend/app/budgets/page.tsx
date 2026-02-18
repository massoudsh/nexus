'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import BudgetForm from '@/components/forms/BudgetForm'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Budget } from '@/lib/schemas/budget'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Budget | null>(null)

  const loadBudgets = useCallback(async () => {
    try {
      const data = await apiClient.getBudgets()
      setBudgets(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load budgets:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets])

  const openCreate = () => {
    setEditingBudget(null)
    setFormOpen(true)
  }
  const openEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormOpen(true)
  }
  const closeForm = () => {
    setFormOpen(false)
    setEditingBudget(null)
  }

  const handleDeleteClick = (budget: Budget) => setConfirmDelete(budget)
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return
    setDeletingId(confirmDelete.id)
    setConfirmDelete(null)
    try {
      await apiClient.deleteBudget(confirmDelete.id)
      await loadBudgets()
    } catch (error) {
      console.error('Failed to delete budget:', error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Budgets</h2>
            <button
              type="button"
              onClick={openCreate}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium"
            >
              Create Budget
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : budgets.length === 0 ? (
            <EmptyState
              title="No budgets yet"
              description="Create a budget to track spending and get alerts when you approach your limit."
              actionLabel="Create budget"
              onAction={openCreate}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => {
                const b = budget as Budget & { spent?: number; remaining?: number; percentage_used?: number }
                const spent = b.spent ?? 0
                const remaining = b.remaining ?? budget.amount - spent
                const pct = typeof b.percentage_used === 'number'
                  ? b.percentage_used
                  : (budget.amount > 0 ? (spent / budget.amount) * 100 : 0)
                return (
                  <div key={budget.id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{budget.name}</h3>
                        <p className="text-sm text-gray-500 capitalize mt-1">{budget.period}</p>
                        <p className="text-lg font-medium text-gray-900 mt-2">{formatCurrency(budget.amount)} budget</p>
                        {typeof spent === 'number' && (
                          <p className="text-sm text-gray-600 mt-1">
                            Spent: {formatCurrency(spent)} · Remaining: {formatCurrency(remaining)}
                          </p>
                        )}
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${pct > 100 ? 'bg-red-600' : 'bg-primary-600'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(budget)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(budget)}
                          disabled={deletingId === budget.id}
                          className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          {deletingId === budget.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete budget?"
        message={confirmDelete ? `"${confirmDelete.name}" will be removed. This cannot be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingBudget ? 'Edit budget' : 'New budget'}
            </h3>
            <BudgetForm
              budget={editingBudget}
              onSuccess={() => {
                loadBudgets()
                closeForm()
              }}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  )
}

