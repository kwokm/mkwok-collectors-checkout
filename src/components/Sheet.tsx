import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Shared bottom-sheet chrome — scrim, panel, close button, and the
 * title/meta baseline row. Grade, Population, and Sales history all ride
 * this shell so the three sheets read as one component.
 */
export function Sheet({
  title,
  meta,
  ariaLabel,
  onClose,
  children,
}: {
  title: string;
  meta?: ReactNode;
  ariaLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // preventScroll: the panel mounts translated below the viewport; a plain
    // focus() would scroll it into view and jerk the page mid-entrance.
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Exit resolves against the AnimatePresence `custom` at close time: a
  // gesture-driven close (edge-swipe, back button) already played the
  // system transition, so the panel fades instead of sliding down twice.
  const variants = {
    hidden: reduced ? { opacity: 0 } : { y: '100%' },
    visible: reduced ? { opacity: 1 } : { y: 0 },
    exit: (nav?: { pop?: boolean }) =>
      nav?.pop || reduced
        ? { opacity: 0, transition: { duration: 0.15 } }
        : { y: '100%' as const },
  };

  // fixed, not absolute: the screens behind can be taller than the viewport,
  // and an absolute overlay would seat the sheet at the page bottom — below
  // the fold. Width mirrors the App phone frame.
  return (
    <div className="fixed inset-0 z-40 mx-auto flex w-full max-w-[430px] flex-col justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className="relative rounded-t-[16px] bg-paper px-4 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-[0_-8px_40px_rgba(0,0,0,0.18)] focus:outline-none"
      >
        <div className="flex items-center justify-between gap-3 pt-3">
          <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-medium leading-[1.4] text-charcoal">{title}</h2>
            {meta && <span className="text-[13px] leading-[1.4] text-smoke">{meta}</span>}
          </div>
          {/* 44px hit area around a 30px circle, quoting the Apple Pay sheet */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="-my-1.5 -mr-[7px] flex h-11 w-11 shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-charcoal"
          >
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-tint text-slate">
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  d="m4 4 8 8m0-8-8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
