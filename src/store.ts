import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppData,
  Headline,
  ID,
  Issue,
  IssueTerm,
  Measurable,
  Meeting,
  Person,
  Rock,
  SaveMeta,
  Seat,
  Settings,
  Todo,
  Vto,
} from './types'
import { addDays, today, uid } from './lib/util'
import { sampleData } from './lib/sample'

export const DATA_VERSION = 1

const emptyVto = (): Vto => ({
  coreValues: [],
  purpose: '',
  niche: '',
  tenYear: { date: '', target: '' },
  marketing: {
    targetMarket: '',
    uniques: ['', '', ''],
    provenProcess: '',
    guarantee: '',
  },
  threeYear: { date: '', revenue: '', profit: '', measurables: '', lookLike: [] },
  oneYear: { date: '', revenue: '', profit: '', measurables: '', goals: [] },
})

export const emptyData = (): AppData => ({
  version: DATA_VERSION,
  rev: 0,
  updatedAt: '',
  updatedBy: '',
  settings: {
    companyName: '',
    fyStartMonth: 1,
    weekEndsOn: 0,
    theme: 'system',
  },
  people: [],
  vto: emptyVto(),
  seats: [],
  rocks: [],
  measurables: [],
  issues: [],
  todos: [],
  headlines: [],
  meetings: [],
})

/** The exportable document: everything that is data, nothing that is UI state. */
export const snapshot = (s: AppData): AppData => ({
  version: DATA_VERSION,
  rev: s.rev ?? 0,
  updatedAt: s.updatedAt ?? '',
  updatedBy: s.updatedBy ?? '',
  settings: s.settings,
  people: s.people,
  vto: s.vto,
  seats: s.seats,
  rocks: s.rocks,
  measurables: s.measurables,
  issues: s.issues,
  todos: s.todos,
  headlines: s.headlines,
  meetings: s.meetings,
})

type Actions = {
  /* settings */
  setSettings: (patch: Partial<Settings>) => void

  /* people */
  addPerson: (name: string) => Person
  updatePerson: (id: ID, patch: Partial<Person>) => void
  removePerson: (id: ID) => void

  /* v/to */
  updateVto: (fn: (v: Vto) => void) => void
  addCoreValue: (text: string) => void
  updateCoreValue: (id: ID, text: string) => void
  removeCoreValue: (id: ID) => void

  /* seats */
  addSeat: (parentId: ID | null, name?: string) => Seat
  updateSeat: (id: ID, patch: Partial<Seat>) => void
  removeSeat: (id: ID) => void

  /* rocks */
  addRock: (quarter: string, patch?: Partial<Rock>) => Rock
  updateRock: (id: ID, patch: Partial<Rock>) => void
  removeRock: (id: ID) => void
  addMilestone: (rockId: ID, text: string, due: string) => void
  updateMilestone: (rockId: ID, msId: ID, patch: { text?: string; due?: string; done?: boolean }) => void
  removeMilestone: (rockId: ID, msId: ID) => void
  copyRocksToQuarter: (fromQuarter: string, toQuarter: string) => number

  /* scorecard */
  addMeasurable: (patch?: Partial<Measurable>) => Measurable
  updateMeasurable: (id: ID, patch: Partial<Measurable>) => void
  removeMeasurable: (id: ID) => void
  setWeekValue: (id: ID, week: string, value: number | null) => void
  reorderMeasurable: (id: ID, dir: -1 | 1) => void

  /* issues */
  addIssue: (text: string, term?: IssueTerm) => Issue
  updateIssue: (id: ID, patch: Partial<Issue>) => void
  removeIssue: (id: ID) => void
  solveIssue: (id: ID, solved: boolean) => void
  setIssuePriority: (id: ID, priority: number | null) => void

  /* to-dos */
  addTodo: (text: string, ownerId?: ID | null, due?: string) => Todo
  updateTodo: (id: ID, patch: Partial<Todo>) => void
  removeTodo: (id: ID) => void
  clearDoneTodos: () => void

  /* headlines */
  addHeadline: (text: string, kind: Headline['kind']) => void
  removeHeadline: (id: ID) => void

  /* meetings */
  saveMeeting: (m: Meeting) => void
  removeMeeting: (id: ID) => void

  /* data */
  replaceAll: (data: AppData) => void
  reset: () => void
  /** Stamp the document after a Save to the shared location. */
  setSaveMeta: (meta: SaveMeta) => void

  /* sample mode */
  enterSampleMode: () => void
  exitSampleMode: () => void
}

