'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Target, Zap, RefreshCw, ArrowUpRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatCompact, calcXIRR, monthsBetween, daysUntil } from '@/lib/utils'
import { Goal, Investment, Payment } from '@/types'

interface DashboardData {
  goals: Goal[]
  investments: Investment[]
  payments: Payment[]
  exchangeRate: number
  userName: string
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [currency, setCurrency] = useState<'AED' | 'INR'>('INR')
  const [loading, setLoading] = useState(true)
  const [rateUpdated, setRateUpdated] = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [goalsRes, invRes, payRes, rateRes] = await Promise.all([
        fetch('/financial_freedom/api/goals'),
        fetch('/financial_freedom/api/investments'),
        fetch('/financial_freedom/api/payments'),
        fetch('/financial_freedom/api/exchange-rate'),
      ])
      const [goals, investments, payments, rateData] = await Promise.all([
        goalsRes.json(), invRes.json(), payRes.json(), rateRes.json()
      ])
      setData({ goals: goals.data || [], investments: investments.data || [], payments: payments.data || [], exchangeRate: rateData.rate || 24, userName: rateData.userName || 'Raneesh' })
      if (rateData.fetched_at) setRateUpdated(new Date(rateData.fetched_at).toLocaleTimeString())
    } catch { /* silent */ }
    setLoading(false)
  }

  const convert = (amount: number, fromCurrency: string) => {
    if (!data) return amount
    if (currency === 'AED' && fromCurrency === 'INR') return amount / data.exchangeRate
    if (currency === 'INR' && fromCurrency === 'AED') return amount * data.exchangeRate
    return amount
  }

  const totalInvested = data?.investments.reduce((s, i) => s + convert(i.invested_amount, i.currency), 0) || 0
  const totalCurrent = data?.investments.reduce((s, i) => s + convert(i.current_value, i.currency), 0) || 0
  const totalGain = totalCurrent - totalInvested
  const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

  const primaryGoal = data?.goals.find(g => g.is_primary)
  const otherGoals = data?.goals.filter(g => !g.is_primary) || []

  // Months invested (from earliest investment)
  const monthsInvested = data?.investments.length
    ? monthsBetween(
        new Date(Math.min(...data.investments.map(i => new Date(i.month).getTime()))),
        new Date()
      )
    : 0

  const upcomingPayments = data?.payments
    .filter(p => p.status !== 'paid')
    .sort((a, b) => new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime())
    .slice(0, 3) || []

  const getHour = () => new Date().getHours()
  const greeting = getHour() < 12 ? 'Good morning' : getHour() < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }} />
        <p style={{ color: '#64748B' }}>Loading your wealth dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{greeting},</p>
          <h1 className="text-2xl font-bold text-gold-gradient">{data?.userName || 'Raneesh'} 👋</h1>
          <p style={{ color: '#475569', fontSize: '0.75rem' }}>{new Date().toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button
          onClick={() => setCurrency(c => c === 'AED' ? 'INR' : 'AED')}
          className="btn-ghost text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-3 h-3" />
          {currency === 'AED' ? '🇦🇪 AED' : '🇮🇳 INR'}
        </button>
      </div>

      {/* Portfolio Summary Card */}
      <div className="rounded-2xl p-6 glow-gold" style={{ background: 'linear-gradient(135deg, #111827, #1a2235)', border: '1px solid rgba(201,168,76,0.3)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Total Portfolio Value</p>
          <span className="chip chip-gold text-xs">Live</span>
        </div>
        <p className="text-4xl font-bold mb-1 animate-count text-gold-gradient">{formatCompact(totalCurrent, currency)}</p>
        <div className="flex items-center gap-3 mt-2">
          {totalGain >= 0
            ? <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#10B981' }}><TrendingUp className="w-4 h-4" />+{formatCompact(totalGain, currency)} ({gainPct.toFixed(1)}%)</span>
            : <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#EF4444' }}><TrendingDown className="w-4 h-4" />{formatCompact(totalGain, currency)} ({gainPct.toFixed(1)}%)</span>
          }
          <span style={{ color: '#475569', fontSize: '0.75rem' }}>vs invested</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p style={{ color: '#64748B', fontSize: '0.75rem' }}>Invested</p>
            <p className="font-semibold">{formatCompact(totalInvested, currency)}</p>
          </div>
          <div>
            <p style={{ color: '#64748B', fontSize: '0.75rem' }}>Gain / Loss</p>
            <p className="font-semibold" style={{ color: totalGain >= 0 ? '#10B981' : '#EF4444' }}>
              {totalGain >= 0 ? '+' : ''}{formatCompact(totalGain, currency)}
            </p>
          </div>
        </div>
        {rateUpdated && <p className="text-xs mt-3" style={{ color: '#475569' }}>₹1 = AED {(1/data!.exchangeRate).toFixed(4)} · Rate updated {rateUpdated}</p>}
      </div>

      {/* Primary Goal */}
      {primaryGoal && (() => {
        const current = convert(totalCurrent, currency)
        const target = convert(primaryGoal.target_amount, primaryGoal.currency)
        const pct = Math.min((current / target) * 100, 100)
        const days = primaryGoal.target_date ? daysUntil(primaryGoal.target_date) : null
        return (
          <div className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid #1E2A3A' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: '#C9A84C' }} />
                <span className="text-sm font-semibold" style={{ color: '#C9A84C' }}>PRIMARY GOAL</span>
              </div>
              {days !== null && (
                <span className={`chip text-xs ${days < 0 ? 'chip-red' : days < 90 ? 'chip-amber' : 'chip-green'}`}>
                  {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                </span>
              )}
            </div>
            {primaryGoal.image_url && (
              <div className="w-full h-32 rounded-xl mb-3 overflow-hidden">
                <img src={primaryGoal.image_url} alt={primaryGoal.name} className="w-full h-full object-cover" />
              </div>
            )}
            <h3 className="text-lg font-bold mb-3">{primaryGoal.name}</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold text-gold-gradient">{pct.toFixed(1)}%</span>
              <span className="text-sm" style={{ color: '#64748B' }}>{formatCompact(current, currency)} / {formatCompact(target, currency)}</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full animate-progress" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C9A84C, #F5D080)' }} />
            </div>
            <div className="mt-2 flex justify-between text-xs" style={{ color: '#64748B' }}>
              <span>Remaining: {formatCompact(Math.max(target - current, 0), currency)}</span>
              <Link href="/goals" className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                View details <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )
      })()}

      {/* Consistency Streak */}
      {monthsInvested > 0 && (
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.2)' }}>
            <Zap className="w-5 h-5" style={{ color: '#10B981' }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#34D399' }}>🔥 {monthsInvested} Month Streak!</p>
            <p className="text-xs" style={{ color: '#64748B' }}>You've been consistently invested — this patience is your edge.</p>
          </div>
        </div>
      )}

      {/* Other Goals */}
      {otherGoals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ color: '#94A3B8' }}>OTHER GOALS</h2>
            <Link href="/goals" className="text-xs" style={{ color: '#C9A84C' }}>View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherGoals.map(goal => {
              const linkedInv = data?.investments.filter(i => i.goal_id === goal.id) || []
              const current = linkedInv.reduce((s, i) => s + convert(i.current_value, i.currency), 0)
              const target = convert(goal.target_amount, goal.currency)
              const pct = Math.min((current / target) * 100, 100)
              return (
                <div key={goal.id} className="rounded-xl p-4" style={{ background: '#111827', border: '1px solid #1E2A3A' }}>
                  {goal.image_url && <img src={goal.image_url} alt={goal.name} className="w-full h-20 object-cover rounded-lg mb-2" />}
                  <h3 className="font-medium text-sm mb-2">{goal.name}</h3>
                  <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? '#10B981' : 'linear-gradient(90deg, #C9A84C, #F5D080)' }} />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: '#64748B' }}>
                    <span>{pct.toFixed(0)}%</span>
                    <span>{formatCompact(target, goal.currency)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ color: '#94A3B8' }}>UPCOMING PAYMENTS</h2>
            <Link href="/payments" className="text-xs" style={{ color: '#C9A84C' }}>View all →</Link>
          </div>
          <div className="space-y-2">
            {upcomingPayments.map(p => {
              const days = p.due_date ? daysUntil(p.due_date) : null
              return (
                <div key={p.id} className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: '#111827', border: '1px solid #1E2A3A' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>{p.category} · {days !== null ? (days < 0 ? `${Math.abs(days)}d overdue` : `Due in ${days}d`) : 'No date'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(p.amount, p.currency)}</p>
                    <span className={`chip text-xs ${p.status === 'overdue' ? 'chip-red' : 'chip-amber'}`}>{p.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        <Link href="/investments" className="rounded-xl p-4 flex items-center gap-3 transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
            <Plus className="w-4 h-4" style={{ color: '#10B981' }} />
          </div>
          <span className="text-sm font-medium" style={{ color: '#34D399' }}>Add Investment</span>
        </Link>
        <Link href="/payments" className="rounded-xl p-4 flex items-center gap-3 transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)' }}>
            <Plus className="w-4 h-4" style={{ color: '#EF4444' }} />
          </div>
          <span className="text-sm font-medium" style={{ color: '#F87171' }}>Add Payment</span>
        </Link>
      </div>
    </div>
  )
}
