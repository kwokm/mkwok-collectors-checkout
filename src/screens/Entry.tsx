import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Tilt } from '../hooks/useTilt';
import { Dot } from '../components/Dot';
import { Slab } from '../components/Slab';
import { PsaLogo } from '../components/PsaLogo';
import { ITEM, POP_REPORT, listing, orderTotals, usd, usdWhole, type Grade } from '../data/order';

/**
 * Checkout entry — the listing condensed to a decision. Top to bottom it
 * answers four questions in order: what is it, is it real (grade · cert ·
 * pop), what is it worth (last sale + APR trend), what will it cost me
 * (ask + all-in estimate). The all-in figure lives here so Review never
 * springs a surprise total.
 */

function Sparkline({ points }: { points: number[] }) {
  const w = 64;
  const h = 20;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  // Inset the x-domain so the endpoint dot (r=2) isn't clipped at the edge.
  const step = (w - 6) / (points.length - 1);
  const xy = points.map((p, i) => [2 + i * step, 2 + (h - 4) * (1 - (p - min) / span)] as const);
  const d = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [ex, ey] = xy[xy.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-5 w-16" aria-hidden="true">
      <path d={d} fill="none" stroke="#b9babc" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx={ex} cy={ey} r="2" fill="#ee0403" />
    </svg>
  );
}

/** Row chevron — the shared "a sheet opens here" affordance. */
function Chevron() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
      <path
        d="m4.5 2.5 3.5 3.5-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Histogram badge — the pop sheet's column chart in miniature: thick,
    tightly spaced, rounded tops, selected grade inked. Same 64px footprint
    as the price-history sparkline so the two rows mirror each other. */
function PopBars({ grade }: { grade: Grade }) {
  const max = Math.max(...POP_REPORT.map((r) => r.count));
  return (
    <span className="flex h-5 w-16 items-end gap-[2px]" aria-hidden="true">
      {POP_REPORT.map((r) => (
        <span
          key={r.label}
          className={`flex-1 rounded-t-[3px] ${r.grade === grade ? 'bg-charcoal' : 'bg-hairline'}`}
          style={{ height: Math.max(3, Math.round((r.count / max) * 20)) }}
        />
      ))}
    </span>
  );
}

/** Slab total height ≈ width × 1.68 (label + card + acrylic padding),
    plus a little room for the floor shadow below. */
const SLAB_RATIO = 1.74;
const SLAB_MAX_W = 188;
const SLAB_MIN_W = 116;

/** The slab is the screen's only elastic element: its width derives from
    the stage height the viewport actually grants (Safari chrome included),
    so the facts, rows, and decision bar always fit above the fold. */
function useSlabWidth(stageRef: React.RefObject<HTMLDivElement | null>) {
  const [w, setW] = useState(SLAB_MAX_W);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      setW(Math.max(SLAB_MIN_W, Math.min(SLAB_MAX_W, Math.floor(h / SLAB_RATIO))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageRef]);
  return w;
}