/** Sample mode lives alongside the data but is never part of an export. */
type SampleState = { sampleMode: boolean; stashed: AppData | null }

export type Store = AppData & SampleState & Actions

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...emptyData(),
      sampleMode: false,
      stashed: null,

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      /* ------------------------------ people ----------------------------- */
      addPerson: (name) => {
        const p: Person = {
          id: uid(),
          name,
          title: '',
          values: {},
          gwc: { gets: null, wants: null, capacity: null },
        }
        set((s) => ({ people: [...s.people, p] }))
        return p
      },
      updatePerson: (id, patch) =>
        set((s) => ({ people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removePerson: (id) =>
        set((s) => ({
          people: s.people.filter((p) => p.id !== id),
          rocks: s.rocks.map((r) => (r.ownerId === id ? { ...r, ownerId: null } : r)),
          todos: s.todos.map((t) => (t.ownerId === id ? { ...t, ownerId: null } : t)),
          issues: s.issues.map((i) => (i.ownerId === id ? { ...i, ownerId: null } : i)),
          measurables: s.measurables.map((m) =>
            m.ownerId === id ? { ...m, ownerId: null } : m,
          ),
          seats: s.seats.map((seat) => ({
            ...seat,
            personIds: seat.personIds.filter((pid) => pid !== id),
          })),
        })),

      /* ------------------------------- v/to ------------------------------ */
      updateVto: (fn) =>
        set((s) => {
          const next = structuredClone(s.vto)
          fn(next)
          return { vto: next }
        }),
      addCoreValue: (text) =>
        set((s) => ({
          vto: { ...s.vto, coreValues: [...s.vto.coreValues, { id: uid(), text }] },
        })),
      updateCoreValue: (id, text) =>
        set((s) => ({
          vto: {
            ...s.vto,
            coreValues: s.vto.coreValues.map((c) => (c.id === id ? { ...c, text } : c)),
          },
        })),
      removeCoreValue: (id) =>
        set((s) => ({
          vto: { ...s.vto, coreValues: s.vto.coreValues.filter((c) => c.id !== id) },
          people: s.people.map((p) => {
            const values = { ...p.values }
            delete values[id]
            return { ...p, values }
          }),
        })),

      /* ------------------------------ seats ------------------------------ */
      addSeat: (parentId, name = 'New Seat') => {
        const seat: Seat = { id: uid(), name, parentId, personIds: [], roles: [] }
        set((s) => ({ seats: [...s.seats, seat] }))
        return seat
      },
      updateSeat: (id, patch) =>
        set((s) => ({ seats: s.seats.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeSeat: (id) =>
        set((s) => {
          // Re-parent children onto the removed seat's parent so nothing is orphaned.
          const seat = s.seats.find((x) => x.id === id)
          return {
            seats: s.seats
              .filter((x) => x.id !== id)
              .map((x) => (x.parentId === id ? { ...x, parentId: seat?.parentId ?? null } : x)),
          }
        }),

      /* ------------------------------ rocks ------------------------------ */
      addRock: (quarter, patch) => {
        const rock: Rock = {
          id: uid(),
          title: '',
          ownerId: null,
          quarter,
          status: 'on-track',
          isCompany: true,
          milestones: [],
          notes: '',
          ...patch,
        }
        set((s) => ({ rocks: [...s.rocks, rock] }))
        return rock
      },
      updateRock: (id, patch) =>
        set((s) => ({ rocks: s.rocks.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      removeRock: (id) => set((s) => ({ rocks: s.rocks.filter((r) => r.id !== id) })),
      addMilestone: (rockId, text, due) =>
        set((s) => ({
          rocks: s.rocks.map((r) =>
            r.id === rockId
              ? { ...r, milestones: [...r.milestones, { id: uid(), text, due, done: false }] }
              : r,
          ),
        })),
      updateMilestone: (rockId, msId, patch) =>
        set((s) => ({
          rocks: s.rocks.map((r) =>
            r.id === rockId
              ? {
                  ...r,
                  milestones: r.milestones.map((m) => (m.id === msId ? { ...m, ...patch } : m)),
                }
              : r,
          ),
        })),
      removeMilestone: (rockId, msId) =>
        set((s) => ({
          rocks: s.rocks.map((r) =>
            r.id === rockId
              ? { ...r, milestones: r.milestones.filter((m) => m.id !== msId) }
              : r,
          ),
        })),
      copyRocksToQuarter: (fromQuarter, toQuarter) => {
        const carry = get()
          .rocks.filter((r) => r.quarter === fromQuarter && r.status !== 'done')
          .map((r) => ({
            ...r,
            id: uid(),
            quarter: toQuarter,
            status: 'on-track' as const,
            milestones: r.milestones.map((m) => ({ ...m, id: uid(), done: false })),
          }))
        if (carry.length) set((s) => ({ rocks: [...s.rocks, ...carry] }))
        return carry.length
      },

      /* ---------------------------- scorecard ---------------------------- */
      addMeasurable: (patch) => {
        const m: Measurable = {
          id: uid(),
          name: '',
          ownerId: null,
          goal: 0,
          goalMax: null,
          comparator: '>=',
          format: 'number',
          values: {},
          ...patch,
        }
        set((s) => ({ measurables: [...s.measurables, m] }))
        return m
      },
      updateMeasurable: (id, patch) =>
        set((s) => ({
          measurables: s.measurables.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMeasurable: (id) =>
        set((s) => ({ measurables: s.measurables.filter((m) => m.id !== id) })),
      setWeekValue: (id, week, value) =>
        set((s) => ({
          measurables: s.measurables.map((m) =>
            m.id === id ? { ...m, values: { ...m.values, [week]: value } } : m,
          ),
        })),
      reorderMeasurable: (id, dir) =>
        set((s) => {
          const list = [...s.measurables]
          const i = list.findIndex((m) => m.id === id)
          const j = i + dir
          if (i < 0 || j < 0 || j >= list.length) return {}
          ;[list[i], list[j]] = [list[j], list[i]]
          return { measurables: list }
        }),

      /* ------------------------------ issues ----------------------------- */
      addIssue: (text, term = 'short') => {
        const issue: Issue = {
          id: uid(),
          text,
          notes: '',
          term,
          ownerId: null,
          createdAt: today(),
          solvedAt: null,
          priority: null,
        }
        set((s) => ({ issues: [...s.issues, issue] }))
        return issue
      },
      updateIssue: (id, patch) =>
        set((s) => ({ issues: s.issues.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      removeIssue: (id) => set((s) => ({ issues: s.issues.filter((i) => i.id !== id) })),
      solveIssue: (id, solved) =>
        set((s) => ({
          issues: s.issues.map((i) =>
            i.id === id ? { ...i, solvedAt: solved ? today() : null, priority: null } : i,
          ),
        })),
      setIssuePriority: (id, priority) =>
        set((s) => ({
          issues: s.issues.map((i) => {
            if (i.id === id) return { ...i, priority }
            // A priority slot holds one issue at a time.
            if (priority !== null && i.priority === priority) return { ...i, priority: null }
            return i
          }),
        })),

      /* ------------------------------ to-dos ----------------------------- */
      addTodo: (text, ownerId = null, due) => {
        const todo: Todo = {
          id: uid(),
          text,
          ownerId,
          createdAt: today(),
          due: due ?? addDays(today(), 7),
          done: false,
        }
        set((s) => ({ todos: [...s.todos, todo] }))
        return todo
      },
      updateTodo: (id, patch) =>
        set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTodo: (id) => set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
      clearDoneTodos: () => set((s) => ({ todos: s.todos.filter((t) => !t.done) })),

      /* ---------------------------- headlines ---------------------------- */
      addHeadline: (text, kind) =>
        set((s) => ({ headlines: [...s.headlines, { id: uid(), text, kind }] })),
      removeHeadline: (id) =>
        set((s) => ({ headlines: s.headlines.filter((h) => h.id !== id) })),

      /* ----------------------------- meetings ---------------------------- */
      saveMeeting: (m) =>
        set((s) => ({ meetings: [m, ...s.meetings.filter((x) => x.id !== m.id)] })),
      removeMeeting: (id) => set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) })),

      /* ------------------------------- data ------------------------------ */
      replaceAll: (data) =>
        set(() => ({ ...emptyData(), ...data, version: DATA_VERSION, sampleMode: false })),
      reset: () => set(() => ({ ...emptyData(), sampleMode: false, stashed: null })),
      setSaveMeta: (meta) => set(() => ({ ...meta })),

      /**
       * Sample mode stashes whatever you already have and hands back a
       * fictional company to poke at. Exiting restores the stash untouched,
       * so nothing you typed is ever traded for a demo.
       */
      enterSampleMode: () => {
        const s = get()
        if (s.sampleMode) return
        const stashed = snapshot(s)
        set({ ...sampleData(), sampleMode: true, stashed })
      },
      exitSampleMode: () => {
        const { stashed } = get()
        set({ ...(stashed ?? emptyData()), sampleMode: false, stashed: null })
      },
    }),
    { name: 'eos-traction', version: DATA_VERSION },
  ),
)
