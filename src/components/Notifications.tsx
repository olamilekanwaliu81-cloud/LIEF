import { useNavigate } from 'react-router'
import { Bell, BookOpen, CheckCheck, CheckCircle2, AlertTriangle, Info, Megaphone, PencilLine } from 'lucide-react'
import { useNotifications, useStore } from '../lib/store'
import { timeAgo } from '../lib/format'
import type { NotificationKind } from '../lib/types'
import { Button, EmptyState, PageHeader, display, tone, type Tone } from './ui'

const KIND: Record<NotificationKind, { Icon: React.ElementType; t: Tone }> = {
  score:        { Icon: BookOpen,      t: 'success' },
  alert:        { Icon: AlertTriangle, t: 'warning' },
  announcement: { Icon: Megaphone,     t: 'info' },
  progress:     { Icon: CheckCircle2,  t: 'success' },
  info:         { Icon: Info,          t: 'purple' },
  learner:      { Icon: PencilLine,    t: 'info' },
}

export default function Notifications() {
  const { items, unread } = useNotifications()
  const { markRead, markAllRead } = useStore()
  const navigate = useNavigate()

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'You’re all caught up'}
        action={unread > 0 ? <Button variant="secondary" size="sm" onClick={markAllRead}><CheckCheck size={14} /> Mark all read</Button> : undefined}
      />

      {items.length === 0 ? (
        <EmptyState icon={<Bell size={40} />} title="No notifications yet" body="When teachers upload scores or post announcements, you'll see them here." />
      ) : (
        <ul className="space-y-2">
          {items.map(n => {
            const { Icon, t } = KIND[n.kind]
            const c = tone(t)
            return (
              <li key={n.id}>
                <button
                  onClick={() => { markRead(n.id); if (n.link) navigate(n.link) }}
                  className="w-full text-left rounded-xl px-4 py-3.5 flex items-start gap-3 transition-all hover:opacity-90"
                  style={{
                    background: n.read ? 'transparent' : 'var(--card)',
                    border: n.read ? '1px solid transparent' : '1px solid var(--border)',
                    boxShadow: n.read ? 'none' : '0 1px 4px var(--shadow)',
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: c.bg }}>
                    <Icon size={15} style={{ color: c.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold leading-snug" style={{ ...display, color: 'var(--foreground)' }}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} aria-label="unread" />}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{n.body}</p>
                    <p className="text-xs mt-1.5 font-semibold" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>{timeAgo(n.date)}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
