# Storyline scenes — briefs for AI image generation

**Purpose:** Hand these blocks to tools such as **Nano Banana**, Midjourney, DALL·E, Ideogram, or FLUX. Adjust wording to each model’s style (some prefer short prompts, others love comma lists).

**Companion:** [PRODUCT.md](./PRODUCT.md) (§1 concept, §2 first-session order, §3 MVP screens).

---

## How to use this doc

1. **Series lock:** For every scene, reuse the same **character lock line** (see §0) so the figure reads as one person across scenes.  
2. **Aspect ratio:** Web hero illustrations often work at **16:9** or **3:2**; mobile-first art at **9:16**; UI cards at **1:1** or **4:5**.  
3. **Negatives:** Append to any prompt: *no text, no watermark, no UI chrome, no logos* unless the scene explicitly needs typography (then generate clean and add text in Figma).  
4. **Pixel option:** If the product is pixel-art, add: *pixel art, 32-bit style, limited palette, crisp pixels, no anti-aliased blur*.

---

## §0 — Character & world lock (paste into every prompt)

**Character lock (customize once, then repeat):**

> Young adult traveler, gender-neutral silhouette, soft rounded features, calm eyes, small backpack optional, **no recognizable celebrity**, friendly but not childish.

**World lock:**

> Cozy RPG guild hall meets morning wellness: warm candlelight and dawn sky through tall windows, **purple and amber accents**, stone and wood, **not medieval grimdark**, hopeful and quiet.

**Style lock (pick one pipeline and stick to it):**

- *Illustrated:* `digital illustration, soft brush, Studio Ghibli calm, not anime exaggerated`  
- *Pixel:* `pixel art, 64px character feel, dithered shadows, cozy RPG`  

---

## Scene A — Threshold (post-auth transition)

**Story beat:** Crossing from “outside” into the app’s world—calm, not corporate.

**Composition:** Wide hall interior, dawn light, empty chairs, a **single cup of water** on a small table in foreground, invitation not demand.

**Mood:** Stillness, relief, “you’re early, that’s fine.”

**Prompt (illustrated):**

```text
Cozy guild hall at dawn, tall arched windows, warm purple and amber light, wooden stone interior, single ceramic cup of water on a small round table in foreground, empty peaceful space, no people, digital illustration soft painterly style, hopeful quiet atmosphere, cinematic wide shot, no text
```

**Prompt (pixel):**

```text
Interior guild hall pixel art, dawn light through windows, stone floor wood beams, one cup of water on table foreground, cozy RPG tavern morning, limited palette purple amber cream, no characters, no text, crisp pixels
```

**Avoid:** Busy crowds, swords, dark souls vibe, office lobby.

---

## Scene B — Welcome / optional name moment

**Story beat:** The world acknowledges *you* as a person.

**Composition:** Same hall, **character lock** mid-ground, facing viewer slightly off-center, gentle smile, hands open.

**Mood:** Welcoming, non-performative.

**Prompt:**

```text
[CHARACTER LOCK] standing in cozy dawn guild hall, warm light on face, slight smile, open welcoming posture, purple amber atmosphere, soft digital illustration, medium shot waist up, emotional warmth, no text no UI
```

---

## Scene C — Morning Routine card (diegetic “frame”)

**Story beat:** Routine as a **frame** around care—not a spreadsheet row.

**Composition:** Abstract or semi-diegetic: a **glowing rectangular frame** (like a quest panel) floating in soft morning mist, inside the frame a **simple water glass icon** or stylized cup; **no literal mobile UI**.

**Mood:** Quest received, gentle duty.

**Prompt:**

```text
Magical morning mist, floating glowing rectangular frame like a quest panel in cozy RPG style, inside frame a simple stylized glass of water icon, purple gold light, ethereal calm, digital painting, no text, no phone mockup
```

---

## Scene D — First check-in (action closure)

**Story beat:** The moment **after** the deed—satisfaction, light gathering.

