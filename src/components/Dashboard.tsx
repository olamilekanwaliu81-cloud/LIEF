import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Clock, MessageSquareQuote, Plus, Sprout, TrendingDown, TrendingUp } from 'lucide-react'
import { useParent, useStore } from '../lib/store'
import { attendanceRate, average, recentActivity, subjectSummaries, scoreFor } from '../lib/academics'
import { formatDate, formatShortDate, greeting } from '../lib/format'
import { getSubjectsForClass } from '../data/grades'
import ScoreRing from './ScoreRing'
import { Button, Callout, Card, EmptyState, Modal, PageHeader, SectionTitle, SelectField, TextField, display, useToast } from './ui'

export default function Dashboard() {
  const { parent, child, actions } = useParent()
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  if (!parent || !child) return <NoChild />

  const summaries = subjectSummaries(child)
  const concerns = summaries.filter(s => s.status === 'concern').sort((a, b) => a.score - b.score)
  const strengths = summaries.filter(s => s.status === 'strength').sort((a, b) => b.score - a.score)
  const activity = recentActivity(child)
  const trying = actions.filter(a => a.status === 'trying')
  const firstName = child.name.split(' ')[0]
  const hasScores = child.scores.length > 0

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${greeting()}, ${parent.firstName}`}
        title={`${firstName}'s Overview`}
        subtitle={[child.class, child.school, hasScores && `Updated ${formatDate(child.lastUpdated)}`].filter(Boolean).join(' · ')}
        action={child.sampleData && hasScores ? <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}><Plus size={14} /> Add result</Button> : undefined}
      />

      {!hasScores ? (
        <Card className="p-2">
          <EmptyState
            icon={<Sprout size={40} />}
            title={`No results for ${firstName} yet`}
            body={`When ${firstName}'s teacher uploads scores on LEIF they'll appear here automatically. You can also add a recent result from a report card or test.`}
            action={<Button variant="accent" onClick={() => setAddOpen(true)}><Plus size={15} /> Add a result</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ScoreCard average={average(child)} attendance={attendanceRate(child)} subjects={child.scores.length} hasAttendance={child.attendance.length > 0} />

            {concerns.length > 0 && (
              <section>
                <SectionTitle icon={<AlertTriangle size={15} />} color="var(--warning-strong)">Needs attention</SectionTitle>
                <div className="space-y-2">
                  {concerns.map(s => (
                    <button
                      key={s.name}
                      onClick={() => navigate(`/app/support/${encodeURIComponent(s.name)}`)}
                      className="w-full text-left rounded-xl p-4 flex items-center gap-4 transition-all hover:opacity-90 active:scale-[0.99]"
                      style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }}
                    >
                      <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ background: 'var(--warning-strong)', color: '#fff', ...display }}>
                        {s.score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>{s.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--warning)' }}>
                          {s.trend < 0 ? `Down ${Math.abs(s.trend)} pts` : s.trend > 0 ? `Up ${s.trend} pts, still below target` : 'Below the 65 target'} · See how you can help
                        </p>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--warning-strong)' }} />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {strengths.length > 0 && (
              <section>
                <SectionTitle icon={<CheckCircle2 size={15} />} color="var(--accent)" action={<Link to="/app/journey?view=subjects" className="text-xs font-bold" style={{ color: 'var(--muted-foreground)', ...display }}>All subjects →</Link>}>
                  Strengths
                </SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {strengths.map(s => (
                    <Link key={s.name} to={`/app/support/${encodeURIComponent(s.name)}`} className="rounded-xl p-3.5 transition-all hover:opacity-90" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-lg font-black" style={{ ...display, color: 'var(--primary)' }}>{s.score}</p>
                        {s.trend !== 0 && <span className="text-xs font-bold" style={{ color: s.trend > 0 ? 'var(--accent)' : 'var(--muted-foreground)' }}>{s.trend > 0 ? '+' : ''}{s.trend}</span>}
                      </div>
                      <p className="text-xs font-semibold leading-snug" style={{ color: 'var(--foreground)' }}>{s.name}</p>
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                        <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: 'var(--accent)' }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {concerns.length === 0 && (
              <Callout t="success" icon={<CheckCircle2 size={16} />} title="No subjects need attention right now">
                Every subject is at or above target. Keep an eye on the Journey to see how {firstName} progresses.
              </Callout>
            )}
          </div>

          <div className="space-y-6">
            {child.teacherNote && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareQuote size={15} style={{ color: 'var(--accent)' }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ ...display, color: 'var(--muted-foreground)' }}>Note from teacher</p>
                </div>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--foreground)' }}>“{child.teacherNote}”</p>
              </Card>
            )}

            <section>
              <SectionTitle icon={<Sprout size={15} />} color="var(--accent)">Support in progress</SectionTitle>
              {trying.length === 0 ? (
                <Card className="p-4">
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    You're not tracking any actions yet. Pick one from <Link to="/app/support" className="font-bold" style={{ color: 'var(--accent)' }}>How Can I Help?</Link> and LEIF will show whether it's making a difference.
                  </p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {trying.map(a => {
                    const now = scoreFor(child, a.subject) ?? a.baselineScore
                    const delta = now - a.baselineScore
                    return (
                      <Link key={a.id} to={`/app/support/${encodeURIComponent(a.subject)}`} className="block rounded-xl p-3.5 transition-all hover:opacity-90" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <p className="text-sm font-bold" style={{ ...display, color: 'var(--primary)' }}>{a.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{a.subject} · since {formatShortDate(a.startedAt)}</p>
                        <p className="text-xs font-bold mt-2 flex items-center gap-1" style={{ color: delta > 0 ? 'var(--success)' : delta < 0 ? 'var(--warning)' : 'var(--muted-foreground)' }}>
                          {delta > 0 ? <TrendingUp size={13} /> : delta < 0 ? <TrendingDown size={13} /> : null}
                          {a.baselineScore} → {now} {delta !== 0 ? `(${delta > 0 ? '+' : ''}${delta})` : '· no change yet'}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              )}
            </section>

            <section>
              <SectionTitle icon={<Clock size={15} />}>Recent activity</SectionTitle>
              {activity.length === 0 ? (
                <Card className="p-4"><p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No recent activity recorded.</p></Card>
              ) : (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  {activity.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < activity.length - 1 ? '1px solid var(--border)' : 'none', background: item.flag ? 'var(--warning-bg)' : 'var(--surface)' }}
                    >
                      <p className="text-xs font-bold w-11 shrink-0" style={{ color: 'var(--muted-foreground)' }}>{formatShortDate(item.date)}</p>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--primary)' }}>{item.subject}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{item.type}</p>
                      </div>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          background: item.flag ? 'var(--warning-border)' : item.done ? 'var(--success-bg)' : 'var(--secondary)',
                          color: item.flag ? 'var(--warning)' : item.done ? 'var(--success)' : 'var(--primary)',
                        }}
                      >
                        {item.result}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {child.sampleData && (
        <Callout t="caution" title="Parent-entered data">
          {firstName}'s results here were added by you, not uploaded by a school. Once their teacher joins LEIF, official scores will replace them.
        </Callout>
      )}

      <AddResultModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

function ScoreCard({ average, attendance, subjects, hasAttendance }: { average: number; attendance: number; subjects: number; hasAttendance: boolean }) {
  return (
    <div className="rounded-2xl p-5 sm:p-6 flex items-center gap-5 sm:gap-8" style={{ background: 'var(--hero)' }}>
      <div className="shrink-0" aria-hidden>
        <ScoreRing score={average} size={96} strokeWidth={7} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Average score</p>
        <p className="text-4xl font-black" style={{ ...display, color: '#fff' }}>
          {average}<span className="text-lg font-semibold ml-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>/100</span>
        </p>
        <div className="flex gap-6 mt-3">
          <Stat label="Attendance" value={hasAttendance ? `${attendance}%` : '—'} />
          <Stat label="Subjects" value={String(subjects)} />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
      <p className="text-lg font-bold" style={{ ...display, color: '#fff' }}>{value}</p>
    </div>
  )
}

/** Parent-entered result (PRD §10 "parent entry") for children without teacher data. */
function AddResultModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { child } = useParent()
  const { addParentResult } = useStore()
  const toast = useToast()
  const [subject, setSubject] = useState('')
  const [score, setScore] = useState('')
  const [error, setError] = useState('')
  if (!child) return null
  const subjects = getSubjectsForClass(child.class)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = Number(score)
    if (!subject) return setError('Choose a subject.')
    if (score === '' || Number.isNaN(n) || n < 0 || n > 100) return setError('Enter a score between 0 and 100.')
    addParentResult(child.id, subject, Math.round(n))
    toast(`${subject} result saved`)
    setSubject(''); setScore(''); setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a result" description={`Enter a recent score for ${child.name.split(' ')[0]} from a test or report card.`}>
      <form onSubmit={submit} className="space-y-4">
        <SelectField label="Subject" value={subject} onChange={v => { setSubject(v); setError('') }}>
          <option value="">Select subject</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </SelectField>
        <TextField label="Score (out of 100)" type="number" inputMode="numeric" min={0} max={100} value={score} onChange={v => { setScore(v); setError('') }} placeholder="e.g. 72" error={error} />
        <Button type="submit" variant="accent" block size="lg">Save result <ArrowRight size={16} /></Button>
      </form>
    </Modal>
  )
}

function NoChild() {
  const navigate = useNavigate()
  return (
    <Card className="p-2">
      <EmptyState
        icon={<Sprout size={40} />}
        title="Add your child to get started"
        body="LEIF shows your child's progress, strengths and areas needing attention once their profile is set up."
        action={<Button variant="accent" onClick={() => navigate('/app/children/new')}><Plus size={15} /> Add a child</Button>}
      />
    </Card>
  )
}
