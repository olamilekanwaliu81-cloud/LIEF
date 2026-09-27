import { AlertTriangle, CheckCircle2, ChevronRight, Clock } from 'lucide-react'
import { child, subjects, recentActivity } from '../data/child'
import ScoreRing from './ScoreRing'

interface Props {
  onNavigateToSupport: (concern: string) => void
}

export default function Dashboard({ onNavigateToSupport }: Props) {
  const strengths = subjects.filter(s => s.status === 'strength')
  const concerns = subjects.filter(s => s.status === 'concern')

  return (
    <div className="px-4 pt-5 pb-4 space-y-5 w-full">
      {/* Welcome strip */}
      <div>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)', fontFamily: 'DM Sans, sans-serif' }}>
          Good morning, Fatima
        </p>
        <h1
          className="text-2xl font-black mt-0.5"
          style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}
        >
          {child.name}'s Overview
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          {child.grade} · {child.school} · Updated {child.lastUpdated}
        </p>
      </div>

      {/* Core score card */}
      <div
        className="rounded-2xl p-5 flex items-center gap-5"
        style={{ background: 'var(--primary)' }}
      >
        <ScoreRing score={child.overallScore} size={96} strokeWidth={7} />
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Academic Score
          </p>
          <p className="text-4xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: '#fff' }}>
            {child.overallScore}
            <span className="text-lg font-semibold ml-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>/100</span>
          </p>
          <div className="flex gap-4 mt-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Attendance
              </p>
              <p className="text-lg font-bold" style={{ fontFamily: 'Quicksand, sans-serif', color: '#fff' }}>
                {child.attendanceRate}%
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Subjects
              </p>
              <p className="text-lg font-bold" style={{ fontFamily: 'Quicksand, sans-serif', color: '#fff' }}>
                {subjects.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Areas needing attention */}
      {concerns.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} style={{ color: '#E97B2E' }} />
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#E97B2E', fontFamily: 'Quicksand, sans-serif' }}>
              Needs Attention
            </h2>
          </div>
          <div className="space-y-2">
            {concerns.map(s => (
              <button
                key={s.name}
                onClick={() => onNavigateToSupport(s.name)}
                className="w-full text-left rounded-xl p-4 flex items-center gap-4 transition-all hover:opacity-90 active:scale-[0.99]"
                style={{ background: '#FFF4EC', border: '1px solid #F5C5A0' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                  style={{ background: '#E97B2E', color: '#fff', fontFamily: 'Quicksand, sans-serif' }}
                >
                  {s.score}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>{s.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#A05A1E' }}>
                    Down {Math.abs(s.trend)} pts · Tap for guidance
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: '#E97B2E' }} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Strengths */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={15} style={{ color: 'var(--accent)' }} />
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--accent)', fontFamily: 'Quicksand, sans-serif' }}>
            Strengths
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {strengths.map(s => (
            <div
              key={s.name}
              className="rounded-xl p-3.5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold" style={{ color: 'var(--primary)', fontFamily: 'Quicksand, sans-serif' }}>
                  {s.score}
                </p>
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--accent)' }}
                >
                  +{s.trend}
                </span>
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{s.name}</p>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.score}%`, background: 'var(--accent)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={15} style={{ color: 'var(--muted-foreground)' }} />
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>
            Recent Activity
          </h2>
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {recentActivity.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border)' : 'none',
                background: item.flag ? '#FFF8F3' : '#fff',
              }}
            >
              <div className="text-center shrink-0">
                <p className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>{item.date}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>{item.subject}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.type}</p>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: item.flag ? '#FDEBD8' : item.result === 'Completed' ? '#E8F8F3' : 'var(--secondary)',
                  color: item.flag ? '#C0521A' : item.result === 'Completed' ? '#0F8A5F' : 'var(--primary)',
                }}
              >
                {item.result}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
