'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function KeyboardShortcuts() {
  const router = useRouter()
  const [helpOpen, setHelpOpen] = useState(false)
  const [gPressed, setGPressed] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const inInput = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable
      if (inInput && e.key !== 'Escape') return

      if (e.key === '?') {
        e.preventDefault()
        setHelpOpen((open) => !open)
        return
      }
      if (e.key === 'Escape') {
        setHelpOpen(false)
        setGPressed(false)
        return
      }
      if (e.key === 'n' || e.key === 'N') {
        if (!inInput) {
          e.preventDefault()
          router.push('/transactions')
        }
        return
      }
      if (e.key === 'g' || e.key === 'G') {
        if (!inInput) {
          e.preventDefault()
          setGPressed(true)
        }
        return
      }
      if ((e.key === 'd' || e.key === 'D') && gPressed) {
        e.preventDefault()
        router.push('/dashboard')
        setGPressed(false)
        return
      }
      setGPressed(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router, gPressed])

  if (!helpOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
      <div className="card-elevated max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">میانبرهای صفحه‌کلید</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">?</kbd> این راهنما</li>
          <li><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">N</kbd> تراکنش‌ها</li>
          <li><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">G</kbd> سپس <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">D</kbd> داشبورد</li>
          <li><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">Esc</kbd> بستن</li>
        </ul>
        <button type="button" onClick={() => setHelpOpen(false)} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
          بستن
        </button>
      </div>
    </div>
  )
}
