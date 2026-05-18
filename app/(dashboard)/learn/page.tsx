'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface TrapStatus {
  trap_number: number
  status: string
}

type TrapStatusValue = 'aware' | 'working' | 'mastered' | ''

interface Trap {
  number: number
  title: string
  happening: string
  whatToDo: string
}

interface Act {
  title: string
  traps: Trap[]
}

const ACTS: Act[] = [
  {
    title: 'ACT 1 – The False Confidence',
    traps: [
      {
        number: 1,
        title: 'You Think You\'re Logical',
        happening: 'Money decisions are driven by emotion, not logic. Your past experiences, fears, and current mood shape every financial choice.',
        whatToDo: 'Pause before any major financial decision. Ask: "Is this logic or emotion?"',
      },
      {
        number: 2,
        title: 'You Think You\'re in Control',
        happening: 'You can\'t control market returns, global events, or timing. You can only control your behaviour — savings rate, consistency, diversification.',
        whatToDo: 'Focus energy only on what you can control.',
      },
      {
        number: 3,
        title: 'You Believe the Story, Not the Reality',
        happening: 'Compelling narratives ("this will 10x") feel more real than data.',
        whatToDo: 'Demand actual returns data. Ignore stories, track numbers.',
      },
      {
        number: 4,
        title: 'You Think You\'re a Spreadsheet',
        happening: 'Perfect plans break on contact with real life.',
        whatToDo: 'Build flexibility into every plan. Expect surprises.',
      },
    ],
  },
  {
    title: 'ACT 2 – The Emotional Hijack',
    traps: [
      {
        number: 5,
        title: 'You Chase More Than You Need',
        happening: '"Enough" is the most powerful word in finance. Beyond a point, more money doesn\'t change life quality.',
        whatToDo: 'Define your enough number and stop moving the goalpost.',
      },
      {
        number: 6,
        title: 'You Think Stuff Will Make You Admired',
        happening: 'We buy expensive things hoping others will admire us. They don\'t — they admire their own stuff.',
        whatToDo: 'Track what you spend on appearances vs wealth.',
      },
      {
        number: 7,
        title: 'You Think Looking Rich Means Being Rich',
        happening: 'Visible wealth and actual wealth move in opposite directions.',
        whatToDo: 'Measure net worth, not possessions.',
      },
      {
        number: 8,
        title: 'You Fall for Fear Disguised as Wisdom',
        happening: 'Financial media packages fear as prudent caution.',
        whatToDo: 'Distinguish between fear and evidence. Stay invested.',
      },
    ],
  },
  {
    title: 'ACT 3 – The Hidden Rules of Money',
    traps: [
      {
        number: 9,
        title: 'You Think Saving Needs a Goal',
        happening: 'Save without purpose too. Savings = options = freedom.',
        whatToDo: 'Keep a goalless emergency/freedom buffer always liquid.',
      },
      {
        number: 10,
        title: 'You Want the Gains — But Not the Ride',
        happening: 'Every great investment has terrifying dips. Volatility is the admission price.',
        whatToDo: 'Expect and accept volatility as normal.',
      },
      {
        number: 11,
        title: 'You Think Getting Rich Is the Hard Part',
        happening: 'Staying rich is harder. Requires humility, not letting ego chase more.',
        whatToDo: 'Protect what you have. Diversify once you\'re winning.',
      },
      {
        number: 12,
        title: 'You Overestimate Your Plan',
        happening: 'Long-term plans almost never survive unchanged.',
        whatToDo: 'Review your plan every 6 months. Update it like a living document.',
      },
    ],
  },
  {
    title: 'ACT 4 – The Long Game',
    traps: [
      {
        number: 13,
        title: 'You Underestimate the Power of Time',
        happening: 'Compound interest is exponential, not linear. Warren Buffett made 97% of his wealth after age 65.',
        whatToDo: 'Start now. Stay in. Time is the multiplier.',
      },
      {
        number: 14,
        title: 'You Ignore How Rare Success Really Is',
        happening: 'Most investors lose. Winners simply outlast everyone else.',
        whatToDo: 'Survival is strategy. Don\'t do anything that ends the game.',
      },
      {
        number: 15,
        title: 'You Buy Stuff and Sell Your Time',
        happening: 'Every purchase is bought with hours of your life.',
        whatToDo: 'Before buying, calculate: how many hours of freedom does this cost?',
      },
    ],
  },
  {
    title: 'ACT 5 – Become the Person Who Wins Long Term',
    traps: [
      {
        number: 16,
        title: 'You Expect the Market to Be Predictable',
        happening: 'Nobody consistently predicts markets.',
        whatToDo: 'Plan for ranges (best/base/worst). Never rely on a single outcome.',
      },
      {
        number: 17,
        title: 'You Forget That You\'ll Change',
        happening: 'Your 35-year-old goals won\'t match your 50-year-old self.',
        whatToDo: 'Update goals when life changes. Evolution isn\'t failure.',
      },
      {
        number: 18,
        title: 'You Copy People Who Aren\'t Playing Your Game',
        happening: 'A day trader\'s strategy is poison for a long-term investor. Social media "investors" play a different game.',
        whatToDo: 'Know your game — your timeline, risk, and goals. Filter all advice through it.',
      },
    ],
  },
]

