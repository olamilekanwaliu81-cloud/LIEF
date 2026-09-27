import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react'
import { useStore } from '../lib/store'
import AuthShell, { AuthHeading, StepIndicator, isEmail } from './AuthShell'
import { ChildFields, emptyChild, validateChild, type ChildForm } from './AddChild'
import { Button, Callout, PasswordField, TextField, display } from './ui'

type Step = 1 | 2 | 3

export default function SignUp() {
  const { signUpParent } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)

  const [account, setAccount] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [accountErrors, setAccountErrors] = useState<Partial<Record<keyof typeof account | 'form', string>>>({})
  const [child, setChild] = useState<ChildForm>(emptyChild)
  const [childErrors, setChildErrors] = useState<Partial<Record<keyof ChildForm, string>>>({})

  const set = (k: keyof typeof account) => (v: string) => { setAccount(a => ({ ...a, [k]: v })); setAccountErrors({}) }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof accountErrors = {}
    if (!account.firstName.trim()) errs.firstName = 'Enter your first name.'
    if (!isEmail(account.email)) errs.email = 'Enter a valid email address.'
    if (account.password.length < 8) errs.password = 'Use at least 8 characters.'
    setAccountErrors(errs)
    if (!Object.keys(errs).length) setStep(2)
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateChild(child)
    setChildErrors(errs)
    if (!Object.keys(errs).length) setStep(3)
  }

  const handleFinish = async () => {
    setLoading(true)
    const error = await signUpParent({
      ...account,
      child: { name: child.name, age: child.age ? Number(child.age) : undefined, class: child.class, school: child.school },
    })
    setLoading(false)
    if (error) {
      setAccountErrors({ form: error })
      setStep(1)
      return
    }
    navigate('/app/dashboard', { replace: true })
  }

  return (
    <AuthShell
      onBack={step === 1 ? undefined : () => setStep(s => (s - 1) as Step)}
      panelTitle="Your child's academic progress — finally clear."
      panelPoints={['Free to get started', 'Set up in under 2 minutes', "Your child's data stays private by default"]}
    >
      <StepIndicator step={step} labels={['Your account', 'Child profile', 'Ready!']} />

      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4 flex-1 flex flex-col" noValidate>
          <AuthHeading title="Create your account" subtitle="Free to get started. No credit card needed." />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="First name *" value={account.firstName} onChange={set('firstName')} placeholder="Fatima" autoComplete="given-name" error={accountErrors.firstName} />
            <TextField label="Last name" value={account.lastName} onChange={set('lastName')} placeholder="Adeyemi" autoComplete="family-name" />
          </div>
          <TextField label="Email address *" type="email" value={account.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" error={accountErrors.email} />
          <PasswordField label="Password *" value={account.password} onChange={set('password')} placeholder="Choose a strong password" autoComplete="new-password" error={accountErrors.password} />
          {account.password && <PasswordStrength password={account.password} />}
          {accountErrors.form && <p role="alert" className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>{accountErrors.form}</p>}

          <div className="mt-auto pt-4">
            <Button type="submit" block size="lg">Continue <ArrowRight size={17} /></Button>
            <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
              Already have an account? <Link to="/signin" className="font-bold" style={{ color: 'var(--accent)' }}>Sign in</Link>
            </p>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4 flex-1 flex flex-col" noValidate>
          <AuthHeading title="Add your child's profile" subtitle="You can always edit this later. Start with the basics." />
          <ChildFields form={child} setForm={v => { setChild(v); setChildErrors({}) }} errors={childErrors} />
          <Callout t="neutral" icon={<Lock size={15} />}>Your child's data is private by default. Only you can see it unless you choose to share access.</Callout>
          <div className="mt-auto pt-4">
            <Button type="submit" block size="lg">Continue <ArrowRight size={17} /></Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <CheckCircle2 size={40} color="#fff" />
          </div>
          <div>
            <h1 className="text-2xl font-black mb-2" style={{ ...display, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              You're all set, {account.firstName.trim() || 'there'}!
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {child.name.trim() || 'Your child'}'s profile is ready. Head to the dashboard to add a first result or see teacher updates.
            </p>
          </div>
          <div className="rounded-xl px-5 py-4 w-full text-left" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', ...display }}>Your setup</p>
            <div className="space-y-1.5">
              <SummaryRow label="Parent" value={`${account.firstName} ${account.lastName}`.trim()} />
              <SummaryRow label="Email" value={account.email.trim()} />
              <SummaryRow label="Child" value={child.name.trim()} />
              <SummaryRow label="Class" value={child.class} />
              {child.school && <SummaryRow label="School" value={child.school} />}
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            By continuing you agree to the <Link to="/legal/terms" className="underline">Terms</Link> and <Link to="/legal/privacy" className="underline">Privacy Policy</Link>.
          </p>
          <Button onClick={handleFinish} loading={loading} block size="lg" variant="accent">
            {loading ? 'Creating your account…' : <>Go to dashboard <ArrowRight size={17} /></>}
          </Button>
        </div>
      )}
    </AuthShell>
  )
}

export function PasswordStrength({ password }: { password: string }) {
  const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['var(--warning)', 'var(--warning-strong)', 'var(--caution)', 'var(--info)', 'var(--accent)']
  return (
    <div aria-live="polite">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all" style={{ background: i <= score ? colors[score] : 'var(--border)' }} />
        ))}
      </div>
      <p className="text-xs font-semibold" style={{ color: colors[score] }}>{labels[score]}</p>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <span className="text-xs font-bold truncate" style={{ color: 'var(--primary)' }}>{value || '—'}</span>
    </div>
  )
}
