---
name: Upside
description: Every word and every sum, built from blocks a child can see, hear, tap and say.
colors:
  mat: "#edf1ee"
  mat-grid: "rgba(23, 33, 58, 0.055)"
  surface: "#f9fbf9"
  surface-2: "#e1e7e3"
  ink: "#17213a"
  ink-2: "#46506a"
  ink-3: "#6b7389"
  line: "rgba(23, 33, 58, 0.12)"
  line-strong: "rgba(23, 33, 58, 0.3)"
  ghost: "rgba(23, 33, 58, 0.34)"
  focus: "#2449d8"
  cobalt: "#2449d8"
  cobalt-edge: "#1a36a8"
  cobalt-hi: "#4a69e6"
  cobalt-tint: "#dce4fb"
  on-cobalt: "#ffffff"
  lemon: "#f5c518"
  lemon-edge: "#c29b00"
  lemon-hi: "#f9d85c"
  lemon-tint: "#fbefc2"
  on-lemon: "#17213a"
  vermilion: "#d43d27"
  vermilion-edge: "#a82c19"
  vermilion-hi: "#e2644f"
  vermilion-tint: "#f8dcd5"
  on-vermilion: "#ffffff"
  leaf: "#1f8250"
  leaf-edge: "#16613b"
  leaf-hi: "#3aa56c"
  leaf-tint: "#d5ecde"
  on-leaf: "#ffffff"
  mouth-lip: "#d9738a"
  mouth-tongue: "#f09aa7"
  mouth-cavity: "#5a1e2e"
typography:
  display:
    fontFamily: "Lexend Exa, Lexend, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 1rem + 4.8vw, 4.9rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Lexend Exa, Lexend, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.2rem + 3vw, 3.3rem)"
    fontWeight: 700
    lineHeight: 1.14
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Lexend Exa, Lexend, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 1.2rem + 1.8vw, 2.4rem)"
    fontWeight: 700
    lineHeight: 1.14
    letterSpacing: "-0.01em"
  subtitle:
    fontFamily: "Lexend, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: "0"
  lead:
    fontFamily: "Lexend, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0.04em"
  body:
    fontFamily: "Lexend, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0.04em"
  label:
    fontFamily: "Lexend, Segoe UI, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.01em"
  caption:
    fontFamily: "Lexend, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "0.02em"
  glyph:
    fontFamily: "Lexend, Segoe UI, system-ui, sans-serif"
    fontSize: "var(--g)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0"
rounded:
  block: "0.4rem"
  control: "0.65rem"
  panel: "1.1rem"
spacing:
  s1: "0.25rem"
  s2: "0.5rem"
  s3: "0.75rem"
  s4: "1rem"
  s5: "1.5rem"
  s6: "2rem"
  s7: "3rem"
  s8: "4.5rem"
  s9: "7rem"
  grid: "24px"
  gutter: "clamp(1rem, 0.6rem + 2vw, 2.5rem)"
components:
  rod-action:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-cobalt}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1.2rem"
    height: "3.25rem"
  rod-leaf:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.on-leaf}"
    rounded: "{rounded.control}"
    height: "3.25rem"
  rod-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.mat}"
    rounded: "{rounded.control}"
    height: "3.25rem"
  rod-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "3.25rem"
  rod-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "3.25rem"
  rod-small:
    rounded: "{rounded.control}"
    height: "2.6rem"
  cube:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.block}"
    size: "2.9rem"
  cube-hear:
    backgroundColor: "{colors.lemon}"
    textColor: "{colors.on-lemon}"
    rounded: "{rounded.block}"
    size: "2.9rem"
  tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.block}"
    padding: "0.35rem 1rem"
    height: "2.75rem"
  tile-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.mat}"
    rounded: "{rounded.block}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1rem"
    height: "3.1rem"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
  block-tall:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-cobalt}"
    typography: "{typography.glyph}"
  block-cube:
    backgroundColor: "{colors.lemon}"
    textColor: "{colors.on-lemon}"
    typography: "{typography.glyph}"
  block-hang:
    backgroundColor: "{colors.vermilion}"
    textColor: "{colors.on-vermilion}"
    typography: "{typography.glyph}"
  number-tile:
    backgroundColor: "{colors.lemon}"
    textColor: "{colors.on-lemon}"
    rounded: "{rounded.block}"
    size: "3.2rem"
  operator-tile:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.mat}"
    rounded: "{rounded.block}"
    size: "3.2rem"
  answer-tile:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.on-leaf}"
    rounded: "{rounded.block}"
    size: "3.2rem"
  nav-item:
    textColor: "{colors.ink-2}"
    typography: "{typography.caption}"
    rounded: "{rounded.block}"
    height: "3.9rem"
  nav-item-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.mat}"
    rounded: "{rounded.block}"
