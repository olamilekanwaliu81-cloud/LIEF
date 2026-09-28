import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { average, statusFor, subjectStatus, scoreFor } from './academics'
import { todayISO, uid } from './format'
import { createSeed, DB_VERSION } from './seed'
import { Splash } from './Splash'
import {
  StoreContext, firstName, norm, notification, teachesStudent, withSnapshot,
  type ChildInput, type StoreValue,
} from './store-core'
import type { AppNotification, DB, NotificationPrefs, ParentUser, Session, StudentRecord, SupportAction, TeacherUser } from './types'

// Browser-only backend: everything lives in this browser's localStorage.
// Used when no Supabase keys are configured (e.g. inside Figma Make).
const DB_KEY = 'leif-db'
const SESSION_KEY = 'leif-session'

function read<T>(key: string, storage: Storage = localStorage): T | null {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown, storage: Storage = localStorage) {
  try {
    if (value === null) storage.removeItem(key)
    else storage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked (private mode) — the app keeps working in memory.
  }
}

// Each tab keeps its own session (so a parent and a teacher can be signed in
// side by side); new tabs start from the most recent one.
const readSession = () => read<Session>(SESSION_KEY, sessionStorage) ?? read<Session>(SESSION_KEY)
const writeSession = (s: Session | null) => { write(SESSION_KEY, s, sessionStorage); write(SESSION_KEY, s) }

export async function hashPassword(password: string, salt: string) {
  const input = `${salt.trim().toLowerCase()}:${password}`
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  // Non-secure contexts (plain-http LAN preview) have no SubtleCrypto.
  let h = 2166136261
  for (const c of input) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return `fnv-${(h >>> 0).toString(16)}`
}

/** Parents linked to a student whose preferences allow this kind of notification. */
function parentsOf(db: DB, studentId: string, pref?: keyof NotificationPrefs) {
  return db.parents.filter(p => p.childIds.includes(studentId) && (!pref || p.prefs[pref]))
}

