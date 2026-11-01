# The Gate · Design Direction

Anti-fashion minimalism. The home page is not a store; it is a closed door with
a name on it. It should feel like an underground movement, deliberately
inaccessible, confident enough to say almost nothing.

The gate is three screens: the home page (`/`), the waitlist overlay, and the
access page (`/access`). The shop pages behind it (collections, product) speak
in the same voice. Everything else follows [DESIGNSYSTEM.md](DESIGNSYSTEM.md).

---

## Principles

1. **A gate, not a funnel.** Invitation only is real, not a marketing line. No
   product, no prices, no "shop now", no countdowns, no urgency.
2. **Nothing to browse.** No header, menu, cart, theme toggle, socials or footer
   bar on the gate. If an element doesn't help someone get in, it goes.
3. **The photograph is the page.** Full bleed and bare. Type sits on it, never
   in a box or behind a wash.
4. **Say less.** Every word on the page is earned. Silence is the luxury.

---

## Palette · silver white

Cool whites, steel greys, near black. No warm tones, no accent colour.

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| `--pearl` | `#f4f5f6` | `bg-pearl` | Page ground on the gate, overlay veil |
| `--silver` | `#dfe1e4` | `bg-silver` | Quiet surfaces |
| `--steel` | `#8b8f94` | `text-steel` | Secondary marks |
| `--graphite` | `#121314` | `text-graphite` | All type, lines, solid actions |

These are fixed and never flip with the theme. The site-wide light tokens
(`--bg #f4f5f6`, `--surface #e9eaec`, `--ink #121314`) use the same silver white.

## Type

- **Wordmark:** the DUSK&CO logo in Expansiva Bold, uppercase, 0.08em. Nothing
  else is set in it.
- **Everything else:** IBM Plex Mono (`font-mono`), weights 400 and 500.
  Uppercase, wide tracking, small sizes. The restraint is the statement.

| Role | Size (mobile / desktop) | Weight | Tracking |
|---|---|---|---|
| Headline (`.gate-title`) | 16 / 20px | 500 | 0.14em |
| Actions (`.gate-action`) | 12 / 14px | 400 | 0.10em |
| Labels, notes (`.gate-label`) | 11 / 12px at 60% | 400 | 0.20em |
| Stage marker | 11 / 13px | 400 | 0.20em |

## Photography

- Oversized editorial frames. Subjects turned away, blurred or cropped, never
  posing for the lens.
- Shown exactly as shot: no filter, no wash, no gradient, no grain, no blur.
  The silver white is the interface around the photograph, never applied to it.

## Layout

- One viewport, `h-dvh`, no scroll. `html` and `body` go pearl while a gate
  screen is mounted.
- Top corners only (`<GateBar />`): the logo left, `STAGE 01` (or `CLOSE` on the
  overlay) right. Both are white with `mix-blend-difference`, so they invert
  against dark hair and pale sky alike.
- Centre: the headline, then the two actions well below it. Everything else is
  empty space.

## Motion · the cut

The headline types itself in: each letter cuts on in a scattered, fixed order
and flickers once, on hard steps with no easing (`<CutText />`, about 2s in all).
When the word is whole, the actions cut on in one frame (`<CutOn />`). Then
nothing moves. `cutEnd()` gives the moment a cut finishes, for timing what
follows. Screens change by hard cut too: the old one leaves in a frame, the new
one cuts in. The overlay fades in over 0.5s. Reduced motion shows everything at
once.

## Copy

Short, cryptic, declarative. No exclamation marks, no emoji, no dashes.

- Headline: `BY INVITATION ONLY`
- Actions: `JOIN THE WAITLIST` · `ENTER ACCESS CODE`
- Marker: `STAGE 01` (zero padded; it is a sequence, not a season)

## Actions

- Text links, not buttons. No fills, borders or icons.
- The primary action carries a 1px underline, offset 6px. The secondary shows
  its underline on hover only.
- Hover is a quiet opacity or underline change. Nothing moves.

