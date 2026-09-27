import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { journeyData, subjects } from '../data/child'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const subjectColors: Record<string, string> = {
  Math: '#1ABF96',
  English: '#0D2B55',
  Science: '#7B5EA7',
  overall: '#E97B2E',
}

type View = 'chart' | 'subjects'

export default function Journey() {
  const [view, setView] = useState<View>('chart')
  const [activeSubject, setActiveSubject] = useState<string>('overall')

  return (
    <div className="px-4 pt-5 pb-4 space-y-5 w-full">
      <div>
        <h1 className="text-2xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
          Academic Journey
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Progress over time · Jan – Sep 2026
        </p>
      </div>

      {/* View toggle */}
      <div
        className="flex rounded-xl overflow-hidden p-1 gap-1"
        style={{ background: 'var(--secondary)' }}
      >
        {(['chart', 'subjects'] as View[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all"
            style={{
              fontFamily: 'Quicksand, sans-serif',
              background: view === v ? '#fff' : 'transparent',
              color: view === v ? 'var(--primary)' : 'var(--muted-foreground)',
              boxShadow: view === v ? '0 1px 4px rgba(13,43,85,0.10)' : 'none',
            }}
          >
            {v === 'chart' ? 'Progress Chart' : 'By Subject'}
          </button>
        ))}
      </div>

      {view === 'chart' && (
        <>
          {/* Subject selector chips */}
          <div className="flex gap-2 flex-wrap">
            {(['overall', 'Math', 'English', 'Science'] as const).map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                style={{
                  fontFamily: 'Quicksand, sans-serif',
                  background: activeSubject === sub ? subjectColors[sub] : 'var(--secondary)',
                  color: activeSubject === sub ? '#fff' : 'var(--muted-foreground)',
                }}
              >
                {sub === 'overall' ? 'Overall' : sub}
              </button>
            ))}
          </div>

          {/* Line chart */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={journeyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="term"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'DM Sans, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'DM Sans, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: '#fff',
                    fontSize: 12,
                    fontFamily: 'Quicksand, sans-serif',
                    color: 'var(--primary)',
                  }}
                />
                <ReferenceLine y={70} stroke="#E97B2E" strokeDasharray="4 4" label="" />
                {activeSubject === 'overall' || activeSubject === 'Math' ? (
                  <Line
                    type="monotone" dataKey="Math" stroke={subjectColors.Math}
                    strokeWidth={2} dot={{ r: 3, fill: subjectColors.Math }} activeDot={{ r: 5 }}
                    name="Maths"
                  />
                ) : null}
                {activeSubject === 'overall' || activeSubject === 'English' ? (
                  <Line
                    type="monotone" dataKey="English" stroke={subjectColors.English}
                    strokeWidth={2} dot={{ r: 3, fill: subjectColors.English }} activeDot={{ r: 5 }}
                    name="English"
                  />
                ) : null}
                {activeSubject === 'overall' || activeSubject === 'Science' ? (
                  <Line
                    type="monotone" dataKey="Science" stroke={subjectColors.Science}
                    strokeWidth={2} dot={{ r: 3, fill: subjectColors.Science }} activeDot={{ r: 5 }}
                    name="Science"
                  />
                ) : null}
                {activeSubject === 'overall' ? (
                  <Line
                    type="monotone" dataKey="overall" stroke={subjectColors.overall}
                    strokeWidth={3} dot={{ r: 4, fill: subjectColors.overall }} activeDot={{ r: 6 }}
                    name="Overall"
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--muted-foreground)' }}>
              Orange dashed line = 70 target threshold
            </p>
          </div>

          {/* Progress insight cards */}
          <div className="grid grid-cols-2 gap-3">
            <InsightCard label="Best month" value="Jun" note="Overall up to 74" positive />
            <InsightCard label="Most improved" value="Science" note="+8 pts since Jan" positive />
            <InsightCard label="Needs watch" value="Maths" note="Dipped below 65 in Mar" positive={false} />
            <InsightCard label="Streak" value="4 weeks" note="Consistent attendance" positive />
          </div>
        </>
      )}

      {view === 'subjects' && (
        <div className="space-y-3">
          {subjects.map(s => (
            <div
              key={s.name}
              className="rounded-xl p-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
                  {s.name}
                </p>
                <div className="flex items-center gap-1.5">
                  {s.trend > 0 ? (
                    <TrendingUp size={13} style={{ color: 'var(--accent)' }} />
                  ) : s.trend < 0 ? (
                    <TrendingDown size={13} style={{ color: '#E97B2E' }} />
                  ) : (
                    <Minus size={13} style={{ color: 'var(--muted-foreground)' }} />
                  )}
                  <span
                    className="text-xs font-bold"
                    style={{ color: s.trend > 0 ? 'var(--accent)' : s.trend < 0 ? '#E97B2E' : 'var(--muted-foreground)' }}
                  >
                    {s.trend > 0 ? `+${s.trend}` : s.trend === 0 ? '—' : s.trend} pts
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${s.score}%`,
                      background: s.status === 'concern' ? '#E97B2E' : s.status === 'strength' ? 'var(--accent)' : 'var(--primary)',
                    }}
                  />
                </div>
                <span
                  className="text-sm font-black w-8 text-right"
                  style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}
                >
                  {s.score}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>0</span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>100</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function InsightCard({ label, value, note, positive }: {
  label: string; value: string; note: string; positive: boolean
}) {
  return (
    <div
      className="rounded-xl p-3.5"
      style={{ background: positive ? '#F0FDF8' : '#FFF8F3', border: `1px solid ${positive ? '#A8EDDA' : '#F5C5A0'}` }}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: positive ? '#0F8A5F' : '#C0521A' }}>
        {label}
      </p>
      <p className="text-lg font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{note}</p>
    </div>
  )
}
