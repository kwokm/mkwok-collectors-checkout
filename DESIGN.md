# PSA Marketplace — Style Reference
> The slab is the hero — white gallery light, one red signature. A near-colorless stage of white surfaces and cool grays lets graded collectibles carry all the color; PSA red appears only as punctuation.

**Theme:** light

PSA's newest surfaces (the 2025 homepage and Auction Prices Realized) pair a single geometric sans — Area Normal — with an unexpected signature: one word per display headline set in italic Times New Roman ("Our Label Means *Authentic*"). Everything is a pill: buttons, search inputs, chips — fully rounded, weight 400, quiet. From parent brand collectors.com comes the restraint: centered hero compositions, hairline borders instead of shadows, ghost buttons with trailing arrows, and straight-on photography of slabbed collectibles floating on quiet fields. Red is reserved — the logo, one key CTA per view, and text links — so it reads as signal against the monochrome stage, never as a wash.

**Provenance:** Distilled from psacard.com's most recently redesigned pages — the homepage (internally titled "New Homepage") and Auction Prices Realized — plus the collectors.com homepage. Legacy PSA pages (Price Guide, Pop Report) still use an older system (blue rectangular buttons, gradient icons, all-caps labels); those patterns are explicitly excluded.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| PSA Red | `#ee0403` | `--color-psa-red` | Logo, the single key CTA per view, text links ("Get Started →"), live-auction indicators — punctuation, never decoration |
| Ink | `#0f0f0f` | `--color-ink` | Primary filled button fill, dark stage sections, announcement bar |
| Charcoal | `#212121` | `--color-charcoal` | Headlines and primary text — the designated near-black |
| Slate | `#48494a` | `--color-slate` | Secondary text, outlined button labels, feature captions |
| Smoke | `#6c6e6f` | `--color-smoke` | Tertiary text, placeholders, metadata |
| Hairline | `#eaeaea` | `--color-hairline` | Borders, dividers, ghost button outlines — the structural line weight everywhere |
| Tint | `#f5f5f5` | `--color-tint` | Search input fill, icon tiles, image backdrops |
| Fog | `#fafafa` | `--color-fog` | Alternating section tint, card image fields |
| Paper | `#ffffff` | `--color-paper` | Page canvas, card surfaces |

## Tokens — Typography

### Area Normal — Sole sans across every surface (shared with collectors.com, which uses the same Area family). Geometric grotesque set almost entirely at weight 400 — even 52px+ display headlines stay regular weight, letting scale alone carry hierarchy. 500 for page and card titles, 600 for prices and nav emphasis. · `--font-area`
- **Substitute:** Instrument Sans (variable) — the closest free alternative to Area Normal. Set the body weight to **450**: Area carries a touch more grotesque presence at 400 than Instrument does, and 450 recovers it without reading as medium. Manrope is the fallback substitute.
- **Weights:** 400, 500, 600 (Area) · 450, 500, 600 (Instrument substitute)
- **Sizes:** 13, 15, 16, 24, 40, 52, 128
- **Letter spacing:** -0.02em at 40px+, normal below

### Times New Roman Italic — The signature accent: exactly one word per display headline set in italic serif at the same size as the surrounding sans ("Our Label Means *Authentic*"). System font, zero cost, instantly ownable. Never used below display size. · `--font-serif-accent`

### Serif-in-Sans Pairing — Canonical Optical Fix

Setting the serif word at the same font-size as the surrounding sans makes it read *smaller*: Times' lowercase sits visibly short of its sans neighbors. Canonical fix — scale the serif span so the lowercase ink tops match, and compensate its line-height so the line box never grows:

```
scale            = sans round-glyph ink top ÷ serif round-glyph ink top
span line-height = parent line-height ÷ scale
```

Derive the scale from **rendered ink tops of round glyphs including overshoot** ("e" for the sans, "o" for the serif — measure with canvas `measureText().actualBoundingBoxAscent ÷ fontSize`), not from the font's nominal `sxHeight` metric. The eye aligns to where the bowls actually peak; nominal x-height ignores overshoot and lands visibly short.

For this system's pair (Instrument Sans "e" 0.520 · italic Times "o" 0.442):

```html
<h1 class="text-[38px] leading-[1.05]">
  Certified <span class="font-serif-accent italic text-[1.177em] leading-[0.87]">yours.</span>
</h1>
```

