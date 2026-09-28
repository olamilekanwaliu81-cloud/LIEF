import { Link, useNavigate } from 'react-router'
import { ArrowRight, CheckCircle2, TrendingUp, Lightbulb, Shield, Globe, LineChart } from 'lucide-react'
import { useAnimatedCounter } from '../hooks/useAnimatedCounter'
import { useStore } from '../lib/store'
import { homeFor } from '../App'
import { LEGAL_LINKS } from './Settings'
import { Logo, display } from './ui'

// Nigerian family / school images
const IMG_NIGERIAN_FAMILY = 'https://images.unsplash.com/photo-1783378991404-759601c30595?w=900&h=1100&fit=crop&auto=format&q=85'
const IMG_KID_WRITING     = 'https://images.unsplash.com/photo-1554721299-e0b8aa7666ce?w=700&h=700&fit=crop&auto=format'
const IMG_STUDENTS_LAGOS  = 'https://images.unsplash.com/photo-1783378996092-6b6d4962c270?w=900&h=600&fit=crop&auto=format'
const IMG_STUDENTS_READ   = 'https://images.unsplash.com/photo-1603394336952-3628e17d3920?w=700&h=500&fit=crop&auto=format'

function AnimatedStat({ target, suffix = '', label }: { target: number; suffix?: string; label: string }) {
  const val = useAnimatedCounter(target)
  return (
    <div className="text-center">
      <p className="text-3xl lg:text-4xl font-black tabular-nums" style={{ ...display, color: 'var(--primary)' }}>{val}{suffix}</p>
      <p className="text-xs lg:text-sm mt-1 leading-snug" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
    </div>
  )
}

const features = [
  { icon: TrendingUp,   t: 'success', title: 'Track Progress',         desc: "See your child's academic journey across every subject over time — not just the final grade." },
  { icon: CheckCircle2, t: 'info',    title: 'Understand Performance', desc: 'Clear signals for strengths and areas needing attention — without jargon or diagnosis.' },
  { icon: Lightbulb,    t: 'warning', title: '"How Can I Help?"',      desc: "Practical, actionable guidance you can use at home — linked directly to your child's data." },
  { icon: LineChart,    t: 'purple',  title: 'Monitor Improvement',    desc: 'Watch whether your support is making a difference, week by week.' },
] as const

const container = 'max-w-6xl mx-auto px-5 sm:px-8'