---

# Design System: Upside

## Overview

**Creative North Star: "The Manipulatives Mat"**

Upside is a working mat with a fixed kit on it. A word is a bar model: its letters are blocks that rest on one shelf line, and the bar splits into syllables and sounds the same way a Singapore Maths bar splits a whole into parts. Sums use the same kit, with bar cells, counters and number tiles. Every surface (the landing page, the learner app and the educator dashboard) is built from these pieces, not decorated with them. The pale cool mat carries a faint 24px unit grid, and the pieces sit on it in four saturated kit hues plus ink.

The kit is loud, so each hue means one thing and has a shape and a label as well. Tall letters are cobalt rods, small letters are lemon cubes, and hanging letters are vermilion drop blocks that fall below the shelf. Leaf braces the whole and shows answers. Ink draws structure. Pieces rest flat with a small contact shadow. Only the piece being held (hovered, pressed, current) lifts with a longer shadow. Empty places are drawn as dashed ghost outlines, so the child can always see where the next piece goes. Motion follows one grammar, settle-and-lift: blocks drop onto the shelf with a quick overshoot-free ease and lift when touched. Motion stops completely in calm mode.

Reading comfort outranks the visual system. The reader chooses the font (Lexend, OpenDyslexic, Atkinson Hyperlegible), text size, letter and word spacing, the theme (day, night, high contrast) and a coloured overlay. The geometry is written in these variables, so the kit stays correct under every choice.

**Key Characteristics:**
- Four kit hues and ink, each with one meaning, on a pale mat with a unit grid.
- Every block kind is told apart by shape and label as well as colour: tall, cube, hanging.
- One shelf line. Pieces rest on it, and descenders hang below it.
- Dashed ghost outlines for every empty place.
- Flat at rest. The held piece lifts.
- Wide, calm Lexend type with generous default letter and word spacing, all under reader control.

## Colors

A fixed, saturated kit (cobalt, lemon, vermilion, leaf) on a cool pale mat. Ink navy draws structure. Each hue keeps one meaning in every surface and theme.

### Primary
- **Rod Cobalt** (`cobalt`): tall letters (ascenders), tens, and action rods. It is the default fill for the rod button and the current step in any sequence (the step rail, the "now" phase of the roadmap). It doubles as the day-theme focus ring. It has a darker edge for unit grooves and dividers, a lighter half for the b/d helper, and a pale tint for the input focus halo.

### Secondary
- **Unit Lemon** (`lemon`): small letters (x-height), single quantities, bar-model cells, counters, coins, number tiles, and text selection. Text on lemon is always ink (`on-lemon`), never white.

### Tertiary
- **Drop Vermilion** (`vermilion`): hanging letters (descenders) and parts taken away. In maths, a taken-away bar cell tilts and drops below the row. Vermilion is the one hue whose pieces break the shelf line.
- **Whole Leaf** (`leaf`): the whole and the answer. It colours the brace over a whole word or bar, the whole-word label, answer cells and tiles, completed steps, the "on" state of switches, and Sparky. Leaf is the only kit hue allowed to fill a whole section field (the leaf band on the landing page).

### Neutral
- **Cool Mat** (`mat`): the page ground. The `.mat` grid of 1px lines at `mat-grid` every 24px sits on it where things are built.
- **Tray White** (`surface`): panels, inputs, cubes, tiles, and quiet bands. `surface-2` is the recessed tray.
- **Ink Navy** (`ink`): text, the shelf line, braces, operators, the selected tile, the current nav item, and deep fields (the footer, the educator bar, the deep landing band). `ink-2` is secondary text and `ink-3` is tertiary text and placeholders.
- **Hairline** (`line`), **Firm Line** (`line-strong`), **Ghost** (`ghost`): translucent ink for dividers, control borders, and the dashed outlines of empty slots.
- **Mouth colours** (`mouth-lip`, `mouth-tongue`, `mouth-cavity`): used only in the articulation diagram.

