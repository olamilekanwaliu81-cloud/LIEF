import { useNavigate, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import NotFound from './NotFound'
import { Callout, Logo, display } from './ui'

// Plain-language placeholders for the capstone MVP. These must be replaced by
// reviewed legal text before LEIF handles real children's data.
const DOCS: Record<string, { title: string; sections: [string, string][] }> = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['What we collect', "Your name and email, your child's name, age, class and school, and the academic information you or your child's teacher add: scores, attendance, notes and assignments."],
      ['Why we collect it', "Only to show you your child's progress, highlight areas that may need attention, and suggest practical ways to help. We do not sell data or use it for advertising."],
      ['Who can see it', "You, any co-guardians you add, and teachers at your child's school who are registered on LEIF. You can switch visibility to “Only me” at any time in Profile → Privacy controls."],
      ['Your controls', 'You can edit your child’s profile, remove co-guardians, stop sharing activity with teachers, and export all data LEIF holds from the Profile page.'],
      ['No automated diagnosis', 'LEIF highlights patterns in scores. It does not diagnose learning difficulties or predict future outcomes.'],
      ['Prototype storage', 'In this MVP, all data is stored in your browser on this device only. Clearing your browser data removes it.'],
    ],
  },
  terms: {
    title: 'Terms and Conditions',
    sections: [
      ['About LEIF', 'LEIF is a parent and child academic-support tool. It complements, and does not replace, your child’s school, teachers or professional advice.'],
      ['Accounts', 'You are responsible for keeping your password and your child’s learner PIN private. Teacher accounts must use the ID assigned by their school.'],
      ['Accuracy', 'Academic information comes from teachers and parents. If something looks wrong, please contact your child’s school.'],
      ['Prototype status', 'This is a capstone MVP. Features may change and the service is provided as-is while we test it with families.'],
    ],
  },
  use: {
    title: 'Terms of Use',
    sections: [
      ['Acceptable use', 'Use LEIF only to support children you are responsible for or teach. Do not attempt to access other families’ information.'],
      ['Respectful content', 'Notes and announcements should be accurate, respectful, and appropriate for parents and children to read.'],
      ['Reporting problems', 'If you notice a bug or a privacy concern, tell the LEIF team through your school or the capstone contact.'],
    ],
  },
}

export default function Legal() {
  const { doc = '' } = useParams()
  const navigate = useNavigate()
  const page = DOCS[doc]
  if (!page) return <NotFound />

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => navigate(-1)} aria-label="Go back" className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
          <ArrowLeft size={17} />
        </button>
        <Logo size="sm" />
      </div>
      <article className="max-w-2xl mx-auto px-5 py-10 space-y-6">
        <h1 className="text-3xl font-black" style={{ ...display, color: 'var(--primary)' }}>{page.title}</h1>
        <Callout t="caution" title="Draft for the capstone MVP">These plain-language terms describe how the prototype behaves. They are not final legal text.</Callout>
        {page.sections.map(([h, body]) => (
          <section key={h}>
            <h2 className="text-lg font-bold mb-1.5" style={{ ...display, color: 'var(--primary)' }}>{h}</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{body}</p>
          </section>
        ))}
      </article>
    </div>
  )
}
