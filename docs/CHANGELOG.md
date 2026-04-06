# Focus FTP — Changelog

## [Unreleased] — Phase 2: Web Deployment

### Added
- `docs/UX_JOURNEY.md` — **canonical** user journey (isekai intro, water as baseline routine, Days 1–3 / 4–21 / 22+, Duolingo-style bond, premium custom later)
- `docs/PRODUCT.md` — merged product spec (vision, first-session flow, MVP screens, RPG/code map, dashboard UX goals); **§2** aligned to `UX_JOURNEY.md`; persistence narrative updated for PostgreSQL + `/api/state`
- `README.md` — stack, docs index, removed stale “localStorage only” implication
- Doc consistency pass: `PRODUCT.md` (goals persistence, missions vs `UX_JOURNEY`, §3 scope notes), `[1.0.0]` historical banner, `.cursor/plans/journey-first-session.md` (impl vs target), `UI_PREVIEW_WORKFLOW.md` (pre-auth journey)
- `docs/STITCH_PROMPTS_MASTER.md` — merged **Google Stitch** prompt pack (39 IDs: global context, auth, shell, dashboard widgets, habits, stats, modals, toasts, logo) + suggested batches
- `docs/archive/` — historical SaaS memo + legacy agent notes (with banners / relocation notes)
- Email/password auth with HTTP-only session cookies; client sync via **`/api/state`**
- Auth UI warm-layer / glass styling (see `COLOR_SCHEMA.md`; visual north star: **cozy adventurer**)
- **Zustand** `habitStore` with debounced **PostgreSQL** sync (not localStorage-only)
- Vercel deployment configuration
- Professional project directory structure
- `.env.example` template for safe credential sharing (optional dev pre-seed vars only)

### Historical (superseded — not current architecture)
The repo previously described optional cloud PostgreSQL sync and related client wiring; **that path is not part of the current app**. If you see old notes mentioning them, treat them as archive-only.

### Removed
- Split product docs merged into `PRODUCT.md`: `PRODUCT_VISION_CONCEPT.md`, `ENTRY_FLOW_FIRST_SESSION.md`, `MVP_WEB_SCREENS.md`, `RPG_COLLECTIBLE_PIXEL_APP.md`, `FIRST_SESSION_FLOW_10_15_MIN.md`, `DOCUMENTATION.md`
- Orphan SQL files from project root
- Temporary debug output files
- Stale `.env.local` placeholder

---

## [1.0.0] — Phase 1: Core App

> **Historical:** Release notes below describe early **mission/onboarding** experiments. **Canonical user journey** (isekai, 3-day water, 21-day micro track, Day 22+) is **[UX_JOURNEY.md](./docs/UX_JOURNEY.md)**—do not treat this section as current product law.

### Added
- Habit CRUD (regular, numerical, infinite, challenge types)
- RPG gamification (XP, levels, character attributes)
- 7-day new user **mission** chain (`missions.ts` / onboarding day), distinct from later **UX_JOURNEY** day-gating
- Analytics dashboard with heatmaps and charts
- S.M.A.R.T. goal wizard
- Routines system
- Achievement system with toast notifications
- Level-up celebrations
- Dark/light/system theme support
- Schedule-aware streak calculations
