import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react'

interface Props {
  onBack: () => void
  onSignIn: () => void
  onGoSignUp: () => void
}

export default function TeacherSignIn({ onBack, onSignIn, onGoSignUp }: Props) {
  const [schoolName, setSchoolName] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!schoolName || !teacherId || !password) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onSignIn()
    }, 900)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fff' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
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
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full ml-1"
          style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)', fontFamily: 'Quicksand, sans-serif' }}
        >
          Teacher Portal
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 py-10 max-w-sm mx-auto w-full">
        {/* Icon + header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-black mb-2"
            style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)', letterSpacing: '-0.02em' }}
          >
            Teacher sign in
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Sign in with your school name and assigned teacher ID.
          </p>
        </div>

        {/* Demo hint */}
        <div
          className="rounded-xl px-4 py-3 mb-6"
          style={{ background: '#FFF8E7', border: '1px solid #F5DC8A' }}
        >
          <p className="text-xs" style={{ color: '#7A5A00' }}>
            <strong>Demo:</strong> Enter any school name, teacher ID (e.g. <strong>TCH-0042</strong>), and password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* School name */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
              School name
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              placeholder="e.g. Lagos Model College"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ border: '1.5px solid var(--border)', fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', background: '#fff' }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Teacher ID */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
              School-assigned teacher ID
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
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid var(--border)', fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', background: '#fff' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs font-semibold" style={{ color: '#C0521A' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-2"
            style={{ fontFamily: 'Quicksand, sans-serif', background: 'var(--primary)', color: '#fff' }}
          >
            {loading ? <><Spinner /> Signing in…</> : <>Sign in <ArrowRight size={17} /></>}
          </button>
        </form>

        <p className="text-center text-sm mt-8" style={{ color: 'var(--muted-foreground)' }}>
          New to LEIF?{' '}
          <button onClick={onGoSignUp} className="font-bold" style={{ color: 'var(--accent)' }}>
            Register as a teacher
          </button>
        </p>
      </div>
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
