import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({ data })
}

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch all user data
  const [{ data: goals }, { data: investments }, { data: payments }, { data: profileData }] = await Promise.all([
    supabase.from('goals').select('*').eq('user_id', session.userId),
    supabase.from('investments').select('*').eq('user_id', session.userId),
    supabase.from('payments').select('*').eq('user_id', session.userId),
    supabase.from('user_profiles').select('*').eq('user_id', session.userId).single(),
  ])

  const profile = profileData

  const totalInvested = investments?.reduce((s: number, i: { invested_amount: number }) => s + i.invested_amount, 0) || 0
  const totalCurrent = investments?.reduce((s: number, i: { current_value: number }) => s + i.current_value, 0) || 0

  const gainPct = totalInvested > 0 ? (((totalCurrent - totalInvested) / totalInvested) * 100).toFixed(1) : '0'

  const prompt = `You are a personal financial freedom advisor. Analyze this user's complete financial data and provide specific, actionable insights.

User: ${session.name}
Total Portfolio: AED ${totalCurrent.toFixed(0)} (invested: AED ${totalInvested.toFixed(0)}, gain: ${gainPct}%)
Goals: ${JSON.stringify(goals?.map((g: { name: string; target_amount: number; currency: string; target_date: string; is_primary: boolean }) => ({ name: g.name, target: g.target_amount, currency: g.currency, deadline: g.target_date, isPrimary: g.is_primary })))}
Investments: ${JSON.stringify(investments?.map((i: { platform: string; type: string; invested_amount: number; current_value: number; currency: string }) => ({ platform: i.platform, type: i.type, invested: i.invested_amount, current: i.current_value, currency: i.currency })))}
Monthly Payments: ${JSON.stringify(payments?.map((p: { name: string; amount: number; category: string; payment_type: string; status: string }) => ({ name: p.name, amount: p.amount, category: p.category, type: p.payment_type, status: p.status })))}
Income Profile: ${JSON.stringify({ yearlyAED: profile?.yearly_income_aed, yearlyINR: profile?.yearly_income_inr, monthlyTakehome: profile?.monthly_takehome_aed, riskTolerance: profile?.risk_tolerance })}

Respond ONLY with valid JSON in this exact format, no other text:
{
  "whereYouStand": [{"goal": "goal name", "status": "on_track|at_risk|overdue", "message": "2-3 sentence specific assessment", "percentage": 44}],
  "whatsWorking": [{"title": "short title", "detail": "1-2 lines of what is working well and why"}],
  "holdingYouBack": [{"title": "short title", "detail": "specific gap or risk with numbers", "severity": "high|medium|low"}],
  "nextActions": [{"priority": 1, "action": "Specific action with numbers", "impact": "What achieving this does", "timeline": "When/how often"}]
}

Be specific to their actual platforms and real amounts. Maximum 3 items in whatsWorking, 3 in holdingYouBack, 3 in nextActions.`

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Clean JSON from markdown fences if present
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const analysis = JSON.parse(jsonStr)

    const { data: saved } = await supabase
      .from('ai_analyses')
      .insert({ user_id: session.userId, analysis_json: analysis })
      .select()
      .single()

    return NextResponse.json({ data: saved })
  } catch (e) {
    return NextResponse.json({ error: 'AI analysis failed', detail: String(e) }, { status: 500 })
  }
}
