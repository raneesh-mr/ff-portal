'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, TrendingUp } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/financial_freedom/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid credentials'); return }
      router.push('/')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #0A0E27 0%, #0d1333 50%, #0A0E27 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #C9A84C, transparent 70%)' }} />
      </div>
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse-gold" style={{ background: 'linear-gradient(135deg, #C9A84C, #F5D080)' }}>
            <TrendingUp className="w-8 h-8" style={{ color: '#0A0E27' }} />
          </div>
          <h1 className="text-2xl font-bold mb-1 text-gold-gradient">My Financial Freedom</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Your journey to freedom starts here</p>
        </div>
        <div className="glass-card p-8 glow-gold">
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#F8FAFC' }}>Welcome back</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="ff-input" placeholder="Enter your username" required autoComplete="username" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="ff-input pr-12" placeholder="Enter your password" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: '#64748B' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <><Shield className="w-4 h-4" />Sign In</>}
            </button>
          </form>
          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#64748B', fontSize: '0.75rem' }}>Secured with end-to-end encryption</p>
          </div>
        </div>
        <p className="text-center mt-6 text-xs" style={{ color: '#475569' }}>My Financial Freedom Portal · Private Access</p>
      </div>
    </div>
  )
}
