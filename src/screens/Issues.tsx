import { useState } from 'react'
import { useStore } from '../store'
import type { Issue, IssueTerm } from '../types'
import {
  AddRow,
  Button,
  Card,
  EmptyState,
  IconButton,
  OwnerSelect,
  Page,
  Pill,
  Segmented,
  Textarea,
  TrashIcon,
} from '../components/ui'
import { clsx, fmtLongDate } from '../lib/util'

/**
 * One issue row with the IDS controls: pick a top-3 slot, note the discussion,
 * then Solve — which optionally drops a to-do on someone's list.
 */
export function IssueRow({ issue, showIds = true }: { issue: Issue; showIds?: boolean }) {
  const people = useStore((s) => s.people)
  const { updateIssue, removeIssue, solveIssue, setIssuePriority, addTodo } = useStore()
  const [open, setOpen] = useState(false)
  const [justSolved, setJustSolved] = useState(false)
  const solved = !!issue.solvedAt

  const solve = () => {
    solveIssue(issue.id, !solved)
    setJustSolved(!solved)
  }

  return (
    <li className="px-3 py-2.5 sm:px-4">
      <div className="flex items-start gap-2.5">
        {showIds && !solved && (
          <div className="flex shrink-0 gap-1 pt-0.5">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setIssuePriority(issue.id, issue.priority === n ? null : n)}
                aria-label={`Mark as priority ${n}`}
                aria-pressed={issue.priority === n}
                className={clsx(
                  'grid h-6 w-6 place-items-center rounded-md border text-[0.7rem] font-bold transition-colors',
                  issue.priority === n
                    ? 'border-brand bg-brand text-white'
                    : 'border-line text-muted hover:border-brand hover:text-brand',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <button
            onClick={() => setOpen(!open)}
            className={clsx(
              'block w-full text-left text-sm',
              solved ? 'text-muted line-through' : 'font-medium',
            )}
          >
            {issue.text}
          </button>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span>{people.find((p) => p.id === issue.ownerId)?.name ?? 'Unassigned'}</span>
            <span aria-hidden>·</span>
            <span>{solved ? `solved ${fmtLongDate(issue.solvedAt!)}` : fmtLongDate(issue.createdAt)}</span>
            {issue.notes && !open && <Pill>notes</Pill>}
          </div>
        </div>
        <Button size="sm" variant={solved ? 'ghost' : 'default'} onClick={solve} className="shrink-0">
          {solved ? 'Reopen' : 'Solve'}
        </Button>
      </div>

      {justSolved && solved && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-good-soft px-3 py-2 text-xs text-good">
          <span className="font-medium">Solved.</span>
          <span className="text-good/80">Does someone owe a next step?</span>
          <Button
            size="sm"
            className="ml-auto"
            onClick={() => {
              addTodo(issue.text, issue.ownerId)
              setJustSolved(false)
            }}
          >
            Add to-do
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setJustSolved(false)}>
            No
          </Button>
        </div>
      )}

      {open && (
        <div className="mt-3 space-y-2.5 border-t border-line pt-3">
          <Textarea
            value={issue.text}
            onChange={(e) => updateIssue(issue.id, { text: e.target.value })}
            minRows={1}
          />
          <Textarea
            value={issue.notes}
            onChange={(e) => updateIssue(issue.id, { notes: e.target.value })}
            placeholder="Discussion, root cause, what we decided…"
            minRows={3}
          />
          <div className="flex flex-wrap items-center gap-2">
            <OwnerSelect
              value={issue.ownerId}
              people={people}
              onChange={(ownerId) => updateIssue(issue.id, { ownerId })}
              className="h-9 w-auto min-w-36 py-1 text-[0.82rem]"
            />
            <Segmented
              size="sm"
              value={issue.term}
              options={[
                { value: 'short', label: 'Short term' },
                { value: 'long', label: 'Long term' },
              ]}
              onChange={(term) => updateIssue(issue.id, { term: term as IssueTerm })}
            />
            <IconButton
              label="Delete issue"
              className="ml-auto"
              onClick={() => removeIssue(issue.id)}
            >
              <TrashIcon />
            </IconButton>
          </div>
        </div>
      )}
    </li>
  )
}

/** Issues list scoped to a term — reused verbatim in the L10 IDS section. */
export function IssueList({
  term,
  showIds = true,
  emptyText,
}: {
  term: IssueTerm
  showIds?: boolean
  emptyText: string
}) {
  const issues = useStore((s) => s.issues)
  const open = issues
    .filter((i) => i.term === term && !i.solvedAt)
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))

  if (!open.length) return <EmptyState>{emptyText}</EmptyState>
  return (
    <ul className="divide-y divide-line">
      {open.map((i) => (
        <IssueRow key={i.id} issue={i} showIds={showIds} />
      ))}
    </ul>
  )
}

export default function IssuesScreen() {
  const issues = useStore((s) => s.issues)
  const addIssue = useStore((s) => s.addIssue)
  const [tab, setTab] = useState<IssueTerm | 'solved'>('short')

  const solved = issues.filter((i) => i.solvedAt).sort((a, b) => (a.solvedAt! < b.solvedAt! ? 1 : -1))
  const counts = {
    short: issues.filter((i) => i.term === 'short' && !i.solvedAt).length,
    long: issues.filter((i) => i.term === 'long' && !i.solvedAt).length,
    solved: solved.length,
  }

  return (
    <Page
      title="Issues"
      tip="issuesList"
      subtitle="Everything in the way, written down. Short term goes to the weekly meeting; long term waits for the quarterly."
    >
      <Segmented
        className="mb-4"
        value={tab}
        options={[
          { value: 'short', label: `Short term (${counts.short})` },
          { value: 'long', label: `Long term (${counts.long})` },
          { value: 'solved', label: `Solved (${counts.solved})` },
        ]}
        onChange={setTab}
      />

      {tab !== 'solved' && (
        <AddRow
          className="mb-4"
          placeholder={tab === 'short' ? 'What is getting in the way this week?' : 'Something for the quarterly…'}
          onAdd={(text) => addIssue(text, tab)}
        />
      )}

      <Card
        title={tab === 'solved' ? 'Solved' : tab === 'short' ? 'Short-term issues list' : 'Long-term issues list'}
      >
        {tab === 'solved' ? (
          solved.length ? (
            <ul className="divide-y divide-line">
              {solved.map((i) => (
                <IssueRow key={i.id} issue={i} showIds={false} />
              ))}
            </ul>
          ) : (
            <EmptyState>Nothing solved yet. Solved issues land here as a record of decisions.</EmptyState>
          )
        ) : (
          <IssueList
            term={tab}
            emptyText={
              tab === 'short'
                ? 'No open short-term issues. Add them as they come up — do not save them for the meeting.'
                : 'No long-term issues parked. Use this for anything that is not a this-quarter problem.'
            }
          />
        )}
      </Card>

      {tab === 'short' && counts.short > 0 && (
        <p className="mt-3 text-xs text-muted">
          Use the 1 / 2 / 3 buttons to pick what gets discussed first. In the Level 10 meeting, work
          them one at a time: Identify, Discuss, Solve.
        </p>
      )}
    </Page>
  )
}
