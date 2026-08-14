# PSA Checkout Celebration
### Built for Collectors' design challenge

A mobile-first, hi-fi checkout flow & celebration for a graded-card marketplace.

Special attention was paid to a sleek celebration experience & card data presentation & hierarchy.

#### Motion Highlights
Motion highlights: the slab drops into celebration with weight with a card-tuned "dark aura" that emanates upon landing + star glyphs to represent the night-time associations of Dark pokemon. Your purchased card can be inspected (device gyro on mobile, pointer on desktop) so you can turn
your purchase in your hand before filing it into your collection.  Adding it to your collection has it "shuffe in"

## Run

```sh
npm install
npm run dev
```

Open on a phone (or a narrow viewport) for the intended experience. iOS asks
for motion permission before tilt activates.

## Stack

- Vite · React 19 · TypeScript
- Tailwind CSS 4
- [Motion](https://motion.dev) (`motion/react`) for choreography

## Design system

The visual language is distilled from PSA's newest surfaces (2025 homepage,
Auction Prices Realized) and parent brand collectors.com — a white gallery
where the slab supplies all the color, one red per view, hairlines over
shadows, and a single italic-serif word per display headline. The full token
set and rationale live in [DESIGN.md](DESIGN.md), including the canonical
optical fix for pairing an italic serif word inside a sans headline.

All order data is fictional.

---

Mirrored from a private monorepo; issues and PRs here won't be picked up.
