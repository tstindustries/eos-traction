import { useEffect, useState } from 'react'
import { useStore } from './store'
import { clsx } from './lib/util'
import { Modal } from './components/ui'
import Dashboard from './screens/Dashboard'
import VtoScreen from './screens/Vto'
import RocksScreen from './screens/Rocks'
import ScorecardScreen from './screens/Scorecard'
import L10Screen from './screens/L10'
import IssuesScreen from './screens/Issues'
import TodosScreen from './screens/Todos'
import AccountabilityScreen from './screens/Accountability'
import PeopleScreen from './screens/People'
import SettingsScreen from './screens/Settings'
import GuideScreen from './screens/Guide'

type Route =
  | 'dashboard'
  | 'vto'
  | 'rocks'
  | 'scorecard'
  | 'l10'
  | 'issues'
  | 'todos'
  | 'accountability'
  | 'people'
  | 'guide'
  | 'settings'

const ROUTES: Record<Route, () => React.ReactElement> = {
  dashboard: Dashboard,
  vto: VtoScreen,
  rocks: RocksScreen,
  scorecard: ScorecardScreen,
  l10: L10Screen,
  issues: IssuesScreen,
  todos: TodosScreen,
  accountability: AccountabilityScreen,
  people: PeopleScreen,
  guide: GuideScreen,
  settings: SettingsScreen,
}

const NAV: { route: Route; label: string; short: string; icon: string; primary?: boolean }[] = [
  { route: 'dashboard', label: 'Dashboard', short: 'Home', icon: 'grid', primary: true },
  { route: 'vto', label: 'Vision / Traction', short: 'V/TO', icon: 'compass' },
  { route: 'rocks', label: 'Rocks', short: 'Rocks', icon: 'rock', primary: true },
  { route: 'scorecard', label: 'Scorecard', short: 'Scorecard', icon: 'chart', primary: true },
  { route: 'l10', label: 'Level 10 Meeting', short: 'L10', icon: 'timer', primary: true },
  { route: 'issues', label: 'Issues', short: 'Issues', icon: 'spark' },
  { route: 'todos', label: 'To-Dos', short: 'To-Dos', icon: 'check' },
  { route: 'accountability', label: 'Accountability Chart', short: 'Chart', icon: 'org' },
  { route: 'people', label: 'People Analyzer', short: 'People', icon: 'people' },
  { route: 'guide', label: 'Guide', short: 'Guide', icon: 'book' },
  { route: 'settings', label: 'Settings', short: 'Settings', icon: 'gear' },
]

const readHash = (): Route => {
  const h = window.location.hash.replace(/^#\/?/, '') as Route
  return h in ROUTES ? h : 'dashboard'
}

function Icon({ name, className }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
    compass: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m14.8 9.2-1.6 4-4 1.6 1.6-4z" />
      </>
    ),
    rock: <path d="M12 3.5 20 9v6l-8 5.5L4 15V9z" />,
    chart: <path d="M4 20V9m5 11V4m5 16v-7m5 7V7" />,
    timer: (
      <>
        <circle cx="12" cy="13" r="7.5" />
        <path d="M12 9.5V13l2.5 1.5M9.5 3h5" />
      </>
    ),
    spark: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v5.5M12 16.2v.6" />
      </>
    ),
    check: (
      <>
        <path d="M4 6h9M4 12h9M4 18h6" />
        <path d="m16 11.5 2 2 4-4" />
      </>
    ),
    org: (
      <>
        <rect x="9" y="3" width="6" height="4.5" rx="1" />
        <rect x="3" y="16.5" width="6" height="4.5" rx="1" />
        <rect x="15" y="16.5" width="6" height="4.5" rx="1" />
        <path d="M12 7.5v5.5m0 0H6v3.5m6-3.5h6v3.5" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20c0-3.3 2.5-5.4 5.5-5.4s5.5 2.1 5.5 5.4M16 5.2a3.2 3.2 0 0 1 0 6M17.5 20h3c0-2.6-1.2-4.3-3-5" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
        <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14v16h4.5a1.5 1.5 0 0 0 1.5-1.5z" />
      </>
    ),
    gear: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2.8v2.4M12 18.8v2.4M4.5 12H2.1m19.8 0h-2.4M6.7 6.7 5 5m14 14-1.7-1.7M6.7 17.3 5 19M19 5l-1.7 1.7" />
      </>
    ),
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  )
}

