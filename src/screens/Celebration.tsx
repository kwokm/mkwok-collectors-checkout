import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';
import type { Tilt } from '../hooks/useTilt';
import { Dot } from '../components/Dot';
import { Slab } from '../components/Slab';
import {
  ITEM,
  ORDER_NO,
  SHIPPING_OPTIONS,
  orderTotals,
  usd,
  type Grade,
  type ShippingId,
} from '../data/order';

/**
 * The celebration — the moment the marketplace hands the object over.
 *
 * Three beats:
 *   1. reveal  — the slab falls into gallery light, Hearthstone-style:
 *                already falling as it fades in, an accelerating drop, and
 *                a contact frame that kicks dust, gold ring pulses
 *                (Umbreon's rings), and a dark cloud off the card itself
 *   2. admire  — tilt is live; the buyer turns their purchase in their hand
 *   3. file    — the slab flies into the Collection dock, the count ticks up
 *
 * Restraint is the celebration: weight and light, not confetti.
 */

type Phase = 'reveal' | 'admire' | 'filing' | 'filed';

const SLAB_W = 236;

/**
 * Hearthstone landing timing: the slab is already falling as it fades in
 * (no separate hang) — a cubic-in fall so it gains weight on the way down,
 * contact at ~78% of the timeline, then a settle window. The squash, dust,
 * dim, and shake all key off IMPACT_MS.
 */
const DROP_DELAY = 0.1;
const DROP_DURATION = 0.95;
const CONTACT = 0.78; // fraction of the timeline at which the slab lands
const FALL_EASE: [number, number, number, number] = [0.55, 0.02, 0.97, 0.4];
const IMPACT_MS = Math.round((DROP_DELAY + DROP_DURATION * CONTACT) * 1000);

/* Stable keyframe objects — module-level so re-renders never restart them. */
const DROP = {
  opacity: [0, 1],
  y: [-170, 0, 0],
  scale: [1.07, 1, 1],
  rotate: [-2, 0, 0],
  x: 0,
};
const FALL: Transition = {
  delay: DROP_DELAY,
  duration: DROP_DURATION,
  times: [0, CONTACT, 1],
  ease: [FALL_EASE, 'linear'],
};
const DROP_TRANSITION: Transition = {
  y: FALL,
  scale: FALL,
  rotate: FALL,
  // The fade resolves mid-fall — the slab materializes while already moving.
  opacity: { delay: DROP_DELAY, duration: DROP_DURATION * 0.38, ease: 'linear' },
};
const SQUASH = { scaleX: [1, 1.045, 0.99, 1], scaleY: [1, 0.94, 1.02, 1] };
const SHAKE = { y: [0, 4, -2, 0] };

/**
 * Dark cloud — the darkness that flies out of a dark-type on impact.
 * Soft dusk-navy billows emitted from the slab's base, pushed outward and
 * up, dissipating fast. Deterministic pseudo-random, like DUST.
 */
const CLOUD = Array.from({ length: 12 }, (_, i) => {
  const r = ((i * 67) % 100) / 100;
  const dir = i % 2 === 0 ? 1 : -1;
  return {
    dx: dir * (52 + r * 118),
    dy: -(10 + r * 54),
    size: 56 + r * 64,
    delay: r * 0.07,
    duration: 0.75 + r * 0.4,
    peak: 0.55 - r * 0.25,
  };
});

/** Ground dust — kicked out along the floor plane at the contact frame. */
const DUST = Array.from({ length: 16 }, (_, i) => {
  const r = ((i * 89) % 100) / 100; // deterministic pseudo-random
  const dir = i % 2 === 0 ? 1 : -1;
  return {
    dx: dir * (26 + r * 100),
    dy: -(4 + r * 18),
    size: 2.5 + (i % 3) * 1.5,
    delay: r * 0.07,
    duration: 0.55 + r * 0.3,
    color: [
      'rgba(122,106,155,0.85)', // dusk violet
      'rgba(158,149,180,0.8)', // moonlit silver
      'rgba(198,162,76,0.85)', // a fleck of ring gold
    ][i % 3],
  };
});

