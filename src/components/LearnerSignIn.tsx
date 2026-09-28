import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { useStore } from '../lib/store'
import { DEMO_LEARNER_CODE, DEMO_LEARNER_PIN } from '../lib/seed'
import AuthShell, { AuthHeading, DemoHint } from './AuthShell'
import { Button, TextField } from './ui'

export default function LearnerSignIn() {
  const { signInLearner } = useStore()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || pin.length !== 4) return setError('Enter your learner code and 4-digit PIN.')
    setLoading(true)
    const err = await signInLearner(code, pin)
    setLoading(false)
    if (err) return setError(err)
    navigate('/learner', { replace: true })
  }

  return (
    <AuthShell
      badge="Learner"
      panelTitle="Your learning, one step at a time."
      panelPoints={['See what to do next', 'Tick off tasks when you finish', 'Watch your progress grow']}
    >
      <AuthHeading title="Hi there! 👋" subtitle="Sign in with the learner code and PIN from your parent." />

      <DemoHint onUse={() => { setCode(DEMO_LEARNER_CODE); setPin(DEMO_LEARNER_PIN); setError('') }} label="Try as Amara">
        Sign in as Amara, Primary 4.
      </DemoHint>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="Learner code" value={code} onChange={v => { setCode(v.toUpperCase()); setError('') }} placeholder="e.g. STU-001" className="font-mono tracking-wide" autoComplete="username" />
        <TextField label="PIN" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={v => { setPin(v.replace(/\D/g, '')); setError('') }} placeholder="••••" className="font-mono tracking-[0.4em]" autoComplete="current-password" />
        {error && <p role="alert" className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>{error}</p>}
        <Button type="submit" block size="lg" variant="accent" loading={loading}>Let's go <ArrowRight size={17} /></Button>
      </form>

      <p className="text-center text-xs mt-8" style={{ color: 'var(--muted-foreground)' }}>
        Parents can find the code and PIN under Profile → Learner access. <Link to="/signin" className="font-bold" style={{ color: 'var(--accent)' }}>Parent sign in</Link>
      </p>
    </AuthShell>
  )
}
