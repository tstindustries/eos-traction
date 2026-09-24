/// <reference types="vite/client" />
/**
 * Shared save: one JSON document at a URL, saved on purpose with the Save button and pulled
 * back with Reload. The transport is plain GET/PUT of the export format, so any server that can
 * serve and accept a file works: nginx with `dav_methods PUT` today, a small API tomorrow.
 * Nothing here runs unless the user presses a button, except one read at start-up.
 */
import { create } from 'zustand'
import type { AppData, SaveMeta } from '../types'
import { DATA_VERSION, snapshot, useStore } from '../store'

const envBase = (import.meta.env.VITE_SYNC_BASE as string | undefined)?.trim()
export const SYNC_BASE = (envBase && envBase.length ? envBase : '/data').replace(/\/+$/, '')
export const LATEST_URL = `${SYNC_BASE}/eos-latest.json`
export const HISTORY_DIR = `${SYNC_BASE}/history/`
const NAME_KEY = 'eos-sync-name'

const stamp = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
const historyUrl = (rev: number, iso: string) =>
  `${HISTORY_DIR}eos-r${String(rev).padStart(5, '0')}-${stamp(iso)}.json`

/** Everything except the save stamp, so a Save alone never counts as a change. */
const fingerprint = (d: AppData) => {
  const { rev: _r, updatedAt: _u, updatedBy: _b, ...rest } = d
  return JSON.stringify(rest)
}

const isDoc = (x: unknown): x is AppData =>
  !!x && typeof x === 'object' && 'vto' in (x as Record<string, unknown>)

const looksEmpty = (d: AppData) =>
  !d.settings.companyName &&
  d.people.length === 0 &&
  d.rocks.length === 0 &&
  d.issues.length === 0 &&
  d.measurables.length === 0

export type SyncResult = 'ok' | 'conflict' | 'dirty' | 'nothing' | 'error'

type SyncState = {
  status: 'idle' | 'checking' | 'loading' | 'saving'
  /** Last error or notice, shown under the buttons. */
  message: string | null
  /** Stamp of the document on the server as of the last check. null = nothing saved yet. */
  remote: SaveMeta | null
  /** Whether the server answered at all on the last check. */
  reachable: boolean | null
  /** Local edits since the last Save or Reload. */
  dirty: boolean
  /** Display name recorded on saves. Kept in this browser, not in the document. */
  name: string
  setName: (name: string) => void
  /** Read the server copy's stamp without touching local data. */
  check: () => Promise<void>
  /** Replace local data with the server copy. Refuses while dirty unless forced. */
  load: (force?: boolean) => Promise<SyncResult>
  /** Write local data to the server as the next revision. Refuses on a newer server copy unless forced. */
  save: (force?: boolean) => Promise<SyncResult>
  /** Start-up: check, and adopt the server copy when this browser holds nothing yet. */
  boot: () => Promise<void>
}

const readName = () => {
  try {
    return localStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

let synced = fingerprint(snapshot(useStore.getState()))

const metaOf = (d: AppData): SaveMeta => ({
  rev: d.rev ?? 0,
  updatedAt: d.updatedAt ?? '',
  updatedBy: d.updatedBy ?? '',
})

async function fetchLatest(): Promise<{ doc: AppData | null; reachable: boolean; error?: string }> {
  try {
    const r = await fetch(LATEST_URL, { cache: 'no-store' })
    if (r.status === 404) return { doc: null, reachable: true }
    if (!r.ok) return { doc: null, reachable: true, error: `Server answered ${r.status} for ${LATEST_URL}` }
    const parsed: unknown = await r.json()
    if (!isDoc(parsed)) return { doc: null, reachable: true, error: 'The file on the server is not an EOS export' }
    return { doc: parsed, reachable: true }
  } catch {
    return { doc: null, reachable: false, error: 'Could not reach the shared location' }
  }
}

export const useSync = create<SyncState>()((set, get) => ({
  status: 'idle',
  message: null,
  remote: null,
  reachable: null,
  dirty: false,
  name: readName(),

  setName: (name) => {
    try {
      localStorage.setItem(NAME_KEY, name)
    } catch {
      /* private mode: keep it for this session only */
    }
    set({ name })
  },

  check: async () => {
    set({ status: 'checking' })
    const { doc, reachable, error } = await fetchLatest()
    set({
      status: 'idle',
      reachable,
      remote: doc ? metaOf(doc) : null,
      message: error ?? null,
    })
  },

  load: async (force = false) => {
    if (get().dirty && !force) return 'dirty'
    set({ status: 'loading', message: null })
    const { doc, reachable, error } = await fetchLatest()
    if (!doc) {
      set({ status: 'idle', reachable, message: error ?? 'Nothing has been saved to the shared location yet' })
      return error ? 'error' : 'nothing'
    }
    useStore.getState().replaceAll(doc)
    synced = fingerprint(snapshot(useStore.getState()))
    set({ status: 'idle', reachable: true, remote: metaOf(doc), dirty: false, message: null })
    return 'ok'
  },

  save: async (force = false) => {
    set({ status: 'saving', message: null })
    const local = snapshot(useStore.getState())
    const { doc: remoteDoc, reachable, error } = await fetchLatest()
    if (!reachable) {
      set({ status: 'idle', reachable, message: error ?? null })
      return 'error'
    }
    const remoteRev = remoteDoc?.rev ?? 0
    if (remoteDoc && remoteRev > (local.rev ?? 0) && !force) {
      set({ status: 'idle', reachable: true, remote: metaOf(remoteDoc) })
      return 'conflict'
    }
    const meta: SaveMeta = {
      rev: Math.max(remoteRev, local.rev ?? 0) + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: get().name.trim() || 'unknown',
    }
    const body = JSON.stringify({ ...local, ...meta, version: DATA_VERSION }, null, 2)
    const headers = { 'Content-Type': 'application/json' }
    try {
      const put = await fetch(LATEST_URL, { method: 'PUT', headers, body })
      if (!put.ok) {
        const why =
          put.status === 405 || put.status === 501
            ? 'This server does not accept saves (PUT is not enabled)'
            : put.status === 401 || put.status === 403
              ? 'Not allowed to save here'
              : `Save failed: server answered ${put.status}`
        set({ status: 'idle', reachable: true, message: why })
        return 'error'
      }
      // History copy is best effort: a missing folder or a read-only history never blocks a save.
      fetch(historyUrl(meta.rev, meta.updatedAt), { method: 'PUT', headers, body }).catch(() => {})
    } catch {
      set({ status: 'idle', reachable: false, message: 'Could not reach the shared location' })
      return 'error'
    }
    useStore.getState().setSaveMeta(meta)
    synced = fingerprint(snapshot(useStore.getState()))
    set({ status: 'idle', reachable: true, remote: meta, dirty: false, message: null })
    return 'ok'
  },

  boot: async () => {
    const { doc, reachable, error } = await fetchLatest()
    const local = snapshot(useStore.getState())
    if (doc && looksEmpty(local)) {
      useStore.getState().replaceAll(doc)
      synced = fingerprint(snapshot(useStore.getState()))
      set({ reachable: true, remote: metaOf(doc), dirty: false, message: null })
      return
    }
    set({ reachable, remote: doc ? metaOf(doc) : null, message: error ?? null })
  },
}))

// Dirty tracking: any data change since the last Save/Reload flips the flag; a Save alone does not.
useStore.subscribe((s) => {
  if (s.sampleMode) return
  const dirty = fingerprint(snapshot(s)) !== synced
  if (dirty !== useSync.getState().dirty) useSync.setState({ dirty })
})
