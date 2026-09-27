const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const todayISO = () => toISODate(new Date())

export function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parse(iso: string) {
  // Date-only strings are parsed as local dates, timestamps as-is.
  return iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso)
}

/** "Sep 18, 2026" */
export function formatDate(iso: string) {
  const d = parse(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

/** "Sep 18" */
export function formatShortDate(iso: string) {
  const d = parse(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** "Monday 22 Sep 2026" */
export function formatLongDate(iso: string) {
  const d = parse(iso)
  const day = d.toLocaleDateString('en-GB', { weekday: 'long' })
  return `${day} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function monthLabel(iso: string) {
  return MONTHS[parse(iso).getMonth()]
}

/** "2 hours ago", "Yesterday", "Sep 13" */
export function timeAgo(iso: string) {
  const diff = Date.now() - parse(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return formatShortDate(iso)
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export const initials = (name: string) =>
  name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
