import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: analysis }, { data: goals }, { data: investments }] = await Promise.all([
    supabase.from('ai_analyses').select('*').eq('user_id', session.userId).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('goals').select('*').eq('user_id', session.userId),
    supabase.from('investments').select('*').eq('user_id', session.userId),
  ])

  const totalInvested = investments?.reduce((s: number, i: { invested_amount: number }) => s + i.invested_amount, 0) || 0
  const totalCurrent = investments?.reduce((s: number, i: { current_value: number }) => s + i.current_value, 0) || 0
  const totalGain = totalCurrent - totalInvested
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : '0'

  const ai = analysis?.analysis_json

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0E27;font-family:Inter,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:24px;">
  <div style="background:linear-gradient(135deg,#C9A84C,#F5D080);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
    <h1 style="margin:0;color:#0A0E27;font-size:24px;font-weight:800;">Already Wealthy</h1>
    <p style="margin:8px 0 0;color:#0A0E27;opacity:0.7;font-size:14px;">Portfolio Summary · ${new Date().toLocaleDateString('en-AE', { dateStyle: 'long' })}</p>
  </div>

  <div style="background:#111827;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #1E2A3A;">
    <h2 style="color:#C9A84C;font-size:14px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Portfolio Overview</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:0 16px 0 0;">
          <p style="color:#64748B;font-size:12px;margin:0 0 4px;">Total Value</p>
          <p style="color:#F8FAFC;font-size:22px;font-weight:700;margin:0;">AED ${totalCurrent.toLocaleString('en-AE', { maximumFractionDigits: 0 })}</p>
        </td>
        <td>
          <p style="color:#64748B;font-size:12px;margin:0 0 4px;">Total Gain</p>
          <p style="color:${totalGain >= 0 ? '#10B981' : '#EF4444'};font-size:22px;font-weight:700;margin:0;">${totalGain >= 0 ? '+' : ''}AED ${totalGain.toLocaleString('en-AE', { maximumFractionDigits: 0 })} (${gainPct}%)</p>
        </td>
      </tr>
    </table>
  </div>

  ${goals && goals.length > 0 ? `
  <div style="background:#111827;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #1E2A3A;">
    <h2 style="color:#C9A84C;font-size:14px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Your Goals</h2>
    ${goals.map((g: { name: string; target_amount: number; currency: string }) => `
    <div style="margin-bottom:12px;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;">
      <p style="color:#F8FAFC;font-weight:600;margin:0 0 2px;">${g.name}</p>
      <p style="color:#64748B;font-size:13px;margin:0;">Target: ${g.currency} ${g.target_amount.toLocaleString()}</p>
    </div>`).join('')}
  </div>` : ''}

  ${ai ? `
  <div style="background:#111827;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid rgba(16,185,129,0.3);">
    <h2 style="color:#10B981;font-size:14px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">What's Working</h2>
    ${(ai.whatsWorking || []).map((w: { title: string; detail: string }) => `
    <div style="margin-bottom:12px;padding:12px;background:rgba(16,185,129,0.08);border-radius:8px;border-left:3px solid #10B981;">
      <p style="color:#34D399;font-weight:600;margin:0 0 4px;">${w.title}</p>
      <p style="color:#94A3B8;font-size:13px;margin:0;">${w.detail}</p>
    </div>`).join('')}
  </div>
  <div style="background:#111827;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid rgba(245,158,11,0.3);">
    <h2 style="color:#F59E0B;font-size:14px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Your 3 Next Actions</h2>
    ${(ai.nextActions || []).map((a: { priority: number; action: string; impact: string; timeline: string }) => `
    <div style="margin-bottom:12px;padding:12px;background:rgba(245,158,11,0.08);border-radius:8px;border-left:3px solid #F59E0B;">
      <p style="color:#FCD34D;font-weight:600;margin:0 0 4px;">${a.priority}. ${a.action}</p>
      <p style="color:#94A3B8;font-size:13px;margin:0;">${a.impact} · ${a.timeline}</p>
    </div>`).join('')}
  </div>` : ''}

  <div style="text-align:center;padding:24px 0;border-top:1px solid #1E2A3A;margin-top:8px;">
    <p style="color:#475569;font-size:12px;margin:0;">Sent from Already Wealthy · ${new Date().toLocaleDateString()}</p>
    <p style="color:#C9A84C;font-size:12px;margin:4px 0 0;">wealth.raneesh.net</p>
  </div>
</div>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'Already Wealthy <onboarding@resend.dev>',
      to: process.env.RESEND_TO_EMAIL!,
      subject: `Already Wealthy — Portfolio Summary · ${new Date().toLocaleDateString('en-AE', { month: 'long', year: 'numeric' })}`,
      html,
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
