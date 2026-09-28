import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { average, scoreFor, statusFor, subjectStatus } from './academics'
import { todayISO, uid } from './format'
import { Splash } from './Splash'
import {
  StoreContext, emptyDB, firstName, reportError, teacherDisplayName, teachesStudent, withSnapshot,
  type StoreValue,
} from './store-core'
import type {
  Announcement, AppNotification, DB, ParentUser, Session, StudentRecord, SupportAction, TeacherUser,
} from './types'

// Cloud backend: Supabase (Postgres + Auth + Realtime). Access rules live in
// supabase/schema.sql as Row Level Security, so the database enforces privacy.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

const LEARNER_KEY = 'leif-learner'   // per tab: learners use code + PIN, not accounts
const CHILD_KEY = 'leif-active-child'

function session<T>(key: string): T | null {
  try { const raw = sessionStorage.getItem(key); return raw ? JSON.parse(raw) as T : null } catch { return null }
}
function setSessionItem(key: string, value: unknown) {
  try { if (value === null) sessionStorage.removeItem(key); else sessionStorage.setItem(key, JSON.stringify(value)) } catch { /* in-memory only */ }
}

// ── Row ↔ app model ──────────────────────────────────────────────────────
function toStudent(r: Row, pins: Record<string, string>): StudentRecord {
  return {
    id: r.id, name: r.name, class: r.class, gender: r.gender ?? undefined, age: r.age ?? undefined,
    school: r.school, scores: r.scores, history: r.history, attendance: r.attendance,
    weaknesses: r.weaknesses, strengths: r.strengths, teacherNote: r.teacher_note,
    lastUpdated: r.last_updated, status: r.status, assignments: r.assignments,
    parentName: r.parent_name, parentPhone: r.parent_phone, parentId: r.parent_id ?? undefined,
    learnerPin: pins[r.id] ?? '', privacy: r.privacy, sampleData: r.sample_data,
  }
}

const studentRow = (s: StudentRecord) => ({
  name: s.name, class: s.class, gender: s.gender ?? null, age: s.age ?? null, school: s.school,
  scores: s.scores, history: s.history, attendance: s.attendance, weaknesses: s.weaknesses,
  strengths: s.strengths, teacher_note: s.teacherNote, last_updated: s.lastUpdated.slice(0, 10),
  status: s.status, assignments: s.assignments, parent_name: s.parentName, parent_phone: s.parentPhone,
  privacy: s.privacy, sample_data: s.sampleData,
})

const toNotification = (r: Row): AppNotification =>
  ({ id: r.id, userId: r.user_id, kind: r.kind, title: r.title, body: r.body, date: r.date, read: r.read, link: r.link ?? undefined })

const toAction = (r: Row): SupportAction => ({
  id: r.id, studentId: r.student_id, subject: r.subject, title: r.title, startedAt: r.started_at,
  baselineScore: r.baseline_score, status: r.status, completedAt: r.completed_at ?? undefined,
})

const toAnnouncement = (r: Row): Announcement =>
  ({ id: r.id, title: r.title, body: r.body, date: r.date, classTarget: r.class_target, teacherId: r.teacher_code })

const toParent = (p: Row, childIds: string[]): ParentUser => ({
  id: p.id, firstName: p.first_name, lastName: p.last_name, email: p.email, phone: p.phone,
  passwordHash: '', childIds, createdAt: String(p.created_at).slice(0, 10), prefs: p.prefs, language: p.language,
})

const toTeacher = (p: Row): TeacherUser => ({
  id: p.teacher_code, firstName: p.first_name, lastName: p.last_name, title: p.title, email: p.email,
  phone: p.phone, school: p.school, schoolId: p.school_id, subjects: p.subjects, classes: p.classes,
  passwordHash: '', joined: String(p.created_at).slice(0, 10),
})

function friendly(message: string) {
  if (/invalid login/i.test(message)) return 'That email and password don’t match an account.'
  if (/not confirmed/i.test(message)) return 'Please confirm your email first. Check your inbox for the link from LEIF.'
  if (/already registered|already exists/i.test(message)) return 'An account with this email already exists. Try signing in instead.'
  if (/rate limit|too many/i.test(message)) return 'Too many attempts. Please wait a minute and try again.'
  if (/fetch|network/i.test(message)) return 'Can’t reach LEIF right now. Check your internet connection and try again.'
  return message
}

