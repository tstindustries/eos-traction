import { useEffect } from 'react'
import { useStore } from '../store'
import { SECTIONS, TOTAL_MINUTES, useMeeting } from '../lib/meeting'
import {
  AddRow,
  Button,
  Card,
  EmptyState,
  IconButton,
  Page,
  Pill,
  Textarea,
  TrashIcon,
} from '../components/ui'
import { clsx, fmtLongDate, mmss, quarterOf, today, uid, weekEndingFor } from '../lib/util'
import { InfoTip } from '../components/InfoTip'
import type { GlossaryKey } from '../lib/glossary'
import { WeekEntry } from './Scorecard'
import { RockCard } from './Rocks'
import { IssueList } from './Issues'
import { TodoList } from './Todos'

/** Which glossary entry explains each agenda section. */
const SECTION_TIP: Record<string, GlossaryKey> = {
  segue: 'segue',
  scorecard: 'scorecard',
  rocks: 'rockStatus',
  headlines: 'headlines',
  todos: 'todos',
  ids: 'ids',
  conclude: 'cascadingMessage',
}

export default function L10Screen() {
  const store = useStore()
  const m = useMeeting()
  const week = weekEndingFor(today(), store.settings.weekEndsOn)
  const quarter = quarterOf(today(), store.settings.fyStartMonth)

  useEffect(() => {
    if (!m.active || !m.running) return
    const id = setInterval(() => useMeeting.getState().tick(), 1000)
    return () => clearInterval(id)
  }, [m.active, m.running])

  if (!m.active) return <StartScreen />

  const section = SECTIONS[m.index]
  const spent = m.elapsed[section.key] ?? 0
  const over = spent > section.minutes * 60
  const totalSpent = Object.values(m.elapsed).reduce((a, b) => a + b, 0)

  const finish = () => {
    const solvedNow = store.issues
      .filter((i) => i.solvedAt && !m.issuesSolvedAtStart.includes(i.id))
      .map((i) => i.id)
    store.saveMeeting({
      id: uid(),
      date: today(),
      durations: m.elapsed,
      ratings: Object.entries(m.ratings).map(([personId, score]) => ({ personId, score })),
      headlines: store.headlines,
      cascading: m.cascading,
      issuesSolved: solvedNow,
      notes: m.notes,
    })
    m.stop()
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-4 pb-32 sm:px-6 lg:pb-12">
      {/* Sticky meeting clock */}
      <div className="sticky top-14 z-20 -mx-4 mb-4 border-b border-line bg-paper/95 px-4 pt-2 pb-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-semibold tracking-[0.1em] text-muted uppercase">
              {m.index + 1} of {SECTIONS.length} · {mmss(totalSpent)} of {TOTAL_MINUTES}:00
            </p>
            <p className="flex items-center gap-1.5 truncate font-display text-lg leading-tight">
              {section.label}
              <InfoTip id={SECTION_TIP[section.key]} />
            </p>
          </div>
          <button
            onClick={() => m.setRunning(!m.running)}
            className={clsx(
              'w-[5.5rem] rounded-lg px-2 py-2 text-center font-mono text-lg font-semibold tabular-nums',
              over ? 'bg-bad-soft text-bad' : m.running ? 'bg-brand-soft text-brand' : 'bg-surface-2 text-muted',
            )}
            title={m.running ? 'Pause' : 'Resume'}
          >
            {mmss(spent)}
          </button>
        </div>
        <div className="mt-2 flex gap-1">
          {SECTIONS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => m.goTo(i)}
              title={s.label}
              aria-label={s.label}
              className={clsx(
                'h-1.5 flex-1 rounded-full transition-colors',
                i === m.index ? 'bg-brand' : i < m.index ? 'bg-brand/40' : 'bg-line',
              )}
              style={{ flexGrow: s.minutes }}
            />
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-muted">{section.prompt}</p>

      {section.key === 'segue' && (
        <Card title="Notes">
          <div className="p-4">
            <Textarea
              minRows={5}
              value={m.notes}
              onChange={(e) => m.set({ notes: e.target.value })}
              placeholder="Anything worth remembering from the check-in…"
            />
          </div>
        </Card>
      )}

      {section.key === 'scorecard' && (
        <Card title={`Week ending ${fmtLongDate(week)}`}>
          <WeekEntry week={week} />
        </Card>
      )}

      {section.key === 'rocks' && <RockReview quarterKey={quarter.key} />}

      {section.key === 'headlines' && <Headlines />}

      {section.key === 'todos' && (
        <Card title="To-dos from last week">
          <TodoList />
        </Card>
      )}

      {section.key === 'ids' && (
        <div className="space-y-4">
          <Card title="Short-term issues">
            <IssueList term="short" emptyText="Nothing on the list. Add whatever came up above." />
          </Card>
          <AddIssue />
        </div>
      )}

      {section.key === 'conclude' && <Conclude onFinish={finish} />}

      {/* Bottom nav for the meeting itself */}
      <div className="fixed bottom-[3.85rem] left-0 z-20 flex w-full gap-2 border-t border-line bg-surface/95 px-4 py-2.5 backdrop-blur lg:bottom-0">
        <Button onClick={() => m.goTo(m.index - 1)} disabled={m.index === 0}>
          Back
        </Button>
        <Button variant="ghost" onClick={m.stop} className="px-2">
          Abandon
        </Button>
        {m.index < SECTIONS.length - 1 ? (
          <Button variant="primary" className="ml-auto flex-1 sm:flex-none" onClick={() => m.goTo(m.index + 1)}>
            Next · {SECTIONS[m.index + 1].label}
          </Button>
        ) : (
          <Button variant="primary" className="ml-auto flex-1 sm:flex-none" onClick={finish}>
            End meeting
          </Button>
        )}
      </div>
    </div>
  )
}

