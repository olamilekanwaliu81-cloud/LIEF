import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  AlertTriangle, ArrowLeft, BarChart2, CalendarCheck, CheckCircle2, ChevronDown, ChevronRight, Clock,
  ClipboardList, Copy, Edit3, Link2, LogOut, Megaphone, Phone, Plus, Search, Sprout, Trash2, Upload, UserPlus, Users, X,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useStore, useTeacher } from '../lib/store'
import { attendanceRate, average, shortSubject } from '../lib/academics'
import { formatDate, formatLongDate, formatShortDate, greeting, initials, todayISO } from '../lib/format'
import { getSubjectsForClass } from '../data/grades'
import type { AttendanceStatus, PerformanceStatus, StudentRecord } from '../lib/types'
import { LEGAL_LINKS, LinkRow, ResetDemoButton, SettingsSection, ThemePicker } from './Settings'
import {
  Button, Callout, Card, Chip, EmptyState, Modal, PageHeader, Pill, SectionTitle, SelectField, TextField,
  display, scoreTone, statusConfig, tone, useToast,
} from './ui'

const TERMS = ['First Term', 'Second Term', 'Third Term']

const ATTENDANCE: { key: AttendanceStatus; label: string; name: string; color: string }[] = [
  { key: 'present', label: 'P', name: 'Present', color: 'var(--accent)' },
  { key: 'late', label: 'L', name: 'Late', color: 'var(--warning-strong)' },
  { key: 'excused', label: 'E', name: 'Excused', color: 'var(--purple)' },
  { key: 'absent', label: 'A', name: 'Absent', color: 'var(--warning)' },
]

function Avatar({ s, size = 40 }: { s: StudentRecord; size?: number }) {
  const c = tone(statusConfig[s.status].tone)
  return (
    <div className="rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ width: size, height: size, background: c.bg, color: c.color, ...display }}>
      {initials(s.name)}
    </div>
  )
}

function NoStudents({ action }: { action?: React.ReactNode }) {
  const { teacher } = useTeacher()
  return (
    <Card className="p-2">
      <EmptyState
        icon={<Users size={40} />}
        title="No students in your classes yet"
        body={`Students appear here when a parent registers their child at ${teacher?.school ?? 'your school'} in ${teacher?.classes.join(' or ') ?? 'your classes'}, or when you add them yourself.`}
        action={action}
      />
    </Card>
  )
}

/** Teacher adds a learner before any parent has joined LEIF. */
function AddStudentForm({ onAdded, onCancel }: { onAdded: (s: StudentRecord) => void; onCancel: () => void }) {
  const { teacher } = useTeacher()
  const { addStudent } = useStore()
  const [form, setForm] = useState({ name: '', class: teacher?.classes.length === 1 ? teacher.classes[0] : '', age: '', gender: '', parentName: '', parentPhone: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  if (!teacher) return null
  const set = (k: keyof typeof form) => (v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors({}) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.name.trim().split(/\s+/).length < 2) errs.name = 'Enter the learner’s first and last name.'
    if (!form.class) errs.class = 'Choose a class.'
    if (form.age && (Number(form.age) < 2 || Number(form.age) > 19)) errs.age = 'Enter an age between 2 and 19.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    const student = await addStudent({
      name: form.name, class: form.class, age: form.age ? Number(form.age) : undefined,
      gender: form.gender === 'M' || form.gender === 'F' ? form.gender : undefined,
      parentName: form.parentName, parentPhone: form.parentPhone,
    })
    setSaving(false)
    if (student) onAdded(student)
  }

  return (
    <Card className="p-4 sm:p-5">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <p className="text-sm font-black" style={{ ...display, color: 'var(--foreground)' }}>Add a student</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Full name *" value={form.name} onChange={set('name')} placeholder="e.g. Tunde Bakare" error={errors.name} />
          <SelectField label="Class *" value={form.class} onChange={set('class')} error={errors.class}>
            <option value="">Select class</option>
            {teacher.classes.map(c => <option key={c} value={c}>{c}</option>)}
          </SelectField>
          <TextField label="Age" type="number" inputMode="numeric" value={form.age} onChange={set('age')} placeholder="e.g. 9" error={errors.age} />
          <SelectField label="Gender" value={form.gender} onChange={set('gender')}>
            <option value="">Prefer not to say</option>
            <option value="F">Female</option>
            <option value="M">Male</option>
          </SelectField>
          <TextField label="Parent / guardian name" value={form.parentName} onChange={set('parentName')} placeholder="Optional" autoComplete="off" />
          <TextField label="Parent phone" type="tel" value={form.parentPhone} onChange={set('parentPhone')} placeholder="Optional, e.g. +234 …" autoComplete="off" />
        </div>
        <Callout t="info" icon={<Link2 size={15} />}>
          The student joins {teacher.school}. You’ll get a code to give the parent so they can connect on LEIF and see this child’s progress.
        </Callout>
        <div className="flex gap-2">
          <Button type="submit" variant="accent" className="flex-1" loading={saving}><UserPlus size={15} /> Add student</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}

