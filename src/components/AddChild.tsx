import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, Link2, Lock } from 'lucide-react'
import { useStore } from '../lib/store'
import { CLASS_GROUPS } from '../data/grades'
import { Button, Callout, Card, PageHeader, Segmented, SelectField, TextField, useToast } from './ui'

export interface ChildForm { name: string; age: string; class: string; school: string }
export const emptyChild: ChildForm = { name: '', age: '', class: '', school: '' }

export function validateChild(f: ChildForm): Partial<Record<keyof ChildForm, string>> {
  const errors: Partial<Record<keyof ChildForm, string>> = {}
  if (!f.name.trim()) errors.name = "Enter your child's first name."
  if (!f.class) errors.class = 'Select a class.'
  if (f.age && (Number(f.age) < 2 || Number(f.age) > 19)) errors.age = 'Enter an age between 2 and 19.'
  return errors
}

/** Shared by sign-up step 2 and the "Add a child" page. */
export function ChildFields({ form, setForm, errors }: {
  form: ChildForm
  setForm: React.Dispatch<React.SetStateAction<ChildForm>>
  errors: Partial<Record<keyof ChildForm, string>>
}) {
  return (
    <>
      <TextField label="Child's name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Amara" error={errors.name} />
      <TextField label="Age" type="number" inputMode="numeric" value={form.age} onChange={v => setForm(f => ({ ...f, age: v }))} placeholder="e.g. 10" error={errors.age} />
      <SelectField label="Class *" value={form.class} onChange={v => setForm(f => ({ ...f, class: v }))} error={errors.class}>
        <option value="">Select class</option>
        {CLASS_GROUPS.map(g => (
          <optgroup key={g.group} label={g.group}>{g.classes.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
        ))}
      </SelectField>
      <TextField label="School name" value={form.school} onChange={v => setForm(f => ({ ...f, school: v }))} placeholder="e.g. Greenfield Primary" hint="Teachers registered at this school on LEIF can upload results for your child." />
    </>
  )
}

export interface ConnectForm { code: string; linkCode: string }
export const emptyConnect: ConnectForm = { code: '', linkCode: '' }

export function validateConnect(f: ConnectForm): Partial<Record<keyof ConnectForm, string>> {
  const errors: Partial<Record<keyof ConnectForm, string>> = {}
  if (!/^STU-[A-Z0-9]{3,}$/i.test(f.code.trim())) errors.code = 'Enter the learner code, e.g. STU-4F2A91C0.'
  if (f.linkCode.trim().length !== 6) errors.linkCode = 'The link code has 6 characters.'
  return errors
}

/** For children their teacher already added: learner code + parent link code. */
export function ConnectFields({ form, setForm, errors }: {
  form: ConnectForm
  setForm: React.Dispatch<React.SetStateAction<ConnectForm>>
  errors: Partial<Record<keyof ConnectForm, string>>
}) {
  return (
    <>
      <TextField label="Learner code *" value={form.code} onChange={v => setForm(f => ({ ...f, code: v.toUpperCase().trim() }))} placeholder="e.g. STU-4F2A91C0" className="font-mono tracking-wide" autoComplete="off" error={errors.code} />
      <TextField label="Parent link code *" value={form.linkCode} onChange={v => setForm(f => ({ ...f, linkCode: v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) }))} placeholder="6 characters" className="font-mono tracking-[0.3em]" autoComplete="off" error={errors.linkCode} />
      <Callout t="info" icon={<Link2 size={15} />}>Your child’s teacher gives you both codes. You’ll see everything they’ve already recorded, and no duplicate profile is created.</Callout>
    </>
  )
}

export type ChildMode = 'new' | 'connect'

export function ChildModeSwitch({ mode, onChange }: { mode: ChildMode; onChange: (m: ChildMode) => void }) {
  return (
    <Segmented
      label="How to add your child"
      value={mode}
      onChange={onChange}
      options={[{ value: 'new', label: 'Create a profile' }, { value: 'connect', label: 'I have a code' }]}
    />
  )
}

export default function AddChild() {
  const { addChild, connectChild } = useStore()
  const [params] = useSearchParams()
  const [mode, setMode] = useState<ChildMode>(params.get('connect') ? 'connect' : 'new')
  const [connect, setConnect] = useState<ConnectForm>(emptyConnect)
  const [connectErrors, setConnectErrors] = useState<Partial<Record<keyof ConnectForm | 'form', string>>>({})
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState<ChildForm>(emptyChild)
  const [errors, setErrors] = useState<Partial<Record<keyof ChildForm, string>>>({})

  const [saving, setSaving] = useState(false)

  const submitConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateConnect(connect)
    setConnectErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    const error = await connectChild(connect.code, connect.linkCode)
    setSaving(false)
    if (error) return setConnectErrors({ form: error })
    toast('Connected. Your child’s progress is on your dashboard')
    navigate('/app/dashboard')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateChild(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    const id = await addChild({ name: form.name, age: form.age ? Number(form.age) : undefined, class: form.class, school: form.school })
    setSaving(false)
    if (!id) return
    toast(`${form.name.trim()} has been added`)
    navigate('/app/dashboard')
  }

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader title="Add a child" subtitle="You can switch between children from the menu at any time." />
      <ChildModeSwitch mode={mode} onChange={setMode} />
      <Card className="p-5">
        {mode === 'connect' ? (
          <form onSubmit={submitConnect} className="space-y-4" noValidate>
            <ConnectFields form={connect} setForm={v => { setConnect(v); setConnectErrors({}) }} errors={connectErrors} />
            {connectErrors.form && <p role="alert" className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>{connectErrors.form}</p>}
            <div className="flex gap-2 pt-1">
              <Button type="submit" variant="accent" size="lg" className="flex-1" loading={saving}>Connect <ArrowRight size={16} /></Button>
              <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <ChildFields form={form} setForm={setForm} errors={errors} />
          <Callout t="neutral" icon={<Lock size={15} />}>Your child's data is private by default. Only you can see it unless you choose to share access.</Callout>
          <div className="flex gap-2 pt-1">
            <Button type="submit" variant="accent" size="lg" className="flex-1" loading={saving}>Add child <ArrowRight size={16} /></Button>
            <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
        )}
      </Card>
    </div>
  )
}
