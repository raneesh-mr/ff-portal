import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch profile and user name together
  const [{ data: profile }, { data: user }] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', session.userId).single(),
    supabase.from('users').select('name, email').eq('id', session.userId).single(),
  ])

  return NextResponse.json({
    data: {
      ...(profile || {}),
      name: profile?.name || user?.name || session.name,
      email: profile?.email || user?.email,
    },
  })
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Extract fields that belong to the users table
  const { name, email, ...profileFields } = body

  // Update users table name/email if provided
  if (name || email) {
    const userUpdate: Record<string, string> = {}
    if (name) userUpdate.name = name
    if (email) userUpdate.email = email
    await supabase.from('users').update(userUpdate).eq('id', session.userId)
  }

  // Upsert user_profiles
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        ...profileFields,
        name,
        email,
        user_id: session.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
