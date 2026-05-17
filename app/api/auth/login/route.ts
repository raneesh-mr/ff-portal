import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { createSession, COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()
  if (!username || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, password_hash, name, email')
    .eq('username', username.toLowerCase().trim())
    .single()

  if (error || !user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = await createSession(user.id, user.username, user.name || username)
  const response = NextResponse.json({ success: true, name: user.name })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}
