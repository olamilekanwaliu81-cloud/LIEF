import { useState, useMemo } from 'react'
import {
  LayoutDashboard, Users, BarChart2, Megaphone, Settings,
  Search, Upload, ChevronRight, Plus, X, CheckCircle2,
  AlertTriangle, Clock, BookOpen, Phone, ArrowLeft,
  TrendingUp, TrendingDown, Calendar, FileText, LogOut,
  Bell, Filter, ChevronDown,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import {
  teacher, students as initialStudents, announcements as initialAnnouncements,
  statusConfig, type StudentRecord, type PerformanceStatus, type Announcement,
} from '../data/teacher'
import { getSubjectsForClass } from '../data/grades'

type TeacherTab = 'overview' | 'students' | 'scores' | 'attendance' | 'announcements' | 'settings'
type View = 'list' | 'student-detail' | 'upload'

interface Props { onSignOut: () => void }

const TERMS = ['First Term', 'Second Term', 'Third Term']

function avg(s: StudentRecord) {
  if (!s.scores.length) return 0
  return Math.round(s.scores.reduce((a, b) => a + b.score, 0) / s.scores.length)
}

// ── HEADER ────────────────────────────────────────────────────────────────
function TeacherHeader({ activeTab, onTabChange, onSignOut, onBellClick, notifCount }: {
  activeTab: TeacherTab; onTabChange: (t: TeacherTab) => void; onSignOut: () => void
  onBellClick?: () => void; notifCount?: number
}) {
  const tabs: { id: TeacherTab; label: string; Icon: React.ElementType }[] = [
    { id: 'overview',      label: 'Overview',      Icon: LayoutDashboard },
    { id: 'students',      label: 'Students',      Icon: Users },
    { id: 'scores',        label: 'Scores',        Icon: BarChart2 },
    { id: 'attendance',    label: 'Attendance',    Icon: Calendar },
    { id: 'announcements', label: 'Announce',      Icon: Megaphone },
    { id: 'settings',      label: 'Settings',      Icon: Settings },
  ]
  return (
    <>
      <header className="sticky top-0 z-30 border-b" style={{ background: 'var(--primary)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between px-4 py-3 w-full">
          <div>
            <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Quicksand, sans-serif' }}>Teacher Portal</span>
            <p className="text-base font-black text-white" style={{ fontFamily: 'Quicksand, sans-serif' }}>{teacher.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onBellClick} className="relative w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.10)', color: '#fff' }}>
              <Bell size={15} />
              {(notifCount ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--accent)', fontSize: '9px', fontWeight: 800 }}>
                  {notifCount}
                </span>
              )}
            </button>
            <div
              className="w-8 h-8 flex items-center justify-center rounded-full font-black text-sm"
              style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'Quicksand, sans-serif' }}
            >
              {teacher.name.split(' ').filter((_,i,a) => i === a.length-1)[0][0]}
            </div>
          </div>
        </div>
      </header>
      {/* Tab bar */}
      <div className="sticky top-[57px] z-20 border-b overflow-x-auto" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex px-2 min-w-max">
          {tabs.map(({ id, label, Icon }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="flex items-center gap-1.5 px-3 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all"
                style={{
                  fontFamily: 'Quicksand, sans-serif',
                  color: active ? 'var(--accent)' : 'var(--muted-foreground)',
                  borderBottomColor: active ? 'var(--accent)' : 'transparent',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────────────
function OverviewTab({ allStudents, onGoToStudents, onGoToScores }: {
  allStudents: StudentRecord[]
  onGoToStudents: () => void
  onGoToScores: () => void
}) {
  const statusCounts = useMemo(() => ({
    excellent: allStudents.filter(s => s.status === 'excellent').length,
    good:      allStudents.filter(s => s.status === 'good').length,
    average:   allStudents.filter(s => s.status === 'average').length,
    watch:     allStudents.filter(s => s.status === 'needs-attention' || s.status === 'critical').length,
  }), [allStudents])

  const classAvg = Math.round(allStudents.reduce((a, s) => a + avg(s), 0) / allStudents.length)

  // Subject averages for chart
  const subjectMap: Record<string, number[]> = {}
  allStudents.forEach(s => s.scores.forEach(sc => {
    if (!subjectMap[sc.subject]) subjectMap[sc.subject] = []
    subjectMap[sc.subject].push(sc.score)
  }))
  const subjectData = Object.entries(subjectMap).map(([name, scores]) => ({
    name: name.split(' ')[0],
    avg: Math.round(scores.reduce((a,b) => a+b, 0) / scores.length),
  })).sort((a,b) => b.avg - a.avg)

  const criticalStudents = allStudents.filter(s => s.status === 'critical' || s.status === 'needs-attention')
  const pendingAssignments = allStudents.flatMap(s => s.assignments.filter(a => !a.submitted)).length

  return (
    <div className="px-4 pt-5 pb-8 space-y-5 w-full">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>
          Good morning, {teacher.name.split(' ')[1]}
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {teacher.school} · {teacher.classes.join(', ')}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickStat value={allStudents.length} label="Total students" color="var(--primary)" bg="var(--secondary)" />
        <QuickStat value={classAvg} label="Class average" suffix="/100" color="#0F8A5F" bg="#E8F8F3" />
        <QuickStat value={statusCounts.watch} label="Need attention" color="#C0521A" bg="#FFF0EA" />
        <QuickStat value={pendingAssignments} label="Missing work" color="#B07000" bg="#FFF8E7" />
      </div>

      {/* Performance distribution */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--muted-foreground)' }}>
          Class performance distribution
        </p>
        <div className="flex gap-2 mb-3">
          {([
            ['excellent', statusCounts.excellent],
            ['good', statusCounts.good],
            ['average', statusCounts.average],
            ['watch', statusCounts.watch],
          ] as [string, number][]).map(([key, count]) => {
            const cfg = key === 'watch' ? { label: 'At risk', color: '#C0521A', bg: '#FFF0EA' } : statusConfig[key as PerformanceStatus]
            const pct = Math.round((count / allStudents.length) * 100)
            return (
              <div key={key} className="flex-1 flex flex-col gap-1 text-center">
                <div className="h-16 rounded-lg flex items-end" style={{ background: 'var(--muted)' }}>
                  <div className="w-full rounded-lg transition-all" style={{ height: `${pct}%`, minHeight: count > 0 ? '8px' : 0, background: cfg.color }} />
                </div>
                <p className="text-xs font-bold" style={{ color: cfg.color }}>{count}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{cfg.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Subject average chart */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--muted-foreground)' }}>
          Subject averages
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={subjectData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12, fontFamily: 'Quicksand, sans-serif' }} />
            <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
              {subjectData.map((d, i) => (
                <Cell key={i} fill={d.avg >= 70 ? '#1ABF96' : d.avg >= 50 ? '#E97B2E' : '#C0521A'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Students needing attention */}
      {criticalStudents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} style={{ color: '#C0521A' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'Quicksand, sans-serif', color: '#C0521A' }}>
              Needs immediate attention
            </p>
          </div>
          <div className="space-y-2">
            {criticalStudents.map(s => {
              const cfg = statusConfig[s.status]
              return (
                <div key={s.id} className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs" style={{ background: cfg.color, color: '#fff', fontFamily: 'Quicksand, sans-serif' }}>
                    {s.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: 'var(--foreground)', fontFamily: 'Quicksand, sans-serif' }}>{s.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Avg {avg(s)}/100 · {cfg.label}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: cfg.color, color: '#fff' }}>{avg(s)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onGoToScores} className="flex items-center gap-2 rounded-xl p-3.5 text-left transition-all hover:opacity-90" style={{ background: 'var(--accent)', color: '#fff' }}>
          <Upload size={16} />
          <div><p className="text-sm font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>Upload scores</p><p className="text-xs opacity-70">Add term results</p></div>
        </button>
        <button onClick={onGoToStudents} className="flex items-center gap-2 rounded-xl p-3.5 text-left transition-all hover:opacity-90" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
          <Users size={16} />
          <div><p className="text-sm font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>View students</p><p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>All profiles</p></div>
        </button>
      </div>
    </div>
  )
}

// ── STUDENTS TAB ──────────────────────────────────────────────────────────
function StudentsTab({ allStudents, onUpload }: { allStudents: StudentRecord[]; onUpload: (s: StudentRecord) => void }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<PerformanceStatus | 'all'>('all')
  const [selected, setSelected] = useState<StudentRecord | null>(null)

  const filtered = allStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchStatus
  })

  if (selected) {
    const cfg = statusConfig[selected.status]
    const attendanceDays = selected.attendance.length
    const presentDays = selected.attendance.filter(a => a.status === 'present' || a.status === 'late').length
    const attendancePct = Math.round((presentDays / attendanceDays) * 100)
    return (
      <div className="w-full">
        <div className="sticky top-[105px] z-10 flex items-center gap-3 px-4 py-3 border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}><ArrowLeft size={15} /></button>
          <div className="flex-1">
            <p className="font-black text-sm" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>{selected.name}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{selected.class} · {selected.id}</p>
          </div>
          <button onClick={() => onUpload(selected)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg" style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'Quicksand, sans-serif' }}>
            <Upload size={12} /> Update
          </button>
        </div>
        <div className="px-4 pt-4 pb-8 space-y-4">
          {/* Status + contact */}
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
            <div>
              <p className="font-black text-sm" style={{ fontFamily: 'Quicksand, sans-serif', color: cfg.color }}>{cfg.label}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Updated {selected.lastUpdated}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: cfg.color }}>{avg(selected)}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>avg score</p>
            </div>
          </div>

          {/* Parent contact */}
          <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
            <Phone size={14} style={{ color: 'var(--muted-foreground)' }} />
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{selected.parentName}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{selected.parentPhone}</p>
            </div>
          </div>

          {/* Attendance summary */}
          <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>Attendance</p>
            <div className="flex items-center gap-4 mb-3">
              <p className="text-2xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: attendancePct >= 80 ? '#0F8A5F' : '#C0521A' }}>{attendancePct}%</p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{presentDays}/{attendanceDays} days present</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {selected.attendance.map((a, i) => {
                const color = a.status === 'present' ? '#1ABF96' : a.status === 'late' ? '#E97B2E' : a.status === 'excused' ? '#7B5EA7' : '#C0521A'
                return <div key={i} title={`${a.date}: ${a.status}`} className="w-6 h-6 rounded" style={{ background: color }} />
              })}
            </div>
            <div className="flex gap-3 mt-2">
              {[['#1ABF96','Present'],['#E97B2E','Late'],['#7B5EA7','Excused'],['#C0521A','Absent']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} /><span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{l}</span></div>
              ))}
            </div>
          </div>

          {/* Scores */}
          <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>
              {selected.scores[0]?.term ?? 'Term'} scores
            </p>
            {selected.scores.map(sc => (
              <div key={sc.subject} className="flex items-center gap-3 mb-2">
                <span className="text-xs flex-1 truncate" style={{ color: 'var(--foreground)' }}>{sc.subject}</span>
                <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                  <div className="h-full rounded-full" style={{ width: `${sc.score}%`, background: sc.score >= 70 ? '#1ABF96' : sc.score >= 50 ? '#E97B2E' : '#C0521A' }} />
                </div>
                <span className="text-xs font-black w-6 text-right" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>{sc.score}</span>
              </div>
            ))}
          </div>

          {/* Weaknesses / Strengths */}
          {selected.weaknesses.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: '#C0521A' }}>Areas needing support</p>
              <div className="flex flex-wrap gap-2">
                {selected.weaknesses.map(w => <span key={w} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#FFF0EA', color: '#C0521A' }}>{w}</span>)}
              </div>
            </div>
          )}
          {selected.strengths.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: '#0F8A5F' }}>Strengths</p>
              <div className="flex flex-wrap gap-2">
                {selected.strengths.map(s => <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#E8F8F3', color: '#0F8A5F' }}>{s}</span>)}
              </div>
            </div>
          )}

          {/* Teacher note */}
          {selected.teacherNote && (
            <div className="rounded-xl p-4" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--primary)', fontFamily: 'Quicksand, sans-serif' }}>Note to parent</p>
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--foreground)' }}>"{selected.teacherNote}"</p>
            </div>
          )}

          {/* Assignments */}
          <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>Assignments</p>
            {selected.assignments.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: a.submitted ? '#E8F8F3' : '#FFF0EA' }}>
                  {a.submitted ? <CheckCircle2 size={12} style={{ color: '#0F8A5F' }} /> : <Clock size={12} style={{ color: '#C0521A' }} />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{a.title}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Due {a.dueDate}</p>
                </div>
                {a.score !== undefined && <span className="text-xs font-bold" style={{ color: '#0F8A5F' }}>{a.score}/100</span>}
                {!a.submitted && <span className="text-xs font-bold" style={{ color: '#C0521A' }}>Missing</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-8 space-y-4 w-full">
      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: '1.5px solid var(--border)', color: 'var(--foreground)', background: 'var(--card)' }}
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as PerformanceStatus | 'all')}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm font-semibold outline-none"
            style={{ border: '1.5px solid var(--border)', color: 'var(--foreground)', background: 'var(--card)' }}
          >
            <option value="all">All</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="needs-attention">Needs attention</option>
            <option value="critical">Critical</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
        </div>
      </div>

      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>

      <div className="space-y-2">
        {filtered.map(s => {
          const cfg = statusConfig[s.status]
          const missingWork = s.assignments.filter(a => !a.submitted).length
          return (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="w-full rounded-xl text-left transition-all hover:opacity-90"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ background: cfg.bg, color: cfg.color, fontFamily: 'Quicksand, sans-serif' }}>
                  {s.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: 'var(--foreground)', fontFamily: 'Quicksand, sans-serif' }}>{s.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.class}</span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    {missingWork > 0 && <span className="text-xs font-bold" style={{ color: '#C0521A' }}>{missingWork} missing</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>{avg(s)}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>avg</p>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--border)' }} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── SCORES UPLOAD TAB ────────────────────────────────────────────────────
function ScoresTab({ allStudents, setAllStudents }: { allStudents: StudentRecord[]; setAllStudents: React.Dispatch<React.SetStateAction<StudentRecord[]>> }) {
  const [selectedId, setSelectedId] = useState(allStudents[0]?.id ?? '')
  const student = allStudents.find(s => s.id === selectedId) ?? allStudents[0]
  const subjects = getSubjectsForClass(student?.class ?? 'Primary 4')

  const [term, setTerm] = useState(TERMS[1])
  const [scores, setScores] = useState<Record<string, string>>(() =>
    Object.fromEntries((student?.scores ?? []).map(sc => [sc.subject, String(sc.score)]))
  )
  const [weaknesses, setWeaknesses] = useState<string[]>(student?.weaknesses ?? [])
  const [strengths, setStrengths] = useState<string[]>(student?.strengths ?? [])
  const [note, setNote] = useState(student?.teacherNote ?? '')
  const [newW, setNewW] = useState('')
  const [newS, setNewS] = useState('')
  const [saved, setSaved] = useState(false)

  const handleStudentChange = (id: string) => {
    setSelectedId(id)
    const s = allStudents.find(st => st.id === id)
    if (!s) return
    setScores(Object.fromEntries(s.scores.map(sc => [sc.subject, String(sc.score)])))
    setWeaknesses([...s.weaknesses])
    setStrengths([...s.strengths])
    setNote(s.teacherNote)
    setSaved(false)
  }

  const handleSave = () => {
    const newScores = subjects
      .filter(subj => scores[subj] !== '' && scores[subj] !== undefined)
      .map(subj => ({ subject: subj, score: Number(scores[subj]), term, maxScore: 100 }))
    const a = newScores.reduce((x, y) => x + y.score, 0) / (newScores.length || 1)
    const status: PerformanceStatus = a >= 85 ? 'excellent' : a >= 70 ? 'good' : a >= 55 ? 'average' : a >= 45 ? 'needs-attention' : 'critical'
    setAllStudents(prev => prev.map(s => s.id === selectedId
      ? { ...s, scores: newScores, weaknesses, strengths, teacherNote: note, lastUpdated: 'Sep 22, 2026', status }
      : s
    ))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="px-4 pt-4 pb-8 space-y-4 w-full">
      {/* Student selector */}
      <div>
        <label className="block text-xs font-bold mb-1.5" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>Student</label>
        <select
          value={selectedId}
          onChange={e => handleStudentChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ border: '1.5px solid var(--border)', color: 'var(--foreground)', background: 'var(--card)' }}
        >
          {allStudents.map(s => <option key={s.id} value={s.id}>{s.name} — {s.class}</option>)}
        </select>
      </div>

      {/* Term */}
      <div className="flex gap-2">
        {TERMS.map(t => (
          <button key={t} onClick={() => setTerm(t)} className="flex-1 py-2 rounded-xl text-xs font-bold transition-all" style={{ fontFamily: 'Quicksand, sans-serif', background: term === t ? 'var(--primary)' : 'var(--secondary)', color: term === t ? '#fff' : 'var(--muted-foreground)' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Scores */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>Subject scores (out of 100)</p>
        <div className="space-y-2.5">
          {subjects.map(subj => {
            const val = Number(scores[subj] ?? '')
            const color = val >= 70 ? '#1ABF96' : val >= 50 ? '#E97B2E' : val > 0 ? '#C0521A' : 'var(--muted-foreground)'
            return (
              <div key={subj} className="flex items-center gap-3">
                <span className="text-xs flex-1 leading-tight" style={{ color: 'var(--foreground)' }}>{subj}</span>
                <input
                  type="number" min="0" max="100"
                  value={scores[subj] ?? ''}
                  onChange={e => setScores(p => ({ ...p, [subj]: e.target.value }))}
                  placeholder="—"
                  className="w-14 px-2 py-1.5 rounded-lg text-sm text-center font-bold outline-none"
                  style={{ border: `1.5px solid ${scores[subj] ? color : 'var(--border)'}`, color, fontFamily: 'Quicksand, sans-serif', background: 'var(--background)' }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Weaknesses */}
      <TagEditor label="Areas needing support" color="#C0521A" bg="#FFF0EA" tags={weaknesses} setTags={setWeaknesses} input={newW} setInput={setNewW} placeholder="e.g. Fractions" />
      {/* Strengths */}
      <TagEditor label="Strengths" color="#0F8A5F" bg="#E8F8F3" tags={strengths} setTags={setStrengths} input={newS} setInput={setNewS} placeholder="e.g. Reading comprehension" />

      {/* Note */}
      <div>
        <label className="block text-xs font-bold mb-1.5" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>Note to parent (visible in parent dashboard)</label>
        <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Write a note for the parent…" className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={{ border: '1.5px solid var(--border)', color: 'var(--foreground)', background: 'var(--card)', fontFamily: 'DM Sans, sans-serif' }} />
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90"
        style={{ fontFamily: 'Quicksand, sans-serif', background: saved ? '#0F8A5F' : 'var(--accent)', color: '#fff' }}
      >
        {saved ? <><CheckCircle2 size={16} /> Saved — visible to parent</> : <><Upload size={16} /> Save & publish to parent</>}
      </button>
    </div>
  )
}

// ── ATTENDANCE TAB ────────────────────────────────────────────────────────
function AttendanceTab({ allStudents, setAllStudents }: { allStudents: StudentRecord[]; setAllStudents: React.Dispatch<React.SetStateAction<StudentRecord[]>> }) {
  const today = '2026-09-22'
  const toggleAttendance = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAllStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s
      const existing = s.attendance.find(a => a.date === today)
      const updated = existing
        ? s.attendance.map(a => a.date === today ? { ...a, status } : a)
        : [...s.attendance, { date: today, status }]
      return { ...s, attendance: updated }
    }))
  }

  const statusOptions: { key: 'present' | 'absent' | 'late' | 'excused'; label: string; color: string }[] = [
    { key: 'present', label: 'P', color: '#1ABF96' },
    { key: 'late',    label: 'L', color: '#E97B2E' },
    { key: 'excused', label: 'E', color: '#7B5EA7' },
    { key: 'absent',  label: 'A', color: '#C0521A' },
  ]

  return (
    <div className="px-4 pt-4 pb-8 space-y-4 w-full">
      <div>
        <h2 className="font-black text-base" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>Attendance — Monday 22 Sep 2026</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Tap to mark each student's attendance. P = Present, L = Late, E = Excused, A = Absent.</p>
      </div>

      <div className="space-y-2">
        {allStudents.map(s => {
          const todayEntry = s.attendance.find(a => a.date === today)
          const current = todayEntry?.status
          return (
            <div key={s.id} className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold flex-1" style={{ color: 'var(--foreground)' }}>{s.name}</p>
              <div className="flex gap-1">
                {statusOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => toggleAttendance(s.id, opt.key)}
                    className="w-8 h-8 rounded-full font-black text-xs transition-all"
                    style={{
                      fontFamily: 'Quicksand, sans-serif',
                      background: current === opt.key ? opt.color : 'var(--secondary)',
                      color: current === opt.key ? '#fff' : 'var(--muted-foreground)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="rounded-xl p-4" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold mb-2" style={{ color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>Today's summary</p>
        {statusOptions.map(opt => {
          const count = allStudents.filter(s => s.attendance.find(a => a.date === today)?.status === opt.key).length
          return (
            <div key={opt.key} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: opt.color }} />
                <span className="text-xs" style={{ color: 'var(--foreground)' }}>
                  {opt.key.charAt(0).toUpperCase() + opt.key.slice(1)}
                </span>
              </div>
              <span className="text-xs font-bold" style={{ color: opt.color }}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── ANNOUNCEMENTS TAB ────────────────────────────────────────────────────
function AnnouncementsTab({ announcements, setAnnouncements }: { announcements: Announcement[]; setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>> }) {
  const [composing, setComposing] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [classTarget, setClassTarget] = useState('Primary 4')

  const handlePost = () => {
    if (!title.trim() || !body.trim()) return
    const newAnn: Announcement = {
      id: `ANN-${Date.now()}`,
      title, body,
      date: 'Sep 22, 2026',
      classTarget,
    }
    setAnnouncements(prev => [newAnn, ...prev])
    setTitle(''); setBody(''); setComposing(false)
  }

  return (
    <div className="px-4 pt-4 pb-8 space-y-4 w-full">
      {!composing ? (
        <button
          onClick={() => setComposing(true)}
          className="w-full flex items-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
          style={{ fontFamily: 'Quicksand, sans-serif', background: 'var(--accent)', color: '#fff' }}
        >
          <Plus size={16} /> New announcement
        </button>
      ) : (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>New announcement</p>
          <div className="flex gap-2">
            {['Primary 4', 'Primary 5', 'All classes'].map(c => (
              <button key={c} onClick={() => setClassTarget(c)} className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all" style={{ fontFamily: 'Quicksand, sans-serif', background: classTarget === c ? 'var(--primary)' : 'var(--secondary)', color: classTarget === c ? '#fff' : 'var(--muted-foreground)' }}>
                {c}
              </button>
            ))}
          </div>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: '1.5px solid var(--border)', color: 'var(--foreground)', background: 'var(--background)' }} />
          <textarea rows={3} value={body} onChange={e => setBody(e.target.value)} placeholder="Write your announcement…" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ border: '1.5px solid var(--border)', color: 'var(--foreground)', background: 'var(--background)' }} />
          <div className="flex gap-2">
            <button onClick={handlePost} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ fontFamily: 'Quicksand, sans-serif', background: 'var(--accent)', color: '#fff' }}>Post to parents</button>
            <button onClick={() => setComposing(false)} className="px-4 py-2.5 rounded-xl font-bold text-sm" style={{ fontFamily: 'Quicksand, sans-serif', background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>Cancel</button>
          </div>
        </div>
      )}

      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>Posted announcements</p>

      <div className="space-y-3">
        {announcements.map(a => (
          <div key={a.id} className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-bold text-sm" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>{a.title}</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>{a.classTarget}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{a.body}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>{a.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── TEACHER SETTINGS ─────────────────────────────────────────────────────
function TeacherSettingsTab({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="px-4 pt-5 pb-8 space-y-5 w-full">
      <div className="rounded-2xl p-5" style={{ background: 'var(--primary)' }}>
        <p className="text-sm font-black text-white" style={{ fontFamily: 'Quicksand, sans-serif' }}>{teacher.name}</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{teacher.id} · {teacher.school}</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{teacher.email}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {teacher.subjects.map(s => <span key={s} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: '#fff' }}>{s}</span>)}
          {teacher.classes.map(c => <span key={c} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>{c}</span>)}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
        {[['School', teacher.school], ['Teacher ID', teacher.id], ['Classes', teacher.classes.join(', ')], ['Joined', teacher.joined]].map(([label, value], i, arr) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span className="text-xs flex-1 font-semibold" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
            <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onSignOut}
        className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-sm"
        style={{ fontFamily: 'Quicksand, sans-serif', background: '#FFF0EA', color: '#C0521A', border: '1px solid #F5C5A0' }}
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  )
}

// ── Shared helpers ────────────────────────────────────────────────────────
function TagEditor({ label, color, bg, tags, setTags, input, setInput, placeholder }: {
  label: string; color: string; bg: string
  tags: string[]; setTags: (t: string[]) => void
  input: string; setInput: (v: string) => void; placeholder: string
}) {
  const add = () => { if (input.trim()) { setTags([...tags, input.trim()]); setInput('') } }
  return (
    <div>
      <label className="block text-xs font-bold mb-2" style={{ fontFamily: 'Quicksand, sans-serif', color }}>
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: bg, color }}>
            {t}<button onClick={() => setTags(tags.filter(x => x !== t))}><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
          style={{ border: `1.5px solid var(--border)`, color: 'var(--foreground)', background: 'var(--card)' }}
        />
        <button onClick={add} className="px-3 py-2 rounded-xl" style={{ background: bg, color }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

function QuickStat({ value, label, color, bg, suffix = '' }: { value: number; label: string; color: string; bg: string; suffix?: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: bg }}>
      <p className="text-2xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color }}>{value}{suffix}</p>
      <p className="text-xs mt-0.5 font-semibold leading-snug" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
    </div>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────────────
export default function TeacherDashboard({ onSignOut }: Props) {
  const [activeTab, setActiveTab] = useState<TeacherTab>('overview')
  const [allStudents, setAllStudents] = useState(initialStudents)
  const [allAnnouncements, setAllAnnouncements] = useState(initialAnnouncements)
  const [uploadTarget, setUploadTarget] = useState<StudentRecord | null>(null)
  const [showNotif, setShowNotif] = useState(false)

  const handleUploadFromStudents = (s: StudentRecord) => {
    setUploadTarget(s)
    setActiveTab('scores')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <TeacherHeader activeTab={activeTab} onTabChange={(t) => { setShowNotif(false); setActiveTab(t) }} onSignOut={onSignOut} onBellClick={() => setShowNotif(v => !v)} notifCount={2} />
      <div className="flex-1 overflow-y-auto">
        {showNotif ? (
          <TeacherNotifications onClose={() => setShowNotif(false)} />
        ) : (
          <>
            {activeTab === 'overview'      && <OverviewTab allStudents={allStudents} onGoToStudents={() => setActiveTab('students')} onGoToScores={() => setActiveTab('scores')} />}
            {activeTab === 'students'      && <StudentsTab allStudents={allStudents} onUpload={handleUploadFromStudents} />}
            {activeTab === 'scores'        && <ScoresTab allStudents={allStudents} setAllStudents={setAllStudents} />}
            {activeTab === 'attendance'    && <AttendanceTab allStudents={allStudents} setAllStudents={setAllStudents} />}
            {activeTab === 'announcements' && <AnnouncementsTab announcements={allAnnouncements} setAnnouncements={setAllAnnouncements} />}
            {activeTab === 'settings'      && <TeacherSettingsTab onSignOut={onSignOut} />}
          </>
        )}
      </div>
    </div>
  )
}

// ── TEACHER NOTIFICATIONS ────────────────────────────────────────────────
function TeacherNotifications({ onClose }: { onClose: () => void }) {
  const notifs = [
    { id: 1, title: 'Score submission reminder', body: 'Third term scores for Primary 4 are due by Sep 30. Please upload before the deadline.', time: 'Today', color: '#E97B2E', bg: '#FFF4EC', unread: true },
    { id: 2, title: 'Parent viewed Amara\'s profile', body: 'Fatima Adeyemi reviewed Amara\'s academic scores and support guidance this morning.', time: '3 hours ago', color: '#1ABF96', bg: '#E8F8F3', unread: true },
    { id: 3, title: 'Announcement published', body: 'Your parent-teacher meeting announcement has been sent to all Primary 4 parents.', time: 'Yesterday', color: '#0D2B55', bg: '#E4F1F8', unread: false },
    { id: 4, title: 'New student enrolled', body: 'Blessing Nwosu has been added to your Primary 4 class. Please update their profile.', time: 'Sep 20', color: '#7B5EA7', bg: '#F3EEF8', unread: false },
  ]

  return (
    <div className="w-full">
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center justify-between border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>Notifications</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{notifs.filter(n => n.unread).length} unread</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>Mark all read</button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>
            <X size={15} />
          </button>
        </div>
      </div>
      <div className="px-4 pt-4 pb-8 space-y-2 w-full">
        {notifs.map(n => (
          <div key={n.id} className="w-full rounded-xl px-4 py-3.5 flex items-start gap-3" style={{ background: n.unread ? 'var(--card)' : 'var(--background)', border: n.unread ? '1px solid var(--border)' : '1px solid transparent' }}>
            <div className="w-9 h-9 rounded-full shrink-0 mt-0.5" style={{ background: n.bg }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-bold" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>{n.title}</p>
                {n.unread && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{n.body}</p>
              <p className="text-xs mt-1.5 font-semibold" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
