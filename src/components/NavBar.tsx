import { NavLink } from 'react-router'
import { LayoutDashboard, TrendingUp, Lightbulb, User, Settings } from 'lucide-react'
import type { Tab } from '../App'
import { display } from './ui'

export const parentTabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'journey', label: 'Journey', Icon: TrendingUp },
  { id: 'support', label: 'Support', Icon: Lightbulb },
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

/** Bottom tab bar — mobile and tablet only; desktop uses the sidebar. */
export default function NavBar() {
  return (
    <nav
      aria-label="Main"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t safe-bottom"
      style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: '0 -4px 24px var(--shadow)' }}
    >
      <div className="flex items-stretch max-w-2xl mx-auto">
        {parentTabs.map(({ id, label, Icon }) => (
          <NavLink
            key={id}
            to={`/app/${id}`}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-all"
          >
            {({ isActive }) => (
              <>
                <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} style={{ color: isActive ? 'var(--accent)' : 'var(--muted-foreground)' }} />
                <span style={{ ...display, color: isActive ? 'var(--accent)' : 'var(--muted-foreground)', fontWeight: isActive ? 700 : 600, fontSize: '10px' }}>
                  {label}
                </span>
                {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
