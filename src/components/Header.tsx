import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bell, Check, ChevronDown, HelpCircle, Plus } from 'lucide-react'
import { useNotifications, useParent, useStore } from '../lib/store'
import { Logo, Modal, display } from './ui'

const HELP = [
  ['How do I read the dashboard?', "The dashboard shows your child's current scores, strengths, and areas needing attention. Everything comes from the scores their teacher (or you) have entered."],
  ['What does "How Can I Help?" mean?', 'It gives you practical steps you can take at home to support your child. Tap "I\'ll try this" and LEIF will track whether the score changes afterwards.'],
  ['Who uploads the scores?', "Your child's teacher uploads scores and notes through the LEIF Teacher Portal. You can also add a result yourself from the dashboard."],
  ["Is my child's data private?", 'Yes. Only you, co-guardians you add, and teachers at your child\'s school can see it. Manage this under Profile → Privacy controls.'],
]

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Help & Support" description="Quick answers and guidance for using LEIF.">
      <div className="space-y-3">
        {HELP.map(([q, a]) => (
          <div key={q} className="rounded-xl p-3" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold mb-1" style={{ ...display, color: 'var(--primary)' }}>{q}</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{a}</p>
          </div>
        ))}
      </div>
    </Modal>
  )
}

/** Dropdown for parents with more than one child (or to add one). */
export function ChildSwitcher({ variant = 'header' }: { variant?: 'header' | 'sidebar' }) {
  const { children, child } = useParent()
  const { setActiveChild } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [open])

  if (!child) return null
  const isSidebar = variant === 'sidebar'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-label={`Viewing ${child.name}. Switch child`}
        aria-expanded={open}
        className={isSidebar
          ? 'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all'
          : 'flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full text-xs font-semibold transition-all'}
        style={isSidebar
          ? { background: 'var(--secondary)', border: '1px solid var(--border)' }
          : { background: 'rgba(255,255,255,0.12)', color: '#fff' }}
      >
        <span
          className={`${isSidebar ? 'w-9 h-9 text-sm rounded-xl' : 'w-6 h-6 text-xs rounded-full'} flex items-center justify-center font-bold shrink-0`}
          style={{ background: 'var(--accent)', color: '#fff', ...display }}
        >
          {child.name[0]}
        </span>
        {isSidebar ? (
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-bold truncate" style={{ ...display, color: 'var(--primary)' }}>{child.name.split(' ')[0]}</span>
            <span className="block text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{child.class}</span>
          </span>
        ) : (
          <span className="font-semibold max-w-[90px] truncate" style={display}>{child.name.split(' ')[0]}</span>
        )}
        <ChevronDown size={isSidebar ? 15 : 12} style={isSidebar ? { color: 'var(--muted-foreground)' } : undefined} />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-40 mt-2 w-60 rounded-xl p-1.5 shadow-xl anim-toast ${isSidebar ? 'left-0 right-0 w-auto' : 'right-0'}`}
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p className="px-3 pt-1.5 pb-1 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', ...display }}>Your children</p>
          {children.map(c => (
            <button
              key={c.id}
              role="menuitemradio"
              aria-checked={c.id === child.id}
              onClick={() => { setActiveChild(c.id); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors hover:bg-[var(--secondary)]"
            >
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: c.id === child.id ? 'var(--accent)' : 'var(--secondary)', color: c.id === child.id ? '#fff' : 'var(--primary)', ...display }}>
                {c.name[0]}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{c.name}</span>
                <span className="block text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.class}</span>
              </span>
              {c.id === child.id && <Check size={14} style={{ color: 'var(--accent)' }} />}
            </button>
          ))}
          <div className="h-px my-1" style={{ background: 'var(--border)' }} />
          <button
            role="menuitem"
            onClick={() => { setOpen(false); navigate('/app/children/new') }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm font-bold transition-colors hover:bg-[var(--secondary)]"
            style={{ color: 'var(--accent)', ...display }}
          >
            <Plus size={15} /> Add a child
          </button>
        </div>
      )}
    </div>
  )
}

export function BellButton({ to, light = true }: { to: string; light?: boolean }) {
  const { unread } = useNotifications()
  return (
    <Link
      to={to}
      aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      className="relative w-9 h-9 flex items-center justify-center rounded-full shrink-0"
      style={light ? { background: 'rgba(255,255,255,0.10)', color: '#fff' } : { background: 'var(--secondary)', color: 'var(--primary)' }}
    >
      <Bell size={16} />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--accent)', fontSize: '9px', fontWeight: 800 }}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}

/** Top bar for the parent app on mobile/tablet. */
export default function Header() {
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <>
      <header
        className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-2 px-4 py-3 border-b"
        style={{ background: 'var(--hero)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <Link to="/app/dashboard" aria-label="LEIF home"><Logo light /></Link>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setHelpOpen(true)}
            aria-label="Help"
            className="flex items-center gap-1 px-2.5 h-9 rounded-full text-xs font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}
          >
            <HelpCircle size={15} />
            <span className="hidden sm:inline">Help</span>
          </button>
          <ChildSwitcher />
          <BellButton to="/app/notifications" />
        </div>
      </header>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
