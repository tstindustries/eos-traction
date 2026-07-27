import { useState } from 'react'
import { useStore } from '../store'
import { Button, Card, Page, Pill } from '../components/ui'
import {
  COMPONENT_BLURB,
  COMPONENT_ORDER,
  byComponent,
  type Component,
} from '../lib/glossary'
import { clsx } from '../lib/util'

const GO = (hash: string) => () => (window.location.hash = hash)

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 p-4 text-[0.9rem] leading-relaxed sm:p-5">{children}</div>
}

const STEPS: { n: number; title: string; body: string; cta?: [string, string] }[] = [
  {
    n: 1,
    title: 'Add your people',
    body: 'Everyone on your leadership team, at minimum. Nothing else in the app can assign an owner until someone exists to own it, so start here even if you skip the ratings for now.',
    cta: ['People Analyzer', '#/people'],
  },
  {
    n: 2,
    title: 'Write down your core values',
    body: 'Three to seven. Do not invent them — look at the two or three people you would clone if you could, and describe what they have in common. These become what the People Analyzer rates against.',
    cta: ['V/TO → Vision', '#/vto'],
  },
  {
    n: 3,
    title: 'Answer the rest of the V/TO',
    body: 'Core focus, ten-year target, marketing strategy, three-year picture, one-year plan. It will feel slow and you will not get it right first time. Draft it badly, then fix it every quarter — a rough version everyone has seen beats a perfect one in your head.',
    cta: ['V/TO', '#/vto'],
  },
  {
    n: 4,
    title: 'Build the accountability chart',
    body: 'Draw the seats your company needs and the handful of things each is accountable for. Put names in only after the structure is right. Expect to find a seat nobody owns, and one person sitting in three.',
    cta: ['Accountability Chart', '#/accountability'],
  },
  {
    n: 5,
    title: 'Pick this quarter\'s rocks',
    body: 'Three to seven things that must be finished in ninety days, one owner each. Take them from the one-year plan. If you list ten, you have not chosen yet.',
    cta: ['Rocks', '#/rocks'],
  },
  {
    n: 6,
    title: 'Choose five to fifteen weekly numbers',
    body: 'One owner and one goal per number. Favour things people control — calls made, tickets answered, days to onboard — over lagging outcomes like revenue. You will change these in a month or two; that is normal.',
    cta: ['Scorecard', '#/scorecard'],
  },
  {
    n: 7,
    title: 'Run your first Level 10 meeting',
    body: 'Same day and time every week from here on. Follow the timer even when it feels rushed — running out of time in a section is information, not a failure. The first three or four will be clumsy.',
    cta: ['Level 10 Meeting', '#/l10'],
  },
]

