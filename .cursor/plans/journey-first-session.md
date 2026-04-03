# Plan: Journey-first cold start (PRODUCT.md §2)

## Goal

Move new users from **habit-setup energy** to **story-first cold start**: Begin → establishing scene → water ritual → **then** sign up, with post-auth handoff that avoids duplicating the same tutorial.

**Canonical spec:** `docs/PRODUCT.md` §1–§2 and P0 “First-session storyline” table.

## Current state

- `IntroGate` runs `EntryIntroSequence` (timing only; UI is global backdrop), then `AuthenticatedApp`.
- No session → `Auth` (sign-in first).
- No habits → `OnboardingWizard` (template picking; Drink Water anchored).

## Target state (incremental)

1. **Pre-auth journey module** — Self-contained flow component + storage constants (no `App.tsx` in slice 1).
2. **Shell integration** — Unauthenticated users see journey until ritual complete (or explicit skip), then existing `Auth`.
3. **Post-auth bridge** — After sign-up with ritual done: seed `Drink Water` (`STARTER_QUEST_HABIT_NAME`), consume flags, shorten or skip `OnboardingWizard` per PRODUCT coordination note.

## Shared contract (do not rename without updating all slices)

| Constant | Value | Meaning |
|----------|--------|---------|
| `FIRST_SESSION_RITUAL_DONE_KEY` | `focus_ftp_first_session_ritual_v1` | `localStorage` truthy after user completes water beat pre-auth |
| `FIRST_SESSION_SKIP_KEY` | `focus_ftp_first_session_skip_v1` | Optional: user chose “I already have an account” / skip story |

Implement in `src/constants/firstSessionStorage.ts` (create in Job 1).

**Handoff:** Job 2 reads/writes these keys via helpers exported from that file. Job 3 reads `FIRST_SESSION_RITUAL_DONE_KEY` after authenticated load to decide seed + wizard skip.

## Execution order for agents

1. **Job 1** first (isolated components + constants).
2. **Job 2** after Job 1 merges (routing).
3. **Job 3** after Job 2 merges (or in parallel only if Job 2’s integration already sets the storage key on ritual complete — safest sequential).

## Out of scope for this plan

- Video/Lottie (keep static placeholders; document filenames in PRODUCT §2).
- Cloak picker / first collectible modal (future slices).
- Changing any remote database schema (no cloud DB in this stack).

## Verification (each job)

- Job 1: Storybook or manual mount of `FirstSessionFlow` in a throwaway route optional; no regression to prod routes if not wired.
- Job 2: Cold incognito: intro → journey → auth; refresh mid-journey resumes or resets per implemented policy (document in code comment).
- Job 3: New account after ritual: lands on dashboard with Drink Water present; wizard not repeating water tutorial.

---

## Job 1 — First-session UI module (no App wiring)

**Copy everything in the block below to Agent 1.**

```
You are working in the Project F repo (React + TS + Vite + Tailwind + framer-motion). Read docs/PRODUCT.md §1–§2 for narrative intent.

Task: Add a self-contained first-session journey module. Do NOT modify src/App.tsx or IntroGate yet.

Create:
- src/constants/firstSessionStorage.ts — export FIRST_SESSION_RITUAL_DONE_KEY = 'focus_ftp_first_session_ritual_v1', FIRST_SESSION_SKIP_KEY = 'focus_ftp_first_session_skip_v1', plus small helpers setRitualDone(), isRitualDone(), setSkippedToAuth(), hasSkippedToAuth() using localStorage (try/catch for SSR/private mode).
- src/components/firstSession/ — a step flow: (1) full-screen Begin CTA matching warm RPG tone from Auth copy, (2) establishing “tavern morning” beat using a placeholder image (reuse existing assets like placeholder.png or Web bg until scene1.png exists per PRODUCT), (3) closer “glass / water” beat with one clear primary action to complete the ritual (tap/confirm — pick one pattern and use it consistently). On complete: call setRitualDone() and invoke onRitualComplete prop.
- Export default or named FirstSessionFlow with props: { onRitualComplete: () => void; onSkipToAuth?: () => void }. If onSkipToAuth provided, show a subtle secondary control “I already have an account” that calls setSkippedToAuth() then onSkipToAuth.

Constraints: Match existing component patterns (Tailwind, dark mode classes used elsewhere). Keep total new code focused; no new dependencies. No markdown files unless the user asked.

Deliverable: Module compiles; brief note in reply listing files added.
```

## Job 2 — Wire pre-auth journey before Auth

**Copy everything in the block below to Agent 2.**

```
Prerequisite: Job 1 merged — FirstSessionFlow + firstSessionStorage exist.

Read .cursor/plans/journey-first-session.md and docs/PRODUCT.md §2.

Task: For users with no auth session (and not password recovery), after IntroGate’s intro completes, show FirstSessionFlow instead of going straight to Auth when neither isRitualDone() nor hasSkippedToAuth() is true. When user completes ritual (onRitualComplete) or skips (onSkipToAuth), render the existing Auth component as today (variant="atmosphere" wrapper unchanged unless necessary).

Touch only what you need: likely src/App.tsx (unauthenticated branch) and/or src/components/auth/IntroGate.tsx. Do not break authenticated routes.

Edge cases: If ritual already done or user skipped, show Auth immediately after intro. Document in a short code comment what happens on full page refresh mid-journey (your choice: resume step vs restart — pick one and keep it simple).

Verify: Incognito cold load → intro → journey → Auth; second visit with ritual flag → Auth directly.

Deliverable: Working flow + list of files changed.
```

## Job 3 — Post-auth seed + OnboardingWizard coordination

**Copy everything in the block below to Agent 3.**

```
Prerequisite: Job 2 merged — pre-auth ritual sets FIRST_SESSION_RITUAL_DONE_KEY via firstSessionStorage.

Read docs/PRODUCT.md §2 “Coordination” about avoiding duplicate water tutorial.

Task: After successful sign-up (first session ever in this browser with ritual done): when authenticated data finishes initial load and habits.length === 0, if isRitualDone() then auto-create the Drink Water habit using the same shape as OnboardingWizard’s template for HABIT_TEMPLATES.health[0] (name must match STARTER_QUEST_HABIT_NAME in src/utils/starterQuestUtils.ts). Then clear the ritual flag from localStorage (add clearRitualDone() helper if missing) so repeat visits don’t re-seed. Skip showing OnboardingWizard entirely for this path, OR reduce to a single short “welcome” screen — prefer skip entirely if copy on dashboard is enough.

For users who signed in without ritual flag, keep current behavior (OnboardingWizard when no habits).

Do not break existing users with habits. Handle race: only seed once.

Files likely: src/App.tsx (AuthenticatedApp), src/store/habitStore.ts or a small util, possibly OnboardingWizard.

Optional: Add or extend a minimal test if the repo already tests habitStore/addHabit.

Deliverable: New user path ritual → sign up → dashboard with Drink Water, no duplicate wizard water step; files changed listed.
```
