import { createContext } from 'react'
import { monthLabel, todayISO, uid } from './format'
import type {
  AppNotification, AttendanceStatus, DB, NotificationPrefs, ParentUser, Privacy,
  Session, StudentRecord, TeacherUser,
} from './types'

// Shared by both storage backends: browser-only (store-local) and Supabase (store-remote).

export interface ChildInput { name: string; age?: number; class: string; school: string }

export interface ParentSignUp {
  firstName: string
  lastName: string
  email: string
  password: string
  /** Either create a new child profile… */
  child?: ChildInput
  /** …or connect to a learner the teacher already added. */
  connect?: { code: string; linkCode: string }
}

export interface TeacherSignUp {
  schoolName: string
  schoolId: string
  teacherId: string
  firstName: string
  lastName: string
  email: string
  password: string
  subjects: string[]
  classes: string[]
}

export interface StudentInput {
  name: string
  class: string
  age?: number
  gender?: 'M' | 'F'
  parentName: string
  parentPhone: string
}

/** Short, unambiguous code (no 0/O, 1/I) for parents to type in. */
export function newLinkCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export interface ScoreUpload {
  term: string
  scores: Record<string, number>
  weaknesses: string[]
  strengths: string[]
  note: string
}

export type Result = string | null // error message, or null on success
export type SignUpResult = { error: string } | { error: null; confirmEmail: boolean }

export interface StoreValue {
  /** 'local' = data in this browser only; 'supabase' = shared cloud database. */
  mode: 'local' | 'supabase'
  db: DB
  session: Session | null
  // auth
  signInParent: (email: string, password: string) => Promise<Result>
  signUpParent: (input: ParentSignUp) => Promise<SignUpResult>
  /** Local mode sets the password directly; Supabase mode emails a reset link. */
  resetParentPassword: (email: string, password?: string) => Promise<Result>
  updatePassword: (password: string) => Promise<Result>
  signInTeacher: (school: string, teacherId: string, password: string) => Promise<Result>
  signUpTeacher: (input: TeacherSignUp) => Promise<SignUpResult>
  signInLearner: (code: string, pin: string) => Promise<Result>
  signOut: () => void
  // parent
  setActiveChild: (id: string) => void
  addChild: (input: ChildInput) => Promise<string | null>
  /** Parent connects to a learner their teacher already added (learner code + link code). */
  connectChild: (code: string, linkCode: string) => Promise<Result>
  updateChild: (id: string, patch: Partial<ChildInput> & { learnerPin?: string }) => void
  updatePrivacy: (childId: string, patch: Partial<Privacy>) => void
  updateParent: (patch: Partial<Pick<ParentUser, 'firstName' | 'lastName' | 'phone' | 'language'>>) => void
  updatePrefs: (patch: Partial<NotificationPrefs>) => void
  addParentResult: (childId: string, subject: string, score: number) => void
  startAction: (childId: string, subject: string, title: string) => void
  completeAction: (id: string) => void
  removeAction: (id: string) => void
  // notifications
  markRead: (id: string) => void
  markAllRead: () => void
  // teacher
  saveScores: (studentId: string, upload: ScoreUpload) => void
  setAttendance: (studentId: string, date: string, status: AttendanceStatus) => void
  postAnnouncement: (input: { title: string; body: string; classTarget: string }) => void
  deleteAnnouncement: (id: string) => void
  createAssignment: (input: { title: string; subject: string; dueDate: string; classTarget: string }) => void
  gradeAssignment: (studentId: string, assignmentId: string, score: number) => void
  /** Teacher adds a learner before any parent has joined; returns the new record. */
  addStudent: (input: StudentInput) => Promise<StudentRecord | null>
  updateTeacher: (patch: Partial<Pick<TeacherUser, 'firstName' | 'lastName' | 'email' | 'phone'>>) => void
  // learner
  submitAssignment: (assignmentId: string) => void
  // analytics for the PRD success metrics (§16)
  track: (name: TrackEvent, props?: Record<string, unknown>) => void
  // demo (local mode only)
  resetDemo: () => Promise<void>
}

export type TrackEvent =
  | 'onboarding_completed' | 'dashboard_viewed' | 'concern_opened' | 'guidance_viewed'
  | 'guidance_feedback' | 'action_started' | 'action_completed' | 'journey_viewed'
  | 'scores_published' | 'learner_task_completed'

export const StoreContext = createContext<StoreValue | null>(null)

export const norm = (s: string) => s.trim().toLowerCase()
export const firstName = (name: string) => name.split(' ')[0]

export function notification(userId: string, kind: AppNotification['kind'], title: string, body: string, link?: string): AppNotification {
  return { id: uid('N'), userId, kind, title, body, date: new Date().toISOString(), read: false, link }
}

/** A teacher only sees learners in their own classes at their own school (FR-09). */
export function teachesStudent(t: TeacherUser, s: StudentRecord) {
  return t.classes.includes(s.class) && !!s.school && norm(t.school) === norm(s.school)
}

/** Record current scores as this month's point on the Academic Journey. */
export function withSnapshot(s: StudentRecord): StudentRecord {
  const date = todayISO()
  const scores = Object.fromEntries(s.scores.map(x => [x.subject, x.score]))
  const last = s.history[s.history.length - 1]
  const sameMonth = last && last.date.slice(0, 7) === date.slice(0, 7)
  const snap = { date, label: monthLabel(date), scores }
  return { ...s, history: sameMonth ? [...s.history.slice(0, -1), snap] : [...s.history, snap] }
}

export const teacherDisplayName = (t: TeacherUser | undefined) =>
  t ? `${t.title ? `${t.title} ` : ''}${t.lastName}` : 'Your child’s teacher'

/** Surfaces background save failures to the UI (the toast system listens for this). */
export function reportError(message: string) {
  window.dispatchEvent(new CustomEvent('leif:error', { detail: message }))
}

export const emptyDB = (): DB => ({ version: 0, parents: [], teachers: [], students: [], announcements: [], notifications: [], actions: [] })
