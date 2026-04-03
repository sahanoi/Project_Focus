# Focus FTP — Changelog

## [Unreleased] — Phase 2: Web Deployment

### Added
- `docs/PRODUCT.md` — merged product spec (vision, first-session flow, MVP screens, RPG/code map, dashboard UX goals)
- `docs/archive/` — historical SaaS memo + legacy agent notes (with banners / relocation notes)
- **Local-first** authentication (email/password) and session handling in the browser
- Premium glassmorphism Auth UI ("Dusk Purple" theme)
- **Zustand** persistence to **localStorage** for habits, goals, routines, and related state
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

### Added
- Habit CRUD (regular, numerical, infinite, challenge types)
- RPG gamification (XP, levels, character attributes)
- 7-day new user onboarding journey
- Analytics dashboard with heatmaps and charts
- S.M.A.R.T. goal wizard
- Routines system
- Achievement system with toast notifications
- Level-up celebrations
- Dark/light/system theme support
- Schedule-aware streak calculations
