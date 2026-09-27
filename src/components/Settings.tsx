import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Moon, Sun, Shield, FileText, Info, LogOut, ChevronRight, RotateCcw } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useParent, useStore } from '../lib/store'
import type { NotificationPrefs } from '../lib/types'
import { Button, Modal, PageHeader, Toggle, display, useToast } from './ui'

const PREFS: { key: keyof NotificationPrefs; label: string; hint: string }[] = [
  { key: 'scores', label: 'Score updates from teacher', hint: 'New results and marked work' },
  { key: 'announcements', label: 'Class announcements', hint: 'Exams, meetings and events' },
  { key: 'weekly', label: 'Weekly progress summary', hint: 'A short recap of the week (coming soon)' },
  { key: 'attendance', label: 'Attendance alerts', hint: 'When your child is absent or late' },
]

export const LEGAL_LINKS = [
  { to: '/legal/privacy', label: 'Privacy Policy', Icon: Shield },
  { to: '/legal/terms', label: 'Terms and Conditions', Icon: FileText },
  { to: '/legal/use', label: 'Terms of Use', Icon: FileText },
]

export function ThemePicker() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Theme">
      <ThemeCard label="Default" icon={<Sun size={18} />} active={theme === 'light'} onSelect={() => setTheme('light')} preview={{ bg: '#FFFFFF', card: '#F4F9FC', accent: '#1ABF96', text: '#0D2B55' }} />
      <ThemeCard label="Dark" icon={<Moon size={18} />} active={theme === 'dark'} onSelect={() => setTheme('dark')} preview={{ bg: '#0F1923', card: '#162130', accent: '#1ABF96', text: '#E8F1F8' }} />
    </div>
  )
}

export function SettingsSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--muted-foreground)', ...display }}>{label}</p>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>{children}</div>
    </section>
  )
}

export function LinkRow({ to, icon, label, last }: { to: string; icon: React.ReactNode; label: string; last?: boolean }) {
  return (
    <Link to={to} className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--secondary)]" style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <span style={{ color: 'var(--muted-foreground)' }}>{icon}</span>
      <span className="flex-1 text-sm" style={{ color: 'var(--foreground)' }}>{label}</span>
      <ChevronRight size={14} style={{ color: 'var(--muted-foreground)' }} />
    </Link>
  )
}

export function ResetDemoButton() {
  const { resetDemo } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--secondary)]">
        <RotateCcw size={15} style={{ color: 'var(--muted-foreground)' }} />
        <span className="flex-1">
          <span className="block text-sm" style={{ color: 'var(--foreground)' }}>Reset demo data</span>
          <span className="block text-xs" style={{ color: 'var(--muted-foreground)' }}>Restore the original sample accounts on this device</span>
        </span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Reset demo data?" description="This erases every account, score and note saved on this device and restores the original sample data. You'll be signed out.">
        <div className="flex gap-2">
          <Button variant="danger" block loading={busy} onClick={async () => { setBusy(true); await resetDemo(); navigate('/') }}>Reset everything</Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </>
  )
}

export default function Settings() {
  const { parent } = useParent()
  const { updatePrefs, signOut } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  if (!parent) return null

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your app preferences." />

      <SettingsSection label="Appearance">
        <div className="px-4 py-4">
          <p className="text-sm font-bold mb-3" style={{ ...display, color: 'var(--foreground)' }}>Theme</p>
          <ThemePicker />
        </div>
      </SettingsSection>

      <SettingsSection label="Notifications">
        {PREFS.map((p, i) => (
          <div key={p.key} className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: i < PREFS.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div className="flex-1">
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{p.label}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.hint}</p>
            </div>
            <Toggle label={p.label} checked={parent.prefs[p.key]} onChange={v => { updatePrefs({ [p.key]: v }); toast(`${p.label} ${v ? 'on' : 'off'}`, 'info') }} />
          </div>
        ))}
      </SettingsSection>

      <SettingsSection label="Legal & Privacy">
        {LEGAL_LINKS.map(({ to, label, Icon }, i) => <LinkRow key={to} to={to} icon={<Icon size={15} />} label={label} last={i === LEGAL_LINKS.length - 1} />)}
      </SettingsSection>

      <SettingsSection label="About">
        <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <Info size={15} style={{ color: 'var(--muted-foreground)' }} />
          <span className="text-sm flex-1" style={{ color: 'var(--foreground)' }}>Version</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>1.0.0 Beta</span>
        </div>
        <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <Info size={15} style={{ color: 'var(--muted-foreground)' }} />
          <span className="text-sm flex-1" style={{ color: 'var(--foreground)' }}>Build</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>Hajime Cohort · Sep 2026</span>
        </div>
        <ResetDemoButton />
      </SettingsSection>

      <Button variant="danger" block size="lg" className="!justify-start" onClick={() => { signOut(); navigate('/') }}>
        <LogOut size={16} /> Sign out
      </Button>

      <p className="text-center text-xs pb-2" style={{ color: 'var(--muted-foreground)' }}>© {new Date().getFullYear()} LEIF. All rights reserved.</p>
    </div>
  )
}

function ThemeCard({ label, icon, active, onSelect, preview }: {
  label: string; icon: React.ReactNode; active: boolean; onSelect: () => void
  preview: { bg: string; card: string; accent: string; text: string }
}) {
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className="rounded-xl p-3 flex flex-col gap-2.5 text-left transition-all"
      style={{ border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`, background: active ? 'rgba(26,191,150,0.06)' : 'var(--background)' }}
    >
      <div className="w-full h-12 rounded-lg overflow-hidden flex gap-1 p-1.5" style={{ background: preview.bg, border: '1px solid var(--border)' }}>
        <div className="w-3 rounded" style={{ background: preview.text, opacity: 0.7 }} />
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2 rounded" style={{ background: preview.card }} />
          <div className="h-1.5 w-3/4 rounded" style={{ background: preview.accent, opacity: 0.7 }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span style={{ color: active ? 'var(--accent)' : 'var(--muted-foreground)' }}>{icon}</span>
        <span className="text-xs font-bold" style={{ ...display, color: active ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{label}</span>
        {active && (
          <span className="ml-auto w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden><path d="M1.5 4L3 5.5L6.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        )}
      </div>
    </button>
  )
}
