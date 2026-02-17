'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import AccountForm from '@/components/forms/AccountForm'
import type { Account } from '@/lib/schemas/account'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadAccounts = useCallback(async () => {
    try {
      const data = await apiClient.getAccounts()
      setAccounts(data)
    } catch (error) {
      console.error('Failed to load accounts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const openCreate = () => {
    setEditingAccount(null)
    setFormOpen(true)
  }
  const openEdit = (account: Account) => {
    setEditingAccount(account)
    setFormOpen(true)
  }
  const closeForm = () => {
    setFormOpen(false)
    setEditingAccount(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this account? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await apiClient.deleteAccount(id)
      await loadAccounts()
    } catch (error) {
      console.error('Failed to delete account:', error)
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
            <h2 className="text-2xl font-bold text-gray-900">Accounts</h2>
            <button
              type="button"
              onClick={openCreate}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium"
            >
              Add Account
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No accounts found. Create your first account!</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <div key={account.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{account.account_type.replace('_', ' ')}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-4">{formatCurrency(account.balance, account.currency)}</p>
                      {account.description && (
                        <p className="text-sm text-gray-500 mt-2">{account.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(account)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(account.id)}
                        disabled={deletingId === account.id}
                        className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        {deletingId === account.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAccount ? 'Edit account' : 'New account'}
            </h3>
            <AccountForm
              account={editingAccount}
              onSuccess={() => {
                loadAccounts()
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

