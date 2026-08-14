import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTilt } from './hooks/useTilt';
import { Start } from './screens/Start';
import { Entry } from './screens/Entry';
import { Review } from './screens/Review';
import { Celebration } from './screens/Celebration';
import { ApplePaySheet } from './components/ApplePaySheet';
import { GradeSheet } from './components/GradeSheet';
import { PopSheet } from './components/PopSheet';
import { SalesSheet } from './components/SalesSheet';
import { DEFAULT_GRADE, type Grade, type ShippingId } from './data/order';

/**
 * Flow: entry → review (+ Apple Pay sheet) → celebration.
 *
 * One `useTilt` instance is hoisted here so the iOS motion permission,
 * spring state, and gyro baseline survive across screens — grant tilt on
 * the entry screen and the celebration slab answers immediately.
 */

type Step = 'entry' | 'review' | 'celebration';
type EntrySheet = 'grade' | 'pop' | 'sales' | null;

/**
 * The history stack mirrors the UI stack — one entry per forward step or
 * open sheet — so Safari's edge-swipe and Android's back gesture/button
 * drive in-demo back natively: the gesture, its tracking, and its animation
 * all run on the system compositor, zero JS during the swipe.
 */
interface HistoryState {
  step: Step;
  sheet: EntrySheet;
  paying: boolean;
  idx: number;
}

const historyIdx = () => (window.history.state as HistoryState | null)?.idx ?? 0;

const screenTransition = { type: 'spring', stiffness: 300, damping: 32 } as const;

/**
 * Forward taps slide; gesture-driven back (edge-swipe, hardware/browser
 * back) fades fast — Safari has already played its own page transition,
 * and animating a second time reads as a glitch. In-app back buttons and
 * sheet closes still play the full slide (see `appBack` below).
 */
interface Nav {
  pop: boolean;
  reduced: boolean;
}

const screenVariants = {
  initial: (n: Nav) => (n.pop || n.reduced ? { opacity: 0, x: 0 } : { opacity: 0, x: 56 }),
  animate: (n: Nav) => ({
    opacity: 1,
    x: 0,
    transition: n.pop ? { duration: 0.18 } : screenTransition,
  }),
  exit: (n: Nav) =>
    n.pop || n.reduced
      ? { opacity: 0, x: 0, transition: { duration: 0.12 } }
      : { opacity: 0, x: -32, transition: screenTransition },
};

const celebrationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: (n: Nav) => ({ opacity: 0, transition: { duration: n.pop ? 0.15 : 0.5 } }),
};

