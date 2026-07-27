import type { AppData, ID, Issue, Person, Rock, Todo } from '../types'
import { addDays, quarterOf, rollingWeeks, shiftQuarter, today, uid } from './util'

/**
 * A fictional 34-person services company two years into running on EOS.
 * Hand-authored rather than randomised so the numbers tell a coherent story:
 * onboarding time is coming down, cash is climbing, support is stabilising.
 */
export function sampleData(): AppData {
  const fyStartMonth = 1
  const weekEndsOn = 0
  const q = quarterOf(today(), fyStartMonth)
  const prevQ = shiftQuarter(q.key, -1, fyStartMonth)
  const weeks = rollingWeeks(13, weekEndsOn)

  const person = (name: string, title: string): Person => ({
    id: uid(),
    name,
    title,
    values: {},
    gwc: { gets: true, wants: true, capacity: true },
  })

  const ana = person('Ana Reyes', 'Visionary')
  const sam = person('Sam Okafor', 'Integrator')
  const priya = person('Priya Nair', 'Sales & Marketing')
  const marcus = person('Marcus Hale', 'Operations')
  const dana = person('Dana Cho', 'Finance & Admin')
  const jules = person('Jules Whitfield', 'Customer Success')
  const people = [ana, sam, priya, marcus, dana, jules]

  const values = [
    'Do the right thing, even when it costs us',
    'Own the outcome, not the task',
    'Curious and coachable',
    'Say the hard thing early',
    'Leave it better than you found it',
  ].map((text) => ({ id: uid(), text }))

  /* Core-value ratings and GWC — a realistic spread, not all green. */
  const rate = (spec: Record<number, '+' | '+/-' | '-'>) =>
    Object.fromEntries(values.map((v, i) => [v.id, spec[i] ?? '+'])) as Person['values']

  ana.values = rate({ 3: '+/-' })
  sam.values = rate({})
  priya.values = rate({ 1: '+/-' })
  marcus.values = rate({ 0: '+/-', 2: '+/-' })
  marcus.gwc = { gets: true, wants: true, capacity: false }
  dana.values = rate({})
  jules.values = rate({ 3: '-', 4: '+/-' })
  jules.gwc = { gets: true, wants: true, capacity: null }

  /* ------------------------------- seats ------------------------------- */
  const visionary: ID = uid()
  const integrator: ID = uid()
  const seats = [
    {
      id: visionary,
      name: 'Visionary',
      parentId: null,
      personIds: [ana.id],
      roles: ['Big relationships', 'Culture', 'Big ideas & R&D', 'Selling the vision'],
    },
    {
      id: integrator,
      name: 'Integrator',
      parentId: null,
      personIds: [sam.id],
      roles: ['LMA of the leadership team', 'P&L accountability', 'Remove obstacles', 'Special projects'],
    },
    {
      id: uid(),
      name: 'Sales & Marketing',
      parentId: integrator,
      personIds: [priya.id],
      roles: ['Marketing strategy', 'Lead generation', 'Sales process', 'LMA of the sales team'],
    },
    {
      id: uid(),
      name: 'Operations',
      parentId: integrator,
      personIds: [marcus.id],
      roles: ['Delivery', 'The Proven Process', 'Vendor quality', 'LMA of the ops team'],
    },
    {
      id: uid(),
      name: 'Finance & Admin',
      parentId: integrator,
      personIds: [dana.id],
      roles: ['Reporting & forecasting', 'Cash flow', 'Contracts', 'HR administration'],
    },
  ]
  const opsSeat = seats[3].id
  seats.push({
    id: uid(),
    name: 'Customer Success',
    parentId: opsSeat,
    personIds: [jules.id],
    roles: ['Onboarding', 'Renewals', 'Support queue', 'Voice of the customer'],
  })

  /* -------------------------------- v/to -------------------------------- */
  const vto: AppData['vto'] = {
    coreValues: values,
    purpose: 'Help small teams do their best work without burning themselves out.',
    niche: 'Operations software for owner-led service businesses that have outgrown spreadsheets.',
    tenYear: {
      date: `${q.fiscalYear + 10}-12-31`,
      target: '$50M in revenue with 5,000 teams running their whole week on our platform.',
    },
    marketing: {
      targetMarket:
        'Owner-led service businesses. 10–50 employees, $2M–$20M revenue, US & Canada. Already using a CRM, still running operations out of spreadsheets. The owner is in every decision and knows it is a problem.',
      uniques: [
        'Set up in a day, not a quarter',
        'One number per person, every week',
        'A real human answers in under an hour',
      ],
      provenProcess: 'Discover → Configure → Launch → 30-Day Tune-Up → Quarterly Review',
      guarantee:
        'You will run your first full leadership meeting within 14 days, or we refund the setup fee and help you migrate off.',
    },
    threeYear: {
      date: `${q.fiscalYear + 3}-12-31`,
      revenue: '$12M',
      profit: '18%',
      measurables: '600 accounts · 95% logo retention · NPS 55',
      lookLike: [
        'Leadership team of seven, each fully accountable for one seat',
        'Two product lines, each profitable on its own',
        'Named in the top three of our category by an independent review site',
        'Support answers 90% of tickets within the hour, without a night shift',
        'Onboarding takes seven days and does not involve a founder',
        'Every employee can name the company Rocks for the current quarter',
        'We have turned away business that did not fit the niche — twice, on purpose',
        'Revenue is 70% recurring',
      ],
    },
    oneYear: {
      date: `${q.fiscalYear}-12-31`,
      revenue: '$3.4M',
      profit: '11%',
      measurables: '210 accounts · NPS 45 · 92% retention',
      goals: [
        'Ship the mobile app to general availability',
        'Hire and onboard a Head of Customer Success',
        'Reach $280k MRR',
        'Cut onboarding from 21 days to 7',
        'Document the Proven Process and train everyone on it',
      ],
    },
  }

  /* -------------------------------- rocks ------------------------------- */
  const rock = (
    title: string,
    ownerId: ID,
    status: Rock['status'],
    quarter: string,
    isCompany = true,
    milestones: [string, number, boolean][] = [],
    notes = '',
  ): Rock => ({
    id: uid(),
    title,
    ownerId,
    quarter,
    status,
    isCompany,
    notes,
    milestones: milestones.map(([text, dayOffset, done]) => ({
      id: uid(),
      text,
      due: addDays(today(), dayOffset),
      done,
    })),
  })

  const rocks: Rock[] = [
    rock(
      'Mobile app live for every customer',
      priya.id,
      'on-track',
      q.key,
      true,
      [
        ['Beta with 10 accounts', -24, true],
        ['App Store submission', -6, true],
        ['Approval and public launch', 12, false],
        ['Launch email to all 180 accounts', 19, false],
      ],
      'Approval is the only real risk. Apple rejected v1 over the login screen; resubmitted Tuesday.',
    ),
    rock(
      'Proven Process documented and everyone trained',
      marcus.id,
      'off-track',
      q.key,
      true,
      [
        ['Draft the five stages on one page', -18, true],
        ['Review with the leadership team', -4, true],
        ['Record training for each stage', 9, false],
        ['Whole team trained and signed off', 25, false],
      ],
      'Slipped two weeks. Marcus is still covering the support queue — this is really a capacity issue.',
    ),
    rock(
      'Head of Customer Success hired and onboarded',
      sam.id,
      'on-track',
      q.key,
      true,
      [
        ['Job description and comp band agreed', -30, true],
        ['Five candidates through first round', -9, true],
        ['Offer accepted', 8, false],
        ['First day and week-one plan done', 27, false],
      ],
    ),
    rock(
      'Onboarding down to 10 days average',
      jules.id,
      'on-track',
      q.key,
      true,
      [
        ['Map the current 21-day path', -26, true],
        ['Cut the two approval steps', -11, true],
        ['Self-serve data import shipped', 14, false],
      ],
    ),
    rock(
      'Close the books within five days of month end',
      dana.id,
      'done',
      q.key,
      true,
      [
        ['New chart of accounts', -34, true],
        ['Two clean closes in a row', -3, true],
      ],
      'Hit it in both months. Worth keeping as a scorecard number rather than a Rock next quarter.',
    ),
    rock(
      'Interview 20 owners in the target market',
      ana.id,
      'on-track',
      q.key,
      false,
      [
        ['12 interviews done', -8, true],
        ['20 done and written up', 16, false],
      ],
    ),
    rock('Rewrite the pricing page around the Three Uniques', priya.id, 'off-track', q.key, false, [
      ['Copy drafted', -2, true],
      ['Live', 11, false],
    ]),
    /* Last quarter, for the history view */
    rock('Launch the partner referral program', priya.id, 'done', prevQ),
    rock('Move support to a single shared inbox', marcus.id, 'done', prevQ),
    rock('Get to 150 accounts', sam.id, 'done', prevQ),
    rock('Replace the legacy billing integration', dana.id, 'off-track', prevQ, true, [], 'Carried into this quarter as a to-do instead — smaller than we thought.'),
  ]

  /* ------------------------------ scorecard ----------------------------- */
  const series = (nums: (number | null)[]) =>
    Object.fromEntries(weeks.map((w, i) => [w, nums[i] ?? null]))

  const measurables = [
    {
      name: 'Weekly revenue',
      ownerId: dana.id,
      goal: 62000,
      comparator: '>=' as const,
      format: 'currency' as const,
      nums: [58500, 61200, 64800, 59900, 66300, 63100, 68900, 62400, 57800, 65500, 71200, 66800, 64100],
    },
    {
      name: 'New leads',
      ownerId: priya.id,
      goal: 40,
      comparator: '>=' as const,
      format: 'number' as const,
      nums: [44, 38, 51, 47, 42, 36, 49, 53, 45, 41, 48, 52, 46],
    },
    {
      name: 'Demos booked',
      ownerId: priya.id,
      goal: 12,
      comparator: '>=' as const,
      format: 'number' as const,
      nums: [11, 13, 15, 12, 9, 14, 16, 12, 10, 13, 17, 14, 10],
    },
    {
      name: 'New accounts',
      ownerId: priya.id,
      goal: 4,
      comparator: '>=' as const,
      format: 'number' as const,
      nums: [3, 5, 4, 6, 2, 4, 5, 7, 4, 3, 6, 5, null],
    },
    {
      name: 'Avg onboarding days',
      ownerId: jules.id,
      goal: 10,
      comparator: '<=' as const,
      format: 'number' as const,
      nums: [21, 19, 18, 17, 15, 16, 13, 12, 14, 11, 10, 9, 10],
    },
    {
      name: 'First-hour response rate',
      ownerId: marcus.id,
      goal: 90,
      comparator: '>=' as const,
      format: 'percent' as const,
      nums: [82, 85, 88, 91, 87, 93, 90, 94, 89, 92, 95, 91, 93],
    },
    {
      name: 'Open escalations',
      ownerId: marcus.id,
      goal: 3,
      comparator: '<=' as const,
      format: 'number' as const,
      nums: [6, 5, 4, 4, 3, 2, 3, 5, 4, 2, 1, 3, 2],
    },
    {
      name: 'Cash in bank',
      ownerId: dana.id,
      goal: 400000,
      comparator: '>=' as const,
      format: 'currency' as const,
      nums: [388000, 395000, 402000, 411000, 398000, 415000, 428000, 435000, 421000, 440000, 455000, 448000, 462000],
    },
    {
      name: 'To-do completion',
      ownerId: sam.id,
      goal: 90,
      comparator: '>=' as const,
      format: 'percent' as const,
      nums: [75, 80, 88, 90, 92, 85, 90, 95, 88, 91, 100, 92, 90],
    },
  ].map(({ nums, ...m }) => ({ id: uid(), goalMax: null, values: series(nums), ...m }))

  /* -------------------------------- issues ------------------------------ */
  const issue = (
    text: string,
    term: Issue['term'],
    ownerId: ID | null,
    daysAgo: number,
    priority: number | null = null,
    notes = '',
  ): Issue => ({
    id: uid(),
    text,
    notes,
    term,
    ownerId,
    createdAt: addDays(today(), -daysAgo),
    solvedAt: null,
    priority,
  })

  const issues: Issue[] = [
    issue(
      'Marcus is doing two jobs — ops and the support queue',
      'short',
      sam.id,
      9,
      1,
      'Shows up as the Proven Process Rock slipping and as capacity "no" on his GWC. The real question is whether Customer Success takes the queue on day one.',
    ),
    issue('Two people think they own pricing', 'short', sam.id, 6, 2),
    issue('Demos booked missed the goal three weeks out of thirteen', 'short', priya.id, 3, 3),
    issue('Support queue spikes every Monday morning', 'short', marcus.id, 12),
    issue('Mobile app approval could slip past launch date', 'short', priya.id, 2),
    issue('Nobody owns the renewal conversation before month 11', 'short', jules.id, 5),
    issue('Do we open a second office or commit to remote?', 'long', ana.id, 40),
    issue('Our contract template has never been reviewed by counsel', 'long', dana.id, 33),
    issue('Second product line — build, buy or partner?', 'long', ana.id, 21),
    issue('We have no plan for what happens if Sam is out for a month', 'long', ana.id, 15),
  ]
  const solved: Issue[] = [
    { ...issue('Sales and ops disagree on what "sold" means', 'short', priya.id, 20), solvedAt: addDays(today(), -13), notes: 'Defined it as signed order form, not verbal. Added to the Proven Process handoff step.' },
    { ...issue('Weekly revenue number was being reported two different ways', 'short', dana.id, 27), solvedAt: addDays(today(), -20), notes: 'Booked revenue, not cash collected. Dana owns the number.' },
    { ...issue('L10 meetings were running to two hours', 'short', sam.id, 34), solvedAt: addDays(today(), -27), notes: 'We were solving in the Rock review. Moved everything to IDS and held the clock.' },
  ]

  /* -------------------------------- to-dos ------------------------------ */
  const todo = (text: string, ownerId: ID, dueOffset: number, done = false): Todo => ({
    id: uid(),
    text,
    ownerId,
    createdAt: addDays(today(), -7 + Math.min(0, dueOffset)),
    due: addDays(today(), dueOffset),
    done,
  })
  const todos: Todo[] = [
    todo('Send the revised pricing one-pager to Sam', priya.id, 3),
    todo('Draft the Customer Success week-one plan', sam.id, 5),
    todo('Book the quarterly offsite room', dana.id, -2),
    todo('Chase Apple on the review status', priya.id, 1),
    todo('Get the contract template to counsel for a quote', dana.id, 4),
    todo('Write up the first 12 owner interviews', ana.id, 6),
    todo('Publish the Proven Process one-pager internally', marcus.id, -5),
    todo('Confirm the legacy billing cutover date', dana.id, 2),
    todo('Post the Head of CS role on three boards', sam.id, -9, true),
    todo('Set up the shared support inbox rota', marcus.id, -4, true),
    todo('Send Northwind their renewal paperwork', jules.id, -1, true),
  ]

  /* ------------------------ headlines and meetings ---------------------- */
  const headlines = [
    { id: uid(), text: 'Northwind renewed for two years and referred two more', kind: 'customer' as const },
    { id: uid(), text: 'Cascade Plumbing churned — they never finished onboarding', kind: 'customer' as const },
    { id: uid(), text: 'Priya passed her first year; the team took her to lunch', kind: 'employee' as const },
    { id: uid(), text: 'Two support hires start on the 14th', kind: 'employee' as const },
  ]

  const meeting = (
    daysAgo: number,
    ratings: [ID, number][],
    cascading: string,
    notes: string,
    solvedCount: number,
  ) => ({
    id: uid(),
    date: addDays(today(), -daysAgo),
    durations: { segue: 320, scorecard: 295, rocks: 340, headlines: 260, todos: 275, ids: 3480, conclude: 290 },
    ratings: ratings.map(([personId, score]) => ({ personId, score })),
    headlines: [],
    cascading,
    issuesSolved: solved.slice(0, solvedCount).map((i) => i.id),
    notes,
  })

  const meetings = [
    meeting(
      7,
      [[ana.id, 9], [sam.id, 8], [priya.id, 9], [marcus.id, 7], [dana.id, 9], [jules.id, 8]],
      'Mobile app resubmitted to Apple — nobody promises customers a date until we have approval.',
      'Good segue. Marcus flagged capacity again; Sam took it as an issue rather than solving it in the room.',
      1,
    ),
    meeting(
      14,
      [[ana.id, 8], [sam.id, 8], [priya.id, 7], [marcus.id, 6], [dana.id, 8], [jules.id, 8]],
      'Booked revenue is the number, owned by Dana. One definition, one source.',
      'Ran four minutes over on IDS. Two issues solved properly, one deferred to the quarterly.',
      2,
    ),
    meeting(
      21,
      [[ana.id, 7], [sam.id, 9], [priya.id, 8], [marcus.id, 7], [dana.id, 8], [jules.id, 7]],
      'The Proven Process is five stages, and everyone will be trained on it this quarter.',
      'First meeting that finished inside 90 minutes. Holding the clock is what did it.',
      3,
    ),
  ]

  return {
    version: 1,
    settings: {
      companyName: 'Northgate Systems',
      fyStartMonth,
      weekEndsOn,
      theme: 'system',
    },
    people,
    vto,
    seats,
    rocks,
    measurables,
    issues: [...issues, ...solved],
    todos,
    headlines,
    meetings,
  }
}
