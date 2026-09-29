// Prototype / sample data (PRD §10). Everything here is representative data,
// not real school records. Demo credentials for local testing:
//   Parent  — fatima@leif.demo / leif1234
//   Teacher — school "Federal Government College, Lagos", ID TCH-0042 / leif1234
//   Learner — code STU-001, PIN 1234
import { statusFor } from './academics'
import type {
  Announcement, AppNotification, Assignment, AttendanceEntry, DB, ParentUser,
  ScoreEntry, Snapshot, StudentRecord, SupportAction, TeacherUser,
} from './types'

export const DB_VERSION = 3
export const DEMO_PASSWORD = 'leif1234'
export const DEMO_PARENT_EMAIL = 'fatima@leif.demo'
export const DEMO_TEACHER_ID = 'TCH-0042'
export const DEMO_TEACHER_SCHOOL = 'Federal Government College, Lagos'
export const DEMO_LEARNER_CODE = 'STU-001'
export const DEMO_LEARNER_PIN = '1234'
export const DEMO_LINK_CODES: Record<string, string> = { 'STU-002': 'KD4P7Q', 'STU-003': 'FB3M9X', 'STU-004': 'EN8R2W', 'STU-005': 'AM5T6Y' }

const SNAPSHOT_DATES = [
  '2026-01-28', '2026-02-25', '2026-03-27', '2026-04-29', '2026-05-28',
  '2026-06-26', '2026-07-24', '2026-08-28', '2026-09-18',
]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

// Hand-authored trajectories for the primary demo child.
const AMARA_HISTORY: Record<string, number[]> = {
  'Mathematics':                [68, 65, 60, 63, 61, 64, 62, 60, 62],
  'English Language':           [75, 77, 79, 80, 80, 82, 81, 80, 81],
  'Basic Science & Technology': [68, 70, 72, 73, 74, 75, 74, 73, 76],
}

