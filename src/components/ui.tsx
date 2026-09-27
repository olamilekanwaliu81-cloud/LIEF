import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react'
import { CheckCircle2, Eye, EyeOff, Info, X, AlertTriangle } from 'lucide-react'
import type { PerformanceStatus } from '../lib/types'

export const display = { fontFamily: 'Quicksand, sans-serif' } as const

// ── Tones ────────────────────────────────────────────────────────────────
export type Tone = 'success' | 'warning' | 'caution' | 'info' | 'purple' | 'neutral'

export const tone = (t: Tone) => t === 'neutral'
  ? { color: 'var(--muted-foreground)', bg: 'var(--secondary)', border: 'var(--border)' }
  : { color: `var(--${t})`, bg: `var(--${t}-bg)`, border: `var(--${t}-border)` }

export const statusConfig: Record<PerformanceStatus, { label: string; tone: Tone }> = {
  excellent:         { label: 'Excellent',       tone: 'success' },
  good:              { label: 'Good',            tone: 'info' },
  average:           { label: 'Average',         tone: 'purple' },
  'needs-attention': { label: 'Needs Attention', tone: 'caution' },
  critical:          { label: 'Critical',        tone: 'warning' },
}

export const scoreTone = (score: number): Tone => (score >= 70 ? 'success' : score >= 50 ? 'caution' : 'warning')

// ── Brand ────────────────────────────────────────────────────────────────
export function Logo({ size = 'md', light }: { size?: 'sm' | 'md' | 'lg'; light?: boolean }) {
  const cls = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'
  return (
    <span className={`${cls} font-black shrink-0`} style={{ ...display, color: light ? '#fff' : 'var(--primary)', letterSpacing: '-0.04em' }}>
      LEIF
    </span>
  )
}

// ── Buttons ──────────────────────────────────────────────────────────────
type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'outline'

const variantStyle: Record<Variant, React.CSSProperties> = {
  primary:   { background: 'var(--primary)', color: '#fff' },
  accent:    { background: 'var(--accent)', color: '#fff' },
  secondary: { background: 'var(--secondary)', color: 'var(--secondary-foreground)' },
  ghost:     { background: 'transparent', color: 'var(--primary)' },
  danger:    { background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning-border)' },
  outline:   { background: 'var(--surface)', color: 'var(--foreground)', border: '1.5px solid var(--border)' },
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  block?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, block, className = '', style, children, disabled, ...rest }: ButtonProps) {
  const sizing = size === 'sm' ? 'px-3 py-1.5 text-xs rounded-lg' : size === 'lg' ? 'px-6 py-3.5 text-base rounded-xl' : 'px-4 py-2.5 text-sm rounded-xl'
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 ${sizing} ${block ? 'w-full' : ''} ${className}`}
      style={{ ...display, ...variantStyle[variant], ...style }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ── Form fields ──────────────────────────────────────────────────────────
interface FieldProps {
  label: string
  error?: string
  hint?: string
  aside?: React.ReactNode
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => React.ReactNode
}

export function Field({ label, error, hint, aside, children }: FieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-xs font-bold" style={{ ...display, color: 'var(--primary)' }}>{label}</label>
        {aside}
      </div>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error && <p id={`${id}-err`} role="alert" className="text-xs font-semibold mt-1.5" style={{ color: 'var(--warning)' }}>{error}</p>}
      {!error && hint && <p id={`${id}-hint`} className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>{hint}</p>}
    </div>
  )
}

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  error?: string
  hint?: string
  aside?: React.ReactNode
  onChange: (value: string) => void
}

export function TextField({ label, error, hint, aside, onChange, className = '', ...rest }: TextFieldProps) {
  return (
    <Field label={label} error={error} hint={hint} aside={aside}>
      {p => <input {...rest} {...p} onChange={e => onChange(e.target.value)} className={`field ${className}`} />}
    </Field>
  )
}

export function PasswordField({ label, error, hint, aside, onChange, value, placeholder, autoComplete = 'current-password' }: {
  label: string; error?: string; hint?: string; aside?: React.ReactNode
  value: string; onChange: (v: string) => void; placeholder?: string; autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <Field label={label} error={error} hint={hint} aside={aside}>
      {p => (
        <div className="relative">
          <input
            {...p}
            type={show ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="field pr-12"
          />
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      )}
    </Field>
  )
}

export function SelectField({ label, error, hint, value, onChange, children }: {
  label: string; error?: string; hint?: string; value: string; onChange: (v: string) => void; children: React.ReactNode
}) {
  return (
    <Field label={label} error={error} hint={hint}>
      {p => (
        <select {...p} value={value} onChange={e => onChange(e.target.value)} className="field" style={{ color: value ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
          {children}
        </select>
      )}
    </Field>
  )
}

// ── Layout pieces ────────────────────────────────────────────────────────
export function Card({ children, className = '', style, as: As = 'div' }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; as?: 'div' | 'section' }) {
  return <As className={`rounded-2xl ${className}`} style={{ background: 'var(--card)', border: '1px solid var(--border)', ...style }}>{children}</As>
}

export function PageHeader({ title, subtitle, eyebrow, action, icon }: {
  title: string; subtitle?: React.ReactNode; eyebrow?: string; action?: React.ReactNode; icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        {eyebrow && <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{eyebrow}</p>}
        <h1 className="text-2xl lg:text-3xl font-black mt-0.5 flex items-center gap-2" style={{ ...display, color: 'var(--primary)' }}>
          {icon}{title}
        </h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function SectionTitle({ icon, children, color = 'var(--muted-foreground)', action }: {
  icon?: React.ReactNode; children: React.ReactNode; color?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span style={{ color }} className="flex">{icon}</span>}
      <h2 className="text-sm font-bold uppercase tracking-widest flex-1" style={{ ...display, color }}>{children}</h2>
      {action}
    </div>
  )
}

export function Pill({ children, t = 'neutral', className = '' }: { children: React.ReactNode; t?: Tone; className?: string }) {
  const c = tone(t)
  return <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${className}`} style={{ background: c.bg, color: c.color }}>{children}</span>
}

