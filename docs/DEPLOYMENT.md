# Focus FTP — Deployment Guide

## Prerequisites
- Node.js 18+
- A Supabase project with tables set up (see `supabase/migrations/`)
- A Vercel account (free tier works)

## Local Development

```bash
# 1. Clone & install
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your Supabase URL and Anon Key

# 3. Run dev server
npm run dev
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file:
   - `supabase/migrations/01_initial_schema.sql`
3. Go to **Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## Vercel Deployment

1. Push your code to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — Vercel will auto-detect Vite and build correctly
5. The `vercel.json` handles SPA routing automatically

## Build Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Vite HMR) |
| `npm run build` | Production build (`tsc && vite build`) |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI) |