- **`1.177em`** = 0.520 ÷ 0.442. Because the value is in `em`, it holds at *every* headline size — 24px, 38px, 52px, 128px — with no recalculation. Only a font swap changes it.
- **`leading-[0.87]`** ≈ parent 1.05 ÷ 1.177 (= 0.892, shipped a hair tighter optically). If the parent leading differs, recompute: parent ÷ scale.
- Both words stay inline, so they share the baseline for free — never nudge the serif vertically. Matched ink tops put the serif bowls level with the sans lowercase; the shared baseline does the rest.
- When swapping either face, re-measure both ink tops in-browser and re-derive both numbers. Do not eyeball per-size overrides.

### Type Scale

| Role | Size | Line Height | Letter Spacing | Weight | Token |
|------|------|-------------|----------------|--------|-------|
| caption | 13px | 1.4 | — | 400 | `--text-caption` |
| ui | 15px | 1.4 | — | 400 | `--text-ui` |
| body | 16px | 1.5 | — | 400 | `--text-body` |
| heading | 24px | 1.3 | — | 500 | `--text-heading` |
| title | 40px | 1.2 | -0.02em | 500 | `--text-title` |
| heading-xl | 52px | 1.15 | -0.02em | 400 | `--text-heading-xl` |
| display | 128px | 0.82 | -0.02em | 400 | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 64 | 64px | `--spacing-64` |
| 96 | 96px | `--spacing-96` |

### Border Radius

| Element | Value |
|---------|-------|
| buttons, inputs, chips | 9999px (pill) |
| cards | 16px |
| icon tiles, thumbnails | 12px |

### Shadows

| Name | Value | Token |
|------|-------|-------|
| soft | `rgba(0, 0, 0, 0.08) 0px 4px 16px 0px` | `--shadow-soft` |

Hairline borders do the structural work; the soft shadow exists only under floating slab imagery and overlays.

### Layout

- **Page max-width:** 1280px
- **Section gap:** 64px (96px around hero)
- **Card padding:** 16px
- **Element gap:** 12px

## Components

### Top Navigation Bar
**Role:** Persistent site header

White `#ffffff` background, 80px height, 1px `#eaeaea` bottom border. Left: PSA wordmark in `#ee0403` — the only red in the header. Center-left: nav items at 13px `#212121` with chevrons for dropdowns. Right: primary ink pill CTA and a circular avatar button. Item gap 24–32px.

### Announcement Bar
**Role:** Site-wide notices above or below nav

Ink `#111111` full-width band, white 13px text centered, underlined white link, dismiss × on the right. ~40px height.

### Primary Pill Button
**Role:** Default action (Submit, Continue, Sign In)

Ink `#0f0f0f` fill, white text at 15px / 400, full pill radius, 44px height, 20px horizontal padding. The workhorse action — quiet dark-on-light.

### Key CTA Pill (Red)
**Role:** The one transactional action per view (Buy Now, Place Bid)

PSA Red `#ee0403` fill, white text, otherwise identical to Primary Pill. Maximum one per view — if two reds are visible, one is wrong.

### Ghost Pill Button
**Role:** Secondary action (Learn More, Search, filters)

White fill, 1px `#eaeaea` border, `#48494a` label at 13–15px, full pill radius. Collectors.com variant: label + trailing arrow → with asymmetric padding (16px left, 12px right).

### Hero Search Pill
**Role:** Primary entry point — item discovery

Tint `#f5f5f5` fill, no border, full pill radius, 48px height, magnifier icon left, 16px text, placeholder in `#6c6e6f`. Paired with a white ghost "Search" pill 8px to its right. Focus ring in `#212121`.

### Listing Card
**Role:** Marketplace grid item

White surface, 1px `#eaeaea` border, 16px radius. Slab photographed straight-on, floating centered on a `#fafafa` image field (12px radius) with the soft shadow. Below: item title 16px / 500 in `#212121`, grade chip ("PSA 10" — tint pill, 13px), price right-aligned 16px / 600. Red only appears for a live-auction indicator.

### Icon Feature Tile
**Role:** Benefit/feature rows (Why PSA, data credibility)

Tint `#f5f5f5` 48×48px tile at 12px radius containing a single-weight line icon in `#212121` stroke. Beside or below: 16px / 500 label, 14px `#48494a` caption. No card surface, no border.

### Dark Stage Band
**Role:** Full-bleed promotional section (Vault, eBay integration)

Ink `#111111` full-width background, 96px vertical padding, white heading-xl at 400, white ghost pill CTA (1px white border). At most one per page — the single dark interruption in the white gallery.

### Serif-Accent Display Headline
**Role:** Hero statement

