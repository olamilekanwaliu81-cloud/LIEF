import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import { ThemeProvider } from './context/ThemeContext'
import { StoreProvider, useStore } from './lib/store'
import type { Role } from './lib/types'
import { PageLoader, ToastProvider } from './components/ui'
import Landing from './components/Landing'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import TeacherSignIn from './components/TeacherSignIn'
import TeacherSignUp from './components/TeacherSignUp'
import LearnerSignIn from './components/LearnerSignIn'
import ParentLayout from './components/ParentLayout'
import Dashboard from './components/Dashboard'
import Support from './components/Support'
import Profile from './components/Profile'
import Settings from './components/Settings'
import Notifications from './components/Notifications'
import AddChild from './components/AddChild'
import Legal from './components/Legal'
import ResetPassword from './components/ResetPassword'
import NotFound from './components/NotFound'

// Charts (recharts) and the teacher/learner areas load on demand, keeping the
// first download small for parents on mobile data (PRD §15).
const Journey = lazy(() => import('./components/Journey'))
const LearnerHome = lazy(() => import('./components/LearnerHome'))
const TeacherLayout = lazy(() => import('./components/TeacherLayout'))
const teacherPage = (name: keyof typeof import('./components/TeacherDashboard')) =>
  lazy(() => import('./components/TeacherDashboard').then(m => ({ default: m[name] as React.ComponentType })))
const TeacherOverview = teacherPage('TeacherOverview')
const TeacherStudents = teacherPage('TeacherStudents')
const TeacherStudentDetail = teacherPage('TeacherStudentDetail')
const TeacherScores = teacherPage('TeacherScores')
const TeacherAttendance = teacherPage('TeacherAttendance')
const TeacherAssignments = teacherPage('TeacherAssignments')
const TeacherAnnouncements = teacherPage('TeacherAnnouncements')
const TeacherSettings = teacherPage('TeacherSettings')

export type Tab = 'dashboard' | 'journey' | 'support' | 'profile' | 'settings'

export const homeFor: Record<Role, string> = {
  parent: '/app/dashboard',
  teacher: '/teacher/overview',
  learner: '/learner',
}

const signInFor: Record<Role, string> = {
  parent: '/signin',
  teacher: '/teacher/signin',
  learner: '/learner/signin',
}

/** Protects a section of the app for one role. */
function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { session, db, signOut } = useStore()
  const location = useLocation()
  // A session can outlive its account (e.g. demo data reset in another tab).
  const exists = !!session && (
    session.role === 'parent' ? db.parents.some(p => p.id === session.userId)
    : session.role === 'teacher' ? db.teachers.some(t => t.id === session.userId)
    : db.students.some(s => s.id === session.userId))
  useEffect(() => { if (session && !exists) signOut() }, [session, exists, signOut])

  if (!session || !exists) return <Navigate to={signInFor[role]} replace state={{ from: location.pathname }} />
  if (session.role !== role) return <Navigate to={homeFor[session.role]} replace />
  return <>{children}</>
}

/** Sign-in/up pages bounce straight to the app when already signed in as that role. */
function GuestOnly({ role, children }: { role: Role; children: React.ReactNode }) {
  const { session } = useStore()
  if (session?.role === role) return <Navigate to={homeFor[role]} replace />
  return <>{children}</>
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signin" element={<GuestOnly role="parent"><SignIn /></GuestOnly>} />
              <Route path="/signup" element={<GuestOnly role="parent"><SignUp /></GuestOnly>} />
              <Route path="/teacher/signin" element={<GuestOnly role="teacher"><TeacherSignIn /></GuestOnly>} />
              <Route path="/teacher/signup" element={<GuestOnly role="teacher"><TeacherSignUp /></GuestOnly>} />
              <Route path="/learner/signin" element={<GuestOnly role="learner"><LearnerSignIn /></GuestOnly>} />
              <Route path="/legal/:doc" element={<Legal />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route path="/app" element={<RequireRole role="parent"><ParentLayout /></RequireRole>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="journey" element={<Journey />} />
                <Route path="support" element={<Support />} />
                <Route path="support/:subject" element={<Support />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="children/new" element={<AddChild />} />
              </Route>

              <Route path="/teacher" element={<RequireRole role="teacher"><TeacherLayout /></RequireRole>}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<TeacherOverview />} />
                <Route path="students" element={<TeacherStudents />} />
                <Route path="students/:id" element={<TeacherStudentDetail />} />
                <Route path="scores" element={<TeacherScores />} />
                <Route path="scores/:id" element={<TeacherScores />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="assignments" element={<TeacherAssignments />} />
                <Route path="announcements" element={<TeacherAnnouncements />} />
                <Route path="settings" element={<TeacherSettings />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              <Route path="/learner" element={<RequireRole role="learner"><LearnerHome /></RequireRole>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </StoreProvider>
    </ThemeProvider>
  )
}
