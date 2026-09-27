import type { PerformanceStatus, StudentRecord, SubjectStatus } from './types'
import { formatShortDate, todayISO } from './format'

/** Score below this (or a sharp drop) flags a subject as needing attention. */
export const CONCERN_THRESHOLD = 65
export const STRENGTH_THRESHOLD = 75
export const TARGET_SCORE = 70

export interface SubjectSummary {
  name: string
  score: number
  trend: number
  status: SubjectStatus
}

export function average(s: StudentRecord) {
  if (!s.scores.length) return 0
  return Math.round(s.scores.reduce((a, b) => a + b.score, 0) / s.scores.length)
}

export function statusFromAverage(a: number): PerformanceStatus {
  return a >= 85 ? 'excellent' : a >= 70 ? 'good' : a >= 55 ? 'average' : a >= 45 ? 'needs-attention' : 'critical'
}

/** Overall status: the average, but a failing subject is never hidden by it. */
export function statusFor(s: Pick<StudentRecord, 'scores'>): PerformanceStatus {
  if (!s.scores.length) return 'average'
  const byAverage = statusFromAverage(Math.round(s.scores.reduce((a, b) => a + b.score, 0) / s.scores.length))
  const lowest = Math.min(...s.scores.map(x => x.score))
  const rank: PerformanceStatus[] = ['critical', 'needs-attention', 'average', 'good', 'excellent']
  const cap: PerformanceStatus = lowest < 40 ? 'critical' : lowest < 50 ? 'needs-attention' : 'excellent'
  return rank[Math.min(rank.indexOf(byAverage), rank.indexOf(cap))]
}

export function subjectStatus(score: number, trend: number): SubjectStatus {
  if (score < CONCERN_THRESHOLD || trend <= -5) return 'concern'
  if (score >= STRENGTH_THRESHOLD && trend >= 0) return 'strength'
  return 'neutral'
}

/** Current subject scores with change since the previous snapshot. */
export function subjectSummaries(s: StudentRecord): SubjectSummary[] {
  const prev = s.history.length >= 2 ? s.history[s.history.length - 2].scores : {}
  return s.scores.map(sc => {
    const before = prev[sc.subject]
    const trend = before === undefined ? 0 : sc.score - before
    return { name: sc.subject, score: sc.score, trend, status: subjectStatus(sc.score, trend) }
  })
}

export function attendanceRate(s: StudentRecord) {
  if (!s.attendance.length) return 0
  const present = s.attendance.filter(a => a.status === 'present' || a.status === 'late').length
  return Math.round((present / s.attendance.length) * 100)
}

export function scoreFor(s: StudentRecord, subject: string) {
  return s.scores.find(sc => sc.subject === subject)?.score
}

/** Short labels for charts — "Basic Science & Technology" → "Science". */
export function shortSubject(name: string) {
  const map: Record<string, string> = {
    'English Language': 'English',
    'Mathematics': 'Maths',
    'Basic Science & Technology': 'Science',
    'Computer Studies / ICT': 'ICT',
    'Cultural & Creative Arts': 'Arts',
    'Physical & Health Education': 'PHE',
    'Christian Religious Knowledge / Islamic Religious Studies': 'CRK/IRS',
    'Christian Religious Knowledge / Islamic Studies': 'CRK/IRS',
    'English Language (Phonics)': 'Phonics',
    'Numeracy (Number Work)': 'Numeracy',
    'Creative & Cultural Arts': 'Arts',
    'Agricultural Science': 'Agric',
    'Home Economics': 'Home Ec.',
    'Social Studies': 'Social St.',
    'Civic Education': 'Civic',
    'Verbal Reasoning': 'Verbal',
    'Quantitative Reasoning': 'Quant.',
  }
  return map[name] ?? name
}

export interface ActivityItem {
  date: string
  subject: string
  type: string
  result: string
  flag: boolean
  done: boolean
}

/** Recent academic activity derived from assignments and attendance. */
export function recentActivity(s: StudentRecord, limit = 6): ActivityItem[] {
  const today = todayISO()
  // Work that isn't due yet hasn't happened — it's upcoming, not activity.
  const happened = s.assignments.filter(a => a.submitted || a.dueDate < today)
  const items: ActivityItem[] = happened.map(a => {
    const overdue = !a.submitted && a.dueDate < today
    return {
      date: a.submittedAt?.slice(0, 10) ?? a.dueDate,
      subject: a.subject,
      type: a.title,
      result: a.score !== undefined ? `${a.score}/100`
        : a.submitted ? 'Submitted'
        : overdue ? 'Missing'
        : `Due ${formatShortDate(a.dueDate)}`,
      flag: overdue || (a.score !== undefined && a.score < CONCERN_THRESHOLD),
      done: a.submitted,
    }
  })
  s.attendance
    .filter(a => a.status === 'absent' || a.status === 'late')
    .forEach(a => items.push({
      date: a.date,
      subject: 'Attendance',
      type: a.status === 'absent' ? 'Absent from school' : 'Arrived late',
      result: a.status === 'absent' ? 'Absent' : 'Late',
      flag: a.status === 'absent',
      done: false,
    }))
  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit)
}

export function lastUpdatedLabel(s: StudentRecord) {
  return formatShortDate(s.lastUpdated)
}