## Forms (waitlist, access)

- Centred, narrow column (`max-w-xs`). Headline, one line of `.gate-label`
  context, then fields.
- The waitlist asks one thing at a time. `01 / 02` · `WHAT DO WE CALL YOU` →
  `NEXT`, then `02 / 02` · `WHERE DOES THE CODE GO` → `BACK` / `JOIN`. Each
  question cuts in fast (30ms a letter) and the field is up in 0.25s, so typing
  never waits on the animation.
- Fields (`.gate-field`): one hairline underneath, centred mono, uppercase. The
  access field shows `DUSK |` as a fixed prefix.
- Submit is a `.gate-action-primary` text link: `JOIN`, `ENTER`.
- Errors sit under the field in graphite, never red. Keep them short.
- The other door is one quiet line at the bottom: `HAVE A CODE · ENTER IT`,
  `NO CODE · JOIN THE WAITLIST`.
- The waitlist overlay is pearl at 85% with a backdrop blur.

## The confirmation

A short ceremony, about 4s, then still. `STAGE 01 · CONFIRMED`, then
`YOUR NAME IS ON THE LIST`, then a pass: a hairline box with the logo, their
first name cut in large, and three rows (`STATUS · ON THE LIST`,
`ACCESS · CODE TO FOLLOW`, `SENT TO · email`). Then, one line at a time:
`YOUR PERSONAL CODE ARRIVES BEFORE THE DOORS OPEN.` and
`UNTIL THEN, SAY NOTHING.` Then `CLOSE`. Never invent a number or a place in
line the API didn't give us.

## The shop pages (collections, product)

Wrap the page in `.gate-scope` and its type roles (`t-label`, `t-body`,
`t-title`, `t-display`), buttons and size cells switch to mono. The cart and
quick view drawers carry it too.

- Titles and labels uppercase, labels 12px. Running copy (descriptions, prices)
  stays sentence case at 13px on phones and 14px from `sm`, line height 1.8:
  sized to be read, not glanced at.
- Commerce keeps one solid graphite action per screen (`ADD TO BAG`); the rest
  are hairline outlines.
- Heroes follow the gate: bare photograph, centred mono title, no gradient.
- The header shows the logo and mono labels. While it floats over a hero it is
  white under difference blending; past 50px it turns solid silver white. The
  swap is instant; only the slide animates (0.5s, `cubic-bezier(0.2,0,0,1)`).
- It hides once you scroll down past 80px and returns after 12px of real upward
  travel, at the top, on keyboard focus, and on every new page. Small bounces
  and snap settling never move it.
- The footer is one quiet line from `md`: the logo, `SHIPPING · RETURNS ·
  PRIVACY · HELP` (Help is `/contact`), and an Instagram glyph. On phones the
  four links take the first line and the logo and glyph sit under them.

## Never

Social links, browser-like chrome, floating previews, carousels on the gate,
badges, rounded corners, shadows, gradients, filters or washes over
photographs, grain, warm or beige interface tones, red errors, newsletter pop-ups, cookie-cutter "luxury"
serif headlines.

---

## Where it lives

- `src/components/home/gate-frame.tsx`: `GatePhoto`, `GateBar`, `HERO_IMAGE`,
  `CutText`, `CutOn`, `cutEnd`
- `src/components/home/hero-section.tsx`: the home page and the cut headline
- `src/components/home/waitlist-modal.tsx`: the waitlist overlay
- `src/components/access/access-gate.tsx`: the access page
- `src/components/shop/drop-story.tsx`: Stage One collection
- `src/app/products/[handle]/page.tsx`, `src/app/collections/[handle]/page.tsx`:
  wrapped in `.gate-scope`
- `src/app/globals.css`: tokens, `.gate-*` classes, `.gate-cut`, `.gate-scope`
- `src/app/layout.tsx`: IBM Plex Mono as `--font-plex-mono`
- `src/components/layout/header.tsx`, `footer.tsx`: nothing visible on `/` and
  `/access`
