import { LayoutDashboard, TrendingUp, Lightbulb, User, Settings } from 'lucide-react'
import type { Tab } from '../App'

const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'journey', label: 'Journey', Icon: TrendingUp },
  { id: 'support', label: 'Support', Icon: Lightbulb },
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function NavBar({ activeTab, onTabChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: '0 -4px 24px rgba(13,43,85,0.07)',
      }}
    >
      <div className="flex items-stretch">
        {tabs.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all"
              style={{ color: active ? 'var(--accent)' : 'var(--muted-foreground)' }}
            >
              <Icon size={19} strokeWidth={active ? 2.5 : 1.8} />
              <span
                className="text-xs font-semibold"
                style={{
                  fontFamily: 'Quicksand, sans-serif',
                  color: active ? 'var(--accent)' : 'var(--muted-foreground)',
                  fontWeight: active ? 700 : 600,
                  fontSize: '10px',
                }}
              >
                {label}
              </span>
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