function StartScreen() {
  const meetings = useStore((s) => s.meetings)
  const issues = useStore((s) => s.issues)
  const removeMeeting = useStore((s) => s.removeMeeting)
  const people = useStore((s) => s.people)
  const start = useMeeting((s) => s.start)

  const avg = (ratings: { score: number }[]) =>
    ratings.length ? (ratings.reduce((a, r) => a + r.score, 0) / ratings.length).toFixed(1) : '—'

  return (
    <Page
      title="Level 10 Meeting"
      tip="l10"
      subtitle={`Same day, same time, same agenda, 90 minutes. ${TOTAL_MINUTES} minutes of structure.`}
      actions={
        <Button
          variant="primary"
          onClick={() => start(issues.filter((i) => i.solvedAt).map((i) => i.id))}
        >
          Start meeting
        </Button>
      }
    >
      <Card title={<>The agenda <InfoTip id="meetingPulse" /></>} className="mb-5">
        <ul className="divide-y divide-line">
          {SECTIONS.map((s) => (
            <li key={s.key} className="flex items-baseline gap-3 px-4 py-3">
              <span className="w-10 shrink-0 font-mono text-sm font-semibold text-brand tabular-nums">
                {s.minutes}m
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="mt-0.5 text-xs text-muted">{s.prompt}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title={`Past meetings (${meetings.length})`}>
        {meetings.length === 0 ? (
          <EmptyState>No meetings recorded yet. Run one and it lands here with its ratings.</EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {meetings.map((mt) => (
              <li key={mt.id} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{fmtLongDate(mt.date)}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {mt.issuesSolved.length} issue{mt.issuesSolved.length === 1 ? '' : 's'} solved
                    {mt.cascading && ' · has a cascading message'}
                  </p>
                  {mt.ratings.length > 0 && (
                    <p className="mt-1 text-xs text-muted">
                      {mt.ratings
                        .map(
                          (r) =>
                            `${people.find((p) => p.id === r.personId)?.name ?? '—'} ${r.score}`,
                        )
                        .join(' · ')}
                    </p>
                  )}
                </div>
                <Pill tone={Number(avg(mt.ratings)) >= 8 ? 'good' : 'warn'}>{avg(mt.ratings)}</Pill>
                <IconButton label="Delete meeting" onClick={() => removeMeeting(mt.id)}>
                  <TrashIcon />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  )
}

function RockReview({ quarterKey }: { quarterKey: string }) {
  const rocks = useStore((s) => s.rocks).filter((r) => r.quarter === quarterKey)
  if (!rocks.length)
    return (
      <Card>
        <EmptyState
          action={
            <Button size="sm" onClick={() => (window.location.hash = '#/rocks')}>
              Go to Rocks
            </Button>
          }
        >
          No rocks this quarter.
        </EmptyState>
      </Card>
    )
  return (
    <ul className="space-y-2.5">
      {rocks.map((r) => (
        <RockCard key={r.id} rock={r} compact />
      ))}
    </ul>
  )
}

function Headlines() {
  const headlines = useStore((s) => s.headlines)
  const { addHeadline, removeHeadline } = useStore()
  return (
    <div className="space-y-4">
      {(['customer', 'employee'] as const).map((kind) => (
        <Card key={kind} title={`${kind} headlines`}>
          <ul className="divide-y divide-line">
            {headlines
              .filter((h) => h.kind === kind)
              .map((h) => (
                <li key={h.id} className="flex items-center gap-2 px-4 py-2.5">
                  <span className="min-w-0 flex-1 text-sm">{h.text}</span>
                  <IconButton label="Remove headline" onClick={() => removeHeadline(h.id)}>
                    <TrashIcon />
                  </IconButton>
                </li>
              ))}
          </ul>
          <div className="p-3">
            <AddRow placeholder={`One line about a ${kind}…`} onAdd={(t) => addHeadline(t, kind)} />
          </div>
        </Card>
      ))}
    </div>
  )
}

function AddIssue() {
  const addIssue = useStore((s) => s.addIssue)
  return (
    <Card title="Drop a new issue on the list">
      <div className="p-3">
        <AddRow placeholder="What came up?" onAdd={(t) => addIssue(t, 'short')} />
      </div>
    </Card>
  )
}

function Conclude({ onFinish }: { onFinish: () => void }) {
  const people = useStore((s) => s.people)
  const todos = useStore((s) => s.todos.filter((t) => !t.done))
  const m = useMeeting()
  const scores = Object.values(m.ratings)
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null

  return (
    <div className="space-y-4">
      <Card title={`To-dos leaving this meeting (${todos.length})`}>
        {todos.length === 0 ? (
          <EmptyState>Nothing was committed to. That is unusual for a good meeting.</EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {todos.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                <span className="min-w-0 flex-1">{t.text}</span>
                <span className="shrink-0 text-xs text-muted">
                  {people.find((p) => p.id === t.ownerId)?.name ?? 'Unassigned'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={<>Cascading message <InfoTip id="cascadingMessage" /></>}>
        <div className="p-4">
          <p className="mb-2 text-xs text-muted">
            What needs to be communicated to the rest of the company, by whom, by when?
          </p>
          <Textarea
            minRows={3}
            value={m.cascading}
            onChange={(e) => m.set({ cascading: e.target.value })}
          />
        </div>
      </Card>

      <Card title={<>Rate the meeting <InfoTip id="meetingRating" /></>} right={avg !== null && <Pill tone={avg >= 8 ? 'good' : 'warn'}>{avg.toFixed(1)} avg</Pill>}>
        {people.length === 0 ? (
          <EmptyState>Add your leadership team on the People Analyzer to collect ratings.</EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {people.map((p) => (
              <li key={p.id} className="px-4 py-3">
                <p className="mb-1.5 text-sm font-medium">{p.name}</p>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => m.rate(p.id, n)}
                      className={clsx(
                        'h-8 w-8 rounded-md border text-xs font-semibold transition-colors',
                        m.ratings[p.id] === n
                          ? 'border-brand bg-brand text-white'
                          : 'border-line text-muted hover:border-brand',
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Button variant="primary" className="w-full" onClick={onFinish}>
        Save meeting and finish
      </Button>
    </div>
  )
}
