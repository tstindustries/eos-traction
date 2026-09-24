import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SectionKey =
  | 'segue'
  | 'scorecard'
  | 'rocks'
  | 'headlines'
  | 'todos'
  | 'ids'
  | 'conclude'

export const SECTIONS: {
  key: SectionKey
  label: string
  minutes: number
  prompt: string
}[] = [
  {
    key: 'segue',
    label: 'Segue',
    minutes: 5,
    prompt: 'Go around the room: one personal best and one business best from the last seven days.',
  },
  {
    key: 'scorecard',
    label: 'Scorecard',
    minutes: 5,
    prompt: 'Read the numbers. On track or off track only — anything off track drops to the issues list.',
  },
  {
    key: 'rocks',
    label: 'Rock Review',
    minutes: 5,
    prompt: 'On track or off track for each rock. No discussion — off track becomes an issue.',
  },
  {
    key: 'headlines',
    label: 'Customer / Employee Headlines',
    minutes: 5,
    prompt: 'Good news and bad news in one line each. Anything needing a conversation becomes an issue.',
  },
  {
    key: 'todos',
    label: 'To-Do List',
    minutes: 5,
    prompt: 'Done or not done. Aim for 90% completion. Not done twice? That is an issue.',
  },
  {
    key: 'ids',
    label: 'IDS',
    minutes: 60,
    prompt: 'Identify the real issue, Discuss it once, Solve it. Work the top three in order.',
  },
  {
    key: 'conclude',
    label: 'Conclude',
    minutes: 5,
    prompt: 'Recap to-dos, agree the cascading message, then rate the meeting 1–10.',
  },
]

export const TOTAL_MINUTES = SECTIONS.reduce((n, s) => n + s.minutes, 0)

/**
 * Live meeting state. Kept outside the screen so navigating away and back does not reset the
 * clock, and persisted (tst fork) so a refresh, a closed tab or a crash mid-meeting does not throw
 * away 90 minutes of ratings and notes: the meeting comes back paused where it was, and the record
 * is still only written by "End meeting". `running` is not persisted, so a restored meeting
 * always resumes with the clock stopped.
 */
type LiveMeeting = {
  active: boolean
  index: number
  running: boolean
  /** section key -> seconds elapsed */
  elapsed: Record<string, number>
  cascading: string
  notes: string
  ratings: Record<string, number>
  issuesSolvedAtStart: string[]
  start: (openIssueIds: string[]) => void
  stop: () => void
  tick: () => void
  setRunning: (running: boolean) => void
  goTo: (index: number) => void
  set: (patch: Partial<Pick<LiveMeeting, 'cascading' | 'notes'>>) => void
  rate: (personId: string, score: number) => void
}

export const useMeeting = create<LiveMeeting>()(
  persist(
    (set, get) => ({
  active: false,
  index: 0,
  running: false,
  elapsed: {},
  cascading: '',
  notes: '',
  ratings: {},
  issuesSolvedAtStart: [],
  start: (openIssueIds) =>
    set({
      active: true,
      index: 0,
      running: true,
      elapsed: {},
      cascading: '',
      notes: '',
      ratings: {},
      issuesSolvedAtStart: openIssueIds,
    }),
  stop: () => set({ active: false, running: false }),
  tick: () => {
    const { running, index, elapsed } = get()
    if (!running) return
    const key = SECTIONS[index].key
    set({ elapsed: { ...elapsed, [key]: (elapsed[key] ?? 0) + 1 } })
  },
  setRunning: (running) => set({ running }),
  goTo: (index) => set({ index: Math.max(0, Math.min(SECTIONS.length - 1, index)) }),
  set: (patch) => set(patch),
  rate: (personId, score) => set((s) => ({ ratings: { ...s.ratings, [personId]: score } })),
    }),
    {
      name: 'eos-traction-meeting',
      partialize: (s) => ({
        active: s.active,
        index: s.index,
        elapsed: s.elapsed,
        cascading: s.cascading,
        notes: s.notes,
        ratings: s.ratings,
        issuesSolvedAtStart: s.issuesSolvedAtStart,
      }),
    },
  ),
)
