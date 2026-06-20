# Dusk&Co Website — Project Rules

## Project Overview
Custom Next.js website for Dusk&Co, an Indian streetwear/luxury fashion brand.
Two versions: V1 (waitlist page) → V2 (full Shopify-integrated store).

## Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Fonts:** Roboto Slab (Google Fonts) + Expansiva (local font)
- **Hosting:** Vercel
- **Commerce (V2):** Shopify Storefront API (GraphQL)
- **Waitlist Storage:** Google Sheets API + Email notifications to founders

## Brand Rules (from official brand guidelines)
- Minimalistic and monochromatic with grey tones — use lots of white space
- Never use circles — only rectangles, squares, and tags
- Logo spacing: 1x = height of letter "D" in logo, applied on all sides
- Never combine primary logo with logomark in close proximity
- Never use colored logos outside approved palette
- Never modify logo aspect ratio
- Typography hierarchy is strict — don't swap font levels
- Graffiti-like accent graphics (neon palette) are used sparingly for digital emphasis
- Brand is masculine-leaning, contemporary, bold, exclusive, elegant, unconventional
- Photography: balance minimalism and maximalism (minimal product → max background, vice versa)

## Code Conventions
- Use `@/*` import alias
- Components in `src/components/`
- Keep components small and focused
- All colors via CSS custom properties / Tailwind theme — never hardcode hex values
- Mobile-first responsive design
- Accessibility: semantic HTML, proper ARIA labels, keyboard navigation
- No unnecessary abstractions — straightforward code
- Performance: optimize images, lazy load below-fold content, minimize JS bundle
