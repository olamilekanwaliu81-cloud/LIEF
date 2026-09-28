import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { homeFor } from '../App'
import { useStore } from '../lib/store'
import AuthShell, { AuthHeading } from './AuthShell'
import { PasswordStrength } from './SignUp'
import { Button, Callout, PasswordField, useToast } from './ui'

/** Landing page for the password-reset email link (cloud mode). */
export default function ResetPassword() {
  const { session, updatePassword } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) return setError('Use at least 8 characters.')
    if (password !== confirm) return setError('The two passwords don’t match.')
    setLoading(true)
    const err = await updatePassword(password)
    setLoading(false)
    if (err) return setError(err)
    toast('Password updated')
    navigate(session ? homeFor[session.role] : '/signin', { replace: true })
  }

  return (
    <AuthShell panelTitle="Back into LEIF in a moment." panelPoints={['Choose a new password', 'Your data stays exactly as it was']}>
      <AuthHeading title="Choose a new password" subtitle="You opened a password reset link. Set your new password below." />
      {!session && (
        <div className="mb-5">
          <Callout t="caution" title="This link may have expired">If saving fails, request a new reset link from the sign-in page.</Callout>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <PasswordField label="New password" autoComplete="new-password" value={password} onChange={v => { setPassword(v); setError('') }} placeholder="At least 8 characters" />
        {password && <PasswordStrength password={password} />}
        <PasswordField label="Confirm new password" autoComplete="new-password" value={confirm} onChange={v => { setConfirm(v); setError('') }} />
        {error && <p role="alert" className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>{error}</p>}
        <Button type="submit" block size="lg" loading={loading}>Save password <ArrowRight size={17} /></Button>
      </form>
    </AuthShell>
  )
}
