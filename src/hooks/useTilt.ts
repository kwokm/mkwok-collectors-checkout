import { useCallback, useEffect, useRef, useState } from 'react';
import { useMotionValue, useSpring, type MotionValue } from 'motion/react';

/**
 * One tilt source for every slab in the flow.
 *
 * - Desktop / fine pointers: pointer position over the slab drives the tilt.
 * - Android: `deviceorientation` attaches immediately.
 * - iOS: `DeviceOrientationEvent.requestPermission` must be called from a
 *   user gesture in a secure context, so we surface `gyro-locked` until
 *   `enableGyro()` succeeds.
 *
 * The gyro mapping is *inverse*: tilting the phone right pivots the slab
 * left — the slab hangs level in space while the phone moves around it,
 * which is what makes it read as an object instead of a texture.
 *
 * The rest pose is a slowly-following baseline rather than a fixed capture,
 * so posture changes (sitting back, walking) re-center themselves and the
 * slab always answers to *intentional* wrist motion.
 */

export type TiltMode = 'pointer' | 'gyro' | 'gyro-locked';

export interface Tilt {
  rx: MotionValue<number>;
  ry: MotionValue<number>;
  /** Glare / sheen position, percentage coordinates. */
  gx: MotionValue<number>;
  gy: MotionValue<number>;
  max: number;
  mode: TiltMode;
  enableGyro: () => Promise<boolean>;
  settle: () => void;
  pointerProps: {
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerLeave: () => void;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

interface PermissionedOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

const GYRO_RANGE_DEG = 26; // wrist motion mapped onto the full tilt range

/** iOS: gyro needs a user-gesture permission grant before it can attach. */
function needsGyroPermission(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches &&
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (DeviceOrientationEvent as unknown as PermissionedOrientationEvent)
      .requestPermission === 'function'
  );
}

export function useTilt(max = 13): Tilt {
  const rxRaw = useMotionValue(0);
  const ryRaw = useMotionValue(0);
  const gxRaw = useMotionValue(50);
  const gyRaw = useMotionValue(36);
  const rx = useSpring(rxRaw, { stiffness: 180, damping: 24 });
  const ry = useSpring(ryRaw, { stiffness: 180, damping: 24 });
  const gx = useSpring(gxRaw, { stiffness: 150, damping: 26 });
  const gy = useSpring(gyRaw, { stiffness: 150, damping: 26 });

  // Lazy: iOS resolves to gyro-locked on first render, so the Start gate
  // can key off it without a one-frame flash of the entry screen.
  const [mode, setMode] = useState<TiltMode>(() =>
    needsGyroPermission() ? 'gyro-locked' : 'pointer',
  );
  const baseline = useRef<{ beta: number; gamma: number } | null>(null);
  const detach = useRef<(() => void) | null>(null);

  const onOrientation = useCallback(
    (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (!baseline.current) baseline.current = { beta: e.beta, gamma: e.gamma };
      const bl = baseline.current;
      bl.beta += (e.beta - bl.beta) * 0.012;
      bl.gamma += (e.gamma - bl.gamma) * 0.012;
      const db = clamp(e.beta - bl.beta, -GYRO_RANGE_DEG, GYRO_RANGE_DEG) / GYRO_RANGE_DEG;
      const dg = clamp(e.gamma - bl.gamma, -GYRO_RANGE_DEG, GYRO_RANGE_DEG) / GYRO_RANGE_DEG;
      // Inverse pivot: phone right → slab left.
      ryRaw.set(-dg * max);
      rxRaw.set(db * max);
      // Light stays fixed in the room: the sheen sweeps toward the raised edge.
      gxRaw.set(50 + dg * 44);
      gyRaw.set(36 + db * 30);
    },
    [max, rxRaw, ryRaw, gxRaw, gyRaw],
  );

  const attach = useCallback(() => {
    baseline.current = null;
    window.addEventListener('deviceorientation', onOrientation);
    detach.current = () => window.removeEventListener('deviceorientation', onOrientation);
    setMode('gyro');
  }, [onOrientation]);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (!coarse || typeof DeviceOrientationEvent === 'undefined') return;
    // Android attaches immediately; iOS waits in gyro-locked for enableGyro().
    if (!needsGyroPermission()) {
      attach();
    } else {
      // iOS remembers a grant per-site: outside a gesture, requestPermission()
      // resolves 'granted' silently on a returning device but rejects when the
      // site has never asked. Probe once so returning devices skip the gate.
      const request = (DeviceOrientationEvent as unknown as PermissionedOrientationEvent)
        .requestPermission;
      request?.()
        .then((result) => {
          if (result === 'granted') attach();
        })
        .catch(() => {
          // Never asked (gesture required) — stay in gyro-locked for the gate.
        });
    }
    return () => {
      detach.current?.();
      detach.current = null;
    };
  }, [attach]);

  const enableGyro = useCallback(async () => {
    try {
      const request = (DeviceOrientationEvent as unknown as PermissionedOrientationEvent)
        .requestPermission;
      const result = request ? await request() : 'granted';
      if (result === 'granted') {
        attach();
        return true;
      }
    } catch {
      // Denied, or a non-secure context — stay in gyro-locked.
    }
    return false;
  }, [attach]);

  const settle = useCallback(() => {
    rxRaw.set(0);
    ryRaw.set(0);
    gxRaw.set(50);
    gyRaw.set(36);
  }, [rxRaw, ryRaw, gxRaw, gyRaw]);

  const pointerProps = {
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (mode !== 'pointer') return;
      const r = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ryRaw.set(px * 2 * max);
      rxRaw.set(py * -2 * max);
      gxRaw.set((px + 0.5) * 100);
      gyRaw.set((py + 0.5) * 100);
    },
    onPointerLeave: settle,
  };

  return { rx, ry, gx, gy, max, mode, enableGyro, settle, pointerProps };
}