/** The two codes a parent needs to connect to a learner the teacher added. */
function ParentConnectCard({ student, title }: { student: StudentRecord; title: string }) {
  const toast = useToast()
  if (student.parentId || !student.linkCode) return null
  const message = `Hello${student.parentName ? ` ${student.parentName}` : ''}, ${student.name} is on LEIF, where you can follow their progress at school. `
    + `Create a free parent account at ${location.origin}/signup?connect=1 and enter learner code ${student.id} and link code ${student.linkCode}.`
  const copy = async () => {
    try { await navigator.clipboard.writeText(message); toast('Message copied. Paste it into SMS or WhatsApp') }
    catch { toast('Couldn’t copy. Select the codes and copy them manually', 'warning') }
  }
  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--caution-bg)', border: '1px solid var(--caution-border)' }}>
      <div className="flex items-start gap-2">
        <Link2 size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--caution)' }} />
        <div>
          <p className="text-sm font-bold" style={{ ...display, color: 'var(--foreground)' }}>{title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Give these to the parent. They sign up on LEIF and choose “I have a code”.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[['Learner code', student.id], ['Parent link code', student.linkCode]].map(([label, value]) => (
          <div key={label} className="rounded-lg px-3 py-2" style={{ background: 'var(--surface)' }}>
            <p className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
            <p className="text-base font-black font-mono tracking-wider select-all" style={{ color: 'var(--primary)' }}>{value}</p>
          </div>
        ))}
      </div>
      <Button size="sm" variant="secondary" onClick={copy}><Copy size={13} /> Copy message for the parent</Button>
    </div>
  )
}

