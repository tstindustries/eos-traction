import { useStore } from '../store'
import { Button, Card, EmptyState, Page, Pill } from '../components/ui'
import {
  daysBetween,
  fmtDate,
  onTarget,
  quarterOf,
  today,
  weekEndingFor,
} from '../lib/util'
import { Stat, statusPill } from './Rocks'

export default function Dashboard() {
  const s = useStore()
  const enterSampleMode = useStore((st) => st.enterSampleMode)
  const q = quarterOf(today(), s.settings.fyStartMonth)
  const week = weekEndingFor(today(), s.settings.weekEndsOn)

  const rocks = s.rocks.filter((r) => r.quarter === q.key)
  const rocksDone = rocks.filter((r) => r.status === 'done').length
  const rocksOff = rocks.filter((r) => r.status === 'off-track').length
  const daysLeft = Math.max(0, daysBetween(today(), q.end))

  const scored = s.measurables
    .map((m) => onTarget(m, m.values[week]))
    .filter((v): v is boolean => v !== null)
  const hits = scored.filter(Boolean).length

  const openIssues = s.issues.filter((i) => !i.solvedAt)
  const openTodos = s.todos.filter((t) => !t.done)
  const overdue = openTodos.filter((t) => daysBetween(today(), t.due) < 0)

  const isEmpty =
    !s.rocks.length && !s.measurables.length && !s.people.length && !s.vto.coreValues.length

  if (isEmpty)
    return (
      <Page title="Welcome" subtitle="Everything here is stored on this device only.">
        <Card>
          <div className="space-y-4 p-5">
            <p className="text-sm">
              This is the Entrepreneurial Operating System from <em>Traction</em>, as an app. If you
              have not read the book, the <strong>Guide</strong> explains every piece and the order to
              fill it in — and every <span className="font-semibold">?</span> in the app explains that
              specific concept.
            </p>
            <Button variant="primary" onClick={() => (window.location.hash = '#/guide')}>
              Read the guide first
            </Button>
            <p className="text-sm">Or jump straight in:</p>
            <ol className="space-y-2 text-sm text-muted">
              <li>
                <strong className="text-ink">1.</strong> Add your people, then answer the eight
                questions on the V/TO.
              </li>
              <li>
                <strong className="text-ink">2.</strong> Set 3–7 rocks for the quarter and 5–15 weekly
                numbers on the scorecard.
              </li>
              <li>
                <strong className="text-ink">3.</strong> Run a Level 10 meeting on the same day every
                week.
              </li>
            </ol>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={() => (window.location.hash = '#/people')}>Add your team</Button>
              <Button onClick={() => (window.location.hash = '#/vto')}>Start the V/TO</Button>
            </div>
            <div className="rounded-lg border border-line bg-surface-2 p-3">
              <p className="text-sm font-medium">Not sure what any of this looks like filled in?</p>
              <p className="mt-1 text-sm text-muted">
                Sample mode loads a fictional company — full V/TO, seven rocks, thirteen weeks of
                scorecard history and three past meetings. Your own data is set aside and comes back
                untouched when you leave.
              </p>
              <Button className="mt-3" onClick={enterSampleMode}>
                Explore sample company
              </Button>
            </div>
          </div>
        </Card>
      </Page>
    )

  return (
    <Page
      title={q.label}
      subtitle={`${daysLeft} days left in the quarter · week ending ${fmtDate(week)}`}
      actions={
        <Button variant="primary" onClick={() => (window.location.hash = '#/l10')}>
          Run Level 10
        </Button>
      }
    >
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Rocks done"
          value={`${rocksDone}/${rocks.length}`}
          tone={rocks.length && rocksDone === rocks.length ? 'good' : undefined}
          hint={rocksOff ? `${rocksOff} off track` : rocks.length ? 'all on track' : 'none set'}
        />
        <Stat
          label="Scorecard"
          value={scored.length ? `${hits}/${scored.length}` : '—'}
          tone={scored.length ? (hits === scored.length ? 'good' : 'bad') : undefined}
          hint="on target this week"
        />
        <Stat
          label="Open issues"
          value={String(openIssues.length)}
          hint={`${openIssues.filter((i) => i.term === 'short').length} short term`}
        />
        <Stat
          label="To-dos"
          value={String(openTodos.length)}
          tone={overdue.length ? 'bad' : undefined}
          hint={overdue.length ? `${overdue.length} overdue` : 'none overdue'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title={`Rocks · ${q.label}`}
          right={
            <Button size="sm" variant="ghost" onClick={() => (window.location.hash = '#/rocks')}>
              Open
            </Button>
          }
        >
          {rocks.length === 0 ? (
            <EmptyState
              action={
                <Button size="sm" variant="primary" onClick={() => (window.location.hash = '#/rocks')}>
                  Set rocks
                </Button>
              }
            >
              No rocks for this quarter.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {rocks.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {r.title || 'Untitled rock'}
                    <span className="block text-xs text-muted">
                      {s.people.find((p) => p.id === r.ownerId)?.name ?? 'Unassigned'}
                    </span>
                  </span>
                  {statusPill(r.status)}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Off-target measurables"
          right={
            <Button size="sm" variant="ghost" onClick={() => (window.location.hash = '#/scorecard')}>
              Open
            </Button>
          }
        >
          {(() => {
            const misses = s.measurables.filter((m) => onTarget(m, m.values[week]) === false)
            const blank = s.measurables.filter(
              (m) => m.values[week] === null || m.values[week] === undefined,
            )
            if (!s.measurables.length) return <EmptyState>No measurables yet.</EmptyState>
            if (!misses.length)
              return (
                <EmptyState>
                  {blank.length
                    ? `${blank.length} number${blank.length === 1 ? '' : 's'} still to enter for this week.`
                    : 'Every number on target this week.'}
                </EmptyState>
              )
            return (
              <ul className="divide-y divide-line">
                {misses.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {m.name}
                      <span className="block text-xs text-muted">
                        {s.people.find((p) => p.id === m.ownerId)?.name ?? 'Unassigned'}
                      </span>
                    </span>
                    <Pill tone="bad">
                      {m.values[week]} vs {m.goal}
                    </Pill>
                  </li>
                ))}
              </ul>
            )
          })()}
        </Card>

        <Card
          title="Top three issues"
          right={
            <Button size="sm" variant="ghost" onClick={() => (window.location.hash = '#/issues')}>
              Open
            </Button>
          }
        >
          {openIssues.length === 0 ? (
            <EmptyState>Nothing on the issues list.</EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {openIssues
                .slice()
                .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
                .slice(0, 3)
                .map((i) => (
                  <li key={i.id} className="flex items-center gap-2 px-4 py-2.5 text-sm">
                    {i.priority && <Pill tone="brand">{i.priority}</Pill>}
                    <span className="min-w-0 flex-1 truncate">{i.text}</span>
                  </li>
                ))}
            </ul>
          )}
        </Card>

        <Card
          title="To-dos due"
          right={
            <Button size="sm" variant="ghost" onClick={() => (window.location.hash = '#/todos')}>
              Open
            </Button>
          }
        >
          {openTodos.length === 0 ? (
            <EmptyState>Nothing outstanding.</EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {openTodos
                .slice()
                .sort((a, b) => (a.due < b.due ? -1 : 1))
                .slice(0, 5)
                .map((t) => {
                  const late = daysBetween(today(), t.due) < 0
                  return (
                    <li key={t.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <span className="min-w-0 flex-1 truncate">{t.text}</span>
                      <span className={late ? 'shrink-0 text-xs text-bad' : 'shrink-0 text-xs text-muted'}>
                        {fmtDate(t.due)}
                      </span>
                    </li>
                  )
                })}
            </ul>
          )}
        </Card>
      </div>
    </Page>
  )
}
