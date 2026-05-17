import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await request.json()

  // Log history for key fields
  const { data: existing } = await supabase.from('goals').select('*').eq('id', id).single()
  if (existing) {
    const trackFields = ['name', 'target_amount', 'target_date']
    for (const field of trackFields) {
      if (body[field] !== undefined && body[field] !== existing[field]) {
        await supabase.from('goal_history').insert({
          goal_id: id,
          user_id: session.userId,
          changed_field: field,
          old_value: String(existing[field]),
          new_value: String(body[field]),
        })
      }
    }
  }

  const { data, error } = await supabase
    .from('goals')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', session.userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', session.userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
