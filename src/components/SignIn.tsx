import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, ArrowRight } from 'lucide-react'

interface Props {
  onBack: () => void
  onSignIn: () => void
  onGoSignUp: () => void
}

export default function SignIn({ onBack, onSignIn, onGoSignUp }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setLoading(true)
    // Simulate auth
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

      <div className="flex-1 flex flex-col justify-center px-5 py-10 max-w-sm mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-black mb-2"
            style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)', letterSpacing: '-0.02em' }}
          >
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Sign in to see your child's progress.
          </p>
        </div>

        {/* Demo hint */}
        <div
          className="rounded-xl px-4 py-3 mb-6 flex items-center gap-2"
          style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
        >
          <span className="text-base">💡</span>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <strong style={{ color: 'var(--primary)' }}>Demo:</strong> Enter any email & password, then tap Sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              className="block text-xs font-bold mb-1.5"
              style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}
            >
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                border: '1.5px solid var(--border)',
                fontFamily: 'DM Sans, sans-serif',
                color: 'var(--foreground)',
                background: '#fff',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="block text-xs font-bold"
                style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}
              >
                Password
              </label>
              <button
                type="button"
                className="text-xs font-semibold"
                style={{ color: 'var(--accent)' }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid var(--border)',
                  fontFamily: 'DM Sans, sans-serif',
                  color: 'var(--foreground)',
                  background: '#fff',
                }}
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

          {error && (
            <p className="text-xs font-semibold" style={{ color: '#C0521A' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{
              fontFamily: 'Quicksand, sans-serif',
              background: 'var(--primary)',
              color: '#fff',
              marginTop: '4px',
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner /> Signing in…
              </span>
            ) : (
              <>
                Sign in <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        {/* Google sign-in stub */}
        <button
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all"
          style={{
            fontFamily: 'Quicksand, sans-serif',
            border: '1.5px solid var(--border)',
            color: 'var(--foreground)',
            background: '#fff',
          }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="text-center text-sm mt-8" style={{ color: 'var(--muted-foreground)' }}>
          Don't have an account?{' '}
          <button
            onClick={onGoSignUp}
            className="font-bold"
            style={{ color: 'var(--accent)' }}
          >
            Sign up free
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}
