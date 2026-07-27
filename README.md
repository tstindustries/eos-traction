# Traction · EOS

A local web app for running the Entrepreneurial Operating System from Gino Wickman's *Traction*.

Everything lives in your browser's local storage. No accounts, no server, no network calls.
Export to JSON from **Settings** to back up or move between devices.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build && npm run preview   # static build in dist/
```

`dist/` is plain static files — drop it on any host, or open it behind any local web server.

## What's in it

| Screen | What it does |
| --- | --- |
| **Dashboard** | The quarter at a glance: rock status, this week's scorecard, top issues, due to-dos. |
| **Vision / Traction Organizer** | The full two-page V/TO — core values, core focus, 10-year target, marketing strategy, 3-year picture, 1-year plan, rocks, long-term issues. Prints to PDF. |
| **Rocks** | 3–7 quarterly priorities with one owner each, milestones, and on/off-track status. Carry unfinished rocks into the next quarter. |
| **Scorecard** | A 13-week rolling grid of weekly measurables. Cells go green or red against the goal automatically; the first column stays put while you scroll. |
| **Level 10 Meeting** | A live 90-minute meeting runner with per-section timers, wired straight into the scorecard, rocks, to-dos and issues. Ends with ratings and saves a record. |
| **Issues** | Short-term and long-term lists with IDS: pick the top three, discuss, solve — and turn the next step into a to-do. |
| **To-Dos** | Seven-day commitments with completion percentage and overdue flags. |
| **Accountability Chart** | Seats with up to five roles each, one name per seat, nested reporting lines. |
| **People Analyzer** | Core-value ratings (+ / +/- / −) plus GWC, scored against the bar. |
| **Guide** | What EOS is, why each piece exists, the order to fill things in, common failure modes, and a full glossary. Written for someone who has not read the book. |
| **Settings** | Company name, fiscal-year start, scorecard week-ending day, theme, export/import/reset. |

## If you haven't read the book

You don't need to. Two things cover it:

- **The Guide page** — the short version of the system, how the tools depend on each other, a
  seven-step order to fill it in, the weekly/quarterly/annual rhythm, the six ways teams usually
  get it wrong, and a glossary of all 44 terms grouped by component.
- **The `?` buttons** — next to most headings and key fields. Each gives you what the thing is,
  why it matters, and the rule of thumb people get wrong. Click to open, Escape to close.

These are original plain-language explanations of the framework, not quotations from *Traction* —
and no substitute for reading it. The glossary lives in one file (`src/lib/glossary.ts`), so the
tooltips and the Guide can never drift apart.

Core values entered on the V/TO are what the People Analyzer rates against, and people added
on the People Analyzer are the owners you can assign everywhere else — so those two are worth
filling in first.

## Sample mode

**Settings → Sample mode** (or the button on the welcome screen) loads Northgate Systems, a
fictional 34-person company two years into running on EOS: a complete V/TO, seven rocks with
milestones, nine measurables with thirteen weeks of history, a full issues list with solved
examples, and three past Level 10 meetings with ratings.

Your own data is **stashed, not overwritten**. A banner stays up while sample mode is active, and
exiting restores everything exactly as you left it. Edits you make to the sample company are
discarded on exit.

## Notes

- Fiscal year start drives which quarter a rock belongs to; the scorecard week-ending day
  drives the grid's columns. Both are in Settings.
- Clearing your browser's site data for this origin erases everything. Export first.
- Independent implementation of the framework described in *Traction*. Not affiliated with or
  endorsed by EOS Worldwide.
