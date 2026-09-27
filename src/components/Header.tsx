import { Bell, ChevronDown, HelpCircle, X } from 'lucide-react'
import { useState } from 'react'

interface Props { onSignOut: () => void; onBellClick?: () => void; notifCount?: number }

export default function Header({ onSignOut: _onSignOut, onBellClick, notifCount = 0 }: Props) {
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: 'var(--primary)', borderColor: 'rgba(255,255,255,0.08)', gap: '8px' }}
      >
        {/* Logo */}
        <span
          className="text-2xl font-black shrink-0"
          style={{ fontFamily: 'Quicksand, sans-serif', color: '#fff', letterSpacing: '-0.04em' }}
        >
          LEIF
        </span>

        {/* Right cluster */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Help */}
          <button
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}
          >
            <HelpCircle size={14} />
            <span className="hidden sm:inline">Help</span>
          </button>

          {/* Child selector */}
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'Quicksand, sans-serif' }}
            >
              A
            </div>
            <span className="font-semibold" style={{ fontFamily: 'Quicksand, sans-serif' }}>Amara</span>
            <ChevronDown size={12} />
          </button>

          {/* Bell */}
          <button
            onClick={onBellClick}
            className="relative w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.10)', color: '#fff' }}
          >
            <Bell size={16} />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white border border-[var(--primary)]" style={{ background: 'var(--accent)', fontSize: '9px', fontWeight: 800 }}>
                {notifCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Help modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(13,43,85,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 relative" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <button onClick={() => setHelpOpen(false)} className="absolute top-4 right-4" style={{ color: 'var(--muted-foreground)' }}>
              <X size={18} />
            </button>
            <h2 className="text-lg font-black mb-1" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>Help & Support</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Quick answers and guidance for using LEIF.</p>
            <div className="space-y-3">
              {[
                ['How do I read the dashboard?', 'The dashboard shows your child\'s current academic scores, strengths, and areas needing attention.'],
                ['What does "How Can I Help?" mean?', 'It gives you practical steps you can take at home to support your child in their weaker subjects.'],
                ['Who uploads the scores?', "Your child's teacher uploads scores and notes through the LEIF Teacher Portal."],
                ['Is my child\'s data private?', 'Yes. Only you and teachers you allow can see your child\'s academic data.'],
              ].map(([q, a]) => (
                <div key={q} className="rounded-xl p-3" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--primary)', fontFamily: 'Quicksand, sans-serif' }}>{q}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
