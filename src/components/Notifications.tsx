import { Bell, CheckCircle2, AlertTriangle, BookOpen, Megaphone, X } from 'lucide-react'

interface Props {
  onClose: () => void
}

const notifications = [
  {
    id: 1,
    type: 'score',
    icon: BookOpen,
    iconColor: '#1ABF96',
    iconBg: '#E8F8F3',
    title: 'New score uploaded',
    body: 'Mrs. Okafor uploaded Amara\'s Mathematics score — 58/100 for Sep assessment.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 2,
    type: 'alert',
    icon: AlertTriangle,
    iconColor: '#E97B2E',
    iconBg: '#FFF4EC',
    title: 'Missing homework flagged',
    body: 'Amara has a missing Mathematics homework submission from Sep 13.',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 3,
    type: 'announcement',
    icon: Megaphone,
    iconColor: '#0D2B55',
    iconBg: '#E4F1F8',
    title: 'Class announcement',
    body: 'End of term parent-teacher meeting scheduled for Oct 4th at Greenfield Primary. Attendance required.',
    time: '2 days ago',
    unread: true,
  },
  {
    id: 4,
    type: 'progress',
    icon: CheckCircle2,
    iconColor: '#1ABF96',
    iconBg: '#E8F8F3',
    title: 'Weekly progress report ready',
    body: 'Amara\'s weekly summary for Sep 11–18 is available. Overall score steady at 74.',
    time: 'Sep 18',
    unread: false,
  },
  {
    id: 5,
    type: 'score',
    icon: BookOpen,
    iconColor: '#7B5EA7',
    iconBg: '#F3EEF8',
    title: 'Science score updated',
    body: 'Amara scored 79/100 on a Science lab report. Trending up from last term.',
    time: 'Sep 15',
    unread: false,
  },
  {
    id: 6,
    type: 'announcement',
    icon: Megaphone,
    iconColor: '#0D2B55',
    iconBg: '#E4F1F8',
    title: 'School holiday notice',
    body: 'School will be closed on Sep 26 for public holiday. Normal resumption on Sep 29.',
    time: 'Sep 13',
    unread: false,
  },
]

export default function Notifications({ onClose }: Props) {
  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center justify-between border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {unreadCount} unread
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="px-4 pt-4 pb-8 space-y-2 w-full">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={40} className="mx-auto mb-3" style={{ color: 'var(--border)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>No notifications yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>When teachers upload scores or post announcements, you'll see them here.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = n.icon
            return (
              <div
                key={n.id}
                className="w-full rounded-xl px-4 py-3.5 flex items-start gap-3 transition-all"
                style={{
                  background: n.unread ? 'var(--card)' : 'var(--background)',
                  border: n.unread ? '1px solid var(--border)' : '1px solid transparent',
                  boxShadow: n.unread ? '0 1px 4px rgba(13,43,85,0.06)' : 'none',
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: n.iconBg }}
                >
                  <Icon size={15} style={{ color: n.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold leading-snug" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>
                      {n.title}
                    </p>
                    {n.unread && (
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {n.body}
                  </p>
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: 'var(--muted-foreground)', opacity: 0.65 }}>
                    {n.time}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