/** Impact response at the slab's base: dust puff + two gold ring pulses. */
function ImpactFX({ width }: { width: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
      {/* Dark cloud — billows out from behind the slab on contact */}
      {CLOUD.map((c, i) => (
        <motion.span
          key={`c${i}`}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{ x: c.dx, y: c.dy, opacity: [0, c.peak, 0], scale: 1.8 }}
          transition={{ delay: c.delay, duration: c.duration, ease: 'easeOut' }}
          className="absolute left-1/2 rounded-[50%]"
          style={{
            // Squashed into the ground plane and seated at the slab's bottom
            // edge, so the mist escapes sideways from behind the card.
            bottom: -c.size * 0.16,
            marginLeft: -c.size * 0.75,
            width: c.size * 1.5,
            height: c.size * 0.72,
            zIndex: -1,
            background:
              'radial-gradient(ellipse, rgba(28,24,52,0.85) 0%, rgba(28,24,52,0.35) 55%, rgba(28,24,52,0) 75%)',
            filter: 'blur(7px)',
          }}
        />
      ))}
      {/* Gold ring pulses — Umbreon's rings, rippling out along the floor */}
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5 - i * 0.15, scale: 0.25 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ delay: i * 0.12, duration: 0.7 + i * 0.15, ease: 'easeOut' }}
          className="absolute left-1/2 rounded-[50%] border"
          style={{
            width: width * 1.5,
            height: width * 0.32,
            bottom: -width * 0.14,
            translateX: '-50%',
            borderColor: 'rgba(198,158,52,0.6)',
            borderWidth: 1.5,
          }}
        />
      ))}
      {/* Dust — squashed into the ground plane, fast out, hard decel */}
      {DUST.map((d, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 0, scale: 1 }}
          animate={{ x: d.dx, y: d.dy, opacity: [0, 0.9, 0], scale: 0.3 }}
          transition={{ delay: d.delay, duration: d.duration, ease: 'easeOut' }}
          className="absolute left-1/2 rounded-full"
          style={{ bottom: -4, width: d.size, height: d.size, background: d.color }}
        />
      ))}
    </div>
  );
}

/**
 * Gold star-sparks drifting up through the reveal — holo glint and night
 * sky in one shape. Four-point sparkles, not confetti: one hue family
 * (Umbreon's ring gold), sized to be read, twinkling as they rise.
 */
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const t = (i * 137.5) % 100; // golden-angle spread
  return {
    left: 6 + t * 0.88,
    delay: 1.0 + (i % 5) * 0.24,
    duration: 2.4 + (i % 3) * 0.7,
    size: 9 + (i % 4) * 3,
    rotate: ((i * 53) % 40) - 20,
    color: ['#FFD34D', '#F5B301', '#FFC83D'][i % 3],
  };
});

/** Four-point sparkle — concave edges so it reads as a glint, not a badge. */
function Spark({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden="true">
      <path
        d="M6 0 C6.55 3.6 8.4 5.45 12 6 C8.4 6.55 6.55 8.4 6 12 C5.45 8.4 3.6 6.55 0 6 C3.6 5.45 5.45 3.6 6 0 Z"
        fill={color}
      />
    </svg>
  );
}