export default function App() {
  const [step, setStep] = useState<Step>('entry');
  const [started, setStarted] = useState(false);
  const [paying, setPaying] = useState(false);
  const [sheet, setSheet] = useState<EntrySheet>(null);
  const [grade, setGrade] = useState<Grade>(DEFAULT_GRADE);
  const [shipping, setShipping] = useState<ShippingId>('standard');
  const tilt = useTilt();
  const reduced = useReducedMotion();

  // gestureNav: the last state change arrived via popstate that we did NOT
  // initiate (edge-swipe, hardware/browser back) — suppress the in-app slide.
  // appBack: set just before an in-app history.back()/go() so its popstate
  // still plays the full animation.
  const gestureNav = useRef(false);
  const appBack = useRef(false);

  const apply = useCallback((s: HistoryState | null) => {
    setStep(s?.step ?? 'entry');
    setSheet(s?.sheet ?? null);
    setPaying(s?.paying ?? false);
  }, []);

  useEffect(() => {
    // Root the stack here: a reload mid-demo restarts at entry, so history
    // must too — one back from the root leaves the page, as expected.
    const root: HistoryState = { step: 'entry', sheet: null, paying: false, idx: 0 };
    window.history.replaceState(root, '');
    const onPop = (e: PopStateEvent) => {
      gestureNav.current = !appBack.current;
      appBack.current = false;
      apply(e.state as HistoryState | null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [apply]);

  /** Forward navigation: push a history entry, then show the state. */
  const push = useCallback(
    (next: Omit<HistoryState, 'idx'>) => {
      gestureNav.current = false;
      const s: HistoryState = { ...next, idx: historyIdx() + 1 };
      window.history.pushState(s, '');
      apply(s);
    },
    [apply],
  );

  // Guarded: close fires from scrim, Escape, and drag in quick succession —
  // only step back while an overlay entry is actually on top of the stack.
  const closeOverlay = useCallback(() => {
    const s = window.history.state as HistoryState | null;
    if (s?.sheet || s?.paying) {
      appBack.current = true;
      window.history.back();
    }
  }, []);

  const backToEntry = useCallback(() => {
    if (historyIdx() > 0) {
      appBack.current = true;
      window.history.back();
    }
  }, []);

  const settle = tilt.settle;
  const reset = useCallback(() => {
    setShipping('standard');
    setGrade(DEFAULT_GRADE);
    settle();
    const depth = historyIdx();
    if (depth > 0) {
      appBack.current = true;
      window.history.go(-depth);
    } else {
      gestureNav.current = false;
      apply(null);
    }
  }, [apply, settle]);

  const nav: Nav = { pop: gestureNav.current, reduced: !!reduced };

  return (
    <div className="min-h-dvh bg-tint">
      {/* On desktop the demo presents inside a phone-proportioned frame;
          on an actual phone it is simply the page. */}
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-x-clip bg-paper sm:my-0 sm:border-x sm:border-hairline">
        <AnimatePresence mode="wait" initial={false} custom={nav}>
          {/* Mobile gate — motion permission must come from a user gesture,
              so the demo opens on a single tap that requests it up front */}
          {tilt.mode === 'gyro-locked' && !started && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Start
                onStart={async () => {
                  const ok = await tilt.enableGyro();
                  if (ok) setStarted(true); // denied → the gate explains the way out
                  return ok;
                }}
              />
            </motion.div>
          )}
          {(tilt.mode !== 'gyro-locked' || started) && step === 'entry' && (
            <motion.div
              key="entry"
              variants={screenVariants}
              custom={nav}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Entry
                tilt={tilt}
                grade={grade}
                onEditGrade={() => push({ step: 'entry', sheet: 'grade', paying: false })}
                onPop={() => push({ step: 'entry', sheet: 'pop', paying: false })}
                onSales={() => push({ step: 'entry', sheet: 'sales', paying: false })}
                onBuy={() => push({ step: 'review', sheet: null, paying: false })}
              />
            </motion.div>
          )}
          {step === 'review' && (
            <motion.div
              key="review"
              variants={screenVariants}
              custom={nav}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Review
                grade={grade}
                shipping={shipping}
                onShipping={setShipping}
                onBack={backToEntry}
                onPay={() => push({ step: 'review', sheet: null, paying: true })}
              />
            </motion.div>
          )}
          {step === 'celebration' && (
            <motion.div
              key="celebration"
              variants={celebrationVariants}
              custom={nav}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Celebration tilt={tilt} grade={grade} shipping={shipping} onDone={reset} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence custom={nav}>
          {sheet === 'grade' && (
            <GradeSheet grade={grade} onSelect={setGrade} onClose={closeOverlay} />
          )}
          {sheet === 'pop' && <PopSheet grade={grade} onClose={closeOverlay} />}
          {sheet === 'sales' && <SalesSheet grade={grade} onClose={closeOverlay} />}
        </AnimatePresence>

        <AnimatePresence custom={nav}>
          {paying && (
            <ApplePaySheet
              grade={grade}
              shipping={shipping}
              onCancel={closeOverlay}
              onComplete={() => {
                // Replace the pay-sheet entry rather than pushing, so back
                // from celebration lands on review — no trap, no dead entry.
                gestureNav.current = false;
                const s: HistoryState = {
                  step: 'celebration',
                  sheet: null,
                  paying: false,
                  idx: historyIdx(),
                };
                window.history.replaceState(s, '');
                apply(s);
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Reset — presenter control, parked outside the phone frame on
          tablet and up, only once the flow has left the entry screen */}
      <AnimatePresence>
        {step !== 'entry' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            onClick={reset}
            aria-label="Restart demo"
            title="Restart demo"
            className="fixed top-5 left-[calc(50%+231px)] z-50 hidden h-11 w-11 items-center justify-center rounded-full border border-hairline bg-paper text-slate shadow-soft transition-colors hover:border-smoke hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal md:flex"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
              <path
                d="M4.5 8.5a6 6 0 1 1-.4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M4.2 4.9v3.8H8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