**Composition:** Character lock, holding cup, **sparkles or soft light rays** around hands/cup, eyes closed in small peace.

**Mood:** Competence, “I did it.”

**Prompt:**

```text
[CHARACTER LOCK] drinking water from ceramic cup, soft magical sparkles and warm dawn light around hands, eyes closed peaceful expression, cozy RPG illustration, close up on hands and cup, emotional satisfaction, purple amber palette, no text
```

---

## Scene E — First collectible reveal (“First Light” / evidence)

**Story beat:** Evidence, not loot—a **token** that says you began.

**Composition:** **Floating artifact**: simple disc, cup sigil, or dewdrop medallion, gentle god-ray, dark-to-light gradient background so object reads hero.

**Mood:** Sacred-common, quiet pride.

**Prompt:**

```text
Floating collectible medallion in air, simple design engraved cup or dewdrop symbol, soft god rays, dawn gradient background purple to gold, magical item reveal still life, painterly digital art, no text, no UI, centered composition
```

**Variant (pixel):**

```text
Pixel art collectible icon frame, golden border, dewdrop symbol center, subtle shine, dark purple background, 128x128 feel blown up, crisp pixels, cozy RPG item drop, no text
```

---

## Scene F — Cloak choice (three variants for art batch)

**Story beat:** Identity—player picks a **cloak**, not a stat.

Generate **three images** with same pose, different cloaks:

| Variant | Cloak vibe | Prompt add-on |
|---------|------------|----------------|
| F1 | Dawn | `pale cream cloak with rose gold trim` |
| F2 | Forest | `deep teal cloak with moss green inner lining` |
| F3 | Dusk | `soft violet cloak with starry silver embroidery subtle` |

**Base prompt:**

```text
[CHARACTER LOCK] full body three quarter view, standing in guild hall dawn light, wearing [VARIANT CLOAK], fabric folds detailed, calm heroic silhouette, cozy RPG character art, neutral background slightly blurred hall, no text no UI
```

---

## Scene G — Cloak equip ceremony (motion storyboard still)

**Story beat:** Fabric **settles**—belonging.

**Composition:** Same character, **side or three-quarter**, cloak **mid-sway** settling, subtle motion lines or magic dust (optional).

**Prompt:**

```text
[CHARACTER LOCK] cloak gently settling on shoulders magical faint particles, side view dynamic still frame, cozy RPG illustration dawn light purple amber, sense of completion and belonging, no text
```

---

## Scene H — Handoff to “home” (open world lite)

**Story beat:** The guild hall opens onto a **wider tomorrow**—habits live here, not in a form.

**Composition:** Character in cloak walking toward **bright doorway** or garden arch, Morning Routine as **distant warm panel** (abstract), not literal app screenshot.

**Mood:** Continuation, not graduation pressure.

**Prompt:**

```text
[CHARACTER LOCK in cloak] walking toward bright archway opening to peaceful garden morning, guild hall behind soft focus, path forward hopeful, cozy RPG scene wide shot, purple amber light, no text no UI
```

---

## Batch checklist for generators

| ID | Scene | Primary use |
|----|--------|-------------|
| A | Threshold | Loading / transition |
| B | Welcome | Onboarding screen 1 |
| C | Routine frame | Routine introduction |
| D | Check-in | Success / celebration |
| E | Collectible | Modal / full-screen reveal |
| F1–F3 | Cloaks | Picker tiles |
| G | Equip | Short animation keyframe |
| H | Home handoff | Post-onboarding dashboard hero |

---

## Legal / process hygiene

- Use generators that allow **commercial** use for your plan tier.  
- Keep a **sheet** of seed/prompt pairs and dates for asset audit.  
- For **Nano Banana** or any niche tool: paste the same prompt blocks; if the UI has “style” sliders, favor **warm / soft / illustration** over photoreal for this IP.

---

*Add new scenes as new chapters ship (e.g. village, evening routine); keep §0 locks stable for brand continuity.*
