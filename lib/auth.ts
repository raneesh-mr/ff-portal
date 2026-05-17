import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { SessionPayload } from '@/types'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'financial-freedom-secret-2024'
)
const COOKIE_NAME = 'ff_session'
const EXPIRY = '7d'

export async function createSession(userId: string, username: string, name: string): Promise<string> {
  const token = await new SignJWT({ userId, username, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET)
  return token
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

export { COOKIE_NAME }
