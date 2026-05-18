'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Save, Eye, EyeOff } from 'lucide-react'

type Tab = 'profile' | 'game' | 'currency' | 'account'

interface UserProfile {
  name?: string
  email?: string
  yearly_income_aed?: number
  yearly_income_inr?: number
  monthly_takehome_aed?: number
  income_source?: string
  risk_tolerance?: string
  time_horizon?: string
  primary_motivation?: string
}

interface ExchangeRate {
  rate: number
  fetched_at: string
}

const INCOME_SOURCES = ['Salary', 'Self-employed', 'Mixed']

const RISK_OPTIONS = [
  { value: 'low', label: 'Low', desc: 'Capital preservation first. Minimal volatility. FDs, bonds, gold.' },
  { value: 'medium', label: 'Medium', desc: 'Balanced growth with some volatility. Mix of equity and debt.' },
  { value: 'high', label: 'High', desc: 'Aggressive growth. Can handle large swings. Equity-heavy.' },
]

const HORIZON_OPTIONS = [
  { value: 'short', label: 'Short', desc: '< 3 years. Near-term goals. Liquidity matters.' },
  { value: 'medium', label: 'Medium', desc: '3–10 years. Mid-term planning and compounding.' },
  { value: 'long', label: 'Long', desc: '10+ years. Long-term wealth building. Time is your edge.' },
]

const MOTIVATION_OPTIONS = [
  { value: 'freedom', label: 'Freedom', icon: '🕊️', desc: 'Stop trading time for money. Work optional.' },
  { value: 'family', label: 'Family Security', icon: '🏡', desc: 'Protect and provide for the people you love.' },
  { value: 'wealth', label: 'Wealth Growth', icon: '📈', desc: 'Build and multiply net worth aggressively.' },
]

