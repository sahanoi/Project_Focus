# Plan: Journey-first cold start (aligned with `docs/UX_JOURNEY.md`)

## Canonical spec

**Single source of truth for narrative + day-gating:** [`docs/UX_JOURNEY.md`](../../docs/UX_JOURNEY.md)

Summary:

1. **Isekai** — Rainy megapolis, street crossing, **truck-kun** → wake in **Maceracı Han** (room). Story assets (PNG/video) carry the transition from “cinematic” to **diegetic** UI.
2. **Diegetic beat** — App speaks to the adventurer: change is slow; habits are **drop by drop**; first quest = **water on the table** (real life: wake → drink).
3. **Days 1–3** — Only **water** is the main actionable habit; **Innkeeper** (stories) and **Garden** (other heroes’ tales) are **browse / glimpse** only.
4. **Water forever** — After day 3, water remains a **baseline routine habit** that **strengthens over time** (Duolingo-style bond)—not deleted.
5. **Days 4–21** — Seven micro-habits × three days each (not all must be daily).
6. **Day 22+** — Free selection of habits/challenges; **custom habits** supported in code, **premium / post-journey** in product.

Companion: [`docs/PRODUCT.md`](../../docs/PRODUCT.md) §2, [`docs/STORYLINE_SCENES_FOR_AI_ART.md`](../../docs/STORYLINE_SCENES_FOR_AI_ART.md).

---

## Goal (engineering)

Move new users from **auth-first** energy to **story-first** cold start: optional **Begin** → isekai beats → water ritual → **then** account, with post-auth gating that **does not duplicate** the water tutorial. Wire **`FirstSessionFlow`** (or successor) into `App.tsx` when product approves.

---

## Current state (repo) — implementation, not product target

- `IntroGate` runs `EntryIntroSequence` (timers only; backdrop is global), then `AuthenticatedApp`.
- No session → `Auth` (**sign-in first in current code**; **target** narrative order is story-first per [`docs/UX_JOURNEY.md`](../../docs/UX_JOURNEY.md)).
- `FirstSessionFlow` exists under `src/components/firstSession/` but is **not mounted** in `App.tsx`.
- No habits → `OnboardingWizard`.

---

## Target state (incremental)

1. **Pre-auth journey module** — Full **isekai → Han → water** beat; storage flags for ritual / skip (`src/constants/firstSessionStorage.ts`).
2. **Shell integration** — Unauthenticated users see journey until ritual complete (or skip), then `Auth`.
3. **Post-auth bridge** — Seed **Drink Water**, set **journey phase** (server or client flags per UX_JOURNEY); shorten/skip `OnboardingWizard` when redundant.
4. **Gating** — Days 1–3 / 4–21 / 22+ UI locks **per UX_JOURNEY** (separate slice; may need `users` or `user_stats` fields).

---

## Shared contract (do not rename without updating all slices)

| Constant | Meaning |
|----------|---------|
| `FIRST_SESSION_RITUAL_DONE_KEY` | localStorage: pre-auth water beat completed |
| `FIRST_SESSION_SKIP_KEY` | User skipped story to auth |

Implement in `src/constants/firstSessionStorage.ts`. **Journey day / phase** should move to **server-backed** fields when gating ships (see UX_JOURNEY §7).

---

## Execution order for agents

1. **Job 1** — Isekai + Han + water ritual UI module + storage helpers (**no** `App.tsx` until approved).
2. **Job 2** — Wire pre-auth journey before `Auth` when flags allow.
3. **Job 3** — Post-auth seed + wizard coordination + baseline water habit persistence.
4. **Job 4** — Journey gating service (days 1–3, 4–21, 22+) + exploration surfaces (Innkeeper / Garden placeholders).

Jobs 2–4 depend on product sign-off on copy and beat order.

---

## Out of scope (this plan file)

- Full video pipeline (keep static placeholders; document assets in STORYLINE doc).
- Premium paywall implementation (documented only in UX_JOURNEY).
- Changing DB schema without a dedicated migration task (coordinate with `server/src/db/schema.ts`).

---

## Legacy agent copy (Jobs 1–3) — optional

The detailed copy-paste blocks for **tavern-only** first session in older revisions are **superseded** by **`UX_JOURNEY.md`** (megapolis + truck + 3-day + 21-day). When implementing, use the **beats in UX_JOURNEY**, not the old “Begin → tavern only” text alone.

---

## Verification

- Cold incognito: intro → **isekai path** → auth → dashboard with water + correct **phase**.
- Returning user: abbreviated path if flags say isekai completed.
- No duplicate water tutorial between ritual and `OnboardingWizard`.
