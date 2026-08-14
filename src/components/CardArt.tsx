/**
 * The card inside the slab — a real scan of Umbreon · Neo Discovery #13
 * (600×825, pokemontcg.io). Every dimension derives from `width` so the
 * same art works from a 38px review thumbnail to the celebration hero.
 * 600px source covers the largest render (214 CSS px) at 3× density;
 * WebP q90 keeps the holofoil texture at ~15% of the PNG's weight.
 */

const RATIO = 825 / 600;

export function CardArt({ width, className = '' }: { width: number; className?: string }) {
  return (
    <img
      src="/umbreon-neo2-13.webp"
      alt="Umbreon · 2000 Neo Discovery #13 · Holo"
      draggable={false}
      style={{ width, height: Math.round(width * RATIO) }}
      className={`select-none rounded-[4.5%_/_3.3%] object-cover ${className}`}
    />
  );
}
