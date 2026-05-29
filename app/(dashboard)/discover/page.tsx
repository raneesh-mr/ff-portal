'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Mail, RefreshCw, Copy, Check } from 'lucide-react'

interface GoalStatus {
  goal: string
  status: 'on_track' | 'at_risk' | 'overdue'
  message: string
  percentage: number
}

interface WorkingItem {
  title: string
  detail: string
}

interface HoldingItem {
  title: string
  detail: string
  severity: 'high' | 'medium' | 'low'
}

interface NextAction {
  priority: number
  action: string
  impact: string
  timeline: string
}

interface AnalysisJson {
  whereYouStand: GoalStatus[]
  whatsWorking: WorkingItem[]
  holdingYouBack: HoldingItem[]
  nextActions: NextAction[]
}

interface Analysis {
  id: string
  analysis_json: AnalysisJson
  created_at: string
}

interface FinancialData {
  goals: { id: string; name: string; target_amount: number; currency: string; target_date: string; is_primary: boolean }[]
  investments: { platform: string; type: string; invested_amount: number; current_value: number; currency: string; goal_id: string | null }[]
  payments: { name: string; amount: number; currency: string; category: string; payment_type: string; status: string }[]
  profile: { yearly_income_aed?: number; yearly_income_inr?: number; monthly_takehome_aed?: number; risk_tolerance?: string } | null
  userName: string
}

const STATUS_COLORS: Record<string, string> = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  overdue: 'bg-red-500',
}

const STATUS_LABELS: Record<string, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  overdue: 'Overdue',
}

const SEVERITY_COLORS: Record<string, string> = {
  high: 'border-red-700/50 bg-red-950/30',
  medium: 'border-amber-700/50 bg-amber-950/30',
  low: 'border-slate-700 bg-slate-900/30',
}

const SEVERITY_BADGE: Record<string, string> = {
  high: 'chip-red',
  medium: 'chip-amber',
  low: 'bg-slate-800 text-slate-400 border border-slate-700',
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-5 mb-4 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-5/6" />
        <div className="h-3 bg-slate-800 rounded w-4/6" />
      </div>
    </div>
  )
}

