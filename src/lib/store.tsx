import { useContext, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import LocalStoreProvider from './store-local'
import RemoteStoreProvider from './store-remote'
import { StoreContext, teachesStudent, type TrackEvent } from './store-core'

export { hashPassword } from './store-local'
export { teachesStudent } from './store-core'
export type { ChildInput, ParentSignUp, ScoreUpload, SignUpResult, StoreValue, StudentInput, TeacherSignUp } from './store-core'

/**
 * Uses the Supabase cloud database when VITE_SUPABASE_URL and
 * VITE_SUPABASE_PUBLISHABLE_KEY are set; otherwise keeps data in this browser.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return supabase
    ? <RemoteStoreProvider client={supabase}>{children}</RemoteStoreProvider>
    : <LocalStoreProvider>{children}</LocalStoreProvider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

export function useNotifications() {
  const { db, session } = useStore()
  const items = db.notifications
    .filter(n => n.userId === session?.userId)
    .sort((a, b) => b.date.localeCompare(a.date))
  return { items, unread: items.filter(n => !n.read).length }
}

/**
 * The signed-in parent, their children, and the child currently in view.
 * `canEdit` is false for a child shared by another parent (co-guardian view).
 */
export function useParent() {
  const { db, session } = useStore()
  const parent = db.parents.find(p => p.id === session?.userId) ?? null
  const linked = parent ? db.students.filter(s => parent.childIds.includes(s.id)) : []
  // Their own children first (oldest first), then children shared with them.
  const children = [...linked.filter(s => s.parentId === parent?.id), ...linked.filter(s => s.parentId !== parent?.id)]
  const child = children.find(c => c.id === session?.activeChildId) ?? children[0] ?? null
  const actions = child ? db.actions.filter(a => a.studentId === child.id) : []
  const canEdit = !!child && child.parentId === parent?.id
  return { parent, children, child, actions, canEdit }
}

export function useTeacher() {
  const { db, session } = useStore()
  const teacher = db.teachers.find(t => t.id === session?.userId) ?? null
  const students = teacher ? db.students.filter(s => teachesStudent(teacher, s)) : []
  const announcements = teacher ? db.announcements.filter(a => a.teacherId === teacher.id) : []
  return { teacher, students, announcements }
}

export function useLearner() {
  const { db, session } = useStore()
  return db.students.find(s => s.id === session?.userId) ?? null
}

/** Records an analytics event once per distinct `id` while mounted (e.g. a page view). */
export function Track({ name, id, props }: { name: TrackEvent; id: string; props?: Record<string, unknown> }) {
  const { track } = useStore()
  const last = useRef<string | null>(null)
  useEffect(() => {
    if (last.current === id) return
    last.current = id
    track(name, props)
  }, [id, name, props, track])
  return null
}