function SavingsRateMeter({ rate }: { rate: number }) {
  const color = rate >= 30 ? 'bg-emerald-500' : rate >= 15 ? 'bg-amber-500' : 'bg-red-500'
  const label = rate >= 30 ? 'Excellent' : rate >= 15 ? 'Good' : 'Needs Work'
  const textColor = rate >= 30 ? 'text-emerald-400' : rate >= 15 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-sm text-slate-400">Savings Rate</p>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${textColor}`}>{rate.toFixed(1)}%</span>
          <span className={`chip text-xs ${rate >= 30 ? 'chip-green' : rate >= 15 ? 'chip-amber' : 'chip-red'}`}>{label}</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(rate, 100)}%` }} />
      </div>
      <p className="text-xs text-slate-600 mt-1">Target: &gt;30% for accelerated financial freedom</p>
    </div>
  )
}

function CardSelector<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; desc: string; icon?: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`text-left p-4 rounded-xl border transition-all ${
            value === opt.value
              ? 'border-yellow-500/70 bg-yellow-500/10 ring-1 ring-yellow-500/30'
              : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
          }`}
        >
          {opt.icon && <p className="text-2xl mb-2">{opt.icon}</p>}
          <p className={`font-semibold mb-1 ${value === opt.value ? 'text-yellow-400' : 'text-white'}`}>{opt.label}</p>
          <p className="text-xs text-slate-500">{opt.desc}</p>
        </button>
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState<UserProfile>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Exchange rate state
  const [rate, setRate] = useState<ExchangeRate | null>(null)
  const [rateLoading, setRateLoading] = useState(false)

  // Password change state
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  // Payments for savings rate calc
  const [essentialPayments, setEssentialPayments] = useState(0)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      try {
        const [profileRes, paymentsRes, rateRes] = await Promise.all([
          fetch('/financial_freedom/api/user/profile'),
          fetch('/financial_freedom/api/payments'),
          fetch('/financial_freedom/api/exchange-rate'),
        ])
        if (profileRes.ok) {
          const j = await profileRes.json()
          setProfile(j.data || {})
        }
        if (paymentsRes.ok) {
          const j = await paymentsRes.json()
          const essential = (j.data || [])
            .filter((p: { payment_type: string; status: string }) => p.payment_type === 'essential' && p.status !== 'paid')
            .reduce((s: number, p: { amount: number }) => s + p.amount, 0)
          setEssentialPayments(essential)
        }
        if (rateRes.ok) {
          const j = await rateRes.json()
          setRate({ rate: j.rate, fetched_at: j.fetched_at })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  async function fetchRate(force = false) {
    setRateLoading(true)
    try {
      const res = await fetch(`/financial_freedom/api/exchange-rate${force ? '?force=true' : ''}`)
      const j = await res.json()
      setRate({ rate: j.rate, fetched_at: j.fetched_at })
    } finally {
      setRateLoading(false)
    }
  }

  async function saveProfile() {
    setSaving(true)
    try {
      const res = await fetch('/financial_freedom/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } finally {
      setSaving(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) { setPwMsg('Passwords do not match'); return }
    if (newPw.length < 8) { setPwMsg('New password must be at least 8 characters'); return }
    setPwSaving(true)
    setPwMsg('')
    try {
      const res = await fetch('/financial_freedom/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const j = await res.json()
      if (j.error) { setPwMsg(j.error) } else { setPwMsg('Password changed successfully'); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
    } finally {
      setPwSaving(false)
    }
  }

  const income = profile.monthly_takehome_aed || 0
  const savingsRate = income > 0 ? Math.max(0, ((income - essentialPayments) / income) * 100) : 0

  const TABS: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'game', label: 'My Game' },
    { key: 'currency', label: 'Currency' },
    { key: 'account', label: 'Account' },
  ]

  if (loading) {
    return (
      <div className="w-full px-8 py-8">
        <div className="glass-card rounded-2xl h-96 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="w-full px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 bg-slate-900/60 border border-slate-800 rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white mb-2">Profile</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name</label>
              <input className="ff-input" value={profile.name || ''} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input className="ff-input" type="email" value={profile.email || ''} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Yearly Income (AED)</label>
              <input className="ff-input" type="number" value={profile.yearly_income_aed || ''} onChange={e => setProfile(p => ({ ...p, yearly_income_aed: parseFloat(e.target.value) }))} placeholder="360000" min="0" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Yearly Income (INR)</label>
              <input className="ff-input" type="number" value={profile.yearly_income_inr || ''} onChange={e => setProfile(p => ({ ...p, yearly_income_inr: parseFloat(e.target.value) }))} placeholder="1200000" min="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Monthly Take-home (AED)</label>
              <input className="ff-input" type="number" value={profile.monthly_takehome_aed || ''} onChange={e => setProfile(p => ({ ...p, monthly_takehome_aed: parseFloat(e.target.value) }))} placeholder="25000" min="0" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Income Source</label>
              <select className="ff-input" value={profile.income_source || 'Salary'} onChange={e => setProfile(p => ({ ...p, income_source: e.target.value }))}>
                {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <SavingsRateMeter rate={savingsRate} />

          <button onClick={saveProfile} disabled={saving} className="btn-gold flex items-center gap-2 mt-4 disabled:opacity-60">
            <Save size={15} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      )}

      {/* My Game tab */}
      {activeTab === 'game' && (
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white">My Investment Game</h2>

          <div>
            <label className="block text-sm text-slate-400 mb-3">Risk Tolerance</label>
            <CardSelector
              options={RISK_OPTIONS}
              value={(profile.risk_tolerance as 'low' | 'medium' | 'high') || 'medium'}
              onChange={v => setProfile(p => ({ ...p, risk_tolerance: v }))}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-3">Time Horizon</label>
            <CardSelector
              options={HORIZON_OPTIONS}
              value={(profile.time_horizon as 'short' | 'medium' | 'long') || 'long'}
              onChange={v => setProfile(p => ({ ...p, time_horizon: v }))}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-3">Primary Motivation</label>
            <CardSelector
              options={MOTIVATION_OPTIONS}
              value={(profile.primary_motivation as 'freedom' | 'family' | 'wealth') || 'freedom'}
              onChange={v => setProfile(p => ({ ...p, primary_motivation: v }))}
            />
          </div>

          <button onClick={saveProfile} disabled={saving} className="btn-gold flex items-center gap-2 disabled:opacity-60">
            <Save size={15} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save My Game'}
          </button>
        </div>
      )}

      {/* Currency tab */}
      {activeTab === 'currency' && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">AED → INR Exchange Rate</h2>

          {rate ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500 mb-2">Current Rate</p>
              <p className="text-5xl font-bold text-yellow-400 mb-2">
                ₹{rate.rate.toFixed(4)}
              </p>
              <p className="text-slate-500 mb-1">per 1 AED</p>
              <p className="text-xs text-slate-600 mb-8">
                Last updated: {new Date(rate.fetched_at).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 mb-6 text-sm text-left">
                <p className="text-slate-400 mb-1">Quick conversion</p>
                <div className="space-y-1">
                  {[1000, 5000, 10000, 50000].map(aed => (
                    <div key={aed} className="flex justify-between">
                      <span className="text-slate-500">AED {aed.toLocaleString()}</span>
                      <span className="text-white font-medium">₹ {(aed * rate.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => fetchRate(true)}
                disabled={rateLoading}
                className="btn-ghost flex items-center gap-2 mx-auto disabled:opacity-60"
              >
                <RefreshCw size={15} className={rateLoading ? 'animate-spin' : ''} />
                {rateLoading ? 'Refreshing...' : 'Refresh Rate'}
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <button onClick={() => fetchRate(true)} disabled={rateLoading} className="btn-gold flex items-center gap-2 mx-auto">
                <RefreshCw size={15} className={rateLoading ? 'animate-spin' : ''} />
                {rateLoading ? 'Fetching...' : 'Fetch Rate'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Account tab */}
      {activeTab === 'account' && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Change Password</h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Current Password</label>
              <div className="relative">
                <input
                  className="ff-input pr-10"
                  type={showPw ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  required
                  placeholder="Current password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">New Password</label>
              <input
                className="ff-input"
                type={showPw ? 'text' : 'password'}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                required
                placeholder="New password (min 8 chars)"
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Confirm New Password</label>
              <input
                className="ff-input"
                type={showPw ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                required
                placeholder="Repeat new password"
              />
            </div>

            {pwMsg && (
              <div className={`text-sm p-3 rounded-lg border ${pwMsg.includes('success') ? 'border-emerald-700/50 bg-emerald-950/30 text-emerald-400' : 'border-red-700/50 bg-red-950/30 text-red-400'}`}>
                {pwMsg}
              </div>
            )}

            <button type="submit" disabled={pwSaving} className="btn-gold flex items-center gap-2 disabled:opacity-60">
              <Save size={15} />
              {pwSaving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
