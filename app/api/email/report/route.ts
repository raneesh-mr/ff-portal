import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const resend = new Resend(process.env.RESEND_API_KEY)

function fmt(n: number, currency = 'INR') {
  const sym = currency === 'INR' ? '₹' : 'AED '
  if (n >= 10000000) return `${sym}${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000)   return `${sym}${(n / 100000).toFixed(1)}L`
  if (n >= 1000)     return `${sym}${(n / 1000).toFixed(1)}K`
  return `${sym}${n.toFixed(0)}`
}

const BASE = `
  <div style="max-width:600px;margin:0 auto;padding:24px;font-family:Inter,Arial,sans-serif;background:#0A0E27;">
    <div style="background:linear-gradient(135deg,#C9A84C,#F5D080);border-radius:12px;padding:20px 24px;margin-bottom:20px;">
      <p style="margin:0;color:#0A0E27;font-size:11px;font-weight:600;letter-spacing:0.05em;opacity:0.7;">MY FINANCIAL FREEDOM</p>
      <h1 style="margin:4px 0 0;color:#0A0E27;font-size:20px;font-weight:800;">{{TITLE}}</h1>
      <p style="margin:6px 0 0;color:#0A0E27;opacity:0.6;font-size:12px;">{{DATE}}</p>
    </div>
    {{BODY}}
    <div style="text-align:center;padding-top:20px;border-top:0.5px solid #1E2A3A;margin-top:8px;">
      <p style="color:#475569;font-size:11px;margin:0;">My Financial Freedom Portal</p>
      <p style="color:#C9A84C;font-size:11px;margin:4px 0 0;">made with passion · www.raneesh.net</p>
    </div>
  </div>
`

const CARD = (content: string) =>
  `<div style="background:#111827;border:0.5px solid #1E2A3A;border-radius:10px;padding:16px;margin-bottom:12px;">${content}</div>`

const SECTION = (label: string) =>
  `<p style="color:#64748B;font-size:10px;font-weight:600;letter-spacing:0.06em;margin:0 0 10px;">${label}</p>`

const ROW = (label: string, value: string, valueColor = '#F8FAFC') =>
  `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-bottom:0.5px solid #1E2A3A;">
    <span style="font-size:12px;color:#64748B;">${label}</span>
    <span style="font-size:13px;font-weight:500;color:${valueColor};">${value}</span>
  </div>`

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type } = await request.json()

  // Get user email
  const { data: user } = await supabase
    .from('users').select('email,name').eq('id', session.userId).single()
  if (!user?.email) return NextResponse.json({ error: 'No email on account' }, { status: 400 })

  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  let title = '', subject = '', body = ''

  if (type === 'dashboard') {
    const [{ data: goals }, { data: investments }] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', session.userId),
      supabase.from('investments').select('*').eq('user_id', session.userId),
    ])
    const invested = investments?.reduce((s, i) => s + i.invested_amount, 0) || 0
    const current  = investments?.reduce((s, i) => s + i.current_value,   0) || 0
    const gain     = current - invested
    const gainPct  = invested > 0 ? ((gain / invested) * 100).toFixed(1) : '0'
    const target   = goals?.reduce((s, g) => s + g.target_amount, 0) || 0
    const pct      = target > 0 ? ((current / target) * 100).toFixed(1) : '0'

    title   = 'Portfolio Summary'
    subject = `Financial Freedom — Portfolio Summary · ${date}`
    body = CARD(`
      ${SECTION('PORTFOLIO')}
      ${ROW('Total Target',  fmt(target,  'INR'))}
      ${ROW('Invested',      fmt(invested,'INR'))}
      ${ROW('Current Value', fmt(current, 'INR'), '#F8FAFC')}
      ${ROW('Profit / Loss', `${gain >= 0 ? '+' : ''}${fmt(gain, 'INR')} (${gainPct}%)`, gain >= 0 ? '#10B981' : '#EF4444')}
      ${ROW('Overall Progress', `${pct}%`, '#C9A84C')}
    `) + (goals?.length ? CARD(`
      ${SECTION('GOALS')}
      ${goals.map(g => ROW(g.name, `Target ${fmt(g.target_amount, g.currency)}`)).join('')}
    `) : '')

  } else if (type === 'goals') {
    const { data: goals } = await supabase.from('goals').select('*').eq('user_id', session.userId)
    title   = 'Goals Report'
    subject = `Financial Freedom — Goals Report · ${date}`
    body = (goals || []).map(g =>
      CARD(`
        <p style="font-size:14px;font-weight:600;color:#F8FAFC;margin:0 0 10px;">${g.is_primary ? '★ ' : ''}${g.name}</p>
        ${ROW('Target Amount', fmt(g.target_amount, g.currency))}
        ${ROW('Currency', g.currency)}
        ${g.target_date ? ROW('Target Date', new Date(g.target_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })) : ''}
        ${g.notes ? `<p style="color:#64748B;font-size:11px;margin:8px 0 0;font-style:italic;">${g.notes}</p>` : ''}
      `)
    ).join('')

  } else if (type === 'investments') {
    const { data: investments } = await supabase.from('investments').select('*').eq('user_id', session.userId)
    const invested = investments?.reduce((s, i) => s + i.invested_amount, 0) || 0
    const current  = investments?.reduce((s, i) => s + i.current_value,   0) || 0
    const gain     = current - invested
    title   = 'Investment Breakdown'
    subject = `Financial Freedom — Investment Breakdown · ${date}`
    body = CARD(`
      ${SECTION('TOTALS')}
      ${ROW('Total Invested', fmt(invested, 'INR'))}
      ${ROW('Current Value',  fmt(current,  'INR'))}
      ${ROW('Total P/L', `${gain >= 0 ? '+' : ''}${fmt(gain, 'INR')}`, gain >= 0 ? '#10B981' : '#EF4444')}
    `) + (investments || []).map(inv => {
      const g = inv.current_value - inv.invested_amount
      return CARD(`
        <p style="font-size:13px;font-weight:600;color:#F8FAFC;margin:0 0 8px;">${inv.platform} <span style="font-size:10px;color:#64748B;font-weight:400;">${inv.type}</span></p>
        ${ROW('Invested', fmt(inv.invested_amount, inv.currency))}
        ${ROW('Current',  fmt(inv.current_value,   inv.currency))}
        ${ROW('P/L', `${g >= 0 ? '+' : ''}${fmt(g, inv.currency)}`, g > 0 ? '#10B981' : g < 0 ? '#EF4444' : '#64748B')}
      `)
    }).join('')

  } else if (type === 'payments') {
    const { data: payments } = await supabase
      .from('payments').select('*').eq('user_id', session.userId).neq('status', 'paid')
      .order('due_date', { ascending: true })
    title   = 'Upcoming Payments'
    subject = `Financial Freedom — Upcoming Payments · ${date}`
    body = payments?.length
      ? payments.map(p => CARD(`
          <p style="font-size:13px;font-weight:600;color:#F8FAFC;margin:0 0 8px;">${p.icon || ''} ${p.name}</p>
          ${ROW('Amount',   `${p.currency} ${Number(p.amount).toLocaleString()}`)}
          ${ROW('Category', p.category || '—')}
          ${ROW('Due Date', p.due_date ? new Date(p.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date')}
          ${ROW('Status', p.status, p.status === 'overdue' ? '#EF4444' : '#F59E0B')}
        `)).join('')
      : CARD(`<p style="color:#64748B;font-size:13px;margin:0;">No upcoming payments.</p>`)
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const html = BASE.replace('{{TITLE}}', title).replace('{{DATE}}', date).replace('{{BODY}}', body)

  try {
    await resend.emails.send({
      from: 'My Financial Freedom <wealth@raneesh.net>',
      to: user.email,
      subject,
      html: `<!DOCTYPE html><html><body style="margin:0;background:#0A0E27;">${html}</body></html>`,
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
