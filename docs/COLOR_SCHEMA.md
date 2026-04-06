# Focus FTP — color schema

**Product visual direction:** **Cozy adventurer** (warm entry, story-forward); not “premium dusk purple” as a north star — see [UX_JOURNEY.md](./UX_JOURNEY.md) and [PRODUCT.md](./PRODUCT.md). Tokens below reflect **current** implementation; retheme by editing `src/index.css` + `tailwind.config.js`.

Single reference for UI surfaces, borders, and theme-driven accents. **Source of truth for RGB tokens** is `src/index.css` (`:root` / `.theme-pastel-violet` and optional `.theme-charcoal-violet`). **Tailwind names** are in `tailwind.config.js` under `theme.extend.colors`.

## Light mode (cozy lavender)

| Role | Tailwind / usage | Notes |
|------|------------------|--------|
| Page / mist background | `surface` → `#F0ECF5` | Body default in `index.css` |
| Elevated card / panel | `bg-[#FAF7FE]` | Same as `.card`, `.modal-content`, auth form shell |
| Secondary fill / chips | `surface-dark` → `#E4DEF0` | Slightly deeper lavender |
| Primary text | `dark` → `#2D2640` | Deep plum |
| Muted text | `dark-lighter`, `dark-light` | Labels, secondary copy |
| Borders | `dark-border` → `#D4C8E8` | Lilac stroke |

## Dark mode (night tones)

Driven by CSS variables `--tone-night-*` (see `index.css`). In Tailwind:

| Role | Token |
|------|--------|
| App background | `night-bg` |
| Cards / panels | `night-surface` |
| Borders | `night-border` |
| Primary text | `night-text` |
| Muted text | `night-text-muted` |
| Inputs (inset) | `night-bg` on field, `night-border` stroke |

## Accents (light + dark)

| Role | Token | Driven by |
|------|--------|-----------|
| Brand / CTAs | `primary`, `primary-dark`, `primary-light` | `--tone-primary*` |
| Success | `success`, `success-dark` | `--tone-success*` |
| Warning | `warning`, `warning-dark` | `--tone-warning*` |
| Danger | `danger`, `danger-dark` | `--tone-danger*` |

## Auth / entry — warm layer (light + dark)

Used by `Auth.tsx` so sign-in feels **cream / peach-warm** with **mauve-lilac borders**, not cold gray. **Dominant purple** stays on primary actions: `bg-primary`, links, and `focus:border-primary` / `focus:ring-primary/25`.

| Role | Light | Dark (warm night) |
|------|--------|-------------------|
| Page shell | `warm-page` `#FAF0E8` | `warm-night-page` `#1C1619` |
| Card | `warm-card` `#FFF9F5` | `warm-night-card` `#2A2228` |
| Fields | `warm-field` `#FFFCF9` | `warm-night-field` `#231D24` |
| Borders | `warm-border` `#E9D4E8` | `warm-night-border` `#4A3E4D` |
| Headings | `warm-text` `#3D2F45` | `warm-night-text` `#F7F0F5` |
| Labels / secondary | `warm-muted` `#8B7594` | `warm-night-muted` `#B8A4B5` |

Tailwind: `tailwind.config.js` → `warm-*` and `warm-night-*`.

## Dashboard / rest of app (lavender)

- **Form card** (elsewhere): `bg-[#FAF7FE]` + `border-dark-border` — see “Light mode (cozy lavender)” above.
- **Fields** (`.input-field`): `surface` / `night-*` as in the main tables.
- **Story / atmosphere backdrop**: Warm browns are decorative only (`auth-story-backdrop-fill` in `index.css`); auth chrome uses the **warm layer** table so it matches the art without looking steel-gray.

## Retheming

1. Adjust `--tone-*` in `src/index.css` on `:root` (or switch root class to `.theme-charcoal-violet`).
2. If you change the light card tint, update `#FAF7FE` in this doc, in `.card` / `.modal-content`, and any other hard-coded card hex to stay aligned.
3. Auth warm hexes live in `tailwind.config.js` (`warm-*`); tweak there and refresh this table if you shift the entry screen.
