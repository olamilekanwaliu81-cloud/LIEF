import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, Lock } from 'lucide-react'
import { useStore } from '../lib/store'
import { CLASS_GROUPS } from '../data/grades'
import { Button, Callout, Card, PageHeader, SelectField, TextField, useToast } from './ui'

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

export default function AddChild() {
  const { addChild } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState<ChildForm>(emptyChild)
  const [errors, setErrors] = useState<Partial<Record<keyof ChildForm, string>>>({})

  const [saving, setSaving] = useState(false)

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
      <Card className="p-5">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <ChildFields form={form} setForm={setForm} errors={errors} />
          <Callout t="neutral" icon={<Lock size={15} />}>Your child's data is private by default. Only you can see it unless you choose to share access.</Callout>
          <div className="flex gap-2 pt-1">
            <Button type="submit" variant="accent" size="lg" className="flex-1" loading={saving}>Add child <ArrowRight size={16} /></Button>
            <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
