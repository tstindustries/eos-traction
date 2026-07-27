import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { GLOSSARY, type GlossaryKey } from '../lib/glossary'
import { clsx } from '../lib/util'

/**
 * A small "why does this exist" affordance for people who have not read the
 * book. Click-to-open rather than hover, so it works the same on a phone.
 *
 * Rendered through a portal: several ancestors use backdrop-blur, which creates
 * a containing block and would otherwise clip a fixed-position popover.
 */
export function InfoTip({ id, className }: { id: GlossaryKey; className?: string }) {
  const entry = GLOSSARY[id]
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 320, arrow: 16, above: false })

  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const btn = btnRef.current
      if (!btn) return
      const r = btn.getBoundingClientRect()
      const margin = 12
      const width = Math.min(340, window.innerWidth - margin * 2)
      const panelH = panelRef.current?.offsetHeight ?? 180
      // Prefer below; flip above when there is not room.
      const above = r.bottom + panelH + 10 > window.innerHeight && r.top - panelH - 10 > 0
      const left = Math.min(
        Math.max(margin, r.left + r.width / 2 - width / 2),
        window.innerWidth - width - margin,
      )
      setPos({
        top: above ? r.top - panelH - 8 : r.bottom + 8,
        left,
        width,
        arrow: Math.min(Math.max(10, r.left + r.width / 2 - left), width - 20),
        above,
      })
    }
    place()
    // Re-place after the panel has real height, then track scroll/resize.
    const raf = requestAnimationFrame(place)
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!panelRef.current?.contains(t) && !btnRef.current?.contains(t)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`What is ${entry.term}?`}
        className={clsx(
          'no-print inline-grid h-[1.15em] w-[1.15em] shrink-0 translate-y-[0.02em] place-items-center rounded-full border text-[0.62em] font-bold transition-colors',
          open
            ? 'border-brand bg-brand text-white'
            : 'border-line-strong text-muted hover:border-brand hover:text-brand',
          className,
        )}
      >
        ?
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={entry.term}
            className="fixed z-[60] rounded-xl border border-line bg-surface p-3.5 text-left shadow-xl"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <span
              className="absolute h-2.5 w-2.5 rotate-45 border-line bg-surface"
              style={{
                left: pos.arrow,
                ...(pos.above
                  ? { bottom: -6, borderRight: '1px solid', borderBottom: '1px solid' }
                  : { top: -6, borderLeft: '1px solid', borderTop: '1px solid' }),
              }}
            />
            <p className="font-display text-[0.95rem] leading-tight font-semibold">{entry.term}</p>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink">{entry.what}</p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">
              <span className="font-semibold text-ink">Why it matters. </span>
              {entry.why}
            </p>
            {entry.rule && (
              <p className="mt-2.5 rounded-lg bg-brand-soft px-2.5 py-2 text-[0.78rem] leading-relaxed text-brand">
                <span className="font-semibold">Rule of thumb. </span>
                {entry.rule}
              </p>
            )}
            <a
              href="#/guide"
              onClick={() => setOpen(false)}
              className="mt-2.5 inline-block text-[0.75rem] font-medium text-muted hover:text-brand"
            >
              More context in the Guide →
            </a>
          </div>,
          document.body,
        )}
    </>
  )
}

/** Card/section heading with a tip attached. Keeps call sites tidy. */
export function TitleWithTip({ children, tip }: { children: React.ReactNode; tip: GlossaryKey }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <InfoTip id={tip} />
    </span>
  )
}
