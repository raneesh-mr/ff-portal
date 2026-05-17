import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'AED'): string {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }
  return `AED ${amount.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`
}

export function formatCompact(amount: number, currency: string = 'AED'): string {
  const symbol = currency === 'INR' ? '₹' : 'AED '
  if (amount >= 10000000) return `${symbol}${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `${symbol}${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(1)}K`
  return `${symbol}${amount.toFixed(0)}`
}

export function calcXIRR(invested: number, current: number, months: number): number {
  if (months === 0 || invested === 0) return 0
  const years = months / 12
  return ((Math.pow(current / invested, 1 / years) - 1) * 100)
}

export function monthsBetween(date1: Date, date2: Date): number {
  return Math.abs(
    (date2.getFullYear() - date1.getFullYear()) * 12 +
    (date2.getMonth() - date1.getMonth())
  )
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function compoundGrowth(principal: number, ratePercent: number, years: number): number {
  return principal * Math.pow(1 + ratePercent / 100, years)
}

export function calcSavingsRate(monthlyIncome: number, monthlyExpenses: number): number {
  if (monthlyIncome === 0) return 0
  return ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
}

export function freedomCost(amount: number, goalGap: number, monthlySurplus: number): number {
  if (monthlySurplus === 0) return 0
  const monthsPerUnit = amount / monthlySurplus
  return monthsPerUnit * 30 // days
}

export function getGainColor(pct: number): string {
  if (pct > 0) return 'text-emerald-400'
  if (pct < 0) return 'text-red-400'
  return 'text-slate-400'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'on_track': return 'text-emerald-400'
    case 'at_risk': return 'text-amber-400'
    case 'overdue': return 'text-red-400'
    case 'paid': return 'text-emerald-400'
    case 'due': return 'text-amber-400'
    default: return 'text-red-400'
  }
}