export default function GuideScreen() {
  const enterSampleMode = useStore((s) => s.enterSampleMode)
  const sampleMode = useStore((s) => s.sampleMode)
  const [openComponent, setOpenComponent] = useState<Component | null>('Foundations')

  return (
    <Page
      title="Guide"
      subtitle="What this system is, why each piece exists, and the order to fill it in. No prior reading needed."
      actions={
        !sampleMode && (
          <Button onClick={enterSampleMode}>See it filled in</Button>
        )
      }
    >
      <div className="space-y-4">
        <Card title="The short version">
          <Prose>
            <p>
              EOS — the Entrepreneurial Operating System — is a set of simple, connected habits for
              running a small company. It comes from Gino Wickman's book <em>Traction</em>. The claim
              it makes is narrow and worth stating plainly: most small companies are not held back by
              a shortage of good ideas. They are held back because nobody agrees on the priorities,
              accountability is vague, and the same problems get talked about for months without ever
              being resolved.
            </p>
            <p>
              The system attacks that with four things. A <strong>vision</strong> short enough to fit
              on two pages, so it can actually be shared. The <strong>right people</strong> in seats
              with explicit accountability. A handful of <strong>numbers</strong> reviewed weekly, so
              you find out about problems while they are small. And a <strong>rhythm of meetings</strong>{' '}
              with a fixed agenda, which is where problems get solved rather than re-discussed.
            </p>
            <p className="text-muted">
              It is deliberately unclever. Almost all of the value comes from doing it consistently
              for a couple of years — not from customising it, and not from the tooling. This app is
              just somewhere to keep it.
            </p>
          </Prose>
        </Card>

        <Card title="How the pieces connect">
          <Prose>
            <p>
              The tools are not independent, and filling them in out of order creates busywork. The
              dependencies that matter:
            </p>
            <ul className="space-y-2 text-muted">
              <li>
                <strong className="text-ink">Core values → People Analyzer.</strong> The values you
                write on the V/TO are literally what people get rated against. No values, nothing to
                rate.
              </li>
              <li>
                <strong className="text-ink">People → everything else.</strong> Rocks, measurables,
                issues and to-dos all need an owner. That list comes from the People Analyzer.
              </li>
              <li>
                <strong className="text-ink">1-Year Plan → Rocks.</strong> Rocks are how the annual
                goals actually happen. A rock that does not move a one-year goal is probably someone's
                pet project.
              </li>
              <li>
                <strong className="text-ink">Scorecard and Rocks → Issues.</strong> A number that
                misses, or a rock that goes off track, does not get debated on the spot. It becomes an
                issue, and gets solved in IDS.
              </li>
              <li>
                <strong className="text-ink">Issues → To-Dos.</strong> Solving an issue means someone
                owes something within seven days. That is the part teams skip, and it is why the same
                issues keep coming back.
              </li>
            </ul>
            <p>
              The Level 10 meeting is where all of it meets once a week, which is why this app's
              meeting screen embeds the scorecard, rocks, to-dos and issues rather than making you
              navigate between them.
            </p>
          </Prose>
        </Card>

        <Card title="Where to start">
          <ol className="divide-y divide-line">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-3 px-4 py-3.5 sm:px-5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-[0.8rem] font-bold text-brand">
                  {s.n}
                </span>
                <div className="min-w-0">
                  <p className="text-[0.9rem] font-semibold">{s.title}</p>
                  <p className="mt-1 text-[0.85rem] leading-relaxed text-muted">{s.body}</p>
                  {s.cta && (
                    <Button size="sm" className="mt-2" onClick={GO(s.cta[1])}>
                      {s.cta[0]} →
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="border-t border-line p-4 sm:p-5">
            <p className="text-[0.85rem] text-muted">
              Steps 1–4 are a couple of sessions of real thinking, not an afternoon of typing. Steps
              5–7 are the part you repeat forever.
            </p>
          </div>
        </Card>

        <Card title="The weekly and quarterly rhythm">
          <Prose>
            <p>Three meetings, each with a different job:</p>
            <ul className="space-y-2 text-muted">
              <li>
                <strong className="text-ink">Weekly — Level 10, 90 minutes.</strong> Same day, same
                time, same agenda. Check the numbers, check the rocks, clear the to-dos, then spend
                the bulk of it solving issues. Start and end on time even mid-sentence.
              </li>
              <li>
                <strong className="text-ink">Quarterly — one day.</strong> Review last quarter's
                rocks honestly, work the long-term issues list, and set the next three to seven rocks.
                Off-site if you can.
              </li>
              <li>
                <strong className="text-ink">Annually — two days.</strong> Revisit the whole V/TO,
                reset the one-year plan, and agree the coming year's numbers.
              </li>
            </ul>
            <p>
              The weekly meeting is the one that makes or breaks it. Skipping it for two weeks is
              usually the beginning of quietly abandoning the whole system.
            </p>
          </Prose>
        </Card>

        <Card title="Common ways this goes wrong">
          <Prose>
            <ul className="space-y-2 text-muted">
              <li>
                <strong className="text-ink">Too many rocks.</strong> Eight rocks is the same as no
                rocks. Cut to the ones that would genuinely change the year.
              </li>
              <li>
                <strong className="text-ink">Discussing in the rock review.</strong> Status only —
                on track or off track. The discussion belongs in IDS, later in the same meeting.
              </li>
              <li>
                <strong className="text-ink">Solving without assigning.</strong> If nobody owes
                anything by a date, the issue was not solved. It will be back next week.
              </li>
              <li>
                <strong className="text-ink">Lagging measurables only.</strong> A scorecard of
                revenue and profit tells you the past. Add the activity numbers that cause them.
              </li>
              <li>
                <strong className="text-ink">Two people in one seat.</strong> Shared accountability
                is the most common structural problem, and it is invisible until you draw the chart.
              </li>
              <li>
                <strong className="text-ink">Waiting until it is perfect.</strong> A rough V/TO your
                team has argued about beats an elegant one they have never seen.
              </li>
            </ul>
          </Prose>
        </Card>

        <Card title="Glossary">
          <div className="p-3 sm:p-4">
            <p className="mb-3 px-1 text-[0.85rem] text-muted">
              Every term the app uses, grouped by the six components. The same explanations sit behind
              the <span className="font-semibold">?</span> buttons throughout the app.
            </p>
            <div className="space-y-2">
              {COMPONENT_ORDER.map((c) => {
                const entries = byComponent(c)
                if (!entries.length) return null
                const open = openComponent === c
                return (
                  <div key={c} className="overflow-hidden rounded-lg border border-line">
                    <button
                      onClick={() => setOpenComponent(open ? null : c)}
                      aria-expanded={open}
                      className={clsx(
                        'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                        open ? 'bg-brand-soft' : 'hover:bg-surface-2',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={clsx(
                            'text-[0.85rem] font-semibold',
                            open ? 'text-brand' : 'text-ink',
                          )}
                        >
                          {c}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">{COMPONENT_BLURB[c]}</p>
                      </div>
                      <Pill tone={open ? 'brand' : 'neutral'}>{entries.length}</Pill>
                      <span className="shrink-0 text-muted">{open ? '−' : '+'}</span>
                    </button>
                    {open && (
                      <dl className="divide-y divide-line border-t border-line">
                        {entries.map(([key, e]) => (
                          <div key={key} className="px-3 py-3">
                            <dt className="font-display text-[0.92rem] font-semibold">{e.term}</dt>
                            <dd className="mt-1 text-[0.85rem] leading-relaxed">{e.what}</dd>
                            <dd className="mt-1.5 text-[0.85rem] leading-relaxed text-muted">
                              <span className="font-semibold text-ink">Why it matters. </span>
                              {e.why}
                            </dd>
                            {e.rule && (
                              <dd className="mt-2 rounded-md bg-brand-soft px-2.5 py-1.5 text-[0.8rem] leading-relaxed text-brand">
                                <span className="font-semibold">Rule of thumb. </span>
                                {e.rule}
                              </dd>
                            )}
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        <Card title="About this app">
          <Prose>
            <p>
              Everything is stored in this browser's local storage. No accounts, no server, nothing
              leaves your device. Export to JSON from Settings before clearing browser data or moving
              machines.
            </p>
            <p>
              <strong>Sample mode</strong> loads a fictional company with a filled-in V/TO, rocks,
              thirteen weeks of scorecard history and past meetings — useful for seeing what a
              working setup looks like. Your own data is set aside and restored when you exit.
            </p>
            <p className="text-muted">
              The explanations here and in the tooltips are written in plain language by way of
              introduction — they are not quotations from <em>Traction</em>, and they are no
              substitute for reading it. If the framework is useful to you, buy the book; it is
              short, and the chapters on the People and Traction components in particular go far
              deeper than a tooltip can.
            </p>
            <p className="text-muted">
              This is an independent implementation of the framework described in <em>Traction</em> by
              Gino Wickman. It is not affiliated with, licensed by, or endorsed by EOS Worldwide.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="primary" onClick={GO('#/dashboard')}>
                Go to the dashboard
              </Button>
              {!sampleMode && <Button onClick={enterSampleMode}>Load the sample company</Button>}
            </div>
          </Prose>
        </Card>
      </div>
    </Page>
  )
}
