import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return '۰ تومان'
  const formatted = new Intl.NumberFormat('fa-IR').format(num)
  return `${formatted} تومان`
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fa-IR').format(n)
}

export function toPersianDigits(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return str.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)])
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-jewelry.jpg'
  if (path.startsWith('http')) return path
  const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:8000'
  return `${mediaUrl}${path}`
}

export function truncate(str: string, n: number): string {
  if (str.length <= n) return str
  return str.slice(0, n) + '...'
}

export function getPersianDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function getPersianDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function getDiscountPercent(
  price: string,
  comparePrice: string | null
): number | null {
  if (!comparePrice) return null
  const p = parseFloat(price)
  const cp = parseFloat(comparePrice)
  if (isNaN(p) || isNaN(cp) || cp <= p) return null
  return Math.round(((cp - p) / cp) * 100)
}

export function getSilverGradeLabel(grade: string | null | undefined): string {
  if (!grade) return '—'
  const grades: Record<string, string> = {
    '925': 'نقره ۹۲۵',
    '999': 'نقره ۹۹۹',
    '835': 'نقره ۸۳۵',
    '800': 'نقره ۸۰۰',
  }
  return grades[grade] || grade
}

export function getStatusLabel(status: string | null | undefined): { label: string; color: string } {
  const fallback = { label: status || '—', color: 'text-gray-600' }
  if (!status) return fallback
  const statuses: Record<string, { label: string; color: string }> = {
    pending: { label: 'در انتظار پرداخت', color: 'text-yellow-600' },
    processing: { label: 'در حال پردازش', color: 'text-blue-600' },
    shipped: { label: 'ارسال شده', color: 'text-purple-600' },
    delivered: { label: 'تحویل داده شده', color: 'text-green-600' },
    cancelled: { label: 'لغو شده', color: 'text-red-600' },
  }
  return statuses[status] || fallback
}

