# Google Stitch — Master UI prompt pack (Project Focus)

**Tool:** [Google Stitch](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/) (Google Labs). Tips: [Stitch prompt guide (forum)](https://discuss.ai.google.dev/t/stitch-prompt-guide/83844).

**Product:** **Project Focus** (Focus FTP) — cozy adventurer habit RPG: real habits, XP, levels, story-first optional onboarding. Canonical journey: [`UX_JOURNEY.md`](./UX_JOURNEY.md) (isekai → Han → water baseline → Days 1–3 / 4–21 / Day 22+).

**How to use this file**

1. **Paste `GLOBAL_CONTEXT` first** (below) into Stitch, then paste **one `Stitch prompt` block** per generation batch.
2. Stitch works best with **3–6 screens per session** + shared context; repeat until all IDs are covered.
3. **Anti-slop:** avoid generic “AI purple” gradients unless a variation explicitly needs them; prefer warm paper, sage, amber, soft lavender as *supporting* neutrals.
4. **Rules for all prompts:** no real third-party logos, no watermarks, no lorem beyond UI labels; touch targets ≥44px; WCAG-minded contrast; `prefers-reduced-motion` friendly where motion is mentioned.

---

## Master index (prompt IDs)

| # | ID | Category |
|---|-----|----------|
| 1 | `GLOBAL_CONTEXT` | Always prepend |
| 2 | `AUTH_SIGN_IN_UP` | Auth & entry |
| 3 | `LOADING_FULLSCREEN` | Auth & entry |
| 4 | `WEB_BG_BACKDROP` | Auth & entry |
| 5 | `ENTRY_INTRO_GATE` | Auth & entry |
| 6 | `FIRST_SESSION_FLOW` | Auth & entry |
| 7 | `ONBOARDING_WIZARD` | Auth & entry |
| 8 | `APP_LAYOUT_SHELL` | Shell & nav |
| 9 | `SIDEBAR_DESKTOP` | Shell & nav |
| 10 | `BOTTOM_NAV_MOBILE` | Shell & nav |
| 11 | `JOURNEY_PAGE` | Shell & nav |
| 12 | `PROFILE_PAGE` | Shell & nav |
| 13 | `DASHBOARD_HOME` | Dashboard |
| 14 | `LOG_ENTRY_BAR` | Dashboard |
| 15 | `DATE_NAVIGATOR` | Dashboard |
| 16 | `XP_PROGRESS` | Dashboard |
| 17 | `DAILY_MISSION_CARD` | Dashboard |
| 18 | `STARTER_QUEST_CARD` | Dashboard |
| 19 | `WEEKLY_DIGEST` | Dashboard |
| 20 | `STREAK_LIFELINE` | Dashboard |
| 21 | `MINI_HEATMAP` | Dashboard |
| 22 | `STATS_RADAR` | Dashboard |
| 23 | `HABIT_LIST` | Habits |
| 24 | `HABIT_CARD` | Habits |
| 25 | `HABIT_DETAIL_PAGE` | Habits |
| 26 | `HABIT_MODAL` | Habits |
| 27 | `QUICK_LOG_MODAL` | Habits |
| 28 | `STATS_PAGE` | Stats & settings |
| 29 | `SETTINGS_PAGE` | Stats & settings |
| 30 | `COMMUNITY_PAGE` | Social |
| 31 | `ACHIEVEMENTS_PAGE` | Rewards |
| 32 | `SMART_GOAL_WIZARD` | Goals |
| 33 | `LEVEL_UP_MODAL` | Modals |
| 34 | `DAILY_REVIEW_MODAL` | Modals |
| 35 | `PUBLIC_PROFILE_MODAL` | Modals |
| 36 | `SHARE_HABIT_MODAL` | Modals |
| 37 | `TOAST_ACHIEVEMENT` | System / chrome |
| 38 | `TOAST_COLLECTIBLE` | System / chrome |
| 39 | `APP_LOGO` | System / chrome |

---

## GLOBAL_CONTEXT

### Stitch prompt (paste with every batch or once per Stitch session)

```
You are designing production UI for "Project Focus" (Focus FTP): a cozy adventurer–themed habit tracker for adults—mobile-first responsive web app (Tailwind-friendly semantic tokens: background, surface, border, accent, success, danger).

Product: Users log habits, earn XP, level up, and see RPG-style stats derived from real behavior. Optional narrative: isekai-style intro, Adventurer's Inn (Maceracı Han), water as the first anchor habit that stays forever and strengthens over time (Duolingo-style bond). Guided phases: Days 1–3 water focus with soft exploration; Days 4–21 seven micro-habits × three days; Day 22+ free roam. Custom habits: premium/post-journey in product.

Visual: Cozy adventurer—not corporate dashboard, not childish game, not generic "AI slop" purple. Warm paper/stone surfaces, ember or sage accents, soft lavender only as secondary. Cards with gentle radius; readable sans typography.

Constraints: No real logos or watermarks. UI labels only—no lorem paragraphs. Touch targets ≥44px. Show empty, loading, and success states when relevant. Respect accessibility (contrast, focus rings, reduced motion).
```

---

## AUTH_SIGN_IN_UP

### Stitch prompt

```
Project Focus is a cozy adventurer habit RPG for mobile-first web. UI should use Tailwind-friendly semantic tokens: warm paper/stone surfaces, amber or ember accents, soft sage or dusk lavender only as supporting neutrals—never cold generic "AI purple" as the hero color.

Design a sign-in / sign-up screen on top of a full-bleed story backdrop (softly blurred fantasy inn or rainy city silhouette—illustrative, not branded). Center a rounded warm card with clear hierarchy: primary heading ("Welcome back" / "Begin your journey"), email field, password field, primary CTA button (min 44px height), secondary text toggle between Sign in and Create account, and a discreet "Forgot password?" text link in a footer row. Show empty states as gentle helper text under fields, not harsh errors. Ensure all tap targets ≥44px, visible focus rings, and sufficient contrast on the card over the backdrop. No real logos, no watermarks, no lorem beyond short UI labels.
```

---

## LOADING_FULLSCREEN

### Stitch prompt

```
Project Focus is a cozy adventurer habit RPG for mobile-first web. Use semantic color tokens that match the app shell: soft lavender-tinted surface for "resolving session" and a slightly warmer parchment surface variant for "loading your adventurer profile," both legible and calm.

Full-viewport loading overlay: subtle vignette or radial wash, centered indeterminate spinner or breathing dot cluster in warm metal/gold tone, short status line above or below ("Checking your session…", "Gathering your quests…"). Optional faint parallax specks or lantern glow for atmosphere—very low contrast so text stays readable. Include a reduced-motion friendly static state (spinner replaced by three pulsing bars). Minimum 44px touch-safe padding from screen edges if any cancel appears (omit cancel for auth gate). Accessibility: respect prefers-reduced-motion in copy ("This may take a moment"). No real logos, no watermarks, no lorem beyond labels.
```

---

## WEB_BG_BACKDROP

### Stitch prompt

```
Project Focus is a cozy adventurer habit RPG for mobile-first web. The backdrop layer must support semantic tokens: deep twilight ink, warm amber rim light, and optional soft lavender haze—cozy and readable, not neon cyberpunk.

Design a full-bleed background layer behind UI: left/top safe for a low-detail story scene (Adventurer's Inn interior or rainy street silhouette) that can crossfade from a neutral placeholder gradient into a richer painted scene. Add an optional bottom or center scrim gradient (warm charcoal to transparent) wherever foreground copy or cards need contrast. Show two states side by side or in notes: (A) placeholder wash with subtle grain, (B) final scene with gentle crossfade hint. No UI chrome in the art itself; this is strictly the atmospheric layer. No real logos, no watermarks, no lorem beyond tiny optional "Scene loading" debug-style label if needed.
```

---

## ENTRY_INTRO_GATE

### Stitch prompt

```
Project Focus is a cozy adventurer habit RPG for mobile-first web. This gate appears before the main app: minimal chrome, story-first, Tailwind-friendly tokens (warm paper text on deep twilight background).

Frame a timed intro screen: almost full-bleed cinematic backdrop (rainy city crossing fading toward inn interior—abstract enough to feel premium). Top safe-area margin only; no heavy nav bars. Bottom third reserved as a future CTA zone: soft frosted scrim band, large rounded primary button placeholder ("Continue" / "Enter the Han") at least 44px tall, optional subtle secondary hint text for skip-to-account later. Show idle state (no CTA yet) and reveal state (CTA fades in). Include gentle progress indicator (thin ember line or three dots) for pacing without looking like a video player. Accessibility: high-contrast CTA label, focus state on the button. No real logos, no watermarks, no lorem beyond short labels.
```

---

## FIRST_SESSION_FLOW

### Stitch prompt

```
Project Focus is a cozy adventurer habit RPG for mobile-first web. Canonical flow: optional isekai beat, then Maceracı Han (Adventurer's Inn), then water as the first real-life bridge—warm tokens, cozy illustration accents, never sterile spreadsheet UI.

Multi-step mobile flow (vertical scroll or stepped cards with progress dots): Step 1—hero panel with "Begin" CTA (44px+) over soft story art. Step 2—tavern establishing beat: dialogue-style card with innkeeper/Han voice, lantern and wood textures in the background wash. Step 3—water ritual beat: chalice/glass iconography, copy tying to "first water of the day," single primary action ("I'm ready" / "Log my first drop"). Persistent subtle footer link: "Skip to sign in" / "I already have an account" as text button (44px min height). Empty states: gentle prompts if user hesitates. Accessibility: large type option friendly hierarchy, visible focus, reduced-motion variant (static panels). No real logos, no watermarks, no lorem beyond instructional microcopy labels.
```

---

## ONBOARDING_WIZARD

### Stitch prompt

```
Project Focus is a cozy adventurer habit RPG for mobile-first web. Onboarding should feel like joining a guild, not filling a form: warm parchment cards, ember primary actions, semantic spacing suitable for Tailwind utilities.

Wizard screens (mobile): Screen A—friendly name field with avatar placeholder ring (generic silhouette), helper line about how Han will address the user. Screen B—template habit selection as large tappable tiles (include "Drink water" as recommended/first-class, plus 2–3 other cozy micro-habits as examples), no dense tables. Optional "demo path" ribbon or toggle that explains a guided first week without exposing raw data grids. Show empty selection state with inviting illustration thumbnail and one-line guidance. Progress indicator at top (steps 1–3). Primary CTA always ≥44px; secondary "Back" as ghost button. Accessibility: field labels, error text in warm red-brown not harsh pure red. No real logos, no watermarks, no lorem beyond short UI strings.
```

---

## APP_LAYOUT_SHELL

### Stitch prompt

```
Product context: Project Focus is a cozy, adventurer-themed habit app (mobile-first responsive web). The shell frames all tab content with a warm, low-contrast "tavern scroll" feel—not flat white.

Design a main app layout shell. Hierarchy: (1) full-viewport soft surface background (subtle paper/linen gradient or noise, WCAG-friendly contrast for text zones); (2) primary content region with comfortable horizontal padding and max-width on large screens; (3) persistent chrome: on mobile, reserve bottom safe-area inset so scrollable content never hides behind the fixed bottom nav—add extra padding-bottom matching safe-area; on desktop, reserve left rail width for a collapsible sidebar so main content has consistent left margin when the sidebar is expanded.

Components: single scroll container for page body; optional top bar slot (minimal). Desktop: content reads as a centered or left-aligned column beside the sidebar. Mobile: single column, thumb-friendly vertical rhythm.

Accessibility: logical focus order into main landmark (main); skip link to main content; minimum 4.5:1 for body text on chosen background; respect prefers-reduced-motion for any shell transitions.
```

---

## SIDEBAR_DESKTOP

### Stitch prompt

```
Product context: Project Focus (Focus FTP)—cozy adventurer habit tracker. Desktop users navigate via a collapsible sidebar instead of the mobile bottom bar.

Design a desktop sidebar (240–280px expanded, icon-only collapsed). Hierarchy: header logo lockup "Focus FTP" with small adventurer/inn motif; primary nav list: Dashboard, Profile, Statistics (show optional locked state: muted label + lock icon + tooltip "Opens as your routine steadies"), Community, Achievements, Settings; utility row: theme toggle (sun/moon, clear labels); primary CTA "Add habit" as a filled cozy button; footer with compact user row (avatar circle, display name, chevron or "Account").

Components: nav items as text + optional left icon; active item with soft pill or left accent bar; collapse chevron at bottom or top rail toggles width.

Behavior: collapsing hides labels, keeps icons + tooltips on hover/focus. Accessibility: nav landmark; keyboard roving tabindex or native links; visible focus rings; aria-expanded on collapse control; lock affordance uses aria-disabled or explanatory text, not color alone.
```

---

## BOTTOM_NAV_MOBILE

### Stitch prompt

```
Product context: Project Focus—mobile-first habit app with tab-based navigation. The bottom bar is the primary way users move between Home, insights, social, rewards, and identity.

Design a fixed bottom navigation bar for mobile. Items (L→R): Home, Stats (include a small lock badge on the icon when gated—still tappable to explain or preview), Social, Badges, Profile. Hierarchy: bar sits on a raised soft surface (slight shadow or border-top) above content; each item = icon + short label (max one line).

Active state: pill or underline indicator behind the active icon, cozy accent color; inactive icons slightly desaturated. Safe area: extend bar background into iOS/Android home-indicator inset (use extra padding-bottom); icons and labels sit above the unsafe zone.

Desktop: omit or replace with sidebar (this prompt is mobile-only). Accessibility: role="navigation" with aria-label="Main"; current page aria-current="page"; touch targets ≥44×44px; lock badge not sole indicator—pair with label or hint text for screen readers.
```

---

## JOURNEY_PAGE

### Stitch prompt

```
Product context: Project Focus guides users from water-first days through micro-habit chapters (7×3 days) to free roam. The Journey screen makes progression feel like an adventurer's roadmap, not a settings list.

Design a Journey page: vertical, scrollable timeline (levels 1–6+). Hierarchy: page title + short subtitle ("Your path, drop by drop"); roadmap column with nodes for each level; between nodes, milestones (e.g. Day 4 unlock, Day 22 freedom) as cards or gems on the path; each level shows tier name (fantasy inn/adventurer naming, legible sans) and feature gates as chips or small icons (e.g. Stats depth, multi-habit, community depth) with locked/unlocked styling.

Components: vertical connector line or trail; level nodes tappable (optional detail sheet). Mobile: full-width timeline with comfortable vertical spacing. Desktop: timeline in a max-width column with optional side legend.

Accessibility: headings in order (h1 then h2/level titles); milestones as lists or structured regions; icons paired with text; sufficient contrast for locked vs unlocked; motion on path animation respects reduced motion.
```

---

## PROFILE_PAGE

### Stitch prompt

```
Product context: Project Focus treats the profile as a hero sheet—public-adjacent pride, stats, and collectibles—while keeping editing calm and secondary.

Design a Profile page in a public-style layout. Hierarchy: top hero band with large avatar (ring or soft frame), display name, tier badge (pill with icon); secondary row with edit affordances ("Edit profile", "Share" as text buttons or icons with labels). Below: GPI radar chart area (hexagon or 5–6 axis placeholder with axis labels—Growth, Consistency, etc.—even if data is sample); stats grid (2×2 or 2×3 cards: streak, habits active, drops logged, journey day); collectibles strip horizontal scroll of badge thumbnails with titles.

Mobile: stack sections; chart full-width with legend under. Desktop: two-column optional (avatar left, chart + stats right).

Accessibility: profile image has meaningful alt or decorative marking; chart has text summary or table fallback nearby; carousel strip has visible scroll affordance + keyboard focus on items; interactive controls ≥44px; color not sole carrier of tier meaning (icon + text).
```

---

## DASHBOARD_HOME

### Stitch prompt

```
Design Project Focus — the main FUTDashboard home for a habit and goals app. Product context: users track habits, earn XP, complete daily missions and starter quests (e.g. water), and manage goals and routines; desktop may show a right column of digest, streak, and radar widgets. Layout: top header with date navigation, XP strip, and quick log bar; primary column stacks daily mission, starter quest, goals, routines, and habit list; optional narrow right column on large screens for widgets. Include empty state (onboarding-friendly copy, soft illustration or icon, single primary CTA to add first habit or mission). Include loading state (skeleton placeholders for header, cards, list rows). Include success state (filled data, clear hierarchy, subtle celebration accents on completed items). Style: calm focus-productivity aesthetic, readable typography, accessible contrast, mobile-first that expands to two columns on desktop.
```

---

## LOG_ENTRY_BAR

### Stitch prompt

```
Design the top quick-log strip for Project Focus on FUTDashboard: a persistent bar for fast habit logging without leaving the dashboard. Product context: users log today's completions from home; habits are searchable and selectable. Layout: horizontal strip with search or combobox to find/select a habit, a clear "Log today" (or equivalent) primary action, optional secondary affordance (e.g. last-used habit chip). Empty state: placeholder text in search ("Find a habit…"), disabled or gentle secondary CTA until a habit is selected, short hint if no habits exist ("Add a habit to start logging"). Loading state: inline spinner or skeleton in the bar, action disabled. Success state: brief confirmation (toast, checkmark, or micro-animation) after log, bar resets ready for next entry. Keep height compact, thumb-friendly on mobile, keyboard-friendly on desktop.
```

---

## DATE_NAVIGATOR

### Stitch prompt

```
Design DATE_NAVIGATOR for Project Focus: controls which day the dashboard reflects (logs, missions, streak context). Layout: previous day control, centered date label (weekday + full date), next day control, and an affordance to open a calendar picker (icon button or "Calendar"). Product context: users review past days and plan ahead from FUTDashboard. Empty state: rare for dates; show neutral default "today" with clear label even when surrounding content is empty. Loading state: subtle shimmer on label or dimmed controls while day data loads. Success state: crisp active date, disabled "next" if already on today (or visual cue), calendar popover or sheet with selected day highlighted. Ensure large tap targets, screen-reader-friendly labels, and no ambiguous "which day am I viewing?"
```

---

## XP_PROGRESS

### Stitch prompt

```
Design XP_PROGRESS for Project Focus: the season level experience bar on FUTDashboard. Show current tier name, level progress bar, and "XP to next level" (numeric or "1,240 XP to Level 12"). Product context: XP rewards missions, quests, and habits; this module anchors motivation. Optional: entire card or chevron indicates tap target to open journey or full progression screen. Empty state: new user at Level 1 with 0 XP — welcoming copy, bar at start, tier name like "Rookie" or "Season 1". Loading state: skeleton bar and muted text placeholders. Success state: filled bar with smooth gradient or brand accent, tier badge, optional micro-sparkle near milestones. Desktop and mobile variants; compact height so it fits under the header.
```

---

## DAILY_MISSION_CARD

### Stitch prompt

```
Design DAILY_MISSION_CARD for Project Focus FUTDashboard: one daily mission with title, progress, reward XP, and claim CTA. Layout: card with mission title, progress (e.g. "2/3 habits" or progress bar), reward XP badge, and primary Claim when complete; secondary state when incomplete shows what's left. Empty state: "No mission today" with illustration and CTA to enable missions or view weekly plan. Loading state: skeleton title, bar, and button placeholder. Success state: mission complete with Claim enabled, optional confetti restraint; after claim, show "Claimed" with XP earned and muted card or next mission teaser. Align with dashboard cards (radius, shadow); clear disabled vs enabled Claim.
```

---

## STARTER_QUEST_CARD

### Stitch prompt

```
Design STARTER_QUEST_CARD for Project Focus: the drink water starter quest on the dashboard. Product context: onboarding quest with streak progress 0/3 days. Layout: friendly card with quest title, streak counter (0/3 with visual steps or dots), short instruction ("Log water today"), and celebratory micro-copy when progress advances ("One sip closer!" / "Day 1 done — two to go!"). Empty state: not started — 0/3, inviting illustration (glass/water), single primary action to log or start. Loading state: skeleton for title and streak row. Success state: 3/3 complete — celebratory headline, completion badge, XP or unlock mention, optional "What's next?" link. Warm, encouraging tone; avoid guilt; mobile-first card.
```

---

## WEEKLY_DIGEST

### Stitch prompt

```
Design WEEKLY_DIGEST for Project Focus: a compact weekly summary widget for desktop sidebar (or collapsible on mobile). Product context: quick read on how the week went vs goals and habits. Layout: widget title ("This week"), 2–4 stat rows (e.g. completion rate, best day, total logs, XP gained), optional trend chevrons or sparkline. Empty state: "Not enough data yet" with prompt to log this week, minimal chart area. Loading state: skeleton stats and tiny chart placeholder. Success state: filled numbers, subtle positive/negative trend coloring, "View details" link. Keep information dense but scannable; align with FUTDashboard sidebar width; accessible color for trends (not color-only).
```

---

## STREAK_LIFELINE

### Stitch prompt

```
Design STREAK_LIFELINE for Project Focus: a streak visualization as a strip or card (sidebar or below header on mobile). Product context: users protect daily streaks across habits or a primary focus habit. Layout: current streak number, label ("day streak"), and lifeline visual (connected nodes, timeline, or flame steps) showing recent days complete/missed. Empty state: streak 0, gentle copy ("Start your lifeline today"), empty nodes grayed. Loading state: pulsing nodes or skeleton lifeline. Success state: active streak with highlighted last N days, milestone marker (e.g. 7, 30), optional tooltip on tap. Calm urgency (motivating, not punishing); compact vertical or horizontal strip.
```

---

## MINI_HEATMAP

### Stitch prompt

```
Design MINI_HEATMAP for Project Focus: a small contribution-style heatmap for habit consistency (GitHub-style but softer). Product context: sits on FUTDashboard as a glanceable consistency widget. Layout: title, legend (less → more), grid of cells for recent weeks/days, optional hover/tap for date + count. Empty state: uniform light cells, copy "No activity yet" or filter "Pick a habit". Loading state: skeleton grid. Success state: varied intensity fills, today outlined, tooltips or bottom sheet on mobile; respect color-blind-safe palette. Fixed small footprint suitable for sidebar or card footer; no year-long wall — keep mini.
```

---

## STATS_RADAR

### Stitch prompt

```
Design STATS_RADAR for Project Focus: a six-attribute radar chart card (e.g. DSC, FOC, and four sibling stats — discipline, focus, consistency, energy, recovery, balance — use abstract labels on axes). Product context: personality of the user's week derived from behavior; desktop sidebar widget. Layout: card title, hexagonal/radar plot, axis labels around perimeter, optional overall score or tier in corner. Empty state: faint gray web, "Complete activities to reveal your shape", CTA to log. Loading state: animated or skeleton radar. Success state: filled semi-transparent polygon, legend or short insight line ("Strong focus, room for recovery"). Ensure labels don't overlap; provide text summary for accessibility; matches FUTDashboard card system.
```

---

## HABIT_LIST

### Stitch prompt

```
Design a Project Focus screen: cozy adventurer habit tracker, warm paper-and-forest palette, soft rounded cards, subtle texture. Scrollable vertical list of HabitCards grouped or subtly labeled by category (e.g. Health, Mind, Adventure). Each row shows streak (flame or trail motif), completion today (clear checked vs open state), and a discreet archive affordance (swipe hint, overflow menu, or archive icon) without clutter. States: loading skeleton rows; empty state with friendly illustration and "Add your first habit"; error retry; pull-to-refresh optional. Accessibility: large tap targets, readable contrast in light/dark. Tone: encouraging, calm, not gamified chaos—adventure as gentle journey.
```

---

## HABIT_CARD

### Stitch prompt

```
Single habit row/card for Project Focus: cozy adventurer UI, rounded rectangle, soft shadow. Left: small icon in a circular badge (custom glyph, not a real brand). Title bold, one line with ellipsis. Streak shown as a flame or ember trail + number. Category chip (muted pill) aligned right or below title. Primary action: check / log button (filled when incomplete, success state when done today). States: default, hover/focus (web), pressed, completed today (subtle sparkle or stamp), long-press hint for quick actions. Optional progress ring if habit has a numeric goal. Keep hierarchy: name > action > meta. Warm neutrals, sage or amber accents.
```

---

## HABIT_DETAIL_PAGE

### Stitch prompt

```
Full-screen habit detail for Project Focus, cozy adventurer aesthetic. Top bar: back button, habit name, optional menu (edit/archive). Hero: streak summary and "today" status. History: Recharts-style area or line chart for completions over time (friendly, not clinical). Below: calendar strip or mini month showing logged days. Notes section: short journal entries list + add note. Streak stats cards (current, best, consistency %). Edit as primary or secondary CTA. States: no data yet (gentle empty chart), loading placeholders, error with retry. Scroll vertically; sections separated by soft dividers. Dark/light readable; calm typography.
```

---

## HABIT_MODAL

### Stitch prompt

```
Add / edit habit modal (sheet on mobile, centered dialog on desktop) for Project Focus. Fields: name, type (binary vs measurable), schedule (days of week / frequency), category picker, difficulty (easy–hard as stepped control), goal value (number + unit when type is measurable). Clear Save and Cancel; save disabled until valid. Validation states: inline hints, shake or red outline on error. Edit mode pre-fills fields; show "unsaved changes" if user dismisses. Cozy adventurer styling: rounded inputs, warm background scrim, iconography for schedule. Keyboard-friendly tab order. Avoid overcrowding—group advanced options in a collapsible "More" if needed.
```

---

## QUICK_LOG_MODAL

### Stitch prompt

```
Quick log overlay for Project Focus when a habit is selected: fast, low-friction. Dimmed backdrop; compact card. Show habit name + icon at top. Quantity slider (or stepper) for measurable habits; for binary habits, show a single Done toggle or big confirm. Optional note field (single line, expandable). Confirm primary button; Cancel or tap-outside to dismiss. States: default, slider dragging with live value, success micro-animation on confirm, offline/error toast hint. Typography calm; accent color only on primary action. Feels like jotting in a travel journal—quick, not a form marathon.
```

---

## STATS_PAGE

### Stitch prompt

```
Full analytics screen for Project Focus: cozy adventurer, data-rich but soft. Time range tabs (Week / Month / Year / Custom). Main charts (trends, category breakdown) using rounded bars and gentle gradients—Recharts vibe. Heatmap of activity (GitHub-style but warmer colors). Filters for habit or category (chips). Locked state for low tier: blurred or masked charts with friendly lock illustration, short copy explaining upgrade, single Unlock CTA—no shame tone. States: loading chart skeletons, empty ("Log a few days to see patterns"), error. Sticky subheader for tabs. Balanced whitespace so it never feels like a spreadsheet.
```

---

## SETTINGS_PAGE

### Stitch prompt

```
Settings for Project Focus, clean sections with cozy headers. Account: email/identity row, avatar placeholder (initials, not real photos required). Appearance: theme segmented control—Light, Dark, System with sun/moon/auto icons. Data: Export and Import with clear warnings; Load demo data with confirm dialog. Session: Sign out as secondary destructive style. Danger zone (collapsed or bottom): delete account / reset data with double confirmation and red accent sparingly. States: toggles saving, success toasts, error banners. List rows with chevrons; consistent iconography. Adventurer warmth without clutter—feels like a well-organized trail pack.
```

---

## COMMUNITY_PAGE

### Stitch prompt

```
Community prototype for Project Focus—social tab feel with mock data only. Leaderboard section: ranked list with abstract "avatars" (generated shapes, initials, or illustrated silhouettes—no real user photos). Show display name, level or streak proxy, and subtle rank badge. Activity feed: cards like "Explorer completed Morning Walk" with timestamp and soft icon; mix of achievements and habit milestones. Tabs or segments: Leaderboard / Activity. States: empty (rare for mock), loading shimmer, "prototype" subtle banner optional. Cozy adventurer palette; avoid competitive toxicity—celebrate collective journey. Clear that data is illustrative.
```

---

## ACHIEVEMENTS_PAGE

### Stitch prompt

```
Achievements grid for Project Focus, trophy-case energy but warm. Responsive grid of achievement tiles: icon, title, short description (truncated), tier metal frame—Bronze, Silver, Gold, Platinum, Diamond—distinct border/glow per tier. Unlocked: full color, subtle shine animation affordance. Locked: desaturated, lock icon, hidden or vague description teaser. States: filter by tier or progress; empty none. Tap opens detail sheet (optional). Typography playful but readable. Cozy adventurer: parchment cards, soft corners, no harsh neons. Progress ring on "in progress" achievements optional.
```

---

## SMART_GOAL_WIZARD

### Stitch prompt

```
Multi-step SMART goal wizard for Project Focus, guided like a campfire checklist. Steps: Specificity (what exactly), Measurability (metric / target), Deadline (date picker + realistic presets), Link habit (pick existing habit or create new—dropdown). Progress indicator (steps 1–4) at top; Back and Next; final Create goal summary screen before commit. States: validation per step, skipped optional fields clearly marked, success confetti-lite. Cozy adventurer copy: encouraging questions, not corporate HR. Mobile-first: one question per screen; desktop can show sidebar step list. Save draft optional.
```

---

## LEVEL_UP_MODAL

### Stitch prompt

```
Level-up celebration modal for Project Focus: moment of delight, not loud. Center card over soft blur/scrim. New level number large with adventurer badge or crest motif. Rewards list: unlocked feature, cosmetic, or currency (illustrative)—icons + short labels. Continue primary button; optional "Share" secondary (muted). States: entrance animation (scale + fade), optional particle dust or stars subtle. Sound-off by default (visual only). Dark/light variants. Copy warm: "You leveled up!" Avoid predatory FOMO—focus on progress earned.
```

---

## DAILY_REVIEW_MODAL

### Stitch prompt

```
End-of-day reflection modal for Project Focus, journal tone. Prompt headline: gentle question (e.g. "What carried you today?"). Text area for reflection (multi-line), character soft limit hint optional. Mood or energy optional chips (3–5 choices). Save stores entry; Skip dismisses without guilt copy. States: empty save disabled or allowed as draft; saved confirmation toast or inline "Saved." Cozy adventurer: dusk gradient header, paper texture body. Evening-friendly contrast. Feels closing a chapter of the day, not a survey.
```

---

## PUBLIC_PROFILE_MODAL

### Stitch prompt

```
Public profile preview (card or modal) for Project Focus. Shows display name, level, bio snippet, badges row (achievement chips), stats highlights (streak, habits count—non-sensitive). Privacy note line: what others see. Abstract avatar (initials or illustrated portrait placeholder—no real trademark). Actions: Close, optional Copy profile link. States: loading skeleton, error if fetch fails. Cozy adventurer styling: framed card, soft border, map-pin or compass motif as decoration. Read-only preview—clearly not full settings.
```

---

## SHARE_HABIT_MODAL

### Stitch prompt

```
Share habit flow modal for Project Focus after user taps share on a habit. Habit name + icon at top. Copy link row with success state ("Copied!"). Social placeholders: non-branded buttons or chips labeled generically (e.g. "Message," "More apps")—no real trademark logos; use abstract share icon. Optional preview text snippet editable. Cancel closes. States: link generating spinner, error retry. Cozy adventurer: warm card, subtle trail graphic. Encouraging microcopy; respect privacy—toggle "Include stats" optional.
```

---

## TOAST_ACHIEVEMENT

### Stitch prompt

```
Floating toast for Project Focus: achievement unlocked. Slides in from top or bottom; rounded pill or small card. Achievement icon left, title bold, optional one-line subtitle ("+10 XP" style). Soft gold/amber accent; brief shine or badge glint. Auto-dismiss after few seconds; tap to open achievements (optional). Stacking behavior if multiple: slight offset. States: enter/exit motion, reduced motion respects OS setting. Cozy adventurer—not casino flashing. High contrast text on warm dark or light surface.
```

---

## TOAST_COLLECTIBLE

### Stitch prompt

```
Collectible drop toast for Project Focus: playful but calm. Small banner with collectible icon (gem, leaf, compass shard—original art), item name, rarity tint (common → rare). Optional "View collection" text button. Auto-dismiss; doesn't block UI. States: rare drop slightly richer glow; stack with achievement toast with clear visual priority (collectible smaller or secondary). Cozy adventurer palette; avoid clutter. Works in light/dark.
```

---

## APP_LOGO

### Stitch prompt

```
App logo mark for Project Focus header: wordmark + icon treatment—original compass + leaf or mountain path motif (generic adventure, no real trademark). Works at 24–32px toolbar height and larger splash. Variants: full horizontal (icon left of "Project Focus" or short "Focus"), compact icon-only. Light/dark: monochrome line icon + colored accent optional; ensure legibility on sage, cream, and charcoal backgrounds. Style: rounded geometry, hand-drawn warmth optional but clean at small sizes. No third-party brand marks.
```

---

## Suggested Stitch batches (optional)

| Batch | IDs to generate together |
|-------|---------------------------|
| A | GLOBAL_CONTEXT + AUTH_SIGN_IN_UP + LOADING_FULLSCREEN + WEB_BG_BACKDROP |
| B | ENTRY_INTRO_GATE + FIRST_SESSION_FLOW + ONBOARDING_WIZARD |
| C | APP_LAYOUT_SHELL + SIDEBAR_DESKTOP + BOTTOM_NAV_MOBILE |
| D | DASHBOARD_HOME + LOG_ENTRY_BAR + DATE_NAVIGATOR + XP_PROGRESS |
| E | DAILY_MISSION_CARD + STARTER_QUEST_CARD + WEEKLY_DIGEST + STREAK_LIFELINE + MINI_HEATMAP + STATS_RADAR |
| F | JOURNEY_PAGE + PROFILE_PAGE + HABIT_LIST + HABIT_CARD |
| G | HABIT_DETAIL_PAGE + HABIT_MODAL + QUICK_LOG_MODAL + STATS_PAGE + SETTINGS_PAGE |
| H | COMMUNITY_PAGE + ACHIEVEMENTS_PAGE + SMART_GOAL_WIZARD |
| I | LEVEL_UP_MODAL + DAILY_REVIEW_MODAL + PUBLIC_PROFILE_MODAL + SHARE_HABIT_MODAL + TOAST_ACHIEVEMENT + TOAST_COLLECTIBLE + APP_LOGO |

---

## Source

Prompts produced by parallel research passes and merged into this single reference for **Google Stitch**. Align implementation with [`UI_PREVIEW_WORKFLOW.md`](./UI_PREVIEW_WORKFLOW.md).
