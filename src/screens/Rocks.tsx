import { useState } from 'react'
import { useStore } from '../store'
import type { Rock, RockStatus } from '../types'
import {
  Button,
  Card,
  Checkbox,
  EmptyState,
  IconButton,
  Input,
  OwnerSelect,
  Page,
  Pill,
  Segmented,
  TrashIcon,
} from '../components/ui'
import type { GlossaryKey } from '../lib/glossary'
import { InfoTip } from '../components/InfoTip'
import {
  clsx,
  daysBetween,
  fmtDate,
  quarterFromKey,
  quarterOf,
  shiftQuarter,
  today,
} from '../lib/util'

export const STATUS_OPTIONS: { value: RockStatus; label: string; tone?: 'good' | 'bad' }[] = [
  { value: 'on-track', label: 'On track', tone: 'good' },
  { value: 'off-track', label: 'Off track', tone: 'bad' },
  { value: 'done', label: 'Done' },
]

export const statusPill = (s: RockStatus) =>
  s === 'done' ? (
    <Pill tone="brand">Done</Pill>
  ) : s === 'off-track' ? (
    <Pill tone="bad">Off track</Pill>
  ) : (
    <Pill tone="good">On track</Pill>
  )

/** A single rock. Used on the Rocks screen and inside the Level 10 meeting. */
export function RockCard({ rock, compact = false }: { rock: Rock; compact?: boolean }) {
  const people = useStore((s) => s.people)
  const { updateRock, removeRock, addMilestone, updateMilestone, removeMilestone } = useStore()
  const [open, setOpen] = useState(false)
  const [msText, setMsText] = useState('')

  const doneCount = rock.milestones.filter((m) => m.done).length

  return (
    <Card as="li" className="overflow-hidden">
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Input
              value={rock.title}
              onChange={(e) => updateRock(rock.id, { title: e.target.value })}
              placeholder="What has to be true by the end of the quarter?"
              className={clsx(
                'border-transparent bg-transparent px-0 py-0 text-[0.95rem] font-medium',
                rock.status === 'done' && 'text-muted line-through',
              )}
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <button
                onClick={() => updateRock(rock.id, { isCompany: !rock.isCompany })}
                className="font-medium text-brand hover:underline"
              >
                {rock.isCompany ? 'Company rock' : 'Individual rock'}
              </button>
              {rock.milestones.length > 0 && (
                <span>
                  {doneCount}/{rock.milestones.length} milestones
                </span>
              )}
            </div>
          </div>
          {compact ? (
            statusPill(rock.status)
          ) : (
            <IconButton label="Delete rock" onClick={() => removeRock(rock.id)}>
              <TrashIcon />
            </IconButton>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <OwnerSelect
            value={rock.ownerId}
            people={people}
            onChange={(id) => updateRock(rock.id, { ownerId: id })}
            className="h-9 w-auto min-w-36 flex-1 py-1 text-[0.82rem] sm:flex-none"
          />
          <Segmented
            size="sm"
            value={rock.status}
            options={STATUS_OPTIONS}
            onChange={(v) => updateRock(rock.id, { status: v })}
          />
          <button
            onClick={() => setOpen(!open)}
            className="ml-auto text-xs font-medium text-muted hover:text-ink"
          >
            {open ? 'Hide detail' : 'Milestones'}
          </button>
        </div>

        {open && (
          <div className="space-y-2 border-t border-line pt-3">
            {rock.milestones.map((m) => (
              <div key={m.id} className="flex items-start gap-2">
                <Checkbox
                  checked={m.done}
                  label={`Milestone: ${m.text}`}
                  onChange={(v) => updateMilestone(rock.id, m.id, { done: v })}
                />
                <input
                  value={m.text}
                  onChange={(e) => updateMilestone(rock.id, m.id, { text: e.target.value })}
                  className={clsx(
                    'min-w-0 flex-1 bg-transparent text-sm outline-none',
                    m.done && 'text-muted line-through',
                  )}
                />
                <input
                  type="date"
                  value={m.due}
                  onChange={(e) => updateMilestone(rock.id, m.id, { due: e.target.value })}
                  className="w-[7.5rem] shrink-0 rounded border border-line bg-surface px-1.5 py-1 text-xs text-muted"
                />
                <IconButton label="Remove milestone" onClick={() => removeMilestone(rock.id, m.id)}>
                  <TrashIcon />
                </IconButton>
              </div>
            ))}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (!msText.trim()) return
                addMilestone(rock.id, msText.trim(), quarterFromKey(rock.quarter).end)
                setMsText('')
              }}
            >
              <Input
                value={msText}
                onChange={(e) => setMsText(e.target.value)}
                placeholder="Add a milestone…"
                className="py-1.5 text-sm"
              />
              <Button type="submit" size="sm" disabled={!msText.trim()}>
                Add
              </Button>
            </form>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function RocksScreen() {
  const fy = useStore((s) => s.settings.fyStartMonth)
  const rocks = useStore((s) => s.rocks)
  const { addRock, copyRocksToQuarter } = useStore()
  const [quarter, setQuarter] = useState(() => quarterOf(today(), fy).key)

  const q = quarterFromKey(quarter, fy)
  const inQuarter = rocks.filter((r) => r.quarter === quarter)
  const company = inQuarter.filter((r) => r.isCompany)
  const individual = inQuarter.filter((r) => !r.isCompany)
  const done = inQuarter.filter((r) => r.status === 'done').length
  const off = inQuarter.filter((r) => r.status === 'off-track').length
  const daysLeft = Math.max(0, daysBetween(today(), q.end))

  const carryOver = () => {
    const prev = shiftQuarter(quarter, -1, fy)
    const n = copyRocksToQuarter(prev, quarter)
    if (!n) alert(`No unfinished rocks in ${quarterFromKey(prev, fy).label} to carry over.`)
  }

  return (
    <Page
      title="Rocks"
      tip="rocks"
      subtitle={`${fmtDate(q.start)} – ${fmtDate(q.end)} · ${daysLeft} days left in the quarter`}
      actions={
        <>
          <div className="flex items-center gap-1 rounded-lg border border-line bg-surface px-1">
            <IconButton label="Previous quarter" onClick={() => setQuarter(shiftQuarter(quarter, -1, fy))}>
              ‹
            </IconButton>
            <span className="min-w-[4.5rem] text-center text-sm font-semibold">{q.label}</span>
            <IconButton label="Next quarter" onClick={() => setQuarter(shiftQuarter(quarter, 1, fy))}>
              ›
            </IconButton>
          </div>
          <Button onClick={carryOver}>Carry over</Button>
          <Button variant="primary" onClick={() => addRock(quarter)}>
            Add rock
          </Button>
        </>
      }
    >
      {inQuarter.length > 0 && (
        <div className="mb-5 grid grid-cols-3 gap-3">
          <Stat label="Rocks" value={String(inQuarter.length)} />
          <Stat label="Done" value={`${done}`} tone={done === inQuarter.length ? 'good' : undefined} />
          <Stat label="Off track" value={`${off}`} tip="rockStatus" tone={off > 0 ? 'bad' : 'good'} />
        </div>
      )}

      {inQuarter.length === 0 ? (
        <Card>
          <EmptyState action={<Button variant="primary" onClick={() => addRock(quarter)}>Add the first rock</Button>}>
            No rocks for {q.label} yet. Pick 3–7 things that must get done this quarter — each with one
            owner.
          </EmptyState>
        </Card>
      ) : (
        <div className="space-y-6">
          <Group title={`Company rocks (${company.length})`} rocks={company} />
          {individual.length > 0 && (
            <Group title={`Individual rocks (${individual.length})`} rocks={individual} />
          )}
          {inQuarter.length > 7 && (
            <p className="text-xs text-muted">
              You have {inQuarter.length} rocks. Traction suggests 3–7 — more than that and priorities
              stop being priorities.
            </p>
          )}
        </div>
      )}
    </Page>
  )
}

function Group({ title, rocks }: { title: string; rocks: Rock[] }) {
  if (!rocks.length) return null
  return (
    <div>
      <h2 className="mb-2 text-[0.78rem] font-semibold tracking-[0.09em] text-muted uppercase">
        {title}
      </h2>
      <ul className="space-y-2.5">
        {rocks.map((r) => (
          <RockCard key={r.id} rock={r} />
        ))}
      </ul>
    </div>
  )
}

export function Stat({
  label,
  value,
  tone,
  hint,
  tip,
}: {
  label: string
  value: string
  tone?: 'good' | 'bad' | 'warn'
  hint?: string
  tip?: GlossaryKey
}) {
  const toneCls =
    tone === 'good' ? 'text-good' : tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : ''
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2.5 print-block">
      <p className="flex items-center gap-1 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase">
        {label}
        {tip && <InfoTip id={tip} />}
      </p>
      <p className={clsx('mt-0.5 font-display text-2xl leading-none', toneCls)}>{value}</p>
      {hint && <p className="mt-1 text-[0.7rem] text-muted">{hint}</p>}
    </div>
  )
}
