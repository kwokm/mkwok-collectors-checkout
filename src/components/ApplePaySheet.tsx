import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useChime } from '../hooks/useChime';
import { AppleLogo } from './AppleLogo';
import {
  ACCOUNT,
  ADDRESS,
  MERCHANT,
  PAYMENT,
  orderTotals,
  usd,
  type Grade,
  type ShippingId,
} from '../data/order';

/**
 * Mock Apple Pay sheet, styled after the real iOS payment sheet: dark
 * translucent material over the page, grouped rows with hairline dividers,
 * " Pay" mark top-left, gray ✕ top-right, "Pay Merchant" total, and a
 * side-button confirm (a tap stands in for the physical press). This is a
 * quotation of system UI, so it keeps iOS type and color conventions rather
 * than the PSA palette.
 */

type Stage = 'confirm' | 'processing' | 'done';

const IOS = {
  label: '#98989f', // secondary label on dark
  value: '#ffffff',
};

function SheetRow({
  label,
  value,
  sub,
  accessory,
}: {
  label: string;
  value: string;
  sub?: string;
  accessory?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="w-[76px] shrink-0 text-[13px] leading-[1.4]" style={{ color: IOS.label }}>
        {label}
      </span>
      <span className="min-w-0 flex-1 text-right">
        <span className="block truncate text-[15px] leading-[1.4]" style={{ color: IOS.value }}>
          {value}
        </span>
        {sub && (
          <span
            className="block truncate text-[13px] leading-[1.4]"
            style={{ color: IOS.label }}
          >
            {sub}
          </span>
        )}
      </span>
      {accessory}
    </div>
  );
}

/** Miniature Apple Card — the sheet always shows the physical card artwork. */
function CardThumb() {
  return (
    <span
      aria-hidden="true"
      className="flex h-[26px] w-10 shrink-0 items-center justify-start rounded-[4px] bg-gradient-to-br from-[#fdfdfd] to-[#d9dbe0] pl-1"
    >
      <AppleLogo className="h-2.5 w-2.5 text-black/80" />
    </span>
  );
}

export function ApplePaySheet({
  grade,
  shipping,
  onCancel,
  onComplete,
}: {
  grade: Grade;
  shipping: ShippingId;
  onCancel: () => void;
  onComplete: () => void;
}) {
  const [stage, setStage] = useState<Stage>('confirm');
  const reduced = useReducedMotion();
  const t = orderTotals(shipping, grade);
  // CC0 payment chime (videoeditingsfx.com), trimmed to its 0.8s of signal and
  // re-encoded mono — a recreation, not Apple's own asset.
  const { prime, play } = useChime('/pay-success.mp3');

  useEffect(() => {
    if (stage === 'processing') {
      const id = setTimeout(() => setStage('done'), 1500);
      return () => clearTimeout(id);
    }
    if (stage === 'done') {
      // Lands with the check: 0.1s delay + 0.35s draw against a 0.8s chime.
      play();
      const id = setTimeout(onComplete, 950);
      return () => clearTimeout(id);
    }
  }, [stage, onComplete, play]);

  // fixed, not absolute: the screens behind can be taller than the viewport,
  // and an absolute overlay would seat the sheet at the page bottom — below
  // the fold. Width mirrors the App phone frame.
  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-[430px] flex-col justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={stage === 'confirm' ? onCancel : undefined}
        className="absolute inset-0 bg-black/45"
      />
      <motion.div
        variants={{
          hidden: reduced ? { opacity: 0 } : { y: '100%' },
          visible: reduced ? { opacity: 1 } : { y: 0 },
          // Gesture-driven close (edge-swipe, back button): the system
          // already animated, so fade instead of sliding down a second time.
          exit: (nav?: { pop?: boolean }) =>
            nav?.pop || reduced
              ? { opacity: 0, transition: { duration: 0.15 } }
              : { y: '100%' as const },
        }}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        role="dialog"
        aria-label="Apple Pay"
        className="relative rounded-t-[18px] pb-[calc(20px+env(safe-area-inset-bottom))] shadow-[0_-12px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl backdrop-saturate-150"
        style={{ backgroundColor: 'rgba(28,28,30,0.94)' }}
      >
        {/* Header — logo optically centered, ✕ on the right */}
        <div className="relative flex h-14 items-center justify-center">
          <span className="flex items-center gap-0.5 text-white">
            <AppleLogo className="h-[17px] w-[17px]" />
            <span className="text-[17px] font-medium tracking-tight">Pay</span>
          </span>
          <button
            onClick={onCancel}
            disabled={stage !== 'confirm'}
            aria-label="Cancel payment"
            className="absolute right-4 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/10 disabled:opacity-40"
            style={{ color: IOS.label }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path
                d="m4 4 8 8m0-8-8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-4">
          <div className="divide-y divide-white/10">
            <SheetRow
              label="Card"
              value={PAYMENT.label}
              sub={`···· ${PAYMENT.last4}`}
              accessory={<CardThumb />}
            />
            <SheetRow label="Ship to" value={ADDRESS.line1} sub={ADDRESS.line2} />
            <SheetRow label="Contact" value={ACCOUNT} />
            <div className="flex items-center justify-between gap-4 py-3.5">
              <span className="text-[13px] leading-[1.4]" style={{ color: IOS.label }}>
                Pay {MERCHANT}
              </span>
              <span className="tnum text-[17px] font-semibold text-white">{usd(t.total)}</span>
            </div>
          </div>
        </div>

        {/* Confirm zone — swaps between button, spinner, and check */}
        <div className="flex h-24 items-center justify-center px-4">
          <AnimatePresence mode="wait" initial={false}>
            {stage === 'confirm' && (
              <motion.button
                key="confirm"
                exit={{ opacity: 0, scale: 0.96 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  prime();
                  setStage('processing');
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-white text-[15px] font-medium text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                  <rect
                    x="6.5"
                    y="2.5"
                    width="7"
                    height="15"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M15.5 6.5v4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                Confirm
              </motion.button>
            )}
            {stage === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 text-[15px]"
                style={{ color: IOS.label }}
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                  className="h-5 w-5 rounded-full border-[1.5px] border-white/20 border-t-white"
                />
                Processing…
              </motion.div>
            )}
            {stage === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="flex items-center gap-2.5 text-[15px] font-medium text-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                    <motion.path
                      d="m3.5 8.5 3 3 6-6.5"
                      stroke="#000"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
                    />
                  </svg>
                </span>
                Done
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