function CollapsibleSection({
  title,
  badge,
  badgeColor,
  defaultOpen = true,
  children,
}: {
  title: string
  badge?: string | number
  badgeColor?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-white">{title}</h3>
          {badge !== undefined && (
            <span className={`chip text-xs ${badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700'}`}>{badge}</span>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}

export default function DiscoverPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [analysing, setAnalysing] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [error, setError] = useState('')
  const [copying, setCopying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)

  async function fetchLast() {
    setLoading(true)
    try {
      const [analysisRes, goalsRes, invRes, paymentsRes, profileRes, rateRes] = await Promise.all([
        fetch('/api/ai-analysis'),
        fetch('/api/goals'),
        fetch('/api/investments'),
        fetch('/api/payments'),
        fetch('/api/user/profile'),
        fetch('/api/exchange-rate'),
      ])
      const [analysisJson, goalsJson, invJson, paymentsJson, profileJson, rateJson] = await Promise.all([
        analysisRes.json(), goalsRes.json(), invRes.json(),
        paymentsRes.json(), profileRes.json(), rateRes.json(),
      ])
      setAnalysis(analysisJson.data || null)
      setFinancialData({
        goals: goalsJson.data || [],
        investments: invJson.data || [],
        payments: paymentsJson.data || [],
        profile: profileJson.data || null,
        userName: rateJson.userName || 'User',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLast() }, [])

  async function handleAnalyse() {
    setAnalysing(true)
    setError('')
    try {
      const res = await fetch('/api/ai-analysis', { method: 'POST' })
      const json = await res.json()
      if (json.error) {
        setError(json.error + (json.detail ? ': ' + json.detail : ''))
      } else {
        setAnalysis(json.data || null)
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setAnalysing(false)
    }
  }

  async function handleCopyPrompt() {
    if (!financialData) return
    setCopying(true)
    try {
      const { goals, investments, payments, profile, userName } = financialData
      const totalInvested = investments.reduce((s, i) => s + i.invested_amount, 0)
      const totalCurrent = investments.reduce((s, i) => s + i.current_value, 0)
      const gainPct = totalInvested > 0 ? (((totalCurrent - totalInvested) / totalInvested) * 100).toFixed(1) : '0'

      const fmt = (n: number, cur: string) => {
        const sym = cur === 'INR' ? '₹' : 'AED '
        if (n >= 10000000) return `${sym}${(n / 10000000).toFixed(1)}Cr`
        if (n >= 100000) return `${sym}${(n / 100000).toFixed(1)}L`
        if (n >= 1000) return `${sym}${(n / 1000).toFixed(1)}K`
        return `${sym}${n.toFixed(0)}`
      }

      const goalLines = goals.map(g => {
        const linked = investments.filter(i => i.goal_id === g.id)
        const goalCurrent = linked.reduce((s, i) => s + i.current_value, 0)
        const goalPct = g.target_amount > 0 && goalCurrent > 0
          ? Math.min((goalCurrent / g.target_amount) * 100, 100).toFixed(1)
          : null
        const linkedStr = linked.length > 0
          ? ` | Linked: ${linked.map(i => i.platform).join(', ')} = ${fmt(goalCurrent, g.currency)} current`
          : ' | No investments linked'
        const progressStr = goalPct
          ? ` | Progress: ${goalPct}% (${fmt(goalCurrent, g.currency)} of ${fmt(g.target_amount, g.currency)})`
          : ' | Progress: 0%'
        return `• ${g.name} — Target ${fmt(g.target_amount, g.currency)} by ${new Date(g.target_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}${g.is_primary ? ' (Primary)' : ''}${progressStr}${linkedStr}`
      }).join('\n')

      const invLines = investments.map(i => {
        const gain = i.current_value - i.invested_amount
        const platformLabel = i.platform.toLowerCase().includes(i.type.toLowerCase()) ? i.platform : `${i.platform} (${i.type})`
        return `• ${platformLabel} — Invested ${fmt(i.invested_amount, i.currency)} | Current ${fmt(i.current_value, i.currency)} | ${gain >= 0 ? 'Gain' : 'Loss'} ${fmt(Math.abs(gain), i.currency)}`
      }).join('\n')

      const payLines = payments.length > 0
        ? payments.map(p => `• ${p.name} — ${p.currency === 'INR' ? '₹' : 'AED '}${p.amount.toLocaleString()} (${p.payment_type}, ${p.status})`).join('\n')
        : '• None recorded'

      const prompt = `You are a personal financial freedom advisor for ${userName}.

Analyze the financial data below and write a clear, conversational report. Use headings, bullet points, and plain English. No JSON. Write as if you're a trusted advisor presenting findings in a meeting.

--- FINANCIAL DATA ---
Total Portfolio: AED ${Number(totalCurrent).toLocaleString()} (invested: AED ${Number(totalInvested).toLocaleString()} | gain: ${gainPct}%)
Monthly Take-home: AED ${profile?.monthly_takehome_aed?.toLocaleString() ?? 'Not set'} | Risk Tolerance: ${profile?.risk_tolerance ?? 'Not set'}

GOALS:
${goalLines}

INVESTMENTS:
${invLines}

MONTHLY PAYMENTS:
${payLines}

INCOME: ${profile?.yearly_income_aed ? `AED ${profile.yearly_income_aed.toLocaleString()}/year` : 'Not set'} | AED ${profile?.monthly_takehome_aed?.toLocaleString() ?? '—'}/month take-home
--- END OF DATA ---

Write your report with these sections:
1. **Where You Stand** — assess each goal: on track, at risk, or behind. Include % progress estimate and time left.
2. **What's Working** — 3 specific positives with platform names and numbers.
3. **What's Holding You Back** — 3 specific risks or gaps with real numbers. Flag severity.
4. **Your 3 Next Actions** — prioritised steps with exact amounts, platforms, and timelines.
5. **One-Line Wealth Verdict** — a single honest sentence summarising where ${userName} stands today.

Be direct, specific, and use the actual platform names and amounts throughout.`

      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } finally {
      setCopying(false)
    }
  }

  async function handleSendEmail() {
    setEmailSending(true)
    try {
      await fetch('/api/send-summary', { method: 'POST' })
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 4000)
    } finally {
      setEmailSending(false)
    }
  }

  const ai = analysis?.analysis_json

  return (
    <div className="w-full px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="text-yellow-400" size={24} />
          <h1 className="text-3xl font-bold text-white">Discover My Freedom</h1>
          <Sparkles className="text-yellow-400" size={24} />
        </div>
        <p className="text-slate-400 text-sm">AI-powered analysis of your complete financial picture</p>
        {analysis?.created_at && (
          <p className="text-slate-600 text-xs mt-1">
            Last analysed: {new Date(analysis.created_at).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        )}
      </div>

      {/* Buttons row */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleAnalyse}
          disabled={analysing}
          className="btn-gold flex-1 py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {analysing ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
              Analysing...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              {analysis ? 'Re-analyse Now' : 'Analyse Now'}
            </>
          )}
        </button>
        <button
          onClick={handleCopyPrompt}
          disabled={copying}
          className="btn-ghost py-4 px-5 flex items-center justify-center gap-2 disabled:opacity-60 flex-shrink-0"
          title="Copy prompt to use in ChatGPT, Claude, or any other AI"
        >
          {copied ? (
            <><Check size={16} className="text-emerald-400" /><span className="text-emerald-400 text-sm font-medium">Copied!</span></>
          ) : copying ? (
            <><div className="animate-spin w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full" /><span className="text-sm">Loading...</span></>
          ) : (
            <><Copy size={16} /><span className="text-sm font-medium">Copy Prompt</span></>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-700/50 bg-red-950/30 p-4 mb-6 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {(loading || analysing) && (
        <div>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Results */}
      {!loading && !analysing && ai && (
        <>
          {/* Where You Stand */}
          {ai.whereYouStand && ai.whereYouStand.length > 0 && (
            <CollapsibleSection title="Where You Stand" badge={ai.whereYouStand.length} badgeColor="chip-blue">
              <div className="space-y-3">
                {ai.whereYouStand.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${STATUS_COLORS[item.status] || 'bg-slate-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-white text-sm">{item.goal}</p>
                        <span className={`chip text-xs ${item.status === 'on_track' ? 'chip-green' : item.status === 'at_risk' ? 'chip-amber' : 'chip-red'}`}>
                          {STATUS_LABELS[item.status] || item.status}
                        </span>
                        {item.percentage !== undefined && (
                          <span className="text-xs text-slate-500">{item.percentage}%</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{item.message}</p>
                      {item.percentage !== undefined && (
                        <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${STATUS_COLORS[item.status] || 'bg-slate-500'}`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* What's Working */}
          {ai.whatsWorking && ai.whatsWorking.length > 0 && (
            <CollapsibleSection title="What's Working" badge={ai.whatsWorking.length} badgeColor="chip-green">
              <div className="space-y-3">
                {ai.whatsWorking.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border border-emerald-800/40 bg-emerald-950/20">
                    <p className="font-semibold text-emerald-300 mb-1">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* What's Holding You Back */}
          {ai.holdingYouBack && ai.holdingYouBack.length > 0 && (
            <CollapsibleSection title="What's Holding You Back" badge={ai.holdingYouBack.length} badgeColor="chip-amber">
              <div className="space-y-3">
                {ai.holdingYouBack.map((item, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${SEVERITY_COLORS[item.severity] || SEVERITY_COLORS.low}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">{item.title}</p>
                      <span className={`chip text-xs ${SEVERITY_BADGE[item.severity] || ''}`}>
                        {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Next Actions */}
          {ai.nextActions && ai.nextActions.length > 0 && (
            <CollapsibleSection title="Your 3 Next Actions" badge="Action Plan" badgeColor="chip-gold">
              <div className="space-y-3">
                {ai.nextActions.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border border-yellow-800/40 bg-yellow-950/10">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-sm font-bold text-yellow-400 flex-shrink-0">
                        {item.priority}
                      </span>
                      <div>
                        <p className="font-semibold text-white mb-1">{item.action}</p>
                        <p className="text-sm text-emerald-400 mb-0.5">{item.impact}</p>
                        <p className="text-xs text-slate-500">{item.timeline}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Send to email */}
          <div className="text-center mt-6">
            <button
              onClick={handleSendEmail}
              disabled={emailSending || emailSent}
              className="btn-ghost inline-flex items-center gap-2 px-6 py-2 disabled:opacity-60"
            >
              <Mail size={16} />
              {emailSent ? 'Sent!' : emailSending ? 'Sending...' : 'Send to Email'}
            </button>
            <p className="text-xs text-slate-600 mt-4">
              Your financial data is private and never stored beyond your account. AI analysis uses Gemini and is not financial advice.
            </p>
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && !analysing && !ai && !error && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Sparkles className="text-slate-600 mx-auto mb-4" size={40} />
          <p className="text-slate-400 text-lg mb-2">No analysis yet</p>
          <p className="text-slate-600 text-sm">Click "Analyse Now" to get your personalised financial freedom report.</p>
        </div>
      )}
    </div>
  )
}
