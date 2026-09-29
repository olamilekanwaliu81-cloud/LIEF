import { useNavigate } from 'react-router'
import { CalendarClock, CheckCircle2, Circle, LogOut, PartyPopper, Star } from 'lucide-react'
import { useLearner, useStore } from '../lib/store'
import { shortSubject, subjectSummaries } from '../lib/academics'
import { formatShortDate, todayISO } from '../lib/format'
import { Button, Card, EmptyState, Logo, Pill, SectionTitle, display, useToast } from './ui'

/** Lightweight learner workflow (PRD §11): Journey → Current activity → Complete → Next step. */
export default function LearnerHome() {
  const learner = useLearner()
  const { submitAssignment, signOut, track } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  if (!learner) return null

  const firstName = learner.name.split(' ')[0]
  const today = todayISO()
  const todo = learner.assignments.filter(a => !a.submitted).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const done = learner.assignments.filter(a => a.submitted).sort((a, b) => (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''))
  const next = todo[0]
  const subjects = subjectSummaries(learner)
  // Only genuine strengths; an encouraging page shouldn't praise a 45.
  const best = subjects.filter(s => s.score >= 70).sort((a, b) => b.score - a.score).slice(0, 3)

  const finish = (id: string, title: string) => {
    submitAssignment(id)
    track('learner_task_completed', { assignment: id })
    toast(`Nice work! “${title}” is done 🎉`)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header className="sticky top-0 z-30 border-b" style={{ background: 'var(--hero)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <Logo light />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', ...display }}>Learner</span>
          </div>
          <button onClick={() => { signOut(); navigate('/') }} className="flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-bold" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', ...display }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-black" style={{ ...display, color: 'var(--primary)' }}>Hi {firstName}! 👋</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{learner.class} · {todo.length === 0 ? 'You’re all caught up.' : `${todo.length} thing${todo.length === 1 ? '' : 's'} to do`}</p>
        </div>

        {/* Next step */}
        {next ? (
          <div className="rounded-2xl p-5 sm:p-6" style={{ background: 'var(--hero)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)', ...display }}>Your next step</p>
            <p className="text-xl sm:text-2xl font-black text-white" style={display}>{next.title}</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {next.subject} · {next.dueDate < today ? `was due ${formatShortDate(next.dueDate)} — finish it when you can` : `due ${formatShortDate(next.dueDate)}`}
            </p>
            <Button variant="accent" size="lg" className="mt-5" onClick={() => finish(next.id, next.title)}>
              <CheckCircle2 size={18} /> I've finished it
            </Button>
          </div>
        ) : (
          <Card className="p-2">
            {learner.assignments.length === 0
              ? <EmptyState icon={<CalendarClock size={40} />} title="No tasks yet" body="When your teacher sets work on LEIF, it will show up here. Why not read a book you enjoy?" />
              : <EmptyState icon={<PartyPopper size={40} />} title="Everything is done!" body="Your teacher will add new tasks soon. Why not read a book you enjoy?" />}
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section>
            <SectionTitle icon={<CalendarClock size={15} />}>To do</SectionTitle>
            {todo.length === 0 ? (
              <Card className="p-4"><p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Nothing left to do. 🌟</p></Card>
            ) : (
              <ul className="space-y-2">
                {todo.map(a => (
                  <li key={a.id} className="rounded-xl p-3.5 flex items-center gap-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <button onClick={() => finish(a.id, a.title)} aria-label={`Mark “${a.title}” as done`} className="w-9 h-9 flex items-center justify-center rounded-full shrink-0" style={{ color: 'var(--accent)' }}>
                      <Circle size={22} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ ...display, color: 'var(--primary)' }}>{a.title}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{shortSubject(a.subject)} · due {formatShortDate(a.dueDate)}</p>
                    </div>
                    {a.dueDate < today && <Pill t="caution">Late</Pill>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <SectionTitle icon={<CheckCircle2 size={15} />} color="var(--accent)">Done</SectionTitle>
            {done.length === 0 ? (
              <Card className="p-4"><p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Finished tasks will show up here.</p></Card>
            ) : (
              <ul className="space-y-2">
                {done.map(a => (
                  <li key={a.id} className="rounded-xl p-3.5 flex items-center gap-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <CheckCircle2 size={22} className="shrink-0 mx-1.5" style={{ color: 'var(--accent)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ ...display, color: 'var(--primary)' }}>{a.title}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{shortSubject(a.subject)}</p>
                    </div>
                    {a.score !== undefined ? <Pill t="success">{a.score}/100</Pill> : <Pill>Waiting for teacher</Pill>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {best.length > 0 && (
          <section>
            <SectionTitle icon={<Star size={15} />} color="var(--accent)">You're great at</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {best.map(s => (
                <Card key={s.name} className="p-4">
                  <p className="text-sm font-bold" style={{ ...display, color: 'var(--primary)' }}>{s.name}</p>
                  <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                    <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: 'var(--accent)' }} />
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>{s.score}/100{s.trend > 0 ? ` · up ${s.trend}!` : ''}</p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