export default function Landing() {
  const { session } = useStore()
  const navigate = useNavigate()
  const go = (path: string) => () => navigate(path)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-20 border-b" style={{ background: 'color-mix(in srgb, var(--background) 92%, transparent)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
        <div className={`${container} flex items-center justify-between py-4`}>
          <Link to="/" aria-label="LEIF home"><Logo /></Link>
          <div className="flex items-center gap-1 sm:gap-2">
            {session ? (
              <button onClick={go(homeFor[session.role])} className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5" style={{ ...display, background: 'var(--primary)', color: '#fff' }}>
                Open LEIF <ArrowRight size={15} />
              </button>
            ) : (
              <>
                <Link to="/teacher/signin" className="hidden md:inline px-3 py-2 rounded-xl text-sm font-bold" style={{ ...display, color: 'var(--muted-foreground)' }}>For teachers</Link>
                <Link to="/signin" className="px-3 sm:px-4 py-2 rounded-xl text-sm font-bold" style={{ ...display, color: 'var(--primary)' }}>Sign in</Link>
                <Link to="/signup" className="px-4 py-2 rounded-xl text-sm font-bold" style={{ ...display, background: 'var(--primary)', color: '#fff' }}>Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: 'var(--hero)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 lg:w-[34rem] lg:h-[34rem] rounded-full opacity-10 pointer-events-none" style={{ background: 'var(--accent)', transform: 'translate(40%, -40%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10 pointer-events-none" style={{ background: '#5BA4CF', transform: 'translate(-40%, 40%)' }} />

        {/* Floating decorative shapes */}
        <div aria-hidden>
          <div className="anim-float absolute pointer-events-none" style={{ top: '18%', left: '6%', opacity: 0.22 }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <rect x="4" y="4" width="30" height="30" rx="4" fill="#fff"/>
              <rect x="9" y="10" width="14" height="2" rx="1" fill="#1ABF96"/>
              <rect x="9" y="15" width="10" height="2" rx="1" fill="#1ABF96" opacity=".6"/>
              <rect x="9" y="20" width="12" height="2" rx="1" fill="#1ABF96" opacity=".4"/>
              <rect x="19" y="4" width="2" height="30" rx="1" fill="#1ABF96" opacity=".3"/>
            </svg>
          </div>
          <div className="anim-pulse absolute pointer-events-none" style={{ top: '12%', right: '18%', opacity: 0.28, animationDelay: '0.4s' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2l2.94 8.06L24 10.84l-6 5.48 1.76 8.1L14 20.5l-5.76 3.92L10 16.32 4 10.84l7.06-.78z" fill="#1ABF96"/>
            </svg>
          </div>
          <div className="anim-float-rev absolute pointer-events-none" style={{ bottom: '22%', left: '10%', opacity: 0.20, animationDelay: '0.8s' }}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <rect x="13" y="3" width="8" height="22" rx="2" fill="#fff"/>
              <polygon points="13,25 21,25 17,31" fill="#1ABF96"/>
              <rect x="13" y="3" width="8" height="5" rx="2" fill="#E97B2E"/>
            </svg>
          </div>
          <div className="anim-float absolute pointer-events-none" style={{ top: '55%', right: '8%', opacity: 0.25, animationDelay: '1.2s' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="8" cy="8" r="4" fill="#1ABF96"/>
              <circle cx="24" cy="8" r="3" fill="#fff"/>
              <circle cx="8" cy="24" r="3" fill="#fff"/>
              <circle cx="24" cy="24" r="4" fill="#1ABF96"/>
            </svg>
          </div>
          <div className="anim-spin-slow absolute pointer-events-none" style={{ top: '30%', right: '5%', opacity: 0.18 }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <ellipse cx="20" cy="18" rx="16" ry="5" fill="#fff"/>
              <polygon points="20,6 36,18 20,18 4,18" fill="#fff" opacity=".7"/>
              <rect x="19" y="18" width="2" height="10" rx="1" fill="#1ABF96"/>
              <circle cx="20" cy="28" r="2" fill="#E97B2E"/>
            </svg>
          </div>
          <div className="anim-float-rev absolute pointer-events-none" style={{ bottom: '30%', right: '20%', opacity: 0.18, animationDelay: '1.6s' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 22,12 12,22 2,12" fill="#1ABF96"/>
            </svg>
          </div>
        </div>

        <div className={`relative ${container} pt-12 lg:pt-20 flex flex-col lg:flex-row lg:items-end lg:gap-12`}>
          <div className="flex-1 pb-12 lg:pb-20 anim-fade-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4 lg:mb-6" style={{ ...display, color: '#fff', letterSpacing: '-0.02em' }}>
              Your child's academic progress,{' '}
              <span style={{ color: 'var(--accent)' }}>finally clear.</span>
            </h1>
            <p className="text-base lg:text-lg leading-relaxed mb-8 max-w-xl" style={{ color: 'rgba(255,255,255,0.72)' }}>
              LEIF helps parents move beyond report cards. See where your child is now, how they've been progressing, where they need attention, and exactly what you can do to help.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.98]" style={{ ...display, background: 'var(--accent)', color: '#fff' }}>
                Create free account <ArrowRight size={17} />
              </Link>
              <Link to="/signin" className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base transition-all" style={{ ...display, background: 'rgba(255,255,255,0.10)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.20)' }}>
                Sign in
              </Link>
            </div>
            <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Are you a learner? <Link to="/learner/signin" className="font-bold underline" style={{ color: 'rgba(255,255,255,0.8)' }}>Sign in here</Link>
            </p>
          </div>

          <div className="flex-shrink-0 self-center lg:self-end flex justify-center lg:justify-end">
            <div className="relative overflow-hidden w-[280px] h-[400px] lg:w-[360px] lg:h-[480px]" style={{ borderRadius: '20px 20px 0 0', boxShadow: '0 -12px 60px rgba(0,0,0,0.4)' }}>
              <img src={IMG_NIGERIAN_FAMILY} alt="Nigerian mother and child at home" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(to top, var(--hero), transparent)' }} />
              <div className="absolute bottom-4 left-3 right-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(13,43,85,0.82)', backdropFilter: 'blur(10px)' }}>
                <p className="text-xs font-bold text-white" style={display}>Connected to every step of your child's journey</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Animated stats ── */}
      <section className="py-10 lg:py-14" style={{ background: 'var(--secondary)' }}>
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-3 gap-4 lg:gap-10">
          <AnimatedStat target={90} suffix="%" label="of parents want multi-year progress history" />
          <AnimatedStat target={43} label="research participants across parent & guardian groups" />
          <AnimatedStat target={5} suffix="+" label="Nigerian school classes supported at launch" />
        </div>
      </section>

      {/* ── Photo collage ── */}
      <section className={`${container} py-12 lg:py-20 w-full grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-16`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)', ...display }}>Built for real families</p>
          <h2 className="text-2xl lg:text-4xl font-black mb-4" style={{ ...display, color: 'var(--primary)', letterSpacing: '-0.01em' }}>
            Every child learns.<br />Every parent wants to help.
          </h2>
          <p className="text-sm lg:text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            LEIF gives you a clearer picture of how your child is doing — and practical ways to support them, whatever your schedule.
          </p>
        </div>
        <div className="grid grid-cols-5 grid-rows-2 gap-3 h-[260px] lg:h-[380px]">
          <div className="col-span-3 row-span-2 rounded-2xl overflow-hidden" style={{ background: 'var(--secondary)' }}>
            <img src={IMG_STUDENTS_LAGOS} alt="Nigerian school students in Lagos" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="col-span-2 row-span-1 rounded-2xl overflow-hidden" style={{ background: 'var(--muted)' }}>
            <img src={IMG_KID_WRITING} alt="Child writing in notebook" loading="lazy" className="w-full h-full object-cover object-center" />
          </div>
          <div className="col-span-2 row-span-1 rounded-2xl overflow-hidden" style={{ background: 'var(--muted)' }}>
            <img src={IMG_STUDENTS_READ} alt="Students reading together" loading="lazy" className="w-full h-full object-cover object-top" />
          </div>
        </div>
      </section>

      {/* ── What LEIF does ── */}
      <section className={`${container} pb-12 lg:pb-20 w-full`}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)', ...display }}>What LEIF does</p>
        <h2 className="text-2xl lg:text-4xl font-black mb-8" style={{ ...display, color: 'var(--primary)' }}>Academic support, made simple for parents.</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, t, title, desc }, i) => (
            <div key={title} className="flex lg:flex-col items-start gap-4 rounded-2xl p-4 lg:p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `var(--${t}-bg)` }}>
                <Icon size={18} style={{ color: `var(--${t})` }} />
              </div>
              <div>
                <p className="font-bold text-sm mb-1" style={{ ...display, color: 'var(--primary)' }}>{i + 1}. {title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Full-width family banner ── */}
      <section className={`${container} pb-12 lg:pb-20 w-full`}>
        <div className="relative rounded-2xl overflow-hidden h-[220px] lg:h-[300px]" style={{ background: 'var(--hero)' }}>
          <img src={IMG_NIGERIAN_FAMILY} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover object-center opacity-40" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(13,43,85,0.93) 55%, rgba(13,43,85,0.2))' }} />
          <div className="relative h-full flex flex-col justify-center px-6 lg:px-12">
            <p className="text-xl lg:text-3xl font-black text-white mb-1 leading-snug" style={display}>Be there for every step<br />of their journey.</p>
            <p className="text-sm lg:text-base mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>LEIF keeps you connected to your child's academic world.</p>
            <Link to="/signup" className="self-start flex items-center gap-1.5 text-xs lg:text-sm font-bold px-4 py-2 lg:py-2.5 rounded-xl transition-all hover:opacity-90" style={{ background: 'var(--accent)', color: '#fff', ...display }}>
              Start free <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Teacher section ── */}
      <section className="py-12 lg:py-20" style={{ background: 'var(--hero)', borderTop: '4px solid var(--accent)' }}>
        <div className={`${container} grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-16`}>
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mb-5" style={{ background: 'rgba(26,191,150,0.18)', color: 'var(--accent)', ...display }}>For Teachers</span>
            <h2 className="text-2xl lg:text-4xl font-black text-white mb-2 leading-snug" style={{ ...display, letterSpacing: '-0.01em' }}>Teachers power the platform.</h2>
            <p className="text-sm lg:text-base mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Upload student performance, flag areas of concern, and add notes — parents see exactly what you share, clearly and without jargon.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Upload subject scores', 'Flag weak areas', 'Mark strengths', 'Add term notes', 'School ID login'].map(pill => (
                <span key={pill} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.85)', ...display }}>{pill}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={go('/teacher/signup')} className="flex flex-col items-start gap-2 rounded-2xl p-4 lg:p-6 text-left transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: 'var(--accent)', color: '#fff' }}>
                <div>
                  <p className="font-black text-sm lg:text-base" style={display}>New teacher?</p>
                  <p className="text-xs mt-0.5 opacity-80">Register with your school ID</p>
                </div>
                <span className="text-xs font-bold flex items-center gap-1 mt-1" style={display}>Sign up <ArrowRight size={11} /></span>
              </button>
              <button onClick={go('/teacher/signin')} className="flex flex-col items-start gap-2 rounded-2xl p-4 lg:p-6 text-left transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: 'rgba(255,255,255,0.10)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.18)' }}>
                <div>
                  <p className="font-black text-sm lg:text-base" style={display}>Returning teacher?</p>
                  <p className="text-xs mt-0.5 opacity-60">Sign in to your portal</p>
                </div>
                <span className="text-xs font-bold flex items-center gap-1 mt-1" style={{ ...display, color: 'var(--accent)' }}>Sign in <ArrowRight size={11} /></span>
              </button>
            </div>
            <p className="text-xs mt-5 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>Teacher access is verified by your school-assigned ID number. No public registration.</p>
          </div>
        </div>
      </section>

      {/* ── Built for parents ── */}
      <section className={`${container} py-12 lg:py-20 w-full`}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)', ...display }}>Built for</p>
        <h2 className="text-2xl lg:text-4xl font-black mb-6" style={{ ...display, color: 'var(--primary)' }}>Built for parents.</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-5">
          <PersonaCard name="Amaka" context="A parent with limited time who needs a quick view of her child's progress and clear next steps." need="Quick performance view · clear attention areas · practical actions" />
          <PersonaCard name="Alhaji Bello" context="A parent who wants to support his child's education without depending on expensive private tutoring." need="Accessible support · clear academic needs · home activities" />
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="py-8" style={{ background: 'var(--secondary)', borderTop: '1px solid var(--border)' }}>
        <div className={`${container} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-10`}>
          {[[Globe, 'Nigeria-first design'], [Shield, 'Privacy-first · parent-controlled'], [CheckCircle2, 'No unsupported AI diagnosis']].map(([Icon, label]) => {
            const I = Icon as React.ElementType
            return (
              <div key={label as string} className="flex items-center gap-2">
                <I size={15} style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{label as string}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-5 py-16 lg:py-24 text-center max-w-2xl mx-auto w-full">
        <h2 className="text-3xl lg:text-5xl font-black mb-3" style={{ ...display, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
          Start understanding <span style={{ color: 'var(--accent)' }}>today.</span>
        </h2>
        <p className="text-sm lg:text-base mb-8" style={{ color: 'var(--muted-foreground)' }}>Create your free parent account in under 2 minutes.</p>
        <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.98]" style={{ ...display, background: 'var(--primary)', color: '#fff' }}>
          Get started free <ArrowRight size={17} />
        </Link>
        <p className="mt-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Already have an account? <Link to="/signin" className="font-bold underline" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className="py-6 border-t" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
        <div className={`${container} flex flex-col gap-4`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Logo size="sm" />
            <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
              {LEGAL_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} className="text-xs font-semibold hover:underline" style={{ color: 'var(--muted-foreground)' }}>{label}</Link>
              ))}
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>© {new Date().getFullYear()} LEIF. All rights reserved. Parent & Child Academic Support Platform.</p>
        </div>
      </footer>
    </div>
  )
}

function PersonaCard({ name, context, need }: { name: string; context: string; need: string }) {
  return (
    <div className="rounded-2xl p-4 lg:p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm" style={{ background: 'var(--primary)', color: '#fff', ...display }}>{name[0]}</div>
        <p className="font-bold text-sm" style={{ ...display, color: 'var(--primary)' }}>{name}</p>
      </div>
      <p className="text-xs lg:text-sm mb-2 leading-snug" style={{ color: 'var(--muted-foreground)' }}>{context}</p>
      <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{need}</p>
    </div>
  )
}
