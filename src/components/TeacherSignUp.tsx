import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

interface Props {
  onBack: () => void
  onSignUp: () => void
  onGoSignIn: () => void
}

type Step = 1 | 2 | 3

const NIGERIAN_CLASSES = [
  'Nursery 1','Nursery 2',
  'Primary 1','Primary 2','Primary 3','Primary 4','Primary 5',
]

const SUBJECTS = [
  'English Language','Mathematics','Basic Science','Social Studies',
  'Civic Education','Agricultural Science','Home Economics',
  'Computer Science','Fine Art','Physical Education',
  'Physics','Chemistry','Biology','Further Mathematics',
  'Economics','Government','Literature in English','Yoruba','Igbo','Hausa',
]

export default function TeacherSignUp({ onBack, onSignUp, onGoSignIn }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — School details
  const [schoolName, setSchoolName] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [teacherId, setTeacherId] = useState('')

  // Step 2 — Teacher details
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])

  const toggleSubject = (s: string) =>
    setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const toggleClass = (c: string) =>
    setClasses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!schoolName || !teacherId) {
      setError('School name and teacher ID are required.')
      return
    }
    setError('')
    setStep(2)
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !password || selectedSubjects.length === 0) {
      setError('Please fill required fields and select at least one subject.')
      return
    }
    setError('')
    setStep(3)
  }

  const handleFinish = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); onSignUp() }, 1000)
  }

  const stepLabels = ['School', 'Your profile', 'Ready!']

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fff' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={step === 1 ? onBack : () => setStep(s => (s - 1) as Step)}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: 'var(--secondary)', color: 'var(--primary)' }}
        >
          <ArrowLeft size={17} />
        </button>
        <span className="text-xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)', letterSpacing: '-0.04em' }}>LEIF</span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full ml-1"
          style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}
        >
          Teacher Portal
        </span>
      </div>

      <div className="flex-1 flex flex-col px-5 py-8 max-w-sm mx-auto w-full">
        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all"
                style={{
                  fontFamily: 'Quicksand, sans-serif',
                  background: s < step ? 'var(--accent)' : s === step ? 'var(--primary)' : 'var(--secondary)',
                  color: s <= step ? '#fff' : 'var(--muted-foreground)',
                }}
              >
                {s < step ? <CheckCircle2 size={13} /> : s}
              </div>
              <span className="text-xs font-semibold mx-2" style={{ color: s === step ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                {stepLabels[i]}
              </span>
              {i < 2 && <div className="w-3 h-px" style={{ background: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* ── Step 1: School details ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4 flex-1 flex flex-col">
            <div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                style={{ background: 'var(--secondary)' }}
              >
                School
              </div>
              <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                Register as a teacher
              </h1>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                You'll need your school-assigned teacher ID to register.
              </p>
            </div>

            <Field label="School name *" value={schoolName} onChange={setSchoolName} placeholder="e.g. Federal Government College, Lagos" />
            <Field
              label="School ID / registration number (optional)"
              value={schoolId}
              onChange={setSchoolId}
              placeholder="e.g. FGC/LOS/2024"
            />
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
                Your teacher ID * <span className="font-normal text-xs" style={{ color: 'var(--muted-foreground)' }}>(assigned by your school)</span>
              </label>
              <input
                type="text"
                value={teacherId}
                onChange={e => setTeacherId(e.target.value)}
                placeholder="e.g. TCH-0042"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all font-mono"
                style={{ border: '1.5px solid var(--border)', color: 'var(--foreground)', background: '#fff', letterSpacing: '0.05em' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                This ID is provided by your school administration.
              </p>
            </div>

            {error && <p className="text-xs font-semibold" style={{ color: '#C0521A' }}>{error}</p>}

            <div className="mt-auto pt-4">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90"
                style={{ fontFamily: 'Quicksand, sans-serif', background: 'var(--primary)', color: '#fff' }}
              >
                Continue <ArrowRight size={17} />
              </button>
              <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
                Already registered?{' '}
                <button type="button" onClick={onGoSignIn} className="font-bold" style={{ color: 'var(--accent)' }}>
                  Sign in
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ── Step 2: Teacher details ── */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-5 flex-1 flex flex-col">
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                Your details
              </h1>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Tell us about you and which classes you teach.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="First name *" value={firstName} onChange={setFirstName} placeholder="Ngozi" />
              <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Okafor" />
            </div>
            <Field label="Email (optional)" type="email" value={email} onChange={setEmail} placeholder="teacher@school.edu.ng" />

            {/* Password */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Choose a password"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={{ border: '1.5px solid var(--border)', fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', background: '#fff' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
                Subjects you teach * <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}>(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSubject(s)}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                    style={{
                      fontFamily: 'Quicksand, sans-serif',
                      background: selectedSubjects.includes(s) ? 'var(--accent)' : 'var(--secondary)',
                      color: selectedSubjects.includes(s) ? '#fff' : 'var(--muted-foreground)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Classes */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
                Classes / arms you teach <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}>(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {NIGERIAN_CLASSES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleClass(c)}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                    style={{
                      fontFamily: 'Quicksand, sans-serif',
                      background: classes.includes(c) ? 'var(--primary)' : 'var(--secondary)',
                      color: classes.includes(c) ? '#fff' : 'var(--muted-foreground)',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs font-semibold" style={{ color: '#C0521A' }}>{error}</p>}

            <div className="mt-auto pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90"
                style={{ fontFamily: 'Quicksand, sans-serif', background: 'var(--primary)', color: '#fff' }}
              >
                Continue <ArrowRight size={17} />
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: Done ── */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: 'var(--secondary)' }}
            >
              Done
            </div>
            <div>
              <h1 className="text-2xl font-black mb-2" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                Welcome, {firstName || 'Teacher'}!
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Your teacher account is ready. You can now upload student performance and notes for parents to see.
              </p>
            </div>

            <div
              className="rounded-xl px-5 py-4 w-full text-left"
              style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>
                Your registration
              </p>
              <div className="space-y-1.5">
                <SummaryRow label="School" value={schoolName} />
                <SummaryRow label="Teacher ID" value={teacherId} />
                <SummaryRow label="Name" value={`${firstName} ${lastName}`.trim()} />
                {selectedSubjects.length > 0 && (
                  <SummaryRow label="Subjects" value={selectedSubjects.slice(0, 2).join(', ') + (selectedSubjects.length > 2 ? ` +${selectedSubjects.length - 2}` : '')} />
                )}
                {classes.length > 0 && (
                  <SummaryRow label="Classes" value={classes.join(', ')} />
                )}
              </div>
            </div>

            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ fontFamily: 'Quicksand, sans-serif', background: 'var(--accent)', color: '#fff' }}
            >
              {loading ? <><Spinner /> Opening portal…</> : <>Go to teacher dashboard <ArrowRight size={17} /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{ border: '1.5px solid var(--border)', fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', background: '#fff' }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{value}</span>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
