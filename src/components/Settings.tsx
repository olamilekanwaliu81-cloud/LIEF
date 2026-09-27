import { useState } from 'react'
import { Moon, Sun, Shield, FileText, Info, LogOut, ChevronRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface Props {
  onSignOut: () => void
}

export default function Settings({ onSignOut }: Props) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="px-4 pt-5 pb-6 space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Manage your app preferences.</p>
      </div>

      {/* Theme */}
      <section>
        <SectionLabel>Appearance</SectionLabel>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
          <div className="px-4 py-4">
            <p className="text-sm font-bold mb-3" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--foreground)' }}>
              Theme
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ThemeCard
                id="light"
                label="Default"
                icon={<Sun size={18} />}
                active={theme === 'light'}
                onSelect={() => setTheme('light')}
                preview={{ bg: '#FFFFFF', card: '#F4F9FC', accent: '#1ABF96', text: '#0D2B55' }}
              />
              <ThemeCard
                id="dark"
                label="Dark"
                icon={<Moon size={18} />}
                active={theme === 'dark'}
                onSelect={() => setTheme('dark')}
                preview={{ bg: '#0F1923', card: '#162130', accent: '#1ABF96', text: '#E8F1F8' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section>
        <SectionLabel>Notifications</SectionLabel>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
          <ToggleRow label="Score updates from teacher" defaultOn />
          <ToggleRow label="Class announcements" defaultOn />
          <ToggleRow label="Weekly progress summary" defaultOn />
          <ToggleRow label="Attendance alerts" defaultOn last />
        </div>
      </section>

      {/* Legal */}
      <section>
        <SectionLabel>Legal & Privacy</SectionLabel>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
          <LinkRow icon={<Shield size={15} />} label="Privacy Policy" />
          <LinkRow icon={<FileText size={15} />} label="Terms and Conditions" />
          <LinkRow icon={<FileText size={15} />} label="Terms of Use" last />
        </div>
      </section>

      {/* About */}
      <section>
        <SectionLabel>About</SectionLabel>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
          <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <Info size={15} style={{ color: 'var(--muted-foreground)' }} />
            <span className="text-sm flex-1" style={{ color: 'var(--foreground)' }}>Version</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>1.0.0 Beta</span>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <Info size={15} style={{ color: 'var(--muted-foreground)' }} />
            <span className="text-sm flex-1" style={{ color: 'var(--foreground)' }}>Build</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>Hajime Cohort · Sep 2026</span>
          </div>
        </div>
      </section>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
        style={{
          fontFamily: 'Quicksand, sans-serif',
          background: '#FFF0EA',
          color: '#C0521A',
          border: '1px solid #F5C5A0',
        }}
      >
        <LogOut size={16} />
        Sign out
      </button>

      <p className="text-center text-xs pb-2" style={{ color: 'var(--muted-foreground)' }}>
        © {new Date().getFullYear()} LEIF. All rights reserved.
      </p>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>
      {children}
    </p>
  )
}

function ThemeCard({ label, icon, active, onSelect, preview }: {
  id: string; label: string; icon: React.ReactNode
  active: boolean; onSelect: () => void
  preview: { bg: string; card: string; accent: string; text: string }
}) {
  return (
    <button
      onClick={onSelect}
      className="rounded-xl p-3 flex flex-col gap-2.5 text-left transition-all"
      style={{
        border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        background: active ? 'rgba(26,191,150,0.06)' : 'var(--background)',
      }}
    >
      {/* Mini preview */}
      <div className="w-full h-12 rounded-lg overflow-hidden flex gap-1 p-1.5" style={{ background: preview.bg }}>
        <div className="w-3 rounded" style={{ background: preview.text, opacity: 0.7 }} />
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2 rounded" style={{ background: preview.card }} />
          <div className="h-1.5 w-3/4 rounded" style={{ background: preview.accent, opacity: 0.7 }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span style={{ color: active ? 'var(--accent)' : 'var(--muted-foreground)' }}>{icon}</span>
        <span className="text-xs font-bold" style={{ fontFamily: 'Quicksand, sans-serif', color: active ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
          {label}
        </span>
        {active && (
          <span className="ml-auto w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4L3 5.5L6.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
    </button>
  )
}

function ToggleRow({ label, defaultOn, last }: { label: string; defaultOn?: boolean; last?: boolean }) {
  const [on, setOn] = useState(defaultOn ?? false)
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}
    >
      <span className="flex-1 text-sm" style={{ color: 'var(--foreground)' }}>{label}</span>
      <button
        onClick={() => setOn((v: boolean) => !v)}
        className="w-10 h-6 rounded-full transition-all flex items-center px-0.5"
        style={{ background: on ? 'var(--accent)' : 'var(--border)' }}
      >
        <span
          className="w-5 h-5 rounded-full bg-white shadow transition-all"
          style={{ transform: on ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )
}

function LinkRow({ icon, label, last }: { icon: React.ReactNode; label: string; last?: boolean }) {
  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:opacity-80"
      style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}
    >
      <span style={{ color: 'var(--muted-foreground)' }}>{icon}</span>
      <span className="flex-1 text-sm" style={{ color: 'var(--foreground)' }}>{label}</span>
      <ChevronRight size={14} style={{ color: 'var(--border)' }} />
    </button>
  )
}
