# Task - Auth Color Schema Refinement (Golden Amber Upgrade)

> **Historical / checklist complete.** For current product UX, see [UX_JOURNEY.md](./UX_JOURNEY.md).

Refine the auth screen's "warm" layer to eliminate "pale/faded" tones. Update to a premium **Golden Amber** and **Warm Dark Coffee** palette as requested for better contrast and a more "premium RPG guild" aesthetic.

## 1. Project Reference

- **Conversation Hist:** User feedback on pale text color (`dsadaas` in screenshot).
- **Project Rule:** Global Antigravity Rule: Systematic Planning and Documentation.
- **Reference Doc:** [STORYLINE_SCENES_FOR_AI_ART.md](file:///c:/Users/xsaha/Desktop/Project%20F/docs/STORYLINE_SCENES_FOR_AI_ART.md#L26) (Purple + Amber accents).

## 2. Checklist

- [x] **Phase 1: Style/Token Refinement** (Token Guard Check: indexed)
  - [x] Analyze current `Auth.tsx` and `tailwind.config.js` tokens.
  - [x] Identify causes for "pale" appearance (low icon opacity, pale mauve hexes).
  - [x] Update `tailwind.config.js` with **Golden Amber** (`#D97706`) and **Warm Dark Coffee** (`#451A03`) hexes.
  - [x] Add `warm-accent` (`#B45309`) and `warm-night-accent` (`#FBBF24`) tokens.

- [x] **Phase 2: CSS Refactoring**
  - [x] Modify `src/index.css` to align hardcoded `.auth-form-input` styles with new hexes.
  - [x] Update `.auth-form-input::placeholder` with higher opacity and warmer tint.

- [x] **Phase 3: Component Update**
  - [x] Update `src/components/auth/Auth.tsx`:
    - [x] Increase icon opacity from 40% to 75% for standalone.
    - [x] Increase icon opacity from 60% to 90% for atmosphere.
    - [x] Use `text-warm-accent` for the icon for a premium golden pop.
    - [x] Use new "warm dark" colors for typed values.

- [x] **Phase 4: QA / Acceptance (Evidence Collector Checklist)**
  - [x] Verify Light Mode contrast.
  - [x] Verify Dark Mode contrast (Gold text on Charcoal background).
  - [x] confirm visibility of typed text matches user's expectation ("koyu sarı altın sarısı").
