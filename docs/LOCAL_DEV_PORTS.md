# Local dev ports (Project F)

## Defaults

| Service | Port | Notes |
|---------|------|--------|
| Vite (browser) | **5173** | `strictPort: true` — fails if busy instead of picking another port. |
| API | **3001** | Hono; override with `PORT` in `.env` / server env. |

## Stale “ghost” dev servers

Closing a terminal does not always stop Node. Old Vite/API processes can keep **3001** / **5173** open.

`npm run dev` runs a **free-ports** step (unless you opt out) so a new dev session can bind to those ports.

## Commands (from repo root)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Full stack: env, Docker DB (unless `SKIP_DOCKER=1`), migrate, seed-if-missing, free ports, Vite + API. |
| `npm run dev:ports-inspect` | **See what is listening** on the dev ports — **no kill**. Empty → “No listeners on ports: 3001, 5173”. |
| `npm run dev:free-ports` | Free those ports (kill listener processes) and log PIDs. |

## Environment

| Variable | When to use |
|----------|-------------|
| `SKIP_FREE_DEV_PORTS=1` | You run **another** app that must use 3001 or 5173, or you run **two** projects at once on the same machine without killing the other. |
| `DEV_FREE_PORTS` | Custom list, e.g. `3001,5173,5174`. |
| `DEV_FREE_PORTS_DRYRUN=1` | Same as inspect: print only, no `taskkill`/`kill`. |

PowerShell example:

```powershell
$env:SKIP_FREE_DEV_PORTS="1"
npm run dev
```

## Manual inspection (any time)

**Windows (PowerShell)** — PIDs for listening sockets:

```powershell
Get-NetTCPConnection -LocalPort 3001,5173 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalPort, OwningProcess
```

Then: `Get-Process -Id <pid>` (or Task Manager → Details → PID).

**macOS / Linux (if `lsof` is available):**

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN
lsof -nP -iTCP:5173 -sTCP:LISTEN
```

## Many local projects (avoid collisions)

Give **each project its own** API + Vite ports in that repo, and set **CORS** and **Vite proxy** to match. Relying on a single 3001/5173 for everything will keep colliding; either use **different ports per repo** or only run one stack at a time.

## Agent / Cursor

Behavior and scripts are summarized in **`.cursor/rules/dev-ports.mdc`** (use `@dev-ports` in chat to pull it in). The main run flow stays in **`.cursor/rules/dev-server.mdc`**.
