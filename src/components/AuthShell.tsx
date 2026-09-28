import { useNavigate } from 'react-router'
import { ArrowLeft, CheckCircle2, MailCheck } from 'lucide-react'
import { Button, Logo, display } from './ui'

export const IMG_FAMILY = 'https://images.unsplash.com/photo-1783378991404-759601c30595?w=900&h=1100&fit=crop&auto=format&q=85'

interface Props {
  children: React.ReactNode
  onBack?: () => void
  badge?: string
  panelTitle: string
  panelPoints: string[]
}

/** Auth screens: single column on mobile, brand panel + form on desktop. */
export default function AuthShell({ children, onBack, badge, panelTitle, panelPoints }: Props) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      <aside className="hidden lg:flex relative w-[44%] max-w-xl flex-col justify-between p-10 overflow-hidden" style={{ background: 'var(--hero)' }}>
        <img src={IMG_FAMILY} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(13,43,85,0.95) 30%, rgba(13,43,85,0.55))' }} />
        <button onClick={() => navigate('/')} className="relative w-fit" aria-label="LEIF home"><Logo light size="lg" /></button>
        <div className="relative">
          <h2 className="text-3xl font-black text-white leading-tight mb-6" style={{ ...display, letterSpacing: '-0.02em' }}>{panelTitle}</h2>
          <ul className="space-y-3">
            {panelPoints.map(p => (
              <li key={p} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <CheckCircle2 size={17} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} /> {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Privacy-first · parent-controlled · no automated diagnosis</p>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-5 py-4 border-b lg:border-b-0" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onBack ?? (() => navigate('/'))}
            aria-label="Go back"
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            style={{ background: 'var(--secondary)', color: 'var(--primary)' }}
          >
            <ArrowLeft size={17} />
          </button>
          <span className="lg:hidden"><Logo size="sm" /></span>
          {badge && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-1" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)', ...display }}>{badge}</span>
          )}
        </div>
        <div className="flex-1 flex flex-col px-5 py-8 lg:py-12 max-w-md mx-auto w-full lg:justify-center">
          {children}
        </div>
      </div>
    </div>
  )
}

export function StepIndicator({ step, labels }: { step: number; labels: string[] }) {
  return (
    <ol className="flex items-center mb-8 flex-wrap gap-y-2" aria-label={`Step ${step} of ${labels.length}`}>
      {labels.map((label, i) => {
        const s = i + 1
        return (
          <li key={label} className="flex items-center" aria-current={s === step ? 'step' : undefined}>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all"
              style={{ ...display, background: s < step ? 'var(--accent)' : s === step ? 'var(--primary)' : 'var(--secondary)', color: s <= step ? '#fff' : 'var(--muted-foreground)' }}
            >
              {s < step ? <CheckCircle2 size={13} /> : s}
            </span>
            <span className="text-xs font-semibold mx-2" style={{ color: s === step ? 'var(--primary)' : 'var(--muted-foreground)' }}>{label}</span>
            {i < labels.length - 1 && <span className="w-4 h-px mr-2" style={{ background: 'var(--border)' }} />}
          </li>
        )
      })}
    </ol>
  )
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-black mb-2" style={{ ...display, color: 'var(--primary)', letterSpacing: '-0.02em' }}>{title}</h1>
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
    </div>
  )
}

export function DemoHint({ children, onUse, label = 'Use demo account' }: { children: React.ReactNode; onUse: () => void; label?: string }) {
  return (
    <div className="rounded-xl px-4 py-3 mb-6 flex items-center gap-3" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
      <p className="text-xs flex-1" style={{ color: 'var(--muted-foreground)' }}>
        <strong style={{ color: 'var(--primary)' }}>Demo:</strong> {children}
      </p>
      <button type="button" onClick={onUse} className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0" style={{ ...display, background: 'var(--accent)', color: '#fff' }}>
        {label}
      </button>
    </div>
  )
}

export const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim())

/** Shown after sign-up when the account must be confirmed by email first. */
export function CheckEmail({ email, signInPath }: { email: string; signInPath: string }) {
  const navigate = useNavigate()
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
        <MailCheck size={38} color="#fff" />
      </div>
      <div>
        <h1 className="text-2xl font-black mb-2" style={{ ...display, color: 'var(--primary)' }}>Check your email</h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          We sent a confirmation link to <strong style={{ color: 'var(--foreground)' }}>{email}</strong>. Open it on this device to finish setting up your account.
        </p>
      </div>
      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Can’t find it? Check your spam folder.</p>
      <Button variant="secondary" onClick={() => navigate(signInPath)}>I’ve confirmed. Sign in</Button>
    </div>
  )
}
