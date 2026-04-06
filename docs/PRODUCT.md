# Focus FTP — Product specification (merged)

This file replaces **PRODUCT_VISION_CONCEPT.md**, **ENTRY_FLOW_FIRST_SESSION.md**, **MVP_WEB_SCREENS.md**, and **RPG_COLLECTIBLE_PIXEL_APP.md**. For stack layout see [ARCHITECTURE.md](./ARCHITECTURE.md). For deploy commands see [DEPLOYMENT.md](./DEPLOYMENT.md). **Onboarding order, day-gating (3 / 21), and free-roam:** canonical spec is **[UX_JOURNEY.md](./UX_JOURNEY.md)**.

---

## Table of contents

1. [Product concept (vibes)](#1-product-concept-vibes-only)
2. [First-session & journey flow (authoritative)](#2-first-session--journey-flow-authoritative)
3. [MVP web screen inventory](#3-mvp-web-screen-inventory)
4. [RPG systems, implementation map, and visual assets](#4-rpg-systems-implementation-map-and-visual-assets)
5. [Dashboard UX goals](#5-dashboard-ux-goals)

---

## 1. Product concept (vibes only)

This document is **intent and feeling**, not implementation. No stack, no files, no tickets—only what the experience should *feel* like and why.

---

## Who you are when you arrive

A new person does not arrive with habits “already there.” Onboarding is not a form you fill out to prove you belong. It is the **first scene** of a story that has already started: you showed up. The app’s job is to hand you **one small, dignified role** on day one—not a blank page and not a buffet of options.

We drop the fantasy of “choose your starter pack.” Choice can wait. **Trust and rhythm** come first.

---

## The opening beat: one routine, one habit, no picking

Instead of asking you to pick one to five habits from a catalog, the first experience is **already composed** for you:

**You begin inside a Morning Routine.**  
Inside it lives a single habit to care for today: **Drink Water** (or the same idea under whatever name feels kindest in copy—what matters is *hydration as a gentle anchor*, not the SKU).

Nothing says “configure your life.” Something says: **this is your first quest line.** The routine is the **frame**; the habit is the **action**. You were not asked to design the frame—you were placed in it, like waking up and finding a clean cup already on the table.

### Why this composition

- **Routines** stop being a feature you “unlock later” and become **the first word you learn** in the app’s language. A routine is a *time of day*, a *mood*, a *bundle of care*—not a folder.
- **Check-ins** are the only thing that matters in the first minutes. Tap, sip, done. The UI should celebrate **closure**, not administration.
- **Leveling** is introduced as *consequence*, not homework: you did the thing; the world notices. Numbers rise because you moved, not because you read a tooltip.

---

## The first session: what you should feel

1. **Relief** — I didn’t have to decide who I am yet.  
2. **Competence** — I completed something real in under a minute.  
3. **Curiosity** — Something unlocked, or shimmered, or looked back at me.  
4. **Ownership** — That “something” is *mine*, not the app’s generic reward.

The emotional arc is: *I was welcomed → I acted → I was seen → I got a piece of myself back.*

---

## Leveling (vibes)

Levels are not school grades. They are **seasons of attention**. The bar fills because you kept a promise to yourself that was **small enough to keep**. Early levels should come from **meaningful but fair** milestones—enough that a new person feels momentum after the first session or two, never so fast that the number feels fake.

The copy and motion around leveling should feel like **dawn breaking**, not a slot machine. You are not “grinding”; you are **settling into a practice**.

---

## The first collectible

The first collectible is not random loot. It is **evidence**.

It might be called something like *First Light*, *The Cup*, *Dew*, or *Threshold*—the name should sound like a **memory**, not a badge. Its description should acknowledge the truth: *you began.*

It appears **in the same breath** as the first meaningful check-in or the first completion of your opening routine—timed so the player feels **cause and effect**, not mail from a marketing department.

Collectibles in this world are **tokens of who you were willing to become**, not stickers. Rarity can exist later; the first one should feel **sacred-common**: everyone gets it, and it still matters.

---

## The cloak (first equip)

Your character is not a doll for microtransactions on day one. Your character is **you, abstracted**—a silhouette that gains **dignity** as you show up.

The **cloak** is the first **equippable** piece. It is not stats-first (unless you want a whisper of “comfort” or “resolve” later). It is **identity-first**:

- You choose or receive a **cloak** that reads as *yours*—color, trim, simple silhouette.  
- Equipping it is a **small ceremony**: the figure turns, fabric settles, maybe a soft sound.  
- The message is subconscious: **I am someone who tends to themselves.**

Cloaks are the beginning of a **wardrobe of virtues**—not fashion for fashion’s sake, but *outer sign of inner consistency*. Later you might earn hoods, sashes, or village tokens; on day one, **one cloak** is enough to say: *this body in the app belongs to me.*

---

## Routines, habits, and the fiction

- **Routine** = *when and how the day asks something of you* (morning, wind-down, deep work block—whatever the fiction supports).  
- **Habit** = *the specific promise* inside that window.  
- **Check-in** = *proof of care* that time received you.

The opening **Morning Routine → Drink Water** teaches that grammar without a lesson plan. Everything else—numerical targets, streak shields, challenges, community, seasons—can arrive as **chapters** after the reader knows how to read the first sentence.

---

## What we deliberately avoid at the door

- **Choice paralysis** — No “build your life from 90 templates” as step one.  
- **Shame** — No empty states that imply you failed before you started.  
- **Spreadsheet energy** — No sense that logging is bookkeeping for a boss.  
- **Feature tourism** — No obligation to visit six tabs to “finish setup.”

The first screen **after sign-up** (when the story does not run pre-auth) should feel like **stepping into a quiet guild hall**, not **filing taxes**. If the team ships **isekai → Han → water** before account (see [UX_JOURNEY.md](./UX_JOURNEY.md)), treat that sequence as the emotional “guild hall” beat instead.

---

## Tone of voice

Warm, slightly mythic, never ironic at your expense. Short sentences when you succeed; softer, wider sentences when you rest. The app should sound like a **friend who believes you’re trying**, not a coach who’s timing your rest periods.

---

## North-star sentence

**You don’t pick your first habit—you inherit a gentle morning, you drink the water, the world notices, you wrap yourself in a cloak, and you leave the first session feeling like a person who already belongs here.**

---

*This concept can drift from current build details on purpose; it is the direction we want players to remember when they close their eyes and think about why they opened the app.*

**Also in this document:** [§2 Journey flow](#2-first-session--journey-flow-authoritative) (build order), [§3 MVP web screen inventory](#3-mvp-web-screen-inventory), [STORYLINE_SCENES_FOR_AI_ART.md](./STORYLINE_SCENES_FOR_AI_ART.md) (AI art prompts). **Full day-gating:** [UX_JOURNEY.md](./UX_JOURNEY.md).

---

## 2. First-session & journey flow (authoritative)

**Canonical detail:** **[UX_JOURNEY.md](./UX_JOURNEY.md)** — isekai (rainy megapolis → truck-kun → **Maceracı Han**), diegetic dialogue, **Days 1–3** water focus + Innkeeper/Garden browse, **Days 4–21** seven micro-habits × three days, **Day 22+** freedom; **water** stays a **baseline routine** that **strengthens over time**; **custom habits** code-ready, **premium/post-journey** in product.

**Purpose (this section):** Summary for implementers. If anything conflicts, **[UX_JOURNEY.md](./UX_JOURNEY.md)** wins.

---

### Screen / beat order (first launch)

1. **Splash / Begin** — Motion when ready; else full-screen placeholder in `src/assets/`.
2. **Isekai cinematic** — Rainy megapolis, crossing, **truck-kun** → **Han room** (see STORYLINE §Isekai).
3. **Diegetic handoff** — “Video” ends; app **talks to** the adventurer; first quest = **water on the table**; real-life bridge (wake → drink).
4. **Sign up + name** — Cookie session auth as today; **story before habit buffet** is the intent.
5. **Main app** — Gating per **UX_JOURNEY**; avoid duplicate water tutorial in **OnboardingWizard**.

---

### Asset mapping: `scene1.png` vs `scene1.1.png`

| Asset | Role | Suggested visual |
|--------|------|-------------------|
| **`scene1.png`** | Han establishing | Wide: room, bed, table, **water glass**. |
| **`scene1.1.png`** | Ritual focus | Close: **glass**; drink CTA. |

Add **city / rain / truck** as separate beats per [STORYLINE_SCENES_FOR_AI_ART.md](./STORYLINE_SCENES_FOR_AI_ART.md).

---

### Placeholders until motion exists

- Static PNGs + Begin; document MP4/Lottie + fallback when added.

---

### Open implementation decisions

| Topic | Decision needed |
|--------|-----------------|
| **OnboardingWizard** | Skip/shorten when UX_JOURNEY path already seeded water. |
| **3-day / 21-day** | Calendar vs rolling; timezone; server `journey_day` flags. |
| **Returning users** | Abbreviated path if isekai already completed. |

---

### One-line summary (engineering)

`Begin` → **isekai** (city → truck → Han) → **diegetic water quest** → **auth** → **gated app** per [UX_JOURNEY.md](./UX_JOURNEY.md).

---

## 3. MVP web screen inventory

**Purpose:** P0/P1 **screens/views** checklist. **Canonical journey order:** [§2](#2-first-session--journey-flow-authoritative) and [UX_JOURNEY.md](./UX_JOURNEY.md). Narrative intent: [§1](#1-product-concept-vibes-only).

This is **product/UI scope**, not a component tree. Mark **P0** = must ship for MVP, **P1** = next slice.

---

## P0 — Auth & account

| Screen | Job | Notes |
|--------|-----|--------|
| **Sign in** | Returners enter | Email + password; calm copy; link to sign up / forgot password. |
| **Sign up** | New account | Minimal fields; promise “small morning” not “build your system.” |
| **Forgot / reset password** | Recovery | Standard flow; keep tone warm. |
| **Auth loading** | Trust | Short; optional Scene A art ([STORYLINE_SCENES_FOR_AI_ART.md](./STORYLINE_SCENES_FOR_AI_ART.md)). |

---

## P0 — First-session storyline (replaces habit-pick buffet for MVP direction)

**Scope:** Rows below are **post-account** story beats (welcome, routine, cloak, etc.). **Pre-auth** isekai / truck-kun / Han awakening / first water are defined in [§2](#2-first-session--journey-flow-authoritative) and [UX_JOURNEY.md](./UX_JOURNEY.md).

| Screen | Job | Notes |
|--------|-----|--------|
| **Welcome + name** | Human entry | Optional display name; one line about the composed morning; Continue. |
| **Morning Routine reveal** | Teach “routine” | One panel: **Morning Routine** containing **Drink Water** only; single primary CTA to complete. |
| **First check-in success** | Closure | Motion + XP tick; dawn language, not casino. |
| **First collectible reveal** | Evidence | Modal/full: *First Light* / equivalent; *You began.*; save to collection. |
| **Cloak picker** | Identity | 2–3 variants; large tappable tiles; preview on silhouette. |
| **Cloak equip ceremony** | Belonging | Short transition (CSS/video/GIF per art direction); confirm copy. |
| **Enter home** | Continuity | Handoff to main dashboard with today’s routine visible and water already “done” if logged. |

---

## P0 — Main shell (after onboarding)

| Screen | Job | Notes |
|--------|-----|--------|
| **Dashboard (Home)** | Daily command center | **Today** lane: routines + habits due; quick log; XP/level strip; soft secondary widgets (streak, radar) as space allows. |
| **Add / edit habit** | CRUD | Can stay modal or full page; for MVP, **regular + numerical** after unlock rules—storyline does not depend on this on hour one. |
| **Habit detail** | Depth | History, streak, simple stats per habit. |
| **Settings** | Account & prefs | Profile email, sign out, theme, export/import if already product promises. |

---

## P1 — Progression & collection (still “MVP+” but small)

| Screen | Job | Notes |
|--------|-----|--------|
| **Level / Journey** | Long-term path | Milestones, tier names; links from XP bar. |
| **Achievements** | Badge list | Can be simple grid + locked states. |
| **Collectibles / Collection** | Gallery | Equipped cloak + future slots; first collectible visible. |
| **Profile / Character** | Avatar + stats | Silhouette + equipped cloak + core RPG numbers. |

---

## P1 — Analytics & social (defer if scope tight)

| Screen | Job | Notes |
|--------|-----|--------|
| **Statistics** | Charts & ranges | Gate by level if product still uses progression gates. |
| **Community** | Placeholder or demo | OK as “coming soon” if not real backend; avoid blocking P0. |

---

## P0 — System & edge

| Screen | Job | Notes |
|--------|-----|--------|
| **Global error / offline** | Grace | Friendly retry; local-first messaging if applicable. |
| **404 / unknown route** | Wayfinding | Link home. |
| **Legal** | Trust | Privacy + terms links from footer or settings. |

---

## Responsive rules (web MVP)

- **Mobile-first** layout: bottom nav or compact header; touch targets ≥ 44px.  
- **Desktop:** sidebar or top nav; same screens, wider composition; storyline modals may become side-by-side with art.  
- **One** breakpoint strategy for MVP (e.g. `lg`) to avoid three bespoke layouts.

---

## MVP screen count (rough)

- **P0 only:** ~12–14 distinct **states** (auth 4, storyline 6, shell 3, system 2–3).  
- **P0 + P1:** +4–6 screens.

---

## Out of MVP (explicit)

- Full village / defense sim.  
- Real-time multiplayer community.  
- Deep outfit economy (beyond cloak + placeholder slots).  
- Every habit type and schedule taught on day one.

---

*Traceability below is narrative pacing; **build order** is [UX_JOURNEY.md](./UX_JOURNEY.md) + §2.*

## Traceability

| Story minute block | Primary screens |
|--------------------|-----------------|
| 0–2 min | Auth + loading (A) |
| 2–4 min | Welcome + name (B) |
| 4–7 min | Routine reveal (C) |
| 7–9 min | Dashboard inline or success overlay (D) |
| 9–11 min | Collectible modal (E) |
| 11–13 min | Cloak picker + ceremony (F, G) |
| 13–15 min | Dashboard home (H + persistent home) |

---

*Update this list when storyline steps are frozen; use checkboxes in PM tool by copying rows.*

---

## 4. RPG systems, implementation map, and visual assets

> **Companion:** [ARCHITECTURE.md](./ARCHITECTURE.md) (stack & folders). **Product narrative & MVP checklist:** §§1–3 above.

---

### 4.1 Product vision

This application is a **habit and goal tracker** wrapped in an **RPG progression fantasy**: real completions change your **character sheet** (overall rating and six derived attributes), your **season level**, and your **collection** of unlockable items. The intent is to answer: *what would self-improvement look like if it felt like leveling a character and completing a set*—without losing the clarity of a serious tracker (schedules, numerical goals, analytics, export).

**Design pillars**

| Pillar | Meaning |
|--------|---------|
| **Fast logging** | Checking in must be quicker than guilt. Quick log, date navigation, and search reduce friction. |
| **Legible stats** | RPG numbers (OVR, DSC, FOC, …) are computed from real behavior, not vanity randomness. |
| **Collectible progression** | Unlockables reward streaks, volume, diversity, and milestones—visible in Achievements and Collectibles. |
| **Fair schedules** | Weekly/monthly/custom schedules so “3× gym” is not punished as “failure” on off days. |

---

### 4.2 Who it is for

- People who **like games and progression** but want **real accountability** (streaks, charts, goals).
- Users who want **more than a checkbox**: numerical targets, challenges, routines, and long-term goals.
- Players who enjoy **meta-goals**: achievements, rarity tiers, level milestones, and (eventually) a stronger **pixel collectible** layer.

---

### 4.3 Core fantasy: stats, season, and collection

### Character sheet (RPG attributes)

The app maintains a **`CharacterStats`** object: **level**, **XP**, **next level threshold**, and **seven visible ratings**:

| Abbrev. | Name | Plain-language meaning |
|---------|------|-------------------------|
| **OVR** | Overall | Weighted blend of the other stats—your “hero power.” |
| **DSC** | Discipline | Consistency on **daily-scheduled** habits over a recent window. |
| **FOC** | Focus | How often **numerical** habits hit their targets; falls back to general completion if none. |
| **STK** | Streak | Strength of **current streaks** across habits. |
| **BAL** | Balance | **Category diversity**—rewarding habits spread across life areas. |
| **GRT** | Grit | **Longest streak** history averaged across habits. |
| **VIT** | Vitality | Performance in **Health** and **Fitness** categories. |

**Implementation:** Derived in `src/utils/gamificationUtils.ts` from `Habit[]` and exposed through the global store.

### Season XP and level

- **XP** is **recomputed** from all habits’ valid completions: **50** XP per completion, multiplied by **difficulty** (`easy` 1×, `medium` 1.5×, `hard` 2×) and a **streak bonus** (up to 2× at a 30-day current streak). Claimed **onboarding missions** add lump sums tracked via `localStorage` (`mission_claimed_*`). See `src/utils/gamificationUtils.ts`.
- **Level** uses a **linear threshold** (**1000** XP per level; `LEVEL_THRESHOLD` in `gamificationUtils.ts`).
- The dashboard surfaces this as **season-style progress** (header widgets such as `XPProgress`).

### Collection layer

Two parallel reward tracks:

1. **Achievements** — Defined in `src/utils/achievementUtils.ts`: streak, consistency, volume, milestone, and special conditions; tiers **bronze → diamond**; UI notifications via achievement toasts.
2. **Collectibles** — Defined in `src/data/collectibles.ts` and typed as `Collectible` in `src/types/index.ts`: **common / rare / epic / legendary** rarity, emoji **icons**, **unlock hints**, and programmatic **conditions** evaluated against `CharacterStats` and habits. Unlocked IDs live on **`stats.unlockedCollectibles`**.

Together, these form the **collectible RPG loop**: do real actions → see numbers move → unlock catalog entries.

---

### 4.4 Visual identity: pixel art direction vs current UI

### Target identity (product)

The **north-star aesthetic** is **cozy RPG + collectible pixel art**: small readable sprites or pixel frames for collectibles, habit “cards,” and future systems (e.g. village buildings) so rewards feel **tangible** like inventory items.

### Current implementation (honest snapshot)

The shipped UI is **web-first**: **Tailwind**, **glass / card** surfaces, **Lucide** icons, and **emoji** for habit icons and many collectibles—evoking **sports card / radar** dashboards as much as retro games. There is **no dedicated pixel-art sprite pipeline** in the repo yet; pixel identity is **directional** for art and marketing, not a guarantee of every asset.

**Implication for docs:** treat “pixel art” as the **brand and asset roadmap**; treat the codebase as **RPG systems + modern React UI** ready to swap emoji for sprites when assets exist.

---

### 4.5 Feature catalog

### Habits

- **Types:** `regular`, `numerical`, `infinite`, `challenge` (`src/types/index.ts`). **Unlock order:** numerical (Lv.2) → analytics/goals/schedules at Practitioner (Lv.3) without new types → **Infinite Loop** at Strategist (Lv.4) → **Challenge** (+ routines) at Competent (Lv.5) → unlimited at Expert (Lv.6+). See `FEATURE_GATES` / `LEVEL_TO_TIER`.
- **Categories:** nine life areas (health, fitness, learning, …) with emoji labels in `HABIT_CATEGORIES`.
- **Scheduling:** `daily`, `weekly`, `monthly`, `custom` intervals—completion rates respect scheduled days in `statsUtils`.
- **Per-habit level:** Titles from Novice → Legendary based on total completions (`src/utils/habitLevelUtils.ts`).
- **CRUD + archive + duplicate:** Store actions in `src/store/habitStore.ts`; UI in `HabitList`, `HabitCard`, `HabitModal`, `HabitDetailPage`, `QuickLogModal`.

### Goals

- **S.M.A.R.T. goal wizard** (`SmartGoalWizard.tsx`) ties targets to habits with deadlines and achievement state.
- Stored as `Goal` entities in app state and synced with **`GET/PUT /api/state`** (PostgreSQL via the API); see [ARCHITECTURE.md](./ARCHITECTURE.md).

### Routines

- Group habits with optional **bonus XP** for full completion (`Routine` in types).
- Gated by **user tier** (see feature gates below).

### Dashboard (main game board)

Orchestrated by **`FUTDashboard.tsx`**: date navigation, quick log bar, daily mission card, goals, habits, weekly digest, streak lifeline, heatmap, stats radar, daily review entry, level-up and collectible/achievement feedback.

### Statistics

- **`StatsPage.tsx`**: time ranges, charts (Recharts), heatmaps, habit drill-down, routine filters.

### Onboarding

- **`OnboardingWizard.tsx`**: name + template habits.
- **`missions.ts`**: **7-day mission chain** (gamification / XP lumps), aligned to account age (`getOnboardingDay`). This is **not** the same as **calendar journey gating** in [UX_JOURNEY.md](./UX_JOURNEY.md) (water Days 1–3, micro Days 4–21, free Day 22+)—those layers should stay **conceptually separate** in product and engineering.

### Profile, journey, achievements

- **Profile:** Public-style stats presentation (`ProfilePage.tsx`).
- **Journey:** Level roadmap (`JourneyPage.tsx`) — levels **1–6** match `FEATURE_GATES`; higher milestones are **roadmap flair** (marked in UI copy).
- **Achievements:** Full page + toast pipeline (`AchievementsPage.tsx`, `AchievementToast.tsx`).

### Community

- **Community tab** with leaderboard and feed UI (`CommunityPage.tsx`); seed data from `dummySocialData`—treat as **UX prototype** until backed by real multiplayer APIs.

### Settings

- Theme (**light / dark / system** via `themeStore`), export/import JSON, demo data, clear data, account (`SettingsPage.tsx`).

---

### 4.6 Progression systems

### User tiers and feature gates

`UserTier` is derived from **level** via `LEVEL_TO_TIER` in `src/types/index.ts` (`novice` → `apprentice` → `practitioner` → **`strategist`** → `competent` → `expert`).  
`FEATURE_GATES` controls max habits, **which habit types can be created**, analytics, routines, goals, and custom schedules.

| Level | Tier | Habit types (create) | Notable unlocks |
|------|------|----------------------|-----------------|
| 1 | Novice | regular | — |
| 2 | Apprentice | regular, numerical | — |
| 3 | Practitioner | regular, numerical | Analytics, goals, custom schedules |
| 4 | Strategist | + infinite | Infinite Loop |
| 5 | Competent | + challenge | Routines |
| 6+ | Expert | (all) | Unlimited habit cap |

**UI:** `HabitModal` and onboarding templates respect `isHabitTypeAvailable`; `addHabit` / `duplicateHabit` enforce the same in the store (`featureGateUtils.ts`).

### Daily missions

Onboarding missions: `src/data/missions.ts`.  
The dashboard can surface a **daily mission card** tied to the user’s onboarding day and completion logic in the store/components.

### Level-up moment

`LevelUpModal.tsx` celebrates crossing level thresholds; store recalculates `stats` after completions.

---

### 4.7 Habits & goals

### Completion model

`Completion` records per date: `completed`, optional `value`, optional `note`, optional **`frozen`** (streak freeze semantics—counts as not breaking streaks when used).

### Numerical habits

Track progress toward `goalValue` with `unit`; feeds **FOC** and dedicated charts.

### Challenge habits

`startDate` / `endDate` bound the challenge; completions fall within that window.

### Goals vs habits

- **Habits** = recurring system.  
- **Goals** = directional targets (often linked to a habit) with optional deadlines and **achieved** flag.

---

### 4.8 Social & community surface

**Current state:** Leaderboard rows, rank movement affordances, and activity feed are **wired for demo content** to validate layout and motivation. **Production social** would require a backend / shared datastore, privacy controls, and anti-cheat semantics for XP—out of scope for this document but anticipated by the UI.

---

### 4.9 Screens & navigation

Primary **`TabView`** values include: `dashboard`, `community`, `statistics`, `settings`, `achievements`, `profile`, `journey` (`src/types/index.ts`).  
Layout: **`AppLayout`** + **`Sidebar`** + mobile **`BottomNav`**.

**Modal flows:** add/edit habit, quick log, goal wizard, public profile preview, daily review, level up, collectible/achievement toasts.

---

### 4.10 Data & persistence

### Client state

**Zustand** `habitStore` holds habits, goals, routines, stats, UI selections, and runs **optimistic updates**.

### Persistence

- **Server:** `GET/PUT /api/state` with PostgreSQL as system of record (debounced sync from `habitStore`). Legacy notes may mention localStorage-only; **current architecture** is in [ARCHITECTURE.md](./ARCHITECTURE.md).

### Auth

**`AuthContext`** + `Auth.tsx`: email/password, HTTP-only session cookie; gated tree in `App.tsx` (load → onboarding if empty → main app).

See **ARCHITECTURE.md** for the data-flow diagram.

---

### 4.11 Developer map (code ↔ feature)

| Concern | Primary location |
|--------|-------------------|
| Types, tiers, feature gates | `src/types/index.ts`, `src/utils/featureGateUtils.ts` |
| Global state & sync | `src/store/habitStore.ts` |
| RPG stats & XP math | `src/utils/gamificationUtils.ts` |
| Streaks & completion rates | `src/utils/statsUtils.ts` |
| Per-habit levels | `src/utils/habitLevelUtils.ts` |
| Achievements | `src/utils/achievementUtils.ts` |
| Collectible definitions | `src/data/collectibles.ts` |
| Onboarding missions | `src/data/missions.ts` |
| Dashboard | `src/components/dashboard/FUTDashboard.tsx` |
| Charts / analytics page | `src/components/stats/StatsPage.tsx` |
| Auth & bootstrap | `src/App.tsx`, `src/contexts/AuthContext.tsx` |
| Local auth helpers | `src/lib/localAuth.ts`, `src/lib/authTypes.ts` |

### Component stories (UI dev)

Ladle stories (where present) under `src/components/**/**/*.stories.tsx` support isolated work on **`HabitCard`**, **`StatsRadar`**, **`XPProgress`**, etc. See `package.json` scripts `ladle` / `ladle:build` and [UI_PREVIEW_WORKFLOW.md](./UI_PREVIEW_WORKFLOW.md).

---

### 4.12 Roadmap hooks (pixel assets, village, defense)

These are **not fully implemented** in code but fit the documented product direction:

1. **Pixel collectible pipeline** — Replace emoji `icon` fields with `assetKey` + sprite map; keep `Collectible` condition API stable.
2. **Village layer** — Map habit categories to **buildings**; completions grant **resources** for cosmetic or buff structures.
3. **Defense / upkeep** — Soft consequences (decay, repair quests) rather than destructive punishment—tied to weekly consistency or optional events.

Any of the above should **reuse** existing **XP**, **stats**, and **unlock** engines rather than fork new currencies.

---

### 4.13 Glossary

| Term | Definition |
|------|------------|
| **Season** | UX framing of the XP/level loop (not necessarily a time-limited competitive season unless enabled in product). |
| **OVR** | Overall rating; weighted summary stat. |
| **Collectible** | Catalog item with rarity and unlock condition; stored IDs on character stats. |
| **Achievement** | Separate badge track with tiered metals; may overlap conceptually with collectibles but uses its own registry. |
| **Feature gate** | Limitation unlocked by user tier/level to reduce beginner overwhelm. |
| **Streak freeze** | Completion flag that preserves streak semantics on supported days. |
| **FUT-style** | Card-like, high-contrast dashboard aesthetic used in the main home experience. |

---

### 4.14 MVP visual asset needs

### Which document types work best (for the app vs for artists)

| Doc type | Best for | In-app usage |
|----------|-----------|----------------|
| **Single Figma (or Penpot) file** — frames per screen + component library | Layout, spacing, dark/light, component states | **Primary:** devs map frames to React; tokens exported as CSS variables or Tailwind extensions. |
| **`assets-manifest.json` (or TS module)** — id → `{ path, width, height, pixelSize }` | Runtime loading of sprites/icons | **Required for MVP pixel swap:** code references stable IDs; art swaps without refactors. |
| **Sprite atlas + JSON** (e.g. TexturePacker, Aseprite export) | Many small pixel icons / collectibles | **Best for performance:** one or few PNG/WebP atlases; app uses rects for `background-position` or canvas/WebGL later. |
| **PDF / written style guide** | Narrative tone, grid, “do/don’t” | **Indirect:** onboarding for humans; **not** parsed by the app. Use for contractors; mirror critical numbers into Figma or `theme` in code. |
| **Aseprite / `.aseprite` source** | Authoring pixel art | **Not** loaded in production; export PNG/WebP + atlas for the build. |

**Practical MVP bundle:** (1) Figma for screens + tokens, (2) `assets-manifest` + exported **1× and 2×** PNGs (or one atlas), (3) optional one-page PDF “pixel rules” (palette, outline, light source) so art stays consistent.

### Visual elements needed for MVP (concrete list)

**Brand & shell**

- **App icon** (512×512 master → iOS/Android/web favicon derivatives).  
- **Splash / loading** static or short loop (pixel character + logo wordmark).  

**Habits & dashboard**

- **Category glyphs** (9 categories) — pixel 24–32px baseline, readable at list size.  
- **Habit type marks** — distinct mini-icons for regular / numerical / infinite / challenge (for cards and modal).  
- **Habit card frame** — optional tiered border or corner ornament (reuse for list + detail).  
- **Empty states** — 1 illustration set (no habits, no data for stats, offline).  

**Progression & rewards**

- **Collectible card frame** by rarity (common / rare / epic / legendary) — border + subtle BG; center holds emoji or future sprite.  
- **Achievement tier frame** (bronze → diamond) if achievements get their own art pass.  
- **Level-up modal** hero (character silhouette, burst, or badge).  
- **XP / level bar** cap-end ornament (small, repeatable).  

**Radar & profile**

- **Optional radar backdrop** or axis icons if you move beyond pure vector charts.  
- **Profile avatar placeholder** (pixel bust) for default user tile.  

**Onboarding & auth**

- **3-step onboarding** simple panels (welcome, pick habits, confirm) — can be one wide illustration split or three small scenes.  
- **Auth screen** light ambient art (non-distracting; already partially covered by existing UI).  

**Technical**

- **@2× variants** for sharp mobile; **transparent PNG** or **WebP**; **max atlas 2048×2048** unless targeting desktop-only.  
- **Safe area** notes in Figma for notches + bottom nav overlap.

---

*This document describes the RPG/collectible habit tracker as implemented in this repository, plus stated visual and feature direction. For deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).*

---

## 5. Dashboard UX goals

These goals guide every refinement pass on `FUTDashboard.tsx` and its widget components:

| # | Goal | Implementation |
|---|---|---|
| 1 | **Primary CTA is obvious** | `LogEntryBar` anchored at top header; "Add Habit" button visible in empty state |
| 2 | **Stats hierarchy is clear** | Daily Mission → Goals → Schedule (habits) → Sidebar widgets (weekly/streak/radar) |
| 3 | **Mobile-first responsive** | XP bar visible at all sizes; sidebar collapses on `< lg`; bottom-nav on mobile |
| 4 | **Cozy adventurer aesthetic** | Warm surfaces + story-forward art; tokens in `index.css` / Tailwind — see [COLOR_SCHEMA.md](./COLOR_SCHEMA.md) |
| 5 | **Graceful empty states** | Every data-less section shows a helpful prompt + action button |

**Component inventory (main dashboard surface):**
- Layout shell: `AppLayout.tsx`, `Sidebar.tsx`, `BottomNav.tsx`
- Core content: `FUTDashboard.tsx`
- Header widgets: `LogEntryBar`, `XPProgress`, `DateNavigator`
- Main widgets: `DailyMissionCard`, Goals grid, Routines + `HabitList`
- Sidebar widgets: `WeeklyDigest`, `StreakLifeLine`, `MiniHeatmap`, `StatsRadar`, Daily Review CTA
- Modals: `DailyReviewModal`, `LevelUpModal`, `AchievementToast`
