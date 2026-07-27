import { useEffect, useRef, useState, type ReactNode } from 'react'
import { clsx } from '../lib/util'
import type { GlossaryKey } from '../lib/glossary'
import { InfoTip } from './InfoTip'

/* -------------------------------- layout -------------------------------- */

export function Page({
  title,
  subtitle,
  actions,
  children,
  wide,
  tip,
}: {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  wide?: boolean
  tip?: GlossaryKey
}) {
  return (
    <div className={clsx('mx-auto w-full px-4 pt-5 pb-28 sm:px-6 sm:pt-8 lg:pb-12 print-full', wide ? 'max-w-[1600px]' : 'max-w-5xl')}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 font-display text-2xl leading-tight tracking-tight sm:text-[2rem]">
            {title}
            {tip && <InfoTip id={tip} />}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  )
}

export function Card({
  children,
  className,
  title,
  right,
  as: As = 'section',
}: {
  children?: ReactNode
  className?: string
  title?: ReactNode
  right?: ReactNode
  as?: 'section' | 'div' | 'li'
}) {
  return (
    <As
      className={clsx(
        'rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] print-block',
        className,
      )}
    >
      {(title || right) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-[0.78rem] font-semibold tracking-[0.09em] text-muted uppercase">
            {title}
          </h2>
          {right && <div className="no-print shrink-0">{right}</div>}
        </div>
      )}
      {children}
    </As>
  )
}

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-2 text-[0.78rem] font-semibold tracking-[0.09em] text-muted uppercase">
    {children}
  </h2>
)

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm text-muted">{children}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  )
}

/* -------------------------------- controls ------------------------------- */

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'default' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'default', size = 'md', className, ...rest }: BtnProps) {
  const base =
    'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-45 select-none'
  const sizes = { sm: 'h-8 px-2.5 text-[0.8rem]', md: 'h-10 px-3.5 text-sm' }
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    default: 'border border-line bg-surface text-ink hover:bg-surface-2',
    ghost: 'text-muted hover:bg-surface-2 hover:text-ink',
    danger: 'border border-transparent bg-bad-soft text-bad hover:brightness-95',
  }
  return <button className={clsx(base, sizes[size], variants[variant], className)} {...rest} />
}

export function IconButton({
  label,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink',
        className,
      )}
      {...rest}
    />
  )
}

const fieldCls =
  'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none'

export const Input = ({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={clsx(fieldCls, className)} {...rest} />
)

export const Select = ({ className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={clsx(fieldCls, 'appearance-none bg-surface pr-8', className)} {...rest} />
)

/** Textarea that grows with its content — no inner scrollbars while writing. */
export function Textarea({
  className,
  value,
  minRows = 2,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { minRows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      rows={minRows}
      value={value}
      className={clsx(fieldCls, 'resize-none leading-relaxed', className)}
      {...rest}
    />
  )
}

export function Field({
  label,
  hint,
  children,
  className,
  tip,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
  tip?: GlossaryKey
}) {
  return (
    <label className={clsx('block', className)}>
      <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-ink">
        {label}
        {tip && <InfoTip id={tip} />}
      </span>
      {hint && <span className="mb-1.5 block text-xs text-muted">{hint}</span>}
      {children}
    </label>
  )
}

/* --------------------------------- bits --------------------------------- */

export function Pill({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: 'neutral' | 'good' | 'bad' | 'warn' | 'brand'
  children: ReactNode
  className?: string
}) {
  const tones = {
    neutral: 'bg-surface-2 text-muted',
    good: 'bg-good-soft text-good',
    bad: 'bg-bad-soft text-bad',
    warn: 'bg-warn-soft text-warn',
    brand: 'bg-brand-soft text-brand',
  }
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.72rem] font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border transition-colors',
        checked ? 'border-brand bg-brand text-white' : 'border-line-strong hover:border-brand',
      )}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <path d="M2 6.2 4.6 8.8 10 3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

/** Segmented control. Keeps option sets compact and thumb-friendly. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = 'md',
  className,
}: {
  value: T
  options: { value: T; label: string; tone?: 'good' | 'bad' | 'warn' }[]
  onChange: (v: T) => void
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div
      className={clsx(
        'inline-flex shrink-0 rounded-lg border border-line bg-surface-2 p-0.5',
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value
        const activeTone =
          o.tone === 'good'
            ? 'bg-good text-white'
            : o.tone === 'bad'
              ? 'bg-bad text-white'
              : o.tone === 'warn'
                ? 'bg-warn text-white'
                : 'bg-surface text-ink shadow-sm'
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={clsx(
              'rounded-[6px] font-medium transition-colors',
              size === 'sm' ? 'px-2 py-1 text-[0.75rem]' : 'px-3 py-1.5 text-[0.82rem]',
              active ? activeTone : 'text-muted hover:text-ink',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Inline "add item" row: type, press Enter, keep going. */
export function AddRow({
  placeholder,
  onAdd,
  className,
  autoFocus,
}: {
  placeholder: string
  onAdd: (text: string) => void
  className?: string
  autoFocus?: boolean
}) {
  const [text, setText] = useState('')
  const submit = () => {
    const t = text.trim()
    if (!t) return
    onAdd(t)
    setText('')
  }
  return (
    <form
      className={clsx('flex gap-2', className)}
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <Input
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
      />
      <Button type="submit" variant="primary" disabled={!text.trim()}>
        Add
      </Button>
    </form>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-label={title}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl border border-line bg-surface shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="font-display text-lg">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </IconButton>
        </div>
        <div className="thin-scroll flex-1 overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-line px-4 py-3">{footer}</div>
        )}
      </div>
    </div>
  )
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M4 6h12M8 6V4.5h4V6m-6 0 .6 9.5h6.8L15 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9}>
      <path d="M10 4.5v11M4.5 10h11" strokeLinecap="round" />
    </svg>
  )
}

/** Owner picker used across rocks, measurables, issues and to-dos. */
export function OwnerSelect({
  value,
  people,
  onChange,
  className,
}: {
  value: string | null
  people: { id: string; name: string }[]
  onChange: (id: string | null) => void
  className?: string
}) {
  return (
    <Select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={className}
      aria-label="Owner"
    >
      <option value="">Unassigned</option>
      {people.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </Select>
  )
}
