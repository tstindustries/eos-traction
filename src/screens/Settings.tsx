import { useRef, useState } from 'react'
import { DATA_VERSION, useStore } from '../store'
import type { AppData } from '../types'
import { Button, Card, Field, Input, Page, Segmented, Select } from '../components/ui'
import { MONTHS, WEEKDAYS, today } from '../lib/util'

export default function SettingsScreen() {
  const settings = useStore((s) => s.settings)
  const { setSettings, replaceAll, reset, enterSampleMode, exitSampleMode } = useStore()
  const sampleMode = useStore((s) => s.sampleMode)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const exportJson = () => {
    const { people, vto, seats, rocks, measurables, issues, todos, headlines, meetings } =
      useStore.getState()
    const data: AppData = {
      version: DATA_VERSION,
      settings,
      people,
      vto,
      seats,
      rocks,
      measurables,
      issues,
      todos,
      headlines,
      meetings,
    }
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = `eos-${(settings.companyName || 'company').toLowerCase().replace(/\s+/g, '-')}-${today()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg({ tone: 'good', text: 'Exported.' })
  }

  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppData
      if (!parsed || typeof parsed !== 'object' || !('vto' in parsed))
        throw new Error('Not an EOS export')
      replaceAll(parsed)
      setMsg({ tone: 'good', text: 'Imported. Everything was replaced with the file contents.' })
    } catch (e) {
      setMsg({ tone: 'bad', text: `Could not import: ${(e as Error).message}` })
    }
  }

  return (
    <Page title="Settings" subtitle="All data lives in this browser's local storage. Nothing is sent anywhere.">
      <div className="space-y-4">
        <Card title="Company">
          <div className="space-y-4 p-4">
            <Field label="Company name">
              <Input
                value={settings.companyName}
                onChange={(e) => setSettings({ companyName: e.target.value })}
                placeholder="Your company"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fiscal year starts" hint="Drives which quarter rocks belong to.">
                <Select
                  value={settings.fyStartMonth}
                  onChange={(e) => setSettings({ fyStartMonth: Number(e.target.value) })}
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Scorecard week ends on">
                <Select
                  value={settings.weekEndsOn}
                  onChange={(e) => setSettings({ weekEndsOn: Number(e.target.value) })}
                >
                  {WEEKDAYS.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Appearance">
              <Segmented
                value={settings.theme}
                options={[
                  { value: 'system', label: 'System' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
                onChange={(theme) => setSettings({ theme })}
              />
            </Field>
          </div>
        </Card>

        <Card title="Your data">
          <div className="space-y-3 p-4">
            <p className="text-sm text-muted">
              Export before clearing your browser data, switching machines, or sharing the V/TO with
              someone who also runs this app.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={exportJson}>
                Export JSON
              </Button>
              <Button onClick={() => fileRef.current?.click()}>Import JSON</Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) importJson(f)
                  e.target.value = ''
                }}
              />
            </div>
            {msg && (
              <p className={msg.tone === 'good' ? 'text-sm text-good' : 'text-sm text-bad'}>
                {msg.text}
              </p>
            )}
          </div>
        </Card>

        <Card title="Sample mode">
          <div className="space-y-3 p-4">
            {sampleMode ? (
              <>
                <p className="text-sm">
                  You are looking at <strong>Northgate Systems</strong>, a fictional company. Your own
                  data is set aside and will come back exactly as you left it.
                </p>
                <p className="text-sm text-muted">
                  Anything you change while in sample mode is discarded on exit.
                </p>
                <Button variant="primary" onClick={exitSampleMode}>
                  Exit sample mode
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted">
                  Loads a fictional 34-person company that has been running on EOS for two years — a
                  complete V/TO, seven rocks with milestones, nine measurables with thirteen weeks of
                  history, a full issues list and three past Level 10 meetings.
                </p>
                <p className="text-sm text-muted">
                  Your own data is stashed while you explore and restored when you exit. Nothing is
                  overwritten.
                </p>
                <Button onClick={enterSampleMode}>Enter sample mode</Button>
              </>
            )}
          </div>
        </Card>

        <Card title="Danger zone">
          <div className="space-y-3 p-4">
            <p className="text-sm text-muted">
              Deletes everything on this device — people, V/TO, rocks, scorecard history and meeting
              records. Export first.
            </p>
            {confirmReset ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-bad">Really erase everything?</span>
                <Button
                  variant="danger"
                  onClick={() => {
                    reset()
                    setConfirmReset(false)
                    setMsg({ tone: 'good', text: 'All data erased.' })
                  }}
                >
                  Yes, erase
                </Button>
                <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirmReset(true)}>
                Erase all data
              </Button>
            )}
          </div>
        </Card>

        <Card title="About the system">
          <div className="space-y-2 p-4 text-sm text-muted">
            <p>
              The six components of EOS: <strong className="text-ink">Vision</strong> (the V/TO),{' '}
              <strong className="text-ink">People</strong> (accountability chart and People
              Analyzer), <strong className="text-ink">Data</strong> (the scorecard),{' '}
              <strong className="text-ink">Issues</strong> (the list plus IDS),{' '}
              <strong className="text-ink">Process</strong> (your Proven Process on the V/TO), and{' '}
              <strong className="text-ink">Traction</strong> (rocks and the Level 10 meeting).
            </p>
            <p>
              This app is an independent implementation of the framework described in{' '}
              <em>Traction</em> by Gino Wickman. It is not affiliated with or endorsed by EOS
              Worldwide.
            </p>
          </div>
        </Card>
      </div>
    </Page>
  )
}
