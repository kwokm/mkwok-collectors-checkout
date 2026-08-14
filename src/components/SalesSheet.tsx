import { Dot } from './Dot';
import { Sheet } from './Sheet';
import { listing, salesHistory, usdWhole, type Grade } from '../data/order';

/**
 * APR behind the market row — the trend drawn large, then the ledger:
 * every recent sale of this card at this grade, newest first. PSA owns
 * this data; the sheet is where the chevron on the market row lands.
 */
export function SalesSheet({ grade, onClose }: { grade: Grade; onClose: () => void }) {
  const l = listing(grade);
  const sales = salesHistory(grade).slice(0, 8);

  const w = 340;
  const h = 56;
  const points = l.trend;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  // Inset the x-domain so the endpoint dot (r=2.5) isn't clipped at the edge.
  const step = (w - 7) / (points.length - 1);
  const xy = points.map((p, i) => [2.5 + i * step, 4 + (h - 8) * (1 - (p - min) / span)] as const);
  const d = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [ex, ey] = xy[xy.length - 1];

  return (
    <Sheet
      title="Price history"
      meta={
        <>
          Auction Prices Realized
          <Dot />
          PSA {l.grade}
        </>
      }
      ariaLabel="Price history"
      onClose={onClose}
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-14 w-full" aria-hidden="true">
        <path d={d} fill="none" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={ex} cy={ey} r="2.5" fill="#ee0403" />
      </svg>

      <div className="mt-2 max-h-[42dvh] overflow-y-auto">
        {sales.map((s, i) => (
          <div
            key={i}
            className={`flex items-center justify-between gap-4 py-2.5 ${
              i > 0 ? 'border-t border-hairline' : ''
            }`}
          >
            <span className="text-[13px] leading-[1.4] text-charcoal">
              {s.when}
              <span className="text-smoke">
                <Dot />
                {s.venue}
              </span>
            </span>
            <span className="tnum text-[13px] font-medium leading-[1.4] text-charcoal">
              {usdWhole(s.cents)}
            </span>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
