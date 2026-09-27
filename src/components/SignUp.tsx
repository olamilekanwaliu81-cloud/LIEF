import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

interface Props {
  onBack: () => void
  onSignUp: () => void
  onGoSignIn: () => void
}

type Step = 1 | 2 | 3

export default function SignUp({ onBack, onSignUp, onGoSignIn }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Step 1 fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2 fields
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState('')
  const [grade, setGrade] = useState('')
  const [school, setSchool] = useState('')

  const [error, setError] = useState('')

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !email || !password) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setStep(2)
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!childName || !grade) {
      setError('Please enter your child\'s name and grade.')
      return
    }
    setError('')
    setStep(3)
  }

  const handleFinish = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onSignUp()
    }, 1000)
  }

  const stepLabels = ['Your account', 'Child profile', 'Ready!']

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fff' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={step === 1 ? onBack : () => setStep(s => (s - 1) as Step)}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
          style={{ background: 'var(--secondary)', color: 'var(--primary)' }}
        >
          <ArrowLeft size={17} />
        </button>
        <span
          className="text-xl font-black"
          style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)', letterSpacing: '-0.04em' }}
        >
          LEIF
        </span>
      </div>

      <div className="flex-1 flex flex-col px-5 py-8 max-w-sm mx-auto w-full">
        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
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
              <span
                className="text-xs font-semibold mx-2"
                style={{ color: s === step ? 'var(--primary)' : 'var(--muted-foreground)' }}
              >
                {stepLabels[i]}
              </span>
              {i < 2 && <div className="w-4 h-px mx-1" style={{ background: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Account */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4 flex-1 flex flex-col">
            <div>
              <h1
                className="text-2xl font-black mb-1"
                style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)', letterSpacing: '-0.02em' }}
              >
                Create your account
              </h1>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Free to get started. No credit card needed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="First name *" value={firstName} onChange={setFirstName} placeholder="Fatima" />
              <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Adeyemi" />
            </div>
            <Field label="Email address *" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <div className="relative">
              <FieldLabel>Password *</FieldLabel>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid var(--border)', fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', background: '#fff' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 bottom-3.5"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {password && (
              <PasswordStrength password={password} />
            )}

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
                Already have an account?{' '}
                <button type="button" onClick={onGoSignIn} className="font-bold" style={{ color: 'var(--accent)' }}>
                  Sign in
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Step 2: Child profile */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4 flex-1 flex flex-col">
            <div>
              <h1
                className="text-2xl font-black mb-1"
                style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)', letterSpacing: '-0.02em' }}
              >
                Add your child's profile
              </h1>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                You can always edit this later. Start with the basics.
              </p>
            </div>

            <Field label="Child's first name *" value={childName} onChange={setChildName} placeholder="e.g. Amara" />
            <Field label="Age" type="number" value={childAge} onChange={setChildAge} placeholder="e.g. 10" />

            <div>
              <FieldLabel>Class *</FieldLabel>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid var(--border)', fontFamily: 'DM Sans, sans-serif', color: grade ? 'var(--foreground)' : 'var(--muted-foreground)', background: '#fff' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              >
                <option value="">Select class</option>
                <optgroup label="Nursery">
                  {['Nursery 1','Nursery 2'].map(g => <option key={g} value={g}>{g}</option>)}
                </optgroup>
                <optgroup label="Primary School">
                  {['Primary 1','Primary 2','Primary 3','Primary 4','Primary 5'].map(g => <option key={g} value={g}>{g}</option>)}
                </optgroup>
              </select>
            </div>

            <Field label="School name (optional)" value={school} onChange={setSchool} placeholder="e.g. Greenfield Primary" />

            <div
              className="rounded-xl px-4 py-3 flex items-start gap-2"
              style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
            >
              <span className="mt-0.5">🔒</span>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Your child's data is private by default. Only you can see it unless you choose to share access.
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
            </div>
          </form>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <CheckCircle2 size={40} color="#fff" />
            </div>
            <div>
              <h1
                className="text-2xl font-black mb-2"
                style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)', letterSpacing: '-0.02em' }}
              >
                You're all set, {firstName || 'there'}!
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {childName || 'Your child'}'s profile is ready. Head to the dashboard to explore their academic progress.
              </p>
            </div>

            <div
              className="rounded-xl px-5 py-4 w-full text-left"
              style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}>
                Your setup
              </p>
              <div className="space-y-1.5">
                <SummaryRow label="Parent" value={`${firstName} ${lastName}`.trim()} />
                <SummaryRow label="Child" value={childName || '—'} />
                <SummaryRow label="Grade" value={grade || '—'} />
                {school && <SummaryRow label="School" value={school} />}
              </div>
            </div>

            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ fontFamily: 'Quicksand, sans-serif', background: 'var(--accent)', color: '#fff' }}
            >
              {loading ? <><Spinner /> Opening dashboard…</> : <>Go to dashboard <ArrowRight size={17} /></>}
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
      <FieldLabel>{label}</FieldLabel>
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold mb-1.5" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
      {children}
    </label>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#E97B2E', '#E9B52E', '#0D2B55', '#1ABF96']
  return (
    <div>
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all" style={{ background: i <= score ? colors[score] : 'var(--border)' }} />
        ))}
      </div>
      <p className="text-xs font-semibold" style={{ color: colors[score] || 'var(--muted-foreground)' }}>
        {labels[score] || 'Enter a password'}
      </p>
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
