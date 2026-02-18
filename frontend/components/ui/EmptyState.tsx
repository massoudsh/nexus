'use client'

import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ title, description, actionLabel, actionHref, onAction, className = '' }: EmptyStateProps) {
  const buttonClass = 'mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium'
  return (
    <div
      className={`rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 p-8 text-center ${className}`}
    >
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">{description}</p>
      {onAction ? (
        <button type="button" onClick={onAction} className={buttonClass}>
          {actionLabel}
        </button>
      ) : actionHref ? (
        <Link href={actionHref} className={buttonClass}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
