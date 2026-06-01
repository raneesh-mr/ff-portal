'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, TrendingUp, Target, Sparkles, BarChart3, MessageCircle } from 'lucide-react'

const FEATURES = [
  { icon: Target, label: 'Goal Tracking', desc: 'Set and track wealth milestones with countdown timers' },
  { icon: BarChart3, label: 'Investment Dashboard', desc: 'Live portfolio across mutual funds, stocks & more' },
  { icon: Sparkles, label: 'AI Financial Analysis', desc: 'Gemini-powered insights personalised to your data' },
  { icon: TrendingUp, label: 'Wealth Projection', desc: 'Compounding projections at 10%, 12%, 15% returns' },
]

const WA_LINK = 'https://wa.me/919108459700?text=Hi%2C%20I%27m%20interested%20in%20premium%20access%20to%20Already%20Wealthy%20wealth%20management%20portal.'

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
      const res = await fetch('/api/auth/login', {
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

  function handleTryDemo() {
    setUsername('wealth')
    setPassword('wealth')
    setError('')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: '#0A0E27' }}>

      {/* Left panel — marketing */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 px-16 py-14" style={{ background: 'linear-gradient(160deg, #0d1235 0%, #0A0E27 60%)', borderRight: '0.5px solid #1E2A3A' }}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ border: '1px solid rgba(201,168,76,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.06em', margin: 0 }}>My Financial Freedom</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '12px', height: '0.5px', background: '#C9A84C' }} />
              <p style={{ fontSize: '8px', color: '#C9A84C', fontStyle: 'italic', margin: 0 }}>Already Wealthy</p>
            </div>
          </div>
        </div>

        {/* Hero copy */}
        <div>
          <p style={{ fontSize: '12px', color: '#C9A84C', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '16px' }}>WEALTH MANAGEMENT · REIMAGINED</p>
          <h2 style={{ fontSize: '42px', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.15, marginBottom: '20px' }}>
            Experience<br />
            <span style={{ background: 'linear-gradient(135deg, #C9A84C, #F5D080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>True Wealth</span><br />
            Clarity.
          </h2>
          <p style={{ color: '#64748B', fontSize: '15px', lineHeight: 1.7, maxWidth: '380px', marginBottom: '40px' }}>
            A private portal for UAE & India professionals to track goals, investments, and build a clear path to financial freedom — powered by AI.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {FEATURES.map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', border: '0.5px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon size={16} style={{ color: '#C9A84C' }} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC', margin: '0 0 2px' }}>{f.label}</p>
                  <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium CTA */}
        <div style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)', borderRadius: '12px', padding: '20px 24px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC', margin: '0 0 4px' }}>Want your own private dashboard?</p>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px' }}>Premium access available for UAE & India professionals. Personalised setup included.</p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', fontSize: '13px', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', textDecoration: 'none' }}
          >
            <MessageCircle size={15} />
            Request Premium Access
          </a>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #C9A84C, transparent 70%)' }} />
        </div>

        <div className="w-full max-w-sm relative z-10">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 animate-pulse-gold" style={{ background: 'linear-gradient(135deg, #C9A84C, #F5D080)' }}>
              <TrendingUp className="w-7 h-7" style={{ color: '#0A0E27' }} />
            </div>
            <h1 className="text-xl font-bold text-gold-gradient mb-1">Already Wealthy</h1>
            <p style={{ color: '#64748B', fontSize: '13px' }}>My Financial Freedom Portal</p>
          </div>

          {/* Form card */}
          <div style={{ background: '#111827', border: '0.5px solid #1E2A3A', borderRadius: '16px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>Sign In</h2>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>Access your wealth dashboard</p>

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
              <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
                {loading
                  ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <><Shield className="w-4 h-4" />Sign In</>}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '0.5px', background: '#1E2A3A' }} />
              <span style={{ fontSize: '11px', color: '#334155' }}>or</span>
              <div style={{ flex: 1, height: '0.5px', background: '#1E2A3A' }} />
            </div>

            {/* Try Demo */}
            <button
              type="button"
              onClick={handleTryDemo}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '0.5px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)', color: '#C9A84C', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Sparkles size={14} />
              Try Demo — Experience the Portal
            </button>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '0.5px solid #1E2A3A', textAlign: 'center' }}>
              <p style={{ color: '#334155', fontSize: '11px', marginBottom: '10px' }}>Want your own premium access?</p>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#25D366', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
              >
                <MessageCircle size={13} />
                WhatsApp us for access
              </a>
            </div>
          </div>

          <p className="text-center mt-5 text-xs" style={{ color: '#1E2A3A' }}>wealth.realplannet.com · Private Platform</p>
        </div>
      </div>
    </div>
  )
}
