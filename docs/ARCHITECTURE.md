# Focus FTP — Architecture & Stack

**Product UX (onboarding, day-gating, isekai → 21-day journey):** [UX_JOURNEY.md](./UX_JOURNEY.md) is authoritative; implement feature flags and UI against that contract.

## Tech Stack
| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript (Vite 5) |
| **Styling** | Tailwind CSS 3 |
| **State** | Zustand (in-memory; debounced sync to API) |
| **API** | Hono on Node ([`server/`](../server/)) |
| **Database** | PostgreSQL (Drizzle ORM + SQL migrations in `server/drizzle/`) |
| **Auth** | Email/password, bcrypt, HTTP-only session cookie |
| **Hosting** | Vercel (SPA) + separate Node host for API (or single origin proxy) |
| **Testing** | Vitest + Testing Library |
| **Animation** | Framer Motion |

## Directory Structure
```
Project F/
├── .env                  # Local secrets (gitignored)
├── .env.example          # DATABASE_URL + optional Vite vars
├── docker-compose.yml    # Optional local PostgreSQL
├── server/               # Hono API (see server/package.json)
│   ├── drizzle/          # SQL migrations + meta
│   └── src/
├── docs/                 # Project documentation
├── src/
│   ├── lib/              # api.ts (fetch + credentials), authTypes, localAuth (tests/legacy)
│   ├── contexts/         # AuthContext (session via /auth/me)
│   ├── store/            # habitStore (GET/PUT /api/state)
│   └── ...
├── vercel.json
└── vite.config.ts        # dev proxy /auth, /api → localhost:3001
```

## Data flow
```
Browser → Zustand (UI state)
    ↓ debounced PUT /api/state
API → PostgreSQL (per-user habits, completions, goals, routines, user_stats)

Login → POST /auth/login → session cookie → GET /auth/me + GET /api/state
```

## Authentication flow
```
App → AuthProvider → GET /auth/me
  ├── No user → Auth.tsx (POST /auth/register | /auth/login) → refreshAuth()
  └── Session → fetchAllData() (GET /api/state) → Dashboard
```