const STATUS_OPTIONS: { value: TrapStatusValue; label: string; color: string }[] = [
  { value: 'aware', label: 'Aware', color: 'bg-slate-700 text-slate-300 border border-slate-600' },
  { value: 'working', label: 'Working on it', color: 'bg-amber-900/50 text-amber-400 border border-amber-700/50' },
  { value: 'mastered', label: 'Mastered', color: 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50' },
]

function TrapCard({ trap, status, onStatusChange }: { trap: Trap; status: TrapStatusValue; onStatusChange: (n: number, s: string) => void }) {
  const current = STATUS_OPTIONS.find(s => s.value === status)

  return (
    <div className={`rounded-xl p-4 border transition-all ${status === 'mastered' ? 'border-emerald-800/50 bg-emerald-950/20' : status === 'working' ? 'border-amber-800/50 bg-amber-950/20' : 'border-slate-800 bg-slate-900/30'}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-xs font-bold text-yellow-400">
          {trap.number}
        </span>
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{trap.title}</h4>
          <p className="text-sm text-slate-500 italic mb-2">{trap.happening}</p>
          <div className="flex items-start gap-1.5">
            <span className="text-emerald-500 text-xs mt-0.5 flex-shrink-0">→</span>
            <p className="text-sm text-emerald-400">{trap.whatToDo}</p>
          </div>
        </div>
      </div>

      {/* Status selector */}
      <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-slate-800/50">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(trap.number, opt.value)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${status === opt.value ? opt.color + ' ring-1 ring-offset-1 ring-offset-transparent ring-current' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'}`}
          >
            {status === opt.value && '✓ '}{opt.label}
          </button>
        ))}
        {status && (
          <div className={`ml-auto text-xs px-2 py-1 rounded-full ${current?.color || ''}`}>
            {current?.label}
          </div>
        )}
      </div>
    </div>
  )
}

function ActSection({ act, statuses, onStatusChange }: { act: Act; statuses: Record<number, TrapStatusValue>; onStatusChange: (n: number, s: string) => void }) {
  const [open, setOpen] = useState(true)
  const masteredCount = act.traps.filter(t => statuses[t.number] === 'mastered').length

  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div>
          <h3 className="font-bold text-white">{act.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{masteredCount}/{act.traps.length} mastered</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${act.traps.length > 0 ? (masteredCount / act.traps.length) * 100 : 0}%` }}
            />
          </div>
          {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3">
          {act.traps.map(trap => (
            <TrapCard
              key={trap.number}
              trap={trap}
              status={statuses[trap.number] || ''}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function LearnPage() {
  const [statuses, setStatuses] = useState<Record<number, TrapStatusValue>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStatuses() {
      setLoading(true)
      try {
        const res = await fetch('/financial_freedom/api/psychology')
        const json = await res.json()
        const map: Record<number, TrapStatusValue> = {}
        for (const item of json.data || []) {
          map[item.trap_number] = item.status as TrapStatusValue
        }
        setStatuses(map)
      } finally {
        setLoading(false)
      }
    }
    fetchStatuses()
  }, [])

  async function handleStatusChange(trapNumber: number, status: string) {
    // Optimistic update
    setStatuses(prev => ({ ...prev, [trapNumber]: status as TrapStatusValue }))
    try {
      await fetch('/financial_freedom/api/psychology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trap_number: trapNumber, status }),
      })
    } catch {
      // revert on error
      setStatuses(prev => ({ ...prev, [trapNumber]: '' }))
    }
  }

  const totalTraps = 18
  const addressedCount = Object.values(statuses).filter(s => s && (s as string) !== '').length
  const masteredCount = Object.values(statuses).filter(s => s === 'mastered').length

  return (
    <div className="w-full px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Know Your Money Mind</h1>
        <p className="text-slate-400">18 traps between you and financial freedom</p>
      </div>

      {/* Progress summary */}
      <div className="glass-card rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-2xl font-bold text-white">{addressedCount} <span className="text-slate-500 text-lg font-normal">/ {totalTraps} traps addressed</span></p>
            <p className="text-sm text-emerald-400 mt-0.5">{masteredCount} mastered</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-yellow-400">{Math.round((addressedCount / totalTraps) * 100)}%</p>
            <p className="text-xs text-slate-500">awareness</p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gold-gradient rounded-full transition-all duration-500"
            style={{ width: `${(addressedCount / totalTraps) * 100}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-600" />
            <span className="text-slate-500">Aware</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-500">Working on it</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Mastered</span>
          </div>
        </div>
      </div>

      {/* Act sections */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="glass-card rounded-2xl h-32 animate-pulse" />)}
        </div>
      ) : (
        ACTS.map(act => (
          <ActSection
            key={act.title}
            act={act}
            statuses={statuses}
            onStatusChange={handleStatusChange}
          />
        ))
      )}

      <div className="text-center mt-8 pb-4">
        <p className="text-xs text-slate-600">Progress is saved automatically as you click.</p>
      </div>
    </div>
  )
}