import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { useStore } from '../lib/store'
import { DEMO_PARENT_EMAIL, DEMO_PASSWORD } from '../lib/seed'
import AuthShell, { AuthHeading, DemoHint, isEmail } from './AuthShell'
import { Button, Modal, PasswordField, TextField, display, useToast } from './ui'

export default function SignIn() {
  const { signInParent } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!isEmail(email)) errs.email = 'Enter a valid email address.'
    if (!password) errs.password = 'Enter your password.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    const error = await signInParent(email, password)
    setLoading(false)
    if (error) return setErrors({ form: error })
    const from = (location.state as { from?: string } | null)?.from
    navigate(from?.startsWith('/app') ? from : '/app/dashboard', { replace: true })
  }

  return (
    <AuthShell
      panelTitle="See where your child is — and how to help."
      panelPoints={['Clear view of every subject over time', 'Areas needing attention, flagged early', 'Practical actions you can take at home']}
    >
      <AuthHeading title="Welcome back" subtitle="Sign in to see your child's progress." />

      <DemoHint onUse={() => { setEmail(DEMO_PARENT_EMAIL); setPassword(DEMO_PASSWORD); setErrors({}) }}>
        Sign in as Fatima, Amara's mum.
      </DemoHint>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="Email address" type="email" autoComplete="email" value={email} onChange={v => { setEmail(v); setErrors({}) }} placeholder="you@example.com" error={errors.email} />
        <PasswordField
          label="Password"
          value={password}
          onChange={v => { setPassword(v); setErrors({}) }}
          placeholder="Your password"
          error={errors.password}
          aside={<button type="button" onClick={() => setForgotOpen(true)} className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Forgot password?</button>}
        />
        {errors.form && <p role="alert" className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>{errors.form}</p>}
        <Button type="submit" block size="lg" loading={loading}>
          {loading ? 'Signing in…' : <>Sign in <ArrowRight size={17} /></>}
        </Button>
      </form>

      <p className="text-center text-sm mt-8" style={{ color: 'var(--muted-foreground)' }}>
        Don't have an account?{' '}
        <Link to="/signup" className="font-bold" style={{ color: 'var(--accent)' }}>Sign up free</Link>
      </p>
      <p className="text-center text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>
        Are you a teacher? <Link to="/teacher/signin" className="font-bold" style={{ color: 'var(--primary)', ...display }}>Teacher portal</Link>
        {' · '}
        A learner? <Link to="/learner/signin" className="font-bold" style={{ color: 'var(--primary)', ...display }}>Learner sign in</Link>
      </p>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} initialEmail={email} />
    </AuthShell>
  )
}

/**
 * Cloud mode emails a secure reset link. Browser-only mode has no email
 * service, so the new password is set directly on this device.
 */
function ForgotPasswordModal({ open, onClose, initialEmail }: { open: boolean; onClose: () => void; initialEmail: string }) {
  const { resetParentPassword, mode } = useStore()
  const toast = useToast()
  const byEmail = mode === 'supabase'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [seeded, setSeeded] = useState(false)

  if (open && !seeded) { setEmail(initialEmail); setSeeded(true) }
  const close = () => { setSeeded(false); setSent(false); setPassword(''); setError(''); onClose() }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmail(email)) return setError('Enter the email you signed up with.')
    if (!byEmail && password.length < 8) return setError('Choose a password of at least 8 characters.')
    setLoading(true)
    const err = await resetParentPassword(email, password)
    setLoading(false)
    if (err) return setError(err)
    if (byEmail) return setSent(true)
    toast('Password updated — you can sign in now')
    close()
  }

  if (sent) {
    return (
      <Modal open={open} onClose={close} title="Check your email" description={`If an account exists for ${email.trim()}, we've sent a link to reset your password. It expires in an hour.`}>
        <Button block size="lg" variant="secondary" onClick={close}>Back to sign in</Button>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Reset your password"
      description={byEmail
        ? "Enter your email and we'll send you a link to choose a new password."
        : 'In this prototype your account lives on this device, so you can choose a new password right here.'}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="Email address" type="email" autoComplete="email" value={email} onChange={v => { setEmail(v); setError('') }} />
        {!byEmail && <PasswordField label="New password" autoComplete="new-password" value={password} onChange={v => { setPassword(v); setError('') }} placeholder="At least 8 characters" />}
        {error && <p role="alert" className="text-xs font-semibold" style={{ color: 'var(--warning)' }}>{error}</p>}
        <Button type="submit" block size="lg" variant="accent" loading={loading}>{byEmail ? 'Send reset link' : 'Update password'}</Button>
      </form>
    </Modal>
  )
}
