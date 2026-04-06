# Focus FTP — Deployment Guide

**Related docs:** [UX_JOURNEY.md](./UX_JOURNEY.md) (product flow), [ARCHITECTURE.md](./ARCHITECTURE.md) (stack), [PRODUCT.md](./PRODUCT.md) (features).

## Prerequisites
- Node.js 18+
- PostgreSQL 16+ (local or hosted connection string)
- A Vercel account (free tier works) for the static frontend

The **system of record** is PostgreSQL, accessed only through the API in [`server/`](../server/). The Vite app talks to `/auth` and `/api` via the dev proxy or your production reverse proxy.

## Local development

```bash
# 1. Install dependencies (root + server installs via root when you use npm scripts)
npm install
cd server && npm install && cd ..

# 2. Start PostgreSQL (optional Docker)
docker compose up -d

# 3. Environment
cp .env.example .env
# Set DATABASE_URL=postgres://focus_ftp:focus_ftp_local@localhost:5432/focus_ftp
# Optionally CORS_ORIGIN=http://localhost:5173 for the API (default).

# 4. Apply schema
cd server && npx tsx src/migrate.ts && cd ..

# 5. Run API + Vite together
npm run dev
```

- API: `http://localhost:3001` (health: `GET /health`)
- App: `http://localhost:5173` (proxies `/auth` and `/api` to the API)

### Root scripts

| Command | Description |
|---|---|
| `npm run dev` | Concurrently: Vite + API |
| `npm run dev:vite` | Frontend only (API must run separately for auth/data) |
| `npm run dev:server` | API only |

### Server-only

```bash
cd server
DATABASE_URL=postgres://... npx tsx src/migrate.ts   # once per DB
npm run dev
```

## Vercel (frontend only)

1. Build and deploy the Vite app as today (`npm run build`).
2. Set **`VITE_*`** only if you introduce a public API base URL for split hosting.
3. For cookies + same-site auth, prefer **one origin** in production (e.g. reverse proxy serving both static files and `server/`), or configure CORS + `credentials` and matching cookie `Secure` / domain rules.

## Build commands

| Command | Description |
|---|---|
| `npm run dev` | Vite HMR + API |
| `npm run build` | Production build (`tsc && vite build`) |
| `npm run preview` | Preview production build locally |
| `npm run test` | Tests in watch mode |
| `npm run test:run` | Tests once (CI) |
