import { useState } from 'react'
import { Shield, ChevronRight, Edit3, Lock, Globe, BookOpen, User } from 'lucide-react'
import { child, subjects } from '../data/child'

interface Props {
  onSignOut: () => void
}

export default function Profile({ onSignOut }: Props) {
  const [privacyMode, setPrivacyMode] = useState<'family' | 'private'>('family')

  return (
    <div className="px-4 pt-5 pb-4 space-y-5 w-full">
      <div>
        <h1 className="text-2xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
          Profile
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Manage Amara's academic profile and privacy settings.
        </p>
      </div>

      {/* Child profile card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--primary)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
            style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'Quicksand, sans-serif' }}
          >
            {child.avatar}
          </div>
          <div className="flex-1">
            <p className="text-xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: '#fff' }}>
              {child.name}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Age {child.age} · {child.grade}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {child.school}
            </p>
          </div>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}
          >
            <Edit3 size={15} />
          </button>
        </div>
      </div>

      {/* Privacy controls */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={15} style={{ color: 'var(--accent)' }} />
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--accent)', fontFamily: 'Quicksand, sans-serif' }}>
            Privacy Controls
          </h2>
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--primary)', fontFamily: 'Quicksand, sans-serif' }}>
              Academic data visibility
            </p>
            <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
              Control who can see Amara's academic information.
            </p>
            <div className="flex gap-2">
              {(['family', 'private'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPrivacyMode(mode)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    fontFamily: 'Quicksand, sans-serif',
                    background: privacyMode === mode ? 'var(--primary)' : 'var(--secondary)',
                    color: privacyMode === mode ? '#fff' : 'var(--muted-foreground)',
                  }}
                >
                  {mode === 'family' ? <Globe size={12} /> : <Lock size={12} />}
                  {mode === 'family' ? 'Family only' : 'Private'}
                </button>
              ))}
            </div>
          </div>
          <SettingRow icon={<User size={15} />} label="Parent/guardian access" value="Fatima A." />
          <SettingRow icon={<BookOpen size={15} />} label="Teacher data sharing" value="Off" />
          <SettingRow icon={<Shield size={15} />} label="Data export" value="Available" last />
        </div>
      </section>

      {/* Academic info */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>
          Academic Context
        </h2>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <SettingRow icon={<BookOpen size={15} />} label="School" value={child.school} />
          <SettingRow icon={<BookOpen size={15} />} label="Grade" value={child.grade} />
          <SettingRow icon={<BookOpen size={15} />} label="Subjects tracked" value={`${subjects.length} subjects`} last />
        </div>
      </section>

      {/* Sample data notice */}
      <div
        className="rounded-xl px-4 py-3 flex gap-3"
        style={{ background: '#FFF8E7', border: '1px solid #F5DC8A' }}
      >
        <span className="text-base">⚠️</span>
        <p className="text-xs leading-relaxed" style={{ color: '#7A5A00' }}>
          <strong>Prototype data:</strong> Amara's academic data in this demo is representative sample data, not real school records. In production, data would be entered by parents or connected from school systems.
        </p>
      </div>

      {/* Parent account */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>
          Parent Account
        </h2>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <SettingRow icon={<User size={15} />} label="Account" value="Fatima Adeyemi" />
          <SettingRow icon={<Globe size={15} />} label="Language" value="English" />
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-red-50"
          >
            <span style={{ color: '#C0521A' }}><Lock size={15} /></span>
            <span className="flex-1 text-sm font-semibold" style={{ color: '#C0521A' }}>Sign out</span>
          </button>
        </div>
      </section>

      <p className="text-center text-xs pb-2" style={{ color: 'var(--muted-foreground)' }}>
        LEIF MVP · V1 — Research-aligned · {child.lastUpdated}
      </p>
    </div>
  )
}

function SettingRow({ icon, label, value, last }: {
  icon: React.ReactNode
  label: string
  value: string
  last?: boolean
}) {
  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
      style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}
    >
      <span style={{ color: 'var(--muted-foreground)' }}>{icon}</span>
      <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{label}</span>
      {value && (
        <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{value}</span>
      )}
      <ChevronRight size={14} style={{ color: 'var(--border)' }} />
    </button>
  )
}
