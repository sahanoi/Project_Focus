# Focus FTP — User experience journey (authoritative)

**Status:** Canonical product UX for onboarding, pacing, and progression.  
**Companion docs:** [PRODUCT.md](./PRODUCT.md) (vision + feature map), [STORYLINE_SCENES_FOR_AI_ART.md](./STORYLINE_SCENES_FOR_AI_ART.md) (art prompts), [ARCHITECTURE.md](./ARCHITECTURE.md) (stack).

**Principle:** The **water habit** is never “finished and discarded.” After the opening arc it becomes a **baseline routine habit**—always present, **strengthening over time** (Duolingo-style growing bond between app and user). Other habits stack on top; water remains the emotional and mechanical anchor.

---

## 1. Phases at a glance

| Phase | Calendar | What the user experiences |
|-------|-----------|---------------------------|
| **Discovery** | — | User finds and opens the app. |
| **Isekai intro** | First launch only | Cinematic beat → diegetic Han. |
| **Han awakening** | Same session | Story shifts from “video” to **in-app dialogue**; bond begins. |
| **Water focus + soft explore** | Days 1–3 | Only **water** is actionable as the main habit; **Innkeeper** (stories) and **Garden** (other heroes’ success stories) are **browse-only** depth. |
| **Micro habit track** | Days 4–21 | **Seven** micro habits, **three days each** (21 days total). Not every habit is daily (e.g. weekly family meal is valid). |
| **Free adventure** | Day 22+ | Full habit/challenge pool; **custom habits** supported in code, **product** treats them as **premium / later** (not required in the 21-day path). |

---

## 2. Opening: isekai sequence (first launch)

1. **Cinematic layer (rainy megapolis)**  
   User crosses the street on a rainy day; **truck-kun** impact (tone: isekai trope, not gore).

2. **Cut to Maceracı Han (Adventurer’s Inn)**  
   Eyes open in a **room at the story hub**—the PNG/story assets support this transition from “presentation” to **place**.

3. **Diegetic handoff**  
   At this moment the app **speaks to the adventurer (user)** directly: change **takes time**; habits are built **drop by drop**; the **glass of water on the table** is the first quest.

4. **Real-life bridge**  
   Copy ties the first action to **waking up and drinking water** (or the team’s exact rule for “first water of the day”).

5. **Account**  
   Sign-up / sign-in fits **after** this emotional beat (exact order can match engineering constraints; narrative intent is **story before buffet**).

---

## 3. Days 1–3: water only + exploration mode

- **Primary progress:** Log and reinforce **one habit — water** (same identity as “Drink Water” / hydration anchor in product copy).
- **Secondary spaces (glimpse only):**
  - **Innkeeper chat** — lore, short tales, warmth (no new habit creation here).
  - **Garden** — success stories of **other heroes** (motivation, social proof).
- **Locked or teaser:** Full stats depth, multiple habit CRUD, challenges, and “build your system” flows stay **disabled or clearly labeled** (“Opens after your first drops are steady” / Day 4 messaging).
- **Engineering note:** “Exploration” is **UX gating**, not necessarily separate routes on day one—can be modal/hub slices.

---

## 4. Baseline routine: water after day 3

- Water does **not** disappear after day 3. It becomes a **permanent baseline habit** in the user’s routine list.
- Over time, **strength / bond / streak / tier** (exact mechanic = product + `gamificationUtils`) **increases**—same Duolingo-style “relationship with the app” idea: longer use → deeper recognition, not a one-off tutorial reward.

---

## 5. Days 4–21: seven micro habits × three days

- **Structure:** 7 slots × 3 days = **21 days**.
- **Scheduling:** Micro habits are **not** required to be daily; **weekly or custom cadence** is valid (e.g. family dinner once a week).
- **UX:** Each block opens with a short **bridge line** (Han / narrator): “For these three days, one focus: [X].”
- **State:** Prefer explicit **journey state** in client + server (flags, `journey_day`, `active_micro_id`)—exact schema is implementation work; this doc is the **behavioral contract**.

---

## 6. Day 22+: freedom and premium custom

- User may choose from **habits**, **challenges**, and future seasonal content.
- **Custom habits:** Implement **data model and UI** to be **custom-ready**; **do not** force custom creation during the 21-day guided path. Position **custom** as **premium** (or post-journey) when product is ready.

---

## 7. Traceability to engineering

| UX concept | Likely touchpoints (non-exhaustive) |
|------------|-------------------------------------|
| Journey gating | `App.tsx` shell, Zustand `habitStore`, new journey slice or flags |
| Water as baseline | `STARTER_QUEST_HABIT_NAME` / templates; never delete after phase |
| 3-day / 21-day counters | Server-backed user profile fields or derived from `habits` + `completions` |
| Isekai module | `FirstSessionFlow`, `EntryIntroSequence`, assets under `src/assets/` |
| Duolingo-style bond | Progressive rewards, copy, optional “bond level” separate from season level |

---

## 8. What this doc supersedes

Older docs that described **auth-first** cold start, **only** tavern-without-isekai, or **MVP dusk-purple** as the north-star **visual** should be read in light of **this journey** and the separate **cozy adventurer** visual direction. Update cross-references in [PRODUCT.md](./PRODUCT.md) when sections conflict; **this file wins for onboarding order and day-gating**.

---

*Last aligned: product narrative (isekai → water → 3-day focus → 7×3 → free roam + premium custom later).*
