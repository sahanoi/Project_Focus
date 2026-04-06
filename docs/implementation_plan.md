# Implementation Plan - Auth Color Upgrade (Golden Amber)

> **Historical:** One-off styling pass. **Product narrative and onboarding** are governed by [UX_JOURNEY.md](./UX_JOURNEY.md). This file is kept for contrast/token audit context only.

Refine the auth screen's "warm" layer to eliminate "pale/faded" tones. Update to a premium **Golden Amber** and **Warm Dark Coffee** palette as requested for better contrast and a more "premium RPG guild" aesthetic.

## 1. Style Refinement Strategy

Based on the user's feedback ("soluk", "koyu sarı altın sarısı", "sıcak koyu renk") and the project's internal "world lock" (Purple + Amber accents), we will pivot from the current pale mauve/lavender theme to a rich **Warm Gold & Coffee** theme.

### Color Palette Shift

| Role | Current (Light) | New (Golden Light) | Current (Dark) | New (Golden Night) |
|------|-----------------|--------------------|----------------|--------------------|
| **Field BG** | `#f4eee7` | `#FFF9F2` | `#2d232d` | `#1C1917` |
| **Main Text** | `#3D2F45` | **`#4A3728`** | `#F7F0F5` | **`#FCD34D`** |
| **Icons/Accent** | `text/40%` | **`#B45309`** | `text/40%` | **`#F59E0B`** |
| **Muted Text** | `#8B7594` | `#8B735B` | `#B8A4B5` | `#92400E` |

## 2. File-Specific Changes

### 2.1 `tailwind.config.js`
- Update `warm-*` and `warm-night-*` hexes.
- Add `warm-accent` and `warm-night-accent` tokens.

### 2.2 `src/index.css`
- Update `.auth-form-input` and `::placeholder` styles to match the new hexes.
- Refine the caret color for better visibility.

### 2.3 `src/components/auth/Auth.tsx`
- Refine `inputIconClass`:
  - Increase opacity from `text/40` to a more solid `text-warm-accent` or `text-warm-accent/80`.
  - Use `text-warm-accent` for the icon to give it that "premium pop".
- Refine `inputFieldClass`:
  - Use the new "warm" tokens for text, placeholder, and border.

## 3. Benefits

- **Visibility:** High contrast between text and background.
- **Premium Feel:** Amber/Gold feels more "guild-like" and "valuable" compared to pale purple.
- **Brand Alignment:** Matches the "Purple & Amber" accents specified in the project's art direction.
- **User Satisfaction:** Directly addresses the "pale color" complaint.

## 4. Verification

1. Start dev server: `npm run dev`.
2. Inspect the login screen.
3. Compare the typed text visibility against the provided screenshot.
4. Verify both Light and Dark modes.
