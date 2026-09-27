import { useState, useEffect } from 'react'
import { Lightbulb, Clock, ChevronDown, ChevronUp, BookOpen, HelpCircle } from 'lucide-react'
import { subjects, supportGuidance } from '../data/child'

interface Props {
  selectedConcern: string | null
  onClearConcern: () => void
}

export default function Support({ selectedConcern, onClearConcern }: Props) {
  const [activeSubject, setActiveSubject] = useState<string>(selectedConcern ?? 'Mathematics')
  const [expandedAction, setExpandedAction] = useState<number | null>(0)

  useEffect(() => {
    if (selectedConcern) {
      setActiveSubject(selectedConcern)
      onClearConcern()
    }
  }, [selectedConcern])

  const guidance = supportGuidance[activeSubject]

  return (
    <div className="px-4 pt-5 pb-4 space-y-5 w-full">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb size={18} style={{ color: 'var(--accent)' }} />
          <h1 className="text-2xl font-black" style={{ fontFamily: 'Quicksand, sans-serif', color: 'var(--primary)' }}>
            How Can I Help?
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Practical steps you can take at home to support Amara.
        </p>
      </div>

      {/* Subject selector */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>
          Select subject
        </p>
        <div className="flex gap-2 flex-wrap">
          {subjects.map(s => (
            <button
              key={s.name}
              onClick={() => setActiveSubject(s.name)}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                fontFamily: 'Quicksand, sans-serif',
                background: activeSubject === s.name ? 'var(--primary)' : 'var(--secondary)',
                color: activeSubject === s.name ? '#fff' : 'var(--muted-foreground)',
              }}
            >
              {s.name}
              {s.status === 'concern' && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-orange-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {guidance ? (
        <>
          {/* Concern context */}
          <div
            className="rounded-xl p-4"
            style={{
              background: guidance.subject === 'Mathematics' ? '#FFF4EC' : '#EEF9F5',
              border: `1px solid ${guidance.subject === 'Mathematics' ? '#F5C5A0' : '#A8EDDA'}`,
            }}
          >
            <div className="flex items-start gap-3">
              <HelpCircle size={16} className="mt-0.5 shrink-0" style={{ color: guidance.subject === 'Mathematics' ? '#E97B2E' : 'var(--accent)' }} />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                {guidance.concern}
              </p>
            </div>
          </div>

          {/* Action list */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>
              Suggested actions
            </p>
            <div className="space-y-2">
              {guidance.actions.map((action, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid var(--border)', background: '#fff' }}
                >
                  <button
                    onClick={() => setExpandedAction(expandedAction === i ? null : i)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                    style={{ background: expandedAction === i ? 'var(--muted)' : '#fff' }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                      style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'Quicksand, sans-serif' }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: 'var(--primary)', fontFamily: 'Quicksand, sans-serif' }}>
                        {action.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={11} style={{ color: 'var(--muted-foreground)' }} />
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{action.time}</span>
                      </div>
                    </div>
                    {expandedAction === i ? (
                      <ChevronUp size={15} style={{ color: 'var(--muted-foreground)' }} />
                    ) : (
                      <ChevronDown size={15} style={{ color: 'var(--muted-foreground)' }} />
                    )}
                  </button>
                  {expandedAction === i && (
                    <div
                      className="px-4 pb-4 pt-1"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                        {action.description}
                      </p>
                      <button
                        className="mt-3 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                        style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'Quicksand, sans-serif' }}
                      >
                        Mark as trying ✓
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress note */}
          <div
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
          >
            <BookOpen size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--primary)', fontFamily: 'Quicksand, sans-serif' }}>
                Sample data note
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Guidance is linked to Amara's current academic scores. This prototype uses representative data — real guidance will draw from actual class performance.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Lightbulb size={36} className="mx-auto mb-3" style={{ color: 'var(--border)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            Select a subject above to see guidance.
          </p>
        </div>
      )}
    </div>
  )
}
