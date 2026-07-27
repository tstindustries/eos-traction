import { useStore } from '../store'
import type { Seat } from '../types'
import { InfoTip } from '../components/InfoTip'
import {
  AddRow,
  Button,
  Card,
  EmptyState,
  IconButton,
  Input,
  OwnerSelect,
  Page,
  TrashIcon,
} from '../components/ui'

function SeatCard({ seat, depth }: { seat: Seat; depth: number }) {
  const people = useStore((s) => s.people)
  const seats = useStore((s) => s.seats)
  const { updateSeat, removeSeat, addSeat } = useStore()
  const children = seats.filter((s) => s.parentId === seat.id)

  return (
    <li>
      <Card className="p-3 sm:p-4">
        <div className="flex items-start gap-2">
          <Input
            value={seat.name}
            onChange={(e) => updateSeat(seat.id, { name: e.target.value })}
            placeholder="Seat name"
            className="border-transparent bg-transparent px-0 py-0 font-display text-base"
          />
          <IconButton label="Delete seat" onClick={() => removeSeat(seat.id)}>
            <TrashIcon />
          </IconButton>
        </div>

        <div className="mt-2">
          <OwnerSelect
            value={seat.personIds[0] ?? null}
            people={people}
            onChange={(id) => updateSeat(seat.id, { personIds: id ? [id] : [] })}
            className="h-9 w-full py-1 text-[0.82rem] sm:w-52"
          />
        </div>

        <ul className="mt-3 space-y-1.5">
          {seat.roles.map((role, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
              <input
                value={role}
                onChange={(e) =>
                  updateSeat(seat.id, {
                    roles: seat.roles.map((r, j) => (j === i ? e.target.value : r)),
                  })
                }
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              <IconButton
                label="Remove role"
                onClick={() =>
                  updateSeat(seat.id, { roles: seat.roles.filter((_, j) => j !== i) })
                }
              >
                <TrashIcon />
              </IconButton>
            </li>
          ))}
        </ul>

        {seat.roles.length < 5 && (
          <AddRow
            className="mt-2"
            placeholder={seat.roles.length === 0 ? 'First major role…' : 'Add a role…'}
            onAdd={(t) => updateSeat(seat.id, { roles: [...seat.roles, t] })}
          />
        )}
        {seat.roles.length >= 5 && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
            <InfoTip id="seat" />
            Five roles is the limit — more than that and the seat is really two seats.
          </p>
        )}

        <div className="mt-3 border-t border-line pt-2">
          <Button size="sm" variant="ghost" onClick={() => addSeat(seat.id)}>
            + Seat reporting to {seat.name || 'this seat'}
          </Button>
        </div>
      </Card>

      {children.length > 0 && (
        <ul
          className="mt-2.5 space-y-2.5 border-l border-line pl-3 sm:pl-5"
          style={{ marginLeft: depth < 3 ? '0.75rem' : 0 }}
        >
          {children.map((c) => (
            <SeatCard key={c.id} seat={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function AccountabilityScreen() {
  const seats = useStore((s) => s.seats)
  const people = useStore((s) => s.people)
  const addSeat = useStore((s) => s.addSeat)
  const roots = seats.filter((s) => !s.parentId)
  const seated = new Set(seats.flatMap((s) => s.personIds))
  const unseated = people.filter((p) => !seated.has(p.id))

  return (
    <Page
      title="Accountability Chart"
      tip="accountabilityChart"
      subtitle="Structure first, then people. One name per seat — if two people are accountable, nobody is."
      actions={
        <Button variant="primary" onClick={() => addSeat(null)}>
          Add top-level seat
        </Button>
      }
    >
      {seats.length === 0 ? (
        <Card>
          <EmptyState
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="primary" onClick={() => addSeat(null, 'Visionary')}>
                  Add Visionary
                </Button>
                <Button onClick={() => addSeat(null, 'Integrator')}>Add Integrator</Button>
              </div>
            }
          >
            Start with the two seats at the top, then add the functions below them —
            Sales/Marketing, Operations, Finance.
          </EmptyState>
        </Card>
      ) : (
        <ul className="space-y-3">
          {roots.map((s) => (
            <SeatCard key={s.id} seat={s} depth={0} />
          ))}
        </ul>
      )}

      {unseated.length > 0 && (
        <Card title={<>Not in a seat <InfoTip id="rightPersonRightSeat" /></>} className="mt-5">
          <ul className="divide-y divide-line">
            {unseated.map((p) => (
              <li key={p.id} className="px-4 py-2.5 text-sm">
                {p.name}
                {p.title && <span className="text-muted"> · {p.title}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Page>
  )
}
