import { useState } from 'react'
import { useNavigate } from 'react-router'
import { BookOpen, ChevronRight, Download, Edit3, Eye, EyeOff, Globe, KeyRound, Lock, LogOut, Mail, Phone, Plus, School, Shield, User, UserPlus, X } from 'lucide-react'
import { useParent, useStore } from '../lib/store'
import { DEMO_CHILD_IDS } from '../lib/seed'
import { ALL_CLASSES, CLASS_GROUPS } from '../data/grades'
import { Button, Callout, Card, Modal, PageHeader, SectionTitle, SelectField, TextField, Toggle, display, downloadJSON, useToast } from './ui'

export default function Profile() {
  const { parent, child, actions, canEdit } = useParent()
  const { updatePrivacy, signOut, mode } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [editChild, setEditChild] = useState(false)
  const [editParent, setEditParent] = useState(false)
  const [editPin, setEditPin] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [guardianEmail, setGuardianEmail] = useState('')
  const [guardianError, setGuardianError] = useState('')

  if (!parent || !child) return null
  const firstName = child.name.split(' ')[0]
  const { privacy } = child

  const addGuardian = (e: React.FormEvent) => {
    e.preventDefault()
    const email = guardianEmail.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setGuardianError('Enter a valid email address.')
    if (email === parent.email.toLowerCase() || privacy.guardians.includes(email)) return setGuardianError('That person already has access.')
    updatePrivacy(child.id, { guardians: [...privacy.guardians, email] })
    setGuardianEmail('')
    setGuardianError('')
    toast(`${email} can now view ${firstName}'s progress`)
  }

  const exportData = () => {
    const { learnerPin: _pin, ...record } = child
    downloadJSON(`leif-${firstName.toLowerCase()}-data.json`, {
      exportedAt: new Date().toISOString(),
      parent: { name: `${parent.firstName} ${parent.lastName}`, email: parent.email },
      child: record,
      supportActions: actions,
    })
    toast('Your data export has downloaded')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle={canEdit ? `Manage ${firstName}'s academic profile and privacy settings.` : `${firstName}'s profile, shared with you by ${child.parentName || 'their parent'}.`} />

      {!canEdit && (
        <Callout t="info" icon={<Shield size={15} />} title="You're a co-guardian">
          {child.parentName || 'The main parent'} shared {firstName}'s progress with you. You can view everything; only they can change {firstName}'s details or privacy settings, or remove your access.
        </Callout>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          {/* Child profile card */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--hero)' }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0" style={{ background: 'var(--accent)', color: '#fff', ...display }}>
                {child.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-black truncate" style={{ ...display, color: '#fff' }}>{child.name}</p>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{[child.age && `Age ${child.age}`, child.class].filter(Boolean).join(' · ')}</p>
                <p className="text-xs mt-1 truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{child.school || 'School not set'}</p>
              </div>
              {canEdit && (
                <button onClick={() => setEditChild(true)} aria-label={`Edit ${firstName}'s profile`} className="w-10 h-10 flex items-center justify-center rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
                  <Edit3 size={15} />
                </button>
              )}
            </div>
          </div>

          <section>
            <SectionTitle icon={<BookOpen size={15} />}>Academic context</SectionTitle>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <InfoRow icon={<School size={15} />} label="School" value={child.school || '—'} />
              <InfoRow icon={<BookOpen size={15} />} label="Class" value={child.class} />
              <InfoRow icon={<BookOpen size={15} />} label="Subjects tracked" value={`${child.scores.length} subject${child.scores.length === 1 ? '' : 's'}`} />
              <InfoRow icon={<User size={15} />} label="Data source" value={child.sampleData ? (canEdit ? 'Entered by you' : 'Entered by parent') : 'Class teacher'} last />
            </div>
          </section>

          {/* Learner access */}
          {canEdit && <section>
            <SectionTitle icon={<KeyRound size={15} />}>Learner access</SectionTitle>
            <Card className="p-4 space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {firstName} can sign in at <strong style={{ color: 'var(--foreground)' }}>Learner sign in</strong> to see their tasks and progress. Keep the PIN private.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: 'var(--secondary)' }}>
                  <p className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>Learner code</p>
                  <p className="text-sm font-black font-mono mt-0.5" style={{ color: 'var(--primary)' }}>{child.id}</p>
                </div>
                <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--secondary)' }}>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>PIN</p>
                    <p className="text-sm font-black font-mono mt-0.5" style={{ color: 'var(--primary)' }}>{showPin ? child.learnerPin : '••••'}</p>
                  </div>
                  <button onClick={() => setShowPin(v => !v)} aria-label={showPin ? 'Hide PIN' : 'Show PIN'} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: 'var(--muted-foreground)' }}>
                    {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setEditPin(true)}>Change PIN</Button>
            </Card>
          </section>}
        </div>

        <div className="space-y-6">
          {/* Privacy controls */}
          {canEdit && <section>
            <SectionTitle icon={<Shield size={15} />} color="var(--accent)">Privacy controls</SectionTitle>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--primary)', ...display }}>Who can see {firstName}'s data</p>
                <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
                  {privacy.visibility === 'private'
                    ? `Only you can view ${firstName}'s progress on LEIF.`
                    : `You and the co-guardians listed below can view ${firstName}'s progress.`}
                </p>
                <div className="flex gap-2" role="radiogroup" aria-label="Data visibility">
                  {(['family', 'private'] as const).map(mode => (
                    <button
                      key={mode}
                      role="radio"
                      aria-checked={privacy.visibility === mode}
                      onClick={() => { updatePrivacy(child.id, { visibility: mode }); toast(mode === 'private' ? 'Only you can see this data now' : 'Co-guardians can see this data') }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{ ...display, background: privacy.visibility === mode ? 'var(--primary)' : 'var(--secondary)', color: privacy.visibility === mode ? '#fff' : 'var(--muted-foreground)' }}
                    >
                      {mode === 'family' ? <Globe size={12} /> : <Lock size={12} />}
                      {mode === 'family' ? 'Family' : 'Only me'}
                    </button>
                  ))}
                </div>

                {privacy.visibility === 'family' && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>Co-guardians</p>
                    {privacy.guardians.length === 0 && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No one else has access yet.</p>}
                    {privacy.guardians.map(g => (
                      <div key={g} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--secondary)' }}>
                        <Mail size={13} style={{ color: 'var(--muted-foreground)' }} />
                        <span className="flex-1 text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{g}</span>
                        <button onClick={() => updatePrivacy(child.id, { guardians: privacy.guardians.filter(x => x !== g) })} aria-label={`Remove ${g}`} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: 'var(--muted-foreground)' }}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                    <form onSubmit={addGuardian} className="flex gap-2 pt-1">
                      <input
                        type="email"
                        value={guardianEmail}
                        onChange={e => { setGuardianEmail(e.target.value); setGuardianError('') }}
                        placeholder="guardian@example.com"
                        aria-label="Co-guardian email"
                        aria-invalid={guardianError ? true : undefined}
                        className="field flex-1 !py-2"
                      />
                      <Button type="submit" size="sm" variant="secondary" aria-label="Add co-guardian"><UserPlus size={14} /></Button>
                    </form>
                    {guardianError && <p role="alert" className="text-xs font-semibold" style={{ color: 'var(--warning)' }}>{guardianError}</p>}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Share my support activity with the teacher</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Lets {firstName}'s teacher see which home actions you're trying.</p>
                </div>
                <Toggle label="Share support activity with teacher" checked={privacy.shareActivityWithTeacher} onChange={v => updatePrivacy(child.id, { shareActivityWithTeacher: v })} />
              </div>

              <button onClick={exportData} className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--secondary)]">
                <Download size={15} style={{ color: 'var(--muted-foreground)' }} />
                <span className="flex-1">
                  <span className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Export {firstName}'s data</span>
                  <span className="block text-xs" style={{ color: 'var(--muted-foreground)' }}>Download everything LEIF holds as a file</span>
                </span>
                <ChevronRight size={14} style={{ color: 'var(--muted-foreground)' }} />
              </button>
            </div>
          </section>}

          {/* Parent account */}
          <section>
            <SectionTitle icon={<User size={15} />}>Parent account</SectionTitle>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <button onClick={() => setEditParent(true)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--secondary)]" style={{ borderBottom: '1px solid var(--border)' }}>
                <User size={15} style={{ color: 'var(--muted-foreground)' }} />
                <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{parent.firstName} {parent.lastName}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>Edit</span>
              </button>
              <InfoRow icon={<Mail size={15} />} label="Email" value={parent.email} />
              <InfoRow icon={<Phone size={15} />} label="Phone" value={parent.phone || 'Not added'} />
              <button onClick={() => navigate('/app/children/new')} className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--secondary)]" style={{ borderBottom: '1px solid var(--border)' }}>
                <Plus size={15} style={{ color: 'var(--accent)' }} />
                <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--accent)' }}>Add another child</span>
              </button>
              <button onClick={() => { signOut(); navigate('/') }} className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--warning-bg)]">
                <LogOut size={15} style={{ color: 'var(--warning)' }} />
                <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--warning)' }}>Sign out</span>
              </button>
            </div>
          </section>

          {DEMO_CHILD_IDS.includes(child.id) && <Callout t="caution" title="Prototype data">
            {mode === 'supabase'
              ? 'Your data is stored securely in LEIF’s cloud database and protected by access rules. Demo children like Amara use representative sample data, not real school records.'
              : 'This MVP stores data on this device only. Seeded children like Amara use representative sample data, not real school records.'}
          </Callout>}
        </div>
      </div>

      <EditChildModal open={editChild} onClose={() => setEditChild(false)} />
      <EditParentModal open={editParent} onClose={() => setEditParent(false)} />
      <EditPinModal open={editPin} onClose={() => setEditPin(false)} />
    </div>
  )
}