export function Callout({ t = 'info', icon, title, children }: { t?: Tone; icon?: React.ReactNode; title?: string; children: React.ReactNode }) {
  const c = tone(t)
  return (
    <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <span className="mt-0.5 shrink-0 flex" style={{ color: c.color }}>{icon ?? <Info size={16} />}</span>
      <div className="text-xs leading-relaxed min-w-0" style={{ color: 'var(--foreground)' }}>
        {title && <p className="font-bold mb-0.5" style={{ ...display, color: c.color }}>{title}</p>}
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="mx-auto mb-3 w-fit" style={{ color: 'var(--border)' }}>{icon}</div>
      <p className="text-sm font-bold" style={{ ...display, color: 'var(--foreground)' }}>{title}</p>
      {body && <p className="text-xs mt-1 max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="w-11 h-6 rounded-full transition-all flex items-center px-0.5 shrink-0"
      style={{ background: checked ? 'var(--accent)' : 'var(--border)' }}
    >
      <span className="w-5 h-5 rounded-full bg-white shadow transition-all" style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  )
}

export function Segmented<T extends string>({ options, value, onChange, label }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string
}) {
  return (
    <div role="tablist" aria-label={label} className="flex rounded-xl p-1 gap-1" style={{ background: 'var(--secondary)' }}>
      {options.map(o => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className="flex-1 py-2 px-2 rounded-lg text-sm font-bold transition-all"
            style={{
              ...display,
              background: active ? 'var(--surface)' : 'transparent',
              color: active ? 'var(--primary)' : 'var(--muted-foreground)',
              boxShadow: active ? '0 1px 4px var(--shadow)' : 'none',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Chip({ active, onClick, children, activeColor = 'var(--primary)' }: { active: boolean; onClick: () => void; children: React.ReactNode; activeColor?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-bold transition-all inline-flex items-center"
      style={{ ...display, background: active ? activeColor : 'var(--secondary)', color: active ? '#fff' : 'var(--muted-foreground)' }}
    >
      {children}
    </button>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, description, children, wide }: {
  open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode; wide?: boolean
}) {
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])')?.focus())
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previous?.focus()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(13,43,85,0.55)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full ${wide ? 'sm:max-w-lg' : 'sm:max-w-sm'} max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6 relative anim-toast safe-bottom`}
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <button data-close onClick={onClose} aria-label="Close" className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full" style={{ color: 'var(--muted-foreground)' }}>
          <X size={18} />
        </button>
        <h2 id={titleId} className="text-lg font-black mb-1 pr-8" style={{ ...display, color: 'var(--primary)' }}>{title}</h2>
        {description && <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{description}</p>}
        {children}
      </div>
    </div>
  )
}

// ── Toasts ───────────────────────────────────────────────────────────────
interface Toast { id: number; message: string; t: 'success' | 'info' | 'warning' }
const ToastContext = createContext<(message: string, t?: Toast['t']) => void>(() => {})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((message: string, t: Toast['t'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, t }])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 3200)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="fixed z-[60] bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {toasts.map(x => (
          <div key={x.id} className="anim-toast rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-lg text-sm font-semibold pointer-events-auto" style={{ background: 'var(--hero)', color: '#fff' }}>
            {x.t === 'success' ? <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} /> : x.t === 'warning' ? <AlertTriangle size={16} style={{ color: 'var(--warning-strong)' }} /> : <Info size={16} style={{ color: '#6DB6EE' }} />}
            {x.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

/** Trigger a JSON download — used for the parent's data export (privacy control). */
export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
