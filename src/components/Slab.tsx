import { motion, useMotionTemplate, useTransform, type MotionValue } from 'motion/react';
import type { Tilt } from '../hooks/useTilt';
import { CardArt } from './CardArt';
import { PsaLogo } from './PsaLogo';
import { DEFAULT_GRADE, ITEM, listing, type Grade } from '../data/order';

/**
 * The PSA slab — the one object in the flow that carries color and light.
 * Tilt (gyro on device, pointer on desktop) drives four coupled layers:
 * the 3D pivot, the acrylic sheen, the living-cert foil band on the label,
 * and the floor shadow sliding opposite the pivot.
 */

function LabelFoil({
  position,
  opacity,
}: {
  position: ReturnType<typeof useMotionTemplate>;
  opacity: MotionValue<number>;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity,
        backgroundImage:
          'linear-gradient(115deg, transparent 43%, rgba(255,96,96,0.4) 47%, rgba(255,214,102,0.45) 50%, rgba(124,231,157,0.4) 53%, rgba(125,216,255,0.45) 56%, rgba(196,140,255,0.4) 59%, transparent 63%)',
        backgroundSize: '300% 100%',
        backgroundPosition: position,
      }}
    />
  );
}

function SlabLabel({
  width,
  grade,
  foil,
  foilOpacity,
}: {
  width: number;
  grade: Grade;
  foil: ReturnType<typeof useMotionTemplate>;
  foilOpacity?: MotionValue<number>;
}) {
  const f = width / 220;
  const l = listing(grade);
  return (
    <div
      className="relative overflow-hidden bg-white"
      style={{ borderRadius: 5 * f, boxShadow: '0 1px 4px rgba(0,0,0,0.14)' }}
    >
      {/* Red band — the sanctioned red inside the product, per DESIGN.md */}
      <div
        className="flex items-center justify-between bg-[#d21f2c]"
        style={{ height: 21 * f, paddingInline: 9 * f }}
      >
        <PsaLogo className="text-white" style={{ height: 10 * f, width: 'auto' }} />
        <span
          className="tnum font-medium tracking-[0.14em] text-white/90"
          style={{ fontSize: 6.5 * f }}
        >
          CERT #{l.cert}
        </span>
      </div>
      <div
        className="flex items-center justify-between"
        style={{ paddingInline: 9 * f, paddingBlock: 6 * f }}
      >
        <div className="min-w-0">
          <div
            className="truncate font-semibold uppercase leading-tight tracking-wide text-black"
            style={{ fontSize: 8.5 * f }}
          >
            {ITEM.short} · Holo
          </div>
          <div className="truncate leading-tight text-black/55" style={{ fontSize: 6.5 * f }}>
            {ITEM.year} {ITEM.game} {ITEM.set} {ITEM.number}
          </div>
        </div>
        <div className="shrink-0 text-right" style={{ paddingLeft: 8 * f }}>
          <div className="tnum font-semibold leading-none text-black" style={{ fontSize: 21 * f }}>
            {l.grade}
          </div>
          <div
            className="font-medium uppercase tracking-widest text-black/60"
            style={{ fontSize: 5.5 * f }}
          >
            {l.gradeLabel}
          </div>
        </div>
      </div>
      {foilOpacity && <LabelFoil position={foil} opacity={foilOpacity} />}
    </div>
  );
}

export function Slab({
  tilt,
  grade = DEFAULT_GRADE,
  width = 220,
  interactive = true,
  active = true,
  className = '',
}: {
  tilt: Tilt;
  grade?: Grade;
  width?: number;
  /** Pointer tilt responds on this instance. */
  interactive?: boolean;
  /** When false the slab is a still object — no pivot, sheen, or foil. */
  active?: boolean;
  className?: string;
}) {
  const glare = useMotionTemplate`radial-gradient(${Math.round(width * 1.15)}px circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.55), rgba(255,255,255,0) 62%)`;
  const foilX = useTransform(tilt.ry, [-tilt.max, tilt.max], [100, 0]);
  const foil = useMotionTemplate`${foilX}% 50%`;
  // The foil only wakes when the slab moves — at rest the label stays red/white.
  const foilOpacity = useTransform(
    [tilt.rx, tilt.ry],
    ([x, y]) => Math.min(1, (Math.abs(x as number) + Math.abs(y as number)) / (tilt.max * 0.7)),
  );
  const shadowX = useTransform(tilt.ry, (v) => v * -1.6);
  const pad = Math.round(width * 0.045);
  const inner = width - pad * 2;

  return (
    <div className={`relative ${className}`} style={{ width }}>
      {/* Floor shadow — slides opposite the pivot so the light stays put */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 rounded-[50%] bg-black/25 blur-xl"
        style={{
          width: width * 0.82,
          height: width * 0.11,
          bottom: -width * 0.115,
          x: active ? shadowX : 0,
          translateX: '-50%',
        }}
      />
      <motion.div
        style={
          active
            ? { rotateX: tilt.rx, rotateY: tilt.ry, transformPerspective: 900 }
            : undefined
        }
        {...(active && interactive && tilt.mode === 'pointer' ? tilt.pointerProps : {})}
        className="relative"
      >
        {/* Acrylic body */}
        <div
          className="relative overflow-hidden border border-black/[0.08]"
          style={{
            borderRadius: Math.round(width * 0.055),
            padding: pad,
            background: 'linear-gradient(168deg, #ffffff 0%, #f3f4f6 60%, #eceef1 100%)',
            boxShadow:
              'inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.05), inset 1px 0 0 rgba(255,255,255,0.5), 0 18px 44px rgba(0,0,0,0.16)',
          }}
        >
          <SlabLabel
            width={width}
            grade={grade}
            foil={foil}
            foilOpacity={active ? foilOpacity : undefined}
          />
          <div style={{ marginTop: pad }}>
            <CardArt width={inner} />
          </div>
          {/* Sheen — the room light moving across the acrylic */}
          {active && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{ background: glare, borderRadius: Math.round(width * 0.055) }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
