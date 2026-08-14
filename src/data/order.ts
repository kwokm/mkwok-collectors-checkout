/**
 * Single source of truth for the demo order. Every dollar figure on every
 * screen — entry price, review breakdown, Apple Pay total, celebration
 * receipt line — derives from these values; nothing is restated by hand.
 *
 * The card is one object; what's for sale is a *graded listing* of it.
 * Grade selection (StockX-style) swaps the listing: price, cert, pop and
 * market history all follow the grade.
 */

export const ITEM = {
  name: 'Umbreon – Neo Discovery Holo',
  /** For tight surfaces: the slab label and the filed confirmation. */
  short: 'Umbreon',
  set: 'Neo Discovery',
  number: '#13',
  variant: '1st Edition',
  year: '2000',
  game: 'Pokémon',
} as const;

export interface GradeListing {
  grade: number;
  gradeLabel: string;
  priceCents: number;
  cert: string;
  pop: string;
  popCount: number;
  lastSaleCents: number;
  lastSaleWhen: string;
  /** Recent APR sales, oldest → newest, for the sparkline. */
  trend: number[];
  /** Sale dates aligned 1:1 with `trend`, oldest → newest. */
  saleDates: string[];
}

export const GRADE_LISTINGS: GradeListing[] = [
  {
    grade: 10,
    gradeLabel: 'Gem Mint',
    priceCents: 175000,
    cert: '82441907',
    pop: 'Pop 104',
    popCount: 104,
    lastSaleCents: 182000,
    lastSaleWhen: 'Aug 2',
    trend: [1490, 1545, 1520, 1610, 1585, 1660, 1705, 1680, 1755, 1820],
    saleDates: ['May 31', 'Jun 7', 'Jun 14', 'Jun 21', 'Jun 28', 'Jul 5', 'Jul 12', 'Jul 19', 'Jul 26', 'Aug 2'],
  },
  {
    grade: 9,
    gradeLabel: 'Mint',
    priceCents: 58500,
    cert: '76209934',
    pop: 'Pop 620',
    popCount: 620,
    lastSaleCents: 56200,
    lastSaleWhen: 'Aug 9',
    trend: [518, 530, 512, 545, 538, 560, 549, 571, 566, 562],
    saleDates: ['Jun 7', 'Jun 14', 'Jun 21', 'Jun 28', 'Jul 5', 'Jul 12', 'Jul 19', 'Jul 26', 'Aug 2', 'Aug 9'],
  },
  {
    grade: 8,
    gradeLabel: 'NM-Mint',
    priceCents: 29800,
    cert: '71548210',
    pop: 'Pop 426',
    popCount: 426,
    lastSaleCents: 30500,
    lastSaleWhen: 'Jul 28',
    trend: [268, 275, 262, 281, 279, 290, 286, 298, 301, 305],
    saleDates: ['May 26', 'Jun 2', 'Jun 9', 'Jun 16', 'Jun 23', 'Jun 30', 'Jul 7', 'Jul 14', 'Jul 21', 'Jul 28'],
  },
];

/**
 * PSA population report for this card — a census of every copy ever
 * graded, not marketplace inventory. Counts are per grade; the remainder
 * below PSA 8 is grouped.
 */
export const POP_TOTAL = 1877;

export const POP_REPORT: { grade: number | null; label: string; count: number }[] = [
  { grade: 10, label: 'PSA 10', count: 104 },
  { grade: 9, label: 'PSA 9', count: 620 },
  { grade: 8, label: 'PSA 8', count: 426 },
  { grade: null, label: 'PSA 7 & under', count: 727 },
];

const SALE_VENUES = ['eBay', 'Goldin', 'PSA Auctions', 'Fanatics Collect'] as const;

/** APR ledger for the sales sheet — newest first, derived from `trend`. */
export function salesHistory(grade: Grade) {
  const l = listing(grade);
  return l.trend
    .map((dollars, i) => ({
      when: l.saleDates[i],
      venue: SALE_VENUES[i % SALE_VENUES.length],
      cents: dollars * 100,
    }))
    .reverse();
}

export type Grade = (typeof GRADE_LISTINGS)[number]['grade'];

export const DEFAULT_GRADE: Grade = 10;

export function listing(grade: Grade): GradeListing {
  return GRADE_LISTINGS.find((l) => l.grade === grade) ?? GRADE_LISTINGS[0];
}

// Fictional demo data — this repo mirrors to a public repo, so no real
// address or account ever ships here.
export const ADDRESS = {
  name: 'Michael Kwok',
  line1: '400 Broad St, Apt 6C',
  line2: 'Seattle, WA 98109',
} as const;

export const ACCOUNT = 'm.kwok@example.com';

export const ORDER_NO = 'PSA-2608-4417';

export const MERCHANT = 'PSA Marketplace';

export const PAYMENT = { label: 'Apple Card', last4: '4021' } as const;

export const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard', eta: 'Aug 20 – 22', cents: 1200 },
  { id: 'express', label: 'Express', eta: 'Tue, Aug 18', cents: 2900 },
] as const;

export type ShippingId = (typeof SHIPPING_OPTIONS)[number]['id'];

const PROCESSING_RATE = 0.029;
const TAX_RATE = 0.086; // WA combined rate, close enough for a demo

export function orderTotals(shippingId: ShippingId, grade: Grade = DEFAULT_GRADE) {
  const shipping = SHIPPING_OPTIONS.find((s) => s.id === shippingId) ?? SHIPPING_OPTIONS[0];
  const item = listing(grade).priceCents;
  const processing = Math.round(item * PROCESSING_RATE);
  const tax = Math.round((item + shipping.cents) * TAX_RATE);
  return {
    item,
    shipping: shipping.cents,
    processing,
    tax,
    total: item + shipping.cents + processing + tax,
  };
}

export const usd = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export const usdWhole = (cents: number) =>
  (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
