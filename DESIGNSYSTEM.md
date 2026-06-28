# Dusk&Co Design System
# Inspired by the editorial minimalism of Odd Ritual Golf Club
# Dark, confident, full-bleed, typographically precise, community-rooted.

---

## NON-NEGOTIABLES

1. **Black is the default background.** Alternate between `#000000` and `#ffffff` deliberately.
2. **Typography is layout.** Big type does the heavy lifting — images support, type leads.
3. **Animations are fast and purposeful** — 0.2s–0.4s max, cubic-bezier easing. Nothing bounces or spins.
4. **Whitespace is a design element.** Sections breathe. Padding is generous.
5. **Everything is uppercase for headings/labels.** Body copy is sentence case.
6. **No gradients, no drop shadows on type, no glassmorphism, no blur effects.**
7. **Buttons are pill-shaped** (border-radius: 9999px) — always.
8. **Rectangles and tags only — never circles** for brand graphic elements.
9. **Images are portrait-first.** Full-bleed when used as hero/background.
10. **Never deviate from this token set** — no ad-hoc colors, no random font sizes.

---

## COLOR TOKENS

```css
/* Core */
--color-black:        #000000;
--color-white:        #ffffff;
--color-slate:        #363636;
--color-mid-grey:     #808081;
--color-dark-grey:    #636464;
--color-light-grey:   #ababab;
--color-chalk:        #dededd;
--color-off-white:    #f4f4f4;

/* Black opacity scale */
--color-black-10:  rgba(0,0,0,0.10);
--color-black-20:  rgba(0,0,0,0.20);
--color-black-40:  rgba(0,0,0,0.40);
--color-black-60:  rgba(0,0,0,0.60);
--color-black-80:  rgba(0,0,0,0.80);

/* Neon Accents — sparingly, never on body copy or logos */
--color-neon-green:      #AEDF00;
--color-bright-yellow:   #D8FF00;
--color-fire-orange:     #FF5733;
--color-pop-pink:        #FF1BA1;
--color-electric-purple: #9818D6;
--color-volt-blue:       #002FFF;
```

### Color Rules
- Dark sections: `bg-black text-white` — hero, footer, feature panels
- Light sections: `bg-white text-black` or `bg-chalk text-black` — cards, about, editorial
- Borders light: `1px solid var(--color-light-grey)`
- Borders dark: `1px solid rgba(255,255,255,0.12)`
- Accent colors: tiny graphic accents only — never for primary copy

---

## TYPOGRAPHY

### Font Families
```css
--font-primary:  'Roboto Slab', Georgia, serif;
--font-display:  'Expansiva', 'Arial Black', sans-serif;
```

### Type Scale
| Role | Font | Weight | Desktop | Mobile | Tracking | Case |
|------|------|--------|---------|--------|----------|------|
| Display / Hero | Expansiva | 400 | clamp(48px,8vw,96px) | clamp(36px,10vw,64px) | -0.02em | UPPERCASE |
| H1 | Roboto Slab | 700 | 48px (3rem) | 32px (2rem) | 0 | UPPERCASE |
| H2 | Roboto Slab | 300 | 21px (1.3rem) | 18px | 0 | UPPERCASE |
| H3 / Section Label | Expansiva | 400 | 14–36px | 14–28px | 0 | UPPERCASE |
| H4 / Card Title | Roboto Slab | 700 | 14px | 13px | 0.02em | UPPERCASE |
| Body Large | Roboto Slab | 400 | 18px | 16px | 0.015em | Sentence case |
| Body | Roboto Slab | 400 | 15px | 14px | 0.015em | Sentence case |
| Caption / Eyebrow | Roboto Slab | 300 | 11px | 10px | 0.12em | ALL CAPS |
| SKU / Meta | Roboto Slab | 300 | 10px | 10px | 0.05em | as-is |
| Price | Roboto Slab | 700 | 14px | 13px | 0 | — |
| Nav Links | Roboto Slab | 700 | 13px | — | 0.08em | UPPERCASE |
| Footer Links | Roboto Slab | 300 | 12px | 12px | 0.06em | UPPERCASE |

### Line Heights
```css
--lh-tight:   1;    /* display headings, big numbers */
--lh-snug:    1.1;  /* H1, H2 */
--lh-normal:  1.3;  /* H3, H4 */
--lh-relaxed: 1.5;  /* body, captions */
--lh-loose:   1.7;  /* long-form editorial */
```

---

## SPACING

```css
--space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
--space-4: 1rem;     --space-5: 1.5rem;   --space-6: 2rem;
--space-7: 3rem;     --space-8: 4rem;

--section-sm: 5rem;   /* tight sections */
--section-md: 7rem;   /* standard */
--section-lg: 10rem;  /* hero/spacious */

--site-gutter:    clamp(1rem, 4vw, 1.5rem);
--site-max-width: 90rem;
--grid-gap:       clamp(0.5rem, 1vw, 0.75rem);
```

---

## BUTTONS

All buttons: `border-radius: 9999px` (pill). **Never square or rounded-md.**
Transition: `background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease`

