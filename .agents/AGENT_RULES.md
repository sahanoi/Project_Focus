# Agent Rules — Project Focus v3.0

## 🚨 Read These Files Before Doing Anything

| File | Read Before… |
|---|---|
| `DOCUMENTATION.md` | ANY feature work |
| `src/types/index.ts` | Creating/modifying data structures |
| `src/store/habitStore.ts` | Modifying state or actions |
| `src/utils/gamificationUtils.ts` | Touching gamification logic |
| `src/utils/statsUtils.ts` | Touching analytics / streaks |
| `supabase_schema.sql` | Adding/modifying DB tables |

---

## ❌ Never Assume — Always Verify

- Don't invent data shapes → read `types/index.ts`
- Don't invent store actions → read `habitStore.ts`
- Don't invent gamification formulas → read `gamificationUtils.ts`
- Don't change OVR formula without user approval: `DSC×0.20 + FOC×0.15 + STK×0.20 + BAL×0.10 + GRT×0.15 + VIT×0.20`
- Don't add new habit types without updating every type union in `types/index.ts`

---

## 🧪 TDD Rules

1. New util function → write test first, then implement
2. Bug fix → write failing test first, then fix
3. New store action → add test to `habitStore.test.ts`

**Test commands:**
```bash
npm run test:run   # CI / verify
npx tsc --noEmit   # Type check
npm run build      # Full build check
```

**Test file locations:** `src/test/*.test.ts(x)`

**Minimum coverage:** ≥2 test cases per exported function. Cover: happy path, edge case (0 items, all fail, all pass).

---

## 📝 Documentation — When to Update `DOCUMENTATION.md`

| Change | Update |
|---|---|
| New component | Architecture section |
| New util function | Add JSDoc above function |
| New DB table | Auth & Backend section + `supabase_schema.sql` |
| New gamification stat | Gamification System section |
| Breaking store change | Data Flow section |

**JSDoc minimum:**
```typescript
/** Brief description. @param x - desc @returns desc */
```

---

## 🏗️ Architecture Rules

- State → Zustand only (`habitStore.ts`). No new `useState` for shared data.
- `AuthContext.tsx` is the ONLY context provider allowed.
- Every mutation order: (1) Zustand update → (2) Recalculate stats → (3) Supabase fire-and-forget
- Component files > 300 lines → split into sub-components
- No inline `style={{}}` → use Tailwind
- All new components must work in dark mode (`#111318` bg, `#1C1F26` cards)

---

## 🔐 Security

- Never commit `.env`
- All Supabase queries must filter with `.eq('user_id', user.id)`
- New Supabase tables must have RLS enabled

---

## 🚀 Deploy

```bash
git add -A && git commit -m "type(scope): description" && git push origin main
# Vercel auto-deploys from main
```

**Pre-deploy:** `test:run` ✅ + `tsc --noEmit` ✅ + `build` ✅ + manual smoke test

**Commit types:** `feat | fix | refactor | test | docs | chore`  
**Scopes:** `store | utils | ui | auth | gamification | analytics | onboarding`

---

## 🎮 Gamification — Do Not Break

- XP per completion: 50 base (×0.75 easy / ×1.0 medium / ×1.5 hard)
- XP per level: 1000 (linear)
- Stat range: all attributes clamp to `[50, 99]`
- `frozen: true` on a completion = streak not broken
- New stat → add to `CharacterStats.attributes` in `types/index.ts` AND `gamificationUtils.ts`

---

## 📋 Handover Note (required when done)

```
## Handover — [Date]
Files changed: [ ]
Tests written: [ ]
Build: ✅/❌ | Tests: ✅/❌ | TS: ✅/❌
Known issues: [ ]
Next agent should read: [ ]
```
