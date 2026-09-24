# Shared save (TST fork)

The upstream app keeps everything in one browser's localStorage. This fork adds a **Save** and a
**Reload** button in the top-right corner, a data **version** that goes up by one on every Save,
and an **updated at / by** stamp, so a small team can share one copy of the data through any web
server that can serve and accept a file.

Nothing changes in the screens. Nothing saves on its own. Export and Import still work and now
carry the stamp too.

## How it works

| Piece | Where | What |
| --- | --- | --- |
| Stamp on the document | `rev`, `updatedAt`, `updatedBy` in `AppData` (`src/types.ts`) | Travels with exports; `rev` 0 means never saved |
| Transport | `src/lib/sync.ts` | `GET <base>/eos-latest.json` and `PUT <base>/eos-latest.json`; on each save also `PUT <base>/history/eos-r00012-20260924T140301Z.json` (best effort) |
| Base URL | `VITE_SYNC_BASE` at build time, default `/data` | Same origin, so no CORS |
| Corner widget | `src/components/SyncBar.tsx`, mounted in `src/App.tsx` | Version, stamp, unsaved-changes dot, "vN on server" hint, Save, Reload |
| Name of the saver | Settings > Shared save; kept in this browser's localStorage under `eos-sync-name` | Asked for on the first Save if empty |

Save first reads the server copy. If the server holds a higher `rev` than the one this browser
started from, the widget asks before overwriting. Reload asks before discarding unsaved local
changes. At start-up the app reads the server copy once: an empty browser adopts it, a browser
with data only shows "vN on server".

The transport is deliberately dumb so the server can be anything:

- **nginx alone** with the DAV module (below) — no application server, no database.
- **A small API** later — point `VITE_SYNC_BASE` at it and add `If-Match` handling server-side.

## nginx configuration (no application server)

The official `nginx` images ship with `--with-http_dav_module`. One `location` and a writable
directory are all that is needed. Workers run as uid 101 (`nginx`), so the directory must be
writable by that uid.

```nginx
# inside the server block that serves the app
location /data/ {
    alias /srv/eos-data/;                 # writable bind mount, chown 101:101
    dav_methods PUT DELETE;
    create_full_put_path on;              # creates history/ on first save
    dav_access user:rw group:rw all:r;
    client_max_body_size 8m;              # the document is ~40 KB today
    autoindex on;
    autoindex_format json;                # GET /data/history/ lists versions as JSON
    add_header Cache-Control "no-store";
    # Optional: reads open to the office, writes behind a password
    # limit_except GET HEAD { auth_basic "EOS"; auth_basic_user_file /etc/nginx/eos.htpasswd; }
}
```

Behaviour to know about:

- nginx answers `201` on the first PUT and `204` afterwards. It does not check `If-Match`, so the
  conflict check is the client's read-before-write. That is fine for a team with one scribe.
- Every save leaves a dated file under `history/`, which is the version history and the backup.
  A nightly `tar` of the directory, or a weekly copy of `eos-latest.json` to a shared drive, is all
  the backup routine needed.
- A server that does not allow PUT (GitHub Pages, a plain static host) still serves the app; Save
  then reports "This server does not accept saves" and Reload still works if a file is there.

## Building

Build in a normal local checkout, not on a synced network drive:

```sh
npm ci
npm run build          # tsc -b && vite build
VITE_SYNC_BASE=/api npm run build   # if the save location is not /data
```
