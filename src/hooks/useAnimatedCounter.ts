import { useState, useEffect, useRef } from 'react'

export function useAnimatedCounter(target: number, duration = 1800, startOnMount = true) {
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!startOnMount || started.current) return
    started.current = true
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, startOnMount])

  return value
}
