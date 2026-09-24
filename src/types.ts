export type ID = string

/** Core-value rating used by the People Analyzer. */
export type Rating = '+' | '+/-' | '-'
export type GWC = { gets: boolean | null; wants: boolean | null; capacity: boolean | null }

export type Person = {
  id: ID
  name: string
  title: string
  /** coreValueId -> rating */
  values: Record<ID, Rating>
  gwc: GWC
  archived?: boolean
}

export type CoreValue = { id: ID; text: string }

export type Vto = {
  coreValues: CoreValue[]
  purpose: string
  niche: string
  tenYear: { date: string; target: string }
  marketing: {
    targetMarket: string
    uniques: [string, string, string]
    provenProcess: string
    guarantee: string
  }
  threeYear: {
    date: string
    revenue: string
    profit: string
    measurables: string
    lookLike: string[]
  }
  oneYear: {
    date: string
    revenue: string
    profit: string
    measurables: string
    goals: string[]
  }
}

export type RockStatus = 'on-track' | 'off-track' | 'done'
export type Milestone = { id: ID; text: string; due: string; done: boolean }

export type Rock = {
  id: ID
  title: string
  ownerId: ID | null
  /** e.g. "2026-Q3" */
  quarter: string
  status: RockStatus
  isCompany: boolean
  milestones: Milestone[]
  notes: string
}

export type Comparator = '>=' | '<=' | '=' | 'between'

export type Measurable = {
  id: ID
  name: string
  ownerId: ID | null
  goal: number
  goalMax: number | null
  comparator: Comparator
  format: 'number' | 'currency' | 'percent'
  /** week-ending ISO date -> value */
  values: Record<string, number | null>
}

export type IssueTerm = 'short' | 'long'

export type Issue = {
  id: ID
  text: string
  notes: string
  term: IssueTerm
  ownerId: ID | null
  createdAt: string
  solvedAt: string | null
  /** 1..3 while chosen as an IDS priority */
  priority: number | null
}

export type Todo = {
  id: ID
  text: string
  ownerId: ID | null
  createdAt: string
  due: string
  done: boolean
}

export type Seat = {
  id: ID
  name: string
  parentId: ID | null
  personIds: ID[]
  roles: string[]
}

export type Headline = { id: ID; text: string; kind: 'customer' | 'employee' }

export type Meeting = {
  id: ID
  date: string
  /** section key -> seconds spent */
  durations: Record<string, number>
  ratings: { personId: ID; score: number }[]
  headlines: Headline[]
  cascading: string
  issuesSolved: ID[]
  notes: string
}

export type Settings = {
  companyName: string
  /** 1-12; start month of the fiscal year */
  fyStartMonth: number
  /** 0 = Sunday … 6 = Saturday; day a scorecard week ends on */
  weekEndsOn: number
  theme: 'system' | 'light' | 'dark'
}

/** Who saved the document last, and which save it was. Travels with exports. */
export type SaveMeta = {
  /** Increments by one on every Save to the shared location; 0 = never saved. */
  rev: number
  /** ISO timestamp of that save. */
  updatedAt: string
  /** Display name typed in Settings by whoever pressed Save. */
  updatedBy: string
}

export type AppData = {
  version: number
  rev?: number
  updatedAt?: string
  updatedBy?: string
  settings: Settings
  people: Person[]
  vto: Vto
  seats: Seat[]
  rocks: Rock[]
  measurables: Measurable[]
  issues: Issue[]
  todos: Todo[]
  headlines: Headline[]
  meetings: Meeting[]
}
