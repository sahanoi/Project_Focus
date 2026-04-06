# Design System Document: The Adventurer’s Hearth

## 1. Overview & Creative North Star: "The Cartographer’s Desk"
This design system moves away from the sterile, friction-less interfaces of modern productivity apps and instead embraces the tactile, grounded warmth of an **Adventurer’s Inn**. Our Creative North Star is **"The Cartographer’s Desk"**—a layout that feels like a collection of parchment, ink, and stone tools laid out intentionally under soft candlelight.

To break the "template" look, we reject the rigid, boxy grid. Instead, we utilize **intentional asymmetry** and **tonal layering**. Elements should feel like they are resting on a surface rather than being programmed into a slot. We achieve a premium editorial feel through the juxtaposition of a rugged, characterful serif for storytelling and a highly legible, soft sans-serif for the "mechanics" of habit tracking.

---

## 2. Colors & Surface Philosophy
The palette is rooted in organic materials: weathered paper, hearth embers, and forest sage.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning content. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` card sitting on a `surface` background provides all the separation necessary. We define space through weight and value, not outlines.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of parchment. 
- **Base Layer:** `surface` (#fff8f4) acts as the table.
- **Sectioning:** Use `surface-container-low` to define large regions.
- **Actionable Cards:** Use `surface-container-highest` (#f5dfcb) to bring the most important habit data "closer" to the user.
- **Glass & Gradient:** For floating navigation or modal overlays, use `surface-variant` at 80% opacity with a `20px` backdrop-blur. Apply a subtle linear gradient (from `primary` to `primary-container`) on hero CTAs to simulate the flickering glow of a campfire.

---

## 3. Typography: The Chronicler’s Script
Our typography pairs the wisdom of an old world with the clarity of modern navigation.

*   **The Hero (Newsreader):** Used for `display` and `headline` tiers. It carries the "character" of the Inn—serifed, elegant, and editorial. Use it for habit titles and motivational headers.
*   **The Guide (Manrope/Inter):** Used for `title`, `body`, and `label` tiers. This sans-serif is chosen for its soft terminals and high legibility at small sizes.

| Role | Token | Font | Size | Weight |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Newsreader | 3.5rem | Medium |
| **Headline** | `headline-sm` | Newsreader | 1.5rem | Semi-Bold |
| **Title** | `title-md` | Manrope | 1.125rem | Medium |
| **Body** | `body-md` | Manrope | 0.875rem | Regular |
| **Label** | `label-md` | Inter | 0.75rem | Bold (All Caps) |

---

## 4. Elevation & Depth: Tonal Layering
We do not use elevation to signify "modernity," but rather "importance."

*   **The Layering Principle:** Avoid shadows where color shifts can work. A `surface-container-lowest` card nested within a `surface-container` creates a "recessed" look, perfect for input fields or logs.
*   **Ambient Shadows:** For floating elements (like an "Add Habit" FAB), use an extra-diffused shadow: `box-shadow: 0 12px 32px rgba(37, 25, 13, 0.08)`. Note the use of a warm brown (`on-surface`) tint rather than black/grey to maintain the "indoor lighting" feel.
*   **The Ghost Border:** If accessibility requires a border, use `outline-variant` (#dbc2b0) at **15% opacity**. It should be felt, not seen.

---

## 5. Components & Layout Patterns

### Buttons (The "Sigils")
- **Primary:** Background `primary` (#8d4b00), text `on-primary` (#ffffff). Shape: `md` (12px) radius. Use a subtle inner-shadow (top-down) to give it a pressed-wax-seal feel.
- **Secondary:** Background `secondary-container` (#c7eae1), text `on-secondary-container`. No border.
- **Tertiary:** No background. Text `primary`. Use for low-priority actions like "View Archive."

### Cards & Habit Lists
- **Rule:** Forbid divider lines. 
- Use `1.5rem` (xl) vertical spacing between habit items. Use a `surface-container-low` background for the "track" and `surface-container-highest` for the active "habit card."
- **Progress Gauges:** Use `tertiary` (#b6191a) for streaks and `secondary` (#45645e) for completed tasks.

### Input Fields
- Use `surface-container-lowest` (#ffffff) for the input bed to make it feel like fresh paper. 
- Labels should always be in `label-md` using `on-surface-variant` to stay humble but readable.

### Signature Component: "The Traveler’s Log" (Timeline)
Instead of a standard list, use a vertical "thread" using a `2px` width of `outline-variant` with `0.5rem` (8px) rounded nodes. This reinforces the journey-based theme of the app.

---

## 6. Do’s and Don’ts

### Do
- **Do** use generous white space. An adventurer's map needs room to breathe.
- **Do** use `secondary` (Sage) for all "positive" or "success" states. It feels more organic than a neon "AI" green.
- **Do** ensure all touch targets are at least **48px** (exceeding the 44px minimum) to accommodate "rugged hands" and mobile ease.

### Don’t
- **Don't** use pure black (#000000). Use `on-surface` (#25190d) for all text to keep the contrast high but the tone warm.
- **Don't** use sharp 90-degree corners. Everything in the Inn has been smoothed by time; stick to the `8px–24px` radius scale.
- **Don't** use standard Material/Apple system icons if possible. Opt for icons with a slightly "hand-drawn" or weighted feel (2pt stroke minimum).

---

## 7. Spacing & Shape Scale
- **Radius:** Small (4px) for tooltips; Default (8px) for inputs; Large (16px) for cards; Full (9999px) for pill buttons.
- **Spacing:** Use a 4px base-unit. Standard page padding should be `24px` (1.5rem) to provide an editorial "margin."