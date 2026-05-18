'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Target, TrendingUp, CreditCard, BookOpen, Sparkles, Settings, LogOut, TrendingUpIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, mobileLabel: 'Home' },
  { href: '/goals', label: 'Goals', icon: Target, mobileLabel: 'Goals' },
  { href: '/investments', label: 'Investments', icon: TrendingUp, mobileLabel: 'Invest' },
  { href: '/payments', label: 'Payments', icon: CreditCard, mobileLabel: 'Pay' },
  { href: '/learn', label: 'Money Mind', icon: BookOpen, mobileLabel: 'Learn' },
  { href: '/discover', label: 'Discover AI', icon: Sparkles, mobileLabel: 'AI' },
  { href: '/settings', label: 'Settings', icon: Settings, mobileLabel: 'More' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/financial_freedom/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0E27' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 py-6 px-3" style={{ borderRight: '1px solid #1E2A3A', background: '#0A0E1F' }}>
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #C9A84C, #F5D080)' }}>
            <TrendingUpIcon className="w-4 h-4" style={{ color: '#0A0E27' }} />
          </div>
          <div>
            <p className="text-xs font-bold leading-none text-gold-gradient">MY FINANCIAL</p>
            <p className="text-xs font-bold leading-none text-gold-gradient">FREEDOM</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(item => {
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active ? 'text-white' : 'hover:bg-white/5'
                )}
                style={active ? {
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(245,208,128,0.1))',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: '#F5D080'
                } : { color: '#64748B' }}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full hover:bg-white/5"
          style={{ color: '#64748B' }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        <a
          href="https://www.raneesh.net"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-center block transition-opacity hover:opacity-80"
          style={{ fontSize: '10px', color: '#334155', lineHeight: 1.5 }}
        >
          made with passion<br />
          <span style={{ color: '#475569' }}>www.raneesh.net</span>
        </a>
      </aside>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom" style={{ background: 'rgba(10,14,39,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid #1E2A3A' }}>
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.slice(0, 6).map(item => {
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-0"
                style={active ? { color: '#F5D080' } : { color: '#475569' }}
              >
                <div className={cn(
                  'w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200',
                  active ? '' : ''
                )} style={active ? {
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(245,208,128,0.1))',
                  border: '1px solid rgba(201,168,76,0.3)'
                } : {}}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium truncate">{item.mobileLabel}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
