import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  const force = request.nextUrl.searchParams.get('force') === 'true'

  // Check cache (1 hour)
  if (!force) {
    const { data: cached } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('from_currency', 'AED')
      .eq('to_currency', 'INR')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single()

    if (cached) {
      const age = Date.now() - new Date(cached.fetched_at).getTime()
      if (age < 3600000) {
        return NextResponse.json({ rate: cached.rate, fetched_at: cached.fetched_at, userName: session?.name || 'User' })
      }
    }
  }

  // Fetch live rate (AED to INR)
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/AED')
    const json = await res.json()
    const rate = json.rates?.INR || 26

    await supabase.from('exchange_rates').insert({ from_currency: 'AED', to_currency: 'INR', rate })

    return NextResponse.json({ rate, fetched_at: new Date().toISOString(), userName: session?.name || 'User' })
  } catch {
    return NextResponse.json({ rate: 26, fetched_at: new Date().toISOString(), userName: session?.name || 'User' })
  }
}
