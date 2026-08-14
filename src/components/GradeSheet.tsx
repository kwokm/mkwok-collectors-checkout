import { motion } from 'motion/react';
import { Dot } from './Dot';
import { Sheet } from './Sheet';
import { GRADE_LISTINGS, usdWhole, type Grade } from '../data/order';

/**
 * StockX-style grade picker: every PSA grade of this card is its own live
 * listing, so switching grade swaps price, cert, pop and market history in
 * one move. Rows follow the shipping-option pattern from Review — radio dot,
 * hairline border, charcoal ring when active — so the two selection controls
 * in the flow read as one component.
 */
export function GradeSheet({
  grade,
  onSelect,
  onClose,
}: {
  grade: Grade;
  onSelect: (g: Grade) => void;
  onClose: () => void;
}) {
  return (
    <Sheet
      title="Select grade"
      meta="Lowest ask per grade"
      ariaLabel="Select grade"
      onClose={onClose}
    >
      <div role="radiogroup" aria-label="PSA grade" className="mt-3 space-y-2">
        {GRADE_LISTINGS.map((l) => {
          const active = l.grade === grade;
          return (
            <button
              key={l.grade}
              role="radio"
              aria-checked={active}
              onClick={() => {
                onSelect(l.grade);
                onClose();
              }}
              className={`flex min-h-11 w-full items-center gap-3 rounded-[12px] border px-3.5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal ${
                active ? 'border-charcoal bg-fog' : 'border-hairline'
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
                  active ? 'border-charcoal' : 'border-[#cfcfcf]'
                }`}
              >
                <motion.span
                  initial={false}
                  animate={{ scale: active ? 1 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="h-2.5 w-2.5 rounded-full bg-charcoal"
                />
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-medium leading-[1.4] text-charcoal">
                  PSA {l.grade}
                  <Dot />
                  {l.gradeLabel}
                </span>
                <span className="block text-[13px] leading-[1.4] text-smoke">{l.pop}</span>
              </span>
              <span className="text-right">
                <span className="tnum block text-[15px] font-semibold leading-[1.4] text-charcoal">
                  {usdWhole(l.priceCents)}
                </span>
                <span className="tnum block text-[13px] leading-[1.4] text-smoke">
                  Last {usdWhole(l.lastSaleCents)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
