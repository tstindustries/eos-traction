import { useStore } from '../store'
import type { Person, Rating } from '../types'
import {
  AddRow,
  Button,
  Card,
  EmptyState,
  IconButton,
  Input,
  Page,
  Pill,
  TrashIcon,
} from '../components/ui'
import { clsx } from '../lib/util'
import { InfoTip } from '../components/InfoTip'

const RATINGS: Rating[] = ['+', '+/-', '-']

/** The bar: at least three "+" and no more than one "-", plus GWC all yes. */
function assess(person: Person, valueCount: number) {
  const scores = Object.values(person.values)
  const plus = scores.filter((r) => r === '+').length
  const minus = scores.filter((r) => r === '-').length
  const gwcAll = Object.values(person.gwc).every((v) => v === true)
  const gwcAnswered = Object.values(person.gwc).every((v) => v !== null)
  const valuesOk = valueCount > 0 && plus >= Math.max(3, Math.ceil(valueCount * 0.6)) && minus <= 1
  return { plus, minus, gwcAll, gwcAnswered, valuesOk, aboveBar: valuesOk && gwcAll }
}

function PersonCard({ person }: { person: Person }) {
  const coreValues = useStore((s) => s.vto.coreValues)
  const { updatePerson, removePerson } = useStore()
  const a = assess(person, coreValues.length)

  const setValue = (cvId: string, rating: Rating) =>
    updatePerson(person.id, { values: { ...person.values, [cvId]: rating } })

  return (
    <Card as="li" className="p-3 sm:p-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Input
            value={person.name}
            onChange={(e) => updatePerson(person.id, { name: e.target.value })}
            className="border-transparent bg-transparent px-0 py-0 font-display text-base"
            placeholder="Name"
          />
          <Input
            value={person.title}
            onChange={(e) => updatePerson(person.id, { title: e.target.value })}
            className="border-transparent bg-transparent px-0 py-0 text-xs text-muted"
            placeholder="Seat or title"
          />
        </div>
        {coreValues.length > 0 &&
          (a.aboveBar ? (
            <Pill tone="good">Right person, right seat</Pill>
          ) : a.valuesOk ? (
            <Pill tone="warn">Right person, wrong seat</Pill>
          ) : (
            <Pill tone="bad">Below the bar</Pill>
          ))}
        <IconButton label={`Remove ${person.name}`} onClick={() => removePerson(person.id)}>
          <TrashIcon />
        </IconButton>
      </div>

      {coreValues.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Add core values on the V/TO first — they are what you rate people against.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {coreValues.map((cv) => (
            <li key={cv.id} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm">{cv.text || 'Untitled value'}</span>
              <div className="flex shrink-0 gap-1">
                {RATINGS.map((r) => {
                  const on = person.values[cv.id] === r
                  return (
                    <button
                      key={r}
                      onClick={() => setValue(cv.id, r)}
                      aria-label={`${cv.text}: ${r}`}
                      aria-pressed={on}
                      className={clsx(
                        'h-7 w-9 rounded-md border text-xs font-bold transition-colors',
                        on
                          ? r === '+'
                            ? 'border-good bg-good text-white'
                            : r === '-'
                              ? 'border-bad bg-bad text-white'
                              : 'border-warn bg-warn text-white'
                          : 'border-line text-muted hover:border-brand',
                      )}
                    >
                      {r}
                    </button>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3">
        {(
          [
            ['gets', 'Gets it'],
            ['wants', 'Wants it'],
            ['capacity', 'Capacity'],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-xs font-medium text-muted">
              {label}
              {key === 'gets' && <InfoTip id="gwc" />}
            </span>
            {[true, false].map((v) => (
              <button
                key={String(v)}
                onClick={() =>
                  updatePerson(person.id, {
                    gwc: { ...person.gwc, [key]: person.gwc[key] === v ? null : v },
                  })
                }
                aria-pressed={person.gwc[key] === v}
                className={clsx(
                  'h-7 w-8 rounded-md border text-xs font-bold transition-colors',
                  person.gwc[key] === v
                    ? v
                      ? 'border-good bg-good text-white'
                      : 'border-bad bg-bad text-white'
                    : 'border-line text-muted hover:border-brand',
                )}
              >
                {v ? 'Y' : 'N'}
              </button>
            ))}
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function PeopleScreen() {
  const people = useStore((s) => s.people)
  const coreValues = useStore((s) => s.vto.coreValues)
  const addPerson = useStore((s) => s.addPerson)

  const above = people.filter((p) => assess(p, coreValues.length).aboveBar).length

  return (
    <Page
      title="People Analyzer"
      tip="peopleAnalyzer"
      subtitle="Rate everyone against your core values, then ask GWC: do they get it, want it, and have the capacity to do it?"
    >
      <AddRow className="mb-4" placeholder="Add someone…" onAdd={(name) => addPerson(name)} />

      {people.length > 0 && coreValues.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <Pill tone={above === people.length ? 'good' : 'warn'}>
            {above}/{people.length} right person, right seat
          </Pill>
          <span className="inline-flex items-center gap-1.5 text-muted">
            The bar: mostly “+” on values, no more than one “−”, and yes to all three of GWC.
            <InfoTip id="theBar" />
          </span>
        </div>
      )}

      {people.length === 0 ? (
        <Card>
          <EmptyState>
            Add your leadership team first, then everyone who reports to them. Owners appear in every
            other tool once they are here.
          </EmptyState>
        </Card>
      ) : (
        <ul className="space-y-3">
          {people.map((p) => (
            <PersonCard key={p.id} person={p} />
          ))}
        </ul>
      )}

      {coreValues.length === 0 && people.length > 0 && (
        <Card className="mt-4">
          <EmptyState
            action={
              <Button variant="primary" size="sm" onClick={() => (window.location.hash = '#/vto')}>
                Add core values
              </Button>
            }
          >
            You need core values before this tool can tell you anything.
          </EmptyState>
        </Card>
      )}
    </Page>
  )
}
