# UI preview and design workflow (Project Focus)

This doc implements the **See and edit UI** plan: Stitch for exploration, Cursor Browser for the real app, Figma MCP for specs, and **Ladle** for isolated components.

---

## 1. Google Stitch (you run this in the browser)

Tool: [Google Stitch](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/) (Google Labs). Tips: [Stitch prompt guide (forum)](https://discuss.ai.google.dev/t/stitch-prompt-guide/83844).

Paste the block below into Stitch to get **three** visual directions (Arena Card / Calm RPG / Data Athlete) for the same six screens.

```
You are designing UI for a production web app: **Project Focus** — a gamified habit tracker for adults who want sustainable self-improvement without boring spreadsheets.

PRODUCT CONTEXT
- Core loop: log habits daily, build streaks, earn XP, level up, see RPG-style "character stats" derived from consistency (not micro-transactions).
- Philosophy: "What would this look like if it were fun?" — productivity that feels like a game, not childish.
- Platform: responsive web app (mobile-first), primary use on phone; also comfortable on desktop.
- Visual lineage (optional inspiration, not a copy): sports trading card / squad hub energy — premium cards, stats, progression — but must feel original and app-store credible, not a knockoff game UI.

MUST-SHOW SCREENS (one flow each, high fidelity)
1) **Auth** — sign in / sign up, trust-building, minimal friction.
2) **Main dashboard / home** — today's habits, XP or level summary, streak or "daily mission" hook, clear primary action to log.
3) **Habit list** — scannable list with status, streaks, categories or tags if space allows.
4) **Habit detail** — history mini-chart or calendar strip, notes, edit affordances.
5) **Stats / progress** — at least one chart or radar-style attribute readout tied to habits (data-forward but readable on mobile).
6) **Settings** (compact) — account, notifications, theme if applicable.

STRUCTURE & UX CONSTRAINTS
- Information hierarchy: logging a habit in ≤2 taps from home where possible.
- Navigation: pick ONE pattern and stay consistent — either bottom tab bar (mobile) + optional sidebar on desktop, OR persistent sidebar that collapses on small screens. State which you chose.
- Accessibility: text contrast sufficient on dark backgrounds; touch targets ≥44px; no tiny gray-on-gray body copy.
- Empty states: include copy for "no habits yet" on list/dashboard.

OUTPUT REQUEST — THREE VARIATIONS (name each)
Produce **three separate design directions** for the same screen set above. Each variation must differ in **layout rhythm, typography, color story, and surface treatment** — not just hue shifts.

- **Variation A — "Arena Card"**: boldest; collectible / squad-hub energy; strong cards, depth, subtle motion cues (static design only), electric accent on charcoal.
- **Variation B — "Calm RPG"**: softer, editorial spacing, muted palette, journal-like calm; progression still visible but less neon.
- **Variation C — "Data Athlete"**: dense but legible; dashboard / fitness-analytics vibe; charts first, minimal ornament; high contrast, monospace or technical accents allowed sparingly.

DELIVERABLES PER VARIATION
- Cover frame: 1-line rationale + 3 adjectives for the brand feel.
- All six screens in consistent component styling for that variation.
- Short "do / don't" list (3 bullets) for engineers implementing in Tailwind (semantic tokens: background, surface, border, accent, success, danger).

ANTI-SLOP RULES
- No generic "AI gradient purple" default look unless justified by the variation.
- No lorem ipsum; use realistic habit names (e.g. "Deep work", "Mobility", "Sleep before 11").
- No watermark-style decorative blobs that fight content.
```

Export or screenshot the frames you like, then pick a direction before changing Tailwind/components in code.

---

## 2. Full app: dev server + Cursor Browser + Visual Editor

1. From the repo root: `npm run dev`.
2. In Cursor, open **Cursor Browser** (Agent/Browser features; see [Cursor Browser docs](https://cursor.com/docs/agent/browser)).
3. Open the local URL (e.g. `http://localhost:5173`).
4. Use the **Visual Editor** to drag layout, tweak styles, inspect props, and **point-and-prompt** so the agent updates source. Product post: [Visual editor for the Cursor Browser](https://www.cursor.com/blog/browser-visual-editor).

---

## 3. Figma

Paste **figma.com** file links into chat when asking the AI to match a frame. This workspace can use the **Figma MCP** to pull design context; treat output as **reference** and map it to existing Tailwind tokens and components under `src/components/`.

---

## 4. Ladle (component UI lab in this repo)

Run:

| Command | Purpose |
|--------|---------|
| `npm run ladle` | Dev server with interactive stories |
| `npm run ladle:build` | Static output to `ladle-dist/` (gitignored; script uses `ladle build -o ladle-dist`) |

Stories live next to components as `*.stories.tsx`. The global preview (`.ladle/preview.tsx`) loads `src/index.css` and applies the same `dark` + `theme-pastel-violet` classes the app uses.

**Note:** An earlier `ladle build` without `-o` may have dropped a `build` or `ladle-dist` folder next to this project on your machine; you can delete those if they are only Ladle artifacts.

---

## 5. Powerhouse / Cursor habits (for agents and humans)

- **Powerhouse** (`C:\Users\xsaha\Desktop\Ai Agents Powerhouse`): read `POWERHOUSE_CONSTITUTION.md` at session start; use chunk-sized steps (~30–50 lines), teach briefly after non-trivial work, and do **not** edit files under Powerhouse unless the user asks. This repo does not duplicate `docs/powerhouse/`; learning-log updates belong in Powerhouse when you use that workflow.
- **Cursor Rules** (`.cursor/rules/`, project rules): always-on constraints for the codebase—keep them short and actionable.
- **Skills** (`~/.cursor/skills-cursor/…`): optional playbooks (e.g. create-rule, create-skill, update-cursor-settings); load when the task matches the skill description.

For design consistency in AI prompts, many teams add a short **DESIGN-RULES.md** or rules that say “use design tokens only, no random hex.”
