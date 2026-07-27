import type { Comparator, Measurable } from '../types'

export const uid = () =>
  Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4)

/* ------------------------------ dates ------------------------------ */
/** All date strings in the app are local `YYYY-MM-DD`. */

export const toISO = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Parse `YYYY-MM-DD` as a *local* date so no timezone drift occurs. */
export const fromISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export const today = () => toISO(new Date())

export const addDays = (iso: string, n: number) => {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const daysBetween = (a: string, b: string) =>
  Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86_400_000)

export const fmtDate = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  iso
    ? fromISO(iso).toLocaleDateString(undefined, opts ?? { month: 'short', day: 'numeric' })
    : ''

export const fmtLongDate = (iso: string) =>
  fmtDate(iso, { month: 'short', day: 'numeric', year: 'numeric' })

/* ----------------------------- quarters ---------------------------- */

export type Quarter = {
  /** e.g. `2026-Q3` */
  key: string
  label: string
  /** 1-4 */
  n: number
  fiscalYear: number
  start: string
  end: string
}

/** Fiscal quarter containing `iso`, given a fiscal-year start month (1-12). */
export function quarterOf(iso: string, fyStartMonth = 1): Quarter {
  const d = fromISO(iso)
  const monthIdx = d.getMonth() // 0-11
  const offset = (monthIdx - (fyStartMonth - 1) + 12) % 12
  const n = Math.floor(offset / 3) + 1
  const fiscalYear = monthIdx >= fyStartMonth - 1 ? d.getFullYear() : d.getFullYear() - 1
  const startMonthIdx = fyStartMonth - 1 + (n - 1) * 3
  const start = new Date(fiscalYear, startMonthIdx, 1)
  const end = new Date(fiscalYear, startMonthIdx + 3, 0)
  return {
    key: `${fiscalYear}-Q${n}`,
    label: `Q${n} ${fiscalYear}`,
    n,
    fiscalYear,
    start: toISO(start),
    end: toISO(end),
  }
}

export function quarterFromKey(key: string, fyStartMonth = 1): Quarter {
  const [yStr, qStr] = key.split('-Q')
  const fiscalYear = Number(yStr)
  const n = Number(qStr)
  const startMonthIdx = fyStartMonth - 1 + (n - 1) * 3
  return {
    key,
    label: `Q${n} ${fiscalYear}`,
    n,
    fiscalYear,
    start: toISO(new Date(fiscalYear, startMonthIdx, 1)),
    end: toISO(new Date(fiscalYear, startMonthIdx + 3, 0)),
  }
}

export const shiftQuarter = (key: string, by: number, fyStartMonth = 1) => {
  const [yStr, qStr] = key.split('-Q')
  const total = Number(yStr) * 4 + (Number(qStr) - 1) + by
  return quarterFromKey(`${Math.floor(total / 4)}-Q${(total % 4) + 1}`, fyStartMonth).key
}

/* ------------------------------ weeks ------------------------------ */

/** The week-ending date for the week containing `iso`. */
export function weekEndingFor(iso: string, weekEndsOn = 0) {
  const d = fromISO(iso)
  const diff = (weekEndsOn - d.getDay() + 7) % 7
  return addDays(iso, diff)
}

/** `count` week-ending dates, oldest first, ending with the current week. */
export function rollingWeeks(count: number, weekEndsOn = 0, from = today()) {
  const last = weekEndingFor(from, weekEndsOn)
  return Array.from({ length: count }, (_, i) => addDays(last, -7 * (count - 1 - i)))
}

/* --------------------------- measurables --------------------------- */

export const onTarget = (m: Measurable, value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null
  switch (m.comparator) {
    case '>=':
      return value >= m.goal
    case '<=':
      return value <= m.goal
    case '=':
      return value === m.goal
    case 'between':
      return value >= m.goal && value <= (m.goalMax ?? m.goal)
  }
}

export const comparatorLabel = (c: Comparator, goal: number, goalMax: number | null) =>
  c === 'between' ? `${goal}–${goalMax ?? goal}` : `${c} ${goal}`

export function fmtValue(m: Pick<Measurable, 'format'>, v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—'
  if (m.format === 'currency')
    return v >= 10_000 || v <= -10_000
      ? `$${Math.round(v / 1000).toLocaleString()}k`
      : `$${v.toLocaleString()}`
  if (m.format === 'percent') return `${v}%`
  return v.toLocaleString()
}

/* ------------------------------ misc ------------------------------- */

export const clsx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' ')

export const mmss = (secs: number) => {
  const s = Math.max(0, Math.round(secs))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
