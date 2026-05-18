'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, X } from 'lucide-react'
import EmailReportButton from '@/components/EmailReportButton'

interface Payment {
  id: string
  name: string
  amount: number
  currency: string
  due_date: string
  category: string
  payment_type: string
  status: string
  is_recurring: boolean
  icon: string
  notes?: string
}

interface UserProfile {
  monthly_takehome_aed?: number
}

const CATEGORIES = ['Credit Card', 'Loan', 'EMI', 'Subscription', 'Utility', 'Other']
const PAYMENT_TYPES = ['essential', 'lifestyle', 'discretionary']
const EMOJIS = ['💳', '🏦', '📺', '💡', '📅', '🚗', '🏠', '🛒']
const STATUS_TABS = ['All', 'Due', 'Overdue', 'Paid']
const CATEGORY_CHIPS = ['Essential', 'Lifestyle', 'Discretionary']

const TYPE_COLORS: Record<string, string> = {
  essential: 'chip-red',
  lifestyle: 'chip-amber',
  discretionary: 'chip-blue',
}

const STATUS_COLORS: Record<string, string> = {
  Due: 'chip-amber',
  Overdue: 'chip-red',
  Paid: 'chip-green',
}

function daysDue(dateStr: string) {
  const due = new Date(dateStr)
  const now = new Date()
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function computeStatus(payment: Payment): string {
  if (payment.status === 'paid' || payment.status === 'Paid') return 'Paid'
  const d = daysDue(payment.due_date)
  if (d < 0) return 'Overdue'
  return 'Due'
}

function PaymentModal({
  open,
  onClose,
  onSave,
  initial,
  error,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Payment>) => void
  initial?: Payment | null
  error?: string
}) {
  const [name, setName] = useState(initial?.name || '')
  const [amount, setAmount] = useState(initial?.amount?.toString() || '')
  const [currency, setCurrency] = useState(initial?.currency || 'INR')
  const [dueDate, setDueDate] = useState(initial?.due_date?.slice(0, 10) || '')
  const [category, setCategory] = useState(initial?.category || 'Credit Card')
  const [paymentType, setPaymentType] = useState(initial?.payment_type || 'essential')
  const [isRecurring, setIsRecurring] = useState(initial?.is_recurring || false)
  const [icon, setIcon] = useState(initial?.icon || '💳')
  const [notes, setNotes] = useState(initial?.notes || '')

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setAmount(initial.amount?.toString() || '')
      setCurrency(initial.currency || 'AED')
      setDueDate(initial.due_date?.slice(0, 10) || '')
      setCategory(initial.category || 'Credit Card')
      setPaymentType(initial.payment_type || 'essential')
      setIsRecurring(initial.is_recurring || false)
      setIcon(initial.icon || '💳')
      setNotes(initial.notes || '')
    } else {
      setName('')
      setAmount('')
      setCurrency('INR')
      setDueDate('')
      setCategory('Credit Card')
      setPaymentType('essential')
      setIsRecurring(false)
      setIcon('💳')
      setNotes('')
    }
  }, [initial, open])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ name, amount: parseFloat(amount), currency, due_date: dueDate, category, payment_type: paymentType, is_recurring: isRecurring, icon, notes })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gold-gradient">{initial ? 'Edit Payment' : 'Add Payment'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon picker */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${icon === e ? 'bg-yellow-500/30 border border-yellow-500' : 'bg-slate-800 border border-slate-700 hover:border-slate-500'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Name *</label>
            <input className="ff-input" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Netflix, HDFC Credit Card" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Amount *</label>
              <input className="ff-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="500" min="0" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Currency</label>
              <select className="ff-input" value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="AED">AED</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Due Date *</label>
            <input className="ff-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Category</label>
              <select className="ff-input" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Type</label>
              <select className="ff-input" value={paymentType} onChange={e => setPaymentType(e.target.value)}>
                {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
            <span className="text-sm text-slate-300">Recurring monthly payment</span>
          </label>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Notes</label>
            <textarea className="ff-input min-h-[64px] resize-none" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." />
          </div>

          {error && (
            <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-gold flex-1">{initial ? 'Save Changes' : 'Add Payment'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PaymentCard({
  payment,
  surplus,
  onEdit,
  onDelete,
  onMarkPaid,
}: {
  payment: Payment
  surplus: number
  onEdit: (p: Payment) => void
  onDelete: (id: string) => void
  onMarkPaid: (id: string) => void
}) {
  const status = computeStatus(payment)
  const days = daysDue(payment.due_date)
  const freedomCost = surplus > 0 ? Math.round((payment.amount / surplus) * 30) : null

  return (
    <div className="glass-card rounded-2xl p-5 mb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0 mt-0.5">{payment.icon || '💳'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-white">{payment.name}</h3>
              <span className={`chip text-xs ${STATUS_COLORS[status] || 'chip-amber'}`}>{status}</span>
              <span className={`chip text-xs ${TYPE_COLORS[payment.payment_type] || 'chip'}`}>
                {payment.payment_type?.charAt(0).toUpperCase() + payment.payment_type?.slice(1)}
              </span>
              {payment.is_recurring && <span className="chip text-xs bg-slate-800 text-slate-400 border border-slate-700">Recurring</span>}
            </div>

            <div className="flex items-center gap-3 text-sm flex-wrap">
              <span className="font-bold text-lg text-white">{payment.currency} {payment.amount.toLocaleString()}</span>
              <span className="text-slate-500">
                {status === 'Overdue'
                  ? `${Math.abs(days)} days overdue`
                  : status === 'Paid'
                  ? 'Paid'
                  : days === 0
                  ? 'Due today'
                  : `Due in ${days} day${days !== 1 ? 's' : ''}`}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="chip text-xs bg-slate-800 text-slate-500 border border-slate-700">{payment.category}</span>
              {freedomCost !== null && freedomCost > 0 && (
                <span className="text-xs text-amber-500">= {freedomCost} days to goal delayed</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {status !== 'Paid' && (
            <button
              onClick={() => onMarkPaid(payment.id)}
              className="px-2 py-1 text-xs rounded-lg bg-emerald-900/40 border border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/60 flex items-center gap-1 transition-colors"
            >
              <CheckCircle size={12} /> Paid
            </button>
          )}
          <button onClick={() => onEdit(payment)} className="btn-ghost px-2 py-1 text-xs flex items-center gap-1">
            <Edit2 size={12} /> Edit
          </button>
          <button
            onClick={() => onDelete(payment.id)}
            className="px-2 py-1 text-xs rounded-lg border border-red-800 text-red-400 hover:bg-red-900/30 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={12} /> Del
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editPayment, setEditPayment] = useState<Payment | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [statusTab, setStatusTab] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [surplus, setSurplus] = useState(0)

  async function fetchAll() {
    setLoading(true)
    try {
      const [pRes, profileRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/user/profile'),
      ])
      const pJson = await pRes.json()
      setPayments(pJson.data || [])
      if (profileRes.ok) {
        const profileJson = await profileRes.json()
        const profile: UserProfile = profileJson.data || {}
        const income = profile.monthly_takehome_aed || 0
        const essentialTotal = (pJson.data || [])
          .filter((p: Payment) => p.payment_type === 'essential' && p.status !== 'paid')
          .reduce((s: number, p: Payment) => s + p.amount, 0)
        setSurplus(Math.max(0, income - essentialTotal))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Summary stats
  const dueTotal = payments
    .filter(p => computeStatus(p) !== 'Paid')
    .reduce((s, p) => s + p.amount, 0)

  const essentialTotal = payments.filter(p => p.payment_type === 'essential').reduce((s, p) => s + p.amount, 0)
  const lifestyleTotal = payments.filter(p => p.payment_type === 'lifestyle').reduce((s, p) => s + p.amount, 0)
  const discretionaryTotal = payments.filter(p => p.payment_type === 'discretionary').reduce((s, p) => s + p.amount, 0)
  const grandTotal = essentialTotal + lifestyleTotal + discretionaryTotal

  // Filter
  const filtered = payments.filter(p => {
    const status = computeStatus(p)
    if (statusTab !== 'All' && status !== statusTab) return false
    if (categoryFilter !== 'All') {
      const typeMap: Record<string, string> = { Essential: 'essential', Lifestyle: 'lifestyle', Discretionary: 'discretionary' }
      if (p.payment_type !== typeMap[categoryFilter]) return false
    }
    return true
  })

  async function handleSave(data: Partial<Payment>) {
    setSaving(true)
    setSaveError('')
    try {
      let res: Response
      if (editPayment) {
        res = await fetch(`/api/payments/${editPayment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, status: 'due' }),
        })
      }
      const json = await res.json()
      if (!res.ok) {
        setSaveError(json.error || 'Save failed. Check your database.')
        return
      }
      setModalOpen(false)
      setEditPayment(null)
      await fetchAll()
    } catch (e) {
      setSaveError(String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this payment?')) return
    await fetch(`/api/payments/${id}`, { method: 'DELETE' })
    await fetchAll()
  }

  async function handleMarkPaid(id: string) {
    await fetch(`/api/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    })
    await fetchAll()
  }

  return (
    <div className="w-full px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Payments</h1>
          <p className="text-slate-500 text-sm">
            Due this month: <span className="text-red-400 font-semibold">AED {dueTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EmailReportButton type="payments" />
          <button onClick={() => { setEditPayment(null); setModalOpen(true) }} className="btn-gold flex items-center gap-2">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Monthly breakdown bar */}
      {grandTotal > 0 && (
        <div className="glass-card rounded-2xl p-4 mb-6">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Monthly Breakdown</p>
          <div className="flex rounded-lg overflow-hidden h-6 mb-3">
            {essentialTotal > 0 && (
              <div
                className="bg-red-600 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(essentialTotal / grandTotal) * 100}%` }}
              >
                {((essentialTotal / grandTotal) * 100).toFixed(0)}%
              </div>
            )}
            {lifestyleTotal > 0 && (
              <div
                className="bg-amber-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(lifestyleTotal / grandTotal) * 100}%` }}
              >
                {((lifestyleTotal / grandTotal) * 100).toFixed(0)}%
              </div>
            )}
            {discretionaryTotal > 0 && (
              <div
                className="bg-blue-600 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(discretionaryTotal / grandTotal) * 100}%` }}
              >
                {((discretionaryTotal / grandTotal) * 100).toFixed(0)}%
              </div>
            )}
          </div>
          <div className="flex gap-4 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-600" />
              <span className="text-slate-400">Essential <span className="text-white font-medium">AED {essentialTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span className="text-slate-400">Lifestyle <span className="text-white font-medium">AED {lifestyleTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
              <span className="text-slate-400">Discretionary <span className="text-white font-medium">AED {discretionaryTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map(t => (
          <button
            key={t}
            onClick={() => setStatusTab(t)}
            className={`chip transition-all ${statusTab === t ? (t === 'Overdue' ? 'chip-red' : t === 'Paid' ? 'chip-green' : 'chip-gold') : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setCategoryFilter('All')}
          className={`chip transition-all ${categoryFilter === 'All' ? 'chip-gold' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300'}`}
        >
          All Types
        </button>
        {CATEGORY_CHIPS.map(c => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`chip transition-all ${categoryFilter === c ? (c === 'Essential' ? 'chip-red' : c === 'Lifestyle' ? 'chip-amber' : 'chip-blue') : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Payment cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="glass-card rounded-2xl h-28 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-slate-500 text-lg mb-2">No payments found</p>
          <p className="text-slate-600 text-sm mb-6">Track your bills, EMIs, and subscriptions.</p>
          <button onClick={() => { setEditPayment(null); setModalOpen(true) }} className="btn-gold inline-flex items-center gap-2">
            <Plus size={16} /> Add Payment
          </button>
        </div>
      ) : (
        filtered.map(p => (
          <PaymentCard
            key={p.id}
            payment={p}
            surplus={surplus}
            onEdit={pay => { setEditPayment(pay); setModalOpen(true) }}
            onDelete={handleDelete}
            onMarkPaid={handleMarkPaid}
          />
        ))
      )}

      <PaymentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditPayment(null); setSaveError('') }}
        onSave={handleSave}
        initial={editPayment}
        error={saveError}
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
