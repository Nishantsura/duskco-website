# Dusk&Co Design System

Quiet, monochrome, editorial. Reference points: Zara, Yeezy, institutional
signage. The photography and the garments carry the colour; the interface stays
out of the way.

---

## Principles

1. **Monochrome only.** Black, white and the greys between. No accent colour, no
   gradients (except a plain dark floor under hero copy for legibility), no glows.
2. **One typeface.** Inter for all text. The DUSK&CO wordmark keeps Expansiva and
   is never used for anything else.
3. **Few elements.** Every screen has one primary action. Remove decoration before
   adding anything.
4. **Square.** No rounded corners, pills or circles. Hairline borders only.
5. **Still.** Motion is rare and slow. Allowed: a single 1.2s fade on hero copy,
   fades on overlays and drawers (0.3 to 0.5s), the second product image fading in
   on hover. Nothing slides in on scroll, bounces, cycles or loops.
6. **Plain copy.** Short sentences. No dashes in user facing copy; use a period or
   a middot (·).

---

## Tokens (`src/app/globals.css`)

Light is the default. `[data-theme="dark"]` on `<html>` flips everything.

| Token | Light | Dark | Tailwind |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0b0b0b` | `bg-bg` |
| `--surface` | `#f4f4f4` | `#141414` | `bg-surface` |
| `--surface-2` | `#eaeaea` | `#1d1d1d` | `bg-surface-2` |
| `--ink` | `#0a0a0a` | `#f2f2f2` | `text-ink` |
| `--ink-muted` | ink at 60% | ink at 60% | `text-ink-muted` |
| `--ink-faint` | ink at 40% | ink at 40% | `text-ink-faint` |
| `--line` | ink at 10% | ink at 12% | `border-line` |
| `--line-strong` | ink at 28% | ink at 30% | `border-line-strong` |
| `--danger` | `#b42318` | `#f97066` | `text-danger` (errors only) |

`--accent` is an alias of ink so any leftover accent utility stays monochrome.
Over photography, text is always white regardless of theme.

---

## Type roles

| Class | Use | Spec |
|---|---|---|
| `.t-label` | nav, eyebrows, buttons, field labels | 11px · 500 · 0.08em · uppercase |
| `.t-body` | paragraphs, prices, notes | 13px · 400 · 1.65 line height |
| `.t-title` | page and product titles | 22 to 30px · 400 · tight |
| `.t-display` | hero headline only | 36 to 80px · 300 · very tight |

One `.t-display` per page at most. Hierarchy comes from size and weight, never
colour.

---

## Components

| Class | Use |
|---|---|
| `.btn .btn-primary` | the one main action: solid ink, 44px tall, square |
| `.btn .btn-outline` | secondary actions: hairline border |
| `.btn .btn-light` / `.btn-ghost-light` | the same pair over photography |
| `.link` | inline text link with a hairline underline |
| `.field` | text input: single underline, no box |
| `.size-cell` | size picker: square cell, ink fill when selected |

Overlays (menu, bag, quick view, size guide) use a plain `bg-black/30` backdrop
and a `bg-bg` panel with a hairline edge. The waitlist is the one exception: a
`backdrop-blur-2xl` veil over the hero (`bg-bg/75`), mirrored on `/access` with a
blurred copy of the hero still.

---

## Key flows

- **Home:** one full screen photograph, "By invitation only", two buttons:
  Join the waitlist (opens the form) and Enter access code (`/access`).
- **Waitlist:** name and email on one screen, then a plain confirmation.
  `/?join` opens it directly.
- **Access:** one field with a fixed `DUSK` prefix; pasted full codes are
  cleaned. Links back to the waitlist via `/?join`.