export function Celebration({
  tilt,
  grade,
  shipping,
  onDone,
}: {
  tilt: Tilt;
  grade: Grade;
  shipping: ShippingId;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('reveal');
  const [impacted, setImpacted] = useState(false);
  const [flight, setFlight] = useState<{ x: number; y: number } | null>(null);
  const [count, setCount] = useState(127);
  const slabRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const t = orderTotals(shipping, grade);
  const eta = (SHIPPING_OPTIONS.find((s) => s.id === shipping) ?? SHIPPING_OPTIONS[0]).eta;

  useEffect(() => {
    const admire = setTimeout(() => setPhase('admire'), reduced ? 400 : 1900);
    const impact = reduced ? undefined : setTimeout(() => setImpacted(true), IMPACT_MS);
    return () => {
      clearTimeout(admire);
      if (impact) clearTimeout(impact);
    };
  }, [reduced]);

  const file = useCallback(() => {
    const slab = slabRef.current?.getBoundingClientRect();
    const dock = dockRef.current?.getBoundingClientRect();
    if (slab && dock) {
      setFlight({
        x: dock.left + dock.width / 2 - (slab.left + slab.width / 2),
        y: dock.top + dock.height / 2 - (slab.top + slab.height / 2),
      });
    }
    tilt.settle();
    setPhase('filing');
  }, [tilt]);

  const landed = useCallback(() => {
    setCount((c) => c + 1);
    setPhase('filed');
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-paper">
      {/* Gallery light — a quiet radial pool behind the slab */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'filed' ? 0.5 : 1 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 55% at 50% 38%, #ffffff 0%, #fafafa 55%, #f2f2f3 100%)',
        }}
      />

      {/* Gold star-sparks — holo glint and night sky, rising through the reveal */}
      {!reduced && phase !== 'filed' && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
          {SPARKS.map((s, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, rotate: s.rotate }}
              animate={{ opacity: [0, 1, 0], y: -220, rotate: s.rotate + 30 }}
              transition={{ delay: s.delay, duration: s.duration, ease: 'easeOut' }}
              className="absolute"
              style={{ left: `${s.left}%`, top: '68%' }}
            >
              <Spark size={s.size} color={s.color} />
            </motion.span>
          ))}
        </div>
      )}

      {/* Headline */}
      <div className="relative z-10 px-6 pt-[max(72px,env(safe-area-inset-top))] text-center">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 1.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-[38px] font-normal leading-[1.05] tracking-[-0.02em] text-charcoal"
        >
          {/* Serif scaled 1.177em so round-glyph ink tops match — Instrument
              Sans "e" (0.520em incl. overshoot) ÷ italic Times "o" (0.442em).
              The "yours." bowls sit level with the sans lowercase; both share
              the inline baseline. Line-height compensates so the line box
              doesn't grow. Re-derive if either face changes; see DESIGN.md. */}
          Certifiably{' '}
          <span className="font-serif-accent text-[1.177em] italic leading-[0.87]">yours.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'reveal' ? 0 : 1 }}
          transition={{ duration: 0.6 }}
          className="tnum mx-auto mt-2 text-[13px] leading-[1.4] text-smoke"
        >
          Order {ORDER_NO}
          <Dot />
          {usd(t.total)}
          <Dot />
          {eta}
        </motion.p>
      </div>

      {/* Stage — the whole room takes the hit: a 4px camera shake on contact */}
      <motion.div
        className="relative z-10 flex flex-1 items-center justify-center"
        animate={!reduced && impacted ? SHAKE : { y: 0 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
      >
        <motion.div
          ref={slabRef}
          // relative: ImpactFX anchors to the slab's own box. Without it the
          // wrapper is only a containing block while mid-transform — once the
          // landing settles the clouds would re-anchor to the stage and
          // detach from the card base on taller viewports.
          className="relative"
          initial={
            reduced
              ? { opacity: 0 }
              : { opacity: 0, y: -170, scale: 1.07, rotate: -2 }
          }
          animate={
            phase === 'filing'
              ? { x: flight?.x ?? 0, y: flight?.y ?? 320, scale: 0.09, rotate: 8, opacity: 1 }
              : phase === 'filed'
                ? { x: flight?.x ?? 0, y: flight?.y ?? 320, scale: 0.06, rotate: 8, opacity: 0 }
                : phase === 'reveal' && !reduced
                  ? DROP
                  : { opacity: 1, y: 0, scale: 1, rotate: 0, x: 0 }
          }
          transition={
            phase === 'filing'
              ? { type: 'spring', stiffness: 130, damping: 21, mass: 0.9 }
              : phase === 'filed'
                ? { duration: 0.3, ease: 'easeIn' }
                : phase === 'reveal' && !reduced
                  ? DROP_TRANSITION
                  : { duration: 0.4 }
          }
          onAnimationComplete={() => {
            if (phase === 'filing') landed();
          }}
        >
          {/* Contact squash — weight expressed at the base, not the center */}
          <motion.div
            initial={false}
            animate={!reduced && impacted ? SQUASH : { scaleX: 1, scaleY: 1 }}
            transition={{ duration: 0.34, times: [0, 0.35, 0.7, 1], ease: 'easeOut' }}
            style={{ transformOrigin: '50% 100%' }}
          >
            <Slab tilt={tilt} grade={grade} width={SLAB_W} interactive={phase === 'admire'} />
          </motion.div>
          {!reduced && impacted && (phase === 'reveal' || phase === 'admire') && (
            <ImpactFX width={SLAB_W} />
          )}
        </motion.div>

        {/* Post-file confirmation, where the slab used to be */}
        <AnimatePresence>
          {phase === 'filed' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="absolute inset-x-0 text-center"
            >
              <p className="text-[15px] font-medium leading-[1.4] text-charcoal">
                {ITEM.short} – {ITEM.set} is in your collection.
              </p>
              <p className="mt-1 text-[13px] leading-[1.4] text-smoke">
                We&rsquo;ll notify you when it ships from the Vault.
              </p>
              <button
                onClick={onDone}
                className="mt-6 inline-flex h-11 items-center rounded-full border border-hairline bg-paper px-6 text-[15px] text-slate transition-colors hover:border-smoke focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
              >
                Reset demo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom rail — hint, then CTA, then dock */}
      <div className="relative z-10 px-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
        {/* Kept mounted so the stage height — and the slab's flight target —
            never shifts; visibility is opacity + inert. */}
        <motion.div
          initial={false}
          animate={{ opacity: phase === 'admire' ? 1 : 0, y: phase === 'admire' ? 0 : 10 }}
          transition={{ duration: 0.45 }}
          inert={phase !== 'admire'}
          className="mb-3 flex flex-col items-center gap-3"
        >
          {/* Gyro devices only — a nudge, not a control; tilt is already live */}
          {tilt.mode === 'gyro' && (
            <span className="flex h-9 items-center rounded-full border border-hairline bg-paper/85 px-4 text-[13px] leading-[1.4] text-slate backdrop-blur">
              Try tilting ✨
            </span>
          )}
          <button
            onClick={file}
            className="flex h-12 w-full max-w-sm items-center justify-center rounded-full bg-ink text-[15px] font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          >
            Add to collection
          </button>
        </motion.div>

        {/* Collection dock — the destination */}
        <div className="flex justify-end">
          <motion.div
            ref={dockRef}
            animate={
              phase === 'filed'
                ? { scale: [1, 1.12, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex h-11 items-center gap-2 rounded-full border border-hairline bg-paper px-4 shadow-soft"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-[17px] w-[17px]" aria-hidden="true">
              <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="#212121" strokeWidth="1.4" />
              <path d="M3 8.5h14" stroke="#212121" strokeWidth="1.4" />
              <path d="M8 12h4" stroke="#212121" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="text-[13px] font-medium text-charcoal">Collection</span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={count}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className="tnum text-[13px] text-smoke"
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
