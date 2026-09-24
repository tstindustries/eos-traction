import { useState } from 'react'
import { useStore } from '../store'
import { useSync, listHistory, LATEST_URL, type HistoryEntry, type SyncResult } from '../lib/sync'
import { Button, Modal } from './ui'
import { clsx } from '../lib/util'

const fmtStamp = (iso: string) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'never'

type Ask =
  | { kind: 'overwrite'; title: string; body: string }
  | { kind: 'discard'; title: string; body: string }
  | { kind: 'loadVersion'; title: string; body: string; entry: HistoryEntry }
  | null

const fmtSize = (n: number | null) => (n === null ? '' : `${Math.max(1, Math.round(n / 1024))} KB`)

/**
 * The corner widget: data version, when and by whom it was last saved, and the two buttons that
 * move data between this browser and the shared location. Nothing auto-saves.
 */
export function SyncBar({ className }: { className?: string }) {
  const rev = useStore((s) => s.rev ?? 0)
  const updatedAt = useStore((s) => s.updatedAt ?? '')
  const updatedBy = useStore((s) => s.updatedBy ?? '')
  const sampleMode = useStore((s) => s.sampleMode)
  const { status, message, notice, remote, reachable, dirty, name, setName, load, save, loadVersion } =
    useSync()
  const [ask, setAsk] = useState<Ask>(null)
  const [nameOpen, setNameOpen] = useState(false)
  const [draftName, setDraftName] = useState(name)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[] | null | 'loading'>('loading')

  if (sampleMode) return null

  const busy = status !== 'idle'
  const newerOnServer = !!remote && remote.rev > rev

  // Read the server stamp from the store AFTER save() ran: the `remote` captured at render time
  // is whatever the last check saw, not what the save just found on the server.
  const afterSave = (r: SyncResult) => {
    const rem = useSync.getState().remote
    if (r === 'conflict' && rem)
      setAsk({
        kind: 'overwrite',
        title: `Server has v${rem.rev}`,
        body: `${rem.updatedBy || 'Someone'} saved v${rem.rev} on ${fmtStamp(rem.updatedAt)}, newer than the v${rev} this browser started from. Save anyway as v${rem.rev + 1}, or Reload first to see their changes.`,
      })
  }

  const onSave = async () => {
    if (!name.trim()) {
      setDraftName('')
      setNameOpen(true)
      return
    }
    afterSave(await save())
  }

  const onReload = async () => {
    const r = await load()
    if (r === 'dirty') {
      const rem = useSync.getState().remote
      setAsk({
        kind: 'discard',
        title: 'Unsaved changes',
        body: `This browser has changes that were not saved. Reload ${rem ? `v${rem.rev}` : 'the server copy'} and lose them?`,
      })
    }
  }

  const confirmAsk = async () => {
    const a = ask
    setAsk(null)
    if (!a) return
    if (a.kind === 'overwrite') await save(true)
    else if (a.kind === 'loadVersion') await loadVersion(a.entry, true)
    else await load(true)
  }

  const openHistory = async () => {
    setHistoryOpen(true)
    setHistory('loading')
    setHistory(await listHistory())
  }

  const pickVersion = async (entry: HistoryEntry) => {
    setHistoryOpen(false)
    const r = await loadVersion(entry)
    if (r === 'dirty')
      setAsk({
        kind: 'loadVersion',
        entry,
        title: 'Unsaved changes',
        body: `This browser has changes that were not saved. Load v${entry.rev} from ${fmtStamp(entry.at)} and lose them? Nothing is written to the server until you press Save.`,
      })
  }

  const saveName = async () => {
    setName(draftName)
    setNameOpen(false)
    if (draftName.trim()) afterSave(await save())
  }

  return (
    <div className={clsx('no-print flex flex-col items-end gap-1', className)}>
      <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-xs text-muted">
        <span
          className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono font-semibold text-ink tabular-nums"
          title="Data version: goes up by one on every Save"
        >
          v{rev}
        </span>
        <span title={updatedAt || undefined}>
          {rev > 0 ? `Saved ${fmtStamp(updatedAt)}${updatedBy ? ` by ${updatedBy}` : ''}` : 'Not saved yet'}
        </span>
        {dirty && (
          <span className="flex items-center gap-1 font-medium text-warn">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-warn" aria-hidden />
            Unsaved changes
          </span>
        )}
        {newerOnServer && !busy && (
          <span className="font-medium text-brand">v{remote.rev} on server</span>
        )}
        {reachable === false && <span className="text-bad">Shared location unreachable</span>}
        <span className="flex items-center gap-1.5">
          <Button size="sm" variant={dirty ? 'primary' : 'default'} onClick={onSave} disabled={busy}>
            {status === 'saving' ? 'Saving…' : 'Save'}
          </Button>
          <Button
            size="sm"
            variant={newerOnServer ? 'primary' : 'default'}
            onClick={onReload}
            disabled={busy}
            title="Replace what is in this browser with the last saved copy on the server"
          >
            {status === 'loading' ? 'Loading…' : 'Reload Previous Save'}
          </Button>
          <Button size="sm" variant="ghost" onClick={openHistory} disabled={busy} title="Load an earlier saved version">
            History
          </Button>
        </span>
      </div>
      {message && <p className="max-w-sm text-right text-xs text-bad">{message}</p>}
      {notice && <p className="max-w-sm text-right text-xs text-muted">{notice}</p>}

      <Modal open={!!ask} onClose={() => setAsk(null)} title={ask?.title ?? ''}>
        <p className="text-sm">{ask?.body}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => setAsk(null)}>Cancel</Button>
          <Button variant={ask?.kind === 'discard' ? 'danger' : 'primary'} onClick={confirmAsk}>
            {ask?.kind === 'overwrite' ? 'Save anyway' : 'Reload and discard'}
          </Button>
        </div>
      </Modal>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Saved versions">
        {history === 'loading' && <p className="text-sm text-muted">Loading…</p>}
        {history === null && (
          <p className="text-sm text-muted">This server does not list saved versions.</p>
        )}
        {Array.isArray(history) && history.length === 0 && (
          <p className="text-sm text-muted">No saved versions yet. Every Save adds one.</p>
        )}
        {Array.isArray(history) && history.length > 0 && (
          <>
            <p className="mb-3 text-sm text-muted">
              Loading a version replaces what is in this browser only. Press Save afterwards to make it the
              current version for everyone.
            </p>
            <ul className="max-h-80 divide-y divide-line overflow-y-auto">
              {history.map((h) => (
                <li key={h.name} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-12 shrink-0 font-mono font-semibold tabular-nums">v{h.rev}</span>
                  <span className="min-w-0 flex-1 truncate text-muted">
                    {fmtStamp(h.at)}
                    {fmtSize(h.size) && <span className="ml-2 text-xs">{fmtSize(h.size)}</span>}
                    {remote && h.rev === remote.rev && (
                      <span className="ml-2 text-xs font-medium text-brand">current</span>
                    )}
                  </span>
                  <Button size="sm" onClick={() => pickVersion(h)}>
                    Load
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Modal>

      <Modal open={nameOpen} onClose={() => setNameOpen(false)} title="Who is saving?">
        <p className="text-sm text-muted">
          Your name is recorded on each save so the team can see who changed the shared copy at{' '}
          <span className="font-mono text-xs">{LATEST_URL}</span>. You can change it in Settings.
        </p>
        <input
          autoFocus
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && saveName()}
          placeholder="First name"
          className="mt-3 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => setNameOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveName} disabled={!draftName.trim()}>
            Save as {draftName.trim() || '…'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
