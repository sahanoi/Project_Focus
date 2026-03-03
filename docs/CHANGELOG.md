# Focus FTP — Changelog

## [Unreleased] — Phase 2: Web Deployment

### Added
- Supabase authentication (email/password)
- Premium glassmorphism Auth UI ("Dusk Purple" theme)
- Full data persistence to Supabase PostgreSQL
- Profile stats synced as JSONB to `profiles.stats`
- Vercel deployment configuration
- Professional project directory structure
- `.env.example` template for safe credential sharing

### Changed
- `habitStore.ts` aligned to live Supabase schema
  - `completions` → `habit_completions`
  - `date` → `completed_date`
  - Profile stats read/written as JSONB
  - Goals map `name` → `description`
- SQL migration consolidated into `supabase/migrations/01_initial_schema.sql`
- Test setup now mocks Supabase client

### Removed
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
