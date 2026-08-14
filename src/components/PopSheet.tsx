import { motion, useReducedMotion } from 'motion/react';
import { Sheet } from './Sheet';
import { POP_REPORT, POP_TOTAL, listing, type Grade } from '../data/order';

const MAX_COUNT = Math.max(...POP_REPORT.map((r) => r.count));
const CHART_H = 112;

/**
 * Population explainer — the census, not the shelf. One sentence of
 * definition, then the distribution as a column chart matching the entry
 * row's mini histogram: four wide, tightly spaced bars, the selected
 * grade carrying all the ink.
 */
export function PopSheet({ grade, onClose }: { grade: Grade; onClose: () => void }) {
  const reduced = useReducedMotion();
  const l = listing(grade);

  return (
    <Sheet title="Population" meta="PSA Pop Report" ariaLabel="Population report" onClose={onClose}>
      <p className="mt-2 text-[13px] leading-[1.4] text-smoke">
        Population is not inventory. PSA has graded {l.popCount.toLocaleString()} copies of this
        card at {l.gradeLabel} {l.grade}, ever. Represents the card&rsquo;s scarcity.
      </p>

      <div className="mt-5 flex items-end gap-1.5">
        {POP_REPORT.map((r, i) => {
          const active = r.grade === grade;
          return (
            <div key={r.label} className="flex-1">
              <div className="flex items-end" style={{ height: CHART_H }}>
                <motion.div
                  initial={reduced ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.12 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`w-full origin-bottom rounded-t-[8px] ${
                    active ? 'bg-charcoal' : 'bg-hairline'
                  }`}
                  style={{ height: Math.max(10, Math.round((r.count / MAX_COUNT) * CHART_H)) }}
                />
              </div>
              <div className="mt-2 text-center">
                <div
                  className={`text-[13px] leading-[1.4] ${
                    active ? 'font-medium text-charcoal' : 'text-smoke'
                  }`}
                >
                  {r.grade ? `PSA ${r.grade}` : '≤ PSA 7'}
                </div>
                <div
                  className={`tnum text-[13px] leading-[1.4] ${
                    active ? 'font-medium text-charcoal' : 'text-smoke'
                  }`}
                >
                  {r.count.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="tnum mt-4 border-t border-hairline pt-3 text-[13px] leading-[1.4] text-smoke">
        {POP_TOTAL.toLocaleString()} copies graded across all grades
      </p>
    </Sheet>
  );
}
