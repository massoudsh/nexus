'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import TransactionForm from '@/components/forms/TransactionForm'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Account } from '@/lib/schemas/account'
import type { Transaction } from '@/lib/schemas/transaction'
import type { CategoryOption } from '@/components/forms/TransactionForm'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importAccountId, setImportAccountId] = useState<number | ''>('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null)
  const [importing, setImporting] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Transaction | null>(null)

  const loadTransactions = useCallback(async () => {
    try {
      const data = await apiClient.getTransactions()
      setTransactions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAccounts = useCallback(async () => {
    try {
      const data = await apiClient.getAccounts()
      setAccounts(data)
    } catch (error) {
      console.error('Failed to load accounts:', error)
    }
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      const data = await apiClient.getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }, [])

  useEffect(() => {
    loadTransactions()
    loadAccounts()
    loadCategories()
  }, [loadTransactions, loadAccounts, loadCategories])

  const openCreate = () => {
    setEditingTransaction(null)
    setFormOpen(true)
  }
  const openEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormOpen(true)
  }
  const closeForm = () => {
    setFormOpen(false)
    setEditingTransaction(null)
  }

  const handleImport = async () => {
    if (!importFile || importAccountId === '') return
    setImporting(true)
    setImportResult(null)
    try {
      const result = await apiClient.importTransactions(importFile, importAccountId as number)
      setImportResult({ created: result.created, errors: result.errors || [] })
      if (result.created > 0) await loadTransactions()
    } catch (err) {
      setImportResult({ created: 0, errors: [(err as Error).message] })
    } finally {
      setImporting(false)
    }
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportAccountId('')
    setImportFile(null)
    setImportResult(null)
  }

  const handleDeleteClick = (transaction: Transaction) => setConfirmDelete(transaction)
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return
    setDeletingId(confirmDelete.id)
    setConfirmDelete(null)
    try {
      await apiClient.deleteTransaction(confirmDelete.id)
      await loadTransactions()
    } catch (error) {
      console.error('Failed to delete transaction:', error)
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
            <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Import CSV
              </button>
              <button
                type="button"
                onClick={openCreate}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium"
              >
                Add Transaction
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Add a transaction, import from CSV, or paste a bank SMS in Banking to get started."
              actionLabel="Add transaction"
              onAction={openCreate}
            />
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <li key={transaction.id} className="px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description || 'No description'}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-medium ${
                            transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.transaction_type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => openEdit(transaction)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(transaction)}
                          disabled={deletingId === transaction.id}
                          className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          {deletingId === transaction.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete transaction?"
        message={confirmDelete ? 'This transaction will be removed. Account balance will be updated. This cannot be undone.' : ''}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTransaction ? 'Edit transaction' : 'New transaction'}
            </h3>
            <TransactionForm
              accounts={accounts}
              categories={categories}
              transaction={editingTransaction}
              onSuccess={() => {
                loadTransactions()
                closeForm()
              }}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import from CSV</h3>
            <p className="text-sm text-gray-600 mb-3">CSV must have headers: date, amount, type, description (type = income or expense).</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                <select
                  value={importAccountId}
                  onChange={(e) => setImportAccountId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CSV file</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-gray-300"
                />
              </div>
            </div>
            {importResult && (
              <div className="mb-4 p-3 rounded-md bg-gray-50 text-sm">
                <p className="font-medium text-green-700">Imported {importResult.created} transaction(s).</p>
                {importResult.errors.length > 0 && (
                  <ul className="mt-2 text-amber-800 list-disc list-inside">
                    {importResult.errors.slice(0, 5).map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>… and {importResult.errors.length - 5} more</li>
                    )}
                  </ul>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeImport} className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Close
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={importing || !importFile || importAccountId === ''}
                className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

