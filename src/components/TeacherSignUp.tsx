import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useStore } from '../lib/store'
import { ALL_CLASSES } from '../data/grades'
import AuthShell, { AuthHeading, CheckEmail, StepIndicator, isEmail } from './AuthShell'
import { PasswordStrength } from './SignUp'
import { Button, Callout, Chip, PasswordField, TextField, display } from './ui'

type Step = 1 | 2 | 3

const SUBJECTS = [
  'English Language', 'Mathematics', 'Basic Science & Technology', 'Social Studies',
  'Civic Education', 'Agricultural Science', 'Home Economics', 'Computer Studies / ICT',
  'Cultural & Creative Arts', 'Physical & Health Education', 'Verbal Reasoning', 'Quantitative Reasoning',
  'Yoruba', 'Igbo', 'Hausa',
]

export default function TeacherSignUp() {
  const { signUpTeacher, track } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [school, setSchool] = useState({ schoolName: '', schoolId: '', teacherId: '' })
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [subjects, setSubjects] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])

  const toggle = (list: string[], set: (v: string[]) => void, item: string) => {
    set(list.includes(item) ? list.filter(x => x !== item) : [...list, item])
    setErrors({})
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!school.schoolName.trim()) errs.schoolName = 'Enter your school name.'
    if (!/^[A-Za-z]{2,5}-?\d{2,6}$/.test(school.teacherId.trim())) errs.teacherId = 'Use the format on your staff card, e.g. TCH-0042.'
    setErrors(errs)
    if (!Object.keys(errs).length) setStep(2)
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!profile.firstName.trim()) errs.firstName = 'Enter your first name.'
    if (!isEmail(profile.email)) errs.email = 'Enter a valid email address.'
    if (profile.password.length < 8) errs.password = 'Use at least 8 characters.'
    if (!subjects.length) errs.subjects = 'Select at least one subject.'
    if (!classes.length) errs.classes = 'Select at least one class.'
    setErrors(errs)
    if (!Object.keys(errs).length) setStep(3)
  }

  const handleFinish = async () => {
    setLoading(true)
    const result = await signUpTeacher({ ...school, ...profile, subjects, classes })
    setLoading(false)
    if (result.error !== null) { setErrors({ teacherId: result.error }); setStep(1); return }
    track('onboarding_completed', { role: 'teacher' })
    if (result.confirmEmail) return setConfirmEmail(true)
    navigate('/teacher/overview', { replace: true })
  }

  const setP = (k: keyof typeof profile) => (v: string) => { setProfile(p => ({ ...p, [k]: v })); setErrors({}) }

  return (
    <AuthShell
      badge="Teacher Portal"
      onBack={step === 1 ? undefined : () => setStep(s => (s - 1) as Step)}
      panelTitle="Help parents support learning at home."
      panelPoints={['Verified with your school-assigned ID', 'Scores publish straight to parent dashboards', 'Announcements reach every parent in your class']}
    >
      {confirmEmail ? <CheckEmail email={profile.email.trim()} signInPath="/teacher/signin" /> : <>
      <StepIndicator step={step} labels={['School', 'Your profile', 'Ready!']} />

      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4 flex-1 flex flex-col" noValidate>
          <AuthHeading title="Register your school" subtitle="Teacher access is tied to your school-assigned ID. No public registration." />
          <TextField label="School name *" value={school.schoolName} onChange={v => { setSchool(s => ({ ...s, schoolName: v })); setErrors({}) }} placeholder="e.g. Federal Government College, Lagos" error={errors.schoolName} />
          <TextField label="School ID (optional)" value={school.schoolId} onChange={v => setSchool(s => ({ ...s, schoolId: v }))} placeholder="e.g. FGC-LAG-001" className="font-mono" />
          <TextField label="Your teacher ID *" value={school.teacherId} onChange={v => { setSchool(s => ({ ...s, teacherId: v.toUpperCase() })); setErrors({}) }} placeholder="e.g. TCH-0042" className="font-mono tracking-wide" error={errors.teacherId} />
          <div className="mt-auto pt-4">
            <Button type="submit" block size="lg">Continue <ArrowRight size={17} /></Button>
            <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
              Already registered? <Link to="/teacher/signin" className="font-bold" style={{ color: 'var(--accent)' }}>Sign in</Link>
            </p>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4 flex-1 flex flex-col" noValidate>
          <AuthHeading title="Your teaching profile" subtitle="Tell us what and who you teach." />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="First name *" value={profile.firstName} onChange={setP('firstName')} autoComplete="given-name" error={errors.firstName} />
            <TextField label="Last name" value={profile.lastName} onChange={setP('lastName')} autoComplete="family-name" />
          </div>
          <TextField label="School email *" type="email" value={profile.email} onChange={setP('email')} placeholder="you@school.edu.ng" autoComplete="email" error={errors.email} />
          <PasswordField label="Password *" value={profile.password} onChange={setP('password')} autoComplete="new-password" placeholder="At least 8 characters" error={errors.password} />
          {profile.password && <PasswordStrength password={profile.password} />}

          <fieldset>
            <legend className="text-xs font-bold mb-2" style={{ ...display, color: 'var(--primary)' }}>Classes you teach *</legend>
            <div className="flex flex-wrap gap-2">
              {ALL_CLASSES.map(c => <Chip key={c} active={classes.includes(c)} onClick={() => toggle(classes, setClasses, c)}>{c}</Chip>)}
            </div>
            {errors.classes && <p role="alert" className="text-xs font-semibold mt-1.5" style={{ color: 'var(--warning)' }}>{errors.classes}</p>}
          </fieldset>

          <fieldset>
            <legend className="text-xs font-bold mb-2" style={{ ...display, color: 'var(--primary)' }}>Subjects you teach *</legend>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(s => <Chip key={s} active={subjects.includes(s)} onClick={() => toggle(subjects, setSubjects, s)} activeColor="var(--accent)">{s}</Chip>)}
            </div>
            {errors.subjects && <p role="alert" className="text-xs font-semibold mt-1.5" style={{ color: 'var(--warning)' }}>{errors.subjects}</p>}
          </fieldset>

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
            <h1 className="text-2xl font-black mb-2" style={{ ...display, color: 'var(--primary)' }}>Welcome, {profile.firstName.trim()}!</h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Your teacher portal is ready.</p>
          </div>
          <div className="rounded-xl px-5 py-4 w-full text-left space-y-1.5" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
            {[['School', school.schoolName], ['Teacher ID', school.teacherId], ['Classes', classes.join(', ')], ['Subjects', subjects.join(', ')]].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4">
                <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>{l}</span>
                <span className="text-xs font-bold text-right" style={{ color: 'var(--primary)' }}>{v}</span>
              </div>
            ))}
          </div>
          <Callout t="info">Students appear in your roster when their parent registers them at <strong>{school.schoolName.trim()}</strong> in one of your classes.</Callout>
          <Button onClick={handleFinish} loading={loading} block size="lg" variant="accent">
            {loading ? 'Setting up…' : <>Open teacher portal <ArrowRight size={17} /></>}
          </Button>
        </div>
      )}
      </>}
    </AuthShell>
  )
}
