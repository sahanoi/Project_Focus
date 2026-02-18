# Project Focus — Documentation

> **Version:** 3.0  
> **Tagline:** Sharp · Hard · Fun 🚀  
> **Repository:** [github.com/sahanoi/Project_Focus](https://github.com/sahanoi/Project_Focus)

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack & Why We Chose It](#tech-stack--why-we-chose-it)
3. [Project Architecture](#project-architecture)
4. [Development Process](#development-process)
5. [Features & Functionalities](#features--functionalities)
6. [Design System & Aesthetic Rationale](#design-system--aesthetic-rationale)
7. [Data Flow & State Management](#data-flow--state-management)
8. [Authentication & Backend](#authentication--backend)
9. [Gamification System (RPG Stats)](#gamification-system-rpg-stats)
10. [User Guide](#user-guide)
11. [Deployment](#deployment)
12. [Testing](#testing)

---

## Overview

**Project Focus** is a gamified habit tracking web application designed to make self-improvement engaging and sustainable. Inspired by FIFA Ultimate Team (FUT) card aesthetics and RPG progression systems, it transforms daily habit tracking into a compelling game where users level up, earn XP, and watch their "character stats" evolve based on real-life consistency.

The philosophy is rooted in Ali Abdaal's question: *"What would this look like if it were fun?"* — bridging the gap between productivity tools and genuine enjoyment.

---

## Tech Stack & Why We Chose It

| Technology | Purpose | Why This Choice |
|---|---|---|
| **React 18** | UI framework | Component-driven, massive ecosystem, excellent DX with hooks |
| **TypeScript** | Type safety | Catches bugs at compile time, self-documenting interfaces |
| **Vite** | Build tool | Instant HMR, fast builds, native ESM — vastly faster than CRA/Webpack |
| **Zustand** | State management | Minimal boilerplate vs Redux, built-in `persist` middleware for localStorage |
| **Supabase** | Backend (Auth + DB) | Open-source Firebase alternative with PostgreSQL, Row Level Security, and real-time subscriptions |
| **Tailwind CSS** | Styling | Utility-first approach allows rapid iteration on dark theme UI without context-switching to CSS files |
| **Recharts** | Data visualization | React-native charting library, composable, works well with Tailwind dark themes |
| **Lucide React** | Icons | Modern, consistent icon set with tree-shaking support |
| **date-fns** | Date utilities | Lightweight, modular date manipulation (vs moment.js bloat) |
| **uuid** | ID generation | RFC4122 UUIDs for offline-first ID creation before Supabase sync |
| **Vitest** | Testing | Vite-native testing, same config as build tool, blazing fast |

### Why NOT other choices?

- **Redux Toolkit** — Zustand provides equivalent functionality with ~70% less boilerplate. For a single-store app, Redux is overkill.
- **Firebase** — Supabase was chosen for its PostgreSQL foundation and open-source nature, plus it provides a generous free tier.
- **Next.js** — The app is a SPA (Single Page Application) with no SEO requirements. A framework with SSR/SSG would add unnecessary complexity.
- **CSS Modules / Styled Components** — Tailwind was preferred for rapid dark-theme iteration. The FUT aesthetic requires many micro-adjustments that are faster with utility classes.

---

## Project Architecture

```
src/
├── App.tsx                    # Root component, routing, auth gating
├── main.tsx                   # React DOM entry point
├── index.css                  # Global styles, Tailwind directives, dark mode
│
├── types/
│   └── index.ts               # All TypeScript interfaces & constants
│
├── store/
│   └── habitStore.ts          # Zustand store (state + actions + Supabase sync)
│
├── lib/
│   └── supabase.ts            # Supabase client initialization
│
├── contexts/
│   └── AuthContext.tsx         # React Context for Supabase auth session
│
├── utils/
│   ├── dateUtils.ts           # Date formatting, ranges, navigation
│   ├── statsUtils.ts          # Completion rates, streaks, analytics
│   ├── gamificationUtils.ts   # XP/Level calculation, RPG attribute formulas
│   └── habitLevelUtils.ts     # Per-habit level progression
│
├── data/
│   └── dummyData.ts           # Demo data generators for preview mode
│
├── components/
│   ├── auth/
│   │   └── Auth.tsx           # Login / Sign-up page
│   │
│   ├── onboarding/
│   │   └── OnboardingWizard.tsx  # First-time user welcome flow
│   │
│   ├── layout/
│   │   ├── AppLayout.tsx      # Shell layout (sidebar + main content)
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   └── Header.tsx         # Top header with date nav & actions
│   │
│   ├── dashboard/
│   │   ├── FUTDashboard.tsx   # Main dashboard orchestrator
│   │   ├── FUTCard.tsx        # FIFA-style player card (RPG stats)
│   │   ├── XPProgress.tsx     # Season progress bar (XP/Level)
│   │   ├── LogEntryBar.tsx    # Quick habit search & log bar
│   │   ├── StatsRadar.tsx     # Radar chart for RPG attributes
│   │   ├── StreakLifeLine.tsx  # Streak visualization widget
│   │   └── WeeklyDigest.tsx   # Weekly performance summary
│   │
│   ├── habits/
│   │   ├── HabitList.tsx      # Daily habit list with progress
│   │   ├── HabitCard.tsx      # Individual habit display + actions
│   │   ├── HabitModal.tsx     # Add/Edit habit modal form
│   │   ├── HabitDetailPage.tsx # Full detail page for single habit
│   │   └── QuickLogModal.tsx  # Quick numerical value logger
│   │
│   ├── goals/
│   │   └── SmartGoalWizard.tsx # S.M.A.R.T. goal creation wizard
│   │
│   ├── stats/
│   │   └── StatsPage.tsx      # Full analytics dashboard
│   │
│   └── settings/
│       └── SettingsPage.tsx   # App settings, export/import, account
```

---

## Development Process

### Phase 1: Foundation
1. **Scaffolding** — Initialized with `create-vite` (React + TypeScript template).
2. **Type System** — Defined all core interfaces in `types/index.ts` (Habit, Completion, Goal, Routine, CharacterStats) before writing any components.
3. **State Store** — Built the Zustand store with `persist` middleware for localStorage backup.
4. **Utilities** — Created pure utility functions (`dateUtils`, `statsUtils`) with unit tests.

### Phase 2: Core UI
1. **Layout Shell** — `AppLayout` with sidebar navigation and responsive main content area.
2. **Dashboard** — `FUTDashboard` as the primary view with habit list, stats widgets, and the FUT card.
3. **Habit CRUD** — Full create/read/update/delete with `HabitModal`, supporting all four habit types.
4. **Completion Tracking** — Toggle completion, numerical value input, streak calculations.

### Phase 3: Gamification
1. **RPG Stats Engine** — `gamificationUtils.ts` calculates 7 character attributes from real habit data.
2. **FUT Card** — Visual representation of user's "character" with stats, inspired by FIFA Ultimate Team.
3. **XP & Leveling** — 50 XP per completion, 1000 XP per level. Season progress bar in the dashboard header.
4. **Per-Habit Levels** — Individual habits gain levels based on consistency (via `habitLevelUtils`).

### Phase 4: Analytics
1. **Stats Page** — Comprehensive analytics with area charts, bar charts, pie charts, radar charts.
2. **Heat Map** — GitHub-style activity grid showing daily completion intensity.
3. **Streak Dashboard** — Per-habit streak visualization with level badges.
4. **Goal Progress** — Visual progress bars with milestone markers for numerical goals.

### Phase 5: Backend Integration
1. **Supabase Setup** — PostgreSQL database with tables for `habits`, `habit_completions`, `goals`, `routines`.
2. **Auth Flow** — Email/password authentication with `AuthContext` provider.
3. **Optimistic Updates** — All state changes update locally first, then sync to Supabase asynchronously (fire-and-forget pattern).
4. **Onboarding Wizard** — First-time user experience with template habit selection.

### Phase 6: Polish & Dark Mode
1. **FUT Aesthetic** — Dark theme with `#111318` background, cyan/purple/indigo accents, glass effects.
2. **Layout Fixes** — Resolved overflow issues, viewport height management, responsive sidebar widths.
3. **Component Dark Mode** — Updated all cards, modals, menus, checkboxes to match the dark theme.
4. **XPProgress Compaction** — Refactored from large card to compact header widget.

### Branching & Deployment Strategy
- **Single branch:** `main` — all work is committed directly.
- **Deployment:** Vercel auto-deploys on every push to `main`.
- **Local development:** `npm run dev` with Vite HMR for instant feedback.

---

## Features & Functionalities

### 1. Habit Types

| Type | Description | Example | Tracking Method |
|---|---|---|---|
| **Regular** | Binary daily habit | "Take Vitamins" | Checkbox (done/not done) |
| **Numerical** | Quantified habit with target | "Drink 8 glasses water" | Number input with goal comparison |
| **Infinite** | Avoidance habit (streak-based) | "No Junk Food" | Daily check-in, streak is the metric |
| **Challenge** | Time-bound habit | "30-Day Plank Challenge" | Start/end dates, countdown progress |

**Why these types?** — Most habit trackers only support simple checkboxes. Numerical habits (water, exercise reps), avoidance habits (no social media), and challenges (30-day streaks) are fundamentally different tracking patterns that each need their own UX.

### 2. Scheduling System

| Schedule | Description | Use Case |
|---|---|---|
| **Daily** | Every day | Morning routine, meditation |
| **Weekly** | Specific days of week | Gym M/W/F, family call on Sundays |
| **Monthly** | Specific days of month | Pay bills on 1st, monthly review |
| **Custom** | Every N days | Deep clean every 14 days |

**Why custom scheduling?** — Rigid "daily only" trackers punish users who have legitimate 3x/week habits. The schedule-aware completion rate calculator (`statsUtils.ts`) only counts scheduled days, so doing gym 3x/week at 100% completion is correctly reported as 100%, not 43%.

### 3. Categories

Nine categories: **Health, Fitness, Learning, Productivity, Mindfulness, Social, Finance, Creativity, Other** — each with an emoji icon and pre-built templates.

**Why these categories?** — They map to the major life domains used in "Wheel of Life" coaching frameworks. The `BAL` (Balance) stat in the RPG system rewards users who track habits across multiple categories, encouraging a well-rounded lifestyle.

### 4. Dashboard Widgets

- **FUT Card** — Your "player card" with OVR rating and 6 attribute stats.
- **Season Progress Bar** — Compact XP bar showing current level and progress to next.
- **Log Entry Bar** — Quick search and log habits without scrolling through the list.
- **Streak Life Line** — Visual heartbeat of all your current streaks.
- **Weekly Digest** — Summary of the past week's performance with best/worst habits.
- **Stats Radar** — Radar chart overlay of all 7 RPG attributes.

### 5. Analytics Page

- **Completion Rate Over Time** — Area chart showing trend across selected date range.
- **Per-Habit Completion** — Horizontal bar chart ranking habits by completion rate.
- **Habit Type Distribution** — Donut chart of habit types.
- **Streak Dashboard** — Per-habit streak bars with level badges.
- **Best Performing Days** — Bar chart of average completion rate by day of week.
- **Activity Heat Map** — GitHub-style green grid of daily activity.
- **Numerical Progress** — Line chart with cumulative progress and goal reference lines.
- **Goal Progress** — Progress bars with milestone markers (25%, 50%, 75%, 100%).
- **Habit Detail View** — Click any individual habit for deep-dive analytics.
- **Routine View** — Filter stats by predefined routines.

### 6. Settings

- **Dark Mode Toggle** — Light/dark theme.
- **Export JSON** — Full data backup download.
- **Import JSON** — Restore from backup file.
- **Load Demo Data** — Preview the app with generated sample data.
- **Clear All Data** — Full reset with confirmation dialog.
- **Account** — View signed-in email and sign out.

### 7. Onboarding

- **Welcome Screen** — Brand introduction with name input.
- **Template Selection** — Browse 9 categories of pre-built habit templates, select 1-5 starter habits.
- **Confirmation** — Review selected habits before launching.
- **Auto-sync** — Selected habits are immediately created in both local store and Supabase.

---

## Design System & Aesthetic Rationale

### Visual Identity

| Element | Value | Rationale |
|---|---|---|
| **Background** | `#111318` | Ultra-dark, reduces eye strain, makes accent colors pop |
| **Card Surface** | `#1C1F26` / `#1a1a2e` | Subtle elevation without harsh borders |
| **Borders** | `#2A2E37` | Barely visible separation, maintains dark cohesion |
| **Primary Accent** | Yellow-Amber gradient | High energy, associated with achievement (gold medals) |
| **Data Accents** | Cyan → Blue → Purple | Futuristic, FUT-inspired, high contrast on dark backgrounds |
| **Text Primary** | White | Maximum readability on dark surfaces |
| **Text Secondary** | `gray-400` / `gray-500` | Hierarchy without distraction |

### Why the FUT (FIFA Ultimate Team) Aesthetic?

1. **Familiarity** — Millions of FIFA players instantly recognize the card format, creating an emotional connection.
2. **Gamification without Gimmicks** — Stats like DSC (Discipline), FOC (Focus), STK (Streak) feel meaningful because they're calculated from real data.
3. **Visual Motivation** — Watching your OVR rating climb from 60 to 85+ is intrinsically rewarding.
4. **Dark Theme** — FUT's dark UI is proven to be engaging for extended sessions, which maps well to a daily-use app.

### Why Zustand Persist + Supabase (Dual Storage)?

- **Offline-first** — The app works without internet. Zustand's `persist` middleware saves to `localStorage` automatically.
- **Cloud sync** — Supabase provides cross-device access and backup. But it's secondary — the local store is always the source of truth.
- **Optimistic updates** — UI updates instantly; Supabase sync happens in the background. This eliminates loading spinners for every action.
- **Graceful degradation** — If Supabase is down, the app continues to work perfectly from localStorage.

---

## Data Flow & State Management

```
User Action (click/input)
    │
    ▼
Zustand Store (optimistic update)
    │
    ├── localStorage (persist middleware)  ← Immediate
    │
    └── Supabase (async fire-and-forget)  ← Background
         │
         └── PostgreSQL (source of truth for cross-device)
```

### Store Structure (`habitStore.ts`)

```typescript
interface HabitStore {
    // Data
    habits: Habit[];
    goals: Goal[];
    routines: Routine[];
    stats: CharacterStats;

    // UI State
    selectedDate: string;
    activeTab: TabView;
    statsFilter: StatsFilter;
    darkMode: boolean;

    // CRUD Actions
    addHabit / updateHabit / deleteHabit / archiveHabit / duplicateHabit
    addGoal / updateGoal / deleteGoal
    addRoutine / updateRoutine / deleteRoutine
    toggleCompletion / setNumericalValue

    // Data Management
    importData / clearAllData / loadDummyData / fetchAllData
}
```

Every mutation (add, update, delete, toggle) follows the same pattern:
1. Apply change to local Zustand state (instant UI update)
2. Recalculate character stats
3. Fire-and-forget async Supabase sync

---

## Authentication & Backend

### Auth Flow

```
App.tsx
  └── AuthProvider (context)
        │
        ├── Loading → Spinner
        ├── No Session → Auth.tsx (login/signup)
        ├── Session + No Habits → OnboardingWizard
        └── Session + Habits → AppLayout → FUTDashboard
```

### Supabase Tables

| Table | Key Columns | Purpose |
|---|---|---|
| `habits` | id, user_id, name, type, category, schedule, color, icon, difficulty | Habit definitions |
| `habit_completions` | habit_id, completed_date, completed, value | Daily completion records |
| `goals` | habit_id, target_value, deadline, achieved | Long-term goal targets |
| `routines` | name, habit_ids[], time_of_day | Grouped habit routines |

All tables enforce **Row Level Security (RLS)** — users can only read/write their own data.

---

## Gamification System (RPG Stats)

### Character Attributes

| Stat | Full Name | Calculation | Range |
|---|---|---|---|
| **OVR** | Overall | Weighted average of all stats | 50–99 |
| **DSC** | Discipline | Average completion rate of daily habits (30 days) | 50–99 |
| **FOC** | Focus | Numerical habit target hit-rate | 50–99 |
| **STK** | Streak | Average current streak across all habits | 55–95 |
| **BAL** | Balance | Category diversity (9 categories max) | 50–90 |
| **GRT** | Grit | Average longest streak across all habits | 50–95 |
| **VIT** | Vitality | Health & Fitness category performance | 50–99 |

### OVR Weighting

```
OVR = DSC × 0.20 + FOC × 0.15 + STK × 0.20 + BAL × 0.10 + GRT × 0.15 + VIT × 0.20
```

**Why this weighting?** — Discipline (daily consistency) and Streak (sustained effort) each get 20% because they represent the core of habit building. Vitality (health) also gets 20% because "health is wealth" — without physical wellbeing, other areas suffer. Balance gets the lowest weight (10%) because specialization in a few areas is still valuable.

### XP & Leveling

- **50 XP per completion** — Every habit check-in earns XP.
- **1000 XP per level** — Linear progression keeps the math simple and transparent.
- **Level = floor(totalXP / 1000) + 1** — Everyone starts at Level 1.

---

## User Guide

### Getting Started

1. **Sign Up** — Create an account with email/password.
2. **Onboarding** — Enter your name and select 1–5 starter habits from the template library.
3. **Dashboard** — Your main view. Check off habits daily, watch your stats evolve.

### Daily Usage

1. Open the app → You're on the **Dashboard**.
2. Check off completed habits using the checkbox/toggle.
3. For numerical habits, tap to enter today's value (e.g., "6 glasses of water").
4. Your **FUT Card** stats and **XP bar** update in real-time.

### Creating a Custom Habit

1. Click the **"+ New Habit"** button (top-right via sidebar).
2. Fill in: Name, Icon (emoji picker), Category, Type, Color.
3. For **Numerical** habits: Set goal value and unit (e.g., "30 min").
4. For **Challenge** habits: Set start and end dates.
5. Configure schedule: Daily, specific weekdays, monthly dates, or custom interval.

### Viewing Analytics

1. Click the **Statistics** tab in the sidebar.
2. Select a **date range** (Week, Month, 3 Months, Year).
3. Filter by **habit type** or click specific habit pills to drill down.
4. Click a single habit pill to see its **detail page** with dedicated charts.

### Managing Data

1. Go to **Settings** tab.
2. **Export** your data as JSON for backup.
3. **Import** a previously exported JSON file.
4. **Load Demo Data** to explore the app with sample habits.
5. **Clear All Data** to start fresh (requires confirmation).

### Understanding Your Stats

- **OVR rising** → You're consistently completing habits across multiple categories.
- **DSC dropping** → You're missing daily habits. Focus on consistency.
- **STK low** → Your streaks keep breaking. Try starting with easier, more achievable habits.
- **BAL low** → You're only tracking habits in 1–2 categories. Try adding variety.
- **VIT low** → Add or prioritize Health/Fitness habits.

---

## Deployment

### Vercel (Production)

The app is deployed on **Vercel** with automatic deployments from the `main` branch.

```bash
# Push triggers auto-deploy
git add -A
git commit -m "your message"
git push origin main
```

Vercel automatically:
1. Detects the Vite framework.
2. Runs `npm run build` (`tsc && vite build`).
3. Deploys the `dist/` directory to the CDN.

### Environment Variables (Vercel Dashboard)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) API key |

These must be set in the **Vercel project settings** → Environment Variables.

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (with HMR)
npm run dev

# Run tests
npm test

# Type check
npx tsc --noEmit

# Production build
npm run build
```

---

## Testing

### Unit Tests

Tests are written with **Vitest** and **React Testing Library**.

```bash
# Run all tests
npm test

# Run once (CI mode)
npm run test:run
```

### Test Coverage Areas

- `habitStore.test.ts` — Zustand store actions (add, update, delete, toggle).
- `Header.test.tsx` — Layout component rendering and navigation.
- `statsUtils` / `dateUtils` — Pure function tests for calculations.

### Manual Testing Checklist

- [ ] Create a habit of each type (regular, numerical, infinite, challenge)
- [ ] Complete habits and verify XP/Level updates
- [ ] Check streak calculations after consecutive days
- [ ] Export and re-import data
- [ ] Sign out and sign back in (data should persist)
- [ ] Test on mobile viewport widths
- [ ] Verify dark mode consistency across all components

---

*Built with ♥ by Project Focus team. Sharp · Hard · Fun.*