const randomPin = () => String(Math.floor(1000 + Math.random() * 9000))

export default function RemoteStoreProvider({ client, children }: { client: SupabaseClient; children: React.ReactNode }) {
  const sb = client
  const [db, setDb] = useState<DB>(emptyDB)
  const [sess, setSess] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const dbRef = useRef(db)
  dbRef.current = db
  const sessRef = useRef(sess)
  sessRef.current = sess
  const learner = useRef(session<{ code: string; pin: string }>(LEARNER_KEY))

  /** Pull everything the signed-in user is allowed to see (RLS decides what that is). */
  const inFlight = useRef<Promise<Session['role'] | null> | null>(null)
  const signingIn = useRef(false)
  const load = useCallback((): Promise<Session['role'] | null> => {
    // Overlapping refresh requests (e.g. several live updates at once) share one round of requests.
    if (!inFlight.current) inFlight.current = fetchAll().finally(() => { inFlight.current = null })
    return inFlight.current

    async function fetchAll(): Promise<Session['role'] | null> {
      if (learner.current) {
        const { data, error } = await sb.rpc('learner_get', { p_code: learner.current.code, p_pin: learner.current.pin })
        if (error || !data) {
          learner.current = null
          setSessionItem(LEARNER_KEY, null)
          setDb(emptyDB()); setSess(null)
          return null
        }
        const s = toStudent(data as Row, {})
        setDb({ ...emptyDB(), students: [s] })
        setSess({ role: 'learner', userId: s.id })
        return 'learner'
      }

      const { data: auth } = await sb.auth.getSession()
      const user = auth.session?.user
      if (!user) { setDb(emptyDB()); setSess(null); return null }

      // One parallel round trip; RLS returns empty sets for tables this role can't read.
      const [profileRes, students, notes, actions, anns, pins] = await Promise.all([
        sb.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        sb.from('students').select('*').order('name'),
        sb.from('notifications').select('*').order('date', { ascending: false }).limit(200),
        sb.from('support_actions').select('*'),
        sb.from('announcements').select('*').order('date', { ascending: false }),
        sb.from('learner_pins').select('*'),
      ])
      const profile = profileRes.data
      if (profileRes.error) { reportError(friendly(profileRes.error.message)); return null }
      if (!profile) { setDb(emptyDB()); setSess(null); return null }
      const isParent = profile.role === 'parent'
      const pinMap = Object.fromEntries((pins.data ?? []).map((r: Row) => [r.student_id, r.pin]))
      const studentList = (students.data ?? []).map((r: Row) => toStudent(r, pinMap))

      setDb({
        version: 0,
        parents: isParent ? [toParent(profile, studentList.map(s => s.id))] : [],
        teachers: isParent ? [] : [toTeacher(profile)],
        students: studentList,
        announcements: isParent ? [] : (anns.data ?? []).map(toAnnouncement),
        notifications: (notes.data ?? []).map(toNotification),
        actions: (actions.data ?? []).map(toAction),
      })
      setSess(prev => isParent
        ? { role: 'parent', userId: profile.id, activeChildId: prev?.activeChildId ?? session<string>(CHILD_KEY) ?? studentList[0]?.id }
        : { role: 'teacher', userId: profile.teacher_code })
      return isParent ? 'parent' : 'teacher'
    }
  }, [sb])

  // Initial load + react to sign-in/out (including from the password-reset email link).
  useEffect(() => {
    load().finally(() => setReady(true))
    const { data } = sb.auth.onAuthStateChange(event => {
      // Supabase advises not awaiting its own calls inside this callback.
      // Our own sign-in functions load right after signing in, so skip the duplicate.
      if (event === 'SIGNED_IN' && signingIn.current) return
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY') setTimeout(load, 0)
    })
    return () => data.subscription.unsubscribe()
  }, [sb, load])

  // Live updates: any change the user can see triggers a (debounced) refresh.
  const signedIn = sess?.role === 'parent' || sess?.role === 'teacher'
  useEffect(() => {
    if (!signedIn) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const channel = sb.channel('leif-live')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        clearTimeout(timer)
        timer = setTimeout(load, 400)
      })
      .subscribe()
    return () => { clearTimeout(timer); sb.removeChannel(channel) }
  }, [sb, signedIn, load])

  const value = useMemo<StoreValue>(() => {
    const current = () => dbRef.current
    const me = () => sessRef.current

    /** Await a write; on failure tell the user and resync from the server. */
    async function run(p: PromiseLike<{ error: { message: string } | null }>, what = 'your changes') {
      const { error } = await p
      if (error) {
        console.error(error)
        reportError(`Couldn’t save ${what}. Please try again.`)
        load()
        return false
      }
      return true
    }

    /** Optimistically update a learner record, then persist it. */
    function patchStudent(id: string, fn: (s: StudentRecord) => StudentRecord) {
      const before = current().students.find(s => s.id === id)
      if (!before) return Promise.resolve(false)
      const next = fn(before)
      setDb(d => ({ ...d, students: d.students.map(s => (s.id === id ? next : s)) }))
      return run(sb.from('students').update(studentRow(next)).eq('id', id))
    }

    const notifyParents = (studentId: string, pref: string | null, kind: string, title: string, body: string, link: string) =>
      run(sb.rpc('notify_parents', { p_student: studentId, p_pref: pref, p_kind: kind, p_title: title, p_body: body, p_link: link }), 'the parent notification')

    const teacher = () => current().teachers[0]

    /** Sign in, then load exactly once with the new session. */
    async function signInThenLoad(signIn: () => Promise<string | null>) {
      signingIn.current = true
      try {
        const error = await signIn()
        if (error) return { error, role: null }
        learner.current = null
        setSessionItem(LEARNER_KEY, null)
        if (inFlight.current) await inFlight.current
        return { error: null, role: await load() }
      } finally {
        signingIn.current = false
      }
    }

    return {
      mode: 'supabase',
      db,
      session: sess,

      async signInParent(email, password) {
        const { error, role } = await signInThenLoad(async () => {
          const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
          return error ? friendly(error.message) : null
        })
        if (error) return error
        if (role !== 'parent') {
          await sb.auth.signOut()
          return 'This is a teacher account. Please use the Teacher portal to sign in.'
        }
        return null
      },

      async signUpParent(input) {
        const { data, error } = await sb.auth.signUp({
          email: input.email.trim(),
          password: input.password,
          options: {
            emailRedirectTo: `${location.origin}/app/dashboard`,
            data: {
              role: 'parent', accepted_terms: true, first_name: input.firstName.trim(), last_name: input.lastName.trim(),
              child: { name: input.child.name.trim(), class: input.child.class, age: input.child.age ?? '', school: input.child.school.trim() },
            },
          },
        })
        if (error) return { error: friendly(error.message) }
        // With email confirmation on, an existing address comes back with no identities.
        if (data.user && data.user.identities?.length === 0) return { error: 'An account with this email already exists. Try signing in instead.' }
        if (!data.session) return { error: null, confirmEmail: true }
        await load()
        return { error: null, confirmEmail: false }
      },

      async resetParentPassword(email) {
        const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/reset-password` })
        return error ? friendly(error.message) : null
      },

      async updatePassword(password) {
        const { error } = await sb.auth.updateUser({ password })
        if (error) return friendly(error.message)
        await load()
        return null
      },

      async signInTeacher(school, teacherId, password) {
        const { data: email, error: lookupError } = await sb.rpc('teacher_login_email', { p_code: teacherId, p_school: school })
        if (lookupError) return friendly(lookupError.message)
        if (!email) return 'We couldn’t find that teacher ID at that school.'
        const { error, role } = await signInThenLoad(async () => {
          const { error } = await sb.auth.signInWithPassword({ email, password })
          if (!error) return null
          return /invalid login/i.test(error.message) ? 'Teacher ID or password is incorrect.' : friendly(error.message)
        })
        if (error) return error
        if (role !== 'teacher') {
          await sb.auth.signOut()
          return 'This is a parent account. Please use the parent sign-in page.'
        }
        return null
      },

      async signUpTeacher(input) {
        const { data: taken } = await sb.rpc('teacher_code_taken', { p_code: input.teacherId })
        if (taken) return { error: 'That teacher ID is already registered. Sign in instead.' }
        const { data, error } = await sb.auth.signUp({
          email: input.email.trim(),
          password: input.password,
          options: {
            emailRedirectTo: `${location.origin}/teacher/overview`,
            data: {
              role: 'teacher', accepted_terms: true, first_name: input.firstName.trim(), last_name: input.lastName.trim(),
              teacher_code: input.teacherId.trim().toUpperCase(), school: input.schoolName.trim(),
              school_id: input.schoolId.trim(), subjects: input.subjects, classes: input.classes,
            },
          },
        })
        if (error) return { error: friendly(error.message) }
        if (data.user && data.user.identities?.length === 0) return { error: 'An account with this email already exists. Try signing in instead.' }
        if (!data.session) return { error: null, confirmEmail: true }
        await load()
        return { error: null, confirmEmail: false }
      },

      async signInLearner(code, pin) {
        const { data, error } = await sb.rpc('learner_get', { p_code: code.trim(), p_pin: pin.trim() })
        if (error) return friendly(error.message)
        if (!data) return 'That learner code and PIN don’t match. Ask your parent for your code.'
        learner.current = { code: code.trim(), pin: pin.trim() }
        setSessionItem(LEARNER_KEY, learner.current)
        await load()
        return null
      },

      signOut() {
        setDb(emptyDB())
        setSess(null)
        setSessionItem(CHILD_KEY, null)
        if (learner.current) {
          learner.current = null
          setSessionItem(LEARNER_KEY, null)
        } else {
          sb.auth.signOut()
        }
      },

      setActiveChild(id) {
        setSessionItem(CHILD_KEY, id)
        setSess(s => (s ? { ...s, activeChildId: id } : s))
      },

      async addChild(input) {
        const parent = current().parents[0]
        if (!parent) return null
        const { data, error } = await sb.from('students').insert({
          name: input.name.trim(), class: input.class, age: input.age ?? null, school: input.school.trim(),
          parent_id: parent.id, parent_name: `${parent.firstName} ${parent.lastName}`.trim(), parent_phone: parent.phone,
        }).select('id').single()
        if (error || !data) { reportError('Couldn’t add your child. Please try again.'); return null }
        await run(sb.from('learner_pins').insert({ student_id: data.id, pin: randomPin() }), 'the learner PIN')
        setSessionItem(CHILD_KEY, data.id)
        setSess(s => (s ? { ...s, activeChildId: data.id } : s))
        await load()
        return data.id
      },

      updateChild(id, patch) {
        if (patch.learnerPin !== undefined) {
          setDb(d => ({ ...d, students: d.students.map(s => (s.id === id ? { ...s, learnerPin: patch.learnerPin! } : s)) }))
          run(sb.from('learner_pins').upsert({ student_id: id, pin: patch.learnerPin }), 'the learner PIN')
        }
        const { learnerPin: _pin, ...fields } = patch
        if (Object.keys(fields).length) {
          patchStudent(id, s => ({
            ...s,
            ...(fields.name !== undefined && { name: fields.name.trim() }),
            ...(fields.age !== undefined && { age: fields.age }),
            ...(fields.class !== undefined && { class: fields.class }),
            ...(fields.school !== undefined && { school: fields.school.trim() }),
          }))
        }
      },

      updatePrivacy(childId, patch) {
        const guardians = patch.guardians?.map(g => g.trim().toLowerCase())
        patchStudent(childId, s => ({ ...s, privacy: { ...s.privacy, ...patch, ...(guardians && { guardians }) } }))
      },

      updateParent(patch) {
        const p = current().parents[0]
        if (!p) return
        setDb(d => ({ ...d, parents: d.parents.map(x => ({ ...x, ...patch })) }))
        run(sb.from('profiles').update({
          first_name: patch.firstName ?? p.firstName, last_name: patch.lastName ?? p.lastName,
          phone: patch.phone ?? p.phone, language: patch.language ?? p.language,
        }).eq('id', p.id))
      },

      updatePrefs(patch) {
        const p = current().parents[0]
        if (!p) return
        const prefs = { ...p.prefs, ...patch }
        setDb(d => ({ ...d, parents: d.parents.map(x => ({ ...x, prefs })) }))
        run(sb.from('profiles').update({ prefs }).eq('id', p.id), 'your notification settings')
      },

      addParentResult(childId, subject, score) {
        patchStudent(childId, s => {
          const scores = [...s.scores.filter(x => x.subject !== subject), { subject, score, term: 'Parent entry', maxScore: 100 }]
          const next = { ...s, scores, lastUpdated: todayISO() }
          return withSnapshot({ ...next, status: statusFor(next) })
        }).then(ok => {
          if (ok) run(sb.from('score_uploads').insert({ student_id: childId, source: 'parent', term: 'Parent entry', scores: { [subject]: score } }), 'the score history')
        })
      },

      startAction(childId, subject, title) {
        const student = current().students.find(s => s.id === childId)
        if (!student) return
        const action: SupportAction = {
          id: uid('ACT'), studentId: childId, subject, title,
          startedAt: todayISO(), baselineScore: scoreFor(student, subject) ?? 0, status: 'trying',
        }
        setDb(d => ({ ...d, actions: [...d.actions, action] }))
        run(sb.from('support_actions').insert({
          id: action.id, student_id: childId, subject, title, started_at: action.startedAt, baseline_score: action.baselineScore,
        }), 'your support plan').then(ok => {
          if (ok && student.privacy.shareActivityWithTeacher) {
            run(sb.rpc('notify_teachers', {
              p_student: childId, p_kind: 'info',
              p_title: `${firstName(student.name)}'s parent is supporting ${subject} at home`,
              p_body: `They started: “${title}”.`, p_link: `/teacher/students/${childId}`,
            }), 'the teacher notification')
          }
        })
      },

      completeAction(id) {
        setDb(d => ({ ...d, actions: d.actions.map(a => (a.id === id ? { ...a, status: 'done', completedAt: todayISO() } : a)) }))
        run(sb.from('support_actions').update({ status: 'done', completed_at: todayISO() }).eq('id', id))
      },

      removeAction(id) {
        setDb(d => ({ ...d, actions: d.actions.filter(a => a.id !== id) }))
        run(sb.from('support_actions').delete().eq('id', id))
      },

      markRead(id) {
        setDb(d => ({ ...d, notifications: d.notifications.map(n => (n.id === id ? { ...n, read: true } : n)) }))
        run(sb.from('notifications').update({ read: true }).eq('id', id))
      },

      markAllRead() {
        const userId = me()?.userId
        if (!userId) return
        setDb(d => ({ ...d, notifications: d.notifications.map(n => (n.userId === userId ? { ...n, read: true } : n)) }))
        run(sb.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false))
      },

      saveScores(studentId, upload) {
        const before = current().students.find(s => s.id === studentId)
        if (!before) return
        const scores = Object.entries(upload.scores).map(([subject, score]) => ({ subject, score, term: upload.term, maxScore: 100 }))
        patchStudent(studentId, s => {
          const next: StudentRecord = {
            ...s, scores, weaknesses: upload.weaknesses, strengths: upload.strengths,
            teacherNote: upload.note, lastUpdated: todayISO(), sampleData: false,
          }
          return withSnapshot({ ...next, status: statusFor(next) })
        }).then(ok => {
          if (!ok) return
          run(sb.from('score_uploads').insert({
            student_id: studentId, source: 'teacher', term: upload.term, scores: upload.scores,
            weaknesses: upload.weaknesses, strengths: upload.strengths, note: upload.note,
          }), 'the score history')
          const saved = current().students.find(s => s.id === studentId)!
          const child = firstName(saved.name)
          notifyParents(studentId, 'scores', 'score', 'New scores uploaded',
            `${teacherDisplayName(teacher())} uploaded ${child}'s ${upload.term} results — average ${average(saved)}/100.`, '/app/dashboard')
          scores
            .filter(sc => {
              const prev = before.scores.find(x => x.subject === sc.subject)?.score
              return subjectStatus(sc.score, prev === undefined ? 0 : sc.score - prev) === 'concern'
            })
            .forEach(c => notifyParents(studentId, 'scores', 'alert', `${c.subject} needs attention`,
              `${child} scored ${c.score}/100 in ${c.subject}. See practical ways to help at home.`, `/app/support/${encodeURIComponent(c.subject)}`))
        })
      },

      setAttendance(studentId, date, status) {
        const s = current().students.find(x => x.id === studentId)
        if (!s || s.attendance.find(a => a.date === date)?.status === status) return
        patchStudent(studentId, x => {
          const exists = x.attendance.some(a => a.date === date)
          const attendance = exists
            ? x.attendance.map(a => (a.date === date ? { ...a, status } : a))
            : [...x.attendance, { date, status }].sort((a, b) => a.date.localeCompare(b.date))
          return { ...x, attendance }
        }).then(ok => {
          if (ok && (status === 'absent' || status === 'late')) {
            notifyParents(studentId, 'attendance', 'alert',
              status === 'absent' ? `${firstName(s.name)} was marked absent` : `${firstName(s.name)} arrived late`,
              'Recorded by the class teacher today. Contact the school if this doesn’t look right.', '/app/dashboard')
          }
        })
      },

      postAnnouncement(input) {
        const t = teacher()
        if (!t) return
        const optimistic: Announcement = { id: uid('ANN'), ...input, date: todayISO(), teacherId: t.id }
        setDb(d => ({ ...d, announcements: [optimistic, ...d.announcements] }))
        ;(async () => {
          const ok = await run(sb.from('announcements').insert({
            id: optimistic.id, teacher_code: t.id, title: input.title, body: input.body, class_target: input.classTarget,
          }), 'the announcement')
          if (!ok) return
          const classes = input.classTarget === 'All classes' ? t.classes : [input.classTarget]
          const { data: sent } = await sb.rpc('notify_class_parents', { p_classes: classes, p_title: input.title, p_body: input.body, p_link: '/app/notifications' })
          const n = Number(sent ?? 0)
          await run(sb.from('notifications').insert({
            user_id: t.id, kind: 'announcement', title: 'Announcement published',
            body: `“${input.title}” was sent to ${n} parent${n === 1 ? '' : 's'}.`, link: '/teacher/announcements',
          }))
        })()
      },

      deleteAnnouncement(id) {
        setDb(d => ({ ...d, announcements: d.announcements.filter(a => a.id !== id) }))
        run(sb.from('announcements').delete().eq('id', id))
      },

      createAssignment(input) {
        const t = teacher()
        if (!t) return
        const classes = input.classTarget === 'All classes' ? t.classes : [input.classTarget]
        const assignmentId = uid('A')
        current().students
          .filter(s => teachesStudent(t, s) && classes.includes(s.class))
          .forEach(s => patchStudent(s.id, x => ({
            ...x,
            assignments: [...x.assignments, { id: assignmentId, title: input.title, subject: input.subject, dueDate: input.dueDate, submitted: false }],
          })))
      },

      gradeAssignment(studentId, assignmentId, score) {
        const s = current().students.find(x => x.id === studentId)
        const a = s?.assignments.find(x => x.id === assignmentId)
        if (!s || !a) return
        patchStudent(studentId, x => ({
          ...x,
          assignments: x.assignments.map(y => (y.id === assignmentId ? { ...y, score, submitted: true, submittedAt: y.submittedAt ?? todayISO() } : y)),
        })).then(ok => {
          if (ok) notifyParents(studentId, 'scores', 'score', `${a.subject} work marked`, `${firstName(s.name)} scored ${score}/100 on “${a.title}”.`, '/app/dashboard')
        })
      },

      updateTeacher(patch) {
        const t = teacher()
        if (!t) return
        setDb(d => ({ ...d, teachers: d.teachers.map(x => ({ ...x, ...patch })) }))
        sb.auth.getSession().then(({ data }) => {
          const id = data.session?.user.id
          if (!id) return
          run(sb.from('profiles').update({
            first_name: patch.firstName ?? t.firstName, last_name: patch.lastName ?? t.lastName,
            email: patch.email ?? t.email, phone: patch.phone ?? t.phone,
          }).eq('id', id))
        })
      },

      submitAssignment(assignmentId) {
        const creds = learner.current
        if (!creds) return
        setDb(d => ({
          ...d,
          students: d.students.map(s => ({
            ...s,
            assignments: s.assignments.map(a => (a.id === assignmentId ? { ...a, submitted: true, submittedAt: new Date().toISOString() } : a)),
          })),
        }))
        sb.rpc('learner_submit', { p_code: creds.code, p_pin: creds.pin, p_assignment: assignmentId }).then(({ data, error }) => {
          if (error) { reportError('Couldn’t save that. Please try again.'); load(); return }
          if (data) setDb(d => ({ ...d, students: [toStudent(data as Row, {})] }))
        })
      },

      track(name, props = {}) {
        sb.from('events').insert({ role: me()?.role ?? null, name, props }).then(({ error }) => {
          if (error) console.warn('analytics:', error.message)
        })
      },

      async resetDemo() {
        // Demo data in the cloud is reset by re-running supabase/seed.sql.
      },
    }
  }, [db, sess, sb, load])

  if (!ready) return <Splash />
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
