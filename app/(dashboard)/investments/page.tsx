'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, ChevronDown, ChevronUp, X } from 'lucide-react'
import EmailReportButton from '@/components/EmailReportButton'

interface Goal {
  id: string
  name: string
  currency: string
}

interface Investment {
  id: string
  platform: string
  type: string
  invested_amount: number
  current_value: number
  currency: string
  month: string
  goal_id?: string
  notes?: string
  created_at: string
}

const INVESTMENT_TYPES = ['MF', 'Stocks', 'Crypto', 'Gold', 'F&O', 'Other']
const CURRENCIES = ['INR', 'AED']
const PROJECTION_RATES = [10, 12, 15]
const PROJECTION_YEARS = [1, 3, 5, 10]

const TYPE_COLORS: Record<string, string> = {
  MF: 'chip-blue',
  Stocks: 'chip-green',
  Crypto: 'chip-amber',
  Gold: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50',
  'F&O': 'bg-purple-900/40 text-purple-300 border border-purple-700/50',
  Other: 'bg-slate-800 text-slate-400 border border-slate-700',
}

const TYPE_NOTES: Record<string, string> = {
  MF: 'Long-term compounder',
  Stocks: 'Track fundamentals',
  Crypto: '±30% swings normal',
  Gold: 'Inflation hedge',
  'F&O': 'High risk instrument',
  Other: 'Track regularly',
}

function calcXIRR(invested: number, current: number, monthStr: string): number {
  if (!invested || invested === 0) return 0
  try {
    const start = new Date(monthStr)
    const now = new Date()
    const years = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)
    if (years <= 0) return 0
    return (Math.pow(current / invested, 1 / years) - 1) * 100
  } catch {
    return 0
  }
}

function monthsInMarket(monthStr: string): number {
  if (!monthStr) return 0
  const start = new Date(monthStr)
  const now = new Date()
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)))
}

