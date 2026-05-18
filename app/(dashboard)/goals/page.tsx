'use client'

import { useState, useEffect, useRef } from 'react'
import { Crown, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Upload, X, Check } from 'lucide-react'

interface GoalHistory {
  id: string
  changed_field: string
  old_value: string
  new_value: string
  created_at: string
}

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  currency: string
  target_date: string
  notes: string
  is_primary: boolean
  image_url?: string
  created_at: string
}

const CURRENCIES = ['INR', 'AED']
const RATES = [10, 12, 15]

function daysRemaining(dateStr: string) {
  const target = new Date(dateStr)
  const now = new Date()
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function calcProjection(current: number, rate: number, days: number): number {
  const years = days / 365
  if (years <= 0) return current
  return current * Math.pow(1 + rate / 100, years)
}

function gradientForName(name: string) {
  const colors = [
    'from-purple-900 to-blue-900',
    'from-emerald-900 to-teal-900',
    'from-amber-900 to-orange-900',
    'from-pink-900 to-rose-900',
    'from-indigo-900 to-violet-900',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

function GoalModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Goal>, file?: File) => void
  initial?: Goal | null
}) {
  const [name, setName] = useState(initial?.name || '')
  const [targetAmount, setTargetAmount] = useState(initial?.target_amount?.toString() || '')
  const [currency, setCurrency] = useState(initial?.currency || 'INR')
  const [targetDate, setTargetDate] = useState(initial?.target_date?.slice(0, 10) || '')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [isPrimary, setIsPrimary] = useState(initial?.is_primary || false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(initial?.image_url || null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setTargetAmount(initial.target_amount?.toString() || '')
      setCurrency(initial.currency || 'AED')
      setTargetDate(initial.target_date?.slice(0, 10) || '')
      setNotes(initial.notes || '')
      setIsPrimary(initial.is_primary || false)
      setPreview(initial.image_url || null)
    } else {
      setName('')
      setTargetAmount('')
      setCurrency('INR')
      setTargetDate('')
      setNotes('')
      setIsPrimary(false)
      setPreview(null)
    }
    setFile(null)
  }, [initial, open])

  if (!open) return null

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(
      {
        name,
        target_amount: parseFloat(targetAmount),
        currency,
        target_date: targetDate,
        notes,
        is_primary: isPrimary,
      },
      file || undefined
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gold-gradient">{initial ? 'Edit Goal' : 'Add Goal'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Goal Image</label>
            {preview ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden mb-2">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setPreview(null); setFile(null) }}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-yellow-500 hover:text-yellow-500 transition-colors"
              >
                <Upload size={20} className="mb-1" />
                <span className="text-sm">Upload image</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Goal Name *</label>
            <input className="ff-input" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Buy a House" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Target Amount *</label>
              <input className="ff-input" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required placeholder="500000" min="0" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Currency</label>
              <select className="ff-input" value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Target Date *</label>
            <input className="ff-input" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Notes</label>
            <textarea className="ff-input min-h-[80px] resize-none" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Why this goal matters..." />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsPrimary(!isPrimary)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isPrimary ? 'bg-yellow-500 border-yellow-500' : 'border-slate-600'}`}
            >
              {isPrimary && <Check size={12} className="text-black" />}
            </div>
            <span className="text-sm text-slate-300">Primary Goal <span className="text-slate-500">(your main focus)</span></span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-gold flex-1">
              {initial ? 'Save Changes' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: Goal
  onEdit: (g: Goal) => void
  onDelete: (id: string) => void
}) {
  const [selectedRate, setSelectedRate] = useState(12)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<GoalHistory[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const currentAmount = goal.current_amount || 0
  const progress = goal.target_amount > 0 ? Math.min((currentAmount / goal.target_amount) * 100, 100) : 0
  const days = goal.target_date ? daysRemaining(goal.target_date) : null
  const isOverdue = days !== null && days < 0
  const wealthMode = progress >= 80

  async function loadHistory() {
    if (historyLoaded) {
      setShowHistory(!showHistory)
      return
    }
    try {
      const res = await fetch(`/financial_freedom/api/goals/${goal.id}/history`)
      const json = await res.json()
      setHistory(json.data || [])
      setHistoryLoaded(true)
      setShowHistory(true)
    } catch {
      setShowHistory(!showHistory)
    }
  }

  const projectedValue = goal.target_date ? calcProjection(currentAmount, selectedRate, Math.max(days ?? 0, 0)) : null

  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-4">
      {/* Banner image or gradient */}
      {goal.image_url ? (
        <img src={goal.image_url} alt={goal.name} className="w-full object-cover block" style={{ height: '180px' }} />
      ) : (
        <div className={`w-full h-24 bg-gradient-to-r ${gradientForName(goal.name)} opacity-60`} />
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {goal.is_primary && (
              <span className="chip chip-gold flex items-center gap-1">
                <Crown size={11} /> Primary
              </span>
            )}
            {wealthMode && (
              <span className="chip chip-amber">Wealth Preservation Mode</span>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => onEdit(goal)} className="btn-ghost px-2 py-1 text-xs flex items-center gap-1">
              <Edit2 size={13} /> Edit
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="px-2 py-1 text-xs rounded-lg border border-red-800 text-red-400 hover:bg-red-900/30 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-4">{goal.name}</h3>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Progress</span>
            <span className="font-semibold text-yellow-400">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gold-gradient rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Amounts row */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Current</p>
            <p className="font-semibold text-white">
              {goal.currency} {currentAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Target</p>
            <p className="font-semibold text-white">
              {goal.currency} {goal.target_amount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-0.5">{isOverdue ? 'Overdue' : days !== null ? 'Remaining' : 'Deadline'}</p>
            <p className={`font-semibold ${isOverdue ? 'text-red-400' : 'text-slate-300'}`}>
              {days === null ? 'Not set' : isOverdue ? `${Math.abs(days)}d ago` : `${days}d`}
            </p>
          </div>
        </div>

        {/* Compounding projection — only show when target date is set */}
        {projectedValue !== null && (
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 mb-3">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Compounding Projection</p>
            <div className="flex gap-2 mb-3">
              {RATES.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRate(r)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedRate === r
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                      : 'border border-slate-700 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Projected value at target date</p>
              <p className="text-lg font-bold text-emerald-400">
                {goal.currency} {projectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                @ {selectedRate}% p.a. over {Math.max(days ?? 0, 0)} days
              </p>
            </div>
          </div>
        )}

        {/* History toggle */}
        <button
          onClick={loadHistory}
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
        >
          {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showHistory ? 'Hide history' : 'View history'}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2">
            {history.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No edit history yet.</p>
            ) : (
              history.map(h => (
                <div key={h.id} className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500">{new Date(h.created_at).toLocaleDateString()} — </span>
                    <span className="text-slate-400 capitalize">{h.changed_field.replace(/_/g, ' ')}</span>
                    <span className="text-slate-500"> changed from </span>
                    <span className="text-red-400">{h.old_value}</span>
                    <span className="text-slate-500"> to </span>
                    <span className="text-emerald-400">{h.new_value}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)
  const [saving, setSaving] = useState(false)

  async function fetchGoals() {
    setLoading(true)
    try {
      const res = await fetch('/financial_freedom/api/goals')
      const json = await res.json()
      setGoals(json.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGoals() }, [])

  async function handleSave(data: Partial<Goal>, file?: File) {
    setSaving(true)
    try {
      let savedId: string | null = null

      if (editGoal) {
        const res = await fetch(`/financial_freedom/api/goals/${editGoal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const json = await res.json()
        savedId = json.data?.id || editGoal.id
      } else {
        const res = await fetch('/financial_freedom/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const json = await res.json()
        savedId = json.data?.id
      }

      if (file && savedId) {
        const fd = new FormData()
        fd.append('file', file)
        await fetch(`/financial_freedom/api/goals/${savedId}/upload`, { method: 'POST', body: fd })
      }

      setModalOpen(false)
      setEditGoal(null)
      await fetchGoals()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this goal? This cannot be undone.')) return
    await fetch(`/financial_freedom/api/goals/${id}`, { method: 'DELETE' })
    await fetchGoals()
  }

  function openEdit(goal: Goal) {
    setEditGoal(goal)
    setModalOpen(true)
  }

  function openAdd() {
    setEditGoal(null)
    setModalOpen(true)
  }

  return (
    <div className="w-full px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Your Goals</h1>
          <p className="text-slate-500 text-sm">{goals.length} goal{goals.length !== 1 ? 's' : ''} defined</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2">
          <Plus size={16} /> Add Goal
        </button>
      </div>

      {/* Goals list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-slate-500 text-lg mb-2">No goals yet</p>
          <p className="text-slate-600 text-sm mb-6">Define what financial freedom means to you.</p>
          <button onClick={openAdd} className="btn-gold inline-flex items-center gap-2">
            <Plus size={16} /> Add Your First Goal
          </button>
        </div>
      ) : (
        goals.map(g => (
          <GoalCard key={g.id} goal={g} onEdit={openEdit} onDelete={handleDelete} />
        ))
      )}

      <GoalModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditGoal(null) }}
        onSave={handleSave}
        initial={editGoal}
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
