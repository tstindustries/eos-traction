/**
 * Plain-language explanations of every EOS concept this app implements, so
 * someone who has not read Traction can use it without guessing.
 *
 * These are original explanations of the framework, not excerpts from the book.
 * `component` maps each term to one of the six components of EOS, which is how
 * the Guide page groups them.
 */

export type Component =
  | 'Vision'
  | 'People'
  | 'Data'
  | 'Issues'
  | 'Process'
  | 'Traction'
  | 'Foundations'

export type Entry = {
  /** Display name. */
  term: string
  /** What it is. */
  what: string
  /** Why it earns its place — the problem it solves. */
  why: string
  /** The practical constraint people get wrong. */
  rule?: string
  component: Component
}

const ENTRIES = {
  /* ---------------------------- foundations ---------------------------- */
  eos: {
    term: 'EOS',
    what: 'The Entrepreneurial Operating System: a set of simple, connected tools for running a small company — a vision everyone shares, the right people held accountable, a handful of numbers watched weekly, and a rhythm of meetings that keeps it all moving.',
    why: 'Most small companies do not fail from lack of ideas. They stall because nobody agrees on the priorities, accountability is fuzzy, and problems get discussed repeatedly without ever being solved.',
    rule: 'It is deliberately simple. The value is in doing it consistently for years, not in customising it.',
    component: 'Foundations',
  },
  sixComponents: {
    term: 'The six components',
    what: 'Vision, People, Data, Issues, Process and Traction. Every tool in this app belongs to one of them.',
    why: 'They are a diagnostic. When something feels wrong in the business, it is almost always weak in one specific component — which tells you which tool to reach for instead of guessing.',
    component: 'Foundations',
  },
  visionary: {
    term: 'Visionary',
    what: 'The seat for big ideas, culture, major relationships and selling the vision outward. Often the founder.',
    why: 'The strengths that start a company — restlessness, appetite for new ideas — are not the strengths that run one. Naming this as its own seat lets someone be great at it without being blamed for weak execution.',
    component: 'People',
  },
  integrator: {
    term: 'Integrator',
    what: 'The seat accountable for running the business day to day: the leadership team, the P&L, removing obstacles, and making the plan actually happen.',
    why: 'It is the counterweight to the Visionary. Without it, ideas pile up and nothing ships. The pairing of these two seats is the single biggest unlock for most owner-led companies.',
    rule: 'One person. Splitting the Integrator seat between two people reliably fails.',
    component: 'People',
  },

  /* ------------------------------- vision ------------------------------ */
  vto: {
    term: 'Vision / Traction Organizer',
    what: 'A two-page document answering eight questions about where the company is going and how it will get there. Page one is long-range vision; page two is the near-term plan.',
    why: 'Vision that lives only in the founder\'s head cannot be shared, argued with, or executed. Two pages forces the decisions to be specific enough that a team can actually align on them.',
    rule: 'Two pages. If it needs more, the thinking is not finished.',
    component: 'Vision',
  },
  coreValues: {
    term: 'Core Values',
    what: 'A short list of the behaviours that define who belongs here — not aspirations, but descriptions of your best people already.',
    why: 'They only earn their keep if you actually use them: hiring, reviewing, promoting and firing on them. Values nobody is ever held to are decoration.',
    rule: 'Three to seven. Discover them by looking at your best people, not by brainstorming ideals.',
    component: 'Vision',
  },
  coreFocus: {
    term: 'Core Focus',
    what: 'Two things held together: why the company exists beyond making money, and the one thing it is genuinely best at.',
    why: 'It is the filter for opportunities. Most small companies are hurt more by attractive distractions than by competitors, and without this you have no principled reason to say no.',
    component: 'Vision',
  },
  purpose: {
    term: 'Purpose / Cause / Passion',
    what: 'The reason the company exists, stated in a way that would still be true if the product changed entirely.',
    why: 'It is what makes work feel worth doing, and it outlives any particular product line.',
    rule: 'If it could appear in a competitor\'s deck unchanged, it is too generic.',
    component: 'Vision',
  },
  niche: {
    term: 'Niche',
    what: 'The one thing you do better than anyone, in a single sentence.',
    why: 'Being narrow is what makes you findable and referable. Companies that describe themselves broadly get chosen for price, because nothing else distinguishes them.',
    component: 'Vision',
  },
  tenYear: {
    term: '10-Year Target',
    what: 'One long-range, measurable objective that everyone in the company could repeat from memory.',
    why: 'It gives the three-year picture and the annual plan something to point at. Without it, each year\'s goals are disconnected from the last.',
    rule: 'Big, specific and measurable. "Be the best" is not a target.',
    component: 'Vision',
  },
  marketingStrategy: {
    term: 'Marketing Strategy',
    what: 'Four decisions written down: exactly who you sell to, the three things that make you different, the process you deliver, and the promise that removes buying risk.',
    why: 'It turns selling from improvisation into something repeatable that you can hand to a new hire.',
    component: 'Vision',
  },
  targetMarket: {
    term: 'Target Market — The List',
    what: 'The demographic, geographic and behavioural profile of your ideal customer, specific enough that you could build an actual list of names.',
    why: 'If you cannot list them, you cannot market to them — you can only advertise and hope. The specificity is the whole point.',
    component: 'Vision',
  },
  threeUniques: {
    term: 'Three Uniques',
    what: 'Three things that are true of you and not simultaneously true of your competitors.',
    why: 'Any one of them alone is probably copyable. The combination is what makes you the only real choice for the right customer.',
    rule: 'Test each one by asking whether a competitor could claim it too. If yes, it is table stakes, not a unique.',
    component: 'Vision',
  },
  provenProcess: {
    term: 'Proven Process',
    what: 'Your way of delivering, named and drawn as three to seven steps on a single page.',
    why: 'Shown to a prospect it makes you look like you have done this before. Used internally it means quality does not depend on which person happens to pick up the work.',
    rule: 'Name each step. Naming is what makes it teachable.',
    component: 'Process',
  },
  guarantee: {
    term: 'Guarantee',
    what: 'A promise that removes the biggest fear a customer has about buying from you.',
    why: 'It forces you to find out what that fear actually is, which is useful even if you never advertise the guarantee.',
    component: 'Vision',
  },
  threeYear: {
    term: '3-Year Picture',
    what: 'A description of the company on a specific future date, written in the present tense as though you were standing in it.',
    why: 'Numbers alone do not align people. A concrete picture — what the team looks like, how it feels, what customers say — is something a group can genuinely agree on or push back against.',
    rule: 'Present tense. "We have 40 people" beats "we will grow to 40 people".',
    component: 'Vision',
  },
  oneYearPlan: {
    term: '1-Year Plan',
    what: 'Revenue, profit, a few measurables, and three to seven goals for the current year.',
    why: 'It is the bridge between a three-year picture and this quarter\'s work. Everything on it should be a step toward the picture.',
    rule: 'Three to seven goals. More than seven and the team will quietly pick their own.',
    component: 'Vision',
  },

  /* ------------------------------- people ------------------------------ */
  accountabilityChart: {
    term: 'Accountability Chart',
    what: 'The structure of the company drawn as seats and their major roles, filled in with people only afterwards.',
    why: 'An org chart shows reporting lines. This shows who is accountable for what — which is what actually breaks. Building the structure before placing people also stops you from designing the company around who you happen to have.',
    rule: 'One name per seat. If two people share accountability, nobody has it.',
    component: 'People',
  },
  seat: {
    term: 'Seat',
    what: 'A position defined by the handful of things it is accountable for — not a job title.',
    why: 'Titles drift and mean different things to different people. A list of roles is checkable: either those things are getting done or they are not.',
    rule: 'Up to five major roles. If a seat needs more, it is really two seats.',
    component: 'People',
  },
  lma: {
    term: 'LMA',
    what: 'Lead, Manage, Accountability — the three things anyone with people reporting to them owes their team.',
    why: 'Most "management problems" are one of these missing: no direction, no support, or no consequences. Naming which one makes it fixable.',
    component: 'People',
  },
  peopleAnalyzer: {
    term: 'People Analyzer',
    what: 'A grid rating each person against your core values, plus the three GWC questions for the seat they are in.',
    why: 'It turns "I have a feeling about this person" into something specific and discussable. Usually it also reveals that the problem is the seat, not the person.',
    component: 'People',
  },
  ratings: {
    term: '+ / +/− / −',
    what: 'How you rate someone on a core value: they live it, they are inconsistent, or they do not.',
    why: 'Three options force a decision. A five-point scale lets everyone hide in the middle.',
    component: 'People',
  },
  theBar: {
    term: 'The Bar',
    what: 'The minimum standard for staying: mostly "+" on your core values, and yes to all three GWC questions.',
    why: 'Setting it in advance, in the abstract, is far easier than deciding case by case about a specific person you like.',
    component: 'People',
  },
  gwc: {
    term: 'GWC',
    what: 'Three yes-or-no questions about a person in a specific seat. Do they Get it — genuinely understand the role? Do they Want it — actually want to do this job? Do they have the Capacity to do it — the time, skill and emotional bandwidth?',
    why: 'All three must be yes. Each "no" has a different fix: getting it cannot be trained, wanting it cannot be incentivised for long, and capacity can sometimes be solved by changing the seat.',
    rule: 'Yes or no. "Sort of" is a no.',
    component: 'People',
  },
  rightPersonRightSeat: {
    term: 'Right person, right seat',
    what: 'Right person means they share your core values. Right seat means GWC is all yes.',
    why: 'Separating the two is the useful part. A great person in the wrong seat is a reassignment; someone who does not share the values is a different and harder conversation.',
    component: 'People',
  },

  /* -------------------------------- data ------------------------------- */
  scorecard: {
    term: 'Scorecard',
    what: 'A handful of weekly numbers, each owned by one person, tracked as a rolling thirteen weeks.',
    why: 'Monthly financials tell you about a problem weeks after you could have fixed it. Weekly leading numbers let you catch a bad trend while it is still small.',
    rule: 'Five to fifteen numbers. Thirteen weeks so you can see the trend, not just the last reading.',
    component: 'Data',
  },
  measurable: {
    term: 'Measurable',
    what: 'One number, one owner, one weekly goal.',
    why: 'A number nobody owns is information. A number one person owns is accountability — and only then does the weekly review have any teeth.',
    rule: 'Activity you control beats outcomes you do not. "Calls made" moves before "revenue" does.',
    component: 'Data',
  },
  goalComparator: {
    term: 'Goal direction',
    what: 'Whether hitting the goal means at least, at most, exactly, or within a range.',
    why: 'Some numbers should go up and some should go down. Setting the direction is what lets the app decide red or green without you thinking about it.',
    component: 'Data',
  },

  /* ------------------------------- issues ------------------------------ */
  issuesList: {
    term: 'Issues List',
    what: 'One running list of everything in the way — problems, ideas, opportunities, worries.',
    why: 'Writing an issue down stops it circling in your head and stops it being raised repeatedly in hallways. It also means the weekly meeting has a real agenda rather than whatever is loudest.',
    rule: 'Add them the moment they occur to you, not the morning of the meeting.',
    component: 'Issues',
  },
  shortVsLongTerm: {
    term: 'Short vs long term',
    what: 'Short-term issues get solved in this week\'s meeting. Long-term ones are parked for the quarterly session.',
    why: 'Without the split, one big strategic question eats the whole weekly meeting and the ten small blockers never get cleared.',
    component: 'Issues',
  },
  ids: {
    term: 'IDS',
    what: 'Identify, Discuss, Solve. Identify the real issue underneath the symptom, discuss it once, then agree a specific action with an owner.',
    why: 'Teams routinely spend an hour discussing something and leave with nothing assigned — so it comes back next week. The Solve step is the one people skip.',
    rule: 'One issue at a time, in priority order. Solving three properly beats touching ten.',
    component: 'Issues',
  },
  priorityRanking: {
    term: 'Priority 1-2-3',
    what: 'Marking the three most important issues before you start discussing anything.',
    why: 'Deciding what matters most is much harder once you are already deep in the first topic. Ranking first means the meeting spends its time on the biggest things.',
    component: 'Issues',
  },

  /* ------------------------------ traction ----------------------------- */
  rocks: {
    term: 'Rocks',
    what: 'The three to seven things that must get done in the next ninety days, each with exactly one owner.',
    why: 'Ninety days is short enough to stay urgent and long enough to finish something real. The name is from the idea that if you do not put the big rocks in the jar first, the sand fills it up.',
    rule: 'Three to seven, company-wide. More than seven and none of them are priorities.',
    component: 'Traction',
  },
  companyVsIndividualRocks: {
    term: 'Company vs individual rocks',
    what: 'Company rocks matter to the whole business. Individual rocks are a person\'s own quarterly priority.',
    why: 'It keeps the company list short and focused, without pretending that personal priorities do not exist.',
    component: 'Traction',
  },
  milestones: {
    term: 'Milestones',
    what: 'Dated checkpoints inside a rock.',
    why: 'They are how you know a rock is off track in week three instead of week eleven. A rock with no milestones is usually a rock nobody has actually planned.',
    component: 'Traction',
  },
  rockStatus: {
    term: 'On track / off track',
    what: 'A weekly binary judgement: will this rock be done by the end of the quarter, yes or no?',
    why: 'Percentages invite optimism. Forcing a yes or no surfaces trouble early — and "off track" is not a failure, it is a signal to put it on the issues list.',
    component: 'Traction',
  },
  l10: {
    term: 'Level 10 Meeting',
    what: 'A ninety-minute weekly leadership meeting with a fixed agenda, same day and time every week.',
    why: 'A predictable structure means the meeting stops being a status update and becomes the place problems actually get solved. The sameness is the feature — nobody has to prepare or wonder what it is for.',
    rule: 'Same day, same time, same agenda, start and end on time. Consistency does more work than content.',
    component: 'Traction',
  },
  segue: {
    term: 'Segue',
    what: 'Five minutes at the start where each person shares one personal and one business good-news item.',
    why: 'It marks the transition into the meeting and gets everyone talking. Teams that skip it tend to spend the first fifteen minutes warming up anyway.',
    component: 'Traction',
  },
  headlines: {
    term: 'Headlines',
    what: 'One-line customer and employee news. Good or bad, no discussion.',
    why: 'It surfaces things nobody would formally report — a customer sounding unhappy, someone quietly frustrated — early enough to act. Anything needing a conversation becomes an issue.',
    rule: 'One line each. The moment you start discussing, drop it to the issues list.',
    component: 'Traction',
  },
  todos: {
    term: 'To-Dos',
    what: 'Seven-day commitments that come out of solving issues. Who does what by when.',
    why: 'This is what makes solving an issue stick. Reviewing the list next week — done or not done — is the accountability that makes the whole meeting matter.',
    rule: 'Aim for 90% done each week. Anything taking longer than a week is a rock, not a to-do.',
    component: 'Traction',
  },
  cascadingMessage: {
    term: 'Cascading message',
    what: 'What the leadership team agrees must be communicated to everyone else, by whom, by when.',
    why: 'Decisions made in a closed room and never announced breed the exact rumours you were trying to avoid. Deciding the message in the meeting takes two minutes.',
    component: 'Traction',
  },
  meetingRating: {
    term: 'Meeting rating',
    what: 'Everyone scores the meeting 1–10 at the end.',
    why: 'It is a fast, honest feedback loop. Anything below an eight comes with a reason, and that reason is usually a real issue about how the team works together.',
    rule: 'Average eight or better. Below that, something in the process is broken.',
    component: 'Traction',
  },
  meetingPulse: {
    term: 'Meeting Pulse',
    what: 'The rhythm: Level 10 weekly, a full-day session each quarter to set new rocks, and two days each year to reset the plan.',
    why: 'Each meeting has a different job. Weekly keeps things moving, quarterly resets priorities, annual revisits the vision. Companies that only do one of the three drift.',
    component: 'Traction',
  },
  quarter: {
    term: 'The quarter',
    what: 'The ninety-day planning cycle everything in the app is organised around.',
    why: 'Long enough to finish meaningful work, short enough that you cannot put it off. Set rocks at the start, judge them honestly at the end, then do it again.',
    component: 'Traction',
  },
} as const satisfies Record<string, Entry>

export type GlossaryKey = keyof typeof ENTRIES

/** Re-typed as Entry so optional fields like `rule` stay accessible. */
export const GLOSSARY: Record<GlossaryKey, Entry> = ENTRIES

export const COMPONENT_ORDER: Component[] = [
  'Foundations',
  'Vision',
  'People',
  'Data',
  'Issues',
  'Process',
  'Traction',
]

export const COMPONENT_BLURB: Record<Component, string> = {
  Foundations: 'What the system is and how the pieces fit together.',
  Vision: 'Everyone knowing where the company is going and how it will get there.',
  People: 'Right people in the right seats, with clear accountability.',
  Data: 'A handful of numbers that tell you the truth every week.',
  Issues: 'Problems surfaced, discussed once, and actually solved.',
  Process: 'Your way of doing business, documented and followed.',
  Traction: 'Discipline and accountability — where vision meets execution.',
}

export const byComponent = (c: Component) =>
  (Object.entries(GLOSSARY) as [GlossaryKey, Entry][]).filter(([, e]) => e.component === c)
