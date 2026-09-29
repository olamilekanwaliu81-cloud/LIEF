export type Role = 'parent' | 'teacher' | 'learner'

export type PerformanceStatus = 'excellent' | 'good' | 'average' | 'needs-attention' | 'critical'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
export type SubjectStatus = 'strength' | 'neutral' | 'concern'

export interface ScoreEntry { subject: string; score: number; term: string; maxScore: number }
export interface AttendanceEntry { date: string; status: AttendanceStatus }

/** A point-in-time record of every subject score — powers the Academic Journey. */
export interface Snapshot { date: string; label: string; scores: Record<string, number> }

export interface Assignment {
  id: string
  title: string
  subject: string
  dueDate: string // ISO date
  submitted: boolean
  submittedAt?: string
  score?: number
}

export interface Privacy {
  visibility: 'family' | 'private'
  shareActivityWithTeacher: boolean
  guardians: string[] // emails of co-guardians with view access
}

export interface StudentRecord {
  id: string
  name: string
  class: string
  gender?: 'M' | 'F'
  age?: number
  school: string
  scores: ScoreEntry[]
  history: Snapshot[]
  attendance: AttendanceEntry[]
  weaknesses: string[]
  strengths: string[]
  teacherNote: string
  lastUpdated: string // ISO
  status: PerformanceStatus
  assignments: Assignment[]
  parentName: string
  parentPhone: string
  parentId?: string
  learnerPin: string
  privacy: Privacy
  /** True when the record was created by a parent and has no teacher data yet. */
  sampleData: boolean
  /** One-time code a parent uses to connect to a learner their teacher added. */
  linkCode?: string
}

export interface NotificationPrefs {
  scores: boolean
  announcements: boolean
  weekly: boolean
  attendance: boolean
}

export interface ParentUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  passwordHash: string
  childIds: string[]
  createdAt: string
  prefs: NotificationPrefs
  language: string
}

export interface TeacherUser {
  id: string // school-assigned teacher ID, e.g. TCH-0042
  firstName: string
  lastName: string
  title: string
  email: string
  phone: string
  school: string
  schoolId: string
  subjects: string[]
  classes: string[]
  passwordHash: string
  joined: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  date: string
  classTarget: string
  teacherId: string
}

export type NotificationKind = 'score' | 'alert' | 'announcement' | 'progress' | 'info' | 'learner'

export interface AppNotification {
  id: string
  userId: string
  kind: NotificationKind
  title: string
  body: string
  date: string
  read: boolean
  link?: string
}

/** A "How Can I Help?" action a parent has committed to — used to monitor improvement. */
export interface SupportAction {
  id: string
  studentId: string
  subject: string
  title: string
  startedAt: string
  baselineScore: number
  status: 'trying' | 'done'
  completedAt?: string
}

export interface DB {
  version: number
  parents: ParentUser[]
  teachers: TeacherUser[]
  students: StudentRecord[]
  announcements: Announcement[]
  notifications: AppNotification[]
  actions: SupportAction[]
}

export interface Session {
  role: Role
  userId: string
  activeChildId?: string
}