/** Deterministic pseudo-random so the seed is identical on every device. */
function rng(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function buildHistory(studentId: string, scores: ScoreEntry[]): Snapshot[] {
  const series: Record<string, number[]> = {}
  for (const sc of scores) {
    const fixed = studentId === 'STU-001' ? AMARA_HISTORY[sc.subject] : undefined
    if (fixed) { series[sc.subject] = fixed; continue }
    const rand = rng(`${studentId}:${sc.subject}`)
    const drift = Math.round(rand() * 14 - 6) // overall change across the year
    const points = SNAPSHOT_DATES.map((_, i) => {
      if (i === SNAPSHOT_DATES.length - 1) return sc.score
      const progress = i / (SNAPSHOT_DATES.length - 1)
      const noise = Math.round(rand() * 6 - 3)
      return Math.max(20, Math.min(100, Math.round(sc.score - drift * (1 - progress) + noise)))
    })
    series[sc.subject] = points
  }
  return SNAPSHOT_DATES.map((date, i) => ({
    date,
    label: MONTHS[i],
    scores: Object.fromEntries(Object.entries(series).map(([subj, pts]) => [subj, pts[i]])),
  }))
}

const T = 'Second Term'
const sc = (subject: string, score: number): ScoreEntry => ({ subject, score, term: T, maxScore: 100 })
const att = (statuses: AttendanceEntry['status'][]): AttendanceEntry[] =>
  ['2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-21', '2026-09-22'].map((date, i) => ({ date, status: statuses[i] }))

const upcoming = (): Assignment[] => [
  { id: 'A4', title: 'Reading log — Chapter 3', subject: 'English Language', dueDate: '2026-10-01', submitted: false },
  { id: 'A5', title: 'Times tables practice sheet', subject: 'Mathematics', dueDate: '2026-10-03', submitted: false },
]

type RawStudent = Omit<StudentRecord, 'history' | 'status' | 'privacy' | 'learnerPin' | 'sampleData' | 'school'>

const RAW_STUDENTS: RawStudent[] = [
  {
    id: 'STU-001', name: 'Amara Adeyemi', class: 'Primary 4', gender: 'F', age: 10,
    parentName: 'Fatima Adeyemi', parentPhone: '+234 802 111 2222', parentId: 'PAR-DEMO',
    scores: [sc('English Language', 81), sc('Mathematics', 62), sc('Basic Science & Technology', 76), sc('Social Studies', 70), sc('Computer Studies / ICT', 85), sc('Cultural & Creative Arts', 89)],
    attendance: att(['present', 'present', 'absent', 'present', 'late', 'present']),
    weaknesses: ['Number operations', 'Word problems', 'Fractions'],
    strengths: ['Reading comprehension', 'Creative writing', 'Scientific observation'],
    teacherNote: 'Amara is a bright student who struggles with number operations. Recommend daily practice at home.',
    lastUpdated: '2026-09-18',
    assignments: [
      { id: 'A1', title: 'Maths worksheet — Fractions', subject: 'Mathematics', dueDate: '2026-09-20', submitted: false },
      { id: 'A2', title: 'English composition', subject: 'English Language', dueDate: '2026-09-17', submitted: true, submittedAt: '2026-09-16', score: 78 },
      { id: 'A3', title: 'Science lab report', subject: 'Basic Science & Technology', dueDate: '2026-09-15', submitted: true, submittedAt: '2026-09-15', score: 82 },
      ...upcoming(),
    ],
  },
  {
    id: 'STU-002', name: 'Chidi Okonkwo', class: 'Primary 4', gender: 'M', age: 10,
    parentName: 'Emeka Okonkwo', parentPhone: '+234 803 222 3333',
    scores: [sc('English Language', 74), sc('Mathematics', 88), sc('Basic Science & Technology', 90), sc('Social Studies', 68), sc('Computer Studies / ICT', 91), sc('Cultural & Creative Arts', 72)],
    attendance: att(['present', 'present', 'present', 'present', 'present', 'present']),
    weaknesses: ['Essay writing', 'Map reading (Social Studies)'],
    strengths: ['Mathematics', 'Science experiments', 'Problem solving'],
    teacherNote: 'Chidi excels in STEM subjects. Needs encouragement with language arts.',
    lastUpdated: '2026-09-17',
    assignments: [
      { id: 'A1', title: 'Maths worksheet — Fractions', subject: 'Mathematics', dueDate: '2026-09-20', submitted: true, submittedAt: '2026-09-19', score: 92 },
      { id: 'A2', title: 'English composition', subject: 'English Language', dueDate: '2026-09-17', submitted: true, submittedAt: '2026-09-17', score: 71 },
      ...upcoming(),
    ],
  },
  {
    id: 'STU-003', name: 'Fatima Bello', class: 'Primary 4', gender: 'F', age: 9,
    parentName: 'Alhaji Bello', parentPhone: '+234 804 333 4444',
    scores: [sc('English Language', 55), sc('Mathematics', 45), sc('Basic Science & Technology', 52), sc('Social Studies', 60), sc('Cultural & Creative Arts', 68)],
    attendance: att(['absent', 'present', 'late', 'absent', 'present', 'present']),
    weaknesses: ['Reading fluency', 'Basic arithmetic', 'Attention in class', 'Homework completion'],
    strengths: ['Oral participation', 'Art activities'],
    teacherNote: 'Fatima needs significant support across all subjects. Parent meeting strongly recommended.',
    lastUpdated: '2026-09-16',
    assignments: [
      { id: 'A1', title: 'Maths worksheet — Fractions', subject: 'Mathematics', dueDate: '2026-09-20', submitted: false },
      { id: 'A2', title: 'English composition', subject: 'English Language', dueDate: '2026-09-17', submitted: false },
      ...upcoming(),
    ],
  },
  {
    id: 'STU-004', name: 'Emeka Nwosu', class: 'Primary 4', gender: 'M', age: 10,
    parentName: 'Mrs. Chioma Nwosu', parentPhone: '+234 805 444 5555',
    scores: [sc('English Language', 91), sc('Mathematics', 94), sc('Basic Science & Technology', 88), sc('Social Studies', 85), sc('Computer Studies / ICT', 95)],
    attendance: att(['present', 'present', 'present', 'present', 'present', 'present']),
    weaknesses: [],
    strengths: ['All-round performance', 'Class leadership', 'Consistent homework'],
    teacherNote: 'Emeka is performing excellently. Consider advanced challenges and class representative role.',
    lastUpdated: '2026-09-18',
    assignments: [
      { id: 'A1', title: 'Maths worksheet — Fractions', subject: 'Mathematics', dueDate: '2026-09-20', submitted: true, submittedAt: '2026-09-18', score: 96 },
      ...upcoming(),
    ],
  },
  {
    id: 'STU-005', name: 'Aisha Musa', class: 'Primary 4', gender: 'F', age: 9,
    parentName: 'Musa Ibrahim', parentPhone: '+234 806 555 6666',
    scores: [sc('English Language', 69), sc('Mathematics', 71), sc('Basic Science & Technology', 74), sc('Social Studies', 72)],
    attendance: att(['present', 'late', 'present', 'present', 'excused', 'present']),
    weaknesses: ['Confidence in class', 'Spelling'],
    strengths: ['Consistent effort', 'Group work', 'Science'],
    teacherNote: 'Aisha is a quiet but hardworking student. Needs encouragement to participate more in class.',
    lastUpdated: '2026-09-15',
    assignments: [
      { id: 'A2', title: 'English composition', subject: 'English Language', dueDate: '2026-09-17', submitted: true, submittedAt: '2026-09-17', score: 70 },
      ...upcoming(),
    ],
  },
]

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString()

export async function createSeed(hash: (password: string, salt: string) => Promise<string>): Promise<DB> {
  const students: StudentRecord[] = RAW_STUDENTS.map(raw => {
    const record = {
      ...raw,
      school: DEMO_TEACHER_SCHOOL,
      history: buildHistory(raw.id, raw.scores),
      learnerPin: raw.id === DEMO_LEARNER_CODE ? DEMO_LEARNER_PIN : '0000',
      privacy: { visibility: 'family' as const, shareActivityWithTeacher: false, guardians: [] },
      sampleData: false,
      // Learners whose parents aren't on LEIF yet: the parent connects with these.
      linkCode: raw.parentId ? undefined : DEMO_LINK_CODES[raw.id],
      status: 'average' as const,
    }
    return { ...record, status: statusFor(record) }
  })

  const parent: ParentUser = {
    id: 'PAR-DEMO',
    firstName: 'Fatima',
    lastName: 'Adeyemi',
    email: DEMO_PARENT_EMAIL,
    phone: '+234 802 111 2222',
    passwordHash: await hash(DEMO_PASSWORD, DEMO_PARENT_EMAIL),
    childIds: ['STU-001'],
    createdAt: '2026-01-10',
    prefs: { scores: true, announcements: true, weekly: true, attendance: true },
    language: 'English',
  }

  const teacher: TeacherUser = {
    id: DEMO_TEACHER_ID,
    firstName: 'Ngozi',
    lastName: 'Okafor',
    title: 'Mrs.',
    email: 'n.okafor@fgclagos.edu.ng',
    phone: '+234 801 234 5678',
    school: DEMO_TEACHER_SCHOOL,
    schoolId: 'FGC-LAG-001',
    subjects: ['Mathematics', 'Basic Science & Technology'],
    classes: ['Primary 4', 'Primary 5'],
    passwordHash: await hash(DEMO_PASSWORD, DEMO_TEACHER_ID),
    joined: '2024-09-01',
  }

  const announcements: Announcement[] = [
    { id: 'ANN-1', title: 'Second Term Examination Schedule', body: 'Second term exams begin Monday 28 September. All students must bring their exam cards. No lateness will be tolerated.', date: '2026-09-20', classTarget: 'Primary 4', teacherId: DEMO_TEACHER_ID },
    { id: 'ANN-2', title: 'Mathematics Revision Class', body: 'Extra revision class for Mathematics holds this Saturday, 8am – 10am in Room 4B. All students are encouraged to attend.', date: '2026-09-18', classTarget: 'Primary 4', teacherId: DEMO_TEACHER_ID },
  ]

  const n = (userId: string, kind: AppNotification['kind'], title: string, body: string, date: string, read: boolean, link?: string): AppNotification =>
    ({ id: `N-${userId}-${title.length}-${date}`, userId, kind, title, body, date, read, link })

  const notifications: AppNotification[] = [
    n('PAR-DEMO', 'score', 'New score uploaded', "Mrs. Okafor uploaded Amara's Mathematics score — 62/100 for the September assessment.", hoursAgo(2), false, '/app/support/Mathematics'),
    n('PAR-DEMO', 'alert', 'Missing homework flagged', 'Amara has a missing Mathematics worksheet (Fractions) that was due Sep 20.', hoursAgo(26), false, '/app/dashboard'),
    n('PAR-DEMO', 'announcement', 'Second Term Examination Schedule', 'Second term exams begin Monday 28 September. All students must bring their exam cards.', hoursAgo(50), false),
    n('PAR-DEMO', 'progress', 'Weekly progress report ready', "Amara's weekly summary for Sep 11–18 is available. Overall average steady.", '2026-09-18T09:00:00', true, '/app/journey'),
    n('PAR-DEMO', 'score', 'Science score updated', 'Amara scored 82/100 on a Science lab report. Trending up from last term.', '2026-09-15T14:00:00', true, '/app/journey'),
    n(DEMO_TEACHER_ID, 'alert', 'Score submission reminder', 'Third term scores for Primary 4 are due by Sep 30. Please upload before the deadline.', hoursAgo(3), false, '/teacher/scores'),
    n(DEMO_TEACHER_ID, 'info', "Parent viewed Amara's profile", "Fatima Adeyemi reviewed Amara's academic scores and support guidance this morning.", hoursAgo(5), false),
    n(DEMO_TEACHER_ID, 'announcement', 'Announcement published', 'Your exam schedule announcement has been sent to all Primary 4 parents.', '2026-09-20T10:00:00', true),
  ]

  const actions: SupportAction[] = [
    { id: 'ACT-SEED', studentId: 'STU-001', subject: 'Mathematics', title: 'Use real-world maths', startedAt: '2026-08-28', baselineScore: 60, status: 'trying' },
  ]

  return { version: DB_VERSION, parents: [parent], teachers: [teacher], students, announcements, notifications, actions }
}
