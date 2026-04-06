# Project Focus (Habit Tracker)

A **cozy adventurer**–themed habit app: RPG-style progression, story-first onboarding (see **[docs/UX_JOURNEY.md](./docs/UX_JOURNEY.md)**), and real habit logging. Frontend is **React + TypeScript + Vite**; backend is **Hono + PostgreSQL + Drizzle** in `server/`.

## Features

- **Habit tracking** — Create, edit, archive habits; schedules include non-daily cadences.
- **Progress & gamification** — XP, levels, character stats, achievements, collectibles.
- **Story & journey** — Canonical UX: isekai intro → water focus → guided 21-day micro-habits → free roam ([UX_JOURNEY.md](./docs/UX_JOURNEY.md)).
- **Charts** — Recharts on the Statistics tab (tier-gated where applicable).
- **Responsive UI** — Tailwind; mobile bottom nav + desktop sidebar.
- **Auth & sync** — Email/password, HTTP-only session cookie; client state syncs to **`/api/state`**.

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand (debounced sync to API) |
| API | Hono (`server/`) |
| Database | PostgreSQL, Drizzle ORM |
| Tests | Vitest, React Testing Library |

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/UX_JOURNEY.md](./docs/UX_JOURNEY.md) | **Authoritative** onboarding & day-gating |
| [docs/STITCH_PROMPTS_MASTER.md](./docs/STITCH_PROMPTS_MASTER.md) | **Google Stitch** prompts for every major UI surface |
| [docs/PRODUCT.md](./docs/PRODUCT.md) | Vision, screens, RPG feature map |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Stack & data flow |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Local + production setup |

## Getting started

**Prerequisites:** Node.js 18+, PostgreSQL (local or Docker via `docker-compose.yml`).

```bash
npm install
cd server && npm install && cd ..
cp .env.example .env
# Set DATABASE_URL, then:
cd server && npx tsx src/migrate.ts && cd ..
npm run dev
```

- App: `http://localhost:5173` (proxies `/auth`, `/api` to the API)
- API: `http://localhost:3001`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + API concurrently |
| `npm run build` | Production build |
| `npm run test:run` | Tests once |

## License

MIT — see [LICENSE](LICENSE).