Area Normal 400 at display size in `#212121`, tight 0.82 line height across two stacked lines, with exactly one emotionally-loaded word swapped to Times New Roman Italic at the same size. Centered, on white, with generous 96px+ breathing room.

### Footer
**Role:** Site-wide directory

White background, 1px `#eaeaea` top border. 4–5 columns: 15px / 500 `#212121` column headings, 13px `#48494a` links with 12px row gap. Bottom row: © Collectors Holdings attribution, locale selector, social icons at 20px in `#48494a`.

## Do's and Don'ts

### Do
- Reserve `#ee0403` for the logo, one key CTA per view, text links, and live-auction indicators — it must read as punctuation against monochrome
- Set display headlines at weight 400 and let scale carry hierarchy; swap exactly one word to italic Times New Roman
- Use full pill radius for every button, input, and chip; 16px for cards; 12px for tiles and thumbnails
- Structure with 1px `#eaeaea` hairlines; reserve the single soft shadow for floating slab imagery
- Fill inputs and icon tiles with `#f5f5f5` tint instead of bordering them
- Photograph slabs straight-on, floating on `#fafafa`/`#f5f5f5` fields — the graded slab is the hero object and supplies its own color
- Use weight 600 only for prices and small nav emphasis; 500 for titles; 400 for everything else

### Don't
- Do not use red for error states, discount badges, or price drops — it is the brand mark, not a semantic color; pick a separate error treatment if needed
- Do not import legacy PSA patterns: blue buttons, gradient icons, all-caps section labels, rectangular inputs
- Do not use bold 700 anywhere — the heaviest weight in the system is 600
- Do not mix in collectors.com's warm cream `#f9faf5`; this system commits to pure white with cool grays
- Do not use the serif accent below display size or on more than one word per headline
- Do not stack shadows or add elevation to cards at rest — hairlines define edges
- Do not place two red elements in the same viewport

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Canvas | `#ffffff` | Default page background |
| 1 | Tint Field | `#f5f5f5` / `#fafafa` | Input fills, icon tiles, image backdrops, alternating sections |
| 2 | Card | `#ffffff` + 1px `#eaeaea` | Listing cards, panels — defined by hairline, not elevation |
| 3 | Dark Stage | `#111111` | One full-bleed promotional band per page; announcement bar |

## Imagery

Product photography is the color system: graded slabs shot straight-on, perfectly vertical, floating on quiet tint fields with one soft shadow — gallery conditions borrowed from collectors.com. The PSA cert label (red frame, barcode, grade) supplies inherent brand red inside every product image, which is why the UI itself stays monochrome. Iconography is a single-weight line set in `#212121` stroke, sitting in tint tiles. No illustration, no gradients, no duotones, no lifestyle photography in commerce surfaces.

## Layout

Max-width 1280px centered container, 24px gutters. Hero is centered — the one sanctioned centered composition: display headline, 16px `#48494a` subline, search pill or single CTA, then floating slab imagery in a loose row beneath. All commerce surfaces below are left-aligned on a single grid: filter rail or chip row, then a 4-up listing card grid at 24px gaps. Utility pages (search, item detail) follow the Auction Prices Realized pattern — 40px / 500 page title left-aligned, supporting copy at 16px `#48494a`, search pill below, icon feature tiles in the right column. Sections separated by 64px; one dark stage band per page at most. Footer closes on white.

## Agent Prompt Guide

### Quick Color Reference
- text (primary): #212121 Charcoal
- text (secondary): #48494a Slate
- text (tertiary/placeholder): #6c6e6f Smoke
- background (canvas): #ffffff Paper
- background (tint): #f5f5f5 Tint / #fafafa Fog
- border (default): #eaeaea Hairline
- accent: #ee0403 PSA Red (logo, one key CTA, links, live indicators)
- primary action: #0f0f0f Ink (filled pill)
- dark stage: #111111 (one band per page, announcement bar)

### Example Component Prompts

1. **Listing Card**: White surface, 1px #eaeaea border, 16px radius, 16px padding. #fafafa image field (12px radius) with straight-on slab photo and soft shadow rgba(0,0,0,0.08) 0 4px 16px. Title 16px/500 #212121, "PSA 10" tint pill chip 13px, price 16px/600 right-aligned. 4-up grid, 24px gaps.

2. **Hero Search Pill**: #f5f5f5 fill, no border, full pill radius, 48px height, up to 640px wide. Magnifier icon left in #6c6e6f, placeholder "Search PSA-graded items" 16px #6c6e6f. White ghost "Search" pill (1px #eaeaea, #48494a 15px) docked 8px right.

