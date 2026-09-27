import { Suspense, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { Bell, HelpCircle, LogOut } from 'lucide-react'
import { useNotifications, useStore } from '../lib/store'
import Header, { ChildSwitcher, HelpModal } from './Header'
import NavBar, { parentTabs } from './NavBar'
import { Logo, PageLoader, display } from './ui'

export function SidebarLink({ to, label, Icon, badge }: { to: string; label: string; Icon: React.ElementType; badge?: number }) {
  return (
    <NavLink
      to={to}
      aria-label={badge ? `${label}, ${badge} unread` : label}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
      style={({ isActive }) => ({
        ...display,
        background: isActive ? 'var(--secondary)' : 'transparent',
        color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
      })}
    >
      {({ isActive }) => (
        <>
          <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} style={{ color: isActive ? 'var(--accent)' : undefined }} />
          <span className="flex-1">{label}</span>
          {!!badge && (
            <span className="min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-white text-xs" style={{ background: 'var(--accent)', fontWeight: 800 }}>
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function ParentLayout() {
  const { signOut } = useStore()
  const { unread } = useNotifications()
  const navigate = useNavigate()
  const [helpOpen, setHelpOpen] = useState(false)

  const handleSignOut = () => { signOut(); navigate('/') }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r px-4 py-5 gap-5"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <Link to="/app/dashboard" className="px-2" aria-label="LEIF home"><Logo /></Link>
        <ChildSwitcher variant="sidebar" />
        <nav aria-label="Main" className="flex flex-col gap-1">
          {parentTabs.map(({ id, label, Icon }) => (
            <SidebarLink key={id} to={`/app/${id}`} label={id === 'support' ? 'How Can I Help?' : label} Icon={Icon} />
          ))}
          <SidebarLink to="/app/notifications" label="Notifications" Icon={Bell} badge={unread} />
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <button onClick={() => setHelpOpen(true)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-[var(--secondary)]" style={{ ...display, color: 'var(--muted-foreground)' }}>
            <HelpCircle size={18} strokeWidth={1.8} /> Help
          </button>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-[var(--warning-bg)]" style={{ ...display, color: 'var(--warning)' }}>
            <LogOut size={18} strokeWidth={1.8} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 pb-28 lg:pb-12">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-5 lg:pt-10">
            <Suspense fallback={<PageLoader />}><Outlet /></Suspense>
          </div>
        </main>
        <NavBar />
      </div>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
