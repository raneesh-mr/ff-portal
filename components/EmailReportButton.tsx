'use client'
import { useState } from 'react'
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

type ReportType = 'dashboard' | 'goals' | 'investments' | 'payments'

export default function EmailReportButton({ type, label }: { type: ReportType; label?: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSend() {
    if (state === 'loading') return
    setState('loading')
    try {
      const res = await fetch('/api/email/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (!res.ok) throw new Error('Failed')
      setState('success')
      setTimeout(() => setState('idle'), 3000)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  const icon = {
    idle:    <Mail className="w-3.5 h-3.5" />,
    loading: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    success: <CheckCircle className="w-3.5 h-3.5" />,
    error:   <AlertCircle className="w-3.5 h-3.5" />,
  }[state]

  const text = {
    idle:    label ?? 'Email Report',
    loading: 'Sending…',
    success: 'Sent!',
    error:   'Failed',
  }[state]

  const color = {
    idle:    { color: '#C9A84C', border: 'rgba(201,168,76,0.25)', bg: 'rgba(201,168,76,0.08)' },
    loading: { color: '#C9A84C', border: 'rgba(201,168,76,0.25)', bg: 'rgba(201,168,76,0.08)' },
    success: { color: '#10B981', border: 'rgba(16,185,129,0.25)', bg: 'rgba(16,185,129,0.08)' },
    error:   { color: '#EF4444', border: 'rgba(239,68,68,0.25)',  bg: 'rgba(239,68,68,0.08)'  },
  }[state]

  return (
    <button
      onClick={handleSend}
      disabled={state === 'loading'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '8px',
        border: `1px solid ${color.border}`,
        background: color.bg,
        color: color.color,
        fontSize: '12px',
        fontWeight: 500,
        cursor: state === 'loading' ? 'default' : 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {text}
    </button>
  )
}
