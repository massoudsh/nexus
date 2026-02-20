/**
 * Utility functions. Currency: Toman. Numbers: Farsi (fa-IR).
 */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const FA_IR = 'fa-IR'
const TOMAN_LABEL = ' تومان'

/** Format a number with Farsi (Persian) digits. */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(FA_IR, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    ...options,
  }).format(value)
}

/** Format currency in Toman with Farsi numerals. Default currency is Toman (IRT). */
export function formatCurrency(amount: number, currency: string = 'IRT'): string {
  const isToman = !currency || currency === 'IRT' || currency === 'IRR' || currency === 'TOMAN'
  if (isToman) {
    const formatted = new Intl.NumberFormat(FA_IR, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(amount))
    return formatted + TOMAN_LABEL
  }
  return new Intl.NumberFormat(FA_IR, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString(FA_IR, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString(FA_IR, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
