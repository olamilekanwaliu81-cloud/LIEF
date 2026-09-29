import { Suspense } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { BarChart2, Bell, Calendar, ClipboardList, LayoutDashboard, LogOut, Megaphone, Settings, Users } from 'lucide-react'
import { useNotifications, useStore, useTeacher } from '../lib/store'
import { initials } from '../lib/format'
import { BellButton } from './Header'
import { SidebarLink } from './ParentLayout'
import { Logo, PageLoader, display } from './ui'

export const teacherTabs: { id: string; label: string; short: string; Icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', Icon: LayoutDashboard },
  { id: 'students', label: 'Students', short: 'Students', Icon: Users },
  { id: 'scores', label: 'Upload scores', short: 'Scores', Icon: BarChart2 },
  { id: 'attendance', label: 'Attendance', short: 'Attendance', Icon: Calendar },
  { id: 'assignments', label: 'Assignments', short: 'Tasks', Icon: ClipboardList },
  { id: 'announcements', label: 'Announcements', short: 'Announce', Icon: Megaphone },
  { id: 'settings', label: 'Settings', short: 'Settings', Icon: Settings },
]

export default function TeacherLayout() {
  const { teacher } = useTeacher()
  const { signOut } = useStore()
  const { unread } = useNotifications()
  const navigate = useNavigate()
  if (!teacher) return null
  const fullName = `${teacher.title ? `${teacher.title} ` : ''}${teacher.firstName} ${teacher.lastName}`

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r px-4 py-5 gap-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <Link to="/teacher/overview" className="px-2 flex items-center gap-2" aria-label="Teacher portal home">
          <Logo />
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)', ...display }}>Teacher</span>
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0" style={{ background: 'var(--accent)', color: '#fff', ...display }}>{initials(`${teacher.firstName} ${teacher.lastName}`)}</span>
          <span className="min-w-0">
            <span className="block text-sm font-bold truncate" style={{ ...display, color: 'var(--primary)' }}>{fullName}</span>
            <span className="block text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{teacher.classes.join(', ')}</span>
          </span>
        </div>
        <nav aria-label="Teacher" className="flex flex-col gap-1">
          {teacherTabs.map(({ id, label, Icon }) => <SidebarLink key={id} to={`/teacher/${id}`} label={label} Icon={Icon} />)}
          <SidebarLink to="/teacher/notifications" label="Notifications" Icon={Bell} badge={unread} />
        </nav>
        <button onClick={() => { signOut(); navigate('/') }} className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-[var(--warning-bg)]" style={{ ...display, color: 'var(--warning)' }}>
          <LogOut size={18} strokeWidth={1.8} /> Sign out
        </button>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden sticky top-0 z-30">
          <header className="border-b" style={{ background: 'var(--hero)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)', ...display }}>Teacher Portal</span>
                <p className="text-base font-black text-white truncate" style={display}>{fullName}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <BellButton to="/teacher/notifications" />
                <Link to="/teacher/settings" aria-label="Your settings" className="w-9 h-9 flex items-center justify-center rounded-full font-black text-sm" style={{ background: 'var(--accent)', color: '#fff', ...display }}>
                  {initials(`${teacher.firstName} ${teacher.lastName}`)}
                </Link>
              </div>
            </div>
          </header>
          <nav aria-label="Teacher" className="border-b overflow-x-auto relative" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex px-2 min-w-max">
              {teacherTabs.map(({ id, short, Icon }) => (
                <NavLink
                  key={id}
                  to={`/teacher/${id}`}
                  aria-label={short}
                  className="flex items-center gap-1.5 px-3 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all"
                  style={({ isActive }) => ({ ...display, color: isActive ? 'var(--accent)' : 'var(--muted-foreground)', borderBottomColor: isActive ? 'var(--accent)' : 'transparent' })}
                >
                  <Icon size={13} /> {short}
                </NavLink>
              ))}
            </div>
          </nav>
          {/* Fade at the right edge hints that the tabs scroll sideways. */}
          <div aria-hidden className="pointer-events-none absolute right-0 bottom-0 h-[45px] w-10" style={{ background: 'linear-gradient(to right, transparent, var(--card))' }} />
        </div>

        <main className="flex-1 pb-16">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-5 lg:pt-10">
            <Suspense fallback={<PageLoader />}><Outlet /></Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
