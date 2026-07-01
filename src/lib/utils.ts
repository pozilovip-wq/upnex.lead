import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function getLeadScoreColor(score: 'Hot' | 'Warm' | 'Cold') {
  return score === 'Hot' ? 'text-red-500 bg-red-50 border-red-200'
    : score === 'Warm' ? 'text-amber-500 bg-amber-50 border-amber-200'
    : 'text-blue-500 bg-blue-50 border-blue-200'
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    'New Lead': 'bg-slate-100 text-slate-700',
    'Contacted': 'bg-blue-100 text-blue-700',
    'Consultation Scheduled': 'bg-indigo-100 text-indigo-700',
    'Documents Requested': 'bg-purple-100 text-purple-700',
    'Documents Received': 'bg-violet-100 text-violet-700',
    'University Applied': 'bg-orange-100 text-orange-700',
    'Admission Received': 'bg-yellow-100 text-yellow-700',
    'Scholarship Awarded': 'bg-lime-100 text-lime-700',
    'Visa Preparation': 'bg-cyan-100 text-cyan-700',
    'Visa Interview': 'bg-teal-100 text-teal-700',
    'Visa Approved': 'bg-green-100 text-green-700',
    'Travel Completed': 'bg-emerald-100 text-emerald-800',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}