function InfoRow({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <span style={{ color: 'var(--muted-foreground)' }}>{icon}</span>
      <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{label}</span>
      <span className="text-xs font-semibold text-right truncate max-w-[55%]" style={{ color: 'var(--muted-foreground)' }}>{value}</span>
    </div>
  )
}

function EditChildModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { child } = useParent()
  const { updateChild } = useStore()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', age: '', class: '', school: '' })
  const [error, setError] = useState('')
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  if (open && child && loadedFor !== child.id) {
    setForm({ name: child.name, age: child.age ? String(child.age) : '', class: child.class, school: child.school })
    setLoadedFor(child.id)
  }
  if (!child) return null

  const close = () => { setLoadedFor(null); setError(''); onClose() }
  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setError("Enter your child's name.")
    const age = form.age ? Number(form.age) : undefined
    if (age !== undefined && (age < 2 || age > 19)) return setError('Enter an age between 2 and 19.')
    updateChild(child.id, { name: form.name, age, class: form.class, school: form.school })
    toast('Profile updated')
    close()
  }

  return (
    <Modal open={open} onClose={close} title="Edit child profile">
      <form onSubmit={save} className="space-y-4">
        <TextField label="Full name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} error={error.includes('name') ? error : undefined} />
        <TextField label="Age" type="number" inputMode="numeric" value={form.age} onChange={v => setForm(f => ({ ...f, age: v }))} error={error.includes('age') ? error : undefined} />
        <SelectField label="Class" value={form.class} onChange={v => setForm(f => ({ ...f, class: v }))}>
          {CLASS_GROUPS.map(g => (
            <optgroup key={g.group} label={g.group}>{g.classes.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
          ))}
          {!ALL_CLASSES.includes(form.class) && form.class && <option value={form.class}>{form.class}</option>}
        </SelectField>
        <TextField label="School" value={form.school} onChange={v => setForm(f => ({ ...f, school: v }))} hint="Teachers at this school can upload results for your child." />
        <Button type="submit" block size="lg" variant="accent">Save changes</Button>
      </form>
    </Modal>
  )
}

function EditParentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { parent } = useParent()
  const { updateParent } = useStore()
  const toast = useToast()
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' })
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  if (open && parent && !loaded) {
    setForm({ firstName: parent.firstName, lastName: parent.lastName, phone: parent.phone })
    setLoaded(true)
  }
  const close = () => { setLoaded(false); setError(''); onClose() }
  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim()) return setError('Enter your first name.')
    updateParent({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.trim() })
    toast('Account updated')
    close()
  }

  return (
    <Modal open={open} onClose={close} title="Edit your details">
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="First name" value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} error={error || undefined} autoComplete="given-name" />
          <TextField label="Last name" value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} autoComplete="family-name" />
        </div>
        <TextField label="Phone (optional)" type="tel" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+234 …" autoComplete="tel" />
        <Button type="submit" block size="lg" variant="accent">Save changes</Button>
      </form>
    </Modal>
  )
}

function EditPinModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { child } = useParent()
  const { updateChild } = useStore()
  const toast = useToast()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  if (!child) return null
  const close = () => { setPin(''); setError(''); onClose() }
  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{4}$/.test(pin)) return setError('The PIN must be exactly 4 digits.')
    updateChild(child.id, { learnerPin: pin })
    toast('Learner PIN updated')
    close()
  }
  return (
    <Modal open={open} onClose={close} title="Change learner PIN" description={`${child.name.split(' ')[0]} uses this with their learner code to sign in.`}>
      <form onSubmit={save} className="space-y-4">
        <TextField label="New 4-digit PIN" inputMode="numeric" maxLength={4} value={pin} onChange={v => { setPin(v.replace(/\D/g, '')); setError('') }} error={error || undefined} className="font-mono tracking-[0.4em]" />
        <Button type="submit" block size="lg" variant="accent">Save PIN</Button>
      </form>
    </Modal>
  )
}