### Themes
- **Day is the default** on every surface, whatever the device's colour scheme. The page is bright unless the reader chooses otherwise in Reading tools.
- **Night** applies only when the reader picks it, or picks Match device on a device (or host page) set to dark. It turns the mat to deep navy (#0f1420), lifts every kit hue one step for contrast, uses lemon (#f2c230) for focus, and deepens the shadows.
- **High contrast** uses a white mat, black structure, deeper kit hues, and a 2px black outline on every block (`--block-outline`).
- **The deep field** (`.on-deep`) applies the night palette inside a light page, for ink-filled sections.
- **Reading overlays** (blue, yellow, rose, green, peach) are fixed translucent sheets over the whole viewport. They use a multiply blend by day and a screen blend at half strength by night.

### Named Rules
**The One Meaning Rule.** Cobalt means tall, rod, or action. Lemon means small, unit, or quantity. Vermilion means hanging or taken away. Leaf means whole, answer, or Sparky. Ink means structure. Give a new element a kit hue only when it plays that role.

**The Pieces Not Paint Rule.** Cobalt and lemon appear only as pieces: blocks, rods, cubes, cells, discs, tiles, badges, and small marks. They never fill a section, band, or panel background. Only leaf and deep ink may paint a whole field.

**The Shape Carries It Rule.** Colour never works alone. Tall blocks are taller, hanging blocks drop below the shelf, cubes are x-height, and legend swatches repeat those shapes. The kit must still read in greyscale, under any overlay, and in the high-contrast theme.

## Typography

**Display Font:** Lexend Exa (with Lexend, Segoe UI, system-ui)
**Body Font:** Lexend (with Segoe UI, system-ui)
**Reader alternatives:** OpenDyslexic, Atkinson Hyperlegible. Both are self-hosted, and when the reader picks one it replaces display and body type alike.

**Character:** Lexend's low-stress, wide letterforms set the reading voice. Lexend Exa, its extra-wide cut, gives headlines a sturdy, block-built stance without a second personality.

### Hierarchy
- **Display** (Lexend Exa 700, clamp 2.3rem to 4.9rem, 1.04, -0.035em): the landing hero headline only, at 14ch max.
- **Headline** (Lexend Exa 700, clamp 2rem to 3.3rem, 1.14): section headings on the landing page.
- **Title** (Lexend Exa 700, clamp 1.7rem to 2.4rem, 1.14): screen headings in the app and the dashboard.
- **Subtitle** (Lexend 600, 1.25rem to 1.6rem, 1.14): h3 and h4, card and step headings. From h3 down, headings switch to the body face.
- **Lead** (Lexend 400, 1.25rem, 1.65): section introductions and screen descriptions, 50 to 62ch.
- **Body** (Lexend 400, 1rem, 1.65, 0.04em tracking, 0.16em word spacing): running text.
- **Label** (Lexend 600, 0.9375rem): field labels, rod labels, legend and segment labels.
- **Caption** (Lexend 600, 0.8125rem): nav item text, day labels, badges, and small notes.
- **Glyph** (Lexend 600, set in the glyph unit `--g`, line-height 1): letters inside word-bar blocks.

### Named Rules
**The Reader Owns the Type Rule.** All type goes through `--font-ui`, `--font-display`, `--track`, `--word` and `--leading`. The default is the "wide" spacing preset (0.04em tracking, 0.16em word spacing, 1.65 leading), and the reader can switch to normal or wider. Don't hard-code a family, tracking, or leading on reading text.

**The Glyph on the Shelf Rule.** A letter's baseline sits exactly on the shelf line. Each reader font sets its own `--glyph-drop` (Lexend 0.125, OpenDyslexic 0.26, Atkinson 0.13), so blocks stay aligned when the font changes.

**The Sentence Case Rule.** Headings, labels and captions are sentence case, set in weight rather than capitals. Numbers in tables and counts use tabular figures.

## Layout

The page is a mat. Build areas (the hero stage, the maths demo) show the 24px unit grid. Content sits in a centred wrap (78rem on the landing page, 82rem in the app, 90rem on the dashboard) with a fluid gutter of 1rem to 2.5rem. Spacing follows a nine-step scale from 0.25rem to 7rem. Landing sections breathe at clamp(3.5rem, 8vw, 6.5rem) of vertical padding. Section rhythm alternates the bare mat, quiet tray-white bands with hairline edges, one leaf band, and one deep ink band.

The word bar is laid out in glyph units (`--g`), not pixels. A rod is 0.96g tall, a cube 0.70g, and a hanging block 0.94g with 0.24g below the shelf. Joined parts sit 0.07g apart and split parts 0.42g apart. Bar-model cells size themselves from their container width (container queries), clamped between 0.9rem and 2.5rem.

Responsive behaviour: the learner app puts a bottom nav on phones and tablets and moves it to a 7.5rem left rail from 960px. The landing page folds two-column sections to one column below 1000px, hides the site nav below 1000px, and stacks the hero, the roadmap and the week bar below 760px (the week bar turns into day-labelled rows). The dashboard reflows at 1100px and 640px. Touch targets are at least 2.75rem, and primary controls are 3.25rem.

## Elevation & Depth

The system is flat with contact shadows. Pieces rest on the mat with a short, close shadow. The held or current piece lifts off it with a longer shadow and a small upward move. Panels float slightly with a soft, wide shadow. Every shadow is tinted with ink navy (black at night) and there is no glow. In high contrast, `--block-outline` adds a 2px black ring to every piece in the same shadow stack.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 1px 1px rgba(23,33,58,0.1), 0 2px 5px -1px rgba(23,33,58,0.1)`): every block, rod, cube and tile at rest.
- **Lift** (`box-shadow: 0 16px 22px -12px rgba(23,33,58,0.42), 0 5px 9px -5px rgba(23,33,58,0.22)`): the held, hovered, selected or current piece. It pairs with a -2px to -4px lift (-0.12g in the word bar).
- **Panel** (`box-shadow: 0 1px 2px rgba(23,33,58,0.06), 0 12px 32px -20px rgba(23,33,58,0.3)`): panels and the hero stage.

### Named Rules
**The Held Piece Lifts Rule.** Only one kind of thing uses Lift: the piece the child is holding, hovering, has chosen, or is on now. Everything else rests. A lifted piece always moves up as well as gaining the shadow.

## Shapes

Solid, slightly softened blocks. Pieces have a small radius (0.4rem, or 0.09g in the word bar), controls a medium radius (0.65rem), and panels a larger one (1.1rem). Counters and coins are the only circles. Rods have a thin divider groove in their edge colour between the label and the icon cube. Tall and hanging blocks have a 2px unit groove at x-height or at the shelf, so units line up across the bar. Braces are 2px ink or leaf strokes with 8px curled ends. The shelf line is 2px ink. Empty slots are 2px dashed ghost outlines with the same radius as the piece they stand in for.

Fills are flat. The only `linear-gradient` use is hard-stop: the mat grid lines, the b/d/p/q half-face helper, the grooved dashboard rods, and the strike mark in reading tools. There are no blended gradients.

## Components

### Rods (buttons)
Solid, grippable, and literal: a long rod with a unit cube attached for the icon.
- **Shape:** control radius (0.65rem), 3.25rem tall (2.6rem small). The icon sits in a square end cube behind a 2px groove in the edge colour.
- **Action:** cobalt with white text, Lexend 600 at 1rem, label padding 0.5rem by 1.2rem.
- **Variants:** leaf (confirm or whole), ink (build or neutral action), surface (a quiet rod on a band), lemon and vermilion where the action is that piece. The ghost rod is a dashed 2px outline and is the secondary action next to a primary rod.
- **Hover / Active / Disabled:** hover lifts 2px with the Lift shadow, active settles back to Rest, and disabled drops to 45% opacity with no shadow.
- **Focus:** a 3px focus-colour outline with 3px offset, used on everything.

### Cubes (icon buttons)
- **Shape:** a square unit at block radius, 2.9rem (2.25rem small, 3.6rem large).
- **Style:** tray white with a hairline ring and Rest shadow. The lemon cube is the "hear it" control, and the leaf and cobalt cubes follow the One Meaning Rule.
- **Hover:** lift 2px with Lift.

### Tiles (chips and options)
- **Style:** tray white, 2px firm-line border, block radius, Lexend 500, at least 2.75rem tall.
- **Selected:** filled ink with mat-coloured text, lifted 2px with Lift. The same pattern marks the current nav item and a chosen feeling.

### Cards / Containers
- **Corner Style:** panel radius (1.1rem).
- **Background:** tray white on the mat. The hero stage adds the unit grid.
- **Shadow Strategy:** Panel shadow, sometimes with an inset hairline ring.
- **Internal Padding:** clamp(1.25rem, 3vw, 2rem) on the landing page, 1.5rem in the app.

### Inputs / Fields
- **Style:** tray white, 2px firm-line border, control radius, 3.1rem tall, padding 0.5rem by 1rem. Labels are Lexend 600 in `ink-2` above the field.
- **Hover:** the border darkens to `ink-3`.
- **Focus:** a cobalt border with a 4px cobalt-tint halo.
- **Error:** the build marks field errors and notices with vermilion (a small square marker, a vermilion-tint notice). This goes against the One Meaning Rule and is recorded as drift. Do not reuse it as a pattern.

### Navigation
- **Site bar:** a sticky bar on the mat with a hairline underneath, `ink-2` links at 0.9375rem weight 500 that underline and turn ink on hover, and the cobalt action rod on the right.
- **App nav:** icon over caption items at least 3.9rem tall (5.6rem in the rail). Hover shows tray white. The current item is filled ink and lifted.
- **Step rail:** 1 See, 2 Hear, 3 Tap, 4 Say. The current step is a filled, lifted cobalt rod, done steps are leaf-tint with a leaf number, and later steps are plain.

### Word Bar (signature)
A word built from letter blocks on one shelf. Tall letters are cobalt rods, x-height letters are lemon cubes, and descenders are vermilion blocks hanging 0.24g below the shelf. A leaf brace and a leaf label mark the whole, and tapping the whole speaks it. Tapping splits the word into syllables. The parts spread from 0.07g to 0.42g apart, and ink-2 braces and labels fade in under each part. Tapping a part lifts it by 0.12g with Lift and speaks it. On build, blocks drop 0.55g onto the shelf with a 45ms stagger. The optional b/d/p/q helper shades the round "tummy" half of confusable letters with the lighter hue.

### Maths Blocks
- **Bar model:** lemon cells joined in a row with edge-colour seams under a leaf whole-brace. Taken-away cells turn vermilion, tilt 4° and drop 0.9rem. Unknowns are dashed ghost cells, and answer cells fill leaf with a 30ms stagger.
- **Counters:** 1.5rem lemon discs with a 3px bottom edge in rows of five. The same vermilion, leaf and ghost states apply.
- **Number sentence:** lemon number tiles, ink operator tiles, a leaf answer tile, and a dashed ghost for the missing number. Tiles are 3.2rem (4rem large) in Lexend 700.
- **Operator key:** tray-white chips that pair an ink operator tile with its spoken meaning.

### Sparky
A friendly green dragon drawn in SVG with an ink outline. One light source falls from the top left: a radial skin gradient from `#52b77a` to `#23874c`, a soft highlight on the head and belly, and a 10% ink shadow on the ground. Scalloped wing membranes carry three ribs each, a ridge of spikes runs down the back and tail, and the horns take a `#c29b00` edge. At rest the wings settle 8% and the tail sways 5 degrees. At idle it bobs 3px over 3.6s and blinks. To cheer, it hops twice. It stands at the end of the word bar as the whole.

### Meaning card
A picture cube on `lemon-tint` with a 3px lemon under-edge, 5rem square (3.4rem small), beside the meaning at `t-lg` and the example sentence in `ink-2`. The picture is a text character in the device's emoji font, never an image file. The same pictures ride at 1.1rem in the word list.

### Word deck (My words)
A flashcard on the mat: the word bar, then the meaning card on the back. Progress shows as three cubes, filled leaf as a word moves up its box. The deck list is a tray-white row per word: picture, word, box cubes, practise, remove.

### Tour
One real element is lifted out of a 55% ink scrim by a 3px lemon ring, with the card placed under it, over it, or beside it when the target is a tall column. The card carries Sparky's head, the stop count, the text at `t-md`, and cobalt step dots. Each stop is read aloud.

### Stickers and goal
Stickers are 3.2rem circles: `surface-2` with `ink-3` when locked, leaf on `leaf-tint` when earned. The daily goal is three 2.6rem lemon cubes; the streak is a vermilion flame with the count in `t-lg`.

### Founders
A tray-white card with a 7.5rem circular photo ringed in `leaf-tint` then leaf, the name at `t-xl`, the role in leaf `t-sm`, a quote with a 4px lemon rule, and awards as `lemon-tint` chips.

### Ways in (lens bar)
A row of tray-white chips above the mat, each an icon and a word, with the current one filled ink and lifted. The map chip is cobalt-tinted with a cobalt hairline and sits at the end of the row. Under the word bar, the chosen lens draws its own panel: lemon sound cubes with their keyword, cobalt chunk blocks, leaf-tint word parts with meanings, the shape legend, the meaning card, or the rhyming family with a vermilion rime chip.

### Word map
A 600-unit square SVG. The word sits at the centre as a filled ink block; its links ring it at radius 132 (lemon sound cubes, a vermilion rime pill, leaf word parts, a cobalt-tint topic circle); the words those lead to sit at radius 238, staggered 30 units apart so labels never touch. Links are hairlines, dashed out to the leaves. Sounds and words are filled by the model: dashed ghost when unmet, vermilion-tint when shaky, lemon-tint when getting there, leaf-tint when known. Every node in the drawing is repeated as a real button underneath it.

### Model rows (educator)
One row per letter-sound: a lemon cube for the spelling, a 0.8rem track filled to the model's confidence — vermilion below 60%, cobalt between, leaf at 80% and above — then the percentage and the number of tries it rests on.

### Sparky Helps camera
- **Live view:** the camera picture, mirrored, in a deep field with control radius. A small ink pill in the top-left corner reads LIVE, with a pulsing leaf dot. A 3px frame follows the face with a 160ms linear glide. It is leaf when calm, lemon when unsure, and vermilion once the upset score passes the threshold.
- **Corner tile:** a fixed tray-white panel with Lift shadow and a 4px bottom stripe in the same tone. It holds the live view, Sparky's head mirroring the reading (calm and kind for upset faces), the child-friendly word, and a 5-cell upset meter. It sits above the bottom nav on phones and in the bottom-right corner from 960px. On phones it becomes a single strip. It can fold down to a label with a leaf dot, but it stays on screen while the camera is on.
- **Live readout (panel):** 7 expression bars, leaf for calm expressions and vermilion for upset ones, with the strongest reading in bold. A 10-cell upset meter has an ink tick at the threshold.

## Do's and Don'ts

### Do:
- **Do** give every element a kit hue only when it plays that hue's role: cobalt for tall, rod or action; lemon for unit or quantity; vermilion for hanging or taken away; leaf for whole or answer; ink for structure.
- **Do** pair every colour with a shape and a label, so the kit reads in greyscale, under overlays, and in high contrast.
- **Do** rest every block on one 2px ink shelf line and hang descenders 0.24g below it.
- **Do** draw every empty place as a 2px dashed ghost outline at the radius of the piece it stands in for.
- **Do** use Rest for every piece and keep Lift for the one held, hovered, selected or current piece, together with a -2px to -4px move.
- **Do** animate with `--ease-settle` (cubic-bezier(0.16, 1, 0.3, 1)) at 120, 220 or 460ms, and let calm mode or reduced motion stop all of it.
- **Do** write sizes, spacing and font through the reader variables, so every font, size, spacing, theme and overlay choice keeps the kit aligned.
- **Do** use `on-lemon` ink text on lemon and white on cobalt, vermilion and leaf (dark text on leaf at night).

### Don't:
- **Don't** fill a section, band, or panel background with cobalt or lemon. Only leaf and deep ink paint whole fields.
- **Don't** use blended gradients. `linear-gradient` is only for hard-stop grid lines, split faces and grooves.
- **Don't** lift pieces that are not being held or chosen, and don't add glows or coloured shadows.
- **Don't** hard-code a font family, tracking or leading on reading text. The reader owns them.
- **Don't** set labels or headings in tracked capitals. Use sentence case and weight.