```css
/* PRIMARY */
.btn-primary { background:#000; color:#fff; border:1px solid #000; padding:0.75rem 1.75rem;
  font:700 13px/1 'Roboto Slab',serif; letter-spacing:0.08em; text-transform:uppercase; border-radius:9999px; }
.btn-primary:hover { background:transparent; color:#000; }

/* LIGHT (on dark bg) */
.btn-light { background:#fff; color:#000; border:1px solid #fff; /* same sizing */ }
.btn-light:hover { background:transparent; color:#fff; border-color:#fff; }

/* GHOST */
.btn-ghost { background:transparent; color:inherit; border:1px solid currentColor; /* same sizing */ }
.btn-ghost:hover { background:#000; color:#fff; border-color:#000; }
```

---

## BORDER & RADIUS

```css
--border-width:  1px;
--radius-sm:     0.5rem;   /* tags, badges */
--radius-md:     1rem;     /* cards, panels */
--radius-pill:   9999px;   /* buttons, inputs */
```

---

## ANIMATIONS

```css
/* Slide indicator */
.slide-indicator { transition: width 0.4s cubic-bezier(0.32, 0.72, 0, 1); }

/* Buttons/links */
transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;

/* Product image hover swap */
.product-card .img-primary { transition: opacity 0.2s ease; }
.product-card:hover .img-primary { opacity: 0; }
.product-card .img-hover { opacity: 0; transition: opacity 0.2s ease; }
.product-card:hover .img-hover { opacity: 1; }

/* Scroll entry */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## COMPONENTS

### Navigation
- Fixed, transparent → `bg-black/90` on scroll, `z-50`
- Layout: `[☰ hamburger]` — `[LOGO centered]` — `[SHOP NOW · CART]`
- Logo: white SVG, ~120px
- Nav links: Roboto Slab 700, 13px, UPPERCASE, letter-spacing 0.08em
- Drawer: full-height black overlay, staggered link entrance, links at clamp(32px,5vw,48px)

### Hero Slider
- Full-bleed 100vw × 100svh, dark photo/video background
- Overlay: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5))`
- Slide bars (bottom-left): active=3rem/2px/white, inactive=1.25rem/rgba(255,255,255,0.35)
- Slide numbers (top-left): Roboto Slab 300, active=24px white, inactive=14px 60% white
- Content: Expansiva display heading + eyebrow eyebrow + btn-light

### Product Card
- Aspect ratio 3/4 image, hover swaps to second image (opacity transition 0.2s)
- Text below: name (Roboto Slab 700 13px UPPERCASE), SKU (10px 300 light-grey), price (700 14px)
- Carousel: horizontal scroll, `scroll-snap-type: x mandatory`, no scrollbar

### Eyebrow Labels
- Pattern: `( LABEL TEXT )` — parentheses are part of the aesthetic
- Font: Roboto Slab 300, 11px, UPPERCASE, letter-spacing 0.12em
- Margin below: 1.5rem

### Section Cards
- Border: `1px solid --color-light-grey`, border-radius: 1rem, padding: 1.5rem
- Title: Roboto Slab 700 18px UPPERCASE, body: 400 14px, link: "Visit →" 12px 700

### Footer
- Background: `#000000`, text: `#ffffff`
- Top: newsletter left + site index right
- Inputs: no background, border-bottom only, Roboto Slab 300 UPPERCASE
- Bottom bar: copyright, 10px, white/40%

---

## TAILWIND CONFIG

```js
theme: {
  extend: {
    fontFamily: {
      primary: ['Roboto Slab', 'Georgia', 'serif'],
      display: ['Expansiva', 'Arial Black', 'sans-serif'],
    },
    colors: {
      black: '#000000', white: '#ffffff',
      slate: '#363636', 'mid-grey': '#808081', 'dark-grey': '#636464',
      'light-grey': '#ababab', chalk: '#dededd', 'off-white': '#f4f4f4',
      'neon-green': '#AEDF00', 'bright-yellow': '#D8FF00',
      'fire-orange': '#FF5733', 'pop-pink': '#FF1BA1',
      'electric-purple': '#9818D6', 'volt-blue': '#002FFF',
    },
    borderRadius: { pill: '9999px' },
    transitionTimingFunction: {
      spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  }
}
```

---

## PAGE STRUCTURE

1. Fixed Nav
2. Hero Slider (full-bleed, dark, 3 slides, numbered)
3. 3 Feature Panels (Shop / About / Community, bg-image)
4. Brand Statement (editorial paragraph)
5. Product Carousel (eyebrow + horizontal scroll)
6. Collection Links (2–3 bg-image cards)
7. Location / Origin Section
8. Photo Gallery (swipeable, numbered)
9. Community Section (partner cards)
10. Footer (newsletter + index + social + legal)

---

## BRAND VOICE

- Inspiring, authentic, playful, bold, cool. Casual yet elegant.
- "The chill friend who welcomes you to the neighbourhood"
- Themes: dusk, self-expression, timeless luxury, exclusivity, community
- Phrases: "Wear the difference." · "Embrace your Dusk." · "Being you from dawn to dusk and beyond."
- Short sentences. No exclamation marks. Generous paragraph breaks. Never salesy.

---

## WHAT NOT TO DO

- No drop shadows on text or cards
- No gradient backgrounds
- No glassmorphism / backdrop blur
- No rounded-md on buttons — pill or nothing
- No circles for graphic elements
- No fonts other than Expansiva + Roboto Slab
- No neon on large areas, body copy, or logos
- No animations over 0.6s
- No bouncing or spinning keyframes
- No mixing multiple accent colors in one section