function InvestmentModal({
  open,
  onClose,
  onSave,
  initial,
  goals,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Investment>) => void
  initial?: Investment | null
  goals: Goal[]
}) {
  const [platform, setPlatform] = useState(initial?.platform || '')
  const [type, setType] = useState(initial?.type || 'MF')
  const [investedAmount, setInvestedAmount] = useState(initial?.invested_amount?.toString() || '')
  const [currentValue, setCurrentValue] = useState(initial?.current_value?.toString() || '')
  const [currency, setCurrency] = useState(initial?.currency || 'INR')
  const [month, setMonth] = useState(initial?.month?.slice(0, 7) || '')
  const [goalId, setGoalId] = useState(initial?.goal_id || '')
  const [notes, setNotes] = useState(initial?.notes || '')

  useEffect(() => {
    if (initial) {
      setPlatform(initial.platform || '')
      setType(initial.type || 'MF')
      setInvestedAmount(initial.invested_amount?.toString() || '')
      setCurrentValue(initial.current_value?.toString() || '')
      setCurrency(initial.currency || 'AED')
      setMonth(initial.month?.slice(0, 7) || '')
      setGoalId(initial.goal_id || '')
      setNotes(initial.notes || '')
    } else {
      setPlatform('')
      setType('MF')
      setInvestedAmount('')
      setCurrentValue('')
      setCurrency('INR')
      setMonth('')
      setGoalId('')
      setNotes('')
    }
  }, [initial, open])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      platform,
      type,
      invested_amount: parseFloat(investedAmount),
      current_value: parseFloat(currentValue),
      currency,
      month: month ? month + '-01' : undefined,
      goal_id: goalId || undefined,
      notes,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gold-gradient">{initial ? 'Edit Investment' : 'Add Investment'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Platform *</label>
            <input className="ff-input" value={platform} onChange={e => setPlatform(e.target.value)} required placeholder="e.g. Zerodha, Groww, Coinbase" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Type *</label>
              <select className="ff-input" value={type} onChange={e => setType(e.target.value)}>
                {INVESTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Currency</label>
              <select className="ff-input" value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Invested Amount *</label>
              <input className="ff-input" type="number" value={investedAmount} onChange={e => setInvestedAmount(e.target.value)} required placeholder="10000" min="0" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Current Value *</label>
              <input className="ff-input" type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} required placeholder="12000" min="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Month of Investment</label>
            <input className="ff-input" type="month" value={month} onChange={e => setMonth(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Linked Goal</label>
            <select className="ff-input" value={goalId} onChange={e => setGoalId(e.target.value)}>
              <option value="">No linked goal</option>
              {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Notes</label>
            <textarea className="ff-input min-h-[72px] resize-none" value={notes} onChange={e => setNotes(e.target.value)} placeholder="SIP, lump sum, strategy notes..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-gold flex-1">{initial ? 'Save Changes' : 'Add Investment'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InvestmentCard({
  inv,
  goals,
  onEdit,
  onDelete,
}: {
  inv: Investment
  goals: Goal[]
  onEdit: (i: Investment) => void
  onDelete: (id: string) => void
}) {
  const [showProjection, setShowProjection] = useState(false)
  const [projRate, setProjRate] = useState(12)

  const gain = inv.current_value - inv.invested_amount
  const gainPct = inv.invested_amount > 0 ? (gain / inv.invested_amount) * 100 : 0
  const xirr = calcXIRR(inv.invested_amount, inv.current_value, inv.month)
  const months = monthsInMarket(inv.month)
  const linkedGoal = goals.find(g => g.id === inv.goal_id)
  const isPositive = gain >= 0

  const typeColorClass = TYPE_COLORS[inv.type] || TYPE_COLORS.Other

  return (
    <div className="glass-card rounded-2xl p-5 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-white text-lg">{inv.platform}</h3>
            <span className={`chip text-xs ${typeColorClass}`}>{inv.type}</span>
            {linkedGoal && <span className="chip text-xs bg-slate-800 text-slate-400 border border-slate-700">Goal: {linkedGoal.name}</span>}
          </div>
          {inv.month && (
            <p className="text-xs text-slate-500">
              {new Date(inv.month).toLocaleDateString('en-AE', { month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => onEdit(inv)} className="btn-ghost px-2 py-1 text-xs flex items-center gap-1">
            <Edit2 size={13} /> Edit
          </button>
          <button
            onClick={() => onDelete(inv.id)}
            className="px-2 py-1 text-xs rounded-lg border border-red-800 text-red-400 hover:bg-red-900/30 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Invested</p>
          <p className="font-semibold text-white">{inv.currency} {inv.invested_amount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Current Value</p>
          <p className="font-semibold text-white">{inv.currency} {inv.current_value.toLocaleString()}</p>
        </div>
      </div>

      {/* Gain / XIRR row */}
      <div className="flex items-center gap-4 flex-wrap mb-3">
        <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
          <span className="font-bold text-sm">
            {isPositive ? '+' : ''}{inv.currency} {gain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-sm">({isPositive ? '+' : ''}{gainPct.toFixed(1)}%)</span>
        </div>
        <div className="text-sm">
          <span className="text-slate-500">XIRR: </span>
          <span className={xirr >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
            {xirr.toFixed(1)}%
          </span>
        </div>
        {months > 0 && (
          <span className="chip bg-slate-800 text-slate-400 border border-slate-700 text-xs">
            {months}mo in market
          </span>
        )}
      </div>

      {/* Context note */}
      <p className="text-xs text-slate-600 italic mb-3">{TYPE_NOTES[inv.type] || ''}</p>

      {/* Projection toggle */}
      <button
        onClick={() => setShowProjection(!showProjection)}
        className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
      >
        {showProjection ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {showProjection ? 'Hide projection' : 'Show projection'}
      </button>

      {showProjection && (
        <div className="mt-3 bg-slate-900/60 rounded-xl p-4 border border-slate-800">
          <div className="flex gap-2 mb-3">
            {PROJECTION_RATES.map(r => (
              <button
                key={r}
                onClick={() => setProjRate(r)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                  projRate === r
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    : 'border border-slate-700 text-slate-500 hover:text-slate-300'
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PROJECTION_YEARS.map(yr => {
              const val = inv.current_value * Math.pow(1 + projRate / 100, yr)
              return (
                <div key={yr} className="text-center">
                  <p className="text-xs text-slate-500 mb-0.5">{yr}yr</p>
                  <p className="text-sm font-semibold text-emerald-400">
                    {inv.currency} {(val / 1000).toFixed(0)}k
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editInv, setEditInv] = useState<Investment | null>(null)
  const [saving, setSaving] = useState(false)
  const [platformFilter, setPlatformFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [currencyFilter, setCurrencyFilter] = useState('All')

  async function fetchAll() {
    setLoading(true)
    try {
      const [invRes, goalRes] = await Promise.all([
        fetch('/financial_freedom/api/investments'),
        fetch('/financial_freedom/api/goals'),
      ])
      const invJson = await invRes.json()
      const goalJson = await goalRes.json()
      setInvestments(invJson.data || [])
      setGoals(goalJson.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const totalInvested = investments.reduce((s, i) => s + i.invested_amount, 0)
  const totalCurrent = investments.reduce((s, i) => s + i.current_value, 0)
  const overallGain = totalCurrent - totalInvested
  const overallGainPct = totalInvested > 0 ? (overallGain / totalInvested) * 100 : 0

  const platforms = ['All', ...Array.from(new Set(investments.map(i => i.platform)))]
  const types = ['All', ...INVESTMENT_TYPES.filter(t => investments.some(i => i.type === t))]
  const currencies = ['All', ...Array.from(new Set(investments.map(i => i.currency)))]

  const filtered = investments.filter(i => {
    if (platformFilter !== 'All' && i.platform !== platformFilter) return false
    if (typeFilter !== 'All' && i.type !== typeFilter) return false
    if (currencyFilter !== 'All' && i.currency !== currencyFilter) return false
    return true
  })

  async function handleSave(data: Partial<Investment>) {
    setSaving(true)
    try {
      if (editInv) {
        await fetch(`/financial_freedom/api/investments/${editInv.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        await fetch('/financial_freedom/api/investments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      setModalOpen(false)
      setEditInv(null)
      await fetchAll()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this investment?')) return
    await fetch(`/financial_freedom/api/investments/${id}`, { method: 'DELETE' })
    await fetchAll()
  }

  return (
    <div className="w-full px-8 py-8">
      {/* Header summary card */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Total Invested</p>
            <p className="text-xl font-bold text-white">AED {totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Current Value</p>
            <p className="text-xl font-bold text-white">AED {totalCurrent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Overall Return</p>
            <p className={`text-xl font-bold ${overallGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {overallGain >= 0 ? '+' : ''}{overallGainPct.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Page header + add button */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-white">Investments</h1>
        <div className="flex items-center gap-2">
          <EmailReportButton type="investments" />
          <button onClick={() => { setEditInv(null); setModalOpen(true) }} className="btn-gold flex items-center gap-2">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        {/* Platform filter */}
        <div className="flex gap-2 flex-wrap">
          {platforms.map(p => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`chip transition-all ${platformFilter === p ? 'chip-gold' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300'}`}
            >
              {p}
            </button>
          ))}
        </div>
        {/* Type + currency filters */}
        <div className="flex gap-2 flex-wrap items-center">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`chip transition-all ${typeFilter === t ? 'chip-blue' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300'}`}
            >
              {t}
            </button>
          ))}
          <div className="w-px h-4 bg-slate-700 mx-1" />
          {currencies.map(c => (
            <button
              key={c}
              onClick={() => setCurrencyFilter(c)}
              className={`chip transition-all ${currencyFilter === c ? 'chip-green' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Investment cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="glass-card rounded-2xl h-48 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-slate-500 text-lg mb-2">No investments found</p>
          <p className="text-slate-600 text-sm mb-6">Start tracking your wealth-building journey.</p>
          <button onClick={() => { setEditInv(null); setModalOpen(true) }} className="btn-gold inline-flex items-center gap-2">
            <Plus size={16} /> Add Investment
          </button>
        </div>
      ) : (
        filtered.map(inv => (
          <InvestmentCard
            key={inv.id}
            inv={inv}
            goals={goals}
            onEdit={i => { setEditInv(i); setModalOpen(true) }}
            onDelete={handleDelete}
          />
        ))
      )}

      <InvestmentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditInv(null) }}
        onSave={handleSave}
        initial={editInv}
        goals={goals}
      />

      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="glass-card rounded-xl px-8 py-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-slate-300">Saving...</p>
          </div>
        </div>
      )}
    </div>
  )
}
