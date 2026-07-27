import { useMemo, useState } from 'react'
import { useStore } from '../store'
import type { Comparator, Measurable } from '../types'
import {
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  Input,
  Modal,
  OwnerSelect,
  Page,
  Pill,
  Select,
} from '../components/ui'
import {
  addDays,
  clsx,
  comparatorLabel,
  fmtDate,
  onTarget,
  rollingWeeks,
  today,
  weekEndingFor,
} from '../lib/util'

const WEEK_COUNT = 13

/** One numeric cell. Red/green comes straight from the goal comparison. */
function ValueCell({
  m,
  week,
  autoFocus,
}: {
  m: Measurable
  week: string
  autoFocus?: boolean
}) {
  const setWeekValue = useStore((s) => s.setWeekValue)
  const raw = m.values[week]
  const [draft, setDraft] = useState<string | null>(null)
  const hit = onTarget(m, raw)

  const shown = draft ?? (raw === null || raw === undefined ? '' : String(raw))

  return (
    <input
      inputMode="decimal"
      autoFocus={autoFocus}
      value={shown}
      aria-label={`${m.name}, week ending ${fmtDate(week)}`}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft === null) return
        const t = draft.replace(/[$,%\s,]/g, '')
        setWeekValue(m.id, week, t === '' ? null : Number(t))
        setDraft(null)
      }}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      className={clsx(
        'h-9 w-full rounded-md border px-1 text-center text-[0.8rem] font-medium tabular-nums outline-none transition-colors focus:border-brand',
        hit === true && 'border-transparent bg-good-soft text-good',
        hit === false && 'border-transparent bg-bad-soft text-bad',
        hit === null && 'border-line bg-surface text-muted',
      )}
    />
  )
}