export function Entry({
  tilt,
  grade,
  onEditGrade,
  onPop,
  onSales,
  onBuy,
}: {
  tilt: Tilt;
  grade: Grade;
  onEditGrade: () => void;
  onPop: () => void;
  onSales: () => void;
  onBuy: () => void;
}) {
  const l = listing(grade);
  const est = orderTotals('standard', grade);
  const stageRef = useRef<HTMLDivElement>(null);
  const slabW = useSlabWidth(stageRef);

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      {/* Top bar — the wordmark, nothing else */}
      <header className="flex h-14 shrink-0 items-center border-b border-hairline px-4">
        <PsaLogo className="h-[18px] w-auto text-ink" />
      </header>

      {/* Stage — the slab supplies all the color. Still here: the listing
          photo, not the object in hand — inspection belongs to the reveal.
          Padding compresses on short viewports before the slab does. */}
      <div
        ref={stageRef}
        className="relative flex flex-1 flex-col items-center justify-center bg-fog px-6 py-[clamp(12px,3.5svh,32px)]"
      >
        <Slab tilt={tilt} grade={grade} width={slabW} active={false} />
      </div>

      {/* Facts — one left edge: identity, then authenticity.
          Vertical padding here and on the rows below compresses gently on
          short viewports (Safari chrome) before the slab gives more. */}
      <div className="border-t border-hairline px-4 pb-[clamp(12px,2.4svh,20px)] pt-[clamp(16px,2.9svh,24px)]">
        <h1 className="text-[24px] font-medium leading-[1.3] tracking-[-0.01em] text-charcoal">
          {ITEM.name}
        </h1>
        <p className="mt-0.5 text-[13px] leading-[1.4] text-smoke">
          {ITEM.year} {ITEM.game}
          <Dot />
          {ITEM.set} {ITEM.number}
          <Dot />
          {ITEM.variant}
        </p>
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <button
            onClick={onEditGrade}
            aria-label={`Grade: PSA ${l.grade} ${l.gradeLabel}. Change grade`}
            className="flex h-8 items-center gap-1.5 rounded-full bg-tint pl-3 pr-2.5 text-[13px] font-medium text-charcoal transition-colors hover:bg-hairline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          >
            {/* one flex item, or the row gap would land inside the label */}
            <span>
              PSA {l.grade}
              <Dot />
              {l.gradeLabel}
            </span>
            <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-smoke" aria-hidden="true">
              <path
                d="m2.5 4.5 3.5 3.5 3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="flex h-8 items-center rounded-full border border-hairline px-3 text-[13px] text-slate">
            Cert #{l.cert}
          </span>
        </div>
      </div>

      {/* Population — the census row: how many of these exist at this
          grade, ever. The chevron promises a sheet, matching the row below */}
      <button
        onClick={onPop}
        className="flex w-full items-center justify-between gap-4 border-t border-hairline px-4 py-[clamp(10px,1.9svh,16px)] text-left transition-colors hover:bg-fog focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-charcoal"
      >
        <span>
          <span className="block text-[13px] leading-[1.4] text-smoke">
            Population
            <Dot />
            PSA {l.grade}
          </span>
          <span className="tnum mt-0.5 block text-[15px] font-medium leading-[1.4] text-charcoal">
            {l.popCount.toLocaleString()} graded
          </span>
        </span>
        <span className="flex items-center gap-3 text-smoke">
          <PopBars grade={grade} />
          <Chevron />
        </span>
      </button>

      {/* Price history — a ledger row, not a badge: APR history behind
          a single quiet line with the trend drawn, not described */}
      <button
        onClick={onSales}
        className="flex w-full items-center justify-between gap-4 border-t border-hairline px-4 py-[clamp(10px,1.9svh,16px)] text-left transition-colors hover:bg-fog focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-charcoal"
      >
        <span>
          <span className="block text-[13px] leading-[1.4] text-smoke">
            Price history
            <Dot />
            PSA {l.grade}
          </span>
          <span className="tnum mt-0.5 block text-[15px] font-medium leading-[1.4] text-charcoal">
            {usdWhole(l.lastSaleCents)}
            <span className="font-normal text-smoke">
              <Dot />
              {l.lastSaleWhen}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-3 text-smoke">
          <Sparkline points={l.trend} />
          <Chevron />
        </span>
      </button>

      {/* Decision bar — ask price plus the honest all-in estimate */}
      {/* Bottom padding = top padding + the home-indicator inset, so the
          visual breathing room reads equal above and below on device */}
      <div className="sticky bottom-0 border-t border-hairline bg-paper/95 px-4 pb-[calc(clamp(10px,1.9svh,16px)+env(safe-area-inset-bottom))] pt-[clamp(10px,1.9svh,16px)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[13px] leading-[1.4] text-smoke">Price</div>
            <div className="tnum text-[24px] font-semibold leading-[1.15] text-charcoal">
              {usdWhole(l.priceCents)}
            </div>
            <div className="tnum mt-0.5 text-[13px] leading-[1.4] text-smoke">
              {usd(est.total)} all-in
              <Dot />
              tax &amp; shipping
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onBuy}
            className="flex h-11 shrink-0 items-center rounded-full bg-psa-red px-7 text-[15px] font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          >
            Buy now
          </motion.button>
        </div>
      </div>
    </div>
  );
}
