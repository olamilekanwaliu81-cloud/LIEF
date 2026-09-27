import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { useStore } from '../lib/store'
import { DEMO_PASSWORD, DEMO_TEACHER_ID, DEMO_TEACHER_SCHOOL } from '../lib/seed'
import AuthShell, { AuthHeading, DemoHint } from './AuthShell'
import { Button, PasswordField, TextField } from './ui'

export default function TeacherSignIn() {
  const { signInTeacher } = useStore()
  const navigate = useNavigate()
  const [schoolName, setSchoolName] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ school?: string; id?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!schoolName.trim()) errs.school = 'Enter your school name.'
    if (!teacherId.trim()) errs.id = 'Enter the teacher ID your school gave you.'
    if (!password) errs.password = 'Enter your password.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    const error = await signInTeacher(schoolName, teacherId, password)
    setLoading(false)
    if (error) return setErrors({ form: error })
    navigate('/teacher/overview', { replace: true })
  }

  const clear = () => setErrors({})

  return (
    <AuthShell
      badge="Teacher Portal"
      panelTitle="Teachers power the platform."
      panelPoints={['Upload subject scores in minutes', 'Flag weak areas and mark strengths', 'Parents see exactly what you share']}
    >
      <AuthHeading title="Teacher sign in" subtitle="Sign in with your school name and assigned teacher ID." />

      <DemoHint onUse={() => { setSchoolName(DEMO_TEACHER_SCHOOL); setTeacherId(DEMO_TEACHER_ID); setPassword(DEMO_PASSWORD); clear() }}>
        Sign in as Mrs. Okafor (Primary 4).
      </DemoHint>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="School name" value={schoolName} onChange={v => { setSchoolName(v); clear() }} placeholder="e.g. Lagos Model College" autoComplete="organization" error={errors.school} />
        <TextField label="School-assigned teacher ID" value={teacherId} onChange={v => { setTeacherId(v.toUpperCase()); clear() }} placeholder="e.g. TCH-0042" autoComplete="username" className="font-mono tracking-wide" error={errors.id} />
        <PasswordField label="Password" value={password} onChange={v => { setPassword(v); clear() }} placeholder="Your password" error={errors.password} />
        {errors.form && <p role="alert" className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>{errors.form}</p>}
        <Button type="submit" block size="lg" loading={loading} className="mt-2">
          {loading ? 'Signing in…' : <>Sign in <ArrowRight size={17} /></>}
        </Button>
      </form>

      <p className="text-center text-sm mt-8" style={{ color: 'var(--muted-foreground)' }}>
        New to LEIF? <Link to="/teacher/signup" className="font-bold" style={{ color: 'var(--accent)' }}>Register as a teacher</Link>
      </p>
      <p className="text-center text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>
        Forgot your password? Ask your school administrator to reset your teacher ID.
      </p>
    </AuthShell>
  )
}