function MeasurableModal({
  id,
  onClose,
}: {
  id: string | null
  onClose: () => void
}) {
  const m = useStore((s) => s.measurables.find((x) => x.id === id))
  const people = useStore((s) => s.people)
  const { updateMeasurable, removeMeasurable } = useStore()
  if (!m) return null

  return (
    <Modal
      open
      onClose={onClose}
      title="Measurable"
      footer={
        <>
          <Button
            variant="danger"
            onClick={() => {
              removeMeasurable(m.id)
              onClose()
            }}
          >
            Delete
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Measurable" tip="measurable">
          <Input
            autoFocus
            value={m.name}
            onChange={(e) => updateMeasurable(m.id, { name: e.target.value })}
            placeholder="e.g. Demos booked"
          />
        </Field>
        <Field label="Who" hint="One person is accountable for the number — not a team.">
          <OwnerSelect
            value={m.ownerId}
            people={people}
            onChange={(ownerId) => updateMeasurable(m.id, { ownerId })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Format">
            <Select
              value={m.format}
              onChange={(e) =>
                updateMeasurable(m.id, { format: e.target.value as Measurable['format'] })
              }
            >
              <option value="number">Number</option>
              <option value="currency">Currency</option>
              <option value="percent">Percent</option>
            </Select>
          </Field>
          <Field label="Goal is" tip="goalComparator">
            <Select
              value={m.comparator}
              onChange={(e) =>
                updateMeasurable(m.id, { comparator: e.target.value as Comparator })
              }
            >
              <option value=">=">At least</option>
              <option value="<=">At most</option>
              <option value="=">Exactly</option>
              <option value="between">Between</option>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Goal">
            <Input
              inputMode="decimal"
              value={String(m.goal)}
              onChange={(e) => updateMeasurable(m.id, { goal: Number(e.target.value) || 0 })}
            />
          </Field>
          {m.comparator === 'between' && (
            <Field label="Upper bound">
              <Input
                inputMode="decimal"
                value={m.goalMax === null ? '' : String(m.goalMax)}
                onChange={(e) =>
                  updateMeasurable(m.id, {
                    goalMax: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
              />
            </Field>
          )}
        </div>
      </div>
    </Modal>
  )
}

/** This-week entry list — compact enough to run through on a phone during L10. */
export function WeekEntry({ week }: { week: string }) {
  const measurables = useStore((s) => s.measurables)
  const people = useStore((s) => s.people)
  if (!measurables.length)
    return <EmptyState>No measurables yet — add them on the Scorecard.</EmptyState>

  return (
    <ul className="divide-y divide-line">
      {measurables.map((m) => (
        <li key={m.id} className="flex items-center gap-3 px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{m.name || 'Untitled'}</p>
            <p className="text-xs text-muted">
              {people.find((p) => p.id === m.ownerId)?.name ?? 'Unassigned'} ·{' '}
              {comparatorLabel(m.comparator, m.goal, m.goalMax)}
            </p>
          </div>
          <div className="w-24 shrink-0">
            <ValueCell m={m} week={week} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function ScorecardScreen() {
  const weekEndsOn = useStore((s) => s.settings.weekEndsOn)
  const measurables = useStore((s) => s.measurables)
  const people = useStore((s) => s.people)
  const { addMeasurable, reorderMeasurable } = useStore()
  const [editing, setEditing] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)

  const anchor = useMemo(
    () => addDays(weekEndingFor(today(), weekEndsOn), offset * 7 * WEEK_COUNT),
    [offset, weekEndsOn],
  )

  const weeks = useMemo(() => rollingWeeks(WEEK_COUNT, weekEndsOn, anchor), [anchor, weekEndsOn])
  const currentWeek = weekEndingFor(today(), weekEndsOn)

  const weekScore = (week: string) => {
    const scored = measurables
      .map((m) => onTarget(m, m.values[week]))
      .filter((v): v is boolean => v !== null)
    return scored.length ? { hit: scored.filter(Boolean).length, of: scored.length } : null
  }
  const latest = weekScore(currentWeek)

  return (
    <Page
      wide
      title="Scorecard"
      tip="scorecard"
      subtitle={`${WEEK_COUNT} weeks · week ending ${fmtDate(weeks[weeks.length - 1])}`}
      actions={
        <>
          <div className="flex items-center gap-1 rounded-lg border border-line bg-surface px-1">
            <IconButton label="Earlier weeks" onClick={() => setOffset(offset - 1)}>
              ‹
            </IconButton>
            <span className="px-1 text-xs font-semibold text-muted">
              {offset === 0 ? 'Current' : `${offset * WEEK_COUNT}w`}
            </span>
            <IconButton
              label="Later weeks"
              disabled={offset >= 0}
              onClick={() => setOffset(Math.min(0, offset + 1))}
            >
              ›
            </IconButton>
          </div>
          <Button variant="primary" onClick={() => setEditing(addMeasurable().id)}>
            Add measurable
          </Button>
        </>
      }
    >
      {latest && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <Pill tone={latest.hit === latest.of ? 'good' : latest.hit === 0 ? 'bad' : 'warn'}>
            {latest.hit}/{latest.of} on target
          </Pill>
          <span className="text-muted">week ending {fmtDate(currentWeek)}</span>
        </div>
      )}

      {measurables.length === 0 ? (
        <Card>
          <EmptyState
            action={
              <Button variant="primary" onClick={() => setEditing(addMeasurable().id)}>
                Add the first measurable
              </Button>
            }
          >
            A scorecard is 5–15 weekly numbers, each owned by one person. Add the handful that tell
            you whether the week went well.
          </EmptyState>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-surface-2">
                  <th className="sticky left-0 z-20 min-w-[13rem] border-r border-line bg-surface-2 px-3 py-2 text-left text-[0.7rem] font-semibold tracking-[0.08em] text-muted uppercase">
                    Measurable
                  </th>
                  <th className="min-w-[4.5rem] px-2 py-2 text-right text-[0.7rem] font-semibold tracking-[0.08em] text-muted uppercase">
                    Goal
                  </th>
                  {weeks.map((w) => (
                    <th
                      key={w}
                      className={clsx(
                        'min-w-[4.25rem] px-1 py-2 text-center text-[0.68rem] font-semibold',
                        w === currentWeek ? 'bg-brand-soft text-brand' : 'text-muted',
                      )}
                    >
                      {fmtDate(w, { month: 'numeric', day: 'numeric' })}
                    </th>
                  ))}
                  <th className="w-10 no-print" />
                </tr>
              </thead>
              <tbody>
                {measurables.map((m, i) => (
                  <tr key={m.id} className="border-t border-line">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-r border-line bg-surface px-3 py-2 text-left font-normal"
                    >
                      <button
                        onClick={() => setEditing(m.id)}
                        className="block max-w-[16rem] truncate text-sm font-medium hover:text-brand"
                      >
                        {m.name || 'Untitled measurable'}
                      </button>
                      <span className="text-xs text-muted">
                        {people.find((p) => p.id === m.ownerId)?.name ?? 'Unassigned'}
                      </span>
                    </th>
                    <td className="px-2 py-2 text-right text-xs font-semibold whitespace-nowrap text-muted tabular-nums">
                      {comparatorLabel(m.comparator, m.goal, m.goalMax)}
                    </td>
                    {weeks.map((w) => (
                      <td key={w} className="px-1 py-1.5">
                        <ValueCell m={m} week={w} />
                      </td>
                    ))}
                    <td className="no-print px-1">
                      <div className="flex flex-col">
                        <IconButton
                          label="Move up"
                          className="h-5 w-6"
                          disabled={i === 0}
                          onClick={() => reorderMeasurable(m.id, -1)}
                        >
                          <span className="text-xs">▲</span>
                        </IconButton>
                        <IconButton
                          label="Move down"
                          className="h-5 w-6"
                          disabled={i === measurables.length - 1}
                          onClick={() => reorderMeasurable(m.id, 1)}
                        >
                          <span className="text-xs">▼</span>
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-line-strong bg-surface-2">
                  <th className="sticky left-0 z-10 border-r border-line bg-surface-2 px-3 py-2 text-left text-[0.7rem] font-semibold tracking-[0.08em] text-muted uppercase">
                    On target
                  </th>
                  <td />
                  {weeks.map((w) => {
                    const s = weekScore(w)
                    return (
                      <td
                        key={w}
                        className={clsx(
                          'px-1 py-2 text-center text-[0.72rem] font-semibold tabular-nums',
                          !s ? 'text-muted' : s.hit === s.of ? 'text-good' : 'text-bad',
                        )}
                      >
                        {s ? `${s.hit}/${s.of}` : '—'}
                      </td>
                    )
                  })}
                  <td className="no-print" />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {measurables.length > 0 && (
        <div className="mt-5 lg:hidden">
          <Card title={`This week · ${fmtDate(currentWeek)}`}>
            <WeekEntry week={currentWeek} />
          </Card>
          <p className="mt-2 px-1 text-xs text-muted">
            Tap a measurable name in the grid above to change its goal or owner.
          </p>
        </div>
      )}

      {editing && <MeasurableModal id={editing} onClose={() => setEditing(null)} />}
    </Page>
  )
}
