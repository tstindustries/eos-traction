import { useState } from 'react'
import { useStore } from '../store'
import {
  AddRow,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  Input,
  Page,
  Textarea,
  TrashIcon,
} from '../components/ui'
import { InfoTip } from '../components/InfoTip'
import { fmtLongDate, quarterOf, today } from '../lib/util'
import { statusPill } from './Rocks'

/** Editable list of one-line strings (3-Year picture bullets, 1-Year goals…). */
function ListEditor({
  items,
  onChange,
  placeholder,
  emptyText,
}: {
  items: string[]
  onChange: (next: string[]) => void
  placeholder: string
  emptyText: string
}) {
  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-sm text-muted">{emptyText}</p>}
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
          <Textarea
            minRows={1}
            value={item}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            className="border-transparent px-0 py-0.5"
          />
          <IconButton
            label="Remove"
            className="no-print"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            <TrashIcon />
          </IconButton>
        </div>
      ))}
      <AddRow className="no-print pt-1" placeholder={placeholder} onAdd={(t) => onChange([...items, t])} />
    </div>
  )
}

function Body({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`space-y-4 p-4 ${className}`}>{children}</div>
}

export default function VtoScreen() {
  const vto = useStore((s) => s.vto)
  const rocks = useStore((s) => s.rocks)
  const issues = useStore((s) => s.issues)
  const fy = useStore((s) => s.settings.fyStartMonth)
  const { updateVto, addCoreValue, updateCoreValue, removeCoreValue } = useStore()
  const [page, setPage] = useState<'vision' | 'traction'>('vision')

  const q = quarterOf(today(), fy)
  const quarterRocks = rocks.filter((r) => r.quarter === q.key)
  const longTerm = issues.filter((i) => i.term === 'long' && !i.solvedAt)

  const visionPage = (
    <div className="space-y-4">
      <Card title={<>Core Values <InfoTip id="coreValues" /></>}>
        <Body>
          <p className="text-sm text-muted">
            Three to seven rules that define who you are. Hire, fire, review and reward on these.
          </p>
          {vto.coreValues.length === 0 && (
            <p className="text-sm text-muted italic">None yet — start with the handful you already live by.</p>
          )}
          <ol className="space-y-2">
            {vto.coreValues.map((cv, i) => (
              <li key={cv.id} className="flex items-start gap-2">
                <span className="mt-1.5 w-4 shrink-0 text-right text-xs font-semibold text-brand tabular-nums">
                  {i + 1}
                </span>
                <Textarea
                  minRows={1}
                  value={cv.text}
                  onChange={(e) => updateCoreValue(cv.id, e.target.value)}
                  className="border-transparent px-0 py-0.5 font-medium"
                />
                <IconButton label="Remove core value" className="no-print" onClick={() => removeCoreValue(cv.id)}>
                  <TrashIcon />
                </IconButton>
              </li>
            ))}
          </ol>
          <AddRow className="no-print" placeholder="Add a core value…" onAdd={addCoreValue} />
        </Body>
      </Card>

      <Card title={<>Core Focus <InfoTip id="coreFocus" /></>}>
        <Body>
          <Field label="Purpose / Cause / Passion" hint="Why you exist. Should feel bigger than money." tip="purpose">
            <Textarea
              value={vto.purpose}
              onChange={(e) => updateVto((v) => void (v.purpose = e.target.value))}
              placeholder="Why does this company exist?"
              minRows={2}
            />
          </Field>
          <Field label="Our Niche" hint="What you do better than anyone. Keep it to one sentence." tip="niche">
            <Textarea
              value={vto.niche}
              onChange={(e) => updateVto((v) => void (v.niche = e.target.value))}
              placeholder="What is the one thing you do?"
              minRows={2}
            />
          </Field>
        </Body>
      </Card>

      <Card title={<>10-Year Target <InfoTip id="tenYear" /></>}>
        <Body>
          <Field label="By when">
            <Input
              type="date"
              value={vto.tenYear.date}
              onChange={(e) => updateVto((v) => void (v.tenYear.date = e.target.value))}
              className="w-44"
            />
          </Field>
          <Field label="The target" hint="One big, measurable, energising number or milestone.">
            <Textarea
              value={vto.tenYear.target}
              onChange={(e) => updateVto((v) => void (v.tenYear.target = e.target.value))}
              placeholder="Where will this company be in ten years?"
              minRows={2}
            />
          </Field>
        </Body>
      </Card>

      <Card title={<>Marketing Strategy <InfoTip id="marketingStrategy" /></>}>
        <Body>
          <Field label="Target Market — The List" hint="Demographic, geographic and psychographic profile of your ideal customer." tip="targetMarket">
            <Textarea
              value={vto.marketing.targetMarket}
              onChange={(e) => updateVto((v) => void (v.marketing.targetMarket = e.target.value))}
              minRows={3}
            />
          </Field>
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium">Three Uniques <InfoTip id="threeUniques" /></p>
            <div className="space-y-2">
              {vto.marketing.uniques.map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 shrink-0 text-right text-xs font-semibold text-brand tabular-nums">
                    {i + 1}
                  </span>
                  <Input
                    value={u}
                    onChange={(e) =>
                      updateVto((v) => {
                        v.marketing.uniques[i] = e.target.value
                      })
                    }
                    placeholder={['What makes you different?', 'And what else?', 'And the third?'][i]}
                  />
                </div>
              ))}
            </div>
          </div>
          <Field label="Proven Process" hint="The way you deliver, named in 3–7 steps you can draw on one page." tip="provenProcess">
            <Textarea
              value={vto.marketing.provenProcess}
              onChange={(e) => updateVto((v) => void (v.marketing.provenProcess = e.target.value))}
              placeholder="Discover → Plan → Build → Support"
              minRows={2}
            />
          </Field>
          <Field label="Guarantee" hint="The promise that removes the risk of buying from you." tip="guarantee">
            <Textarea
              value={vto.marketing.guarantee}
              onChange={(e) => updateVto((v) => void (v.marketing.guarantee = e.target.value))}
              minRows={2}
            />
          </Field>
        </Body>
      </Card>

      <Card title={<>3-Year Picture <InfoTip id="threeYear" /></>}>
        <Body>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Future date">
              <Input
                type="date"
                value={vto.threeYear.date}
                onChange={(e) => updateVto((v) => void (v.threeYear.date = e.target.value))}
              />
            </Field>
            <Field label="Revenue">
              <Input
                value={vto.threeYear.revenue}
                onChange={(e) => updateVto((v) => void (v.threeYear.revenue = e.target.value))}
                placeholder="$12M"
              />
            </Field>
            <Field label="Profit">
              <Input
                value={vto.threeYear.profit}
                onChange={(e) => updateVto((v) => void (v.threeYear.profit = e.target.value))}
                placeholder="18%"
              />
            </Field>
          </div>
          <Field label="Measurables">
            <Input
              value={vto.threeYear.measurables}
              onChange={(e) => updateVto((v) => void (v.threeYear.measurables = e.target.value))}
              placeholder="600 accounts · 95% retention"
            />
          </Field>
          <div>
            <p className="mb-1.5 text-[0.8rem] font-medium">What does it look like?</p>
            <p className="mb-2 text-xs text-muted">
              Write it in the present tense, as if you are standing there on that date.
            </p>
            <ListEditor
              items={vto.threeYear.lookLike}
              onChange={(lookLike) => updateVto((v) => void (v.threeYear.lookLike = lookLike))}
              placeholder="Add a bullet…"
              emptyText="No bullets yet. Aim for 10–20 concrete, visual statements."
            />
          </div>
        </Body>
      </Card>
    </div>
  )

  const tractionPage = (
    <div className="space-y-4">
      <Card title={<>1-Year Plan <InfoTip id="oneYearPlan" /></>}>
        <Body>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Future date">
              <Input
                type="date"
                value={vto.oneYear.date}
                onChange={(e) => updateVto((v) => void (v.oneYear.date = e.target.value))}
              />
            </Field>
            <Field label="Revenue">
              <Input
                value={vto.oneYear.revenue}
                onChange={(e) => updateVto((v) => void (v.oneYear.revenue = e.target.value))}
              />
            </Field>
            <Field label="Profit">
              <Input
                value={vto.oneYear.profit}
                onChange={(e) => updateVto((v) => void (v.oneYear.profit = e.target.value))}
              />
            </Field>
          </div>
          <Field label="Measurables">
            <Input
              value={vto.oneYear.measurables}
              onChange={(e) => updateVto((v) => void (v.oneYear.measurables = e.target.value))}
            />
          </Field>
          <div>
            <p className="mb-1.5 text-[0.8rem] font-medium">Goals for the year</p>
            <p className="mb-2 text-xs text-muted">Three to seven. Any more and none of them are real.</p>
            <ListEditor
              items={vto.oneYear.goals}
              onChange={(goals) => updateVto((v) => void (v.oneYear.goals = goals))}
              placeholder="Add a goal…"
              emptyText="No goals set for the year yet."
            />
          </div>
        </Body>
      </Card>

      <Card
        title={`Rocks · ${q.label}`}
        right={
          <Button size="sm" onClick={() => (window.location.hash = '#/rocks')}>
            Edit rocks
          </Button>
        }
      >
        {quarterRocks.length === 0 ? (
          <EmptyState
            action={
              <Button size="sm" variant="primary" onClick={() => (window.location.hash = '#/rocks')}>
                Set this quarter's rocks
              </Button>
            }
          >
            Nothing set for {q.label}. Rocks are how the 1-year plan actually happens.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {quarterRocks.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="min-w-0 flex-1 truncate text-sm">{r.title || 'Untitled rock'}</span>
                {statusPill(r.status)}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title={<>Long-term issues list <InfoTip id="shortVsLongTerm" /></>}
        right={
          <Button size="sm" onClick={() => (window.location.hash = '#/issues')}>
            Open issues
          </Button>
        }
      >
        {longTerm.length === 0 ? (
          <EmptyState>Nothing parked. Long-term issues get worked at the quarterly, not weekly.</EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {longTerm.map((i) => (
              <li key={i.id} className="px-4 py-2.5 text-sm">
                {i.text}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )

  return (
    <Page
      title="Vision / Traction Organizer"
      tip="vto"
      subtitle="Eight questions, two pages. Answer them, get everyone on the same page, revisit every quarter."
      actions={
        <Button onClick={() => window.print()}>Print / PDF</Button>
      }
    >
      <div className="no-print mb-5 flex rounded-xl border border-line bg-surface-2 p-1">
        {(
          [
            ['vision', 'Vision', 'Core values, focus, 10-year, marketing, 3-year'],
            ['traction', 'Traction', '1-year plan, rocks, issues'],
          ] as const
        ).map(([key, label, hint]) => (
          <button
            key={key}
            onClick={() => setPage(key)}
            className={`flex-1 rounded-lg px-3 py-2 text-left transition-colors ${
              page === key ? 'bg-surface shadow-sm' : 'hover:bg-surface/50'
            }`}
          >
            <span
              className={`block text-sm font-semibold ${page === key ? 'text-brand' : 'text-muted'}`}
            >
              {label}
            </span>
            <span className="mt-0.5 hidden text-xs text-muted sm:block">{hint}</span>
          </button>
        ))}
      </div>

      {/* On screen: one page at a time. On paper: both, in order. */}
      <div className={page === 'vision' ? '' : 'hidden print:block'}>{visionPage}</div>
      <div className={page === 'traction' ? 'print:mt-4' : 'hidden print:mt-4 print:block'}>
        {tractionPage}
      </div>

      {vto.tenYear.date && (
        <p className="mt-4 text-xs text-muted">
          10-year target dated {fmtLongDate(vto.tenYear.date)}.
        </p>
      )}
    </Page>
  )
}
