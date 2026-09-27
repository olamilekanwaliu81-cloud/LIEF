import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { BookOpen, CheckCircle2, ChevronDown, Clock, HelpCircle, Lightbulb, Sprout, TrendingDown, TrendingUp, X } from 'lucide-react'
import { useParent, useStore } from '../lib/store'
import { scoreFor, subjectSummaries } from '../lib/academics'
import { flagsForSubject, guidanceFor } from '../lib/guidance'
import { formatShortDate } from '../lib/format'
import type { SupportAction } from '../lib/types'
import { Button, Callout, Card, Chip, EmptyState, PageHeader, SectionTitle, display, tone, useToast } from './ui'

export default function Support() {
  const { child, actions } = useParent()
  const { startAction, completeAction, removeAction } = useStore()
  const params = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [expanded, setExpanded] = useState<number | null>(0)

  if (!child) return null
  const firstName = child.name.split(' ')[0]
  const summaries = subjectSummaries(child)

  if (summaries.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="How Can I Help?" icon={<Lightbulb size={22} style={{ color: 'var(--accent)' }} />} />
        <Card className="p-2">
          <EmptyState icon={<Lightbulb size={40} />} title="Guidance appears once there are results" body={`Add a result for ${firstName} on the dashboard, or wait for their teacher to upload scores. Guidance is always tied to real results.`}
            action={<Button variant="accent" onClick={() => navigate('/app/dashboard')}>Go to dashboard</Button>} />
        </Card>
      </div>
    )
  }

  const requested = params.subject ? decodeURIComponent(params.subject) : null
  const fallback = [...summaries].sort((a, b) => a.score - b.score)[0]
  const subject = summaries.find(s => s.name === requested) ?? fallback
  const guidance = guidanceFor(firstName, subject, flagsForSubject(subject.name, child.weaknesses))
  const t = tone(guidance.tone === 'concern' ? 'warning' : guidance.tone === 'strength' ? 'success' : 'info')

  const trying = actions.filter(a => a.status === 'trying')
  const done = actions.filter(a => a.status === 'done')
  const activeFor = (title: string) => actions.find(a => a.subject === subject.name && a.title === title && a.status === 'trying')

  const choose = (name: string) => {
    setExpanded(0)
    navigate(`/app/support/${encodeURIComponent(name)}`, { replace: true })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="How Can I Help?"
        icon={<Lightbulb size={22} style={{ color: 'var(--accent)' }} />}
        subtitle={`Practical steps you can take at home to support ${firstName}.`}
      />

      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)', ...display }}>Choose a subject</p>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Subjects">
          {summaries.map(s => (
            <Chip key={s.name} active={s.name === subject.name} onClick={() => choose(s.name)}>
              {s.name}
              {s.status === 'concern' && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--warning-strong)' }} aria-label="needs attention" />}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-5">
          <div className="rounded-xl p-4" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
            <div className="flex items-start gap-3">
              <HelpCircle size={16} className="mt-0.5 shrink-0" style={{ color: t.color }} />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{guidance.context}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', ...display }}>Suggested actions</p>
            <div className="space-y-2">
              {guidance.actions.map((action, i) => {
                const open = expanded === i
                const current = activeFor(action.title)
                return (
                  <div key={action.title} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${current ? 'var(--success-border)' : 'var(--border)'}`, background: 'var(--surface)' }}>
                    <button
                      onClick={() => setExpanded(open ? null : i)}
                      aria-expanded={open}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                      style={{ background: open ? 'var(--muted)' : 'transparent' }}
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ background: current ? 'var(--success)' : 'var(--accent)', color: '#fff', ...display }}>
                        {current ? <CheckCircle2 size={14} /> : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: 'var(--primary)', ...display }}>{action.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={11} style={{ color: 'var(--muted-foreground)' }} />
                          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{action.time}</span>
                          {current && <span className="text-xs font-bold ml-2" style={{ color: 'var(--success)' }}>· Trying since {formatShortDate(current.startedAt)}</span>}
                        </div>
                      </div>
                      <ChevronDown size={15} className="transition-transform" style={{ color: 'var(--muted-foreground)', transform: open ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    {open && (
                      <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{action.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {current ? (
                            <>
                              <Button size="sm" variant="accent" onClick={() => { completeAction(current.id); toast('Marked as done — great work!') }}>
                                <CheckCircle2 size={13} /> Mark as done
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => removeAction(current.id)}>Stop tracking</Button>
                            </>
                          ) : (
                            <Button size="sm" variant="accent" onClick={() => {
                              startAction(child.id, subject.name, action.title)
                              toast(`Tracking “${action.title}” from ${subject.score}/100`)
                            }}>
                              I'll try this ✓
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <Callout t="info" icon={<BookOpen size={16} />} title="Where this guidance comes from">
            Linked to {firstName}'s current {subject.name} score ({subject.score}/100){child.weaknesses.length ? ' and areas flagged by their teacher' : ''}. It is practical support, not a diagnosis — talk to {firstName}'s teacher if you have concerns.
          </Callout>
        </div>

        <aside className="lg:col-span-2 space-y-5">
          <section>
            <SectionTitle icon={<Sprout size={15} />} color="var(--accent)">Your support plan</SectionTitle>
            {trying.length === 0 && done.length === 0 ? (
              <Card className="p-4">
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Choose an action and tap <strong style={{ color: 'var(--foreground)' }}>I'll try this</strong>. LEIF records today's score so you can see whether it improves.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {trying.map(a => <PlanItem key={a.id} action={a} current={scoreFor(child, a.subject) ?? a.baselineScore} onRemove={() => removeAction(a.id)} />)}
                {done.map(a => <PlanItem key={a.id} action={a} current={scoreFor(child, a.subject) ?? a.baselineScore} onRemove={() => removeAction(a.id)} />)}
              </div>
            )}
          </section>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Progress is measured against the score on the day you started. New results from {firstName}'s teacher update it automatically. <Link to="/app/journey" className="font-bold" style={{ color: 'var(--accent)' }}>See the full journey →</Link>
          </p>
        </aside>
      </div>
    </div>
  )
}

function PlanItem({ action, current, onRemove }: { action: SupportAction; current: number; onRemove: () => void }) {
  const delta = current - action.baselineScore
  const isDone = action.status === 'done'
  return (
    <div className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: 'var(--card)', border: '1px solid var(--border)', opacity: isDone ? 0.75 : 1 }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ ...display, color: 'var(--primary)' }}>{action.title}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          {action.subject} · {isDone ? `done ${formatShortDate(action.completedAt!)}` : `since ${formatShortDate(action.startedAt)}`}
        </p>
        <p className="text-xs font-bold mt-1.5 flex items-center gap-1" style={{ color: delta > 0 ? 'var(--success)' : delta < 0 ? 'var(--warning)' : 'var(--muted-foreground)' }}>
          {delta > 0 ? <TrendingUp size={13} /> : delta < 0 ? <TrendingDown size={13} /> : null}
          {action.baselineScore} → {current} {delta !== 0 ? `(${delta > 0 ? '+' : ''}${delta} pts)` : '· waiting for new results'}
        </p>
      </div>
      <button onClick={onRemove} aria-label={`Remove ${action.title}`} className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0" style={{ color: 'var(--muted-foreground)' }}>
        <X size={14} />
      </button>
    </div>
  )
}