export default function LocalStoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB | null>(null)
  const [session, setSession] = useState<Session | null>(readSession)
  const dbRef = useRef<DB | null>(null)
  dbRef.current = db

  // Load (or seed) the database once.
  useEffect(() => {
    const stored = read<DB>(DB_KEY)
    if (stored && stored.version === DB_VERSION) setDb(stored)
    else createSeed(hashPassword).then(setDb)
  }, [])

  useEffect(() => { if (db) write(DB_KEY, db) }, [db])
  useEffect(() => { writeSession(session) }, [session])

  // Live sync: a teacher publishing in one tab updates the parent's tab instantly.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === DB_KEY && e.newValue) setDb(JSON.parse(e.newValue))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((fn: (db: DB) => DB) => setDb(prev => (prev ? fn(prev) : prev)), [])
  const updateStudent = useCallback((id: string, fn: (s: StudentRecord) => StudentRecord) =>
    update(d => ({ ...d, students: d.students.map(s => (s.id === id ? fn(s) : s)) })), [update])

  const sessionRef = useRef(session)
  sessionRef.current = session

  const value = useMemo<StoreValue | null>(() => {
    if (!db) return null
    const current = () => dbRef.current!
    const me = () => sessionRef.current

    const newStudent = (input: ChildInput, parent: { id: string; name: string; phone: string }): StudentRecord => ({
      id: uid('STU'),
      name: input.name.trim(),
      class: input.class,
      age: input.age,
      school: input.school.trim(),
      scores: [],
      history: [],
      attendance: [],
      weaknesses: [],
      strengths: [],
      teacherNote: '',
      lastUpdated: todayISO(),
      status: 'average',
      assignments: [],
      parentName: parent.name,
      parentPhone: parent.phone,
      parentId: parent.id,
      learnerPin: String(Math.floor(1000 + Math.random() * 9000)),
      privacy: { visibility: 'private', shareActivityWithTeacher: false, guardians: [] },
      sampleData: true,
    })

    return {
      mode: 'local',
      db,
      session,

      async signInParent(email, password) {
        const user = current().parents.find(p => norm(p.email) === norm(email))
        if (!user || user.passwordHash !== await hashPassword(password, user.email)) {
          return 'That email and password don’t match an account on this device.'
        }
        setSession({ role: 'parent', userId: user.id, activeChildId: user.childIds[0] })
        return null
      },

      async signUpParent(input) {
        if (current().parents.some(p => norm(p.email) === norm(input.email))) {
          return { error: 'An account with this email already exists. Try signing in instead.' }
        }
        const id = uid('PAR')
        const name = `${input.firstName} ${input.lastName}`.trim()
        const child = newStudent(input.child, { id, name, phone: '' })
        const parent: ParentUser = {
          id,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email: input.email.trim(),
          phone: '',
          passwordHash: await hashPassword(input.password, input.email),
          childIds: [child.id],
          createdAt: todayISO(),
          prefs: { scores: true, announcements: true, weekly: true, attendance: true },
          language: 'English',
        }
        update(d => ({
          ...d,
          parents: [...d.parents, parent],
          students: [...d.students, child],
          notifications: [
            notification(id, 'info', `Welcome to LEIF, ${parent.firstName}!`, `${child.name}'s profile is ready. Add a recent result or wait for their teacher to upload scores.`, '/app/dashboard'),
            ...d.notifications,
          ],
        }))
        setSession({ role: 'parent', userId: id, activeChildId: child.id })
        return { error: null, confirmEmail: false }
      },

      async resetParentPassword(email, password = '') {
        const user = current().parents.find(p => norm(p.email) === norm(email))
        if (!user) return 'No account with that email exists on this device.'
        const passwordHash = await hashPassword(password, user.email)
        update(d => ({ ...d, parents: d.parents.map(p => (p.id === user.id ? { ...p, passwordHash } : p)) }))
        return null
      },

      async signInTeacher(school, teacherId, password) {
        const t = current().teachers.find(x => norm(x.id) === norm(teacherId))
        if (!t || t.passwordHash !== await hashPassword(password, t.id)) {
          return 'Teacher ID or password is incorrect.'
        }
        if (!norm(t.school).includes(norm(school)) && !norm(school).includes(norm(t.school))) {
          return `Teacher ID ${t.id} isn’t registered at that school.`
        }
        setSession({ role: 'teacher', userId: t.id })
        return null
      },

      async signUpTeacher(input) {
        const id = input.teacherId.trim().toUpperCase()
        if (current().teachers.some(t => norm(t.id) === norm(id))) {
          return { error: 'That teacher ID is already registered. Sign in instead.' }
        }
        const teacher: TeacherUser = {
          id,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          title: '',
          email: input.email.trim(),
          phone: '',
          school: input.schoolName.trim(),
          schoolId: input.schoolId.trim(),
          subjects: input.subjects,
          classes: input.classes,
          passwordHash: await hashPassword(input.password, id),
          joined: todayISO(),
        }
        update(d => ({ ...d, teachers: [...d.teachers, teacher] }))
        setSession({ role: 'teacher', userId: id })
        return { error: null, confirmEmail: false }
      },

      async updatePassword() {
        return 'Password links are only used with the cloud database.'
      },

      async signInLearner(code, pin) {
        const s = current().students.find(x => norm(x.id) === norm(code))
        if (!s || s.learnerPin !== pin.trim()) return 'That learner code and PIN don’t match. Ask your parent for your code.'
        setSession({ role: 'learner', userId: s.id })
        return null
      },

      signOut() { setSession(null) },

      setActiveChild(id) { setSession(s => (s ? { ...s, activeChildId: id } : s)) },

      async addChild(input) {
        const s = me()!
        const parent = current().parents.find(p => p.id === s.userId)!
        const child = newStudent(input, { id: parent.id, name: `${parent.firstName} ${parent.lastName}`.trim(), phone: parent.phone })
        update(d => ({
          ...d,
          students: [...d.students, child],
          parents: d.parents.map(p => (p.id === parent.id ? { ...p, childIds: [...p.childIds, child.id] } : p)),
        }))
        setSession(prev => (prev ? { ...prev, activeChildId: child.id } : prev))
        return child.id
      },

      updateChild(id, patch) {
        updateStudent(id, s => ({
          ...s,
          ...(patch.name !== undefined && { name: patch.name.trim() }),
          ...(patch.age !== undefined && { age: patch.age }),
          ...(patch.class !== undefined && { class: patch.class }),
          ...(patch.school !== undefined && { school: patch.school.trim() }),
          ...(patch.learnerPin !== undefined && { learnerPin: patch.learnerPin }),
        }))
      },

      updatePrivacy(childId, patch) {
        updateStudent(childId, s => ({ ...s, privacy: { ...s.privacy, ...patch } }))
      },

      updateParent(patch) {
        const id = me()!.userId
        update(d => ({ ...d, parents: d.parents.map(p => (p.id === id ? { ...p, ...patch } : p)) }))
      },

      updatePrefs(patch) {
        const id = me()!.userId
        update(d => ({ ...d, parents: d.parents.map(p => (p.id === id ? { ...p, prefs: { ...p.prefs, ...patch } } : p)) }))
      },

      addParentResult(childId, subject, score) {
        updateStudent(childId, s => {
          const scores = [...s.scores.filter(x => x.subject !== subject), { subject, score, term: 'Parent entry', maxScore: 100 }]
          const next = { ...s, scores, lastUpdated: todayISO() }
          return withSnapshot({ ...next, status: statusFor(next) })
        })
      },

      startAction(childId, subject, title) {
        const student = current().students.find(s => s.id === childId)
        if (!student) return
        const action: SupportAction = {
          id: uid('ACT'), studentId: childId, subject, title,
          startedAt: todayISO(), baselineScore: scoreFor(student, subject) ?? 0, status: 'trying',
        }
        const teacherNotes = student.privacy.shareActivityWithTeacher
          ? current().teachers.filter(t => teachesStudent(t, student))
              .map(t => notification(t.id, 'info', `${firstName(student.name)}'s parent is supporting ${subject} at home`, `They started: “${title}”.`, `/teacher/students/${student.id}`))
          : []
        update(d => ({ ...d, actions: [...d.actions, action], notifications: [...teacherNotes, ...d.notifications] }))
      },

      completeAction(id) {
        update(d => ({ ...d, actions: d.actions.map(a => (a.id === id ? { ...a, status: 'done', completedAt: todayISO() } : a)) }))
      },

      removeAction(id) {
        update(d => ({ ...d, actions: d.actions.filter(a => a.id !== id) }))
      },

      markRead(id) {
        update(d => ({ ...d, notifications: d.notifications.map(n => (n.id === id ? { ...n, read: true } : n)) }))
      },

      markAllRead() {
        const id = me()?.userId
        update(d => ({ ...d, notifications: d.notifications.map(n => (n.userId === id ? { ...n, read: true } : n)) }))
      },

      saveScores(studentId, upload) {
        const teacher = current().teachers.find(t => t.id === me()?.userId)
        update(d => {
          const before = d.students.find(s => s.id === studentId)
          if (!before) return d
          const scores = Object.entries(upload.scores).map(([subject, score]) => ({ subject, score, term: upload.term, maxScore: 100 }))
          let student: StudentRecord = {
            ...before,
            scores,
            weaknesses: upload.weaknesses,
            strengths: upload.strengths,
            teacherNote: upload.note,
            lastUpdated: todayISO(),
            sampleData: false,
          }
          student = withSnapshot({ ...student, status: statusFor(student) })

          const who = teacher ? `${teacher.title ? `${teacher.title} ` : ''}${teacher.lastName}` : 'Your child’s teacher'
          const child = firstName(student.name)
          const newConcerns = scores.filter(sc => {
            const prev = before.scores.find(x => x.subject === sc.subject)?.score
            return subjectStatus(sc.score, prev === undefined ? 0 : sc.score - prev) === 'concern'
          })
          const notes: AppNotification[] = parentsOf(d, studentId, 'scores').flatMap(p => [
            notification(p.id, 'score', 'New scores uploaded', `${who} uploaded ${child}'s ${upload.term} results — average ${average(student)}/100.`, '/app/dashboard'),
            ...newConcerns.map(c => notification(p.id, 'alert', `${c.subject} needs attention`, `${child} scored ${c.score}/100 in ${c.subject}. See practical ways to help at home.`, `/app/support/${encodeURIComponent(c.subject)}`)),
          ])
          return { ...d, students: d.students.map(s => (s.id === studentId ? student : s)), notifications: [...notes, ...d.notifications] }
        })
      },

      setAttendance(studentId, date, status) {
        update(d => {
          const s = d.students.find(x => x.id === studentId)
          if (!s) return d
          const existing = s.attendance.find(a => a.date === date)
          if (existing?.status === status) return d
          const attendance = existing
            ? s.attendance.map(a => (a.date === date ? { ...a, status } : a))
            : [...s.attendance, { date, status }].sort((a, b) => a.date.localeCompare(b.date))
          const notes = status === 'absent' || status === 'late'
            ? parentsOf(d, studentId, 'attendance').map(p => notification(p.id, 'alert',
                status === 'absent' ? `${firstName(s.name)} was marked absent` : `${firstName(s.name)} arrived late`,
                `Recorded by the class teacher today. Contact the school if this doesn’t look right.`, '/app/dashboard'))
            : []
          return {
            ...d,
            students: d.students.map(x => (x.id === studentId ? { ...x, attendance } : x)),
            notifications: [...notes, ...d.notifications],
          }
        })
      },

      postAnnouncement(input) {
        const teacherId = me()!.userId
        update(d => {
          const ann = { id: uid('ANN'), ...input, date: todayISO(), teacherId }
          const teacher = d.teachers.find(t => t.id === teacherId)
          const classes = input.classTarget === 'All classes' ? teacher?.classes ?? [] : [input.classTarget]
          const studentIds = d.students.filter(s => teacher && teachesStudent(teacher, s) && classes.includes(s.class)).map(s => s.id)
          const recipients = d.parents.filter(p => p.prefs.announcements && p.childIds.some(id => studentIds.includes(id)))
          return {
            ...d,
            announcements: [ann, ...d.announcements],
            notifications: [
              ...recipients.map(p => notification(p.id, 'announcement', input.title, input.body, '/app/notifications')),
              notification(teacherId, 'announcement', 'Announcement published', `“${input.title}” was sent to ${recipients.length} parent${recipients.length === 1 ? '' : 's'}.`, '/teacher/announcements'),
              ...d.notifications,
            ],
          }
        })
      },

      deleteAnnouncement(id) {
        update(d => ({ ...d, announcements: d.announcements.filter(a => a.id !== id) }))
      },

      createAssignment(input) {
        const teacher = current().teachers.find(t => t.id === me()?.userId)
        const classes = input.classTarget === 'All classes' ? teacher?.classes ?? [] : [input.classTarget]
        const assignmentId = uid('A')
        update(d => ({
          ...d,
          students: d.students.map(s => (teacher && teachesStudent(teacher, s) && classes.includes(s.class)
            ? { ...s, assignments: [...s.assignments, { id: assignmentId, title: input.title, subject: input.subject, dueDate: input.dueDate, submitted: false }] }
            : s)),
        }))
      },

      gradeAssignment(studentId, assignmentId, score) {
        update(d => {
          const s = d.students.find(x => x.id === studentId)
          const a = s?.assignments.find(x => x.id === assignmentId)
          if (!s || !a) return d
          const notes = parentsOf(d, studentId, 'scores').map(p => notification(p.id, 'score', `${a.subject} work marked`, `${firstName(s.name)} scored ${score}/100 on “${a.title}”.`, '/app/dashboard'))
          return {
            ...d,
            students: d.students.map(x => (x.id === studentId
              ? { ...x, assignments: x.assignments.map(y => (y.id === assignmentId ? { ...y, score, submitted: true, submittedAt: y.submittedAt ?? todayISO() } : y)) }
              : x)),
            notifications: [...notes, ...d.notifications],
          }
        })
      },

      updateTeacher(patch) {
        const id = me()!.userId
        update(d => ({ ...d, teachers: d.teachers.map(t => (t.id === id ? { ...t, ...patch } : t)) }))
      },

      submitAssignment(assignmentId) {
        const studentId = me()!.userId
        update(d => {
          const s = d.students.find(x => x.id === studentId)
          const a = s?.assignments.find(x => x.id === assignmentId)
          if (!s || !a || a.submitted) return d
          const child = firstName(s.name)
          const notes = [
            ...parentsOf(d, studentId).map(p => notification(p.id, 'learner', `${child} completed a task`, `${child} marked “${a.title}” (${a.subject}) as done.`, '/app/dashboard')),
            ...d.teachers.filter(t => teachesStudent(t, s)).map(t => notification(t.id, 'learner', `${child} submitted work`, `“${a.title}” is ready to mark.`, '/teacher/assignments')),
          ]
          return {
            ...d,
            students: d.students.map(x => (x.id === studentId
              ? { ...x, assignments: x.assignments.map(y => (y.id === assignmentId ? { ...y, submitted: true, submittedAt: new Date().toISOString() } : y)) }
              : x)),
            notifications: [...notes, ...d.notifications],
          }
        })
      },

      track() {
        // Browser-only mode has nowhere to send analytics.
      },

      async resetDemo() {
        const seed = await createSeed(hashPassword)
        setDb(seed)
        setSession(null)
      },
    }
  }, [db, session, update, updateStudent])

  if (!value) return <Splash />

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

