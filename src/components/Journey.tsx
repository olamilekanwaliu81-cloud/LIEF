import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { LineChart as LineIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { Track, useParent } from '../lib/store'
import { TARGET_SCORE, attendanceRate, shortSubject, subjectSummaries } from '../lib/academics'
import { Callout, Card, Chip, EmptyState, PageHeader, Pill, Segmented, display } from './ui'

const PALETTE = ['#1ABF96', '#1E90D4', '#7B5EA7', '#E97B2E', '#D6455D', '#C9A227', '#2FA4A9', '#8C6D52']
const OVERALL_COLOR = '#E97B2E'

type View = 'chart' | 'subjects'

export default function Journey() {
  const { child } = useParent()
  const [params, setParams] = useSearchParams()
  const view: View = params.get('view') === 'subjects' ? 'subjects' : 'chart'
  const [active, setActive] = useState<string>('overall')

  const data = useMemo(() => (child?.history ?? []).map(snap => {
    const vals = Object.values(snap.scores)
    return {
      label: snap.label,
      date: snap.date,
      ...snap.scores,
      overall: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : undefined,
    }
  }), [child?.history])

  if (!child) return null
  const subjects = child.scores.map(s => s.subject)
  const colorOf = (subj: string) => PALETTE[subjects.indexOf(subj) % PALETTE.length]
  const summaries = subjectSummaries(child)
  const first = child.history[0]
  const last = child.history[child.history.length - 1]
  const range = !first ? ''
    : first === last ? `Since ${first.label} ${first.date.slice(0, 4)}`
    : `${first.label} ${first.date.slice(0, 4)} – ${last.label} ${last.date.slice(0, 4)}`

  if (child.history.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Academic Journey" subtitle="Progress over time" />
        <Card className="p-2">
          <EmptyState icon={<LineIcon size={40} />} title="The journey starts with the first result" body={`Each time new scores are added, LEIF records a point here so you can see how ${child.name.split(' ')[0]} changes over time.`} />
        </Card>
      </div>
    )
  }

  // Insights computed from the data shown in the chart (FR-04, FR-08).
  const best = data.reduce((a, b) => ((b.overall ?? 0) >= (a.overall ?? 0) ? b : a), data[0])
  const improvements = subjects.map(s => {
    const firstScore = child.history.find(h => h.scores[s] !== undefined)?.scores[s]
    const current = last.scores[s]
    return { subject: s, change: firstScore === undefined || current === undefined ? 0 : current - firstScore }
  }).sort((a, b) => b.change - a.change)
  const mostImproved = improvements[0]
  const watch = [...summaries].sort((a, b) => a.score - b.score)[0]
  const attendance = attendanceRate(child)

  const seriesToShow = active === 'overall' ? subjects : [active]

  return (
    <div className="space-y-6">
      <Track name="journey_viewed" id={child.id} props={{ points: child.history.length }} />
      <PageHeader title="Academic Journey" subtitle={`Progress over time · ${range}`} />

      <div className="max-w-md">
        <Segmented
          label="Journey view"
          value={view}
          onChange={v => setParams(v === 'subjects' ? { view: v } : {}, { replace: true })}
          options={[{ value: 'chart', label: 'Progress chart' }, { value: 'subjects', label: 'By subject' }]}
        />
      </div>

      {view === 'chart' && (
        <>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Choose subject">
            <Chip active={active === 'overall'} onClick={() => setActive('overall')} activeColor={OVERALL_COLOR}>All subjects</Chip>
            {subjects.map(s => (
              <Chip key={s} active={active === s} onClick={() => setActive(s)} activeColor={colorOf(s)}>{shortSubject(s)}</Chip>
            ))}
          </div>

          <Card className="p-4 sm:p-5">
            <div className="h-[240px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', fontSize: 12, fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}
                    labelStyle={{ color: 'var(--primary)', fontWeight: 700 }}
                  />
                  <ReferenceLine y={TARGET_SCORE} stroke={OVERALL_COLOR} strokeDasharray="4 4" />
                  {seriesToShow.map(s => (
                    <Line
                      key={s}
                      type="monotone" dataKey={s} name={shortSubject(s)} stroke={colorOf(s)}
                      strokeWidth={active === 'overall' ? 1.5 : 3}
                      strokeOpacity={active === 'overall' ? 0.55 : 1}
                      dot={{ r: active === 'overall' ? 2 : 4, fill: colorOf(s) }} activeDot={{ r: 5 }}
                      connectNulls
                    />
                  ))}
                  {active === 'overall' && (
                    <Line type="monotone" dataKey="overall" name="Average" stroke={OVERALL_COLOR} strokeWidth={3} dot={{ r: 4, fill: OVERALL_COLOR }} activeDot={{ r: 6 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--muted-foreground)' }}>
              Dashed line = {TARGET_SCORE} target{active === 'overall' ? ' · Bold orange line = average across subjects' : ''}
            </p>
          </Card>

          {child.history.length < 2 ? (
            <Callout t="info" icon={<LineIcon size={16} />} title="One result so far">
              Change over time appears once there's a second set of results — from a teacher upload or a result you add next month.
            </Callout>
          ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <InsightCard label="Best month" value={best.label} note={`Average reached ${best.overall}`} positive />
            <InsightCard label="Most improved" value={shortSubject(mostImproved.subject)} note={mostImproved.change > 0 ? `+${mostImproved.change} pts since ${first.label}` : 'No gains yet'} positive={mostImproved.change > 0} />
            <InsightCard label="Needs watch" value={shortSubject(watch.name)} note={`Currently ${watch.score}/100`} positive={watch.score >= 65} />
            <InsightCard label="Attendance" value={child.attendance.length ? `${attendance}%` : '—'} note={attendance >= 90 ? 'Consistent attendance' : child.attendance.length ? 'Some days missed' : 'Not recorded yet'} positive={attendance >= 90} />
          </div>
          )}
        </>
      )}

      {view === 'subjects' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {summaries.map(s => (
            <Card key={s.name} className="p-4">
              <div className="flex items-center justify-between mb-2 gap-2">
                <p className="font-bold text-sm" style={{ ...display, color: 'var(--primary)' }}>{s.name}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <Pill t={s.status === 'concern' ? 'warning' : s.status === 'strength' ? 'success' : 'neutral'}>
                    {s.status === 'concern' ? 'Needs attention' : s.status === 'strength' ? 'Strength' : 'Steady'}
                  </Pill>
                  <span className="flex items-center gap-1 text-xs font-bold" style={{ color: s.trend > 0 ? 'var(--accent)' : s.trend < 0 ? 'var(--warning-strong)' : 'var(--muted-foreground)' }}>
                    {s.trend > 0 ? <TrendingUp size={13} /> : s.trend < 0 ? <TrendingDown size={13} /> : <Minus size={13} />}
                    {s.trend > 0 ? `+${s.trend}` : s.trend === 0 ? '—' : s.trend}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }} role="meter" aria-valuenow={s.score} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} score`}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.score}%`, background: s.status === 'concern' ? 'var(--warning-strong)' : s.status === 'strength' ? 'var(--accent)' : 'var(--info)' }} />
                </div>
                <span className="text-sm font-black w-8 text-right" style={{ ...display, color: 'var(--primary)' }}>{s.score}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function InsightCard({ label, value, note, positive }: { label: string; value: string; note: string; positive: boolean }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: positive ? 'var(--success-bg)' : 'var(--warning-bg)', border: `1px solid ${positive ? 'var(--success-border)' : 'var(--warning-border)'}` }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: positive ? 'var(--success)' : 'var(--warning)' }}>{label}</p>
      <p className="text-lg font-black truncate" style={{ ...display, color: 'var(--primary)' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{note}</p>
    </div>
  )
}