// ── OVERVIEW ─────────────────────────────────────────────────────────────
export function TeacherOverview() {
  const { teacher, students } = useTeacher()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const subjectMap: Record<string, number[]> = {}
    students.forEach(s => s.scores.forEach(sc => { (subjectMap[sc.subject] ??= []).push(sc.score) }))
    return {
      classAvg: students.length ? Math.round(students.reduce((a, s) => a + average(s), 0) / students.length) : 0,
      counts: {
        excellent: students.filter(s => s.status === 'excellent').length,
        good: students.filter(s => s.status === 'good').length,
        average: students.filter(s => s.status === 'average').length,
        watch: students.filter(s => s.status === 'needs-attention' || s.status === 'critical').length,
      },
      subjectData: Object.entries(subjectMap)
        .map(([name, scores]) => ({ name: shortSubject(name), full: name, avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) }))
        .sort((a, b) => b.avg - a.avg),
      missing: students.flatMap(s => s.assignments.filter(a => !a.submitted && a.dueDate < todayISO())).length,
      toMark: students.flatMap(s => s.assignments.filter(a => a.submitted && a.score === undefined)).length,
    }
  }, [students])

  if (!teacher) return null
  const atRisk = students.filter(s => s.status === 'critical' || s.status === 'needs-attention')

  return (
    <div className="space-y-6">
      <PageHeader title={`${greeting()}, ${teacher.title ? `${teacher.title} ${teacher.lastName}` : teacher.firstName}`} subtitle={`${teacher.school} · ${teacher.classes.join(', ')}`} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <QuickStat value={students.length} label="Total students" t="info" />
        <QuickStat value={stats.classAvg} label="Class average" suffix="/100" t="success" />
        <QuickStat value={stats.counts.watch} label="Need attention" t="warning" />
        <QuickStat value={stats.missing} label="Missing work" t="caution" />
      </div>

      {students.length === 0 ? <NoStudents /> : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ ...display, color: 'var(--muted-foreground)' }}>Class performance distribution</p>
            <div className="flex gap-2">
              {([['excellent', 'Excellent', 'success'], ['good', 'Good', 'info'], ['average', 'Average', 'purple'], ['watch', 'At risk', 'warning']] as const).map(([key, label, t]) => {
                const count = stats.counts[key]
                const pct = students.length ? Math.round((count / students.length) * 100) : 0
                return (
                  <div key={key} className="flex-1 flex flex-col gap-1 text-center">
                    <div className="h-24 rounded-lg flex items-end" style={{ background: 'var(--muted)' }}>
                      <div className="w-full rounded-lg transition-all" style={{ height: `${pct}%`, minHeight: count > 0 ? 8 : 0, background: tone(t).color }} />
                    </div>
                    <p className="text-sm font-black" style={{ color: tone(t).color, ...display }}>{count}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ ...display, color: 'var(--muted-foreground)' }}>Subject averages</p>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.subjectData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: 12, fontFamily: 'Quicksand, sans-serif' }} />
                  <Bar dataKey="avg" name="Average" radius={[4, 4, 0, 0]}>
                    {stats.subjectData.map(d => <Cell key={d.full} fill={d.avg >= 70 ? '#1ABF96' : d.avg >= 50 ? '#E97B2E' : '#C0521A'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {atRisk.length > 0 && (
            <section className="lg:col-span-2">
              <SectionTitle icon={<AlertTriangle size={14} />} color="var(--warning)">Needs immediate attention</SectionTitle>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {atRisk.map(s => {
                  const cfg = statusConfig[s.status]
                  const c = tone(cfg.tone)
                  return (
                    <Link key={s.id} to={`/teacher/students/${s.id}`} className="rounded-xl px-4 py-3 flex items-center gap-3 transition-all hover:opacity-90" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                      <Avatar s={s} size={34} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)', ...display }}>{s.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Avg {average(s)}/100 · {cfg.label}</p>
                      </div>
                      <ChevronRight size={15} style={{ color: c.color }} />
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <QuickAction onClick={() => navigate('/teacher/scores')} Icon={Upload} title="Upload scores" note="Publish term results" primary />
        <QuickAction onClick={() => navigate('/teacher/attendance')} Icon={CalendarCheck} title="Take attendance" note={formatShortDate(todayISO())} />
        <QuickAction onClick={() => navigate('/teacher/assignments')} Icon={ClipboardList} title="Assignments" note={stats.toMark ? `${stats.toMark} to mark` : 'Set new work'} />
      </div>
    </div>
  )
}

function QuickStat({ value, label, t, suffix = '' }: { value: number; label: string; t: 'info' | 'success' | 'warning' | 'caution'; suffix?: string }) {
  const c = tone(t)
  return (
    <div className="rounded-xl p-3.5" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <p className="text-2xl font-black" style={{ ...display, color: c.color }}>{value}<span className="text-sm">{suffix}</span></p>
      <p className="text-xs mt-0.5 font-semibold leading-snug" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
    </div>
  )
}

function QuickAction({ onClick, Icon, title, note, primary }: { onClick: () => void; Icon: React.ElementType; title: string; note: string; primary?: boolean }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 rounded-xl p-4 text-left transition-all hover:opacity-90" style={primary ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--secondary)', color: 'var(--primary)', border: '1px solid var(--border)' }}>
      <Icon size={18} />
      <div>
        <p className="text-sm font-bold" style={display}>{title}</p>
        <p className="text-xs" style={{ opacity: primary ? 0.8 : 1, color: primary ? undefined : 'var(--muted-foreground)' }}>{note}</p>
      </div>
    </button>
  )
}

// ── STUDENTS ─────────────────────────────────────────────────────────────
export function TeacherStudents() {
  const { teacher, students } = useTeacher()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PerformanceStatus | 'all'>('all')
  const [cls, setCls] = useState('all')
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState<StudentRecord | null>(null)
  const navigate = useNavigate()

  if (!teacher) return null
  const addButton = !adding && <Button variant="accent" onClick={() => { setAdded(null); setAdding(true) }}><UserPlus size={15} /> Add student</Button>
  const filtered = students
    .filter(s => {
      const q = search.trim().toLowerCase()
      return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    })
    .filter(s => status === 'all' || s.status === status)
    .filter(s => cls === 'all' || s.class === cls)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="space-y-5">
      <PageHeader title="Students" subtitle={`${students.length} learner${students.length === 1 ? '' : 's'} across ${teacher.classes.join(', ')}`} action={students.length > 0 ? addButton : undefined} />

      {adding && <AddStudentForm onCancel={() => setAdding(false)} onAdded={s => { setAdding(false); setAdded(s) }} />}
      {added && (
        <div className="space-y-2">
          <ParentConnectCard student={students.find(s => s.id === added.id) ?? added} title={`${added.name} was added to ${added.class}`} />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => navigate(`/teacher/students/${added.id}`)}>Open {added.name.split(' ')[0]}’s profile</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdded(null); setAdding(true) }}><Plus size={13} /> Add another</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdded(null)}>Done</Button>
          </div>
        </div>
      )}

      {students.length === 0 ? (!adding && !added && <NoStudents action={addButton} />) : (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or learner code…" aria-label="Search students by name or learner code" className="field !pl-9 !py-2.5" />
            </div>
            <div className="flex gap-2">
              <Dropdown label="Filter by class" value={cls} onChange={setCls} options={[['all', 'All classes'], ...teacher.classes.map(c => [c, c] as [string, string])]} />
              <Dropdown label="Filter by status" value={status} onChange={v => setStatus(v as PerformanceStatus | 'all')} options={[['all', 'All statuses'], ...Object.entries(statusConfig).map(([k, v]) => [k, v.label] as [string, string])]} />
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }} aria-live="polite">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>

          {filtered.length === 0 ? (
            <EmptyState icon={<Search size={36} />} title="No students match" body="Try a different name or filter." />
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {filtered.map(s => {
                const cfg = statusConfig[s.status]
                const missing = s.assignments.filter(a => !a.submitted && a.dueDate < todayISO()).length
                return (
                  <Link key={s.id} to={`/teacher/students/${s.id}`} className="rounded-xl flex items-center gap-3 px-4 py-3 transition-all hover:opacity-90" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <Avatar s={s} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--foreground)', ...display }}>{s.name}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.class}</span>
                        <Pill t={cfg.tone}>{s.scores.length ? cfg.label : 'No scores yet'}</Pill>
                        {!s.parentId && <Pill t="caution">No parent yet</Pill>}
                        {missing > 0 && <span className="text-xs font-bold" style={{ color: 'var(--warning)' }}>{missing} missing</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black" style={{ ...display, color: 'var(--foreground)' }}>{s.scores.length ? average(s) : '—'}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>avg</p>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Dropdown({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="relative flex-1 sm:flex-none">
      <select value={value} onChange={e => onChange(e.target.value)} aria-label={label} className="field appearance-none !py-2.5 !pr-8 font-semibold">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
    </div>
  )
}

export function TeacherStudentDetail() {
  const { id } = useParams()
  const { students } = useTeacher()
  const { db } = useStore()
  const navigate = useNavigate()
  const s = students.find(x => x.id === id)

  if (!s) {
    return <EmptyState icon={<Users size={40} />} title="Student not found" body="They may not be in your classes." action={<Button variant="secondary" onClick={() => navigate('/teacher/students')}>Back to students</Button>} />
  }

  const cfg = statusConfig[s.status]
  const c = tone(cfg.tone)
  const rate = attendanceRate(s)
  const presentDays = s.attendance.filter(a => a.status === 'present' || a.status === 'late').length
  const parentActions = s.privacy.shareActivityWithTeacher ? db.actions.filter(a => a.studentId === s.id) : []

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate('/teacher/students')} aria-label="Back to students" className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
          <ArrowLeft size={16} />
        </button>
        <Avatar s={s} size={44} />
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-xl truncate" style={{ ...display, color: 'var(--primary)' }}>{s.name}</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.class} · {s.id}</p>
        </div>
        <Button variant="accent" size="sm" onClick={() => navigate(`/teacher/scores/${s.id}`)}><Upload size={13} /> Update scores</Button>
      </div>

      <ParentConnectCard student={s} title="Not connected to a parent yet" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: c.bg, border: `1.5px solid ${c.border}` }}>
            <div>
              <p className="font-black text-sm" style={{ ...display, color: c.color }}>{s.scores.length ? cfg.label : 'No scores yet'}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Updated {formatDate(s.lastUpdated)}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-black" style={{ ...display, color: c.color }}>{s.scores.length ? average(s) : '—'}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>avg score</p>
            </div>
          </div>

          <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
            <Phone size={14} style={{ color: 'var(--muted-foreground)' }} />
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{s.parentName || 'Parent'}</p>
              {s.parentPhone ? <a href={`tel:${s.parentPhone.replace(/\s/g, '')}`} className="text-xs underline" style={{ color: 'var(--muted-foreground)' }}>{s.parentPhone}</a> : <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Contact via LEIF</p>}
            </div>
          </div>

          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', ...display }}>Attendance</p>
            {s.attendance.length === 0 ? <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Not recorded yet.</p> : (
              <>
                <div className="flex items-center gap-4 mb-3">
                  <p className="text-2xl font-black" style={{ ...display, color: rate >= 80 ? 'var(--success)' : 'var(--warning)' }}>{rate}%</p>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{presentDays}/{s.attendance.length} days present</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {s.attendance.map(a => {
                    const opt = ATTENDANCE.find(o => o.key === a.status)!
                    return <div key={a.date} title={`${formatShortDate(a.date)}: ${opt.name}`} aria-label={`${formatShortDate(a.date)}: ${opt.name}`} className="w-6 h-6 rounded" style={{ background: opt.color }} />
                  })}
                </div>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {ATTENDANCE.map(o => (
                    <div key={o.key} className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: o.color }} /><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{o.name}</span></div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {s.teacherNote && (
            <div className="rounded-xl p-4" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--primary)', ...display }}>Your note to parent</p>
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--foreground)' }}>“{s.teacherNote}”</p>
            </div>
          )}

          {parentActions.length > 0 && (
            <Card className="p-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--accent)', ...display }}><Sprout size={13} /> Support at home</p>
              <ul className="space-y-2">
                {parentActions.map(a => (
                  <li key={a.id} className="text-sm" style={{ color: 'var(--foreground)' }}>
                    <strong>{a.title}</strong> <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>· {a.subject} · {a.status === 'done' ? 'done' : `since ${formatShortDate(a.startedAt)}`}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>Shared by the parent. They can turn this off at any time.</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', ...display }}>{s.scores[0]?.term ?? 'Term'} scores</p>
            {s.scores.length === 0 && <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No scores uploaded yet.</p>}
            {s.scores.map(sc => (
              <div key={sc.subject} className="flex items-center gap-3 mb-2">
                <span className="text-xs flex-1 truncate" style={{ color: 'var(--foreground)' }}>{sc.subject}</span>
                <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                  <div className="h-full rounded-full" style={{ width: `${sc.score}%`, background: tone(scoreTone(sc.score)).color }} />
                </div>
                <span className="text-xs font-black w-6 text-right" style={{ ...display, color: 'var(--foreground)' }}>{sc.score}</span>
              </div>
            ))}
          </Card>

          {(s.weaknesses.length > 0 || s.strengths.length > 0) && (
            <Card className="p-4 space-y-3">
              {s.weaknesses.length > 0 && (
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--warning)' }}>Areas needing support</p>
                  <div className="flex flex-wrap gap-2">{s.weaknesses.map(w => <Pill key={w} t="warning">{w}</Pill>)}</div>
                </div>
              )}
              {s.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--success)' }}>Strengths</p>
                  <div className="flex flex-wrap gap-2">{s.strengths.map(w => <Pill key={w} t="success">{w}</Pill>)}</div>
                </div>
              )}
            </Card>
          )}

          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', ...display }}>Assignments</p>
            {s.assignments.length === 0 && <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>None set.</p>}
            {s.assignments.map(a => {
              const overdue = !a.submitted && a.dueDate < todayISO()
              return (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: a.submitted ? 'var(--success-bg)' : overdue ? 'var(--warning-bg)' : 'var(--secondary)' }}>
                    {a.submitted ? <CheckCircle2 size={13} style={{ color: 'var(--success)' }} /> : <Clock size={13} style={{ color: overdue ? 'var(--warning)' : 'var(--muted-foreground)' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{a.title}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Due {formatShortDate(a.dueDate)}</p>
                  </div>
                  {a.score !== undefined ? <span className="text-xs font-bold" style={{ color: 'var(--success)' }}>{a.score}/100</span>
                    : a.submitted ? <span className="text-xs font-bold" style={{ color: 'var(--info)' }}>To mark</span>
                    : overdue ? <span className="text-xs font-bold" style={{ color: 'var(--warning)' }}>Missing</span>
                    : <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Pending</span>}
                </div>
              )
            })}
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── SCORES UPLOAD ────────────────────────────────────────────────────────
export function TeacherScores() {
  const { id } = useParams()
  const { students } = useTeacher()
  const navigate = useNavigate()
  if (students.length === 0) return <div className="space-y-5"><PageHeader title="Upload scores" /><NoStudents /></div>
  const student = students.find(s => s.id === id) ?? [...students].sort((a, b) => a.name.localeCompare(b.name))[0]

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader title="Upload scores" subtitle="Scores, flags and notes publish straight to the parent's dashboard." />
      <SelectField label="Student" value={student.id} onChange={v => navigate(`/teacher/scores/${v}`, { replace: true })}>
        {[...students].sort((a, b) => a.name.localeCompare(b.name)).map(s => <option key={s.id} value={s.id}>{s.name} — {s.class}</option>)}
      </SelectField>
      {/* Keyed so the form resets when switching students */}
      <ScoreForm key={student.id} student={student} />
    </div>
  )
}

function ScoreForm({ student }: { student: StudentRecord }) {
  const { saveScores, track } = useStore()
  const toast = useToast()
  const subjects = Array.from(new Set([...getSubjectsForClass(student.class), ...student.scores.map(s => s.subject)]))
  const [term, setTerm] = useState(student.scores[0]?.term && TERMS.includes(student.scores[0].term) ? student.scores[0].term : TERMS[1])
  const [scores, setScores] = useState<Record<string, string>>(() => Object.fromEntries(student.scores.map(sc => [sc.subject, String(sc.score)])))
  const [weaknesses, setWeaknesses] = useState(student.weaknesses)
  const [strengths, setStrengths] = useState(student.strengths)
  const [note, setNote] = useState(student.teacherNote)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)

  const invalid = Object.entries(scores).filter(([, v]) => v !== '' && (Number.isNaN(Number(v)) || Number(v) < 0 || Number(v) > 100)).map(([k]) => k)
  const filled = Object.entries(scores).filter(([, v]) => v !== '')

  const review = () => {
    if (invalid.length) return setError(`Scores must be between 0 and 100 (check ${invalid.map(shortSubject).join(', ')}).`)
    if (!filled.length) return setError('Enter at least one subject score.')
    setError('')
    setConfirm(true)
  }

  const publish = () => {
    track('scores_published', { subjects: filled.length, term })
    saveScores(student.id, {
      term,
      scores: Object.fromEntries(filled.map(([k, v]) => [k, Math.round(Number(v))])),
      weaknesses, strengths, note: note.trim(),
    })
    setConfirm(false)
    toast(`Published — ${student.name.split(' ')[0]}'s parent has been notified`)
  }

  return (
    <div className="space-y-5">
      <div role="radiogroup" aria-label="Term" className="flex gap-2">
        {TERMS.map(t => (
          <button key={t} role="radio" aria-checked={term === t} onClick={() => setTerm(t)} className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all" style={{ ...display, background: term === t ? 'var(--primary)' : 'var(--secondary)', color: term === t ? '#fff' : 'var(--muted-foreground)' }}>
            {t}
          </button>
        ))}
      </div>

      <Card className="p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', ...display }}>Subject scores (out of 100)</p>
        <div className="grid gap-x-8 gap-y-2.5 md:grid-cols-2">
          {subjects.map(subj => {
            const raw = scores[subj] ?? ''
            const bad = invalid.includes(subj)
            const color = raw === '' ? 'var(--muted-foreground)' : bad ? 'var(--warning)' : tone(scoreTone(Number(raw))).color
            return (
              <label key={subj} className="flex items-center gap-3">
                <span className="text-xs flex-1 leading-tight" style={{ color: 'var(--foreground)' }}>{subj}</span>
                <input
                  type="number" min={0} max={100} inputMode="numeric"
                  value={raw}
                  onChange={e => { setScores(p => ({ ...p, [subj]: e.target.value })); setError('') }}
                  placeholder="—"
                  aria-label={`${subj} score`}
                  aria-invalid={bad || undefined}
                  className="w-16 px-2 py-1.5 rounded-lg text-sm text-center font-bold outline-none"
                  style={{ border: `1.5px solid ${raw === '' ? 'var(--border)' : color}`, color, ...display, background: 'var(--surface)' }}
                />
              </label>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TagEditor label="Areas needing support" t="warning" tags={weaknesses} setTags={setWeaknesses} placeholder="e.g. Fractions" />
        <TagEditor label="Strengths" t="success" tags={strengths} setTags={setStrengths} placeholder="e.g. Reading comprehension" />
      </div>

      <div>
        <label htmlFor="teacher-note" className="block text-xs font-bold mb-1.5" style={{ ...display, color: 'var(--foreground)' }}>Note to parent (visible on the parent dashboard)</label>
        <textarea id="teacher-note" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Write a short, encouraging note for the parent…" maxLength={400} className="field resize-none" />
        <p className="text-xs mt-1 text-right" style={{ color: 'var(--muted-foreground)' }}>{note.length}/400</p>
      </div>

      {error && <p role="alert" className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>{error}</p>}

      <Button variant="accent" size="lg" block onClick={review}><Upload size={16} /> Save & publish to parent</Button>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Publish these results?" description={`${student.name}'s parent will see these ${term.toLowerCase()} scores and your note straight away.`}>
        <ul className="rounded-xl p-3 mb-4 space-y-1" style={{ background: 'var(--secondary)' }}>
          {filled.map(([k, v]) => (
            <li key={k} className="flex justify-between text-xs"><span style={{ color: 'var(--foreground)' }}>{k}</span><strong style={{ color: tone(scoreTone(Number(v))).color }}>{v}</strong></li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button variant="accent" block onClick={publish}><CheckCircle2 size={15} /> Publish</Button>
          <Button variant="secondary" onClick={() => setConfirm(false)}>Keep editing</Button>
        </div>
      </Modal>
    </div>
  )
}

function TagEditor({ label, t, tags, setTags, placeholder }: { label: string; t: 'warning' | 'success'; tags: string[]; setTags: (t: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('')
  const c = tone(t)
  const add = () => {
    const v = input.trim()
    if (v && !tags.some(x => x.toLowerCase() === v.toLowerCase())) setTags([...tags, v])
    setInput('')
  }
  return (
    <div>
      <p className="text-xs font-bold mb-2" style={{ ...display, color: c.color }}>{label}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 text-xs font-semibold pl-2.5 pr-1 py-0.5 rounded-full" style={{ background: c.bg, color: c.color }}>
            {tag}
            <button type="button" onClick={() => setTags(tags.filter(x => x !== tag))} aria-label={`Remove ${tag}`} className="w-5 h-5 flex items-center justify-center rounded-full"><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          aria-label={`Add to ${label}`}
          className="field !py-2 flex-1"
        />
        <button type="button" onClick={add} aria-label={`Add to ${label}`} className="px-3 rounded-xl" style={{ background: c.bg, color: c.color }}><Plus size={15} /></button>
      </div>
    </div>
  )
}

// ── ATTENDANCE ───────────────────────────────────────────────────────────
export function TeacherAttendance() {
  const { students } = useTeacher()
  const { setAttendance } = useStore()
  const toast = useToast()
  const [date, setDate] = useState(todayISO())
  const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name))
  const statusOn = (s: StudentRecord) => s.attendance.find(a => a.date === date)?.status

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader
        title="Attendance"
        subtitle={formatLongDate(date)}
        action={
          <input type="date" value={date} max={todayISO()} onChange={e => e.target.value && setDate(e.target.value)} aria-label="Attendance date" className="field !w-auto !py-2" />
        }
      />
      {students.length === 0 ? <NoStudents /> : (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>P = Present · L = Late · E = Excused · A = Absent. Parents are alerted for absences and late arrivals.</p>
            <Button size="sm" variant="secondary" onClick={() => { sorted.filter(s => !statusOn(s)).forEach(s => setAttendance(s.id, date, 'present')); toast('Remaining students marked present') }}>
              <CheckCircle2 size={13} /> Mark rest present
            </Button>
          </div>

          <div className="space-y-2">
            {sorted.map(s => {
              const current = statusOn(s)
              return (
                <div key={s.id} className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <Avatar s={s} size={32} />
                  <p className="text-sm font-semibold flex-1 min-w-0 truncate" style={{ color: 'var(--foreground)' }}>{s.name}</p>
                  <div className="flex gap-1" role="radiogroup" aria-label={`Attendance for ${s.name}`}>
                    {ATTENDANCE.map(opt => (
                      <button
                        key={opt.key}
                        role="radio"
                        aria-checked={current === opt.key}
                        aria-label={opt.name}
                        title={opt.name}
                        onClick={() => setAttendance(s.id, date, opt.key)}
                        className="w-9 h-9 rounded-full font-black text-xs transition-all"
                        style={{ ...display, background: current === opt.key ? opt.color : 'var(--secondary)', color: current === opt.key ? '#fff' : 'var(--muted-foreground)' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
            {ATTENDANCE.map(opt => (
              <div key={opt.key} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: opt.color }} />
                <span className="text-xs flex-1" style={{ color: 'var(--foreground)' }}>{opt.name}</span>
                <span className="text-xs font-bold" style={{ color: opt.color }}>{students.filter(s => statusOn(s) === opt.key).length}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--border)' }} />
              <span className="text-xs flex-1" style={{ color: 'var(--foreground)' }}>Unmarked</span>
              <span className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>{students.filter(s => !statusOn(s)).length}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── ASSIGNMENTS ──────────────────────────────────────────────────────────
export function TeacherAssignments() {
  const { teacher, students } = useTeacher()
  const { createAssignment, gradeAssignment } = useStore()
  const toast = useToast()
  const [composing, setComposing] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', subject: '', dueDate: '', classTarget: '' })
  const [error, setError] = useState('')
  const [grades, setGrades] = useState<Record<string, string>>({})

  // One row per assignment, aggregated across the students who received it.
  const groups = useMemo(() => {
    const map = new Map<string, { id: string; title: string; subject: string; dueDate: string; rows: { student: StudentRecord; submitted: boolean; score?: number }[] }>()
    students.forEach(s => s.assignments.forEach(a => {
      const g = map.get(a.id) ?? { id: a.id, title: a.title, subject: a.subject, dueDate: a.dueDate, rows: [] }
      g.rows.push({ student: s, submitted: a.submitted, score: a.score })
      map.set(a.id, g)
    }))
    return [...map.values()].sort((a, b) => b.dueDate.localeCompare(a.dueDate))
  }, [students])

  if (!teacher) return null
  const subjectOptions = Array.from(new Set([...teacher.subjects, ...teacher.classes.flatMap(getSubjectsForClass)]))

  const create = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.subject || !form.dueDate || !form.classTarget) return setError('Fill in every field.')
    createAssignment({ ...form, title: form.title.trim() })
    toast(`“${form.title.trim()}” set for ${form.classTarget}`)
    setForm({ title: '', subject: '', dueDate: '', classTarget: '' })
    setComposing(false)
    setError('')
  }

  const grade = (studentId: string, assignmentId: string) => {
    const key = `${studentId}:${assignmentId}`
    const n = Number(grades[key])
    if (grades[key] === undefined || grades[key] === '' || Number.isNaN(n) || n < 0 || n > 100) return toast('Enter a mark between 0 and 100', 'warning')
    gradeAssignment(studentId, assignmentId, Math.round(n))
    setGrades(g => { const { [key]: _, ...rest } = g; return rest })
    toast('Mark saved and shared with the parent')
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader title="Assignments" subtitle="Set work for your class. Learners tick it off; you mark it." action={!composing ? <Button variant="accent" onClick={() => setComposing(true)}><Plus size={15} /> New assignment</Button> : undefined} />

      {composing && (
        <Card className="p-4 sm:p-5">
          <form onSubmit={create} className="space-y-4" noValidate>
            <TextField label="Title" value={form.title} onChange={v => { setForm(f => ({ ...f, title: v })); setError('') }} placeholder="e.g. Fractions worksheet 2" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SelectField label="Subject" value={form.subject} onChange={v => setForm(f => ({ ...f, subject: v }))}>
                <option value="">Select</option>
                {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </SelectField>
              <SelectField label="Class" value={form.classTarget} onChange={v => setForm(f => ({ ...f, classTarget: v }))}>
                <option value="">Select</option>
                {teacher.classes.map(c => <option key={c} value={c}>{c}</option>)}
                {teacher.classes.length > 1 && <option value="All classes">All classes</option>}
              </SelectField>
              <TextField label="Due date" type="date" min={todayISO()} value={form.dueDate} onChange={v => setForm(f => ({ ...f, dueDate: v }))} />
            </div>
            {error && <p role="alert" className="text-xs font-semibold" style={{ color: 'var(--warning)' }}>{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" variant="accent" className="flex-1">Set assignment</Button>
              <Button type="button" variant="secondary" onClick={() => { setComposing(false); setError('') }}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {groups.length === 0 ? (
        <EmptyState icon={<ClipboardList size={40} />} title="No assignments yet" body="Set your first piece of work and learners will see it in their LEIF task list." />
      ) : (
        <ul className="space-y-2">
          {groups.map(g => {
            const submitted = g.rows.filter(r => r.submitted).length
            const toMark = g.rows.filter(r => r.submitted && r.score === undefined).length
            const open = openId === g.id
            return (
              <li key={g.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <button onClick={() => setOpenId(open ? null : g.id)} aria-expanded={open} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ ...display, color: 'var(--primary)' }}>{g.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{shortSubject(g.subject)} · due {formatShortDate(g.dueDate)}</p>
                  </div>
                  {toMark > 0 && <Pill t="info">{toMark} to mark</Pill>}
                  <span className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>{submitted}/{g.rows.length}</span>
                  <ChevronDown size={15} className="transition-transform" style={{ color: 'var(--muted-foreground)', transform: open ? 'rotate(180deg)' : 'none' }} />
                </button>
                {open && (
                  <div className="px-4 pb-3" style={{ borderTop: '1px solid var(--border)' }}>
                    {g.rows.sort((a, b) => a.student.name.localeCompare(b.student.name)).map(r => {
                      const key = `${r.student.id}:${g.id}`
                      return (
                        <div key={r.student.id} className="flex items-center gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                          <span className="text-sm flex-1 min-w-0 truncate" style={{ color: 'var(--foreground)' }}>{r.student.name}</span>
                          {r.score !== undefined ? <Pill t="success">{r.score}/100</Pill> : (
                            <>
                              <Pill t={r.submitted ? 'info' : g.dueDate < todayISO() ? 'warning' : 'neutral'}>{r.submitted ? 'Submitted' : g.dueDate < todayISO() ? 'Missing' : 'Pending'}</Pill>
                              <input
                                type="number" min={0} max={100} inputMode="numeric" placeholder="Mark"
                                value={grades[key] ?? ''}
                                onChange={e => setGrades(p => ({ ...p, [key]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') grade(r.student.id, g.id) }}
                                aria-label={`Mark for ${r.student.name}`}
                                className="w-16 px-2 py-1 rounded-lg text-sm text-center font-bold outline-none"
                                style={{ border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}
                              />
                              <Button size="sm" variant="secondary" onClick={() => grade(r.student.id, g.id)}>Save</Button>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ── ANNOUNCEMENTS ────────────────────────────────────────────────────────
export function TeacherAnnouncements() {
  const { teacher, announcements } = useTeacher()
  const { postAnnouncement, deleteAnnouncement } = useStore()
  const toast = useToast()
  const [composing, setComposing] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [classTarget, setClassTarget] = useState(teacher?.classes[0] ?? '')
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState<string | null>(null)

  if (!teacher) return null
  const targets = teacher.classes.length > 1 ? [...teacher.classes, 'All classes'] : teacher.classes

  const post = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return setError('Add a title and a message.')
    postAnnouncement({ title: title.trim(), body: body.trim(), classTarget })
    toast('Announcement sent to parents')
    setTitle(''); setBody(''); setComposing(false); setError('')
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader title="Announcements" subtitle="Messages go to every parent in the selected class." action={!composing ? <Button variant="accent" onClick={() => setComposing(true)}><Plus size={15} /> New announcement</Button> : undefined} />

      {composing && (
        <Card className="p-4 sm:p-5">
          <form onSubmit={post} className="space-y-3" noValidate>
            <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Send to">
              {targets.map(c => <Chip key={c} active={classTarget === c} onClick={() => setClassTarget(c)}>{c}</Chip>)}
            </div>
            <input type="text" value={title} onChange={e => { setTitle(e.target.value); setError('') }} placeholder="Title" aria-label="Announcement title" maxLength={80} className="field" />
            <textarea rows={4} value={body} onChange={e => { setBody(e.target.value); setError('') }} placeholder="Write your announcement…" aria-label="Announcement message" maxLength={600} className="field resize-none" />
            {error && <p role="alert" className="text-xs font-semibold" style={{ color: 'var(--warning)' }}>{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" variant="accent" className="flex-1"><Megaphone size={15} /> Post to parents</Button>
              <Button type="button" variant="secondary" onClick={() => { setComposing(false); setError('') }}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', ...display }}>Posted announcements</p>
      {announcements.length === 0 ? (
        <EmptyState icon={<Megaphone size={40} />} title="Nothing posted yet" body="Share exam dates, meetings or reminders with parents." />
      ) : (
        <div className="space-y-3">
          {[...announcements].sort((a, b) => b.date.localeCompare(a.date)).map(a => (
            <Card key={a.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-bold text-sm" style={{ ...display, color: 'var(--foreground)' }}>{a.title}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <Pill t="info">{a.classTarget}</Pill>
                  <button onClick={() => setToDelete(a.id)} aria-label={`Delete “${a.title}”`} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: 'var(--muted-foreground)' }}><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{a.body}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>{formatDate(a.date)}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete announcement?" description="It will be removed from your list. Parents who were already notified keep their notification.">
        <div className="flex gap-2">
          <Button variant="danger" block onClick={() => { if (toDelete) deleteAnnouncement(toDelete); setToDelete(null); toast('Announcement deleted', 'info') }}>Delete</Button>
          <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  )
}

// ── SETTINGS ─────────────────────────────────────────────────────────────
export function TeacherSettings() {
  const { teacher } = useTeacher()
  const { signOut, updateTeacher } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [error, setError] = useState('')
  if (!teacher) return null

  const openEdit = () => { setForm({ firstName: teacher.firstName, lastName: teacher.lastName, email: teacher.email, phone: teacher.phone }); setEditing(true) }
  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim()) return setError('Enter your first name.')
    updateTeacher({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone: form.phone.trim() })
    setEditing(false); setError('')
    toast('Profile updated')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" />
      <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: 'var(--hero)' }}>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-black text-white" style={display}>{teacher.title ? `${teacher.title} ` : ''}{teacher.firstName} {teacher.lastName}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{teacher.id} · {teacher.school}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{teacher.email}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {teacher.subjects.map(s => <span key={s} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: '#fff' }}>{s}</span>)}
            {teacher.classes.map(c => <span key={c} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>{c}</span>)}
          </div>
        </div>
        <button onClick={openEdit} aria-label="Edit your details" className="w-10 h-10 flex items-center justify-center rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}><Edit3 size={15} /></button>
      </div>

      <SettingsSection label="Account">
        {[['School', teacher.school], ['Teacher ID', teacher.id], ['Classes', teacher.classes.join(', ')], ['Phone', teacher.phone || 'Not added'], ['Joined', formatDate(teacher.joined)]].map(([label, value], i, arr) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span className="text-sm flex-1" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
            <span className="text-sm font-semibold text-right" style={{ color: 'var(--foreground)' }}>{value}</span>
          </div>
        ))}
      </SettingsSection>

      <SettingsSection label="Appearance">
        <div className="p-4"><ThemePicker /></div>
      </SettingsSection>

      <SettingsSection label="Legal & Privacy">
        {LEGAL_LINKS.map(({ to, label, Icon }) => <LinkRow key={to} to={to} icon={<Icon size={15} />} label={label} />)}
        <ResetDemoButton />
      </SettingsSection>

      <Callout t="info" icon={<BarChart2 size={15} />}>Teachers can only see learners in their own classes at {teacher.school}. Parents control what else is shared.</Callout>

      <Button variant="danger" block size="lg" className="!justify-start" onClick={() => { signOut(); navigate('/') }}>
        <LogOut size={16} /> Sign out
      </Button>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit your details">
        <form onSubmit={save} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="First name" value={form.firstName} onChange={v => { setForm(f => ({ ...f, firstName: v })); setError('') }} error={error || undefined} />
            <TextField label="Last name" value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} />
          </div>
          <TextField label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          <TextField label="Phone" type="tel" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          <Button type="submit" variant="accent" block size="lg">Save changes</Button>
        </form>
      </Modal>
    </div>
  )
}
