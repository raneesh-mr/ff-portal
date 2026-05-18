'use client'
import { useEffect, useState } from 'react'
import { formatCompact, calcXIRR, monthsBetween } from '@/lib/utils'
import { Goal, Investment, Payment } from '@/types'
import EmailReportButton from '@/components/EmailReportButton'

interface DashboardData {
  goals: Goal[]
  investments: Investment[]
  payments: Payment[]
  exchangeRate: number
  userName: string
}

const GOAL_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6']

function formatTimeLeft(targetDate: string): string {
  const now = new Date()
  const target = new Date(targetDate)
  const totalMonths = Math.max(
    0,
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  )
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  if (years === 0) return `${months} mo`
  if (months === 0) return `${years} yr${years !== 1 ? 's' : ''}`
  return `${years} yr${years !== 1 ? 's' : ''} ${months} mo`
}

function monthsUntil(targetDate: string): number {
  const now = new Date()
  const target = new Date(targetDate)
  return Math.max(
    0,
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  )
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [currency, setCurrency] = useState<'AED' | 'INR'>('INR')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [goalsRes, invRes, payRes, rateRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/investments'),
        fetch('/api/payments'),
        fetch('/api/exchange-rate'),
      ])
      const [goals, investments, payments, rateData] = await Promise.all([
        goalsRes.json(), invRes.json(), payRes.json(), rateRes.json(),
      ])
      setData({
        goals: goals.data || [],
        investments: investments.data || [],
        payments: payments.data || [],
        exchangeRate: rateData.rate || 24,
        userName: rateData.userName || 'Raneesh',
      })
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
  const totalCurrent  = data?.investments.reduce((s, i) => s + convert(i.current_value,   i.currency), 0) || 0
  const totalGain     = totalCurrent - totalInvested
  const gainPct       = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
  const totalTarget   = data?.goals.reduce((s, g) => s + convert(g.target_amount, g.currency), 0) || 0
  const overallPct    = totalTarget > 0 ? Math.min((totalCurrent / totalTarget) * 100, 100) : 0
  const gap           = Math.max(totalTarget - totalCurrent, 0)

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Shared inline style tokens
  const card:  React.CSSProperties = { background: '#111827', border: '0.5px solid #1E2A3A', borderRadius: '12px', padding: '16px' }
  const tile:  React.CSSProperties = { background: '#0D1420', border: '0.5px solid #1E2A3A', borderRadius: '8px', padding: '10px' }
  const lbl:   React.CSSProperties = { fontSize: '10px', color: '#64748B', marginBottom: '3px' }
  const val:   React.CSSProperties = { fontSize: '15px', fontWeight: 500, color: '#F8FAFC' }
  const sub:   React.CSSProperties = { fontSize: '10px', color: '#475569' }
  const div14: React.CSSProperties = { borderTop: '0.5px solid #1E2A3A', margin: '14px 0' }
  const secLbl:React.CSSProperties = { fontSize: '11px', fontWeight: 500, color: '#64748B', letterSpacing: '0.05em' }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid #C9A84C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#64748B', fontSize: '13px' }}>Loading...</p>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>{greeting},</div>
          <div style={{ fontSize: '20px', fontWeight: 500, color: '#F8FAFC' }}>{data?.userName || 'Raneesh'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EmailReportButton type="dashboard" />
          <button
            onClick={() => setCurrency(c => c === 'AED' ? 'INR' : 'AED')}
            style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '0.5px solid #1E2A3A', color: '#94A3B8', background: 'transparent', cursor: 'pointer' }}
          >
            {currency} view
          </button>
        </div>
      </div>

      {/* ── Main card: KPIs + Overall Progress + Goals ── */}
      <div style={card}>

        {/* 4 KPI Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <div style={tile}>
            <div style={lbl}>Total target</div>
            <div style={val}>{formatCompact(totalTarget, currency)}</div>
            <div style={sub}>{data?.goals.length || 0} goal{(data?.goals.length || 0) !== 1 ? 's' : ''}</div>
          </div>
          <div style={tile}>
            <div style={lbl}>Invested</div>
            <div style={val}>{formatCompact(totalInvested, currency)}</div>
            <div style={sub}>capital deployed</div>
          </div>
          <div style={tile}>
            <div style={lbl}>Current value</div>
            <div style={val}>{formatCompact(totalCurrent, currency)}</div>
            <div style={sub}>market value</div>
          </div>
          <div style={tile}>
            <div style={lbl}>Profit</div>
            <div style={{ ...val, color: totalGain >= 0 ? '#10B981' : '#EF4444' }}>
              {totalGain >= 0 ? '+' : ''}{formatCompact(totalGain, currency)}
            </div>
            <div style={{ ...sub, color: totalGain >= 0 ? '#10B981' : '#EF4444' }}>
              {totalGain >= 0 ? '+' : ''}{gainPct.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div style={{ ...tile, marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <div style={secLbl}>
              OVERALL PROGRESS — {formatCompact(totalCurrent, currency)} of {formatCompact(totalTarget, currency)}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#F8FAFC' }}>{overallPct.toFixed(1)}%</div>
          </div>

          {/* Segmented bar */}
          <div style={{ position: 'relative', height: '28px', background: '#1E2A3A', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' }}>
            {(() => {
              let offset = 0
              return data?.goals.map((goal, idx) => {
                const linkedInv  = data.investments.filter(i => i.goal_id === goal.id)
                const goalCurrent = linkedInv.reduce((s, i) => s + convert(i.current_value, i.currency), 0)
                const segW = totalTarget > 0 ? (goalCurrent / totalTarget) * 100 : 0
                const left = offset
                offset += segW
                const color = GOAL_COLORS[idx % GOAL_COLORS.length]
                return segW > 0 ? (
                  <div key={goal.id} style={{ position: 'absolute', left: `${left}%`, top: 0, height: '100%', width: `${segW}%`, background: color, display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                    {idx === 0 && <span style={{ fontSize: '10px', color: '#fff', whiteSpace: 'nowrap' }}>{goal.name.split(' ')[0]}</span>}
                  </div>
                ) : null
              })
            })()}
            {gap > 0 && (
              <div style={{ position: 'absolute', right: '8px', top: 0, height: '100%', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: '#475569' }}>{formatCompact(gap, currency)} remaining</span>
              </div>
            )}
          </div>

          {/* Legend — Gap only */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', background: '#1E2A3A', borderRadius: '3px', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#64748B' }}>Gap — {formatCompact(gap, currency)} to go</span>
          </div>
        </div>

        {/* Per-goal rows */}
        {data?.goals.map((goal, idx) => {
          const color       = GOAL_COLORS[idx % GOAL_COLORS.length]
          const linkedInv   = data.investments.filter(i => i.goal_id === goal.id)
          const goalCurrent = linkedInv.reduce((s, i) => s + convert(i.current_value, i.currency), 0)
          const goalTarget  = convert(goal.target_amount, goal.currency)
          const goalPct     = goalTarget > 0 ? Math.min((goalCurrent / goalTarget) * 100, 100) : 0
          const timeLeft    = goal.target_date ? formatTimeLeft(goal.target_date) : null
          const monthsLeft  = goal.target_date ? monthsUntil(goal.target_date) : null
          const needPerMonth = (monthsLeft && monthsLeft > 0) ? (goalTarget - goalCurrent) / monthsLeft : null

          return (
            <div key={goal.id}>
              <div style={div14} />

              {/* Goal header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: color, borderRadius: '3px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#F8FAFC' }}>{goal.name}</span>
                  {goal.target_date && (
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      by {new Date(goal.target_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, color }}>{goalPct.toFixed(0)}%</span>
              </div>

              {/* Goal progress bar */}
              <div style={{ height: '6px', background: '#1E2A3A', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: `${goalPct}%`, height: '100%', background: color, borderRadius: '4px' }} />
              </div>

              {/* 4 sub-tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                <div style={tile}>
                  <div style={lbl}>Target</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#F8FAFC' }}>{formatCompact(goalTarget, currency)}</div>
                </div>
                <div style={tile}>
                  <div style={lbl}>Current</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#F8FAFC' }}>{formatCompact(goalCurrent, currency)}</div>
                </div>
                <div style={tile}>
                  <div style={lbl}>Time left</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#F8FAFC' }}>{timeLeft || 'Not set'}</div>
                </div>
                <div style={tile}>
                  <div style={lbl}>Need / month</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: needPerMonth !== null ? '#F59E0B' : '#475569' }}>
                    {needPerMonth !== null ? formatCompact(needPerMonth, currency) : '—'}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

      </div>

      {/* ── Investment Breakdown ── */}
      {data && data.investments.length > 0 && (
        <div style={card}>
          <div style={{ ...secLbl, marginBottom: '12px' }}>INVESTMENT BREAKDOWN</div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '6px', padding: '0 6px', marginBottom: '6px' }}>
            {['Platform', 'Invested', 'Current', 'P / L', 'XIRR'].map((h, i) => (
              <div key={h} style={{ fontSize: '10px', color: '#475569', textAlign: i > 0 ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.investments.map(inv => {
              const invested   = convert(inv.invested_amount, inv.currency)
              const current    = convert(inv.current_value, inv.currency)
              const gain       = current - invested
              const months     = monthsBetween(new Date(inv.month), new Date())
              const xirr       = calcXIRR(invested, current, months)
              const gainColor  = gain > 0 ? '#10B981' : gain < 0 ? '#EF4444' : '#475569'
              return (
                <div key={inv.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '6px', background: '#0D1420', border: '0.5px solid #1E2A3A', borderRadius: '8px', padding: '9px 10px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#F8FAFC' }}>{inv.platform}</div>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>{inv.type}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B',  textAlign: 'right' }}>{formatCompact(invested, currency)}</div>
                  <div style={{ fontSize: '12px', color: '#F8FAFC',  textAlign: 'right' }}>{formatCompact(current,  currency)}</div>
                  <div style={{ fontSize: '12px', color: gainColor,  textAlign: 'right' }}>{gain > 0 ? '+' : ''}{formatCompact(gain, currency)}</div>
                  <div style={{ fontSize: '12px', color: gainColor,  textAlign: 'right', fontWeight: 500 }}>
                    {xirr !== 0 ? (xirr > 0 ? '+' : '') + xirr.toFixed(1) + '%' : '0%'}
                  </div>
                </div>
              )
            })}

            {/* Total row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '6px', borderTop: '0.5px solid #1E2A3A', padding: '9px 6px 0', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#F8FAFC' }}>Total</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', textAlign: 'right' }}>{formatCompact(totalInvested, currency)}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#F8FAFC', textAlign: 'right' }}>{formatCompact(totalCurrent, currency)}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: totalGain >= 0 ? '#10B981' : '#EF4444', textAlign: 'right' }}>
                {totalGain >= 0 ? '+' : ''}{formatCompact(totalGain, currency)}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: totalGain >= 0 ? '#10B981' : '#EF4444', textAlign: 'right' }}>
                {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                         