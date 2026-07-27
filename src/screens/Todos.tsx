import { useState } from 'react'
import { useStore } from '../store'
import type { Todo } from '../types'
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
  TrashIcon,
} from '../components/ui'
import { addDays, clsx, daysBetween, today } from '../lib/util'

function TodoRow({ todo }: { todo: Todo }) {
  const people = useStore((s) => s.people)
  const { updateTodo, removeTodo } = useStore()
  const overdue = !todo.done && daysBetween(today(), todo.due) < 0

  return (
    <li className="flex items-start gap-2.5 px-3 py-2.5 sm:px-4">
      <Checkbox
        checked={todo.done}
        label={`Done: ${todo.text}`}
        onChange={(done) => updateTodo(todo.id, { done })}
      />
      <div className="min-w-0 flex-1">
        <input
          value={todo.text}
          onChange={(e) => updateTodo(todo.id, { text: e.target.value })}
          className={clsx(
            'w-full bg-transparent text-sm outline-none',
            todo.done ? 'text-muted line-through' : 'font-medium',
          )}
        />
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <OwnerSelect
            value={todo.ownerId}
            people={people}
            onChange={(ownerId) => updateTodo(todo.id, { ownerId })}
            className="h-7 w-auto min-w-32 border-transparent bg-transparent px-0 py-0 text-xs text-muted"
          />
          <input
            type="date"
            value={todo.due}
            onChange={(e) => updateTodo(todo.id, { due: e.target.value })}
            className={clsx(
              'rounded border border-line bg-surface px-1.5 py-0.5 text-xs',
              overdue ? 'text-bad' : 'text-muted',
            )}
          />
          {overdue && <Pill tone="bad">{-daysBetween(today(), todo.due)}d late</Pill>}
        </div>
      </div>
      <IconButton label="Delete to-do" onClick={() => removeTodo(todo.id)}>
        <TrashIcon />
      </IconButton>
    </li>
  )
}

/** Open to-dos, reused inside the Level 10 meeting. */
export function TodoList({ onlyOpen = false }: { onlyOpen?: boolean }) {
  const todos = useStore((s) => s.todos)
  const list = (onlyOpen ? todos.filter((t) => !t.done) : todos)
    .slice()
    .sort((a, b) => Number(a.done) - Number(b.done) || (a.due < b.due ? -1 : 1))

  if (!list.length)
    return <EmptyState>Nothing on the list. To-dos are seven-day commitments, not projects.</EmptyState>
  return (
    <ul className="divide-y divide-line">
      {list.map((t) => (
        <TodoRow key={t.id} todo={t} />
      ))}
    </ul>
  )
}

export default function TodosScreen() {
  const todos = useStore((s) => s.todos)
  const people = useStore((s) => s.people)
  const { addTodo, clearDoneTodos } = useStore()
  const [text, setText] = useState('')
  const [ownerId, setOwnerId] = useState<string | null>(null)

  const open = todos.filter((t) => !t.done)
  const done = todos.filter((t) => t.done)
  const overdue = open.filter((t) => daysBetween(today(), t.due) < 0).length
  const completion = todos.length ? Math.round((done.length / todos.length) * 100) : 0

  return (
    <Page
      title="To-Dos"
      tip="todos"
      subtitle="Seven-day commitments. The list should clear itself every week — 90% done is the bar."
      actions={
        done.length > 0 && <Button onClick={clearDoneTodos}>Clear {done.length} done</Button>
      }
    >
      <form
        className="mb-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          addTodo(text.trim(), ownerId, addDays(today(), 7))
          setText('')
        }}
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Who does what by when?"
        />
        <div className="flex gap-2">
          <OwnerSelect
            value={ownerId}
            people={people}
            onChange={setOwnerId}
            className="flex-1 sm:w-40 sm:flex-none"
          />
          <Button type="submit" variant="primary" disabled={!text.trim()}>
            Add
          </Button>
        </div>
      </form>

      {todos.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <Pill tone={completion >= 90 ? 'good' : 'warn'}>{completion}% complete</Pill>
          {overdue > 0 && <Pill tone="bad">{overdue} overdue</Pill>}
          <span className="text-muted">
            {open.length} open · due within 7 days of when they were made
          </span>
        </div>
      )}

      <Card title="The list">
        <TodoList />
      </Card>

      <p className="mt-3 text-xs text-muted">
        Anything that will take longer than a week is not a to-do — make it a rock, or an issue.
      </p>
    </Page>
  )
}