export default function App() {
  const [route, setRoute] = useState<Route>(readHash)
  const [moreOpen, setMoreOpen] = useState(false)
  const theme = useStore((s) => s.settings.theme)
  const companyName = useStore((s) => s.settings.companyName)
  const openIssues = useStore((s) => s.issues.filter((i) => !i.solvedAt).length)
  const openTodos = useStore((s) => s.todos.filter((t) => !t.done).length)
  const sampleMode = useStore((s) => s.sampleMode)
  const exitSampleMode = useStore((s) => s.exitSampleMode)

  useEffect(() => {
    const onHash = () => {
      setRoute(readHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    if (!window.location.hash) window.location.replace('#/dashboard')
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Theme goes on <html> so native form controls inherit it via color-scheme.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  const go = (r: Route) => {
    setMoreOpen(false)
    window.location.hash = `#/${r}`
  }

  const Screen = ROUTES[route]
  const badge = (r: Route) => (r === 'issues' ? openIssues : r === 'todos' ? openTodos : 0)

  return (
    <div className="min-h-[100dvh] lg:flex">
      <aside className="no-print sticky top-0 hidden h-[100dvh] w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="px-5 pt-6 pb-5">
          <p className="font-display text-lg leading-tight">{companyName || 'Your Company'}</p>
          <p className="mt-0.5 text-[0.7rem] font-semibold tracking-[0.14em] text-brand uppercase">
            Traction
          </p>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 pb-6">
          {NAV.map((n) => (
            <button
              key={n.route}
              onClick={() => go(n.route)}
              aria-current={route === n.route ? 'page' : undefined}
              className={clsx(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[0.87rem] transition-colors',
                route === n.route
                  ? 'bg-brand-soft font-semibold text-brand'
                  : 'text-muted hover:bg-surface-2 hover:text-ink',
              )}
            >
              <Icon name={n.icon} className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 truncate">{n.label}</span>
              {badge(n.route) > 0 && (
                <span className="rounded-full bg-surface-2 px-1.5 text-[0.7rem] font-semibold text-muted">
                  {badge(n.route)}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
        <div className="min-w-0">
          <p className="truncate font-display text-base leading-none">
            {companyName || 'Your Company'}
          </p>
          <p className="mt-0.5 text-[0.62rem] font-semibold tracking-[0.14em] text-brand uppercase">
            Traction
          </p>
        </div>
        <button
          onClick={() => setMoreOpen(true)}
          className="-mr-2 flex h-10 items-center gap-1.5 rounded-lg px-2 text-sm text-muted"
        >
          Menu
          <Icon name="grid" className="h-4 w-4" />
        </button>
      </header>

      <main className="min-w-0 flex-1">
        {sampleMode && (
          <div className="no-print flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-brand/25 bg-brand-soft px-4 py-2 sm:px-6">
            <span className="text-[0.7rem] font-bold tracking-[0.1em] text-brand uppercase">
              Sample mode
            </span>
            <span className="min-w-0 flex-1 text-xs text-brand/90">
              Fictional data. Your own is set aside and comes back when you exit.
            </span>
            <button
              onClick={exitSampleMode}
              className="rounded-md bg-brand px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-hover"
            >
              Exit
            </button>
          </div>
        )}
        <Screen />
      </main>

      <nav
        aria-label="Primary"
        className="no-print fixed bottom-0 z-30 flex w-full items-stretch border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {NAV.filter((n) => n.primary).map((n) => (
          <button
            key={n.route}
            onClick={() => go(n.route)}
            aria-current={route === n.route ? 'page' : undefined}
            className={clsx(
              'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[0.68rem] font-medium transition-colors',
              route === n.route ? 'text-brand' : 'text-muted',
            )}
          >
            <Icon name={n.icon} className="h-5 w-5" />
            {n.short}
          </button>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[0.68rem] font-medium text-muted"
        >
          <Icon name="gear" className="h-5 w-5" />
          More
        </button>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Go to">
        <div className="grid grid-cols-2 gap-2">
          {NAV.map((n) => (
            <button
              key={n.route}
              onClick={() => go(n.route)}
              className={clsx(
                'flex items-center gap-2.5 rounded-lg border border-line px-3 py-3 text-left text-sm',
                route === n.route ? 'bg-brand-soft font-semibold text-brand' : 'hover:bg-surface-2',
              )}
            >
              <Icon name={n.icon} className="h-[18px] w-[18px] shrink-0" />
              <span className="min-w-0 flex-1 truncate">{n.label}</span>
              {badge(n.route) > 0 && (
                <span className="text-[0.7rem] font-semibold text-muted">{badge(n.route)}</span>
              )}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
