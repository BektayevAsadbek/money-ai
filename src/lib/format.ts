export const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** 12480000 → "12 480 000" (non-breaking spaces so amounts never wrap). */
export function fmt(n: number): string {
  const abs = Math.round(Math.abs(n))
  return abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** Signed amount using a real minus sign, as in the design: "−186 400", "+8 200 000". */
export function signed(n: number): string {
  if (n === 0) return '0'
  return (n < 0 ? '−' : '+') + fmt(n)
}

/** 5340000 → "5,34 mln" */
export function compact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return (abs / 1_000_000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',') + ' mln'
  if (abs >= 1_000) return Math.round(abs / 1_000) + ' ming'
  return String(abs)
}

export const monthName = (d: Date) => cap(MONTHS[d.getMonth()])

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso)
  const y = new Date(now); y.setDate(now.getDate() - 1)
  const base = `${d.getDate()}-${MONTHS[d.getMonth()]}`
  if (sameDay(d, now)) return `Bugun, ${base}`
  if (sameDay(d, y)) return `Kecha, ${base}`
  return base
}

export function time(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Short relative label used in transaction rows: "14:32" today, "kecha", or "28-sentabr". */
export function shortWhen(iso: string, now = new Date()) {
  const d = new Date(iso)
  const y = new Date(now); y.setDate(now.getDate() - 1)
  if (sameDay(d, now)) return time(iso)
  if (sameDay(d, y)) return 'kecha'
  return `${d.getDate()}-${MONTHS[d.getMonth()]}`
}

export const longDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${time(iso)}`
}

export const dayMonth = (iso: string) => {
  const d = new Date(iso)
  return `${d.getDate()}-${MONTHS[d.getMonth()]}`
}

export const daysLeftInMonth = (now = new Date()) =>
  new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()

export const uid = () => Math.random().toString(36).slice(2, 10)
