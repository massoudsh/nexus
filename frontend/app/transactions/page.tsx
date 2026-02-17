'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import TransactionForm from '@/components/forms/TransactionForm'
import type { Account } from '@/lib/schemas/account'
import type { Transaction } from '@/lib/schemas/transaction'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

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

  useEffect(() => {
    loadTransactions()
    loadAccounts()
  }, [loadTransactions, loadAccounts])

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

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this transaction? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await apiClient.deleteTransaction(id)
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
            <button
              type="button"
              onClick={openCreate}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium"
            >
              Add Transaction
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No transactions found. Add your first transaction!</div>
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
                          onClick={() => handleDelete(transaction.id)}
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

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTransaction ? 'Edit transaction' : 'New transaction'}
            </h3>
            <TransactionForm
              accounts={accounts}
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
    </div>
  )
}