3. **Serif-Accent Hero**: Centered on white, 96px+ vertical padding. Two stacked lines of Area Normal 400 at 96–128px, line-height 0.82, -0.02em, #212121, with one word in italic Times New Roman at the same size. Below: 16px #48494a subline, then one Key CTA Pill (#ee0403 fill, white 15px text, full pill, 44px height).

4. **Top Navigation Bar**: White, 80px height, 1px #eaeaea bottom border. PSA wordmark in #ee0403 left (only red in header). Nav items 13px #212121 with chevrons, 24–32px gaps. Right: Ink #0f0f0f filled pill "Start Submission" (white 15px text, 44px height) + 40px circular avatar button.

5. **Dark Stage Band**: #111111 full-bleed, 96px vertical padding, max-width 1280px content. White Area Normal 400 at 52px/-0.02em headline, white 16px subtext, white ghost pill (transparent fill, 1px white border, white 15px label) bottom-left.

## Similar Brands

- **StockX** — Same verified-goods marketplace anatomy (search-first hero, grade/condition chips, price-forward cards), though StockX uses green as its market-tick color while PSA stays red-as-punctuation
- **Sotheby's** — Same gallery restraint: monochrome stage, serif accents, objects photographed on quiet fields supplying all the color
- **Apple Store** — Same pure-white commerce canvas with pill controls, hairline structure, and product photography as the sole chromatic element
- **Fanatics Collect** — Same slab-centric card grid and dark promotional bands in the collectibles vertical, though heavier-weighted typographically

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-psa-red: #ee0403;
  --color-ink: #0f0f0f;
  --color-charcoal: #212121;
  --color-slate: #48494a;
  --color-smoke: #6c6e6f;
  --color-hairline: #eaeaea;
  --color-tint: #f5f5f5;
  --color-fog: #fafafa;
  --color-paper: #ffffff;

  /* Typography — Font Families */
  --font-area: 'Area Normal', 'Instrument Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-serif-accent: 'Times New Roman', Times, serif;

  /* Typography — Scale */
  --text-caption: 13px;
  --leading-caption: 1.4;
  --text-ui: 15px;
  --leading-ui: 1.4;
  --text-body: 16px;
  --leading-body: 1.5;
  --text-heading: 24px;
  --leading-heading: 1.3;
  --text-title: 40px;
  --leading-title: 1.2;
  --text-heading-xl: 52px;
  --leading-heading-xl: 1.15;
  --text-display: 128px;
  --leading-display: 0.82;
  --tracking-tight: -0.02em;

  /* Typography — Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-64: 64px;
  --spacing-96: 96px;

  /* Layout */
  --page-max-width: 1280px;
  --section-gap: 64px;
  --card-padding: 16px;
  --element-gap: 12px;

  /* Border Radius */
  --radius-tile: 12px;
  --radius-card: 16px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-soft: rgba(0, 0, 0, 0.08) 0px 4px 16px 0px;

  /* Surfaces */
  --surface-canvas: #ffffff;
  --surface-tint: #f5f5f5;
  --surface-fog: #fafafa;
  --surface-dark-stage: #111111;
}
```

### Tailwind v4

```css
@theme {
  /* Colors */
  --color-psa-red: #ee0403;
  --color-ink: #0f0f0f;
  --color-charcoal: #212121;
  --color-slate: #48494a;
  --color-smoke: #6c6e6f;
  --color-hairline: #eaeaea;
  --color-tint: #f5f5f5;
  --color-fog: #fafafa;
  --color-paper: #ffffff;

  /* Typography */
  --font-area: 'Area Normal', 'Instrument Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-serif-accent: 'Times New Roman', Times, serif;

  --text-caption: 13px;
  --leading-caption: 1.4;
  --text-ui: 15px;
  --leading-ui: 1.4;
  --text-body: 16px;
  --leading-body: 1.5;
  --text-heading: 24px;
  --leading-heading: 1.3;
  --text-title: 40px;
  --leading-title: 1.2;
  --text-heading-xl: 52px;
  --leading-heading-xl: 1.15;
  --text-display: 128px;
  --leading-display: 0.82;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-64: 64px;
  --spacing-96: 96px;

  /* Border Radius */
  --radius-tile: 12px;
  --radius-card: 16px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-soft: rgba(0, 0, 0, 0.08) 0px 4px 16px 0px;
}
```
