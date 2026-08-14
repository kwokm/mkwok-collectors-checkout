import { useState } from 'react';

/**
 * Mobile gate — shown only on devices where the gyro still needs a
 * user-gesture permission grant (iOS; previously-granted devices pass a
 * silent probe in useTilt and never see this). One centered button: tapping
 * it requests motion access inside the gesture. Granted → straight into the
 * entry screen. Cancelled → iOS caches the denial, so re-asking is a dead
 * end; the gate says so and the only path is a fresh browser session.
 */
export function Start({ onStart }: { onStart: () => Promise<boolean> }) {
  const [denied, setDenied] = useState(false);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <div className="relative flex w-full flex-col items-center">
        <button
          disabled={denied}
          onClick={async () => {
            const ok = await onStart();
            if (!ok) setDenied(true);
          }}
          className="flex h-12 items-center rounded-full bg-ink px-8 text-[15px] font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:opacity-40"
        >
          Start demo
        </button>
        <p
          role={denied ? 'alert' : undefined}
          className="absolute inset-x-0 top-full mt-4 text-center text-[13px] leading-[1.4] text-smoke"
        >
          {denied
            ? 'Gyrometer permission cancelled — close browser & reopen to try again'
            : 'Will request motion permissions for tilt-to-inspect'}
        </p>
      </div>
    </div>
  );
}
