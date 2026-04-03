# Focus FTP — Deployment Guide

## Prerequisites
- Node.js 18+
- A Vercel account (free tier works)

This app is a **static SPA**: auth and data live in the browser (**localStorage**). No cloud database or backend env vars are required for deploy.

## Local Development

```bash
# 1. Clone & install
npm install

# 2. Optional environment (see .env.example)
cp .env.example .env
# Optionally set VITE_LOCAL_AUTH_EMAIL / VITE_LOCAL_AUTH_PASSWORD for dev pre-seed only

# 3. Run dev server
npm run dev
```

## Vercel Deployment

1. Push your code to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. No database-related environment variables are required unless you add new features that need them
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
